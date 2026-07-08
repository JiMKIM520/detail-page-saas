/** DETAIL 아키타입(템플릿 충실 재현): 17_제품 설명 _210.
 *  detail-policy-table: 변경/교환/반품/AS 안내 정책표.
 *  구조: 중앙정렬 제목+영문 부제 → 2열 다크 헤더(before/after) → 2열 본문 비교 행 → 주의사항 박스
 *  → 수평 구분선 → 라벨(좌)-본문(우) 행 반복(AS/교환·반품/불가 안내 등). */
import { z } from 'zod'
import { defineBlock } from '../types'

// ── 스키마 ──────────────────────────────────────────────────────────────────
const policyRowSchema = z.object({
  label: z.string().min(1),         // 좌측 라벨 (예: "A/S 안내", "교환·반품 안내")
  body: z.string().min(1),          // 우측 본문 (em,br)
})

const schema = z.object({
  title: z.string().min(1),                        // 섹션 제목 (예: "변경 / 취소 안내")
  subtitle: z.string().min(1).optional(),          // 영문 부제 (예: "CHANGE/CANCEL NOTICE")
  beforeLabel: z.string().min(1).optional(),       // before 열 헤더 (기본 "제작 시작 전")
  afterLabel: z.string().min(1).optional(),        // after 열 헤더 (기본 "제작 시작 후")
  beforeBody: z.string().min(1).optional(),        // before 열 본문 (em,br)
  afterBody: z.string().min(1).optional(),         // after 열 본문 (em,br)
  notice: z.string().min(1).optional(),            // 전폭 주의사항 박스 텍스트
  rows: z.array(policyRowSchema).min(1).max(6),   // 라벨-본문 행 목록 (1~6개)
})
type Data = z.infer<typeof schema>

// ── 변형 정의 ────────────────────────────────────────────────────────────────
export const detailPolicyTable = defineBlock<Data>({
  id: 'detail-policy-table',
  archetype: 'detail',
  styleTags: ['light', 'template', 'table', 'policy', 'editorial'],
  imageSlots: 0,
  describe:
    '정책/AS 정보표. 중앙 제목+영문 부제 → 2열 다크 헤더(before/after) → 2열 비교 본문 → 주의사항 박스 → 수평 구분선 → 라벨(좌)-본문(우) 행 반복. 변경·교환·반품·AS 안내 섹션.',
  schema,
  css: `
/* ── detail-policy-table 전용 (prefix: .dpt) ── */
.dpt{background:var(--bg);padding:56px 0 64px;color:var(--ink)}

/* 제목 영역 */
.dpt-hd{text-align:center;padding:0 48px 36px}
.dpt-title{font-family:var(--font-display);font-weight:800;font-size:42px;letter-spacing:-.02em;line-height:1.15;color:var(--ink)}
.dpt-sub{margin-top:10px;font-size:12px;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:var(--muted)}

/* 2열 before/after 비교 테이블 */
.dpt-compare{margin:0 40px}
.dpt-compare-hd{display:grid;grid-template-columns:1fr 1fr}
.dpt-compare-hd-cell{background:var(--ink);color:#fff;text-align:center;padding:22px 16px;font-family:var(--font-display);font-weight:700;font-size:18px;letter-spacing:.01em}
.dpt-compare-hd-cell:first-child{border-right:1px solid rgba(255,255,255,.2)}
.dpt-compare-body{display:grid;grid-template-columns:1fr 1fr;border:1px solid var(--line);border-top:none}
.dpt-compare-cell{text-align:center;padding:26px 20px;font-family:var(--font-display);font-weight:700;font-size:17px;line-height:1.55;color:var(--ink)}
.dpt-compare-cell:first-child{border-right:1px solid var(--line)}
.dpt-compare-cell .em{color:var(--accent)}

/* 주의사항 박스 */
.dpt-notice{margin:14px 40px 0;background:color-mix(in srgb,var(--ink) 6%,transparent);border-radius:calc(var(--r-scale,1)*4px);padding:14px 18px;font-size:13px;color:var(--ink-2);line-height:1.7}
.dpt-notice .em{color:var(--accent);font-weight:600}

/* 구분선 */
.dpt-divider{margin:40px 40px 0;border:none;border-top:1.5px solid var(--line)}

/* 라벨-본문 행 */
.dpt-rows{margin:0 40px}
.dpt-row{display:grid;grid-template-columns:148px 1fr;gap:32px;padding:36px 0;border-bottom:1px solid var(--line)}
.dpt-row:last-child{border-bottom:none}
.dpt-row-label{font-family:var(--font-display);font-weight:800;font-size:20px;color:var(--ink);line-height:1.35;padding-top:2px}
.dpt-row-body{font-size:15px;color:var(--ink);line-height:1.8;white-space:pre-line}
.dpt-row-body p+p{margin-top:10px}
.dpt-row-body .em{color:var(--accent);font-weight:600}
`,
  render: (d, { esc, richSafe }) => {
    const beforeHdr = d.beforeLabel ?? '제작 시작 전'
    const afterHdr  = d.afterLabel  ?? '제작 시작 후'

    const hasCompare = d.beforeBody || d.afterBody

    const rowsHtml = d.rows
      .map(
        (r) => `
    <div class="dpt-row">
      <div class="dpt-row-label">${richSafe(r.label)}</div>
      <div class="dpt-row-body">${richSafe(r.body)}</div>
    </div>`,
      )
      .join('')

    return `
<section class="dpt">
  <div class="dpt-hd">
    <h2 class="dpt-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="dpt-sub">${esc(d.subtitle)}</p>` : ''}
  </div>

  ${hasCompare ? `
  <div class="dpt-compare">
    <div class="dpt-compare-hd">
      <div class="dpt-compare-hd-cell">${esc(beforeHdr)}</div>
      <div class="dpt-compare-hd-cell">${esc(afterHdr)}</div>
    </div>
    <div class="dpt-compare-body">
      <div class="dpt-compare-cell">${richSafe(d.beforeBody ?? '')}</div>
      <div class="dpt-compare-cell">${richSafe(d.afterBody ?? '')}</div>
    </div>
  </div>` : ''}

  ${d.notice ? `<p class="dpt-notice">${richSafe(d.notice)}</p>` : ''}

  <hr class="dpt-divider">

  <div class="dpt-rows">
    ${rowsHtml}
  </div>
</section>`
  },
})
