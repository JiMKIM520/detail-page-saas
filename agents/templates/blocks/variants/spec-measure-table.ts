/** SPEC 아키타입: spec-measure-table
 *  출처: 피그마 제품정보/05 — 측정법 이미지 + CSS 말풍선 주석 + 다크 헤더 사이즈 표.
 *  구조 흡수: 어두운 패널 헤더 + 이미지 위 pill 배지(치수·부위) + 지시선 CSS + 얼룩말 표.
 *  벡터 장식(치수선·말풍선)은 인라인 SVG / CSS로 재구성. 이미지 에셋 참조 없음.
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

// ─────────────────────────────────────────────
//  스키마
// ─────────────────────────────────────────────

const calloutSchema = z.object({
  label: z.string().min(1),        // 말풍선 라벨 (예: "둘레", "10cm")
  posX: z.string().min(1),         // CSS left 값 (예: "58%")
  posY: z.string().min(1),         // CSS top 값  (예: "42%")
  dir: z.enum(['left', 'right', 'up', 'down']).optional(), // 꼬리 방향 (기본 down)
})

const rowSchema = z.object({
  size: z.string().min(1),         // 사이즈 라벨 (예: "S", "M", "L", "XL")
  measure: z.string().min(1),      // 측정값 범위 (예: "30 ~ 35cm") — 브리프에 수치 근거 있을 때만
  desc: z.string().optional(),     // 권장 체형 설명 (예: "소형") — optional, 브리프 근거 필요
})

const schema = z.object({
  // 섹션 헤더
  sectionEn: z.string().optional(),    // 영문 소제목 (예: "size guide") — em 허용
  title: z.string().min(1),            // 한글 대제목 (em,br) 허용
  // 측정법 패널
  panelTitle: z.string().min(1),       // 다크 헤더 텍스트 (예: "무릎 둘레 측정법")
  image: z.string().optional(),        // 측정 이미지 URL
  callouts: z.array(calloutSchema).min(1).max(4), // 이미지 위 말풍선 (1~4개)
  tips: z.array(z.string().min(1)).min(1).max(4), // 이미지 하단 측정 유의사항 텍스트
  // 사이즈 표
  col1: z.string().optional(),         // 1열 헤더 (기본 "사이즈")
  col2: z.string().optional(),         // 2열 헤더 (기본 "측정 기준") — 브리프에 근거 있을 때만
  col3: z.string().optional(),         // 3열 헤더 (기본 "권장 체형") — optional, 브리프 근거 필요
  rows: z.array(rowSchema).min(2).max(8),
})

type Data = z.infer<typeof schema>

// ─────────────────────────────────────────────
//  CSS (접두 smtb)
// ─────────────────────────────────────────────

const css = `
.smtb{background:var(--bg);padding:60px var(--pad-x,56px) 68px;color:var(--ink)}
/* 섹션 헤더 */
.smtb-en{display:block;font-family:var(--font-lat);font-size:15px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:10px}
.smtb-title{font-family:var(--font-display);font-weight:800;font-size:38px;line-height:1.2;color:var(--ink);margin-bottom:36px}
.smtb-title .em{color:var(--accent)}
/* 측정법 패널 */
.smtb-panel{border-radius:calc(var(--r-scale,1)*14px);overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
/* 다크 헤더 */
.smtb-panel-hd{background:var(--brand);padding:18px 28px}
.smtb-panel-hd-text{font-family:var(--font-body);font-weight:600;font-size:18px;color:#fff;text-align:center;letter-spacing:.02em}
/* 이미지 + 말풍선 영역 */
.smtb-img-wrap{position:relative;width:100%;background:var(--paper)}
.smtb-img-wrap img,.smtb-img-wrap .ph{width:100%;aspect-ratio:16/9;object-fit:cover;display:block;border-radius:var(--shape-photo, 0)}
/* 말풍선 배지 */
.smtb-callout{position:absolute;transform:translate(-50%,-50%)}
.smtb-badge{display:inline-flex;align-items:center;gap:6px;background:var(--accent);color:#fff;font-family:var(--font-body);font-weight:700;font-size:13px;padding:5px 14px;border-radius:999px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.18)}
/* 말풍선 꼬리 — pseudo로 방향별 생성 */
.smtb-callout::after{content:'';position:absolute;left:50%;transform:translateX(-50%);border:6px solid transparent}
.smtb-callout[data-dir="down"]::after{top:100%;border-top-color:var(--accent);border-bottom:none;margin-top:-1px}
.smtb-callout[data-dir="up"]::after{bottom:100%;border-bottom-color:var(--accent);border-top:none;margin-bottom:-1px}
.smtb-callout[data-dir="left"]::after{right:100%;top:50%;transform:translateY(-50%);border-right-color:var(--accent);border-left:none;margin-right:-1px;left:auto}
.smtb-callout[data-dir="right"]::after{left:100%;top:50%;transform:translateY(-50%);border-left-color:var(--accent);border-right:none;margin-left:-1px}
/* 지시선 SVG (배지에서 이미지 중심 방향) */
.smtb-line{position:absolute;pointer-events:none;overflow:visible}
/* 유의사항 텍스트 */
.smtb-tips{background:var(--paper);padding:18px 24px;display:flex;flex-direction:column;gap:6px}
.smtb-tip{font-size:14px;color:var(--ink-2);line-height:1.7;padding-left:16px;position:relative}
.smtb-tip::before{content:'·';position:absolute;left:4px;color:var(--accent);font-weight:700}
/* 사이즈 표 */
.smtb-tbl-wrap{margin-top:28px;border-radius:calc(var(--r-scale,1)*14px);overflow:hidden;border:1px solid var(--line)}
.smtb-tbl{width:100%;border-collapse:collapse;font-size:15px}
.smtb-tbl-hd-row{background:var(--brand)}
.smtb-tbl-hd-row th{color:#fff;font-weight:600;padding:16px 12px;text-align:center;font-family:var(--font-body);font-size:14px;letter-spacing:.03em}
.smtb-tbl-hd-row th:first-child{color:#fff}
.smtb-tbl-hd-row th:not(:first-child){color:rgba(255,255,255,.65)}
.smtb-tbl tr.smtb-row-alt{background:var(--paper)}
.smtb-tbl tr.smtb-row-base{background:var(--bg)}
.smtb-tbl td{padding:14px 12px;text-align:center;font-family:var(--font-body);border-top:1px solid var(--line)}
.smtb-tbl td.smtb-td-size{font-weight:700;color:var(--ink)}
.smtb-tbl td.smtb-td-measure{color:var(--ink-2);font-size:14px}
.smtb-tbl td.smtb-td-desc{color:var(--muted);font-size:14px}
/* 다크 섹션 em 보정 */
.smtb .em{color:var(--em-dark,#FFF7EA)}
`

// ─────────────────────────────────────────────
//  렌더
// ─────────────────────────────────────────────

export const specMeasureTable = defineBlock<Data>({
  id: 'spec-measure-table',
  archetype: 'spec',
  styleTags: ['dark-header', 'table', 'annotated', 'measurement', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '측정법 이미지+CSS 말풍선 주석(1~4개 pill 배지·꼬리 방향 지정)+다크 헤더 사이즈 표(2~8행). 의류·잡화·의료기기 등 측정 기준이 필요한 상품 spec 섹션. 수치·체형 설명 슬롯은 브리프에 근거 있을 때만 채울 것.',
  schema,
  css,
  render: (d, { esc, richSafe }) => {
    const col1 = esc(d.col1 ?? '사이즈')
    const col2 = esc(d.col2 ?? '측정 기준')
    const hasCol3 = d.rows.some((r) => r.desc)
    const col3Header = hasCol3 ? `<th>${esc(d.col3 ?? '권장 체형')}</th>` : ''

    const calloutsHtml = d.callouts
      .map((c) => {
        const dir = c.dir ?? 'down'
        return `<div class="smtb-callout" data-dir="${dir}" style="left:${esc(c.posX)};top:${esc(c.posY)}">
          <span class="smtb-badge">${esc(c.label)}</span>
        </div>`
      })
      .join('')

    const tipsHtml = d.tips
      .map((t) => `<p class="smtb-tip">${esc(t)}</p>`)
      .join('')

    const rowsHtml = d.rows
      .map(
        (r, i) => `<tr class="${i % 2 === 0 ? 'smtb-row-base' : 'smtb-row-alt'}">
          <td class="smtb-td-size">${esc(r.size)}</td>
          <td class="smtb-td-measure">${esc(r.measure)}</td>
          ${hasCol3 ? `<td class="smtb-td-desc">${esc(r.desc ?? '')}</td>` : ''}
        </tr>`,
      )
      .join('')

    return `
<section class="smtb">
  ${d.sectionEn ? `<span class="smtb-en">${richSafe(d.sectionEn)}</span>` : ''}
  <h2 class="smtb-title">${richSafe(d.title)}</h2>

  <div class="smtb-panel">
    <div class="smtb-panel-hd">
      <p class="smtb-panel-hd-text">${esc(d.panelTitle)}</p>
    </div>
    <div class="smtb-img-wrap">
      ${media(d.image, 'smtb-img', d.panelTitle)}
      ${calloutsHtml}
    </div>
    <div class="smtb-tips">
      ${tipsHtml}
    </div>
  </div>

  <div class="smtb-tbl-wrap">
    <table class="smtb-tbl">
      <thead>
        <tr class="smtb-tbl-hd-row">
          <th>${col1}</th>
          <th>${col2}</th>
          ${col3Header}
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
  </div>
</section>`
  },
})
