/** DETAIL 아키타입(템플릿 충실 재현): 17_제품 설명 _17 (Figma 721:317).
 *  detail-spec-table: eyebrow + 제목 → 4열 스펙 표(항목|내용 × 2쌍, 반복 행) → 풀폭 CTA 바.
 *  전자제품·식품 공통 스펙 시트. 이미지 없음, 순수 텍스트 레이아웃. */
import { z } from 'zod'
import { defineBlock } from '../types'

const rowSchema = z.object({
  label: z.string().min(1),   // 왼쪽 항목명 (예: "제품명")
  value: z.string().min(1),   // 왼쪽 내용 (em, br 허용)
  label2: z.string().min(1).optional(), // 오른쪽 항목명 (없으면 빈 셀)
  value2: z.string().min(1).optional(), // 오른쪽 내용 (em, br 허용)
})

const schema = z.object({
  eyebrow: z.string().min(1).optional(),  // 소제목 (예: "PRODUCT INFORMATION")
  title: z.string().min(1),               // 대제목 (예: "제품 상세정보")
  rows: z.array(rowSchema).min(2).max(14), // 스펙 행 (2~14)
  cta: z.string().min(1).optional(),       // 풀폭 CTA 바 텍스트 (예: "고객센터 1588-0000")
})
type Data = z.infer<typeof schema>

export const detailSpecTable = defineBlock<Data>({
  id: 'detail-spec-table',
  archetype: 'detail',
  styleTags: ['light', 'minimal', 'template', 'spec'],
  imageSlots: 0,
  describe:
    '제품 스펙 표(4열). eyebrow+대제목 헤더 → 4열 그리드 스펙표(항목|내용 × 2쌍 반복 행) → 풀폭 CTA/고객센터 바. 전자제품·식품 공통 상세정보 시트. 이미지 없음.',
  schema,
  css: `
.dst{background:var(--bg);color:var(--ink);padding:54px 0 0}

/* ─ 헤더 ─ */
.dst-hd{padding:0 var(--pad-x,56px) 40px}
.dst-eyebrow{font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);margin-bottom:14px}
.dst-title{font-family:var(--font-display);font-weight:800;font-size:44px;color:var(--ink);letter-spacing:-.02em;line-height:1.1}

/* ─ 표 래퍼 ─ */
.dst-tbl{margin:0 40px;border-top:2px solid var(--ink);border-bottom:2px solid var(--ink)}

/* ─ 열머리 행 ─ */
.dst-thead{display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid var(--line)}
.dst-thead-half{display:grid;grid-template-columns:160px 1fr}
.dst-thead-half+.dst-thead-half{border-left:2px solid var(--ink)}
.dst-th{padding:16px 10px;font-size:14px;font-weight:700;color:var(--ink);text-align:center;background:color-mix(in srgb,var(--ink) 6%,transparent)}
.dst-th-val{padding:16px 10px;font-size:14px;font-weight:700;color:var(--ink);text-align:center;background:color-mix(in srgb,var(--ink) 6%,transparent)}

/* ─ 데이터 행 ─ */
.dst-row{display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid var(--line)}
.dst-row:last-child{border-bottom:none}
.dst-half{display:grid;grid-template-columns:160px 1fr;min-height:60px}
.dst-half+.dst-half{border-left:2px solid var(--ink)}
.dst-label{display:flex;align-items:center;justify-content:center;padding:14px 10px;font-size:14px;font-weight:600;color:var(--ink);text-align:center;background:color-mix(in srgb,var(--ink) 4%,transparent);line-height:1.4;border-right:1px solid var(--line)}
.dst-val{display:flex;align-items:center;justify-content:center;padding:14px 14px;font-size:14px;color:var(--ink);text-align:center;line-height:1.5}
.dst-val .em{color:var(--accent);font-weight:700}
.dst-empty{background:color-mix(in srgb,var(--ink) 2%,transparent)}

/* ─ CTA 바 ─ */
.dst-cta{margin:0;padding:22px 40px;background:color-mix(in srgb,var(--ink) 8%,transparent);text-align:center;font-size:16px;font-weight:600;color:var(--ink);letter-spacing:.02em}
`,
  render: (d, { esc, richSafe }) => `
<section class="dst">
  <div class="dst-hd">
    ${d.eyebrow ? `<p class="dst-eyebrow">${esc(d.eyebrow)}</p>` : ''}
    <h2 class="dst-title">${richSafe(d.title)}</h2>
  </div>
  <div class="dst-tbl">
    <div class="dst-thead">
      <div class="dst-thead-half">
        <div class="dst-th">항목</div>
        <div class="dst-th-val">내용</div>
      </div>
      <div class="dst-thead-half">
        <div class="dst-th">항목</div>
        <div class="dst-th-val">내용</div>
      </div>
    </div>
    ${d.rows.map(r => `
    <div class="dst-row">
      <div class="dst-half">
        <div class="dst-label">${esc(r.label)}</div>
        <div class="dst-val">${richSafe(r.value)}</div>
      </div>
      <div class="dst-half">
        ${(r.label2 && r.value2)
          ? `<div class="dst-label">${esc(r.label2)}</div><div class="dst-val">${richSafe(r.value2)}</div>`
          : `<div class="dst-label dst-empty"></div><div class="dst-val dst-empty"></div>`
        }
      </div>
    </div>`).join('')}
  </div>
  ${d.cta ? `<div class="dst-cta">${esc(d.cta)}</div>` : ''}
</section>`,
})
