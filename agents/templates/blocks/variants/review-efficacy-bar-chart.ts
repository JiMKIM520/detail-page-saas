/** REVIEW 아키타입: review-efficacy-bar-chart.
 *  [끝판왕] 리뷰·추천 #6 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 대형 볼드 헤드라인 + 섹션 헤딩(그룹명+구분선) × N + 라벨|수평 진행바|퍼센트 행 반복
 *  + 선택적 텍스트 전용 섹션(설명 + 주의 각주).
 *  커머스 만족도·성분·효능·임상 수치 표시에 최적. */
import { z } from 'zod'
import { defineBlock } from '../types'

// ── 스키마 ──────────────────────────────────────────────────────────────────

/** 단일 바 행 */
const barRowSchema = z.object({
  /** 라벨 텍스트 (예: "효과1", "보습력") */
  label: z.string().min(1),
  /** 0–100 정수 */
  value: z.number().int().min(0).max(100),
  /** 퍼센트 표시 오버라이드 — 기본값은 value + "%" */
  displayValue: z.string().optional(),
})

/** 하나의 지표 그룹 (헤딩 + 바 행 2~6개) */
const barGroupSchema = z.object({
  /** 그룹 섹션 제목 (예: "제품의 성능", "다른 실험") */
  heading: z.string().min(1),
  rows: z.array(barRowSchema).min(2).max(6),
})

/** 텍스트 전용 섹션 (선택). 세 번째 블록처럼 설명+주의 각주에 사용. */
const textSectionSchema = z.object({
  heading: z.string().min(1),
  body: z.string().min(1),
  /** 회색 소형 각주 (주의점 등) */
  footnote: z.string().optional(),
})

const schema = z.object({
  /** 페이지 상단 대형 헤드라인 (em, br 허용) */
  title: z.string().min(1),
  /** 바 차트 지표 그룹 1~3개 */
  groups: z.array(barGroupSchema).min(1).max(3),
  /** 선택적 텍스트 섹션 (사용 방법·주의점 등) */
  textSection: textSectionSchema.optional(),
})

type Data = z.infer<typeof schema>

// ── 블록 정의 ────────────────────────────────────────────────────────────────

export const reviewEfficacyBarChart = defineBlock<Data>({
  id: 'review-efficacy-bar-chart',
  archetype: 'review' as any,
  styleTags: ['data', 'stats', 'bar-chart', 'efficacy', 'template'],
  imageSlots: 0,
  describe:
    '만족도·효능·임상 수치 바 차트. 대형 볼드 헤드라인 + 지표 그룹(섹션 헤딩+구분선) × 1~3 + 라벨|수평 진행바|퍼센트 행 반복. 선택적 텍스트 전용 섹션(설명+각주). 이미지 없음.',
  schema,
  css: `
/* review-efficacy-bar-chart — 접두사 rebc- */
.rebc{background:var(--paper);padding:52px 40px 60px;word-break:keep-all;overflow-wrap:break-word}

/* 대형 헤드라인 */
.rebc-title{font-family:var(--font-display);font-weight:900;font-size:clamp(32px,7.5vw,48px);line-height:1.18;letter-spacing:-.02em;color:var(--ink);margin-bottom:10px}
.rebc-title .em{color:var(--accent-d)}
.rebc-title-div{width:100%;height:2px;background:var(--ink);margin-top:18px;margin-bottom:36px}

/* 지표 그룹 */
.rebc-group{margin-bottom:36px}
.rebc-group:last-of-type{margin-bottom:0}
.rebc-group-heading{font-family:var(--font-display);font-weight:800;font-size:clamp(18px,4vw,24px);color:var(--ink);letter-spacing:-.01em;padding-bottom:10px;border-bottom:2px solid var(--ink);margin-bottom:0}

/* 바 행 */
.rebc-row{display:grid;grid-template-columns:72px 1fr auto;align-items:center;gap:14px;padding:14px 0;border-bottom:1px solid var(--line)}
.rebc-row:last-child{border-bottom:none}
.rebc-label{font-family:var(--font-body);font-size:15px;font-weight:600;color:var(--ink);white-space:nowrap}
.rebc-track{position:relative;height:18px;border-radius:2px;background:rgba(0,0,0,.10);overflow:hidden}
.rebc-fill{position:absolute;inset:0 auto 0 0;background:var(--ink);border-radius:2px;transition:width .4s ease}
.rebc-pct{font-family:var(--font-body);font-size:15px;font-weight:700;color:var(--ink);white-space:nowrap;min-width:44px;text-align:right}
.rebc-pct sup{font-size:10px;font-weight:600;vertical-align:super}

/* 텍스트 전용 섹션 */
.rebc-text{margin-top:40px;padding-top:4px}
.rebc-text-heading{font-family:var(--font-display);font-weight:800;font-size:clamp(18px,4vw,24px);color:var(--ink);padding-bottom:10px;border-bottom:2px solid var(--ink);margin-bottom:16px;letter-spacing:-.01em}
.rebc-text-body{font-family:var(--font-body);font-size:15px;line-height:1.75;color:var(--ink);margin-bottom:20px}
.rebc-footnote{font-family:var(--font-body);font-size:12px;line-height:1.6;color:var(--muted)}
`,
  render: (d, { esc, richSafe }) => {
    // 바 그룹 HTML
    const groupsHtml = d.groups
      .map((group) => {
        const rowsHtml = group.rows
          .map((row) => {
            const pct = row.displayValue ?? `${row.value}%`
            const fillWidth = Math.min(Math.max(row.value, 0), 100)
            return `
    <div class="rebc-row">
      <span class="rebc-label">${esc(row.label)}</span>
      <div class="rebc-track">
        <div class="rebc-fill" style="width:${fillWidth}%"></div>
      </div>
      <span class="rebc-pct">${esc(pct.replace('%', ''))}<sup>%</sup></span>
    </div>`
          })
          .join('')

        return `
  <div class="rebc-group">
    <h3 class="rebc-group-heading">${esc(group.heading)}</h3>
    ${rowsHtml}
  </div>`
      })
      .join('')

    // 텍스트 섹션 HTML (선택)
    const textHtml = d.textSection
      ? `
  <div class="rebc-text">
    <h3 class="rebc-text-heading">${esc(d.textSection.heading)}</h3>
    <p class="rebc-text-body">${richSafe(d.textSection.body)}</p>
    ${d.textSection.footnote ? `<p class="rebc-footnote">${esc(d.textSection.footnote)}</p>` : ''}
  </div>`
      : ''

    return `
<section class="rebc">
  <h2 class="rebc-title">${richSafe(d.title)}</h2>
  <div class="rebc-title-div"></div>
  ${groupsHtml}
  ${textHtml}
</section>`
  },
})
