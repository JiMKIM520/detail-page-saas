/** PROMO 아키타입: promo-bokeh-card
 *  피그마 "상품 구성 페이지_16" 구조 흡수.
 *  전체 배경 이미지 + CSS 그라디언트 타원 3개(보케 분위기) + 중앙 상단 헤더 영역
 *  (브랜드명·기간·상품명·혜택 pill) + 흰 플로팅 카드(이미지 마스크 + 2열 상품 리스트
 *  + 취소선 정상가·행사가·이벤트 가격) + 좌하단 할인율 배지. 라이트/프로모션 톤. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const priceRowSchema = z.object({
  name: z.string().min(1),           // 상품명 (em 허용)
  category: z.string().min(1),       // 우측 품목 레이블
})

const schema = z.object({
  brand: z.string().min(1),          // 브랜드명 (좌상단)
  period: z.string().optional(),     // 행사 기간 문자열 (예: "25.05.10 ~ 25.08.20")
  productName: z.string().min(1),    // 대형 상품명 (em,br 허용)
  benefitPill: z.string().optional(),// 혜택 pill 텍스트
  bgImage: z.string().optional(),    // 배경 전면 이미지 (url)
  cardImage: z.string().optional(),  // 카드 내 상품 이미지 (url)
  items: z.array(priceRowSchema).min(1).max(6), // 상품 구성 목록
  note: z.string().optional(),       // 특이사항·유의문구
  priceOriginal: z.string().optional(), // 정상가 (예: "17,000")
  priceEvent: z.string().optional(),    // 행사가 (예: "12,900")
  priceFinal: z.string().min(1),        // 이벤트 최종가 (예: "10,900원")
  discountRate: z.string().optional(),  // 할인율 배지 (예: "35%")
})
type Data = z.infer<typeof schema>

export const promoBokehCard = defineBlock<Data>({
  id: 'promo-bokeh-card',
  archetype: 'promo',
  styleTags: ['light', 'promo', 'bokeh', 'noimg-safe'],
  imageSlots: 2,
  describe:
    '프로모션 구성 페이지. 전면 배경 이미지 위 CSS 보케 타원 3개 레이어 + 중앙 상단 헤더(브랜드·기간·대형 상품명·혜택 pill) + 흰 플로팅 카드(상품 이미지·2열 구성 리스트·취소선 정상가·행사가·강조 최종가) + 좌하단 할인율 배지. 뷰티/식품 시즌 이벤트 구성에 적합.',
  schema,
  css: `
.puqa{position:relative;width:100%;overflow:hidden;background:var(--bg);padding-bottom:60px}
.puqa-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0}
.puqa-bg.ph{display:none!important}
/* 배경 없을 때 폴백 그라디언트 */
.puqa-fallback-bg{position:absolute;inset:0;z-index:0;background:linear-gradient(145deg,color-mix(in srgb,var(--accent) 28%,var(--bg)),var(--bg))}
/* 보케 타원 3개 */
.puqa-bokeh{position:absolute;inset:0;z-index:1;pointer-events:none;overflow:hidden}
.puqa-b1,.puqa-b2,.puqa-b3{position:absolute;border-radius:50%;mix-blend-mode:screen;opacity:.55}
.puqa-b1{width:83%;padding-top:83%;top:-18%;right:-14%;background:radial-gradient(circle,color-mix(in srgb,var(--accent) 80%,#fff) 0%,transparent 70%)}
.puqa-b2{width:83%;padding-top:83%;top:-45%;left:-14%;background:radial-gradient(circle,color-mix(in srgb,var(--accent-d) 60%,#fff) 0%,transparent 68%)}
.puqa-b3{width:83%;padding-top:83%;top:30%;right:15%;background:radial-gradient(circle,color-mix(in srgb,var(--brand) 55%,#fff) 0%,transparent 65%)}
/* 헤더 영역 */
.puqa-hd{position:relative;z-index:2;padding:44px var(--pad-x,56px) 0;text-align:center}
.puqa-hd-top{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px}
.puqa-brand{font-family:var(--font-display);font-weight:700;font-size:18px;color:#fff;text-shadow:0 1px 6px rgba(0,0,0,.35);letter-spacing:.04em}
.puqa-period{font-family:var(--font-body);font-weight:600;font-size:14px;color:rgba(255,255,255,.88);text-shadow:0 1px 4px rgba(0,0,0,.3);letter-spacing:.02em}
.puqa-product{font-family:var(--font-display);font-weight:700;font-size:42px;line-height:1.12;letter-spacing:-.02em;background:linear-gradient(135deg,#fff 0%,color-mix(in srgb,var(--accent) 55%,#fff) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;filter:drop-shadow(0 2px 8px rgba(0,0,0,.25))}
.puqa-product .em{-webkit-text-fill-color:unset;color:var(--accent-d)}
.puqa-pill-wrap{margin-top:14px;display:flex;justify-content:center}
.puqa-pill{display:inline-flex;align-items:center;padding:8px 24px;border-radius:999px;background:linear-gradient(90deg,var(--accent),var(--accent-d));color:#fff;font-family:var(--font-display);font-weight:700;font-size:18px;letter-spacing:.02em;box-shadow:0 4px 14px -4px rgba(0,0,0,.28)}
/* 플로팅 카드 */
.puqa-card{position:relative;z-index:2;margin:28px var(--pad-x,56px) 0;background:#fff;border-radius:var(--shape-photo, calc(var(--r-scale,1)*22px));box-shadow:0 20px 52px -16px rgba(0,0,0,.32);overflow:hidden}
.puqa-card-img-wrap{width:100%;background:color-mix(in srgb,var(--accent) 8%,#fafafa)}
.puqa-card-img{width:100%;aspect-ratio:16/9;object-fit:cover;display:block}
.puqa-card-img.ph{display:none!important}
.puqa-card-body{padding:24px 28px 20px}
/* 상품 리스트 */
.puqa-list{display:flex;flex-direction:column;gap:10px;margin-bottom:16px}
.puqa-item{display:grid;grid-template-columns:1fr auto;align-items:center;gap:12px;padding-bottom:10px;border-bottom:1px solid var(--line,#f0ece8)}
.puqa-item:last-child{border-bottom:none}
.puqa-item-name{font-family:var(--font-display);font-weight:600;font-size:16px;color:color-mix(in srgb,var(--accent-d) 80%,var(--ink));line-height:1.3}
.puqa-item-name .em{color:var(--accent-d);font-weight:800}
.puqa-item-cat{display:flex;align-items:center;gap:6px;font-family:var(--font-display);font-weight:600;font-size:14px;color:color-mix(in srgb,var(--accent-d) 70%,var(--ink))}
.puqa-item-dot{width:18px;height:18px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--accent-d));flex-shrink:0}
/* 특이사항 */
.puqa-note{font-size:13px;color:var(--muted);line-height:1.55;margin-bottom:18px}
/* 가격 블록 */
.puqa-price-row{display:grid;grid-template-columns:auto 1fr;gap:16px 0;align-items:center}
.puqa-price-labels{display:flex;flex-direction:column;gap:4px}
.puqa-price-label{font-size:13px;font-weight:500;color:var(--muted)}
.puqa-price-label.event{color:var(--ink-2)}
.puqa-price-vals{display:flex;flex-direction:column;gap:2px;padding-left:12px}
.puqa-original{font-size:17px;font-weight:400;color:var(--muted);text-decoration:line-through}
.puqa-event{font-size:17px;font-weight:400;color:var(--ink-2)}
.puqa-final-wrap{grid-column:1/-1;margin-top:6px}
.puqa-final{font-family:var(--font-display);font-weight:800;font-size:32px;letter-spacing:-.02em;background:linear-gradient(120deg,var(--accent),var(--accent-d));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
/* 할인율 배지 */
.puqa-badge-wrap{position:relative;z-index:2;margin:0 var(--pad-x,56px);margin-top:-16px;display:flex;justify-content:flex-start}
.puqa-badge{display:inline-flex;align-items:center;justify-content:center;padding:8px 20px;border-radius:calc(var(--r-scale,1)*10px);background:linear-gradient(135deg,var(--accent),var(--accent-d));box-shadow:0 6px 18px -6px rgba(0,0,0,.3)}
.puqa-badge-txt{font-family:var(--font-display);font-weight:700;font-size:28px;letter-spacing:-.01em;color:#fff}
`,
  render: (d, { esc, richSafe }) => {
    const hasBg = typeof d.bgImage === 'string' && /^(https?:\/\/|data:|\/)/.test(d.bgImage.trim())
    const hasCardImg = typeof d.cardImage === 'string' && /^(https?:\/\/|data:|\/)/.test(d.cardImage.trim())

    const itemsHtml = d.items
      .map(
        (it) => `
      <div class="puqa-item">
        <span class="puqa-item-name">${richSafe(it.name)}</span>
        <span class="puqa-item-cat">
          <span class="puqa-item-dot" aria-hidden="true"></span>
          ${esc(it.category)}
        </span>
      </div>`,
      )
      .join('')

    const priceBlock =
      d.priceOriginal || d.priceEvent
        ? `
      <div class="puqa-price-row">
        <div class="puqa-price-labels">
          ${d.priceOriginal ? `<span class="puqa-price-label">정상가</span>` : ''}
          ${d.priceEvent ? `<span class="puqa-price-label event">행사가</span>` : ''}
        </div>
        <div class="puqa-price-vals">
          ${d.priceOriginal ? `<span class="puqa-original">${esc(d.priceOriginal)}</span>` : ''}
          ${d.priceEvent ? `<span class="puqa-event">${esc(d.priceEvent)}</span>` : ''}
        </div>
        <div class="puqa-final-wrap">
          <span class="puqa-final">${esc(d.priceFinal)}</span>
        </div>
      </div>`
        : `<div class="puqa-final-wrap"><span class="puqa-final">${esc(d.priceFinal)}</span></div>`

    return `
<section class="puqa">
  ${hasBg ? media(d.bgImage, 'puqa-bg', '프로모션 배경') : '<div class="puqa-fallback-bg" aria-hidden="true"></div>'}
  <div class="puqa-bokeh" aria-hidden="true">
    <div class="puqa-b1"></div>
    <div class="puqa-b2"></div>
    <div class="puqa-b3"></div>
  </div>
  <div class="puqa-hd">
    <div class="puqa-hd-top">
      <span class="puqa-brand">${esc(d.brand)}</span>
      ${d.period ? `<span class="puqa-period">${esc(d.period)}</span>` : ''}
    </div>
    <h2 class="puqa-product">${richSafe(d.productName)}</h2>
    ${d.benefitPill ? `<div class="puqa-pill-wrap"><span class="puqa-pill">${esc(d.benefitPill)}</span></div>` : ''}
  </div>
  <div class="puqa-card">
    ${hasCardImg
        ? `<div class="puqa-card-img-wrap">${media(d.cardImage, 'puqa-card-img', '상품 이미지')}</div>`
        : ''}
    <div class="puqa-card-body">
      <div class="puqa-list">${itemsHtml}</div>
      ${d.note ? `<p class="puqa-note">${esc(d.note)}</p>` : ''}
      ${priceBlock}
    </div>
  </div>
  ${d.discountRate
      ? `<div class="puqa-badge-wrap">
    <div class="puqa-badge"><span class="puqa-badge-txt">${esc(d.discountRate)}</span></div>
  </div>`
      : ''}
</section>`
  },
})
