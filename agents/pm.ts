/**
 * Agent 1: PM (총괄 기획자 / 오케스트레이터)
 * 설계서 기준 실행 순서:
 *   Art Director → Script Writer → 병렬(Styling Shots + Copy Writer) → Layer Image
 *   → Icon Mapper → HTML Builder → QA → Validator → Playwright 캡처
 */

import { saveJson, ensureOutputDirs, timer, anthropicClient, parseJsonResponse, MODELS } from './utils'
import { runScriptWriter } from './script-writer'
import { runArtDirector } from './art-director'
import { runStylingShots } from './styling-shots'
import { runLayerImage } from './layer-image'
import { runCopyWriter } from './copy-writer'
import { runQA } from './qa'
import { runValidator } from './validator'
import { runIconMapper } from './icon-mapper'
import { runHtmlBuilder } from './html-builder'
import { runExporter } from './exporter'
import { getTemplateById } from './templates/index'
import type { ProjectInput, ProjectBrief, StyleGuide, StylingPromptsJson, Script, RefinedCopy, AgentResult } from './types'
import type { IconMappingJson } from './icon-mapper'
import * as crypto from 'crypto'
import * as fs from 'fs'
import * as path from 'path'

// 레퍼런스 수집은 design-researcher.ts의 collectReferences()로 이관됨.
// PM은 호출만 — 파일 시스템 접근 없음.

const MAX_RETRY = 3

/**
 * v6 (2026-05 클라이언트 회의 결정): Gemini 자동 이미지 생성 폐기.
 * - styling shots / layer image 배경을 API로 생성하지 않음 (비용 절감 + 디자이너 워크플로 정합)
 * - 운영자가 외부 모델(Gemini/GPT 웹 UI)로 직접 추출 후 합성
 * - 배경은 html-builder가 CSS(layoutPatterns.backgroundStyle)로 렌더링
 * - SKIP_IMAGE_GENERATION=false 환경변수로 레거시 자동 생성 복원 가능
 */
const SKIP_IMAGE_GENERATION = process.env.SKIP_IMAGE_GENERATION !== 'false'

export function buildProjectBrief(input: ProjectInput, projectId: string): ProjectBrief {
  return {
    projectId,
    productName: input.productName,
    category: input.category,
    platform: input.platform,
    targetAudience: input.targetAudience,
    keyHighlights: input.productHighlights.split('\n').filter(Boolean),
    brandColors: input.brandColors ?? [],
    styleDirection: input.styleDirections?.join(', ') ?? '감성 편집형',
    toneKeywords: input.toneKeywords ?? [],
    requiredContent: {
      phrases: input.requiredPhrases ?? [],
      images: input.requiredImagePaths ?? [],
      certifications: input.certificationImagePaths?.map((p) => path.basename(p)) ?? [],
    },
    restrictions: {
      styles: input.forbiddenStyles ?? [],
      colors: input.forbiddenColors ?? [],
      words: input.forbiddenWords ?? [],
    },
    generatedAt: new Date().toISOString(),
  }
}

export interface PipelineResult {
  projectId: string
  success: boolean
  outputDir: string
  htmlPath?: string
  exportDir?: string
  stages: Record<string, { success: boolean; durationMs?: number; error?: string }>
  retryCount: number
  totalDurationMs: number
}

type FailingAgent = 'scriptWriter' | 'copyWriter' | 'artDirector' | 'imageRegenerate' | 'failFast'

interface AdvisorIssue { severity: string; type: string; description?: string; location?: string }

// QA FAIL 원인 분석 — 룰 기반 (1차)
function identifyFailingAgent(issues: AdvisorIssue[]): FailingAgent {
  const criticals = issues.filter((i) => i.severity === 'CRITICAL')
  const scriptIssues = criticals.filter(
    (i) => i.type === 'required_content' || i.type === 'legal'
  )
  return scriptIssues.length > 0 ? 'scriptWriter' : 'copyWriter'
}

const VALID_FAILING_AGENTS: ReadonlySet<FailingAgent> = new Set([
  'scriptWriter', 'copyWriter', 'artDirector', 'imageRegenerate', 'failFast',
])

function isValidFailingAgent(v: unknown): v is FailingAgent {
  return typeof v === 'string' && VALID_FAILING_AGENTS.has(v as FailingAgent)
}

/**
 * PM Advisor — 룰이 애매하거나 재시도 누적된 케이스에서 Claude Haiku에게 분류 위임.
 * 출력: FailingAgent + 간단한 이유. 비용 ~$0.005/호출. 출력 검증 + invalid → failFast.
 */
async function pmAdvisor(
  issues: AdvisorIssue[],
  context: { attempt: number; previousAgent?: FailingAgent; phase: string; brief?: ProjectBrief }
): Promise<{ agent: FailingAgent; reason: string }> {
  try {
    const briefContext = context.brief ? `Product category: ${context.brief.category}
Platform: ${context.brief.platform}
Style direction: ${context.brief.styleDirection}
Forbidden words: ${context.brief.restrictions.words.join(', ') || 'none'}
Required phrases: ${context.brief.requiredContent.phrases.join(', ') || 'none'}` : ''

    const response = await anthropicClient.messages.create({
      model: MODELS.CLAUDE_HAIKU,
      max_tokens: 256,
      system: `You are a pipeline failure router for a Korean e-commerce detail page generator.
Categorize each failure to the most likely owner agent:
- scriptWriter: missing required phrases, wrong section structure, legal/compliance text
- copyWriter: tone mismatch, weak headlines, sanitization edge cases
- artDirector: design system inconsistency, layoutPattern mismatch, sectionImageBriefs invalid
- imageRegenerate: visual issues (text baked in image, ingredient leak, broken layer assets)
- failFast: unrecoverable (multiple agents failed, budget exceeded, API down)

Output JSON only: { "agent": "...", "reason": "<one sentence>" }
The agent value MUST be exactly one of: scriptWriter, copyWriter, artDirector, imageRegenerate, failFast`,
      messages: [{
        role: 'user',
        content: `Phase: ${context.phase}
Retry attempt: ${context.attempt}
${context.previousAgent ? `Previous retry agent: ${context.previousAgent}` : ''}
${briefContext}

Issues:
${issues.map((i, n) => `${n + 1}. [${i.severity}/${i.type}] ${i.description ?? ''} ${i.location ? `@${i.location}` : ''}`).join('\n')}

Which agent should re-run? Output JSON only.`
      }],
    })
    const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
    const parsed = parseJsonResponse<{ agent: unknown; reason?: string }>(text)
    if (!isValidFailingAgent(parsed.agent)) {
      console.warn(`[PM Advisor] invalid agent value "${parsed.agent}" — failFast로 처리`)
      return { agent: 'failFast', reason: `advisor returned invalid agent: ${String(parsed.agent)}` }
    }
    return { agent: parsed.agent, reason: parsed.reason ?? 'advisor decision' }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.warn(`[PM Advisor] 호출 실패 — 룰 기반 fallback (${msg.substring(0, 80)})`)
    return { agent: identifyFailingAgent(issues), reason: 'advisor failed, rule-based fallback' }
  }
}

/**
 * 하이브리드 라우터 — 1차 룰 기반, 애매한 케이스는 Advisor에게 위임.
 * 위임 조건:
 *  - 재시도 2회 이상 (룰이 안 통한 케이스)
 *  - 이슈 3건 이상 (다중 원인 가능성)
 *  - 같은 에이전트 재시도 직후 (다른 분류 필요)
 */
async function routeFailingAgent(
  issues: AdvisorIssue[],
  context: { attempt: number; previousAgent?: FailingAgent; phase: string; brief?: ProjectBrief }
): Promise<{ agent: FailingAgent; reason: string }> {
  const ambiguous =
    context.attempt >= 1 ||                    // 첫 재시도 이후부터 advisor 사용
    issues.length >= 3 ||
    !!context.previousAgent

  if (ambiguous) {
    return await pmAdvisor(issues, context)
  }
  return { agent: identifyFailingAgent(issues), reason: 'rule-based (clear case)' }
}

// ── PM 중간 검증 함수 ──────────────────────────────────────────

/**
 * Art Director 결과 검증: 재료 노출 지시 + 금지 배경 탐지
 */
function validateArtDirectorOutput(
  data: { styleGuide: StyleGuide; stylingPrompts: StylingPromptsJson },
  _brief: ProjectBrief
): string[] {
  const issues: string[] = []
  const ingredientPattern = /(필링|단면|크림|앙금|재료|소스|filling|cross.?section|inside|ingredient)/i
  const actionPattern = /(보여|표시|넣|추가|포함|show|display|add|include|reveal|pour|visible)/i

  for (const rule of data.stylingPrompts.productPreservationRules) {
    if (ingredientPattern.test(rule) && actionPattern.test(rule)) {
      issues.push(`productPreservationRules에 재료 노출 지시 발견: "${rule.substring(0, 80)}"`)
    }
  }

  const forbiddenBg = ['카페', '주방', '야외', '레스토랑', 'cafe', 'kitchen', 'outdoor', 'restaurant']
  for (const shot of data.stylingPrompts.shots) {
    if (forbiddenBg.some((b) => shot.surface.toLowerCase().includes(b))) {
      issues.push(`샷 "${shot.name}"에 금지 배경 발견: "${shot.surface.substring(0, 60)}"`)
    }
  }

  return issues
}

/**
 * v5: sectionImageBriefs 검증 — bgType==='layer-image' 모든 섹션이 brief를 가져야 함.
 * 각 brief는 background asset 1개 이상 필수. 섹션 다양성도 검증 (textureHint 동일성 체크).
 */
function validateArtDirectorV5(
  data: { styleGuide: StyleGuide; stylingPrompts: StylingPromptsJson }
): string[] {
  const issues: string[] = []
  const layerSections = data.styleGuide.layoutPatterns
    .filter(lp => lp.bgType === 'layer-image')
    .map(lp => lp.section.toLowerCase())
  const briefs = data.stylingPrompts.sectionImageBriefs ?? []
  const briefSections = briefs.map(b => b.section.toLowerCase())

  // 1) 누락 섹션
  const missing = layerSections.filter(s => !briefSections.includes(s))
  if (missing.length > 0) {
    issues.push(`v5 sectionImageBriefs 누락: ${missing.join(', ')}`)
  }

  // 2) background asset 누락
  for (const brief of briefs) {
    const hasBg = brief.assets?.some(a => a.role === 'background')
    if (!hasBg) issues.push(`${brief.section}: background asset 누락 (필수)`)
    if (!brief.assets || brief.assets.length === 0) issues.push(`${brief.section}: assets 빈 배열`)
  }

  // 3) 다양성 — textureHint가 4개 섹션 이상 동일하면 단조로움 경고
  if (briefs.length >= 4) {
    const textures = briefs.map(b => b.textureHint?.toLowerCase()?.trim() ?? '')
    const counts = textures.reduce<Record<string, number>>((m, t) => {
      m[t] = (m[t] ?? 0) + 1
      return m
    }, {})
    const dominant = Object.entries(counts).find(([, n]) => n >= 4)
    if (dominant) issues.push(`textureHint 단조로움: "${dominant[0]}"가 ${dominant[1]}개 섹션에서 반복`)
  }

  return issues
}

/**
 * Art Director productPreservationRules 정화: 재료 노출 지시 제거 + 기본 보존 규칙 삽입
 */
function sanitizePreservationRules(prompts: StylingPromptsJson): StylingPromptsJson {
  const ingredientPattern = /(필링|단면|크림|앙금|재료|소스|filling|cross.?section|inside|ingredient)/i
  const actionPattern = /(보여|표시|넣|추가|포함|show|display|add|include|reveal|pour|visible)/i

  const cleaned = prompts.productPreservationRules.filter((rule) => {
    if (ingredientPattern.test(rule) && actionPattern.test(rule)) {
      console.log(`  [PM] 제거된 보존 규칙: "${rule.substring(0, 80)}"`)
      return false
    }
    return true
  })

  const baseRule =
    'STRICTLY FORBIDDEN: Do NOT show any ingredients, fillings, cross-sections, or internal components of the product. ONLY the finished, intact product exterior appears.'
  if (!cleaned.some((r) => r.includes('STRICTLY FORBIDDEN'))) {
    cleaned.unshift(baseRule)
  }

  return { ...prompts, productPreservationRules: cleaned }
}

/**
 * Script Writer 결과 검증: 필수 문구 포함 여부 + 금지 표현 + 최소 섹션 수
 */
function validateScriptOutput(script: Script, brief: ProjectBrief): string[] {
  const issues: string[] = []
  const fullText = script.sections.map((s) => JSON.stringify(s)).join(' ')

  // 공백 정규화 비교 (·, -, · 주변 공백 차이 허용)
  const normalize = (s: string) => s.replace(/\s*[·•]\s*/g, '·').replace(/\s+/g, ' ').trim()

  for (const phrase of brief.requiredContent.phrases) {
    const normalizedText = normalize(fullText)
    const normalizedPhrase = normalize(phrase)
    if (!normalizedText.includes(normalizedPhrase)) {
      issues.push(`필수 문구 누락: "${phrase}"`)
    }
  }
  for (const word of brief.restrictions.words) {
    if (fullText.toLowerCase().includes(word.toLowerCase())) {
      issues.push(`금지 표현 사용: "${word}"`)
    }
  }
  if (script.sections.length < 8) {
    issues.push(`섹션 수 부족: ${script.sections.length}개 (최소 8개)`)
  }

  return issues
}

export async function runPipeline(input: ProjectInput): Promise<PipelineResult> {
  const elapsed = timer()
  const projectId = crypto.randomUUID().slice(0, 8)
  const dirs = ensureOutputDirs(projectId)
  const stages: PipelineResult['stages'] = {}
  let retryCount = 0

  console.log(`\n${'='.repeat(60)}`)
  console.log(`[PM] 파이프라인 시작 — projectId: ${projectId}`)
  console.log(`[PM] 제품: ${input.productName} | 카테고리: ${input.category} | 플랫폼: ${input.platform}`)
  console.log(`${'='.repeat(60)}\n`)

  // ── Step 1: 프로젝트 브리프 ──
  const brief = buildProjectBrief(input, projectId)
  saveJson(brief, `${dirs.base}/project-brief.json`)
  console.log('[PM] Step 1: 프로젝트 브리프 생성 완료')

  // ── Step 1.5: Design Researcher (통합 레퍼런스 수집) ──
  console.log('\n[PM] Step 1.5: 디자인 레퍼런스 수집 (파일 + 웹)')
  let designRefs = { categoryRefs: [] as string[], webRefs: [] as string[], sectionRefs: [] as { section: string; paths: string[] }[] }
  try {
    const { collectReferences } = await import('./design-researcher')
    designRefs = await collectReferences(input.category, input.toneKeywords ?? [], dirs.base, {
      perSectionRefs: 3,
      countPerWebSource: 4,
      webScrape: true,
    })
  } catch (err: unknown) {
    console.warn('[PM] Design Researcher 실패 — 빈 ref로 진행:', err instanceof Error ? err.message.substring(0, 80) : String(err))
  }
  // categoryRefs는 큐레이션 통과한 것만 (현재는 모두 스킵 → 빈 배열)
  // sectionRefs는 AD에 별도 파라미터로 전달
  const allReferenceImages = [
    ...designRefs.categoryRefs,
    ...designRefs.webRefs,
    ...(input.referenceImagePaths ?? []),
  ]
  const sectionRefs = designRefs.sectionRefs
  console.log(`[PM] 레퍼런스: 통합 ${allReferenceImages.length}장 (카테고리:${designRefs.categoryRefs.length} + 웹:${designRefs.webRefs.length} + 업로드:${(input.referenceImagePaths ?? []).length}) + 섹션:${sectionRefs.reduce((n, s) => n + s.paths.length, 0)}장`)

  // ── Step 2: Art Director (레퍼런스 분석 → StyleGuide + StylingPrompts) ──
  console.log('\n[PM] Step 2: Art Director 실행')
  let artResult = await runArtDirector(brief, allReferenceImages, dirs.base, sectionRefs)
  stages.artDirector = { success: artResult.success, durationMs: artResult.durationMs, error: artResult.error }
  if (!artResult.success || !artResult.data) {
    console.error('[PM] Art Director 실패 — 1회 재시도')
    artResult = await runArtDirector(brief, allReferenceImages, dirs.base, sectionRefs)
    if (!artResult.success || !artResult.data) {
      console.error('[PM] Art Director 재시도 실패 — 파이프라인 중단')
      return { projectId, success: false, outputDir: dirs.base, stages, retryCount, totalDurationMs: elapsed() }
    }
  }
  let { styleGuide, stylingPrompts } = artResult.data

  // Art Director 결과 검증 + 자동 보정
  const artIssues = validateArtDirectorOutput(artResult.data, brief)
  if (artIssues.length > 0) {
    console.warn(`\n[PM] Art Director 결과 보정 (${artIssues.length}건):`)
    artIssues.forEach((i) => console.warn(`  ⚠️  ${i}`))
    stylingPrompts = sanitizePreservationRules(stylingPrompts)
    saveJson(stylingPrompts, `${dirs.base}/styling-shots-prompts.json`)
    console.log('[PM] → 보정된 보존 규칙으로 저장 완료')
  } else {
    console.log('[PM] Art Director 검증 — OK')
  }

  // v5 검증 — sectionImageBriefs 누락/단조로움 체크
  const v5Issues = validateArtDirectorV5(artResult.data)
  if (v5Issues.length > 0) {
    console.warn(`\n[PM] v5 sectionImageBriefs 검증 실패 (${v5Issues.length}건) — Art Director 재실행:`)
    v5Issues.forEach(i => console.warn(`  ⚠️  ${i}`))
    const adRetry = await runArtDirector(brief, allReferenceImages, dirs.base, sectionRefs)
    if (adRetry.data) {
      styleGuide = adRetry.data.styleGuide
      stylingPrompts = adRetry.data.stylingPrompts
      const recheck = validateArtDirectorV5(adRetry.data)
      if (recheck.length > 0) {
        console.warn('[PM] v5 재시도 후에도 일부 누락 — 진행하되 시각 검증 권장')
        recheck.forEach(i => console.warn(`  ⚠️  ${i}`))
      } else {
        console.log('[PM] v5 검증 재시도 — OK')
      }
    }
  } else {
    console.log('[PM] v5 sectionImageBriefs 검증 — OK')
  }

  // ── Step 3: Script Writer (style guide 맥락 포함) ──
  console.log('\n[PM] Step 3: Script Writer 실행')
  let scriptResult = await runScriptWriter(brief, dirs.script, styleGuide)
  stages.scriptWriter = { success: scriptResult.success, durationMs: scriptResult.durationMs, error: scriptResult.error }
  if (!scriptResult.success || !scriptResult.data) {
    console.error('[PM] Script Writer 실패 — 파이프라인 중단')
    return { projectId, success: false, outputDir: dirs.base, stages, retryCount, totalDurationMs: elapsed() }
  }
  let script = scriptResult.data

  // Script Writer 결과 검증 (최대 2회 재실행)
  let scriptValidationIssues = validateScriptOutput(script, brief)
  for (let sw = 0; sw < 2 && scriptValidationIssues.length > 0; sw++) {
    console.warn(`\n[PM] Script Writer 검증 실패 (${sw + 1}/2회) — 재실행:`)
    scriptValidationIssues.forEach((i) => console.warn(`  ❌ ${i}`))
    const swRetry = await runScriptWriter(brief, dirs.script, styleGuide, scriptValidationIssues)
    if (swRetry.data) {
      script = swRetry.data
      scriptValidationIssues = validateScriptOutput(script, brief)
    } else break
  }
  if (scriptValidationIssues.length > 0) {
    console.warn('[PM] Script Writer 최종 검증 실패 (계속 진행):')
    scriptValidationIssues.forEach((i) => console.warn(`  ⚠️  ${i}`))
  } else {
    console.log('[PM] Script Writer 검증 — OK')
  }

  // ── Step 4: 병렬 — Styling Shots + Copy Writer ──
  console.log('\n[PM] Step 4: 병렬 실행 (Styling Shots + Copy Writer)')
  const [stylingResult, copyResult] = await Promise.all([
    runStylingShots(stylingPrompts, input.nukkiPaths, dirs.stylingShots, {
      category: brief.category,
      platform: brief.platform,
      brandColorHex: styleGuide.colors.primary,
    }),
    runCopyWriter(script, styleGuide, dirs.base, brief),
  ])
  stages.stylingShots = { success: stylingResult.success, durationMs: stylingResult.durationMs, error: stylingResult.error }
  stages.copyWriter = { success: copyResult.success, durationMs: copyResult.durationMs, error: copyResult.error }

  let refinedCopy = copyResult.data
  if (!refinedCopy) {
    console.error('[PM] Copy Writer 실패 — 파이프라인 중단')
    return { projectId, success: false, outputDir: dirs.base, stages, retryCount, totalDurationMs: elapsed() }
  }

  // ── Step 5: Layer Image ──
  // v6: Gemini 자동 배경 생성 폐기. 배경은 html-builder가 CSS로 렌더링하고,
  // 실사 이미지는 운영자가 외부 모델로 추출 후 별도 합성.
  let layerResult: AgentResult<Record<string, string>>
  if (SKIP_IMAGE_GENERATION) {
    console.log('\n[PM] Step 5: Layer Image 스킵 (v6 — 외부 모델 직접 추출 워크플로)')
    layerResult = { success: true, data: {}, durationMs: 0 }
  } else {
    console.log('\n[PM] Step 5: Layer Image 실행 (레거시)')
    layerResult = await runLayerImage(
      script,
      styleGuide,
      stylingResult.data ?? [],
      input.nukkiPaths,
      dirs.layers,
      stylingPrompts.conceptShots,
      stylingPrompts.sectionImageBriefs
    )
  }
  stages.layerImage = { success: layerResult.success, durationMs: layerResult.durationMs, error: layerResult.error }

  // ── Step 6: Icon Mapper ──
  console.log('\n[PM] Step 6: Icon Mapper 실행')
  const iconResult = runIconMapper(script, styleGuide, dirs.icons)
  stages.iconMapper = { success: iconResult.success, durationMs: iconResult.durationMs, error: iconResult.error }

  // ── Step 7: HTML Builder ──
  console.log('\n[PM] Step 7: HTML Builder 실행')
  // Layer Image 결과 (heroBg, heroWithTypo, breakImage, section_* 컨셉샷, section_X_role)
  const allImagePaths: Record<string, string> = { ...(layerResult.data ?? {}) }
  // legacy bridge: heroBg → heroBackground (html-builder의 getLayerAssetUrl 폴백 키 호환)
  if (allImagePaths.heroBg && !allImagePaths.heroBackground) {
    allImagePaths.heroBackground = allImagePaths.heroBg
  }
  // 스타일링샷: shot0, shot1, shot2... (styling-shots-prompts.json 파일명 기반)
  const stylingFiles = stylingResult.data ?? []
  stylingFiles.forEach((shotPath, i) => {
    allImagePaths[`shot${i}`] = shotPath
  })
  // v6 fallback: 스타일링샷이 없을 때(외부 모델 워크플로) 누끼컷을 shot0~N 으로 채운다.
  // hero 섹션은 heroWithTypo 키를 우선 사용하므로 shot0을 heroWithTypo 로도 매핑.
  // 실제 스타일링샷이 업로드된 뒤 재빌드하면 덮어써지므로 부작용 없음.
  if (stylingFiles.length === 0 && input.nukkiPaths.length > 0) {
    console.log(`[PM] v6 이미지 fallback: 누끼컷 ${input.nukkiPaths.length}장 → shot0~N + heroWithTypo`)
    input.nukkiPaths.forEach((p, i) => {
      allImagePaths[`shot${i}`] = p
    })
    if (!allImagePaths.heroWithTypo) {
      allImagePaths.heroWithTypo = input.nukkiPaths[0]
    }
    if (!allImagePaths.heroBg) {
      allImagePaths.heroBg = input.nukkiPaths[0]
      allImagePaths.heroBackground = input.nukkiPaths[0]
    }
    if (!allImagePaths.breakImage && input.nukkiPaths.length > 1) {
      allImagePaths.breakImage = input.nukkiPaths[1]
    }
  }

  let htmlPath: string | undefined
  if (iconResult.data && refinedCopy) {
    const htmlResult = await runHtmlBuilder(
      styleGuide, refinedCopy, script, iconResult.data, dirs.final, allImagePaths
    )
    stages.htmlBuilder = { success: htmlResult.success, durationMs: htmlResult.durationMs, error: htmlResult.error }
    htmlPath = htmlResult.data?.htmlPath
  }

  // ── Step 8: QA + Script 재실행 루프 ──
  console.log('\n[PM] Step 8: QA 검증')
  let qaPass = false
  let validatorPass = false
  let lastRetryAgent: FailingAgent | undefined = undefined
  // 비용 가드: 비싼 재시도(artDirector / imageRegenerate)는 각 1회로 제한
  let expensiveRetries = { artDirector: 0, imageRegenerate: 0 }
  const MAX_EXPENSIVE_RETRY = 1

  for (let attempt = 0; attempt < MAX_RETRY; attempt++) {
    if (attempt > 0) {
      retryCount++
      console.log(`\n[PM] 재작업 ${attempt}/${MAX_RETRY - 1}회`)
    }

    const qaResult = await runQA(script, brief, dirs.base)
    stages.qa = { success: qaResult.success, durationMs: qaResult.durationMs }
    qaPass = qaResult.data?.passed ?? false

    if (!qaPass) {
      const issues = qaResult.data?.issues ?? []
      let decision = await routeFailingAgent(issues as AdvisorIssue[], {
        attempt,
        previousAgent: lastRetryAgent,
        phase: 'qa',
        brief,
      })
      let failingAgent = decision.agent

      // 비용 가드: 비싼 분기 재시도 한도 초과 시 강등
      if (failingAgent === 'artDirector' && expensiveRetries.artDirector >= MAX_EXPENSIVE_RETRY) {
        console.log(`[PM] artDirector 재시도 한도 초과 → copyWriter로 강등`)
        failingAgent = 'copyWriter'
      } else if (failingAgent === 'imageRegenerate' && expensiveRetries.imageRegenerate >= MAX_EXPENSIVE_RETRY) {
        console.log(`[PM] imageRegenerate 재시도 한도 초과 → copyWriter로 강등`)
        failingAgent = 'copyWriter'
      }

      lastRetryAgent = failingAgent
      console.log(`[PM] QA FAIL → ${failingAgent} (${decision.reason})`)

      if (failingAgent === 'failFast') {
        console.log('[PM] failFast — 더 이상 재시도하지 않음')
        break
      }

      if (failingAgent === 'scriptWriter') {
        const reissues = issues.map(i => i.description ?? '').filter(Boolean)
        const rescript = await runScriptWriter(brief, dirs.script, styleGuide, reissues)
        if (rescript.data) {
          script = rescript.data
          const reCopy = await runCopyWriter(script, styleGuide, dirs.base, brief)
          if (reCopy.data) refinedCopy = reCopy.data
          const reIcon = runIconMapper(script, styleGuide, dirs.icons)
          if (reIcon.data && refinedCopy) {
            const reHtml = await runHtmlBuilder(styleGuide, refinedCopy, script, reIcon.data, dirs.final, allImagePaths)
            htmlPath = reHtml.data?.htmlPath
          }
        }
      } else if (failingAgent === 'artDirector') {
        expensiveRetries.artDirector++
        console.log('[PM] Art Director 재실행 (디자인 시스템 불일치)')
        const reAd = await runArtDirector(brief, allReferenceImages, dirs.base)
        if (reAd.data) {
          styleGuide = reAd.data.styleGuide
          stylingPrompts = reAd.data.stylingPrompts
          // v6: SKIP 모드에서는 Layer Image 재생성 생략 (배경은 CSS 렌더링)
          if (!SKIP_IMAGE_GENERATION) {
            const reLi = await runLayerImage(
              script, styleGuide,
              stylingResult.data ?? [], input.nukkiPaths, dirs.layers,
              stylingPrompts.conceptShots, stylingPrompts.sectionImageBriefs
            )
            if (reLi.data) Object.assign(allImagePaths, reLi.data)
          }
          // Copy Writer + Icon Mapper + HTML 재빌드
          const reCopy = await runCopyWriter(script, styleGuide, dirs.base, brief)
          if (reCopy.data) refinedCopy = reCopy.data
          const reIcon = runIconMapper(script, styleGuide, dirs.icons)
          if (reIcon.data && refinedCopy) {
            const reHtml = await runHtmlBuilder(styleGuide, refinedCopy, script, reIcon.data, dirs.final, allImagePaths)
            htmlPath = reHtml.data?.htmlPath
          }
        }
      } else if (failingAgent === 'imageRegenerate' && !SKIP_IMAGE_GENERATION) {
        expensiveRetries.imageRegenerate++
        console.log('[PM] Layer Image 재생성 — 시각 이슈 (재료 노출 등)')
        const reLi = await runLayerImage(
          script, styleGuide,
          stylingResult.data ?? [], input.nukkiPaths, dirs.layers,
          stylingPrompts.conceptShots, stylingPrompts.sectionImageBriefs
        )
        if (reLi.data) {
          Object.assign(allImagePaths, reLi.data)
          // Icon mapper도 재실행 (script 변경 시 대비)
          const reIcon = runIconMapper(script, styleGuide, dirs.icons)
          if (refinedCopy && reIcon.data) {
            const reHtml = await runHtmlBuilder(styleGuide, refinedCopy, script, reIcon.data, dirs.final, allImagePaths)
            htmlPath = reHtml.data?.htmlPath
          }
        }
      } else {
        // copyWriter (기본 fallback)
        const reCopy = await runCopyWriter(script, styleGuide, dirs.base, brief)
        if (reCopy.data) {
          refinedCopy = reCopy.data
          const reIcon = runIconMapper(script, styleGuide, dirs.icons)
          if (reIcon.data) {
            const reHtml = await runHtmlBuilder(styleGuide, refinedCopy, script, reIcon.data, dirs.final, allImagePaths)
            htmlPath = reHtml.data?.htmlPath
          }
        }
      }
      continue
    }

    // ── Step 9: Validator (HTML 생성 후) ──
    const generatedFiles = [
      ...Object.values(layerResult.data ?? {}),
      ...(stylingResult.data ?? []),
      ...(htmlPath ? [htmlPath] : []),
    ]
    const validatorResult = await runValidator(styleGuide, refinedCopy!, generatedFiles, dirs.base, brief)
    stages.validator = { success: validatorResult.success, durationMs: validatorResult.durationMs }
    validatorPass = validatorResult.data?.passed ?? false

    if (validatorPass) break
    console.log('[PM] Validator FAIL — Copy Writer 재실행')
    const reCopy = await runCopyWriter(script, styleGuide, dirs.base, brief)
    if (reCopy.data) refinedCopy = reCopy.data
  }

  // ── Step 10: Exporter (HTML 생성 시 항상 실행) ──
  let exportDir: string | undefined
  if (htmlPath) {
    const exportResult = await runExporter(htmlPath, dirs.base)
    stages['exporter'] = { success: exportResult.success }
    exportDir = exportResult.exportDir
  }

  // ── 최종 리포트 ──
  const finalReport = {
    projectId,
    productName: input.productName,
    success: qaPass && validatorPass,
    stages,
    retryCount,
    totalDurationMs: elapsed(),
    outputDir: dirs.base,
    htmlPath,
    exportDir,
    generatedAt: new Date().toISOString(),
  }
  saveJson(finalReport, `${dirs.base}/final-report.json`)

  console.log(`\n${'='.repeat(60)}`)
  console.log(`[PM] 파이프라인 완료 — ${finalReport.success ? '✅ SUCCESS' : '⚠️ PARTIAL'}`)
  console.log(`[PM] 총 소요: ${elapsed()}ms | 재작업: ${retryCount}회`)
  console.log(`[PM] 출력 디렉토리: ${dirs.base}`)
  console.log(`${'='.repeat(60)}\n`)

  return finalReport
}

// ═══════════════════════════════════════════════════════════════
// v6 기획 파이프라인 (2026-05 클라이언트 회의 결정)
// ───────────────────────────────────────────────────────────────
// AI 자동화 범위: 스크립트 + 디자인기획(style-guide) + 스타일링샷 프롬프트.
// 이미지 생성(layer-image) / HTML 조립(html-builder) / Playwright(exporter) 없음.
// 운영자가 styling-final-prompts.json으로 외부 모델(Gemini/GPT) 이미지 추출 →
// 디자이너가 템플릿 + 이미지 결합 → Figma 미세 조정.
// ═══════════════════════════════════════════════════════════════

export interface PlanningResult {
  projectId: string
  success: boolean
  outputDir: string
  stages: Record<string, { success: boolean; durationMs?: number; error?: string }>
  /** 생성된 산출물 파일 경로 (Supabase 업로드용). */
  artifacts: {
    brief: string
    styleGuide?: string
    script?: string
    stylingPrompts?: string
  }
  totalDurationMs: number
}

/**
 * 기획 단계 전용 파이프라인 — design_planning 상태에서 호출.
 * 출력: project-brief.json, style-guide.json, script.json, styling-final-prompts.json
 */
export async function runPlanningPipeline(input: ProjectInput): Promise<PlanningResult> {
  const elapsed = timer()
  const projectId = crypto.randomUUID().slice(0, 8)
  const dirs = ensureOutputDirs(projectId)
  const stages: PlanningResult['stages'] = {}
  const artifacts: PlanningResult['artifacts'] = { brief: `${dirs.base}/project-brief.json` }

  console.log(`\n${'='.repeat(60)}`)
  console.log(`[PM/기획] 기획 파이프라인 시작 — projectId: ${projectId}`)
  console.log(`[PM/기획] 제품: ${input.productName} | 카테고리: ${input.category} | 플랫폼: ${input.platform}`)
  console.log(`${'='.repeat(60)}\n`)

  // ── Step 1: 프로젝트 브리프 ──
  const brief = buildProjectBrief(input, projectId)
  saveJson(brief, `${dirs.base}/project-brief.json`)
  console.log('[PM/기획] Step 1: 프로젝트 브리프 생성 완료')

  // ── Step 2: (제거됨) v6 — 디자인 레퍼런스 이미지 비전 폐기 ──
  // 웹/섹션 레퍼런스 비전 분석은 v5 layer-image 자동 생성용 잔재.
  // v6는 템플릿(코드화 DetailTemplate) 기반이라 불필요 + Opus many-image라 느리고 비쌈(실측 2.3분).
  // → Art Director에는 제품 누끼컷만 전달 (제품 색·형태 파악용). design-researcher 호출 제거.
  const allReferenceImages = input.nukkiPaths ?? []
  const sectionRefs: { section: string; paths: string[] }[] = []

  // ── Step 3: Art Director (디자인기획 = style-guide + 스타일링샷 프롬프트) ──
  console.log('\n[PM/기획] Step 3: Art Director 실행 (디자인 기획)')
  let artResult = await runArtDirector(brief, allReferenceImages, dirs.base, sectionRefs)
  if (!artResult.success || !artResult.data) {
    console.error('[PM/기획] Art Director 실패 — 1회 재시도')
    artResult = await runArtDirector(brief, allReferenceImages, dirs.base, sectionRefs)
  }
  stages.artDirector = { success: artResult.success, durationMs: artResult.durationMs, error: artResult.error }
  if (!artResult.success || !artResult.data) {
    console.error('[PM/기획] Art Director 재시도 실패 — 기획 중단')
    return { projectId, success: false, outputDir: dirs.base, stages, artifacts, totalDurationMs: elapsed() }
  }
  let { styleGuide, stylingPrompts } = artResult.data
  artifacts.styleGuide = `${dirs.base}/style-guide.json`

  // 템플릿 게이트: AI가 유효한 템플릿을 선택했는지 검증 (조용한 누락 방지)
  // selectedTemplateId가 없거나 무효면 폰트/레이아웃 오버라이드가 통째로 무시되므로 1회 재시도.
  let templateOk = !!(styleGuide.selectedTemplateId && getTemplateById(styleGuide.selectedTemplateId))
  if (!templateOk) {
    console.warn(`[PM/기획] ⚠️ 템플릿 게이트: selectedTemplateId 무효/누락 "${styleGuide.selectedTemplateId ?? '(없음)'}" — Art Director 1회 재시도`)
    const adRetry = await runArtDirector(brief, allReferenceImages, dirs.base, sectionRefs)
    if (adRetry.data && adRetry.data.styleGuide.selectedTemplateId && getTemplateById(adRetry.data.styleGuide.selectedTemplateId)) {
      styleGuide = adRetry.data.styleGuide
      stylingPrompts = adRetry.data.stylingPrompts
      templateOk = true
      console.log(`[PM/기획] 템플릿 게이트 통과 (재시도): ${styleGuide.selectedTemplateId}`)
    } else {
      console.warn('[PM/기획] ⚠️ 재시도 후에도 템플릿 미선택 — 디자이너가 검수 단계에서 수동 선택 필요')
    }
  } else {
    console.log(`[PM/기획] 템플릿 게이트 통과: ${styleGuide.selectedTemplateId}`)
  }

  // 재료 노출 방지 보정 (v5 sectionImageBriefs 검증은 새 워크플로에서 불필요 — 스킵)
  // 게이트 재시도로 styleGuide/stylingPrompts가 갱신됐을 수 있으므로 최신값으로 검사
  const artIssues = validateArtDirectorOutput({ styleGuide, stylingPrompts }, brief)
  if (artIssues.length > 0) {
    console.warn(`[PM/기획] Art Director 보정 (${artIssues.length}건)`)
    stylingPrompts = sanitizePreservationRules(stylingPrompts)
    saveJson(stylingPrompts, `${dirs.base}/styling-shots-prompts.json`)
  }

  // ── Step 4: Script Writer (디자인기획 맥락 포함) ──
  console.log('\n[PM/기획] Step 4: Script Writer 실행')
  let scriptResult = await runScriptWriter(brief, dirs.script, styleGuide)
  stages.scriptWriter = { success: scriptResult.success, durationMs: scriptResult.durationMs, error: scriptResult.error }
  if (!scriptResult.success || !scriptResult.data) {
    console.error('[PM/기획] Script Writer 실패 — 기획 중단')
    return { projectId, success: false, outputDir: dirs.base, stages, artifacts, totalDurationMs: elapsed() }
  }
  let script = scriptResult.data
  artifacts.script = `${dirs.script}/script.json`

  // Script 검증 (최대 2회 재실행)
  let scriptIssues = validateScriptOutput(script, brief)
  for (let sw = 0; sw < 2 && scriptIssues.length > 0; sw++) {
    console.warn(`[PM/기획] Script 검증 실패 (${sw + 1}/2) — 재실행`)
    const swRetry = await runScriptWriter(brief, dirs.script, styleGuide, scriptIssues)
    if (swRetry.data) {
      script = swRetry.data
      scriptIssues = validateScriptOutput(script, brief)
    } else break
  }

  // ── Step 5: Styling Shots (프롬프트 출력 — Gemini 호출 없음) ──
  console.log('\n[PM/기획] Step 5: 스타일링샷 프롬프트 출력')
  const stylingResult = await runStylingShots(stylingPrompts, input.nukkiPaths, dirs.stylingShots, {
    category: brief.category,
    platform: brief.platform,
    brandColorHex: styleGuide.colors.primary,
  })
  stages.stylingShots = { success: stylingResult.success, durationMs: stylingResult.durationMs, error: stylingResult.error }
  if (stylingResult.success) {
    artifacts.stylingPrompts = `${dirs.stylingShots}/styling-final-prompts.json`
  }

  const success = artResult.success && scriptResult.success && stylingResult.success
  const planningReport = {
    projectId,
    productName: input.productName,
    success,
    selectedTemplateId: styleGuide.selectedTemplateId ?? null,
    templateGatePassed: templateOk,
    stages,
    artifacts,
    totalDurationMs: elapsed(),
    outputDir: dirs.base,
    generatedAt: new Date().toISOString(),
  }
  saveJson(planningReport, `${dirs.base}/planning-report.json`)

  console.log(`\n${'='.repeat(60)}`)
  console.log(`[PM/기획] 기획 완료 — ${success ? '✅ SUCCESS' : '⚠️ PARTIAL'} (${elapsed()}ms)`)
  console.log(`[PM/기획] 출력: ${dirs.base}`)
  console.log(`${'='.repeat(60)}\n`)

  return { projectId, success, outputDir: dirs.base, stages, artifacts, totalDurationMs: elapsed() }
}
