/** REASON 아키타입: reason-bubble-badge-stack
 *  어두운 주황-갈색 배경 + 대형 제품명 헤드라인 +
 *  말풍선 꼬리가 달린 둥근 직사각 카드 수직 스택.
 *  홀수 카드 = 오렌지 원형 배지 왼쪽 / 꼬리 오른쪽,
 *  짝수 카드 = 배지 오른쪽 / 꼬리 왼쪽 (좌우 교차). */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  headline: z.string().min(1),  // 대형 제품명 헤드라인 (em,br)
  items: z
    .array(
      z.object({
        badge: z.string().min(1),  // 원형 배지 안 짧은 레이블 (아이콘 대체 가능, 순수 텍스트)
        text:  z.string().min(1),  // 말풍선 카드 본문 (em,br)
      }),
    )
    .min(2)
    .max(6),
})
type Data = z.infer<typeof schema>

export const reasonBubbleBadgeStack = defineBlock<Data>({
  id: 'reason-bubble-badge-stack',
  archetype: 'reason',
  styleTags: ['dark', 'warm', 'bubble', 'badge', 'stack'],
  imageSlots: 0,
  describe:
    '어두운 주황-갈색 배경. 상단 대형 제품명 헤드라인(화이트). 아래로 2~6개 말풍선 카드 수직 스택: 각 카드는 흰 둥근직사각+오른쪽(또는 왼쪽) 꼬리 SVG + 오렌지 원형 배지가 좌우 교차 배치. 강점 나열 레이아웃.',
  schema,
  css: `
.rhdz{background:var(--brand,#472600);color:var(--ink,#1a1a1a);padding:56px var(--pad-x,56px) 64px}
.rhdz .em{color:var(--em-dark,#FFF7EA)}
.rhdz-hl{font-family:var(--font-display);font-weight:800;font-size:clamp(48px,8vw,80px);color:#fff;line-height:1.1;margin-bottom:40px}
.rhdz-hl .em{color:var(--em-dark,#FFF7EA)}
.rhdz-stack{display:flex;flex-direction:column;gap:20px;overflow:hidden}
.rhdz-row{display:flex;align-items:center;position:relative;padding:0 8px}
/* 홀수(0-indexed): 배지 왼쪽 / 꼬리 오른쪽 */
.rhdz-row.odd{flex-direction:row}
/* 짝수(0-indexed): 배지 오른쪽 / 꼬리 왼쪽 */
.rhdz-row.even{flex-direction:row-reverse}
/* 말풍선 카드 */
.rhdz-bubble{position:relative;flex:1;background:#fff;border-radius:calc(var(--r-scale,1)*92px);padding:26px 32px 26px 52px;min-height:80px;display:flex;align-items:center}
.rhdz-row.even .rhdz-bubble{padding:26px 52px 26px 32px}
/* 꼬리 SVG — 오른쪽(홀수) */
.rhdz-tail-r{position:absolute;right:-28px;top:50%;transform:translateY(-50%);width:32px;height:52px;flex-shrink:0}
/* 꼬리 SVG — 왼쪽(짝수) */
.rhdz-tail-l{position:absolute;left:-28px;top:50%;transform:translateY(-50%) scaleX(-1);width:32px;height:52px;flex-shrink:0}
/* 텍스트 */
.rhdz-text{font-family:var(--font-body);font-size:clamp(15px,1.8vw,20px);font-weight:500;color:#000;line-height:1.6}
.rhdz-text .em{color:var(--accent,#ff9920);font-weight:700}
/* 오렌지 원형 배지 */
.rhdz-badge{flex-shrink:0;width:80px;height:80px;border-radius:50%;background:var(--accent,#ff9920);display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:800;font-size:13px;color:#fff;text-align:center;line-height:1.25;letter-spacing:-.01em;padding:6px;z-index:1}
/* 홀수: 배지가 말풍선 왼쪽에 살짝 겹침 */
.rhdz-row.odd .rhdz-badge{margin-right:-16px}
/* 짝수: 배지가 말풍선 오른쪽에 살짝 겹침 */
.rhdz-row.even .rhdz-badge{margin-left:-16px}
`,
  render: (d, { esc, richSafe }) => {
    const tailSvg = `<svg viewBox="0 0 44 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M0 0 Q44 30 0 60 Z" fill="#fff"/></svg>`

    const rows = d.items
      .map((item, i) => {
        const isOdd = i % 2 === 0  // 0-indexed: 첫 번째(i=0)가 홀수형(배지 왼쪽)
        const rowClass = isOdd ? 'odd' : 'even'
        const tailClass = isOdd ? 'rhdz-tail-r' : 'rhdz-tail-l'
        return `
  <div class="rhdz-row ${rowClass}" role="listitem">
    <div class="rhdz-badge" aria-label="강점 배지">${esc(item.badge)}</div>
    <div class="rhdz-bubble">
      <div class="${tailClass}" aria-hidden="true">${tailSvg}</div>
      <p class="rhdz-text">${richSafe(item.text)}</p>
    </div>
  </div>`
      })
      .join('')

    return `
<section class="rhdz">
  <h2 class="rhdz-hl">${richSafe(d.headline)}</h2>
  <div class="rhdz-stack" role="list">
    ${rows}
  </div>
</section>`
  },
})
