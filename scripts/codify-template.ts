/**
 * 레퍼런스 분석 JSON → DetailTemplate JSON 변환 스크립트
 *
 * 사용:
 *   npx tsx scripts/codify-template.ts <분석JSON경로> <category> <templateId>
 *
 * 예시:
 *   npx tsx scripts/codify-template.ts demo-v8/analysis_summer_festa.json food food_natural_01
 *
 * 출력:
 *   agents/templates/{category}/{templateId}-draft.json
 *
 * 생성 후 validate-template.ts로 채점:
 *   npx tsx scripts/validate-template.ts {templateId}
 */

import { anthropicClient, MODELS, parseJsonResponse, loadJson } from '../agents/utils'
import type { DetailTemplate } from '../agents/templates/types'
import * as fs from 'fs'
import * as path from 'path'

// ─── 유효한 LayoutPatternType 16종 (agents/types.ts 와 동기화 필수) ────────────
const VALID_LAYOUT_PATTERNS = [
  // 기존 8종
  'full-bleed-hero',
  'left-image-right-text',
  'right-image-left-text',
  'full-bleed-sensory',
  'dark-story-centered',
  'numbered-steps-horizontal',
  'grid-info-cards',
  'photo-gallery-strip',
  // 신규 8종
  'masonry-gallery',
  'split-text-heavy',
  'centered-statement',
  'icon-feature-row',
  'comparison-table',
  'timeline-vertical',
  'full-bleed-overlay',
  'testimonial-quote',
] as const

// ─── 유효한 sectionType (script-writer 실제 출력 기준 — copy 파이프라인 매칭용) ───
// sectionSequence는 반드시 이 영어 값만 사용. 한국어 라벨은 copy-writer 출력과 매칭 실패.
// 주의: agents/types.ts의 ScriptSection.type union은 불완전 — script-writer 실출력 기준이 정확.
const VALID_SECTION_TYPES = [
  'hero', 'brand_story', 'story',
  'key_benefit', 'benefits', 'features',
  'ingredients', 'sensory', 'texture_focus',
  'how_to_use', 'usage', 'process',
  'packaging', 'delivery', 'package_info',
  'photo_gallery', 'gallery',
  'social_proof', 'comparison', 'size_comparison',
  'certifications', 'gift_suggestion', 'faq', 'cta',
] as const

// ─── DetailTemplate 전체 JSON 스키마 (Claude 프롬프트 주입용) ────────────────
const DETAIL_TEMPLATE_SCHEMA = `{
  "id": "<templateId — CLI 인자와 동일>",
  "name": "<템플릿 한국어 이름 (예: '자연주의 식품 기본형')>",
  "description": "<Art Director 프롬프트에 삽입될 한 줄 방향 설명>",
  "category": "<CLI 인자와 동일: food | beauty | electronics>",
  "visualTone": "<'minimal' | 'warm' | 'premium' | 'natural' | 'bold' | 'editorial' 중 하나>",
  "colorFamily": "<'warm-cream' | 'earth' | 'dark-luxury' | 'fresh-green' | 'clean-white' | 'vibrant' | 'soft-pink' | 'midnight-blue' 중 하나>",
  "fontMood": "<'elegant' | 'casual' | 'modern' | 'natural' | 'serif-heavy' 중 하나>",
  "fontPairing": {
    "headlineFont": "<Google Fonts 폰트명. 예: 'Playfair Display'>",
    "storyFont": "<Google Fonts 폰트명. 예: 'Lora'>",
    "bodyFont": "<Google Fonts 폰트명. 예: 'Noto Sans KR'>",
    "accentFont": "<Google Fonts 폰트명. 예: 'DM Serif Display'>",
    "rationale": "<조합 근거 (한국어로 50자 이내)>"
  },
  "sectionSequence": [
    "hero", "brand_story", "benefits", "ingredients",
    "how_to_use", "social_proof", "certifications", "cta"
  ],
  "patternOverrides": {
    "<영어 sectionType>": "<유효한 LayoutPatternType>"
  },
  "artDirectorHints": "<Art Director에게 전달할 디자인 방향 메모 (한국어, 2~4문장)>",
  "colorTokens": {
    "primary": "<레퍼런스 분석의 주요 색 HEX, 예: '#3A7D44'>",
    "secondary": "<보조 색 HEX>",
    "background": "<배경 색 HEX>",
    "text": "<본문 텍스트 색 HEX>",
    "accent": "<강조 색 HEX>"
  },
  "validatedAt": ""
}`

// ─── 시스템 프롬프트 ─────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a senior Korean e-commerce art director specializing in detail page templates.
Your task: convert a reference analysis JSON into a reusable DetailTemplate JSON for a Korean detail page SaaS.

RULES:
1. Extract the visual DNA (tone, color family, font mood, section rhythm) from the reference analysis.
2. sectionSequence MUST have 8 or more sections, using ONLY these standard English section type values
   (NEVER Korean labels — they must match the downstream copy pipeline's section types):
   ${VALID_SECTION_TYPES.map(s => `"${s}"`).join(', ')}
3. patternOverrides: keys MUST be the SAME English section types from sectionSequence (not Korean).
   Assign a layout pattern to EVERY section. ALL values MUST be one of the 16 valid LayoutPatternType values listed below.
4. fontPairing: all four roles (headlineFont, storyFont, bodyFont, accentFont) MUST be filled with Google Fonts names.
   Korean body text → use 'Noto Sans KR' or 'Noto Serif KR'. Latin display → Google Fonts.
5. description: concise one-line design direction for Art Director injection (Korean preferred).
6. validatedAt: always set to empty string "".
7. colorTokens: extract 5 HEX colors (primary, secondary, background, text, accent) from the reference analysis's color_system / palette. Use the EXACT hex values observed in the analysis — these drive color-fidelity scoring. If a color is missing, infer a fitting HEX consistent with the visual tone.
8. Output ONLY the JSON object. No markdown, no commentary.

Valid LayoutPatternType values (16 total):
${VALID_LAYOUT_PATTERNS.map(p => `  - "${p}"`).join('\n')}`

// ─── CLI 인자 파싱 ───────────────────────────────────────────────────────────
function parseArgs(): { analysisPath: string; category: string; templateId: string } {
  const args = process.argv.slice(2)
  if (args.length < 3) {
    console.error('사용법: npx tsx scripts/codify-template.ts <분석JSON경로> <category> <templateId>')
    console.error('예시:  npx tsx scripts/codify-template.ts demo-v8/analysis_summer_festa.json food food_natural_01')
    process.exit(1)
  }
  const [analysisPath, category, templateId] = args
  const validCategories = ['food', 'beauty', 'electronics']
  if (!validCategories.includes(category)) {
    console.error(`category는 ${validCategories.join(' | ')} 중 하나여야 합니다. 입력값: "${category}"`)
    process.exit(1)
  }
  return { analysisPath, category, templateId }
}

// ─── 후처리: patternOverrides 유효성 보정 ────────────────────────────────────
function sanitizePatternOverrides(
  overrides: Record<string, string>,
  sectionSequence: string[]
): Record<string, string> {
  const validSet = new Set<string>(VALID_LAYOUT_PATTERNS)
  const fallback = 'grid-info-cards'
  const sanitized: Record<string, string> = {}

  // sectionSequence의 모든 섹션에 override 보장
  for (const section of sectionSequence) {
    const value = overrides[section]
    sanitized[section] = validSet.has(value) ? value : fallback
  }
  return sanitized
}

// ─── 후처리: sectionSequence 최소 8개 보장 ───────────────────────────────────
const FALLBACK_SECTIONS_BY_CATEGORY: Record<string, string[]> = {
  food: ['hero', 'brand_story', 'ingredients', 'benefits', 'how_to_use', 'packaging', 'certifications', 'cta'],
  beauty: ['hero', 'brand_story', 'benefits', 'ingredients', 'how_to_use', 'before_after', 'certifications', 'cta'],
  electronics: ['hero', 'features', 'specifications', 'how_to_use', 'comparison', 'reviews', 'certifications', 'cta'],
}

function ensureMinSections(sectionSequence: string[], category: string): string[] {
  if (sectionSequence.length >= 8) return sectionSequence
  const fallbacks = FALLBACK_SECTIONS_BY_CATEGORY[category] ?? FALLBACK_SECTIONS_BY_CATEGORY['food']
  // 기존 섹션 유지 + 8개가 될 때까지만 누락분 보충 (기존 항목이 잘리지 않도록)
  const existing = new Set(sectionSequence)
  const extra = fallbacks.filter((s) => !existing.has(s))
  const needed = 8 - sectionSequence.length
  return [...sectionSequence, ...extra.slice(0, Math.max(0, needed))]
}

/** Claude 응답이 DetailTemplate 형태인지 최소 검증 (단언만으로 부분 객체 통과 방지) */
function assertTemplateShape(t: Partial<DetailTemplate>): asserts t is DetailTemplate {
  const missing: string[] = []
  if (!t.name) missing.push('name')
  if (!t.description) missing.push('description')
  if (!t.visualTone) missing.push('visualTone')
  if (!t.colorFamily) missing.push('colorFamily')
  if (!t.fontMood) missing.push('fontMood')
  const fp = t.fontPairing
  if (!fp || !fp.headlineFont || !fp.storyFont || !fp.bodyFont || !fp.accentFont) {
    missing.push('fontPairing(4개 역할)')
  }
  if (!Array.isArray(t.sectionSequence) || t.sectionSequence.length === 0) missing.push('sectionSequence')
  if (missing.length > 0) {
    throw new Error(`Claude 응답에 필수 필드 누락: ${missing.join(', ')} — 재실행 필요`)
  }
}

// ─── 메인 ────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  const { analysisPath, category, templateId } = parseArgs()

  // 분석 JSON 로드
  const resolvedPath = path.isAbsolute(analysisPath)
    ? analysisPath
    : path.join(process.cwd(), analysisPath)

  if (!fs.existsSync(resolvedPath)) {
    console.error(`분석 JSON 파일을 찾을 수 없습니다: ${resolvedPath}`)
    process.exit(1)
  }

  console.log(`\n분석 JSON 로드: ${resolvedPath}`)
  const analysis = loadJson<Record<string, unknown>>(resolvedPath)

  // Claude 프롬프트 구성
  const userPrompt = `# 레퍼런스 분석 JSON
아래는 한국 상세페이지 레퍼런스 이미지를 분석한 결과다.
이 분석에서 시각적 DNA(톤, 색감, 섹션 흐름, 레이아웃 리듬)를 추출하라.

\`\`\`json
${JSON.stringify(analysis, null, 2)}
\`\`\`

# 변환 요청
위 분석을 기반으로 아래 조건의 DetailTemplate JSON을 생성하라:

- id: "${templateId}"
- category: "${category}"
- sectionSequence: 반드시 8개 이상 (레퍼런스 섹션 흐름 반영, ${category} 카테고리에 적합한 섹션명)
- patternOverrides: sectionSequence의 **모든** 섹션에 유효한 LayoutPatternType 값 지정
- fontPairing: 4개 역할 모두 Google Fonts 폰트명으로 채울 것 (한국어 본문 → Noto Sans KR 권장)
- validatedAt: 반드시 빈 문자열 ""

# 출력 스키마
\`\`\`json
${DETAIL_TEMPLATE_SCHEMA}
\`\`\`

JSON만 출력하라. 마크다운 코드 블록 없이.`

  console.log(`\nClaude Sonnet 호출 중 (레퍼런스 → DetailTemplate 변환)...`)
  const start = Date.now()

  const message = await anthropicClient.messages.create({
    model: MODELS.CLAUDE_SONNET,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const elapsed = Date.now() - start
  console.log(`완료 (${elapsed}ms, ${message.usage.input_tokens} in / ${message.usage.output_tokens} out)`)

  const rawText = message.content[0].type === 'text' ? message.content[0].text : ''
  const parsed = parseJsonResponse<Partial<DetailTemplate>>(rawText)
  assertTemplateShape(parsed)  // 부분 객체 저장 방지 — 누락 시 명확한 에러로 중단
  let template: DetailTemplate = parsed

  // ── 후처리: id / category 강제 주입 (Claude가 바꾼 경우 대비) ──
  const sectionSequence = ensureMinSections(template.sectionSequence ?? [], category)

  // ── 후처리: patternOverrides 유효성 보정 ──
  const sanitizedOverrides = sanitizePatternOverrides(
    (template.patternOverrides as Record<string, string>) ?? {},
    sectionSequence
  )

  template = {
    ...template,
    id: templateId,
    category,
    sectionSequence,
    patternOverrides: sanitizedOverrides as DetailTemplate['patternOverrides'],
  }

  // 출력 경로 결정 및 디렉토리 생성
  const outDir = path.join(process.cwd(), 'agents', 'templates', category)
  fs.mkdirSync(outDir, { recursive: true })
  const outPath = path.join(outDir, `${templateId}-draft.json`)

  fs.writeFileSync(outPath, JSON.stringify(template, null, 2), 'utf8')

  // ── 결과 요약 출력 ──
  console.log(`\n=== 생성된 DetailTemplate 요약 ===`)
  console.log(`ID:          ${template.id}`)
  console.log(`이름:        ${template.name}`)
  console.log(`카테고리:    ${template.category}`)
  console.log(`비주얼 톤:   ${template.visualTone}`)
  console.log(`색상 패밀리: ${template.colorFamily}`)
  console.log(`폰트 무드:   ${template.fontMood}`)
  console.log(`폰트 조합:`)
  console.log(`  헤드라인: ${template.fontPairing?.headlineFont}`)
  console.log(`  스토리:   ${template.fontPairing?.storyFont}`)
  console.log(`  본문:     ${template.fontPairing?.bodyFont}`)
  console.log(`  액센트:   ${template.fontPairing?.accentFont}`)
  console.log(`섹션 순서 (${template.sectionSequence?.length ?? 0}개):`)
  template.sectionSequence?.forEach((s, i) => {
    const pattern = (template.patternOverrides as Record<string, string>)[s] ?? '(없음)'
    console.log(`  ${i + 1}. ${s} → ${pattern}`)
  })
  console.log(`\n저장: ${outPath}`)

  console.log(`\n다음 단계 — 템플릿 채점:`)
  console.log(`  npx tsx scripts/validate-template.ts ${templateId}`)
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err)
  console.error(`\n실패: ${msg}`)
  process.exit(1)
})
