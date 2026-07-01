/** DISCOUNT 아키타입(템플릿 충실 재현): discount-coupon-grid.
 *  와디즈 200섹션 15_할인 299:564 패턴을 토큰 기반으로 재구성(클론 아님).
 *  상단 스크롤 티커 + 다크 그라데이션 배경 + 3D 일러스트 히어로(2장) +
 *  SALE 대형 헤드라인 + 서브카피 + 2쿠폰 카드 가로 그리드 + 마무리 CTA + 기간.
 *  세일 레드(#E02020)는 커머스 신호색 → 시맨틱 하드코딩. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  tickerText: z.string().min(1).optional(),          // 상단 반복 티커 문구  예: "SPECIAL SALE"
  heroImage1: z.string().optional(),                 // 3D 일러스트 이미지 1 (url)
  heroImage2: z.string().optional(),                 // 3D 일러스트 이미지 2 (url)
  headline: z.string().min(1),                       // 메인 헤드라인 (em,br)  예: "SURPRISE SALE!"
  subCopy: z.string().min(1).optional(),             // 서브카피  예: "절대 놓쳐서는 안되는 세일 혜택!"
  coupons: z
    .array(
      z.object({
        couponLabel: z.string().min(1).optional(),   // 쿠폰 상단 라벨  예: "Coupon"
        rate: z.string().min(1),                     // 할인율 문자열  예: "15%"
        target: z.string().min(1).optional(),        // 대상 라벨  예: "첫 구매 고객 대상"
      }),
    )
    .min(1)
    .max(2),
  closingCta: z.string().min(1).optional(),          // 마무리 CTA 문구 (em,br)  예: "지금 바로<br>혜택을 받으세요!"
  period: z.string().min(1).optional(),              // 이벤트 기간  예: "2026.06.23~06.30"
})
type Data = z.infer<typeof schema>

export const discountCouponGrid = defineBlock<Data>({
  id: 'discount-coupon-grid',
  archetype: 'discount' as any,
  styleTags: ['premium', 'dark', 'template', 'coupon', 'grid', 'playful'],
  imageSlots: 2,
  describe:
    '쿠폰 그리드형 할인 섹션. 상단 티커 배너 + 다크 그라데이션 배경 + 3D 일러스트 히어로(2장) + 대형 SALE 헤드라인 + 서브카피 + 2열 쿠폰 카드 그리드(라벨·대형 할인율·대상) + 마무리 CTA + 기간. 3D 일러스트 비주얼 강조형.',
  schema,
  css: `
/* ── 전체 래퍼 ── */
.dcg{background:linear-gradient(180deg,#0b0a2e 0%,#10103a 45%,#0f0f35 100%);color:#fff;overflow:hidden}

/* ── 상단 티커 배너 ── */
.dcg-ticker-wrap{
  background:linear-gradient(135deg,var(--brand) 0%,var(--accent) 40%,var(--accent-d) 70%,var(--brand) 100%);
  overflow:hidden;padding:10px 0;position:relative
}
.dcg-ticker{
  display:flex;align-items:center;gap:0;
  white-space:nowrap;
  animation:dcgTick 18s linear infinite
}
@keyframes dcgTick{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
.dcg-ticker-item{
  display:inline-flex;align-items:center;gap:10px;
  padding:0 28px;
  font-family:var(--font-display);font-weight:800;font-size:17px;letter-spacing:.12em;color:#fff;
  text-transform:uppercase
}
.dcg-ticker-sep{
  display:inline-block;width:14px;height:14px;flex-shrink:0;
  color:rgba(255,255,255,.9)
}
.dcg-ticker-sep svg{width:100%;height:100%;display:block}

/* ── 히어로 비주얼 영역 ── */
.dcg-hero{
  position:relative;display:flex;align-items:flex-end;justify-content:center;
  padding:40px 40px 0;gap:0;min-height:220px
}
.dcg-hero-diamond{
  position:absolute;left:50%;bottom:0;transform:translateX(-50%);
  width:320px;height:200px;
  background:linear-gradient(160deg,color-mix(in srgb,var(--brand) 55%,transparent) 0%,color-mix(in srgb,var(--brand) 35%,transparent) 50%,color-mix(in srgb,var(--brand) 20%,transparent) 100%);
  clip-path:polygon(50% 0%,100% 38%,78% 100%,22% 100%,0% 38%);
  filter:blur(2px)
}
.dcg-img1{
  position:relative;z-index:2;
  width:190px;height:190px;object-fit:contain;
  margin-right:-24px;transform:translateY(10px)
}
.dcg-img2{
  position:relative;z-index:1;
  width:168px;height:168px;object-fit:contain;
  transform:translateY(18px)
}

/* ── 텍스트 영역 ── */
.dcg-txt{padding:36px 44px 0;text-align:center}
.dcg-headline{
  font-family:var(--font-display);font-weight:800;
  font-size:clamp(54px,10vw,86px);letter-spacing:-.02em;line-height:1.08;
  color:#fff;text-transform:uppercase
}
.dcg-headline .em{color:var(--accent)}
.dcg-sub{
  margin-top:14px;font-size:17px;font-weight:400;
  color:rgba(255,255,255,.72);line-height:1.6;letter-spacing:-.01em;
  font-family:var(--font-body)
}

/* ── 쿠폰 카드 그리드 ── */
.dcg-grid{
  display:grid;grid-template-columns:1fr 1fr;gap:16px;
  padding:28px 32px 0;
}
.dcg-card{
  background:color-mix(in srgb,var(--accent) 18%,rgba(200,210,255,.18) 82%);
  border:1.5px solid rgba(180,190,255,.28);
  border-radius:18px;
  padding:22px 16px 18px;
  text-align:center;
  display:flex;flex-direction:column;align-items:center;gap:0;
  backdrop-filter:blur(6px)
}
.dcg-clabel{
  font-size:14px;font-weight:500;letter-spacing:.08em;
  color:rgba(255,255,255,.75);font-family:var(--font-body);
  margin-bottom:4px;text-transform:uppercase
}
.dcg-rate{
  font-family:'Cafe24 ClassicType',var(--font-display),sans-serif;
  font-size:clamp(52px,9vw,72px);font-weight:400;
  color:#fff;line-height:1;letter-spacing:-.02em
}
.dcg-divider{
  width:80%;height:1px;
  background:rgba(255,255,255,.22);
  margin:14px auto 12px
}
.dcg-target{
  font-size:14px;font-weight:500;
  color:rgba(255,255,255,.78);letter-spacing:-.01em;
  font-family:var(--font-body);line-height:1.4
}

/* ── 마무리 CTA ── */
.dcg-closing{
  padding:44px 44px 14px;text-align:center;
  font-family:var(--font-display);font-weight:800;
  font-size:clamp(38px,7vw,60px);line-height:1.25;letter-spacing:-.025em;
  color:#fff
}
.dcg-closing .em{color:var(--accent)}

/* ── 기간 풋노트 ── */
.dcg-period{
  text-align:center;padding:0 44px 52px;
  font-size:16px;font-weight:400;
  color:rgba(255,255,255,.55);letter-spacing:.02em;
  font-family:var(--font-body)
}
`,
  render: (d, { esc, richSafe }) => {
    /* lightning bolt SVG for ticker */
    const boltSvg = `<span class="dcg-ticker-sep"><svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 1L3 8h4.5L5 13l7-8H8z" fill="#FFD700"/></svg></span>`

    /* build enough ticker items to fill >200% width for seamless loop */
    const tickerLabel = d.tickerText ?? 'SPECIAL SALE'
    const tickerItem = `<span class="dcg-ticker-item">${esc(tickerLabel)}</span>${boltSvg}`
    const tickerRepeated = tickerItem.repeat(12)

    const heroHtml = `
  <div class="dcg-hero">
    <div class="dcg-hero-diamond"></div>
    ${media(d.heroImage1, 'dcg-img1', '3D 일러스트 1')}
    ${media(d.heroImage2, 'dcg-img2', '3D 일러스트 2')}
  </div>`

    const cardsHtml = d.coupons
      .map(
        (c) => `
    <div class="dcg-card">
      <div class="dcg-clabel">${esc(c.couponLabel ?? 'Coupon')}</div>
      <div class="dcg-rate">${esc(c.rate)}</div>
      ${c.target ? `<div class="dcg-divider"></div><div class="dcg-target">${esc(c.target)}</div>` : ''}
    </div>`,
      )
      .join('')

    return `
<section class="dcg">
  <div class="dcg-ticker-wrap">
    <div class="dcg-ticker">${tickerRepeated}</div>
  </div>
  ${heroHtml}
  <div class="dcg-txt">
    <h2 class="dcg-headline">${richSafe(d.headline)}</h2>
    ${d.subCopy ? `<p class="dcg-sub">${esc(d.subCopy)}</p>` : ''}
  </div>
  <div class="dcg-grid">
    ${cardsHtml}
  </div>
  ${d.closingCta ? `<div class="dcg-closing">${richSafe(d.closingCta)}</div>` : ''}
  ${d.period ? `<p class="dcg-period">${esc(d.period)}</p>` : ''}
</section>`
  },
})
