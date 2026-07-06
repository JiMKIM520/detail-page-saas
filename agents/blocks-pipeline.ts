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

  // ── Step 2: 블록 컴포저 (카탈로그 조합 → PageSpec → HTML, 내부 슬롯 zod 검증) ──
  const composer = await runBlocksComposer({
    brief,
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
