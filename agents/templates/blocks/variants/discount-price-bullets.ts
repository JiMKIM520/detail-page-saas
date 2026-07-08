/** DISCOUNT 아키타입(템플릿 충실 재현): discount-price-bullets.
 *  와디즈 200섹션 15_할인_1284:2295 패턴을 토큰 기반으로 재구성(클론 아님).
 *  다크 포토 BG + eyebrow pill + 2줄 헤드라인 + 정가취소선 카드→쿠폰 티켓 가격비교 행 +
 *  3개 pill 혜택 bullet 행 + 날짜 풋노트.
 *  세일 레드(#E02020)는 커머스 신호색 → 시맨틱 하드코딩. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  bgImage: z.string().optional(),              // 배경 포토 URL (없으면 다크 그라데이션)
  eyebrow: z.string().min(1).optional(),       // 상단 pill 라벨  예: "신규회원 전용"
  headlineSub: z.string().min(1).optional(),   // 헤드라인 1행 (소자 흰 텍스트)  예: "웰컴 혜택"
  headline: z.string().min(1),                 // 헤드라인 2행 대형 (em,br)      예: "AI 실무 챌린지"
  originalPrice: z.string().min(1).optional(), // 정가 취소선  예: "79,000원"
  originalLabel: z.string().min(1).optional(), // 정가 카드 라벨  예: "정가"
  salePrice: z.string().min(1),                // 특가/쿠폰가     예: "39,000원"
  saleLabel: z.string().min(1).optional(),     // 특가 라벨       예: "얼리버드"
  bullets: z
    .array(z.string().min(1))
    .min(2)
    .max(4),                                   // 혜택 bullet 문구 (em,br 허용)
  period: z.string().min(1).optional(),        // 날짜/기간 풋노트  예: "2026.06.23~06.30"
})
type Data = z.infer<typeof schema>

export const discountPriceBullets = defineBlock<Data>({
  id: 'discount-price-bullets',
  archetype: 'discount',
  styleTags: ['premium', 'dark', 'template', 'coupon', 'sale'],
  imageSlots: 1,
  describe:
    '가격비교 쿠폰 + 3 pill 혜택 행. 다크 포토 BG + eyebrow pill + 2줄 헤드라인 + 정가취소선 카드→쿠폰 티켓 가격비교 행 + 최대 4개 bullet 혜택 행 + 날짜 풋노트. 신규·얼리버드 가격 소구형.',
  schema,
  css: `
/* ── 래퍼 ── */
.dpb{position:relative;overflow:hidden;min-height:460px;background:var(--brand)}
.dpb-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;z-index:0}
.dpb-bg.ph{border:none;background:transparent}
.dpb-overlay{position:absolute;inset:0;z-index:1;background:linear-gradient(170deg,rgba(8,6,48,.62) 0%,rgba(12,8,60,.48) 45%,rgba(8,6,48,.78) 100%)}
.dpb-inner{position:relative;z-index:2;padding:52px 40px 0}

/* ── eyebrow pill ── */
.dpb-eyebrow-wrap{margin-bottom:20px}
.dpb-eyebrow{display:inline-block;border:1.5px solid rgba(255,255,255,.55);border-radius:999px;padding:6px 18px;font-size:15px;font-weight:600;color:#fff;letter-spacing:.02em;font-family:var(--font-body)}

/* ── 헤드라인 ── */
.dpb-sub{font-family:var(--font-display);font-weight:700;font-size:26px;color:rgba(255,255,255,.88);line-height:1.2;margin-bottom:6px}
.dpb-headline{font-family:var(--font-display);font-weight:800;font-size:clamp(48px,10vw,82px);line-height:1.08;letter-spacing:-.03em;color:#fff;margin-bottom:36px}
.dpb-headline .em{color:var(--accent)}

/* ── 가격 비교 행 ── */
.dpb-price-row{display:flex;align-items:stretch;gap:12px;margin-bottom:28px}

/* 정가 카드 */
.dpb-orig-card{
  flex:1;
  background:rgba(255,255,255,.10);
  border:1px solid rgba(255,255,255,.18);
  border-radius:calc(var(--r-scale,1)*12px);
  padding:14px 18px;
  display:flex;flex-direction:column;justify-content:center;
  backdrop-filter:blur(4px);
}
.dpb-orig-lbl{font-size:14px;font-weight:500;color:rgba(255,255,255,.65);font-family:var(--font-body);letter-spacing:.02em;margin-bottom:4px}
.dpb-orig-price{font-family:'Paperlogy',var(--font-display),sans-serif;font-weight:700;font-size:clamp(22px,4vw,32px);color:rgba(255,255,255,.55);text-decoration:line-through;letter-spacing:-.02em;line-height:1}

/* 쿠폰 티켓 카드 */
.dpb-sale-card{
  flex:1.3;
  background:#fff;
  border-radius:calc(var(--r-scale,1)*12px);
  overflow:hidden;
  display:flex;flex-direction:column;justify-content:center;
  box-shadow:0 8px 28px rgba(0,0,0,.28);
  position:relative;
}
.dpb-sale-tab{
  position:absolute;top:0;left:0;right:0;height:6px;
  background:#E02020;
}
.dpb-sale-inner{padding:14px 20px 14px}
.dpb-sale-lbl{font-size:14px;font-weight:600;color:#E02020;font-family:var(--font-body);letter-spacing:.04em;margin-bottom:4px}
.dpb-sale-price{font-family:'Paperlogy',var(--font-display),sans-serif;font-weight:800;font-size:clamp(26px,5vw,40px);color:#1a1a1a;letter-spacing:-.025em;line-height:1}

/* ── 혜택 bullet 행 ── */
.dpb-bullets{display:flex;flex-direction:column;gap:10px;margin-bottom:0}
.dpb-bullet{
  display:flex;align-items:center;gap:14px;
  background:rgba(255,255,255,.08);
  border:1px solid rgba(255,255,255,.13);
  border-radius:calc(var(--r-scale,1)*10px);
  padding:16px 20px;
  backdrop-filter:blur(3px);
}
.dpb-dot{
  flex:0 0 8px;width:8px;height:8px;
  border-radius:50%;
  background:#fff;
  opacity:.7;
}
.dpb-btxt{font-size:15px;font-weight:500;color:#fff;font-family:var(--font-body);line-height:1.45;letter-spacing:-.01em}
.dpb-btxt .em{color:var(--accent);font-weight:700}

/* ── 날짜 풋노트 ── */
.dpb-footer{
  position:relative;z-index:2;
  text-align:center;
  padding:24px 40px 36px;
}
.dpb-period{font-size:14px;font-weight:400;color:rgba(255,255,255,.52);font-family:var(--font-body);letter-spacing:.04em}
`,
  render: (d, { esc, richSafe }) => {
    const hasBg = !!d.bgImage

    const bulletsHtml = d.bullets
      .map(
        (b) => `
  <div class="dpb-bullet">
    <span class="dpb-dot"></span>
    <span class="dpb-btxt">${richSafe(b)}</span>
  </div>`,
      )
      .join('')

    return `
<section class="dpb">
  ${hasBg
    ? media(d.bgImage, 'dpb-bg', '배경 이미지')
    : '<div class="dpb-bg" style="background:radial-gradient(ellipse at 40% 30%,#1a1480 0%,#0b0840 45%,#050328 100%)"></div>'}
  <div class="dpb-overlay"></div>
  <div class="dpb-inner">
    ${d.eyebrow ? `<div class="dpb-eyebrow-wrap"><span class="dpb-eyebrow">${esc(d.eyebrow)}</span></div>` : ''}
    ${d.headlineSub ? `<p class="dpb-sub">${esc(d.headlineSub)}</p>` : ''}
    <h2 class="dpb-headline">${richSafe(d.headline)}</h2>
    <div class="dpb-price-row">
      ${d.originalPrice ? `<div class="dpb-orig-card">
        <div class="dpb-orig-lbl">${esc(d.originalLabel ?? '정가')}</div>
        <div class="dpb-orig-price">${esc(d.originalPrice)}</div>
      </div>` : ''}
      <div class="dpb-sale-card">
        <div class="dpb-sale-tab"></div>
        <div class="dpb-sale-inner">
          <div class="dpb-sale-lbl">${esc(d.saleLabel ?? '특가')}</div>
          <div class="dpb-sale-price">${esc(d.salePrice)}</div>
        </div>
      </div>
    </div>
    <div class="dpb-bullets">
      ${bulletsHtml}
    </div>
  </div>
  <div class="dpb-footer">
    ${d.period ? `<p class="dpb-period">${esc(d.period)}</p>` : ''}
  </div>
</section>`
  },
})
