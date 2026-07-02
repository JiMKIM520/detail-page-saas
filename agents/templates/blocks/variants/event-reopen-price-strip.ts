/** EVENT 아키타입(템플릿 충실 재현): event-reopen-price-strip.
 *  와디즈 200섹션 "13_이벤트" _1284:2401 패턴을 토큰 기반으로 재구성(클론 아님).
 *  UI 이미지 + 재오픈 헤드라인 + 말풍선 후기 리스트 + 한정 리본 + 정가→할인가 스트립. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  eyebrow: z.string().min(1).optional(),        // 아이브로 문구 (예: "직장인 수강생 폭주!")
  title: z.string().min(1),                      // 재오픈 헤드라인 (em,br 허용)
  image: z.string().optional(),                  // UI/디바이스 목업 이미지 url
  bubbles: z
    .array(z.object({ text: z.string().min(1) })) // 말풍선 후기 문구 (em,br 허용)
    .min(2)
    .max(4),
  ribbonLabel: z.string().min(1).optional(),     // 한정 리본 문구 (예: "리뷰 이벤트 한정")
  productName: z.string().min(1).optional(),     // 가격 스트립 상품명
  originalPrice: z.string().min(1).optional(),   // 정가 (예: "1,000,000원")
  salePrice: z.string().min(1),                  // 할인가 (예: "500,000원")
})
type Data = z.infer<typeof schema>

export const eventReopenPriceStrip = defineBlock<Data>({
  id: 'event-reopen-price-strip',
  archetype: 'event',
  styleTags: ['premium', 'template', 'light', 'reopen', 'promo', 'price'],
  imageSlots: 1,
  describe:
    '재오픈 이벤트(라이트 그라데이션). 아이브로 + 대형 재오픈 헤드라인 + UI 디바이스 목업 + 말풍선 후기 리스트 + 모서리 한정 리본 태그 + 정가→할인가 가격 스트립. 강의·SaaS·재오픈 이벤트 섹션에 최적.',
  schema,
  css: `
.erps{
  background:linear-gradient(160deg,color-mix(in srgb,var(--accent) 18%,#fff) 0%,color-mix(in srgb,var(--accent) 8%,#fff) 55%,color-mix(in srgb,var(--brand) 6%,#fff) 100%);
  color:var(--ink);
  overflow:hidden;
  position:relative;
  padding:52px 0 0;
}

/* eyebrow */
.erps-eyebrow{
  text-align:center;
  font-size:15px;
  font-weight:600;
  color:var(--ink-2);
  letter-spacing:.04em;
  margin-bottom:12px;
}

/* headline */
.erps-title{
  text-align:center;
  font-family:var(--font-display);
  font-weight:900;
  font-size:62px;
  line-height:1.1;
  letter-spacing:-.03em;
  color:var(--ink);
  padding:0 40px;
}
.erps-title .em{color:var(--accent)}

/* device image area */
.erps-img-wrap{
  position:relative;
  display:flex;
  justify-content:center;
  margin:36px 40px 0;
}
.erps-img{
  width:100%;
  max-width:580px;
  height:auto;
  min-height:320px;
  border-radius:20px;
  object-fit:cover;
  display:block;
}

/* speech bubbles */
.erps-bubbles{
  display:flex;
  flex-direction:column;
  gap:12px;
  padding:0 40px;
  margin-top:24px;
}
.erps-bubble{
  display:inline-block;
  align-self:flex-start;
  background:#fff;
  border:1.5px solid color-mix(in srgb,var(--accent) 28%,transparent);
  border-radius:999px;
  padding:10px 22px;
  font-size:15px;
  font-weight:500;
  color:var(--ink);
  line-height:1.45;
  box-shadow:0 2px 10px rgba(0,0,0,.06);
  position:relative;
}
.erps-bubble:nth-child(even){align-self:flex-end}
.erps-bubble .em{color:var(--accent);font-weight:700}

/* limited ribbon tag */
.erps-ribbon-wrap{
  padding:28px 40px 0;
}
.erps-ribbon{
  display:inline-flex;
  align-items:center;
  gap:8px;
  background:color-mix(in srgb,var(--accent) 14%,transparent);
  border:1.5px solid color-mix(in srgb,var(--accent) 40%,transparent);
  border-radius:8px;
  padding:8px 18px;
  font-size:14px;
  font-weight:700;
  color:var(--accent);
  letter-spacing:.04em;
}
.erps-ribbon::before{
  content:'';
  display:inline-block;
  width:8px;
  height:8px;
  border-radius:50%;
  background:var(--accent);
  flex-shrink:0;
}

/* price strip */
.erps-strip{
  margin-top:20px;
  background:var(--ink);
  color:#fff;
  padding:22px 40px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:16px;
  flex-wrap:wrap;
}
.erps-product{
  font-size:14px;
  font-weight:500;
  color:rgba(255,255,255,.65);
  flex:1 1 auto;
  min-width:0;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}
.erps-prices{
  display:flex;
  align-items:center;
  gap:18px;
  flex-shrink:0;
}
.erps-original{
  font-size:16px;
  font-weight:500;
  color:rgba(255,255,255,.4);
  text-decoration:line-through;
  text-decoration-color:rgba(255,255,255,.35);
}
.erps-sale{
  font-family:var(--font-display);
  font-weight:900;
  font-size:38px;
  color:#fff;
  letter-spacing:-.02em;
  line-height:1;
}
`,
  render: (d, { esc, richSafe }) => `
<section class="erps">
  ${d.eyebrow ? `<p class="erps-eyebrow">${esc(d.eyebrow)}</p>` : ''}

  <h2 class="erps-title">${richSafe(d.title)}</h2>

  <div class="erps-img-wrap">
    ${media(d.image, 'erps-img', 'UI 디바이스 목업')}
  </div>

  <div class="erps-bubbles">
    ${d.bubbles.map((b) => `<div class="erps-bubble">${richSafe(b.text)}</div>`).join('\n    ')}
  </div>

  ${d.ribbonLabel ? `<div class="erps-ribbon-wrap"><span class="erps-ribbon">${esc(d.ribbonLabel)}</span></div>` : ''}

  <div class="erps-strip">
    ${d.productName ? `<span class="erps-product">${esc(d.productName)}</span>` : '<span></span>'}
    <div class="erps-prices">
      ${d.originalPrice ? `<span class="erps-original">${esc(d.originalPrice)}</span>` : ''}
      <span class="erps-sale">${esc(d.salePrice)}</span>
    </div>
  </div>
</section>`,
})
