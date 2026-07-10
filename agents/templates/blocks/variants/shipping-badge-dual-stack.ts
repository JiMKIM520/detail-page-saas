/** SHIPPING 아키타입: shipping-badge-dual-stack.
 *  피그마 113_배송교환반품_01 흡수.
 *  원형 badge 아이콘 + 컬러 섹션명 + 흰 라운드 카드 텍스트를
 *  배송안내 / 교환반품 2섹션 수직 스택으로 재구성. 872px 데스크톱. */
import { z } from 'zod'
import { defineBlock } from '../types'

const sectionSchema = z.object({
  heading: z.string().min(1),          // 섹션명 (em 허용)
  body: z.string().min(1),             // 본문 (em,br 허용)
  icon: z.enum([
    'truck', 'box', 'shield', 'gift', 'calendar', 'clock',
    'check', 'bell', 'card', 'won', 'store', 'gear',
  ]).optional(),                        // 원형 badge 아이콘 (없으면 기본: 배송=truck, 교환=box)
})

const schema = z.object({
  overline: z.string().optional(),     // 상단 라벨(예: "DELIVERY & RETURN")
  delivery: sectionSchema,             // 배송안내 섹션
  returns: sectionSchema,              // 교환·반품안내 섹션
  accentOverride: z.string().optional(), // 원형 badge 배경색 직접 지정(옵션, CSS 색값)
})
type Data = z.infer<typeof schema>

export const shippingBadgeDualStack = defineBlock<Data>({
  id: 'shipping-badge-dual-stack',
  archetype: 'shipping',
  styleTags: ['light', 'mixed', 'clean', 'ecommerce'],
  imageSlots: 0,
  describe:
    '배송안내 + 교환반품 2섹션 수직 스택. 각 섹션: 원형 accent badge 아이콘 + 컬러 섹션명(중앙) + 흰 라운드 카드 본문. 원본 113_배송교환반품_01 재구성.',
  schema,
  css: `
.smau{background:var(--bg);padding:56px var(--pad-x,56px) 64px}
.smau-over{text-align:center;font-family:var(--font-lat);font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:var(--muted);margin-bottom:40px}
.smau-stack{display:flex;flex-direction:column;gap:40px}
.smau-sec{}
.smau-title-row{display:flex;flex-direction:column;align-items:center;gap:0;margin-bottom:20px}
.smau-badge{
  width:96px;height:96px;border-radius:50%;
  background:var(--accent);
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 8px 24px -10px color-mix(in srgb,var(--accent) 60%,transparent);
  flex-shrink:0
}
.smau-badge svg{width:44px;height:44px;stroke:var(--bg);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.smau-sec-name{
  margin-top:16px;
  font-size:clamp(24px,3vw,34px);font-weight:700;
  color:var(--accent);text-align:center;
  font-family:var(--font-display);letter-spacing:-.01em
}
.smau-sec-name .em{color:var(--accent-d)}
.smau-card{
  background:var(--paper);
  border-radius:calc(var(--r-scale,1)*24px);
  padding:28px 32px;
  box-shadow:0 2px 12px -6px rgba(0,0,0,.1)
}
.smau-body{
  font-size:15px;line-height:1.85;color:var(--ink-2);
  white-space:pre-line
}
.smau-body .em{color:var(--accent-d);font-weight:700}
.smau-div{
  height:1px;background:var(--line);
  margin:0 0 40px
}
`,
  render: (d, { esc, richSafe, icon }) => {
    const deliveryIcon = d.delivery.icon ?? 'truck'
    const returnsIcon  = d.returns.icon  ?? 'box'

    const badgeStyle = d.accentOverride
      ? ` style="background:${esc(d.accentOverride)}"`
      : ''

    const section = (
      sec: typeof d.delivery,
      iconName: string,
    ) => `
  <div class="smau-sec">
    <div class="smau-title-row">
      <div class="smau-badge"${badgeStyle}>${icon(iconName)}</div>
      <p class="smau-sec-name">${richSafe(sec.heading)}</p>
    </div>
    <div class="smau-card">
      <div class="smau-body">${richSafe(sec.body)}</div>
    </div>
  </div>`

    return `
<section class="smau">
  ${d.overline ? `<p class="smau-over">${esc(d.overline)}</p>` : ''}
  <div class="smau-stack">
    ${section(d.delivery, deliveryIcon)}
    <div class="smau-div"></div>
    ${section(d.returns, returnsIcon)}
  </div>
</section>`
  },
})
