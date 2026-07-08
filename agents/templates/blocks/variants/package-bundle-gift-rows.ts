/** PROMO 아키타입: package-bundle-gift-rows.
 *  [끝판왕] 상품 구성 #17 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 그라데이션 배경 + 대제목 + [메인상품 + 원형"+" 커넥터 + 사은품] 덧셈 번들 행 반복 +
 *  복합 원형 배지 클러스터(할인율 원 + 혜택명 원 겹침) + 가격/CTA 행. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media, attr } from '../shared'

const schema = z.object({
  /** 상단 eyebrow 레이블 (예: "브랜드 로고", 선택) */
  eyebrow: z.string().optional(),
  /** 섹션 대제목 (em, br 허용) */
  title: z.string().min(1),
  /** 번들 행 (1~3개) */
  rows: z
    .array(
      z.object({
        /** 행 소제목 (em, br 허용) */
        heading: z.string().min(1),
        /** 메인 상품 이미지 URL */
        mainImage: z.string().optional(),
        /** 메인 상품 이미지 alt */
        mainImageAlt: z.string().optional(),
        /** 사은품/추가구성 이미지 URL */
        giftImage: z.string().optional(),
        /** 사은품 이미지 alt */
        giftImageAlt: z.string().optional(),
        /** 사은품/구성품 레이블 (카드 상단 텍스트) */
        giftLabel: z.string().optional(),
        /** 할인 배지 원 텍스트 (예: "32%", 없으면 배지 숨김) */
        discountRate: z.string().optional(),
        /** 혜택 배지 원 텍스트 (예: "사은품") */
        benefitLabel: z.string().optional(),
        /** 정가 (예: "399,999원", 선택 — 없으면 취소선 행 숨김) */
        originalPrice: z.string().optional(),
        /** 최종가 (예: "399,999원") */
        finalPrice: z.string().min(1),
        /** CTA 버튼 레이블 (기본 "제품 보러가기") */
        ctaLabel: z.string().optional(),
        /** CTA 링크 (기본 #) */
        ctaHref: z.string().optional(),
      }),
    )
    .min(1)
    .max(3),
})
type Data = z.infer<typeof schema>

export const packageBundleGiftRows = defineBlock<Data>({
  id: 'package-bundle-gift-rows',
  archetype: 'lineup',
  styleTags: ['promo', 'bundle', 'gradient', 'badge', 'gift', 'template'],
  imageSlots: 4,
  describe:
    '상품 구성 번들 행. 그라데이션 배경 + 대제목 + [메인상품 이미지 + "+" 원형 커넥터 + 사은품 카드] 덧셈 UI 행 반복 + 복합 원형 배지 클러스터(할인율+혜택명 두 원 겹침) + 가격/CTA. 프로모션/패키지 구성 강조.',
  schema,
  css: `
/* package-bundle-gift-rows — 접두사 pbgr- */
.pbgr{background:linear-gradient(160deg,#fce4ec 0%,#f3e5f5 50%,#ede7f6 100%);padding:52px 28px 60px;word-break:keep-all;overflow-wrap:break-word}
/* 헤더 */
.pbgr-eyebrow{display:inline-block;font-size:13px;font-weight:700;color:var(--muted);letter-spacing:.08em;text-transform:uppercase;margin-bottom:14px;padding:5px 14px;background:rgba(255,255,255,.55);border-radius:999px}
.pbgr-title{font-family:var(--font-display);font-weight:800;font-size:clamp(26px,7vw,36px);line-height:1.28;letter-spacing:-.02em;color:var(--ink);text-align:center;margin-bottom:6px}
.pbgr-title .em{color:var(--accent-d)}
/* 번들 행 래퍼 */
.pbgr-rows{display:flex;flex-direction:column;gap:20px;margin-top:28px}
.pbgr-row{background:#fff;border-radius:calc(var(--r-scale,1)*22px);padding:22px 18px 20px;box-shadow:0 6px 24px -8px rgba(160,80,160,.18)}
/* 행 소제목 */
.pbgr-heading{font-size:13px;font-weight:700;color:var(--muted);letter-spacing:.04em;margin-bottom:14px}
.pbgr-heading .em{color:var(--accent-d)}
/* 번들 등식 행 */
.pbgr-equation{display:flex;align-items:center;gap:10px;margin-bottom:18px}
/* 메인 상품 이미지 */
.pbgr-main-img{width:120px;height:120px;object-fit:cover;border-radius:var(--shape-photo, calc(var(--r-scale,1)*14px));flex-shrink:0}
.pbgr-main-img.ph{width:120px;height:120px;border-radius:var(--shape-photo, calc(var(--r-scale,1)*14px));flex-shrink:0}
/* + 원형 커넥터 */
.pbgr-plus{width:30px;height:30px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 2px 8px -2px rgba(0,0,0,.22)}
.pbgr-plus-icon{font-size:18px;font-weight:900;color:#fff;line-height:1;user-select:none}
/* 사은품 카드 */
.pbgr-gift-card{flex:1;min-width:0;background:linear-gradient(135deg,#f8f0ff 0%,#fce4f0 100%);border-radius:calc(var(--r-scale,1)*14px);overflow:hidden;display:flex;flex-direction:column}
.pbgr-gift-label{font-size:11px;font-weight:800;color:var(--accent-d);letter-spacing:.06em;padding:7px 10px 4px;line-height:1}
.pbgr-gift-img{width:100%;flex:1;min-height:72px;object-fit:cover}
.pbgr-gift-img.ph{width:100%;min-height:72px;flex:1}
/* 가격 행 */
.pbgr-price-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.pbgr-orig{font-size:13px;color:var(--muted);text-decoration:line-through;white-space:nowrap}
.pbgr-final-wrap{display:flex;flex-direction:column;gap:1px;flex:1}
.pbgr-final-label{font-size:11px;color:var(--muted);letter-spacing:.03em}
.pbgr-final{font-family:var(--font-display);font-weight:800;font-size:clamp(18px,4.8vw,22px);color:var(--ink);letter-spacing:-.02em;line-height:1.1}
.pbgr-cta{flex-shrink:0;display:inline-flex;align-items:center;gap:5px;padding:9px 16px;border-radius:999px;background:var(--accent);color:#fff;font-size:13px;font-weight:800;letter-spacing:.02em;text-decoration:none;white-space:nowrap;box-shadow:0 3px 10px -3px rgba(0,0,0,.28)}
.pbgr-cta-arrow{font-size:12px;opacity:.85}
/* 복합 원형 배지 클러스터 */
.pbgr-badges{display:flex;align-items:center;margin-bottom:14px;gap:0}
.pbgr-badge{width:54px;height:54px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.15;box-shadow:0 2px 8px -2px rgba(0,0,0,.25)}
.pbgr-badge-discount{background:#e53935;color:#fff;z-index:2;flex-shrink:0}
.pbgr-badge-pct{font-size:14px;font-weight:900;letter-spacing:-.01em}
.pbgr-badge-off{font-size:10px;font-weight:700;letter-spacing:.04em;opacity:.88}
.pbgr-badge-benefit{background:#fff;color:#e53935;border:2.5px solid #e53935;margin-left:-14px;z-index:1;flex-shrink:0}
.pbgr-badge-btext{font-size:10px;font-weight:800;letter-spacing:.02em;text-align:center;padding:0 2px}
`,
  render: (d, { esc, richSafe }) => {
    const rows = d.rows
      .map((row) => {
        // 복합 배지 클러스터 (할인율 + 혜택명)
        const badgeCluster =
          row.discountRate
            ? `
        <div class="pbgr-badges">
          <div class="pbgr-badge pbgr-badge-discount">
            <span class="pbgr-badge-pct">${esc(row.discountRate)}</span>
            <span class="pbgr-badge-off">OFF</span>
          </div>
          ${
            row.benefitLabel
              ? `<div class="pbgr-badge pbgr-badge-benefit">
            <span class="pbgr-badge-btext">${esc(row.benefitLabel)}</span>
          </div>`
              : ''
          }
        </div>`
            : ''

        // 가격 행
        const priceRow = `
        <div class="pbgr-price-row">
          <div class="pbgr-final-wrap">
            ${row.originalPrice ? `<span class="pbgr-orig">${esc(row.originalPrice)}</span>` : ''}
            <div style="display:flex;align-items:baseline;gap:3px">
              <span class="pbgr-final-label">최저가</span>
              <span class="pbgr-final">${esc(row.finalPrice)}</span>
            </div>
          </div>
          <a class="pbgr-cta" href="${attr(row.ctaHref ?? '#')}">
            ${esc(row.ctaLabel ?? '제품 보러가기')}<span class="pbgr-cta-arrow">→</span>
          </a>
        </div>`

        return `
      <div class="pbgr-row">
        <p class="pbgr-heading">${richSafe(row.heading)}</p>
        ${badgeCluster}
        <div class="pbgr-equation">
          ${media(row.mainImage, 'pbgr-main-img', esc(row.mainImageAlt ?? '메인 상품'))}
          <div class="pbgr-plus"><span class="pbgr-plus-icon">+</span></div>
          <div class="pbgr-gift-card">
            ${row.giftLabel ? `<span class="pbgr-gift-label">${esc(row.giftLabel)}</span>` : ''}
            ${media(row.giftImage, 'pbgr-gift-img', esc(row.giftImageAlt ?? '사은품'))}
          </div>
        </div>
        ${priceRow}
      </div>`
      })
      .join('')

    return `
<section class="pbgr">
  ${d.eyebrow ? `<div style="text-align:center"><span class="pbgr-eyebrow">${esc(d.eyebrow)}</span></div>` : ''}
  <h2 class="pbgr-title">${richSafe(d.title)}</h2>
  <div class="pbgr-rows">
    ${rows}
  </div>
</section>`
  },
})
