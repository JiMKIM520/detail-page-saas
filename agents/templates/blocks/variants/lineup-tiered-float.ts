/** LINEUP 아키타입: lineup-tiered-float
 *  피그마 012_상품_구성_페이지_11 흡수.
 *  구조: 상단 대형 타이틀 → 좌 정사각 이미지 4개 수직 스택 + 우 옵션 뱃지·제품명·설명·가격 행 반복
 *        + 우상단에 증정품 카드가 position:absolute로 부유.
 *  뱃지 컬러 코딩: 기본 옵션 = var(--accent-d)(녹색 계), 스페셜 옵션 = var(--special) 오렌지 계열.
 *  이미지 전무 시 텍스트 행만으로 강등 렌더 (noimg-safe).
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const optionSchema = z.object({
  badge: z.string().min(1),          // 뱃지 라벨 (예: "선택 1번", "스페셜 1번")
  isSpecial: z.boolean().optional(), // true이면 오렌지 뱃지
  name: z.string().min(1),          // 제품명 (em 허용)
  desc: z.string().optional(),       // 장점/효과 한 줄
  originalPrice: z.string().optional(), // 소비자가 (취소선)
  price: z.string().min(1),         // 최대혜택가
  image: z.string().optional(),     // 정사각 제품 이미지 (url)
})

const schema = z.object({
  title: z.string().min(1),         // 대형 타이틀 (em,br)
  options: z.array(optionSchema).min(2).max(4),
  giftLabel: z.string().optional(), // 증정품 카드 헤더 (없으면 "추가 증정품")
  giftDesc: z.string().optional(),  // 증정품 설명 한 줄
  giftImage: z.string().optional(), // 증정품 이미지 (url)
})
type Data = z.infer<typeof schema>

export const lineupTieredFloat = defineBlock<Data>({
  id: 'lineup-tiered-float',
  archetype: 'lineup',
  // noimg-safe: 옵션 이미지 전무 시 좌측 이미지 열 생략 후 텍스트 전체폭 강등
  styleTags: ['light', 'lineup', 'pricing', 'tiered', 'noimg-safe'],
  imageSlots: 4,
  describe:
    '상품 구성/가격 비교. 대형 타이틀 + 좌 정사각 이미지 4개 수직 스택·우 뱃지(선택/스페셜 컬러 코딩)·제품명·설명·취소선 소비자가·강조 혜택가 행 반복 + 우상단 부유 증정품 카드. 옵션 티어를 뱃지 색으로 구분하는 가격표 레이아웃.',
  schema,
  css: `
.lkrt{position:relative;background:var(--bg);color:var(--ink);padding:54px var(--pad-x,56px) 64px}
/* 대형 타이틀 */
.lkrt-title{font-family:var(--font-display);font-weight:400;font-size:46px;line-height:1.22;letter-spacing:-.02em;margin-bottom:38px;max-width:440px}
.lkrt-title .em{color:var(--accent)}
/* 메인 그리드: 이미지 열 + 옵션 열 */
.lkrt-grid{display:flex;align-items:flex-start;gap:0}
.lkrt-imgs{flex:0 0 calc(100% * 5 / 12);display:flex;flex-direction:column;gap:0}
.lkrt-img-frame{width:100%;aspect-ratio:1/1;overflow:hidden;background:color-mix(in srgb,var(--line) 40%,transparent);border-radius:var(--shape-photo, calc(var(--r-scale,1)*6px))}
.lkrt-img-frame img,.lkrt-img-frame .ph{width:100%;height:100%;object-fit:cover;border-radius:inherit}
/* 옵션 열 */
.lkrt-opts{flex:1;padding-left:28px}
.lkrt-opt{padding:22px 0;border-bottom:1px solid var(--line)}
.lkrt-opt:last-child{border-bottom:none}
/* 뱃지 */
.lkrt-badge{display:inline-block;padding:5px 14px;border-radius:calc(var(--r-scale,1)*6px);font-family:var(--font-display);font-weight:800;font-size:14px;letter-spacing:.04em;color:#fff;background:var(--accent-d);margin-bottom:10px}
.lkrt-badge.special{background:var(--special,#D84C00)}
/* 제품명 */
.lkrt-name{font-family:var(--font-display);font-weight:700;font-size:22px;line-height:1.3;margin-bottom:6px}
.lkrt-name .em{color:var(--accent)}
/* 설명 */
.lkrt-desc{font-size:14px;color:var(--ink-2);margin-bottom:14px;line-height:1.6}
/* 구분선 */
.lkrt-div{border:none;border-top:1px solid var(--line);margin-bottom:14px}
/* 가격 */
.lkrt-price-row{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}
.lkrt-orig-wrap{display:flex;flex-direction:column;gap:1px}
.lkrt-orig-label{font-size:12px;color:var(--muted);font-weight:400}
.lkrt-orig{font-size:16px;color:var(--muted);text-decoration:line-through;font-weight:400}
.lkrt-best-wrap{display:flex;flex-direction:column;gap:1px}
.lkrt-best-label{font-size:12px;color:var(--accent-d);font-weight:600}
.lkrt-best{font-family:var(--font-display);font-size:28px;font-weight:800;color:var(--accent-d);letter-spacing:-.02em}
/* 증정품 카드 (부유) */
.lkrt-gift{position:absolute;top:54px;right:var(--pad-x,56px);width:132px;background:var(--accent-d);border-radius:calc(var(--r-scale,1)*10px);overflow:visible;box-shadow:0 8px 24px -8px rgba(0,0,0,.28)}
.lkrt-gift-hd{display:flex;align-items:center;gap:6px;padding:8px 10px 6px}
.lkrt-gift-plus{width:20px;height:20px;border-radius:50%;background:rgba(255,255,255,.22);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.lkrt-gift-plus svg{width:11px;height:11px;stroke:#fff;stroke-width:2.5;fill:none;stroke-linecap:round}
.lkrt-gift-label{font-size:12px;font-weight:800;color:#fff;letter-spacing:.02em}
.lkrt-gift-body{background:var(--paper);border-radius:calc(var(--r-scale,1)*7px);margin:0 5px 5px;overflow:hidden;min-height:80px}
.lkrt-gift-img{width:100%;aspect-ratio:1/0.85;object-fit:cover;display:block}
.lkrt-gift-img.ph{display:none!important}
.lkrt-gift-text{padding:8px 8px 10px;font-size:11px;color:var(--ink-2);line-height:1.5}
/* 이미지 없는 강등: 옵션 열 전체폭 */
.lkrt.noimg .lkrt-grid{display:block}
.lkrt.noimg .lkrt-imgs{display:none}
.lkrt.noimg .lkrt-opts{padding-left:0}
`,
  render: (d, { esc, richSafe }) => {
    // 모든 옵션에 이미지가 없으면 noimg 강등 모드
    const withImgs = d.options.some((o) => typeof o.image === 'string' && o.image.length > 0)
    const allImgs = d.options.every((o) => typeof o.image === 'string' && o.image.length > 0)
    // 이미지 열: 전부 있을 때만 전 슬롯 표시, 일부만 있으면 있는 것만
    const imgColVisible = withImgs

    const giftLabel = d.giftLabel ?? '추가 증정품'

    return `
<section class="lkrt${imgColVisible ? '' : ' noimg'}">
  <h2 class="lkrt-title">${richSafe(d.title)}</h2>
  <div class="lkrt-grid">
    ${imgColVisible ? `
    <div class="lkrt-imgs">
      ${d.options.map((o) => `
      <div class="lkrt-img-frame">
        ${media(o.image, '', `${esc(o.name)} 제품 이미지`)}
      </div>`).join('')}
    </div>` : ''}
    <div class="lkrt-opts">
      ${d.options.map((o) => `
      <div class="lkrt-opt">
        <span class="lkrt-badge${o.isSpecial ? ' special' : ''}">${esc(o.badge)}</span>
        <p class="lkrt-name">${richSafe(o.name)}</p>
        ${o.desc ? `<p class="lkrt-desc">${esc(o.desc)}</p>` : ''}
        <hr class="lkrt-div">
        <div class="lkrt-price-row">
          ${o.originalPrice ? `
          <div class="lkrt-orig-wrap">
            <span class="lkrt-orig-label">소비자가</span>
            <span class="lkrt-orig">${esc(o.originalPrice)}</span>
          </div>` : ''}
          <div class="lkrt-best-wrap">
            <span class="lkrt-best-label">최대혜택가</span>
            <span class="lkrt-best">${esc(o.price)}</span>
          </div>
        </div>
      </div>`).join('')}
    </div>
  </div>
  ${(d.giftLabel !== undefined || d.giftDesc !== undefined || d.giftImage !== undefined) ? `
  <div class="lkrt-gift" aria-label="${esc(giftLabel)} 카드">
    <div class="lkrt-gift-hd">
      <div class="lkrt-gift-plus">
        <svg viewBox="0 0 11 11"><line x1="5.5" y1="1" x2="5.5" y2="10"/><line x1="1" y1="5.5" x2="10" y2="5.5"/></svg>
      </div>
      <span class="lkrt-gift-label">${esc(giftLabel)}</span>
    </div>
    <div class="lkrt-gift-body">
      ${d.giftImage ? media(d.giftImage, 'lkrt-gift-img', `${esc(giftLabel)} 이미지`) : ''}
      ${d.giftDesc ? `<p class="lkrt-gift-text">${esc(d.giftDesc)}</p>` : ''}
    </div>
  </div>` : ''}
</section>`
  },
})
