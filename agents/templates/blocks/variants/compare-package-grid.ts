/** COMPARE 아키타입: compare-package-grid
 *  피그마 "추천 및 B&A 구성 페이지_16" 재구성.
 *  연파랑 배경 + 상단 제품군 헤드라인 + 중앙 3개 제품 세로 패키지 이미지 나란히
 *  + 하단 다항목 비교 테이블(행별 체크/X) 통합 구성. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const productSchema = z.object({
  name: z.string().min(1),            // 제품명 (한글)
  subName: z.string().optional(),     // 영문 브랜드/라인명
  image: z.string().optional(),       // 세로 패키지 이미지 (url)
  accentColor: z.string().optional(), // 제품별 강조색 (CSS 색값). 미지정 시 --accent 계단 사용
})
type Product = z.infer<typeof productSchema>

const cellValueSchema = z.union([z.literal('check'), z.literal('x'), z.string()])

const rowSchema = z.object({
  label: z.string().min(1),           // 비교 항목명
  v0: cellValueSchema,                // 제품1 값 — 'check' | 'x' | 텍스트
  v1: cellValueSchema,                // 제품2 값
  v2: cellValueSchema,                // 제품3 값
})
type Row = z.infer<typeof rowSchema>

const schema = z.object({
  headline: z.string().min(1),        // 제품군 상단 타이틀 (em,br 허용)
  subheadline: z.string().optional(), // 비교 섹션 부제 (em,br)
  p0: productSchema,                  // 제품1
  p1: productSchema,                  // 제품2
  p2: productSchema,                  // 제품3
  rows: z.array(rowSchema).min(2).max(10),
  note: z.string().optional(),        // 하단 주석 (순수 텍스트)
})
type Data = z.infer<typeof schema>

export const comparePackageGrid = defineBlock<Data>({
  id: 'compare-package-grid',
  archetype: 'compare',
  styleTags: ['light', 'product', 'table', 'noimg-safe'],
  imageSlots: 3,
  describe:
    '3개 제품 패키지 이미지 나란히 + 다항목 비교 테이블 통합. 연파랑 배경, 상단 헤드라인, 제품별 색상 레이블, 세로 패키지 컬럼, 행별 체크/X/텍스트 테이블. 뷰티·식품·생활용품 경쟁 비교에 적합.',
  schema,
  css: `
.ctpg{background:#e8f2ff;background:color-mix(in srgb,var(--accent,#4a7fc4) 8%,var(--bg,#fff));padding:60px var(--pad-x,56px) 56px;color:var(--ink)}
.ctpg-hd{margin-bottom:40px}
.ctpg-hl{font-family:var(--font-body),'Pretendard',sans-serif;font-weight:400;font-size:17px;color:var(--ink-2);margin-bottom:8px}
.ctpg-sub{font-family:var(--font-display),'Pretendard',sans-serif;font-weight:800;font-size:48px;line-height:1.08;letter-spacing:-.02em;color:var(--ink)}
.ctpg-sub .em{color:var(--accent)}
.ctpg-cols{display:grid;grid-template-columns:1fr 1fr 1fr;gap:0;margin-bottom:36px}
.ctpg-col{display:flex;flex-direction:column;align-items:center;gap:0}
.ctpg-col-label{text-align:center;padding-bottom:14px}
.ctpg-col-name{font-family:var(--font-display),'Pretendard',sans-serif;font-weight:700;font-size:26px;line-height:1.1;color:var(--accent)}
.ctpg-col-sub{font-size:14px;font-weight:400;color:var(--ink-2);margin-top:3px;font-family:var(--font-body),'Pretendard',sans-serif}
.ctpg-pkg{width:108px;aspect-ratio:108/280;border-radius:var(--shape-photo,calc(var(--r-scale,1)*10px));overflow:hidden;background:color-mix(in srgb,var(--accent) 12%,var(--bg,#fff));display:flex;align-items:center;justify-content:center}
.ctpg-pkg img{width:100%;height:100%;object-fit:contain}
.ctpg-pkg .ph{width:100%;height:100%;background:color-mix(in srgb,var(--accent) 8%,transparent)}
.ctpg-table{width:100%;border-collapse:collapse;border-radius:calc(var(--r-scale,1)*14px);overflow:hidden;box-shadow:0 2px 20px -4px rgba(0,0,0,.09)}
.ctpg-table thead tr{background:var(--brand,#1d3f8a)}
.ctpg-table thead .ctpg-th-label{background:var(--brand,#1d3f8a);color:#fff;font-family:var(--font-display),'Pretendard',sans-serif;font-weight:700;font-size:14px;padding:13px 16px;text-align:left;width:32%}
.ctpg-table thead .ctpg-th-prod{color:#fff;font-family:var(--font-display),'Pretendard',sans-serif;font-weight:700;font-size:14px;padding:13px 8px;text-align:center}
.ctpg-table tbody tr:nth-child(odd){background:#fff}
.ctpg-table tbody tr:nth-child(even){background:color-mix(in srgb,var(--accent) 5%,#fff)}
.ctpg-td-label{padding:14px 16px;font-family:var(--font-body),'Pretendard',sans-serif;font-size:14px;font-weight:600;color:var(--ink-2);border-right:1px solid color-mix(in srgb,var(--line,#ddd) 60%,transparent)}
.ctpg-td-val{padding:14px 8px;text-align:center;font-family:var(--font-body),'Pretendard',sans-serif;font-size:14px;font-weight:500;color:var(--ink-2)}
.ctpg-check{display:inline-flex;width:22px;height:22px;border-radius:50%;background:var(--accent);align-items:center;justify-content:center}
.ctpg-check svg{width:13px;height:13px;stroke:#fff;fill:none;stroke-width:2.8;stroke-linecap:round;stroke-linejoin:round}
.ctpg-x{display:inline-flex;width:22px;height:22px;border-radius:50%;background:#e2e8ef;align-items:center;justify-content:center}
.ctpg-x svg{width:12px;height:12px;stroke:#9babbe;fill:none;stroke-width:2.5;stroke-linecap:round}
.ctpg-note{margin-top:18px;font-size:12px;color:var(--muted);text-align:right;font-family:var(--font-body),'Pretendard',sans-serif}
`,
  render: (d, { esc, richSafe }) => {
    const prods: Product[] = [d.p0, d.p1, d.p2]
    const fallbacks = ['var(--accent)', 'color-mix(in srgb,var(--accent) 80%,#1a2e88)', '#2137b7']
    const prodColor = (p: Product, i: number): string =>
      p.accentColor ? esc(p.accentColor) : fallbacks[i]

    const cellHtml = (val: string): string => {
      if (val === 'check')
        return `<span class="ctpg-check"><svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg></span>`
      if (val === 'x')
        return `<span class="ctpg-x"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></span>`
      return `<span>${esc(val)}</span>`
    }

    const renderRow = (row: Row): string =>
      `<tr>
        <td class="ctpg-td-label">${esc(row.label)}</td>
        <td class="ctpg-td-val">${cellHtml(row.v0)}</td>
        <td class="ctpg-td-val">${cellHtml(row.v1)}</td>
        <td class="ctpg-td-val">${cellHtml(row.v2)}</td>
      </tr>`

    return `
<section class="ctpg">
  <div class="ctpg-hd">
    ${d.subheadline ? `<p class="ctpg-hl">${richSafe(d.subheadline)}</p>` : ''}
    <h2 class="ctpg-sub">${richSafe(d.headline)}</h2>
  </div>

  <div class="ctpg-cols">
    ${prods.map((p, i) => `
    <div class="ctpg-col">
      <div class="ctpg-col-label">
        <div class="ctpg-col-name" style="color:${prodColor(p, i)}">${esc(p.name)}</div>
        ${p.subName ? `<div class="ctpg-col-sub">${esc(p.subName)}</div>` : ''}
      </div>
      <div class="ctpg-pkg">
        ${media(p.image, '', `${esc(p.name)} 패키지`)}
      </div>
    </div>`).join('')}
  </div>

  <table class="ctpg-table">
    <thead>
      <tr>
        <th class="ctpg-th-label">비교 항목</th>
        ${prods.map((p, i) => `<th class="ctpg-th-prod" style="background:${prodColor(p, i)}">${esc(p.name)}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${d.rows.map(renderRow).join('')}
    </tbody>
  </table>

  ${d.note ? `<p class="ctpg-note">* ${esc(d.note)}</p>` : ''}
</section>`
  },
})
