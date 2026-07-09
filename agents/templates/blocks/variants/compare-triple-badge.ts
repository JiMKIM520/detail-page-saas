/** COMPARE 아키타입: compare-triple-badge.
 *  피그마 115_비교_03 구조 흡수.
 *  알약형 배지(brand 필) + 대형 헤드라인 + 3열 비교표(자사 컬러 좌열·중앙 구분명·경쟁사 회색 우열)로
 *  자사 우위를 시각화하는 라이트 톤 비교 섹션. 이미지 슬롯 없음.
 */
import { z } from 'zod'
import { defineBlock } from '../types'

const rowSchema = z.object({
  label: z.string().min(1),   // 중앙 열 항목명 (예: "섭취 방법")
  ours: z.string().min(1),    // 좌열 자사 값 (em,br)
  theirs: z.string().min(1),  // 우열 경쟁사 값
})

const schema = z.object({
  badge: z.string().optional(),       // 알약형 배지 텍스트 (기본 생략)
  title: z.string().min(1),           // 대형 헤드라인 (em,br)
  subtitle: z.string().optional(),    // 헤드라인 아래 한 줄 (순수 텍스트)
  oursLabel: z.string().min(1),       // 좌열 제품명 헤더
  theirsLabel: z.string().min(1),     // 우열 경쟁 제품 헤더 (기본 "일반 제품")
  rows: z.array(rowSchema).min(2).max(8),
})
type Data = z.infer<typeof schema>

export const compareTripleBadge = defineBlock<Data>({
  id: 'compare-triple-badge',
  archetype: 'compare',
  styleTags: ['light', 'editorial', 'table'],
  imageSlots: 0,
  describe:
    '3열 비교 테이블 섹션. 상단 알약형 브랜드 배지 + 대형 헤드라인 + 자사(좌, 브랜드 컬러 필)·구분(중, 연회색)·경쟁사(우, 회색) 3열 비교표. 자사 우위를 컬러 대비로 즉시 전달. 건강식품·뷰티·생활용품에 적합.',
  schema,
  css: `
.ctb{background:var(--bg);color:var(--ink);padding:56px var(--pad-x,56px) 64px;text-align:center}
/* 배지 */
.ctb-badge-wrap{display:flex;justify-content:center;margin-bottom:20px}
.ctb-badge{display:inline-block;background:var(--brand);color:var(--bg);font-family:var(--font-display);font-weight:700;font-size:17px;padding:10px 26px;border-radius:999px;letter-spacing:.01em}
/* 헤드라인 */
.ctb-title{font-family:var(--font-display);font-weight:800;font-size:clamp(38px,6vw,60px);color:var(--ink);line-height:1.15;letter-spacing:-.025em}
.ctb-title .em{color:var(--accent)}
.ctb-rule{width:60%;max-width:440px;height:1px;background:var(--line);margin:18px auto 0}
.ctb-sub{margin-top:14px;font-size:18px;font-weight:400;color:var(--ink-2);line-height:1.5}
/* 표 래퍼 */
.ctb-table{margin:36px auto 0;width:100%;max-width:760px;display:grid;grid-template-columns:7fr 4fr 5fr;border-radius:calc(var(--r-scale,1)*16px);overflow:hidden}
/* 헤더 행 */
.ctb-hd-ours{background:var(--accent);color:var(--bg);font-family:var(--font-display);font-weight:700;font-size:18px;padding:20px 12px;line-height:1.3}
.ctb-hd-mid{background:var(--paper);color:var(--ink-2);font-family:var(--font-display);font-weight:700;font-size:16px;padding:20px 8px;line-height:1.3}
.ctb-hd-theirs{background:color-mix(in srgb,var(--muted) 35%,var(--bg));color:var(--ink-2);font-family:var(--font-display);font-weight:600;font-size:16px;padding:20px 10px;line-height:1.3}
/* 데이터 셀 — 짝수 행은 미세한 스트라이프 */
.ctb-cell-ours{background:var(--accent);color:var(--bg);font-weight:700;font-size:clamp(15px,2vw,18px);padding:16px 12px;line-height:1.35;border-top:1px solid color-mix(in srgb,var(--bg) 20%,var(--accent))}
.ctb-cell-ours .em{color:var(--bg);text-decoration:underline;text-underline-offset:3px}
.ctb-cell-mid{background:var(--paper);color:var(--ink-2);font-weight:600;font-size:14px;padding:16px 8px;line-height:1.4;border-top:1px solid var(--line)}
.ctb-cell-theirs{background:color-mix(in srgb,var(--muted) 35%,var(--bg));color:var(--muted);font-weight:400;font-size:clamp(14px,2vw,16px);padding:16px 10px;line-height:1.35;border-top:1px solid color-mix(in srgb,var(--muted) 15%,var(--bg))}
`,
  render: (d, { esc, richSafe }) => {
    const rows = d.rows
      .map(
        (r) => `
    <div class="ctb-cell-ours">${richSafe(r.ours)}</div>
    <div class="ctb-cell-mid">${esc(r.label)}</div>
    <div class="ctb-cell-theirs">${esc(r.theirs)}</div>`,
      )
      .join('')

    return `
<section class="ctb">
  ${d.badge ? `<div class="ctb-badge-wrap"><span class="ctb-badge">${esc(d.badge)}</span></div>` : ''}
  <h2 class="ctb-title disp">${richSafe(d.title)}</h2>
  <div class="ctb-rule"></div>
  ${d.subtitle ? `<p class="ctb-sub">${esc(d.subtitle)}</p>` : ''}
  <div class="ctb-table" role="table" aria-label="제품 비교">
    <div class="ctb-hd-ours" role="columnheader">${esc(d.oursLabel)}</div>
    <div class="ctb-hd-mid" role="columnheader">구분</div>
    <div class="ctb-hd-theirs" role="columnheader">${esc(d.theirsLabel)}</div>
    ${rows}
  </div>
</section>`
  },
})
