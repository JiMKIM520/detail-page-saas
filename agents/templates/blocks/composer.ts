/**
 * 컴포저 — PageSpec(토큰 + 정렬된 블록) → 완성 HTML 문자열.
 *
 * 흐름:
 *  1) 각 블록의 변형을 레지스트리에서 조회 (없으면 에러)
 *  2) 슬롯 데이터를 변형 schema로 검증 (실패 시 에러 — fail fast)
 *  3) 사용된 변형의 CSS를 id로 dedup 해 1회씩 수집
 *  4) baseCss(토큰) + 변형 CSS + 폰트링크 + 렌더된 섹션들로 문서 조립
 */
import { z } from 'zod'
import { baseCss, buildFontLinks, esc, makeCtx } from './shared'
import { getVariant } from './registry'
import type { PageSpec } from './types'

const DEFAULT_WIDTH = 872

export interface RenderResult {
  html: string
  usedVariants: string[]
  blockCount: number
}

/** PageSpec → HTML. 잘못된 변형 id나 슬롯 데이터는 에러를 던진다(조용한 실패 금지). */
export function renderPage(spec: PageSpec): RenderResult {
  const width = spec.width ?? DEFAULT_WIDTH
  const ctx = makeCtx(spec.tokens)

  const cssById = new Map<string, string>()
  const sections: string[] = []
  const usedVariants: string[] = []

  spec.blocks.forEach((block, i) => {
    const variant = getVariant(block.variantId)
    if (!variant) throw new Error(`[composer] unknown variant id at block ${i}: ${block.variantId}`)

    const parsed = variant.schema.safeParse(block.data)
    if (!parsed.success) {
      throw new Error(`[composer] invalid slot data for ${block.variantId} (block ${i}): ${parsed.error.message}`)
    }

    if (!cssById.has(variant.id)) cssById.set(variant.id, variant.css)
    usedVariants.push(variant.id)
    sections.push(variant.render(parsed.data, ctx))
  })

  // vw 단위를 페이지 고정폭 기준 px로 결정적 치환 — 데스크톱 브라우저는 viewport meta를
  // 무시하므로 vw가 실제 창 폭을 따라 커져 872px 설계가 와이드 화면에서 붕괴한다
  // (로모노소프 선물 타이틀-이미지 겹침 실사례). 모바일은 meta로 이미 872 가상폭 = 동일 결과.
  const styles = [baseCss(spec.tokens, width), ...cssById.values()]
    .join('\n')
    .replace(/([\d.]+)vw/g, (_, n) => `${Math.round(parseFloat(n) * width) / 100}px`)
  const title = `${spec.meta.product}`.trim() || 'Detail'

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=${width}">
<title>${esc(title)}</title>
${buildFontLinks(spec.tokens)}
<style>
${styles}
</style>
</head>
<body>
<div class="dpg">
${sections.join('\n')}
</div>
</body>
</html>`

  return { html, usedVariants, blockCount: spec.blocks.length }
}

/** CSS 토큰 값 — <style> 탈출 문자(<>{}) 금지. 색(hex)·폰트('A', sans-serif) 값은 통과. */
const cssToken = z.string().regex(/^[^<>{}]*$/, 'CSS 토큰에 <>{} 문자 금지')

/** PageSpec 형태 검증용 zod 스키마 (AI 컴포저 출력 1차 검증; 슬롯 데이터는 변형별로 2차 검증). */
export const pageSpecSchema = z.object({
  meta: z.object({
    product: z.string().min(1),
    category: z.string().min(1),
    styleDirection: z.string().optional(),
  }),
  tokens: z.object({
    bg: cssToken,
    paper: cssToken,
    ink: cssToken,
    ink2: cssToken,
    muted: cssToken,
    accent: cssToken,
    accentDark: cssToken,
    brand: cssToken,
    line: cssToken,
    fontDisplay: cssToken,
    fontBody: cssToken,
    fontSerif: cssToken,
    fontHand: cssToken,
  }),
  width: z.number().optional(),
  blocks: z.array(z.object({ variantId: z.string().min(1), data: z.unknown() })).min(1),
})
