/**
 * Slot Pipeline (식품) — 슬롯템플릿 기반 생성 경로.
 *
 * 기존 제너릭 경로(runPipeline: AD 풀 StyleGuide → html-builder 조립)를 대체하는 식품 전용 경로.
 *   brief → script-writer → slot-filler(→FoodCopyData) → renderFoodDetail(고정 프리미엄 CSS) → exporter
 *
 * runPipeline과 동일한 PipelineResult 계약(outputDir/htmlPath/stages)을 지키므로
 * pipeline-bridge는 식품일 때 이 함수로 분기만 하면 된다.
 */
import * as fs from 'fs'
import * as path from 'path'
import { ensureOutputDirs, saveJson, timer } from './utils'
import { buildProjectBrief, type PipelineResult } from './pm'
import { runScriptWriter } from './script-writer'
import { runSlotFiller } from './slot-filler'
import { deriveFoodTokens } from './slot-tokens'
import { renderFoodDetail } from './templates/slots/food-slot'
import { runExporter } from './exporter'
import type { ProjectInput } from './types'

export interface SlotPipelineOptions {
  /** 히어로(및 풀블리드) 이미지 URL — 누끼컷 서명URL 등. 없으면 브랜드 그라데이션 폴백 */
  heroImageUrl?: string
  /** 라인업 카드 이미지 URL들. 없으면 플레이스홀더 */
  lineupImageUrls?: string[]
  /** 브랜드명(company_name과 다를 때). 없으면 input.productName 사용 */
  brand?: string
}

export async function runSlotPipeline(
  input: ProjectInput,
  opts: SlotPipelineOptions = {},
): Promise<PipelineResult> {
  const elapsed = timer()
  const projectId = crypto.randomUUID().slice(0, 8)
  const dirs = ensureOutputDirs(projectId)
  const stages: PipelineResult['stages'] = {}

  console.log(`\n${'='.repeat(60)}`)
  console.log(`[Slot PM] 슬롯 파이프라인 시작 — projectId: ${projectId}`)
  console.log(`[Slot PM] 제품: ${input.productName} | 카테고리: ${input.category}`)
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
  saveJson(brief, `${dirs.base}/project-brief.json`)
  console.log('[Slot PM] Step 1: 브리프 생성')

  // ── Step 2: Script Writer (카테고리×플랫폼 분화 카피) ──
  const scriptResult = await runScriptWriter(brief, dirs.script)
  stages.scriptWriter = { success: scriptResult.success, durationMs: scriptResult.durationMs, error: scriptResult.error }
  if (!scriptResult.success || !scriptResult.data) {
    console.error('[Slot PM] Script Writer 실패:', scriptResult.error)
    return fail()
  }

  // ── Step 3: Slot Filler (Script → 식품 슬롯 카피) ──
  const slotResult = await runSlotFiller({
    brief,
    script: scriptResult.data,
    brand: opts.brand ?? input.productName,
    outputDir: dirs.base,
  })
  stages.slotFiller = { success: slotResult.success, durationMs: slotResult.durationMs, error: slotResult.error }
  if (!slotResult.success || !slotResult.data) {
    console.error('[Slot PM] Slot Filler 실패:', slotResult.error)
    return fail()
  }

  // ── Step 4: 토큰 도출(축소 AD) + 렌더 ──
  const tokens = deriveFoodTokens(input.brandColors)
  const html = renderFoodDetail({
    ...slotResult.data,
    tokens,
    images: {
      hero: opts.heroImageUrl ?? '',
      ...(opts.lineupImageUrls && opts.lineupImageUrls.length ? { lineup: opts.lineupImageUrls } : {}),
    },
  })
  const htmlPath = path.join(dirs.final, 'index.html')
  fs.writeFileSync(htmlPath, html, 'utf8')
  const sizeKb = Math.round(fs.statSync(htmlPath).size / 1024)
  console.log(`[Slot PM] Step 4: 렌더 완료 — index.html (${sizeKb}KB), tokens primary=${tokens.primary}`)

  // ── Step 5: Exporter (HTML → PNG/ZIP) ──
  let exportDir: string | undefined
  try {
    const exportResult = await runExporter(htmlPath, dirs.base)
    stages.exporter = { success: exportResult.success }
    exportDir = path.join(dirs.base, '5_export')
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.warn('[Slot PM] Exporter 실패(비치명):', msg.slice(0, 160))
    stages.exporter = { success: false, error: msg }
  }

  console.log(`[Slot PM] 완료 (${elapsed()}ms)`)
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
