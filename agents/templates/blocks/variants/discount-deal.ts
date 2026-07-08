/** DISCOUNT 아키타입(템플릿 충실 재현): discount-deal.
 *  와디즈 200섹션 15_할인_07 패턴을 토큰 기반으로 재구성(클론 아님).
 *  밝은 배경 + 초대형 BIG SALE 헤드라인 + 블랙 pill 태그 배너 + 빨강 버스트 할인율 +
 *  황색 마감임박 뱃지 + 강조 문구 + 풀폭 빨강 CTA 바. 임팩트형 할인·특가 섹션.
 *  세일 레드(#E8002D)는 브랜드색이 아닌 커머스 보편 신호 → 회색처럼 시맨틱 하드코딩(토큰 무관 의도). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  saleLabel: z.string().min(1).optional(),        // 예: "BIG SALE!" (기본값)
  eyebrow: z.string().min(1).optional(),           // 소자 상단 알림 ("이미 신청하신 분들 죄송합니다..")
  headline: z.string().min(1),                     // 주 캐치카피 (em 허용) 예: "발표자료 제작 고민? <span class=\"em\">여기서만 반값!</span>"
  discountRate: z.string().min(1),                 // 숫자+기호 예: "50%"
  urgencyBadge: z.string().min(1).optional(),      // 황색 마감 뱃지 ("이벤트 마감 임박")
  subQuestion: z.string().min(1).optional(),       // CTA 위 질문 ("아직도 고민하고 있나요?")
  ctaText: z.string().min(1),                      // 빨강 CTA 바 텍스트
  originalPrice: z.string().min(1).optional(),     // 정가 (취소선, 예: "200,000원")
  salePrice: z.string().min(1).optional(),         // 특가 (예: "99,000원")
  period: z.string().min(1).optional(),            // 기간 ("~6.30(일)까지")
  bgImage: z.string().optional(),                  // 배경 이미지 URL (없으면 밝은 플레인)
  burstImage: z.string().optional(),               // 할인율 버스트 시각물 URL (없으면 CSS 버스트)
})
type Data = z.infer<typeof schema>

export const discountDeal = defineBlock<Data>({
  id: 'discount-deal',
  archetype: 'discount',
  styleTags: ['premium', 'template', 'impact', 'sale'],
  imageSlots: 2,
  describe:
    '임팩트형 할인/특가 섹션. 밝은 배경 + 초대형 BIG SALE 빨강 헤드라인 + 블랙 pill 태그 배너(캐치카피) + 대형 빨강 버스트 할인율 + 황색 마감임박 뱃지 + 강조 질문 + 풀폭 빨강 CTA 바. 긴급감·희소성 소구. 세일 레드는 시맨틱 고정색.',
  schema,
  css: `
.dd{position:relative;background:var(--paper);overflow:hidden;padding:0}
.dd-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.16;z-index:0;display:block}
.dd-bg.ph{border:none;background:transparent}
.dd-inner{position:relative;z-index:1}

/* ── 상단: BIG SALE 헤드라인 (시맨틱 세일 레드) ── */
.dd-head{padding:54px 48px 0;text-align:center}
.dd-sale{font-family:'Paperlogy',var(--font-display),sans-serif;font-weight:800;font-size:clamp(72px,14vw,132px);line-height:1.05;letter-spacing:-.025em;color:#E8002D;text-shadow:0 3px 14px rgba(232,0,45,.18)}

/* ── pill 태그 배너 그룹 ── */
.dd-tags{display:flex;flex-direction:column;align-items:center;gap:8px;padding:20px 48px 0}
.dd-tag{display:inline-flex;align-items:center;justify-content:center;background:#141414;border-radius:calc(var(--r-scale,1)*5px);padding:11px 24px;max-width:100%}
.dd-tag-eyebrow{font-size:16px;font-weight:400;color:rgba(255,255,255,.7);letter-spacing:-.02em;line-height:1.3;font-family:var(--font-body)}
.dd-tag-headline{font-size:clamp(20px,4.2vw,33px);font-weight:800;color:#fff;letter-spacing:-.02em;line-height:1.25;font-family:var(--font-body)}
.dd-tag-headline .em{color:#FF3B3B}

/* ── 할인율 버스트 비주얼 ── */
.dd-burst-wrap{position:relative;margin:30px auto 0;width:340px;height:340px}
.dd-burst-img{width:340px;height:340px;object-fit:contain;display:block}
.dd-burst-img.ph{border:none;background:transparent}
.dd-burst-css{
  width:340px;height:340px;
  background:radial-gradient(circle at 50% 44%, #FF3030 0%, #E8002D 56%, #B0001F 100%);
  filter:drop-shadow(0 12px 26px rgba(232,0,45,.32));
  clip-path:polygon(50% 0%,56% 16%,70% 8%,67% 24%,83% 22%,76% 36%,92% 40%,82% 52%,96% 60%,83% 66%,90% 80%,76% 80%,75% 96%,62% 88%,56% 100%,50% 86%,44% 100%,38% 88%,25% 96%,24% 80%,10% 80%,17% 66%,4% 60%,18% 52%,8% 40%,24% 36%,17% 22%,33% 24%,30% 8%,44% 16%);
  display:flex;align-items:center;justify-content:center
}
.dd-rate{font-family:'Cafe24 ClassicType',var(--font-display),sans-serif;font-size:clamp(72px,14vw,118px);font-weight:400;color:#fff;line-height:1;text-shadow:0 2px 10px rgba(0,0,0,.28);letter-spacing:-.02em}

/* ── 마감임박 황색 뱃지 (버스트 우상단) ── */
.dd-badge{position:absolute;top:18px;right:-10px;background:#FFC300;color:#1a1a1a;font-size:16px;font-weight:700;padding:8px 16px;border-radius:calc(var(--r-scale,1)*5px);box-shadow:0 5px 12px rgba(0,0,0,.18);white-space:nowrap;font-family:var(--font-body)}

/* ── 가격 영역 (옵션) ── */
.dd-price-row{display:flex;align-items:baseline;justify-content:center;gap:18px;padding:24px 48px 0;flex-wrap:wrap}
.dd-orig{font-size:21px;font-weight:400;color:var(--muted);text-decoration:line-through;font-family:var(--font-body)}
.dd-sale-price{font-family:'Paperlogy',var(--font-display),sans-serif;font-weight:800;font-size:40px;color:#E8002D;letter-spacing:-.02em}
.dd-period{font-size:14px;color:var(--muted);text-align:center;padding:10px 48px 0;font-family:var(--font-body)}

/* ── 하단 CTA 구간 ── */
.dd-sub-q{text-align:center;padding:34px 48px 18px;font-size:22px;font-weight:500;color:var(--ink-2);font-family:var(--font-body);letter-spacing:-.02em}
.dd-cta{display:flex;align-items:center;justify-content:center;background:#E8002D;padding:30px 48px;text-align:center}
.dd-cta-txt{font-family:'Paperlogy',var(--font-display),sans-serif;font-weight:800;font-size:clamp(28px,5.5vw,50px);color:#fff;line-height:1.2;letter-spacing:-.025em}
`,
  render: (d, { esc, richSafe }) => {
    const saleLabel = d.saleLabel ?? 'BIG SALE!'
    const hasBurst = !!d.burstImage
    const hasBg = !!d.bgImage

    const burstEl = hasBurst
      ? media(d.burstImage, 'dd-burst-img', '할인 버스트')
      : `<div class="dd-burst-css"><span class="dd-rate">${esc(d.discountRate)}</span></div>`

    const priceRow = (d.originalPrice || d.salePrice)
      ? `<div class="dd-price-row">
          ${d.originalPrice ? `<span class="dd-orig">${esc(d.originalPrice)}</span>` : ''}
          ${d.salePrice ? `<span class="dd-sale-price">${esc(d.salePrice)}</span>` : ''}
        </div>`
      : ''

    return `
<section class="dd">
  ${hasBg
    ? media(d.bgImage, 'dd-bg', '배경 이미지')
    : '<div class="dd-bg" style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 26%, rgba(232,0,45,.06) 0%, transparent 62%)"></div>'}
  <div class="dd-inner">
    <div class="dd-head">
      <h2 class="dd-sale">${esc(saleLabel)}</h2>
    </div>

    <div class="dd-tags">
      ${d.eyebrow ? `<div class="dd-tag"><span class="dd-tag-eyebrow">${esc(d.eyebrow)}</span></div>` : ''}
      <div class="dd-tag" style="align-self:stretch"><span class="dd-tag-headline">${richSafe(d.headline)}</span></div>
    </div>

    <div style="display:flex;justify-content:center;padding:0 48px">
      <div class="dd-burst-wrap">
        ${burstEl}
        ${d.urgencyBadge ? `<span class="dd-badge">${esc(d.urgencyBadge)}</span>` : ''}
      </div>
    </div>

    ${priceRow}
    ${d.period ? `<p class="dd-period">${esc(d.period)}</p>` : ''}

    ${d.subQuestion ? `<p class="dd-sub-q">${esc(d.subQuestion)}</p>` : ''}
    <div class="dd-cta">
      <span class="dd-cta-txt">${esc(d.ctaText)}</span>
    </div>
  </div>
</section>`
  },
})
