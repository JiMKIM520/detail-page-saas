/** POINT 아키타입: point-highlight-stack
 *  피그마 266_포인트_09 구조 흡수.
 *  3개 포인트 섹션을 수직 스택. 각 섹션:
 *    ① "POINT N" 라인 레이블
 *    ② 대제목(1행) + 브랜드 컬러 배경 직사각형 인라인 하이라이트(핵심 키워드, 흰 글씨)
 *    ③ 전폭 제품 사진
 *    ④ 소제목 + 캡션 바 + 하단 상세(체크리스트 또는 원형 이미지+텍스트 행)
 *  noimg-safe: 이미지 부재 시 사진 프레임 은닉, 레이아웃 유지.
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

// ── 체크리스트 항목 ────────────────────────────────────────────
const checkItem = z.object({ text: z.string().min(1) })

// ── 원형 이미지+텍스트 행 ─────────────────────────────────────
const thumbItem = z.object({
  image: z.string().optional(),        // (url) 원형 프레임
  label: z.string().min(1),           // 굵은 소제목
  desc: z.string().min(1),            // 설명
})

// ── 섹션 유형: checklist 또는 thumbrow ────────────────────────
const detailChecklist = z.object({
  type: z.literal('checklist'),
  question: z.string().min(1),        // 캡션 바 텍스트 (예: "왜 18/8 스테인리스 스틸인가요?")
  items: z.array(checkItem).min(2).max(6),
  note: z.string().optional(),        // 하단 틴트 박스 메모 (optional)
})

const detailThumbrow = z.object({
  type: z.literal('thumbrow'),
  items: z.array(thumbItem).min(2).max(4),
})

const detailSection = z.discriminatedUnion('type', [detailChecklist, detailThumbrow])

// ── 개별 포인트 섹션 ──────────────────────────────────────────
const pointSection = z.object({
  pointLabel: z.string().optional(),  // 기본 "POINT N"
  headPlain: z.string().min(1),       // 대제목 첫 행 (일반 텍스트)
  headHighlight: z.string().min(1),   // 대제목 두 번째 행 — 브랜드색 배경 인라인 하이라이트
  subTitle: z.string().min(1),        // 하위 섹션 소제목
  subCaption: z.string().optional(),  // 캡션 바 텍스트 (소제목 아래 accent bar)
  bodyDesc: z.string().optional(),    // 소제목 아래 한 줄 설명
  image: z.string().optional(),       // 전폭 제품 사진 (url)
  detail: detailSection,
  tinted: z.boolean().optional(),     // true → 배경 옅은 틴트(accent 10%)
})

const schema = z.object({
  points: z.array(pointSection).min(1).max(4),
})

type Data = z.infer<typeof schema>
type PointSection = z.infer<typeof pointSection>
type DetailChecklist = z.infer<typeof detailChecklist>
type DetailThumbrow = z.infer<typeof detailThumbrow>

// ── 렌더 헬퍼 ─────────────────────────────────────────────────
function renderChecklist(d: DetailChecklist, esc: (s: string | undefined) => string): string {
  return `
  <div class="phs-detail">
    <div class="phs-question">
      <span class="phs-q-icon">${CHECK_SVG}</span>
      <span class="phs-q-text">${esc(d.question)}</span>
    </div>
    <div class="phs-checks">
      ${d.items
        .map(
          (it) => `
      <div class="phs-check-row">
        <span class="phs-dot">${CHECK_SVG}</span>
        <span class="phs-check-label">${esc(it.text)}</span>
      </div>`,
        )
        .join('')}
    </div>
    ${
      d.note
        ? `<div class="phs-note"><span class="phs-note-icon">${LEAF_SVG}</span><span>${esc(d.note)}</span></div>`
        : ''
    }
  </div>`
}

function renderThumbrow(d: DetailThumbrow, esc: (s: string | undefined) => string): string {
  return `
  <div class="phs-thumbrows">
    ${d.items
      .map(
        (it, i) => `
    <div class="phs-thumb-row${i % 2 === 1 ? ' rev' : ''}">
      <div class="phs-thumb-frame">${media(it.image, 'phs-thumb-img', esc(it.label))}</div>
      <div class="phs-thumb-body">
        <p class="phs-thumb-label">${esc(it.label)}</p>
        <p class="phs-thumb-desc">${esc(it.desc)}</p>
      </div>
    </div>`,
      )
      .join('')}
  </div>`
}

// inline SVG snippets (stroke=currentColor, will be coloured by CSS)
const CHECK_SVG =
  '<svg class="phs-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>'
const LEAF_SVG =
  '<svg class="phs-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19c0-8 6-14 15-14 0 9-6 15-15 14z"/><path d="M5 19C9 13 13 11 17 9"/></svg>'

function renderPoint(
  pt: PointSection,
  idx: number,
  esc: (s: string | undefined) => string,
): string {
  const label = pt.pointLabel ?? `POINT ${idx + 1}`
  const hasBg = pt.tinted === true

  return `
<div class="phs-pt${hasBg ? ' tinted' : ''}">
  <!-- ① POINT 라인 레이블 -->
  <div class="phs-line-label">
    <span class="phs-pt-num">${esc(label)}</span>
  </div>

  <!-- ② 대제목 + 인라인 하이라이트 -->
  <div class="phs-heading-wrap">
    <p class="phs-head-plain">${esc(pt.headPlain)}</p>
    <div class="phs-highlight-box">
      <span class="phs-highlight-text">${esc(pt.headHighlight)}</span>
    </div>
    ${pt.bodyDesc ? `<p class="phs-body-desc">${esc(pt.bodyDesc)}</p>` : ''}
  </div>

  <!-- ③ 전폭 제품 사진 (noimg-safe: .ph 은닉 처리됨) -->
  <div class="phs-photo-wrap">
    ${media(pt.image, 'phs-photo', esc(pt.headHighlight))}
  </div>

  <!-- ④ 하단 상세 섹션 -->
  <div class="phs-sub-wrap">
    <div class="phs-sub-header">
      <p class="phs-sub-title">${esc(pt.subTitle)}</p>
      ${pt.subCaption ? `<div class="phs-caption-bar"><span>${esc(pt.subCaption)}</span></div>` : ''}
    </div>
    ${
      pt.detail.type === 'checklist'
        ? renderChecklist(pt.detail, esc)
        : renderThumbrow(pt.detail, esc)
    }
  </div>
</div>`
}

export const pointHighlightStack = defineBlock<Data>({
  id: 'point-highlight-stack',
  archetype: 'point',
  styleTags: ['light', 'feature', 'checklist', 'noimg-safe'],
  imageSlots: 4,
  describe:
    '포인트 수직 스택 (1~4개). 각 포인트: POINT N 레이블 → 대제목+브랜드색 인라인 하이라이트 박스 → 전폭 제품사진 → 체크리스트 또는 원형 썸네일 교차 행. 라이트 배경. 소재·기능·안전성 등 핵심 특장점 강조에 최적.',
  schema,
  css: `
/* ─── 최상위 래퍼 ─────────────────────────────────────────── */
.pfud{background:var(--bg);color:var(--ink)}

/* ─── 개별 POINT 섹션 ───────────────────────────────────────── */
.pfud .phs-pt{padding:60px 0 0}
.pfud .phs-pt.tinted{background:color-mix(in srgb,var(--accent) 8%,var(--bg))}

/* ① POINT 라인 레이블 */
.pfud .phs-line-label{text-align:center;padding:0 var(--pad-x,56px) 20px}
.pfud .phs-pt-num{
  font-family:var(--font-body),'Pretendard',sans-serif;
  font-weight:500;font-size:22px;letter-spacing:.25em;text-transform:uppercase;
  color:var(--accent)
}

/* ② 대제목 + 인라인 하이라이트 */
.pfud .phs-heading-wrap{text-align:center;padding:0 var(--pad-x,56px) 32px}
.pfud .phs-head-plain{
  font-family:var(--font-display);font-weight:700;font-size:42px;line-height:1.15;
  color:var(--ink)
}
.pfud .phs-highlight-box{
  display:inline-block;background:var(--accent);
  border-radius:calc(var(--r-scale,1)*6px);
  padding:4px 18px;margin-top:8px
}
.pfud .phs-highlight-text{
  font-family:var(--font-display);font-weight:700;font-size:42px;
  line-height:1.18;color:#fff;white-space:nowrap
}
.pfud .phs-body-desc{
  margin-top:16px;font-size:18px;line-height:1.7;color:var(--ink-2)
}

/* ③ 전폭 사진 프레임 */
.pfud .phs-photo-wrap{width:100%;overflow:hidden;margin-top:4px}
.pfud .phs-photo{
  display:block;width:100%;
  aspect-ratio:4/3;
  object-fit:cover;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*0px));
}
/* noimg-safe: placeholder 은닉(공유 .ph 규칙 처리), 부재 시 wrap 축소 */
.pfud .phs-photo-wrap:has(.ph){height:0;margin:0;overflow:hidden}

/* ④ 하단 상세 섹션 */
.pfud .phs-sub-wrap{padding:40px var(--pad-x,56px) 56px}
.pfud .phs-sub-header{text-align:center;margin-bottom:24px}
.pfud .phs-sub-title{
  font-size:26px;font-weight:400;line-height:1.5;color:var(--ink)
}
.pfud .phs-caption-bar{
  display:inline-block;background:var(--accent);
  border-radius:calc(var(--r-scale,1)*10px);
  padding:6px 22px;margin-top:14px
}
.pfud .phs-caption-bar span{
  font-size:20px;font-weight:700;color:#fff;line-height:1.3
}

/* 체크리스트 */
.pfud .phs-detail{
  background:var(--paper);
  border-radius:calc(var(--r-scale,1)*16px);
  overflow:hidden
}
.pfud .phs-question{
  display:flex;align-items:center;gap:12px;
  background:var(--accent);padding:14px 22px
}
.pfud .phs-q-icon .phs-svg{width:22px;height:22px;color:#fff;flex-shrink:0}
.pfud .phs-q-text{font-size:20px;font-weight:700;color:#fff;line-height:1.3}
.pfud .phs-checks{padding:8px 0}
.pfud .phs-check-row{
  display:flex;align-items:center;gap:14px;
  padding:14px 22px;border-bottom:1px solid var(--line)
}
.pfud .phs-check-row:last-child{border-bottom:none}
.pfud .phs-dot{
  flex-shrink:0;
  width:32px;height:32px;
  border-radius:50%;
  background:var(--accent);
  display:flex;align-items:center;justify-content:center
}
.pfud .phs-dot .phs-svg{width:16px;height:16px;color:#fff}
.pfud .phs-check-label{font-size:18px;font-weight:400;color:var(--ink);line-height:1.5}
/* 하단 메모 틴트 박스 */
.pfud .phs-note{
  display:flex;align-items:flex-start;gap:10px;
  background:color-mix(in srgb,var(--accent) 12%,var(--bg));
  padding:16px 22px;
  border-radius:calc(var(--r-scale,1)*12px);
  margin:12px 16px 16px;
  font-size:15px;color:var(--ink-2);line-height:1.6
}
.pfud .phs-note-icon .phs-svg{width:20px;height:20px;color:var(--accent);flex-shrink:0;margin-top:2px}

/* 원형 썸네일 행 */
.pfud .phs-thumbrows{display:flex;flex-direction:column;gap:24px}
.pfud .phs-thumb-row{display:flex;align-items:center;gap:28px}
.pfud .phs-thumb-row.rev{flex-direction:row-reverse}
.pfud .phs-thumb-frame{flex:0 0 120px}
.pfud .phs-thumb-img{
  width:120px;height:120px;
  border-radius:50%;object-fit:cover;
  background:color-mix(in srgb,var(--accent) 12%,var(--bg))
}
/* noimg-safe: 원형 placeholder 숨김 */
.pfud .phs-thumb-img.ph{
  width:120px;height:120px;border-radius:50%;
  background:color-mix(in srgb,var(--accent) 10%,var(--bg));
  display:block!important;
}
.pfud .phs-thumb-body{flex:1}
.pfud .phs-thumb-label{font-size:20px;font-weight:700;color:var(--ink);line-height:1.3}
.pfud .phs-thumb-desc{margin-top:6px;font-size:15px;color:var(--ink-2);line-height:1.6}

/* 섹션 간 구분선 */
.pfud .phs-pt+.phs-pt{border-top:1px solid var(--line)}
`,
  render: (d, { esc }) => `
<section class="pfud">
  ${d.points.map((pt, i) => renderPoint(pt, i, esc)).join('')}
</section>`,
})
