/** LINEUP 아키타입: package-discount-badge-grid.
 *  [끝판왕] 상품 구성 #7 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 다크(--brand) 배경 대형 헤드라인 + 원형 할인율 배지가 카드 상단을 오버랩하는
 *  3열 균등 상품 카드 그리드 — 이미지+할인율 배지+취소선 원가+최종가 4요소 묶음.
 *  복잡도: medium. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const itemSchema = z.object({
  /** 옵션 라벨 (예: "옵션 01") */
  label: z.string().min(1),
  /** 제품명 (em 허용) */
  name: z.string().min(1),
  /** 할인율 숫자 (정수, 예: 30) */
  discountPct: z.number().int().min(1).max(99),
  /** 원래 가격 표시 문자열 (예: "44,000원") */
  originalPrice: z.string().min(1),
  /** 최종 가격 표시 문자열 (예: "38,000원") */
  finalPrice: z.string().min(1),
  /** 제품 이미지 URL (선택) */
  image: z.string().optional(),
  /** 이미지 alt */
  imageAlt: z.string().optional(),
})

const schema = z.object({
  /** 섹션 대형 헤드라인 (em, br 허용) */
  title: z.string().min(1),
  /** 상품 카드 목록 (2~4개; UI 최적 3개) */
  items: z.array(itemSchema).min(2).max(4),
})

type Data = z.infer<typeof schema>

export const packageDiscountBadgeGrid = defineBlock<Data>({
  id: 'package-discount-badge-grid',
  archetype: 'lineup',
  styleTags: ['promo', 'commerce', 'grid', 'badge', 'discount', 'template'],
  imageSlots: 3,
  describe:
    '상품 구성(패키지 할인 배지 그리드). 다크 브랜드 배경 대형 헤드라인 + 원형 할인율 배지(--accent)가 상단을 오버랩하는 3열 균등 상품 카드 — 이미지·할인율·취소선 원가·최종가 4요소. 커머스 특가 섹션에 최적.',
  schema,
  css: `
/* package-discount-badge-grid — 접두사 pdbg- */
.pdbg{background:var(--brand);padding:52px 28px 56px;text-align:center;word-break:keep-all}
.pdbg-title{font-family:var(--font-display);font-weight:800;font-size:clamp(28px,6.5vw,44px);line-height:1.22;letter-spacing:-.02em;color:#fff;margin-bottom:36px}
.pdbg-title .em{color:var(--accent)}
/* 카드 그리드 */
.pdbg-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;align-items:start}
/* 카드 래퍼 — 배지 오버랩을 위해 position:relative + 상단 패딩 */
.pdbg-card{position:relative;background:var(--paper);border-radius:calc(var(--r-scale,1)*16px);padding:42px 14px 22px;display:flex;flex-direction:column;align-items:center;box-shadow:0 8px 24px -10px rgba(0,0,0,.28)}
/* 원형 할인율 배지 (카드 상단 중앙 오버랩) */
.pdbg-badge{position:absolute;top:-22px;left:50%;transform:translateX(-50%);width:52px;height:52px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px -4px rgba(0,0,0,.38)}
.pdbg-pct{font-family:var(--font-display);font-weight:800;font-size:15px;line-height:1;color:#fff;letter-spacing:-.01em}
/* 옵션 라벨 */
.pdbg-lbl{font-family:var(--font-body);font-size:11px;font-weight:500;color:var(--muted);letter-spacing:.04em;margin-bottom:4px}
/* 제품명 */
.pdbg-name{font-family:var(--font-display);font-weight:700;font-size:14px;line-height:1.3;color:var(--ink);margin-bottom:10px;text-align:center}
.pdbg-name .em{color:var(--accent-d)}
/* 제품 이미지 영역 */
.pdbg-img{width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:var(--shape-photo, calc(var(--r-scale,1)*8px));display:block}
.pdbg-img.ph{width:100%;aspect-ratio:1/1;border-radius:var(--shape-photo, calc(var(--r-scale,1)*8px));border:2px dashed var(--line);background:var(--bg)}
/* 가격 영역 */
.pdbg-prices{margin-top:12px;display:flex;flex-direction:column;align-items:center;gap:2px;width:100%}
/* 취소선 원가 */
.pdbg-orig{font-family:var(--font-body);font-size:12px;color:var(--muted);text-decoration:line-through;letter-spacing:.01em}
/* 최종가 */
.pdbg-final{font-family:var(--font-display);font-weight:800;font-size:clamp(16px,3.8vw,20px);color:var(--ink);letter-spacing:-.01em}
`,
  render: (d, { esc, richSafe }) => {
    const cards = d.items
      .map(
        (it) => `
    <div class="pdbg-card">
      <div class="pdbg-badge">
        <span class="pdbg-pct">${esc(String(it.discountPct))}%</span>
      </div>
      <p class="pdbg-lbl">${esc(it.label)}</p>
      <h3 class="pdbg-name">${richSafe(it.name)}</h3>
      ${media(it.image, 'pdbg-img', esc(it.imageAlt ?? it.name))}
      <div class="pdbg-prices">
        <span class="pdbg-orig">${esc(it.originalPrice)}</span>
        <span class="pdbg-final">${esc(it.finalPrice)}</span>
      </div>
    </div>`,
      )
      .join('')

    return `
<section class="pdbg">
  <h2 class="pdbg-title">${richSafe(d.title)}</h2>
  <div class="pdbg-grid">
    ${cards}
  </div>
</section>`
  },
})
