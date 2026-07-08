/** DETAIL 아키타입(템플릿 충실 재현): 17_제품설명 _compare-table.
 *  헤드라인+서브카피 → 3열 비교표(비교항목|일반제품|우리제품 강조). 경쟁 우위 소구.
 *  Figma node 721:414. 이미지 불필요 — 순수 텍스트/표 레이아웃. */
import { z } from 'zod'
import { defineBlock } from '../types'

const rowSchema = z.object({
  feature: z.string().min(1),   // 비교 항목 (예: "소비 전력")
  generic: z.string().min(1),   // 일반 제품 설명 (em,br)
  ours: z.string().min(1),      // 우리 제품 설명 (em,br)
})

const schema = z.object({
  eyebrow: z.string().min(1).optional(),      // 소제목 레이블 (예: "MOTOR TECHNOLOGY")
  title: z.string().min(1),                   // 대제목 헤드라인 (em,br)
  subtitle: z.string().min(1).optional(),     // 소제목/태그라인 (예: "BLDC 모터의 기술력")
  body: z.string().min(1).optional(),         // 본문 설명 (em,br)
  genericLabel: z.string().min(1).optional(), // 일반 제품 열 헤더 (기본 "일반 제품")
  oursLabel: z.string().min(1),               // 우리 제품 열 헤더 (em,br)
  featureLabel: z.string().min(1).optional(), // 비교 항목 열 헤더 (기본 "비교 항목")
  rows: z.array(rowSchema).min(2).max(8),     // 비교 행 (em,br)
})
type Data = z.infer<typeof schema>

export const detailCompareTable = defineBlock<Data>({
  id: 'detail-compare-table',
  archetype: 'detail',
  styleTags: ['premium', 'light', 'editorial', 'template', 'compare'],
  imageSlots: 0,
  describe:
    '제품 설명(3열 비교표). eyebrow+대제목+서브+본문 → 3열 비교표(비교항목|일반제품|우리제품 강조). 경쟁 우위 소구. 이미지 불필요.',
  schema,
  css: `
.dct{background:var(--bg);color:var(--ink);padding:60px 0 64px}

/* ─ 헤더 ─ */
.dct-hd{padding:0 var(--pad-x,56px) 48px}
.dct-eyebrow{font-size:12px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-2);margin-bottom:18px}
.dct-title{font-family:var(--font-display);font-weight:800;font-size:52px;letter-spacing:-.025em;line-height:1.12;color:var(--ink);margin-bottom:20px}
.dct-title .em{color:var(--accent)}
.dct-subtitle{font-family:var(--font-display);font-weight:800;font-size:26px;color:var(--ink);margin-bottom:16px;line-height:1.3}
.dct-body{font-size:16px;color:var(--ink-2);line-height:1.75}
.dct-body .em{color:var(--accent);font-weight:700}

/* ─ 테이블 ─ */
.dct-table{margin:0 40px;border-collapse:collapse;width:calc(100% - 80px)}

/* ─ 헤더 행 ─ */
.dct-table thead tr{border-bottom:2px solid var(--line)}
.dct-th{padding:20px 16px 18px;font-family:var(--font-display);font-weight:800;font-size:16px;color:var(--ink);text-align:center;vertical-align:bottom;line-height:1.35;border-bottom:2px solid var(--line)}
.dct-th:first-child{text-align:left;color:var(--muted);font-weight:600;font-size:14px}
.dct-th-feat{width:22%;border-bottom:2px solid var(--line)}
.dct-th-gen{width:38%;border-bottom:2px solid var(--line)}
.dct-th-ours{width:40%;border-top:3px solid var(--accent);background:color-mix(in srgb,var(--accent) 6%,transparent);color:var(--ink);border-bottom:2px solid var(--accent)}

/* ─ 데이터 행 ─ */
.dct-table tbody tr{border-bottom:1px solid var(--line)}
.dct-table tbody tr:last-child{border-bottom:1px solid var(--line)}
.dct-td{padding:22px 16px;font-size:15px;color:var(--ink-2);text-align:center;vertical-align:middle;line-height:1.6}
.dct-td:first-child{text-align:left;font-size:14px;font-weight:600;color:var(--ink);padding-left:4px}
.dct-td-gen{color:var(--ink-2)}
.dct-td-ours{background:color-mix(in srgb,var(--accent) 6%,transparent);font-weight:700;color:var(--ink)}
.dct-td .em,.dct-td-ours .em{color:var(--accent);font-weight:800}
`,
  render: (d, { esc, richSafe }) => `
<section class="dct">
  <div class="dct-hd">
    ${d.eyebrow ? `<p class="dct-eyebrow">${esc(d.eyebrow)}</p>` : ''}
    <h2 class="dct-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="dct-subtitle">${esc(d.subtitle)}</p>` : ''}
    ${d.body ? `<p class="dct-body">${richSafe(d.body)}</p>` : ''}
  </div>
  <table class="dct-table">
    <thead>
      <tr>
        <th class="dct-th dct-th-feat">${esc(d.featureLabel ?? '비교 항목')}</th>
        <th class="dct-th dct-th-gen">${esc(d.genericLabel ?? '일반 제품')}</th>
        <th class="dct-th dct-th-ours">${richSafe(d.oursLabel)}</th>
      </tr>
    </thead>
    <tbody>
      ${d.rows.map(row => `
      <tr>
        <td class="dct-td">${esc(row.feature)}</td>
        <td class="dct-td dct-td-gen">${richSafe(row.generic)}</td>
        <td class="dct-td dct-td-ours">${richSafe(row.ours)}</td>
      </tr>`).join('')}
    </tbody>
  </table>
</section>`,
})
