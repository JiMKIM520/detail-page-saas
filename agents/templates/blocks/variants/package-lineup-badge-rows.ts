/** LINEUP 아키타입: package-lineup-badge-rows.
 *  [끝판왕] 상품 구성 #9 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: badge-pill-outline(테두리 뱃지) 복수 + 제품명/설명 + price-trio-right-align
 *  (strikethrough-original → 할인% 대형 뮤트 → sale-price accent 대형 볼드), 헤어라인 구분. */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  /** 섹션 타이틀 (선택 — 없으면 숨김) */
  sectionTitle: z.string().optional(),
  /** 상품 구성 반복 행 (2~6개) */
  items: z
    .array(
      z.object({
        /** 아웃라인 뱃지 알약 레이블 (1~3개, e.g. "인기 메뉴", "배송비 무료") */
        badges: z.array(z.string().min(1)).min(1).max(3),
        /** 제품명 (em 허용) */
        name: z.string().min(1),
        /** 구성품 설명 (선택, em/br 허용) */
        desc: z.string().optional(),
        /** 정가 (strikethrough, e.g. "256,000") */
        originalPrice: z.string().min(1),
        /** 할인율 (e.g. "55%") */
        discountPct: z.string().min(1),
        /** 판매가 (e.g. "84,500") */
        salePrice: z.string().min(1),
        /** 가격 단위 (기본 "원") */
        unit: z.string().optional(),
      }),
    )
    .min(2)
    .max(6),
})
type Data = z.infer<typeof schema>

export const packageLineupBadgeRows = defineBlock<Data>({
  id: 'package-lineup-badge-rows',
  archetype: 'lineup',
  styleTags: ['price', 'badge', 'commerce', 'rows', 'template'],
  imageSlots: 0,
  describe:
    '상품 구성/패키지 가격표 행 반복형. 아웃라인 pill 뱃지(인기 메뉴·배송비 무료 등) + 제품명·설명 + 우측 정렬 3단 가격(취소선 정가 → 할인% 대형 뮤트 → 판매가 accent 대형 볼드). 헤어라인으로 행 구분. 식품·커머스 상품 구성표.',
  schema,
  css: `
/* package-lineup-badge-rows — 접두사 plbr- */
.plbr{background:var(--paper);padding:48px 32px 52px;word-break:keep-all;overflow-wrap:break-word}
.plbr-sec-title{font-family:var(--font-display);font-weight:800;font-size:clamp(26px,5vw,36px);color:var(--ink);letter-spacing:-.02em;margin-bottom:32px;line-height:1.2}
.plbr-sec-title .em{color:var(--accent-d)}
.plbr-row{padding:28px 0 24px;border-top:1px solid var(--line)}
.plbr-row:last-child{border-bottom:1px solid var(--line)}
/* 뱃지 영역 */
.plbr-badges{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}
.plbr-badge{display:inline-block;padding:4px 12px;border-radius:999px;border:1.5px solid var(--accent);color:var(--accent-d);font-size:13px;font-weight:700;letter-spacing:.02em;line-height:1.5;background:transparent}
/* 제품명 */
.plbr-name{font-family:var(--font-display);font-weight:800;font-size:clamp(22px,4.5vw,30px);color:var(--ink);letter-spacing:-.01em;line-height:1.25;margin-bottom:6px}
.plbr-name .em{color:var(--accent-d)}
/* 설명 */
.plbr-desc{font-family:var(--font-body);font-size:15px;color:var(--muted);line-height:1.6;margin-bottom:12px}
.plbr-desc .em{color:var(--accent-d);font-weight:700}
/* 가격 trio — 우측 정렬 CSS grid */
.plbr-price{display:grid;grid-template-columns:1fr auto;grid-template-rows:auto auto;row-gap:0;column-gap:12px;align-items:end;margin-top:4px}
.plbr-orig-wrap{grid-column:2;grid-row:1;display:flex;align-items:center;gap:6px;justify-content:flex-end}
.plbr-orig{font-size:14px;color:var(--muted);text-decoration:line-through;font-weight:500;letter-spacing:.01em}
/* 화살표 */
.plbr-arrow{font-size:12px;color:var(--muted);flex-shrink:0}
.plbr-sale-wrap{grid-column:2;grid-row:2;display:flex;align-items:baseline;gap:10px;justify-content:flex-end}
.plbr-discount{font-family:var(--font-display);font-weight:700;font-size:clamp(28px,6vw,40px);color:var(--muted);letter-spacing:-.01em;line-height:1.05}
.plbr-sale{font-family:var(--font-display);font-weight:800;font-size:clamp(34px,7.5vw,52px);color:#E85500;letter-spacing:-.02em;line-height:1}
.plbr-unit{font-size:15px;font-weight:700;color:var(--ink);align-self:flex-end;padding-bottom:4px}
`,
  render: (d, { esc, richSafe }) => {
    const rows = d.items
      .map((it) => {
        const badges = it.badges
          .map((b) => `<span class="plbr-badge">${esc(b)}</span>`)
          .join('')
        const unit = esc(it.unit ?? '원')
        return `
  <div class="plbr-row">
    <div class="plbr-badges">${badges}</div>
    <h3 class="plbr-name">${richSafe(it.name)}</h3>
    ${it.desc ? `<p class="plbr-desc">${richSafe(it.desc)}</p>` : ''}
    <div class="plbr-price">
      <div class="plbr-orig-wrap">
        <span class="plbr-orig">${esc(it.originalPrice)}</span>
        <span class="plbr-arrow">→</span>
      </div>
      <div class="plbr-sale-wrap">
        <span class="plbr-discount">${esc(it.discountPct)}</span>
        <span class="plbr-sale">${esc(it.salePrice)}</span>
        <span class="plbr-unit">${unit}</span>
      </div>
    </div>
  </div>`
      })
      .join('')

    return `
<section class="plbr">
  ${d.sectionTitle ? `<h2 class="plbr-sec-title">${richSafe(d.sectionTitle)}</h2>` : ''}
  ${rows}
</section>`
  },
})
