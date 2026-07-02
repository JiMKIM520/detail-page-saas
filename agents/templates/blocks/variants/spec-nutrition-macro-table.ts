/** DETAIL/SPEC 아키타입: spec-nutrition-macro-table.
 *  [끝판왕] 추천·B&A #23 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 다크 배경 + 대형 헤드라인 + 원형 매크로 배지 3종(중앙 accent 강조)
 *  + 계층형 영양성분 테이블(주영양소/하위영양소 인덴트) + 제품이미지 우측 플로팅. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

/** 영양성분 테이블 행 */
const rowSchema = z.object({
  /** 영양소명 (em 허용) */
  label: z.string().min(1),
  /** 함량 (예: "22g", "16g") */
  amount: z.string().min(1),
  /** 일일기준치 % (예: "40%") — 없으면 생략 */
  pct: z.string().optional(),
  /** true면 하위 항목(들여쓰기 + 작은 폰트) */
  sub: z.boolean().optional(),
  /** 퍼센트 강조(accent-d) 여부 */
  highlight: z.boolean().optional(),
})

/** 원형 매크로 배지 */
const macroSchema = z.object({
  /** 영양소명 (예: "단백질") */
  nutrient: z.string().min(1),
  /** 숫자값 (예: "22") */
  value: z.string().min(1),
  /** 단위 (예: "g") */
  unit: z.string().min(1),
  /** true면 accent 강조 배지(가운데 주인공) */
  featured: z.boolean().optional(),
})

const schema = z.object({
  /** 대형 헤드라인 (em, br 허용) */
  title: z.string().min(1),
  /** 원형 매크로 배지 2~3개 */
  macros: z.array(macroSchema).min(2).max(3),
  /** 계층형 영양성분 테이블 행 (3~10개) */
  rows: z.array(rowSchema).min(3).max(10),
  /** 우측 플로팅 제품 이미지 URL */
  productImage: z.string().optional(),
  /** 이미지 alt */
  productImageAlt: z.string().optional(),
  /** 테이블 하단 주석 (예: "* 1회 제공량 기준") */
  footnote: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const specNutritionMacroTable = defineBlock<Data>({
  id: 'spec-nutrition-macro-table',
  archetype: 'detail',
  styleTags: ['dark', 'nutrition', 'spec', 'table', 'macro', 'food', 'health'],
  imageSlots: 1,
  describe:
    '영양성분 스펙(다크). 다크 배경 + 대형 헤드라인 + 원형 매크로 배지 3종(중앙 accent 강조) + 계층형 영양성분 테이블(주영양소/하위영양소 인덴트) + 제품이미지 우측 플로팅. 식품·헬스케어 상세페이지 하단 스펙 섹션.',
  schema,
  css: `
/* spec-nutrition-macro-table — 접두사 snmt- */

/* 다크 배경 블록 */
.snmt{
  background:var(--ink);
  color:#fff;
  padding:52px 32px 44px;
  word-break:keep-all;
  overflow-wrap:break-word;
}

/* 헤드라인 */
.snmt-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(28px,7vw,42px);
  line-height:1.22;
  letter-spacing:-.025em;
  color:#fff;
  margin-bottom:36px;
  text-align:left;
}
/* 다크 배경 — .em은 var(--accent)으로 override(accent-d는 어두워 다크 배경에서 대비 낮음) */
.snmt-title .em{color:var(--accent)}

/* 매크로 배지 행 */
.snmt-macros{
  display:flex;
  align-items:center;
  gap:16px;
  margin-bottom:36px;
  justify-content:flex-start;
}

/* 원형 배지 공통 */
.snmt-badge{
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  width:90px;
  height:90px;
  border-radius:50%;
  border:2.5px solid rgba(255,255,255,.35);
  background:rgba(255,255,255,.06);
  gap:2px;
  flex-shrink:0;
}
/* 중앙 주인공 배지 — accent 테두리 + 더 큰 사이즈 */
.snmt-badge.featured{
  width:110px;
  height:110px;
  border-color:var(--accent);
  background:rgba(255,255,255,.1);
}

.snmt-badge-nutrient{
  font-family:var(--font-body);
  font-size:11px;
  font-weight:600;
  color:rgba(255,255,255,.65);
  letter-spacing:.02em;
}
.snmt-badge.featured .snmt-badge-nutrient{
  color:var(--accent);
}

.snmt-badge-val{
  font-family:var(--font-display);
  font-weight:800;
  font-size:22px;
  line-height:1;
  color:#fff;
  letter-spacing:-.02em;
}
.snmt-badge.featured .snmt-badge-val{
  font-size:28px;
  color:#fff;
}

.snmt-badge-unit{
  font-family:var(--font-body);
  font-size:10px;
  color:rgba(255,255,255,.5);
  letter-spacing:.02em;
}
.snmt-badge.featured .snmt-badge-unit{
  color:rgba(255,255,255,.75);
}

/* 테이블 + 이미지 레이아웃 */
.snmt-body{
  display:grid;
  grid-template-columns:1fr auto;
  gap:20px;
  align-items:start;
}

/* 영양성분 테이블 */
.snmt-table{
  width:100%;
  border-collapse:collapse;
}

/* 테이블 헤더행 */
.snmt-th{
  font-family:var(--font-body);
  font-size:11px;
  font-weight:600;
  color:rgba(255,255,255,.4);
  letter-spacing:.03em;
  text-align:right;
  padding:0 0 8px;
  border-bottom:1px solid rgba(255,255,255,.18);
}
.snmt-th:first-child{
  text-align:left;
}

/* 데이터 행 */
.snmt-td{
  font-family:var(--font-body);
  font-size:14px;
  font-weight:500;
  color:rgba(255,255,255,.85);
  padding:9px 0;
  border-bottom:1px solid rgba(255,255,255,.08);
  text-align:right;
  line-height:1.35;
}
.snmt-td:first-child{
  text-align:left;
  font-weight:600;
}

/* 하위 항목 — 들여쓰기 + 작은 폰트 + 연한 색 */
.snmt-row-sub .snmt-td{
  font-size:12.5px;
  font-weight:400;
  color:rgba(255,255,255,.55);
  padding:6px 0;
}
.snmt-row-sub .snmt-td:first-child{
  padding-left:14px;
  font-weight:500;
}

/* 퍼센트 강조 */
.snmt-pct-hl{
  color:var(--accent);
  font-weight:700;
}

/* 플로팅 제품 이미지 */
.snmt-product-img{
  width:88px;
  aspect-ratio:2/3;
  object-fit:cover;
  border-radius:10px;
  display:block;
  margin-top:4px;
}
.snmt-product-img.ph{
  width:88px;
  aspect-ratio:2/3;
  border:2px dashed rgba(255,255,255,.2);
  background:rgba(255,255,255,.06);
  color:rgba(255,255,255,.3);
  border-radius:10px;
  font-size:11px;
}

/* 주석 */
.snmt-footnote{
  font-family:var(--font-body);
  font-size:11px;
  color:rgba(255,255,255,.35);
  margin-top:16px;
  text-align:right;
  letter-spacing:.01em;
}
`,
  render: (d, { esc, richSafe }) => {
    // 매크로 배지
    const badgesHtml = d.macros
      .map((m) => {
        const cls = m.featured ? 'snmt-badge featured' : 'snmt-badge'
        return `
      <div class="${cls}">
        <span class="snmt-badge-nutrient">${esc(m.nutrient)}</span>
        <span class="snmt-badge-val">${esc(m.value)}</span>
        <span class="snmt-badge-unit">${esc(m.unit)}</span>
      </div>`
      })
      .join('')

    // 영양성분 테이블 행
    const rowsHtml = d.rows
      .map((r) => {
        const rowCls = r.sub ? 'snmt-row-sub' : ''
        const pctHtml = r.pct
          ? `<td class="snmt-td">${r.highlight ? `<span class="snmt-pct-hl">${esc(r.pct)}</span>` : esc(r.pct)}</td>`
          : `<td class="snmt-td">—</td>`
        return `
      <tr class="${rowCls}">
        <td class="snmt-td">${richSafe(r.label)}</td>
        <td class="snmt-td">${esc(r.amount)}</td>
        ${pctHtml}
      </tr>`
      })
      .join('')

    const productHtml = media(
      d.productImage,
      'snmt-product-img',
      esc(d.productImageAlt ?? '제품 이미지'),
    )

    return `
<section class="snmt">
  <h2 class="snmt-title">${richSafe(d.title)}</h2>
  <div class="snmt-macros">
    ${badgesHtml}
  </div>
  <div class="snmt-body">
    <table class="snmt-table">
      <thead>
        <tr>
          <th class="snmt-th">영양소</th>
          <th class="snmt-th">함량</th>
          <th class="snmt-th">기준치</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
    ${productHtml}
  </div>
  ${d.footnote ? `<p class="snmt-footnote">${esc(d.footnote)}</p>` : ''}
</section>`
  },
})
