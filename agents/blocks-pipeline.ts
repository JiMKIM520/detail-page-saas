/**
 * Blocks Pipeline — 조합형 블록 + AI 컴포저 기반 생성 경로 (실험·additive).
 *
 * runSlotPipeline(식품)/runPipeline(제너릭)과 동일한 PipelineResult 계약(outputDir/htmlPath/stages)을
 * 지키므로, pipeline-bridge는 USE_BLOCKS_COMPOSER 플래그일 때 이 함수로 분기만 하면 된다.
 *   brief → runBlocksComposer(블록 카탈로그 조합 → PageSpec → HTML) → exporter(HTML → PNG/ZIP)
 *
 * 이미지: hero/lifestyle 슬롯에는 반드시 Supabase 서명URL을 넣는다(로컬 경로 금지 — 컴포저가
 * URL을 AI 프롬프트와 HTML <img src>에 그대로 삽입하므로). 서명URL 만료 전 exporter가 PNG로
 * 구워 영구 보존한다.
 */
import * as fs from 'fs'
import * as path from 'path'
import { ensureOutputDirs, timer } from './utils'
import { buildProjectBrief, type PipelineResult } from './pm'
import { runBlocksComposer } from './blocks-composer'
import { runExporter } from './exporter'
import { presetForCategory } from './templates/blocks'
import type { ProjectInput } from './types'

export interface BlocksPipelineOptions {
  /** 히어로 이미지 URL — 스타일링샷 우선, 없으면 첫 누끼컷. 없으면 컴포저가 이미지 슬롯 생략 */
  heroImageUrl?: string
  /** 연출(lifestyle) 이미지 URL들 — 스타일링샷 우선. [0]=hero, [1..]=lifestyle/섹션 */
  imageUrls?: string[]
  /** 누끼컷 URL들 — cutout(제품 단면/투명) 슬롯용. 스타일링샷과 별도로 전달 */
  cutoutUrls?: string[]
  /** 카테고리에서 도출한 강제 프리셋(미전달 시 input.category로 자동 도출) */
  preferredPreset?: string
  /** 섹션 이미지(성분/공정 등) URL — section 슬롯 풀에 추가 */
  sectionImageUrls?: string[]
  /** 이미지 URL → 컷 설명 (컴포저 시맨틱 배치용) */
  imageNotes?: Record<string, string>
  /** 승인 스크립트(scripts.content) — 있으면 페이지 플래너가 청사진을 만들어 컴포저를 구속 */
  script?: { tone?: string; sections: Array<Record<string, unknown>> }
  /** 브랜드 로고 URL — hero/closing 소형 슬롯 전용(배치 가드) */
  logoUrls?: string[]
  /** 아트디렉터 스타일가이드(planning/style-guide.json) — 토큰 오버라이드용 (Sprint 4-D) */
  styleGuide?: import('./templates/blocks/tokens').StyleGuideTokenInput
  /** 기획 단계에서 저장된 청사진(Sprint 5) — 있으면 조립 시 플래너 재실행 생략 */
  blueprint?: import('./page-planner').PageBlueprint
  /** 시각 감사 폐루프 반려 노트 — 렌더 결함 사유를 컴포저 첫 호출부터 반영 */
  auditReworkNote?: string
}

export async function runBlocksPipeline(
  input: ProjectInput,
  opts: BlocksPipelineOptions = {},
): Promise<PipelineResult> {
  const elapsed = timer()
  const projectId = crypto.randomUUID().slice(0, 8)
  const dirs = ensureOutputDirs(projectId)
  const stages: PipelineResult['stages'] = {}

  console.log(`\n${'='.repeat(60)}`)
  console.log(`[Blocks PM] 블록 파이프라인 시작 — projectId: ${projectId}`)
  console.log(`[Blocks PM] 제품: ${input.productName} | 카테고리: ${input.category}`)
  console.log(`${'='.repeat(60)}\n`)

  const fail = (): PipelineResult => ({
    projectId,
    success: false,
    outputDir: dirs.base,
    stages,
    retryCount: 0,
    totalDurationMs: elapsed(),
  })

  // ── Step 1: 브리프 ──
  const brief = buildProjectBrief(input, projectId)
  console.log('[Blocks PM] Step 1: 브리프 생성')

  // ── Step 1.5: 페이지 플래너 — 기획 단계 저장 청사진이 있으면 재실행 생략(Sprint 5) ──
  let blueprint: import('./page-planner').PageBlueprint | undefined = opts.blueprint
  if (blueprint) console.log(`[Blocks PM] Step 1.5: 저장 청사진 사용 (${blueprint.sections.length}블록)`)
  if (!blueprint && opts.script?.sections?.length) {
    const { runPagePlanner } = await import('./page-planner')
    const planned = await runPagePlanner({
      brief,
      script: opts.script,
      imageNotes: opts.imageNotes ?? {},
    })
    if (planned.success && planned.data) blueprint = planned.data
    // 플래너 실패 시 청사진 없이 기존 단일 컴포저 경로로 진행 (무중단)
  }

  // ── Step 2: 블록 컴포저 (카탈로그 조합 → PageSpec → HTML, 내부 슬롯 zod 검증) ──
  const composer = await runBlocksComposer({
    auditNote: opts.auditReworkNote,
    brief,
    blueprint,
    logoUrls: opts.logoUrls,
    styleGuide: opts.styleGuide,
    script: opts.script,
    images: {
      hero: opts.heroImageUrl,
      lifestyle:
        opts.imageUrls && opts.imageUrls.length > 1 ? opts.imageUrls.slice(1) : undefined,
      cutout: opts.cutoutUrls?.[0],
      section: [
        ...(opts.cutoutUrls && opts.cutoutUrls.length > 1 ? opts.cutoutUrls.slice(1) : []),
        ...(opts.sectionImageUrls ?? []),
      ],
    },
    imageNotes: opts.imageNotes,
    brandColors: input.brandColors,
    preferredPreset: opts.preferredPreset ?? presetForCategory(input.category),
    outputDir: dirs.base,
    cutoutUrls: opts.cutoutUrls,
  })
  stages.blocksComposer = {
    success: composer.success,
    durationMs: composer.durationMs,
    error: composer.error,
  }
  if (!composer.success || !composer.data) {
    console.error('[Blocks PM] 컴포저 실패:', composer.error)
    return fail()
  }

  // ── Step 3: HTML 기록 (기존 업로드 패턴 4_final/index.html 재사용) ──
  const htmlPath = path.join(dirs.final, 'index.html')
  fs.writeFileSync(htmlPath, composer.data.html, 'utf8')
  const sizeKb = Math.round(fs.statSync(htmlPath).size / 1024)
  console.log(
    `[Blocks PM] Step 3: 렌더 완료 — index.html (${sizeKb}KB), ${composer.data.usedVariants.length} blocks`,
  )

  // ── Step 4: Exporter (HTML → PNG/ZIP) — Figma 플로우에선 굽기(chromium) 불필요 → 기본 스킵. RUN_EXPORT=true일 때만 실행. ──
  let exportDir: string | undefined
  if (process.env.RUN_EXPORT === 'true') {
    try {
      const exportResult = await runExporter(htmlPath, dirs.base)
      stages.exporter = { success: exportResult.success }
      exportDir = path.join(dirs.base, '5_export')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      console.warn('[Blocks PM] Exporter 실패(비치명):', msg.slice(0, 160))
      stages.exporter = { success: false, error: msg }
    }
  } else {
    console.log('[Blocks PM] Exporter 스킵 (Figma 플로우 — 굽기 불필요, chromium 미사용)')
    stages.exporter = { success: true }
  }

  console.log(`[Blocks PM] 완료 (${elapsed()}ms)`)
  return {
    projectId,
    success: true,
    outputDir: dirs.base,
    htmlPath,
    exportDir,
    stages,
    retryCount: 0,
    totalDurationMs: elapsed(),
  }
}
