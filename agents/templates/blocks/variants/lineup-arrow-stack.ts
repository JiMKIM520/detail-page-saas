/** LINEUP 아키타입: lineup-arrow-stack
 *  피그마 102_상품구성_01 구조 흡수 — 수직 스택 카드(좌 텍스트+가격 / 우 상품이미지) +
 *  우상단 화살표형 SVG 할인 뱃지로 시선을 할인폭으로 유도하는 구성.
 *  라이트 배경, 3개 옵션(단품→중간→대량) 수직 나열. noimg-safe 구현. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const optionSchema = z.object({
  name: z.string().min(1),           // 상품명 (em 허용)
  spec: z.string().min(1),           // 용량/수량 표기 (예: 3통 / 180정 / 6개월분)
  regularPrice: z.string().min(1),   // 정상가 표기 (예: 90,000원)
  salePrice: z.string().min(1),      // 할인가 표기 (예: 72,000원)
  discountRate: z.string().min(1),   // 할인율 텍스트 (예: 20%)
  image: z.string().optional(),      // 상품 이미지 url
})

const schema = z.object({
  eyebrow: z.string().optional(),    // 상단 소제목 (예: 올해 마지막 기회!) (em 허용)
  title: z.string().min(1),          // 대제목 (예: 최대 50% 할인) (em 허용)
  options: z.array(optionSchema).min(1).max(5),
})
type Data = z.infer<typeof schema>

/** 화살표 배지 SVG — 원본 프레임의 133×104 화살표 벡터를 CSS 클립+polygon으로 재현.
 *  좌측 직사각형 + 우측 삼각형 화살촉 형태. fill = var(--accent). */
function arrowBadge(rate: string, esc: (s: string) => string): string {
  return `
<div class="lxft-badge" aria-label="할인율 ${esc(rate)}">
  <svg class="lxft-badge-svg" viewBox="0 0 133 104" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <polygon points="0,0 98,0 133,52 98,104 0,104" fill="var(--accent)"/>
  </svg>
  <span class="lxft-badge-text">${esc(rate)}</span>
</div>`
}

export const lineupArrowStack = defineBlock<Data>({
  id: 'lineup-arrow-stack',
  archetype: 'lineup',
  styleTags: ['light', 'promo', 'food', 'health', 'noimg-safe'],
  imageSlots: 3,
  describe:
    '상품 구성 라인업(수직 스택). 라이트 배경 + 상단 할인 강조 헤더 + 옵션별 카드(좌: 상품명·수량·정상가·할인가 / 우: 상품이미지 + 우상단 화살표형 할인율 뱃지). 단품→대량 구성 비교에 최적. 이미지 없어도 붕괴하지 않음.',
  schema,
  css: `
.lxft{background:var(--bg);padding:56px var(--pad-x,56px) 64px;color:var(--ink)}
.lxft-hd{text-align:center;margin-bottom:40px}
.lxft-eyebrow{font-family:var(--font-body),'Pretendard',sans-serif;font-size:22px;font-weight:600;color:var(--accent);line-height:1.4;margin-bottom:6px}
.lxft-eyebrow .em{color:var(--accent-d);font-weight:700}
.lxft-title{font-family:var(--font-display),'Pretendard',sans-serif;font-size:52px;font-weight:800;color:var(--accent);line-height:1.1;letter-spacing:-.02em}
.lxft-title .em{color:var(--accent-d)}
.lxft-cards{display:flex;flex-direction:column;gap:20px}
.lxft-card{position:relative;display:flex;align-items:center;background:var(--paper,#fff);border-radius:calc(var(--r-scale,1)*28px);overflow:visible;min-height:160px}
.lxft-body{flex:1;padding:28px 28px 28px 32px;display:flex;flex-direction:column;gap:12px;min-width:0}
.lxft-name{font-family:var(--font-display),'Pretendard',sans-serif;font-size:26px;font-weight:700;color:var(--ink);line-height:1.2}
.lxft-name .em{color:var(--accent-d)}
.lxft-spec{font-size:16px;font-weight:500;color:var(--ink-2);margin-top:-4px}
.lxft-prices{display:flex;flex-direction:column;gap:6px;margin-top:4px}
.lxft-regular{display:flex;align-items:center;gap:10px}
.lxft-reg-pill{display:inline-flex;align-items:center;justify-content:center;background:var(--muted,#6c6c6c);color:#fff;font-size:13px;font-weight:600;padding:3px 12px;border-radius:999px;white-space:nowrap;flex-shrink:0}
.lxft-reg-amt{font-size:17px;font-weight:500;color:var(--muted,#6c6c6c);text-decoration:line-through}
.lxft-sale{display:flex;align-items:center;gap:10px}
.lxft-sale-pill{display:inline-flex;align-items:center;justify-content:center;background:var(--accent);color:#fff;font-size:13px;font-weight:700;padding:3px 12px;border-radius:999px;white-space:nowrap;flex-shrink:0}
.lxft-sale-amt{font-size:30px;font-weight:800;color:var(--accent-d);line-height:1}
.lxft-img-wrap{flex:0 0 200px;width:200px;height:160px;margin:16px 20px 16px 0;position:relative;flex-shrink:0}
.lxft-img{width:100%;height:100%;object-fit:cover;border-radius:var(--shape-photo, calc(var(--r-scale,1)*18px));display:block}
.lxft-img.ph{display:none!important}
.lxft-card--noimg .lxft-img-wrap{display:none}
.lxft-card--noimg .lxft-body{padding-right:80px}
.lxft-card--noimg .lxft-badge{top:8px;right:8px}
.lxft-badge{position:absolute;top:0;right:0;width:80px;height:62px;display:flex;align-items:center;justify-content:center;z-index:2;pointer-events:none}
.lxft-badge-svg{position:absolute;inset:0;width:100%;height:100%}
.lxft-badge-text{position:relative;z-index:1;font-family:var(--font-display),'Pretendard',sans-serif;font-size:20px;font-weight:800;color:#fff;letter-spacing:-.01em;padding-right:6px}
`,
  render: (d, { esc, richSafe }) => {
    const cards = d.options.map((opt) => {
      const hasImg = typeof opt.image === 'string' && opt.image.length > 0
      return `
<div class="lxft-card${hasImg ? '' : ' lxft-card--noimg'}">
  <div class="lxft-body">
    <div class="lxft-name">${richSafe(opt.name)}</div>
    <div class="lxft-spec">${esc(opt.spec)}</div>
    <div class="lxft-prices">
      <div class="lxft-regular">
        <span class="lxft-reg-pill">정상가</span>
        <span class="lxft-reg-amt">${esc(opt.regularPrice)}</span>
      </div>
      <div class="lxft-sale">
        <span class="lxft-sale-pill">할인가</span>
        <span class="lxft-sale-amt">${esc(opt.salePrice)}</span>
      </div>
    </div>
  </div>
  ${hasImg ? `
  <div class="lxft-img-wrap">
    ${media(opt.image, 'lxft-img', esc(opt.name) + ' 상품 이미지')}
    ${arrowBadge(opt.discountRate, esc)}
  </div>` : arrowBadge(opt.discountRate, esc)}
</div>`
    }).join('')

    return `
<section class="lxft">
  <div class="lxft-hd">
    ${d.eyebrow ? `<p class="lxft-eyebrow">${richSafe(d.eyebrow)}</p>` : ''}
    <h2 class="lxft-title disp">${richSafe(d.title)}</h2>
  </div>
  <div class="lxft-cards">
    ${cards}
  </div>
</section>`
  },
})
