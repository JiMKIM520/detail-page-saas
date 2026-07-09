/** COMPARE 아키타입: compare-tri-axis.
 *  피그마 302_비교_13 구조 흡수.
 *  3열(경쟁사 | 중앙 축 | 자사) 대칭 비교표.
 *  중앙 열에 원형 vs 뱃지를 배치해 좌우 컬럼의 축 역할을 하고,
 *  최대 6개 비교 행을 수평선으로 구분한다.
 *  자사 열만 accent 색상으로 강조. 라이트 배경. 이미지 없이도 안전하게 렌더(noimg-safe). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const rowSchema = z.object({
  label: z.string().min(1),          // 중앙 행 레이블 (예: "무선 사용")
  rival: z.string().min(1),          // 경쟁사 평가값 (예: "x", "낮음")
  ours: z.string().min(1),           // 자사 평가값 (예: "o", "높음")
})

const schema = z.object({
  title: z.string().min(1),          // (em,br) 섹션 대제목
  subtitle: z.string().optional(),   // 대제목 아래 한 줄 부제
  rivalName: z.string().min(1),      // 경쟁사 컬럼 이름 (예: "일반 선풍기")
  oursName: z.string().min(1),       // 자사 컬럼 이름 (예: "해피홈 선풍기")
  rivalImage: z.string().optional(), // 경쟁사 상단 제품 이미지 (url)
  oursImage: z.string().optional(),  // 자사 상단 제품 이미지 (url)
  rows: z.array(rowSchema).min(2).max(6),
})
type Data = z.infer<typeof schema>

export const compareTriAxis = defineBlock<Data>({
  id: 'compare-tri-axis',
  archetype: 'compare',
  styleTags: ['light', 'editorial', 'noimg-safe'],
  imageSlots: 2,
  describe:
    '3열 대칭 비교표(경쟁사·자사). 중앙 열에 원형 vs 뱃지가 좌우 컬럼을 가르는 축 역할. 자사 열만 accent 강조. 상단 제품명+이미지 헤더, 최대 6개 비교 행. 라이트 배경. 이미지 부재 시 제품명+색 블록으로 강등.',
  schema,
  css: `
/* ── compare-tri-axis (czbk) ────────────────────────── */
.czbk{background:var(--bg);color:var(--ink);padding:60px var(--pad-x,56px) 70px}
.czbk-hd{text-align:center;margin-bottom:44px}
.czbk-title{font-family:var(--font-display);font-weight:800;font-size:clamp(28px,4vw,48px);line-height:1.18;color:var(--ink)}
.czbk-title .em{color:var(--accent)}
.czbk-sub{margin-top:12px;font-size:17px;font-weight:500;color:var(--ink-2)}
/* 3열 그리드 */
.czbk-grid{display:grid;grid-template-columns:1fr 130px 1fr;gap:0;max-width:800px;margin:0 auto}
/* 좌·우 컬럼 공통 */
.czbk-col{border-radius:calc(var(--r-scale,1)*18px);overflow:visible;display:flex;flex-direction:column}
/* 경쟁사(왼쪽) */
.czbk-rival{background:color-mix(in srgb,var(--accent) 12%,var(--paper,#f5f5f5) 88%)}
/* 자사(오른쪽) */
.czbk-ours{background:color-mix(in srgb,var(--accent) 18%,var(--paper,#f5f5f5) 82%)}
/* 컬럼 헤더 */
.czbk-col-hd{border-radius:calc(var(--r-scale,1)*18px) calc(var(--r-scale,1)*18px) 0 0;overflow:hidden;flex:0 0 auto}
.czbk-rival .czbk-col-hd{background:color-mix(in srgb,var(--accent) 35%,#8ba5b2 65%)}
.czbk-ours .czbk-col-hd{background:var(--accent)}
/* 제품 이미지 프레임 */
.czbk-img-wrap{width:100%;aspect-ratio:1/1;overflow:hidden;background:rgba(0,0,0,.08)}
.czbk-img-wrap img,.czbk-img-wrap .ph{width:100%;height:100%;object-fit:cover}
/* 이미지 없을 때 강등: 색 블록으로 */
.czbk-img-fallback{width:100%;aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.08)}
.czbk-col-name{font-family:var(--font-body);font-size:17px;font-weight:700;text-align:center;padding:14px 12px}
.czbk-rival .czbk-col-name{color:#e8f0f4}
.czbk-ours .czbk-col-name{color:#fff}
/* 비교 행 */
.czbk-rows{flex:1;display:flex;flex-direction:column}
.czbk-cell{flex:1;display:flex;align-items:center;justify-content:center;font-family:var(--font-body);font-size:17px;font-weight:500;padding:14px 8px;border-top:1px solid rgba(0,0,0,.08);text-align:center;min-height:52px}
.czbk-rival .czbk-cell{color:var(--ink-2)}
.czbk-ours .czbk-cell{color:var(--accent);font-weight:700}
/* 중앙 축 열 */
.czbk-axis{display:flex;flex-direction:column;align-items:center;position:relative;z-index:2}
/* vs 원형 뱃지 */
.czbk-vs-wrap{flex:0 0 auto;display:flex;align-items:center;justify-content:center;padding:8px 0}
.czbk-vs{width:72px;height:72px;border-radius:50%;background:#fff;box-shadow:0 4px 18px -4px rgba(0,0,0,.18);display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-size:22px;font-weight:800;color:var(--accent);letter-spacing:-.01em;margin-top:8px}
/* 축 레이블 열 */
.czbk-axis-rows{flex:1;display:flex;flex-direction:column;width:100%}
.czbk-axis-cell{flex:1;display:flex;align-items:center;justify-content:center;font-family:var(--font-body);font-size:14px;font-weight:700;color:var(--ink);text-align:center;padding:0 6px;border-top:1px solid var(--line,#e0e0e0);min-height:52px}
/* 축 뱃지 높이를 헤더와 맞추기 위한 스페이서 */
.czbk-axis-hd-spacer{flex:0 0 auto}
`,
  render: (d, { esc, richSafe, icon }) => {
    const hasRivalImg = typeof d.rivalImage === 'string' && d.rivalImage.length > 0
    const hasOursImg  = typeof d.oursImage  === 'string' && d.oursImage.length  > 0

    // 헤더 이미지 프레임 — 이미지 부재 시 색 블록으로 강등(noimg-safe)
    const rivalImgHtml = hasRivalImg
      ? `<div class="czbk-img-wrap">${media(d.rivalImage, '', '경쟁사 제품')}</div>`
      : `<div class="czbk-img-fallback" aria-hidden="true"></div>`

    const oursImgHtml = hasOursImg
      ? `<div class="czbk-img-wrap">${media(d.oursImage, '', '자사 제품')}</div>`
      : `<div class="czbk-img-fallback" aria-hidden="true"></div>`

    const rowsRival = d.rows
      .map(r => `<div class="czbk-cell">${esc(r.rival)}</div>`)
      .join('')

    const rowsOurs = d.rows
      .map(r => `<div class="czbk-cell">${esc(r.ours)}</div>`)
      .join('')

    // 축 높이 스페이서: 헤더(이미지+이름) 영역 높이와 맞춰야 vs 뱃지가 중앙에 떠 보임
    // 이미지 aspect-ratio 1:1이므로 컬럼 폭 ≈ (800px - 130px)/2 = 335px → 이미지 높이 ≈ 335px
    // 이름 영역 약 47px. 합 ≈ 382px. 뱃지 72px. 스페이서 = (382 - 72)/2 ≈ 155px
    const axisRowsHtml = d.rows
      .map(r => `<div class="czbk-axis-cell">${esc(r.label)}</div>`)
      .join('')

    return `
<section class="czbk">
  <header class="czbk-hd">
    <h2 class="czbk-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="czbk-sub">${esc(d.subtitle)}</p>` : ''}
  </header>
  <div class="czbk-grid" role="table" aria-label="제품 비교표">
    <!-- 경쟁사 열 -->
    <div class="czbk-col czbk-rival" role="columnheader">
      <div class="czbk-col-hd">
        ${rivalImgHtml}
        <p class="czbk-col-name">${esc(d.rivalName)}</p>
      </div>
      <div class="czbk-rows" role="rowgroup">${rowsRival}</div>
    </div>
    <!-- 중앙 축 열 -->
    <div class="czbk-axis" aria-hidden="true">
      <div class="czbk-axis-hd-spacer" style="height:calc((100% - 72px - ${d.rows.length} * 52px) / 2);min-height:20px"></div>
      <div class="czbk-vs-wrap"><div class="czbk-vs">vs</div></div>
      <div class="czbk-axis-rows">${axisRowsHtml}</div>
    </div>
    <!-- 자사 열 -->
    <div class="czbk-col czbk-ours" role="columnheader">
      <div class="czbk-col-hd">
        ${oursImgHtml}
        <p class="czbk-col-name">${esc(d.oursName)}</p>
      </div>
      <div class="czbk-rows" role="rowgroup">${rowsOurs}</div>
    </div>
  </div>
</section>`
  },
})
