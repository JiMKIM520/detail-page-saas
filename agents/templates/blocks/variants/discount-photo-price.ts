/** DISCOUNT 아키타입(템플릿 충실 재현): discount-photo-price.
 *  와디즈 200섹션 15_할인_01(1284:2235) 패턴을 토큰 기반으로 재구성(클론 아님).
 *  제품 사진 풀블리드 배경 + pill 뱃지 + 헤드라인+할인율 + 정가→할인가 가격비교 행 +
 *  pill CTA 버튼 + 하단 반투명 법적고지 박스.
 *  세일 레드(#E8002D)는 브랜드색이 아닌 커머스 보편 신호 → 회색처럼 시맨틱 하드코딩(토큰 무관 의도). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  bgImage: z.string().optional(),                // 풀블리드 배경 사진 (url)
  topBadge: z.string().min(1).optional(),        // 상단 pill 뱃지 ("오직 이 페이지에서만!")
  headline: z.string().min(1),                   // 메인 헤드라인 (em,br) 예: "시크릿<br>체험가"
  discountRate: z.string().min(1),               // 할인율 텍스트 예: "~50%"
  subBadge: z.string().min(1).optional(),        // 헤드라인 옆/아래 pill 뱃지 ("지원 혜택")
  originalPrice: z.string().min(1).optional(),   // 정가 취소선 예: "599,000원"
  salePrice: z.string().min(1),                  // 할인가 예: "399,000원"
  ctaText: z.string().min(1),                    // pill CTA 버튼 텍스트
  legalLines: z.array(z.string().min(1)).min(1).max(4).optional(), // 법적고지 줄 목록
})
type Data = z.infer<typeof schema>

export const discountPhotoPrice = defineBlock<Data>({
  id: 'discount-photo-price',
  archetype: 'discount',
  styleTags: ['premium', 'template', 'dark', 'sale', 'fullbleed'],
  imageSlots: 1,
  describe:
    '풀블리드 사진BG + 가격비교 할인 섹션. 제품 사진 풀블리드 배경 위에 상단 pill 뱃지 + 대형 헤드라인+할인율 + 정가→할인가 가격비교 행 + pill CTA 버튼 + 하단 반투명 법적고지 박스. 긴급감·시크릿 가격 소구.',
  schema,
  css: `
.dpp{position:relative;overflow:hidden;min-height:520px;background:var(--ink)}
.dpp-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;z-index:0}
.dpp-bg.ph{border:none;background:#111}
.dpp-overlay{position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,rgba(0,0,0,.22) 0%,rgba(0,0,0,.55) 100%)}
.dpp-inner{position:relative;z-index:2;padding:56px 40px 48px;display:flex;flex-direction:column;align-items:center;gap:0}

/* ── 상단 pill 뱃지 ── */
.dpp-top-badge{display:inline-flex;align-items:center;gap:6px;border:1.5px solid rgba(255,255,255,.52);border-radius:999px;padding:7px 20px;color:#fff;font-size:15px;font-weight:500;letter-spacing:.02em;background:rgba(255,255,255,.08);margin-bottom:28px;font-family:var(--font-body)}
.dpp-top-badge::before{content:"✦";font-size:10px;opacity:.7}

/* ── 헤드라인 + 할인율 ── */
.dpp-headline-wrap{width:100%;display:flex;flex-direction:column;align-items:flex-start;gap:0;margin-bottom:18px}
.dpp-headline{font-family:var(--font-display);font-weight:800;font-size:clamp(56px,11vw,96px);line-height:1.08;letter-spacing:-.03em;color:#fff;text-shadow:0 2px 18px rgba(0,0,0,.4)}
.dpp-headline .em{color:var(--accent)}
.dpp-rate-row{display:flex;align-items:center;gap:12px;margin-top:4px}
.dpp-rate{font-family:var(--font-display);font-weight:800;font-size:clamp(44px,9vw,80px);line-height:1.05;letter-spacing:-.03em;color:#E8002D;text-shadow:0 2px 16px rgba(232,0,45,.35)}
.dpp-sub-badge{display:inline-flex;align-items:center;background:var(--accent);color:#fff;font-size:17px;font-weight:800;padding:6px 16px;border-radius:6px;letter-spacing:.01em;font-family:var(--font-body)}

/* ── 가격 비교 행 ── */
.dpp-price-row{width:100%;display:flex;align-items:center;gap:0;background:rgba(255,255,255,.12);border-radius:10px;padding:16px 24px;margin-bottom:22px;backdrop-filter:blur(4px)}
.dpp-orig-label{font-size:15px;font-weight:400;color:rgba(255,255,255,.65);font-family:var(--font-body);letter-spacing:-.01em;text-decoration:line-through}
.dpp-arrow{font-size:17px;color:rgba(255,255,255,.5);margin:0 12px;line-height:1}
.dpp-sale-price{font-family:'Paperlogy',var(--font-display),sans-serif;font-weight:800;font-size:clamp(30px,5.5vw,46px);color:#fff;letter-spacing:-.03em;line-height:1}
.dpp-won{font-size:22px;font-weight:700;color:#fff;margin-left:3px;font-family:var(--font-body)}

/* ── pill CTA 버튼 ── */
.dpp-cta{width:100%;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--accent) 72%,#E8002D 28%);border-radius:999px;padding:18px 32px;text-align:center;margin-bottom:28px}
.dpp-cta-txt{font-family:var(--font-body);font-weight:700;font-size:clamp(15px,2.8vw,20px);color:#fff;letter-spacing:-.01em;line-height:1.3}

/* ── 하단 법적고지 박스 ── */
.dpp-legal{width:100%;background:rgba(0,0,0,.44);border-radius:12px;padding:20px 24px;backdrop-filter:blur(6px)}
.dpp-legal-line{font-size:13px;color:rgba(255,255,255,.65);line-height:1.7;font-family:var(--font-body);letter-spacing:-.005em}
.dpp-legal-line+.dpp-legal-line{margin-top:4px}
`,
  render: (d, { esc, richSafe }) => {
    const priceRow = (d.originalPrice || d.salePrice)
      ? `<div class="dpp-price-row">
          ${d.originalPrice ? `<span class="dpp-orig-label">정가 ${esc(d.originalPrice)}</span><span class="dpp-arrow">→</span>` : ''}
          <span class="dpp-sale-price">${esc(d.salePrice)}</span><span class="dpp-won">원</span>
        </div>`
      : ''

    const legalBlock = (d.legalLines && d.legalLines.length > 0)
      ? `<div class="dpp-legal">
          ${d.legalLines.map(l => `<p class="dpp-legal-line">${esc(l)}</p>`).join('')}
        </div>`
      : ''

    return `
<section class="dpp">
  ${media(d.bgImage, 'dpp-bg', '배경 사진')}
  <div class="dpp-overlay"></div>
  <div class="dpp-inner">
    ${d.topBadge ? `<span class="dpp-top-badge">${esc(d.topBadge)}</span>` : ''}
    <div class="dpp-headline-wrap">
      <h2 class="dpp-headline">${richSafe(d.headline)}</h2>
      <div class="dpp-rate-row">
        <span class="dpp-rate">${esc(d.discountRate)}</span>
        ${d.subBadge ? `<span class="dpp-sub-badge">${esc(d.subBadge)}</span>` : ''}
      </div>
    </div>
    ${priceRow}
    <div class="dpp-cta"><span class="dpp-cta-txt">${esc(d.ctaText)}</span></div>
    ${legalBlock}
  </div>
</section>`
  },
})
