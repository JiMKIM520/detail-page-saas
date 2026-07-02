/** POINT 아키타입: point-radar-web.
 *  [끝판왕] 포인트 구성 #21 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 밝은 배경 + 2행 헤드라인(브랜드명/제품명) + 6축 육각 레이더 차트(spider web) 중앙에
 *  제품 이미지 오버레이 + 하단 pill-badge 헤드라인 + 점선 분리 callout 리스트. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media, attr } from '../shared'

const schema = z.object({
  /** 브랜드명 한 줄 (--ink 색) */
  brand: z.string().min(1),
  /** 제품명 한 줄 (em 허용 — accent 강조) */
  title: z.string().min(1),
  /** 레이더 6축 레이블 (시계방향 12시부터, 정확히 6개) */
  axes: z.array(z.string().min(1)).length(6),
  /** 제품 이미지 URL (레이더 중앙 오버레이) */
  image: z.string().optional(),
  /** 이미지 alt */
  imageAlt: z.string().optional(),
  /** 하단 callout 박스 헤드라인 (pill 배지, em 허용) */
  calloutHeading: z.string().min(1),
  /** 하단 callout 설명 행 (2~4개, em/br 허용) */
  calloutItems: z.array(z.string().min(1)).min(2).max(4),
})
type Data = z.infer<typeof schema>

/** 6각형 꼭짓점 좌표 계산 (cx, cy: 중심, r: 반지름, startAngle: 라디안).
 *  SVG 좌표계(y 아래 증가). 12시 방향 = -π/2 */
function hexPoints(cx: number, cy: number, r: number): Array<{ x: number; y: number }> {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
  })
}

function pts(points: Array<{ x: number; y: number }>): string {
  return points.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ')
}

/** SVG 레이더 차트 생성.
 *  - 외곽 3중 육각 그리드(회색 선)
 *  - 6축 라인(회색)
 *  - 채워진 데이터 육각형(accent 반투명 fill + accent stroke) — 고정 80% 비율 플레이스홀더
 *  - 6 꼭짓점 원형 닷(accent)
 *  - 6 축 레이블 텍스트(accent)
 */
function buildRadarSvg(axes: string[]): string {
  const W = 560
  const H = 480
  const cx = W / 2
  const cy = H / 2
  const R = 190 // 외곽 반지름
  const gridLevels = [0.33, 0.66, 1.0]
  // 데이터 비율 — 플레이스홀더 (axis별 고정값, 실제 데이터 없음)
  const dataRatios = [0.88, 0.82, 0.75, 0.9, 0.78, 0.85]

  const outerPts = hexPoints(cx, cy, R)
  const dataPts = hexPoints(cx, cy, R).map((p, i) => ({
    x: cx + (p.x - cx) * dataRatios[i],
    y: cy + (p.y - cy) * dataRatios[i],
  }))

  // 그리드 육각형들 (회색)
  const gridHexes = gridLevels
    .map((ratio) => {
      const gp = hexPoints(cx, cy, R * ratio)
      return `<polygon points="${pts(gp)}" fill="none" stroke="#CCCCCC" stroke-width="1" stroke-dasharray="none"/>`
    })
    .join('\n  ')

  // 6축 라인 (중심 → 꼭짓점, 회색)
  const axisLines = outerPts
    .map((p) => `<line x1="${cx}" y1="${cy}" x2="${p.x.toFixed(2)}" y2="${p.y.toFixed(2)}" stroke="#CCCCCC" stroke-width="1"/>`)
    .join('\n  ')

  // 데이터 채움 다각형 (accent 반투명)
  const dataPolygon = `<polygon points="${pts(dataPts)}" fill="rgba(255,140,0,0.15)" stroke="#FF8C00" stroke-width="2.5" stroke-linejoin="round"/>`

  // 꼭짓점 닷 (accent 원)
  const dots = outerPts
    .map((p) => `<circle cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="5.5" fill="#FF8C00"/>`)
    .join('\n  ')

  // 레이블 위치 — 꼭짓점 바깥쪽 offset
  const LABEL_OFFSET = 28
  const labelOffset = (p: { x: number; y: number }) => {
    const dx = p.x - cx
    const dy = p.y - cy
    const len = Math.sqrt(dx * dx + dy * dy)
    return { x: p.x + (dx / len) * LABEL_OFFSET, y: p.y + (dy / len) * LABEL_OFFSET }
  }

  const labels = outerPts
    .map((p, i) => {
      const lp = labelOffset(p)
      // 텍스트 앵커: 왼쪽 꼭짓점(3,4)은 end, 오른쪽(1,2)은 start, 상하(0,5)는 middle
      const anchor = i === 0 || i === 3 ? 'middle' : i === 1 || i === 2 ? 'start' : 'end'
      // 수직 정렬: 위쪽(0)은 hanging 조정
      const dy = i === 0 ? '-4' : i === 3 ? '14' : '5'
      const safeLabel = (axes[i] ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      return `<text x="${lp.x.toFixed(2)}" y="${lp.y.toFixed(2)}" dy="${dy}" text-anchor="${anchor}" font-family="'Pretendard','Apple SD Gothic Neo',sans-serif" font-size="13" font-weight="600" fill="#FF8C00">${safeLabel}</text>`
    })
    .join('\n  ')

  return `<svg class="prw-radar-svg" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  ${gridHexes}
  ${axisLines}
  ${dataPolygon}
  ${dots}
  ${labels}
</svg>`
}

export const pointRadarWeb = defineBlock<Data>({
  id: 'point-radar-web',
  archetype: 'point',
  styleTags: ['light', 'performance', 'beauty', 'ingredient', 'radar', 'template'],
  imageSlots: 1,
  describe:
    '포인트 레이더 차트. 밝은 배경 + 브랜드/제품명 2행 헤드라인 + 6축 육각 레이더 차트(spider web) 중앙에 제품 이미지 오버레이 + 하단 pill-badge 헤드라인 + 점선 분리 callout 리스트. 성분/속성 균형 시각화 퍼포먼스 다이어그램 패턴. 뷰티/식품 카테고리 적합.',
  schema,
  css: `
/* point-radar-web — 접두사 prw- */
.prw{background:var(--bg);padding:52px 40px 56px;text-align:center;word-break:keep-all}
/* 헤드라인 영역 */
.prw-brand{font-family:var(--font-display);font-weight:800;font-size:clamp(22px,5vw,30px);color:var(--ink);line-height:1.2;letter-spacing:-.01em}
.prw-title{font-family:var(--font-display);font-weight:800;font-size:clamp(26px,6.5vw,40px);color:var(--accent-d);line-height:1.2;letter-spacing:-.02em;margin-top:4px}
.prw-title .em{color:var(--accent)}
/* 레이더 래퍼 — 이미지+SVG 중첩 */
.prw-radar{position:relative;width:100%;max-width:520px;margin:32px auto 0}
.prw-radar-svg{width:100%;height:auto;display:block}
/* 제품 이미지 — 레이더 중앙 오버레이 */
.prw-img-wrap{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:38%;pointer-events:none}
.prw-img{width:100%;height:auto;object-fit:contain;display:block}
.prw-img.ph{width:100%;aspect-ratio:2/3;border:2px dashed var(--line);background:rgba(0,0,0,.04);color:var(--muted);border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:12px}
/* callout 박스 */
.prw-callout{margin-top:36px;border:2px solid var(--accent-d);border-radius:12px;padding:0 0 8px;overflow:hidden;text-align:center}
/* pill 배지 헤드라인 */
.prw-pill-row{display:flex;justify-content:center;margin-top:-1px}
.prw-pill{display:inline-block;border:2px solid var(--accent-d);border-radius:999px;padding:9px 24px;background:var(--bg);font-family:var(--font-display);font-weight:800;font-size:clamp(13px,3.2vw,16px);color:var(--accent-d);letter-spacing:-.01em;margin-top:-17px}
.prw-pill .em{color:var(--accent)}
/* callout 아이템 리스트 */
.prw-items{padding:18px 24px 8px;display:flex;flex-direction:column;gap:0}
.prw-item{padding:16px 8px;font-family:var(--font-body);font-size:clamp(13px,3vw,15px);color:var(--ink);line-height:1.65;text-align:center}
.prw-item .em{color:var(--accent-d);font-weight:700}
.prw-item+.prw-item{border-top:1.5px dashed var(--line)}
`,
  render: (d, { esc, richSafe }) => {
    const radarSvg = buildRadarSvg(d.axes)

    const imgWrap = `
    <div class="prw-img-wrap">
      ${media(d.image, 'prw-img', esc(d.imageAlt ?? '제품 이미지'))}
    </div>`

    const calloutItems = d.calloutItems
      .map((item) => `<div class="prw-item">${richSafe(item)}</div>`)
      .join('')

    return `
<section class="prw">
  <p class="prw-brand">${esc(d.brand)}</p>
  <h2 class="prw-title">${richSafe(d.title)}</h2>
  <div class="prw-radar" role="img" aria-label="${attr(d.axes.join(', '))} 성분 레이더 차트">
    ${radarSvg}
    ${imgWrap}
  </div>
  <div class="prw-callout">
    <div class="prw-pill-row">
      <div class="prw-pill">${richSafe(d.calloutHeading)}</div>
    </div>
    <div class="prw-items">
      ${calloutItems}
    </div>
  </div>
</section>`
  },
})
