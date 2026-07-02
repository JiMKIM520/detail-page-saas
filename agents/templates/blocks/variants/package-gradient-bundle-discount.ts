/** PROMO 아키타입(템플릿 충실 재현): package-gradient-bundle-discount.
 *  [끝판왕] 상품 구성 #16 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 파스텔 그라디언트 배경 + 브랜드/기간 eyebrow 배지 +
 *  중앙 헤드라인 + 번들 제품 이미지(2~4개 묶음샷) +
 *  번호 불릿 구성품 리스트 + 하단 가로 할인 바(할인% | 취소선 정가 | 최종가). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 브랜드명 (좌측 eyebrow 배지) */
  brand: z.string().min(1),
  /** 기간 문자열 예: "25.06.10 ~ 25.08.20" */
  period: z.string().min(1).optional(),
  /** 섹션 대제목 (em 허용) */
  title: z.string().min(1),
  /** 헤드라인 아래 혜택 요약 pill 뱃지 */
  benefit: z.string().min(1).optional(),
  /** 번들 묶음 제품 이미지 URL */
  bundleImage: z.string().optional(),
  /** 구성품 리스트 (2~4개) */
  items: z
    .array(
      z.object({
        /** 제품명 또는 구성 항목 */
        name: z.string().min(1),
        /** 보너스/서비스 품목 (선택) */
        bonus: z.string().optional(),
      }),
    )
    .min(2)
    .max(4),
  /** 할인율 표시 예: "35%" */
  discountRate: z.string().min(1),
  /** 취소선 원가 예: "42,900원" */
  originalPrice: z.string().min(1),
  /** 최종 판매가 예: "10,900원" */
  salePrice: z.string().min(1),
})

type Data = z.infer<typeof schema>

export const packageGradientBundleDiscount = defineBlock<Data>({
  id: 'package-gradient-bundle-discount',
  archetype: 'promo',
  styleTags: ['pastel', 'gradient', 'bundle', 'discount', 'package', 'template'],
  imageSlots: 1,
  describe:
    '상품 구성 번들 할인. 파스텔(핑크) 그라디언트 배경 + 브랜드/기간 eyebrow 배지 + 중앙 대제목 + 혜택 pill 뱃지 + 번들 제품 이미지 + 번호 불릿 구성품 리스트 + 하단 가로 할인 바(할인% | 취소선 정가 | 최종가). 뷰티/식품 패키지 구성 섹션.',
  schema,
  css: `
/* package-gradient-bundle-discount — 접두사 pgbd- */
.pgbd{position:relative;overflow:hidden;padding:44px 32px 0;text-align:center;word-break:keep-all}
/* 파스텔 그라디언트 배경 — 밝은 배경이므로 토큰 오버레이로 구현, 흰색 하드코딩 허용(디자인 신호) */
.pgbd-bg{position:absolute;inset:0;z-index:0;background:linear-gradient(160deg,#ffe4ef 0%,#ffd6e8 40%,#fce0f0 70%,#fff0f7 100%)}
.pgbd-content{position:relative;z-index:1}

/* eyebrow 배지 행 */
.pgbd-eyebrow{display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:20px;flex-wrap:wrap}
.pgbd-brand{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.72);border:1.5px solid rgba(255,255,255,.9);border-radius:999px;padding:5px 14px 5px 10px;font-size:12px;font-weight:700;color:var(--ink);letter-spacing:.02em;backdrop-filter:blur(4px)}
.pgbd-brand-dot{width:7px;height:7px;border-radius:50%;background:var(--accent-d);flex-shrink:0}
.pgbd-period{font-size:12px;font-weight:600;color:var(--muted);letter-spacing:.02em}

/* 헤드라인 */
.pgbd-title{font-family:var(--font-display);font-weight:800;font-size:clamp(26px,6.5vw,38px);line-height:1.22;letter-spacing:-.02em;color:var(--ink);margin-bottom:12px}
.pgbd-title .em{color:var(--accent-d)}

/* 혜택 pill 뱃지 */
.pgbd-benefit{display:inline-block;background:var(--accent-d);color:#fff;font-size:13px;font-weight:700;border-radius:999px;padding:5px 16px;letter-spacing:.02em;margin-bottom:24px}

/* 번들 이미지 */
.pgbd-img{width:100%;max-width:380px;aspect-ratio:4/3;object-fit:contain;display:block;margin:0 auto 22px}
.pgbd-img.ph{width:100%;max-width:380px;aspect-ratio:4/3;border:2px dashed rgba(0,0,0,.12);background:rgba(255,255,255,.45);color:var(--muted);border-radius:12px;margin:0 auto 22px}

/* 구성품 리스트 */
.pgbd-list{list-style:none;display:flex;flex-direction:column;gap:10px;margin-bottom:28px;text-align:left}
.pgbd-li{display:flex;align-items:flex-start;gap:10px;background:rgba(255,255,255,.6);border-radius:10px;padding:10px 14px;backdrop-filter:blur(2px)}
.pgbd-num{flex-shrink:0;width:22px;height:22px;border-radius:50%;background:var(--accent-d);color:#fff;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;margin-top:1px}
.pgbd-li-texts{display:flex;flex-direction:column;gap:2px}
.pgbd-li-name{font-family:var(--font-body);font-weight:700;font-size:14px;color:var(--ink);line-height:1.4}
.pgbd-li-bonus{font-size:12px;color:var(--muted);display:flex;align-items:center;gap:4px;line-height:1.4}
.pgbd-check{display:inline-block;width:13px;height:13px;flex-shrink:0;color:var(--accent-d)}

/* 할인 바 */
.pgbd-bar{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:0;background:var(--ink);border-radius:0;margin:0 -32px;padding:16px 28px}
.pgbd-discount{font-family:var(--font-display);font-weight:900;font-size:clamp(28px,7vw,40px);line-height:1;color:#fff;letter-spacing:-.02em}
.pgbd-discount-pct{color:#FFD700}
.pgbd-prices{display:flex;flex-direction:column;align-items:center;gap:2px;padding:0 12px}
.pgbd-original{font-size:13px;color:rgba(255,255,255,.52);text-decoration:line-through;font-weight:500}
.pgbd-sale{font-family:var(--font-display);font-weight:900;font-size:clamp(20px,5vw,28px);color:#fff;letter-spacing:-.02em;line-height:1.1}
`,
  render: (d, { esc, richSafe }) => {
    const items = d.items
      .map(
        (it, i) => `
      <li class="pgbd-li">
        <span class="pgbd-num">${i + 1}</span>
        <span class="pgbd-li-texts">
          <span class="pgbd-li-name">${esc(it.name)}</span>
          ${
            it.bonus
              ? `<span class="pgbd-li-bonus"><svg class="pgbd-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>${esc(it.bonus)}</span>`
              : ''
          }
        </span>
      </li>`,
      )
      .join('')

    return `
<section class="pgbd">
  <div class="pgbd-bg" aria-hidden="true"></div>
  <div class="pgbd-content">
    <div class="pgbd-eyebrow">
      <span class="pgbd-brand"><span class="pgbd-brand-dot"></span>${esc(d.brand)}</span>
      ${d.period ? `<span class="pgbd-period">${esc(d.period)}</span>` : ''}
    </div>
    <h2 class="pgbd-title">${richSafe(d.title)}</h2>
    ${d.benefit ? `<p class="pgbd-benefit">${esc(d.benefit)}</p>` : ''}
    ${media(d.bundleImage, 'pgbd-img', '번들 구성 제품 이미지')}
    <ul class="pgbd-list">
      ${items}
    </ul>
  </div>
  <div class="pgbd-bar">
    <span class="pgbd-discount"><span class="pgbd-discount-pct">${esc(d.discountRate)}</span></span>
    <span class="pgbd-prices">
      <span class="pgbd-original">${esc(d.originalPrice)}</span>
    </span>
    <span class="pgbd-sale">${esc(d.salePrice)}</span>
  </div>
</section>`
  },
})
