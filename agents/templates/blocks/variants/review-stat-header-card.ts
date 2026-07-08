/** REVIEW 아키타입: review-stat-header-card.
 *  [끝판왕] 리뷰·추천 #17 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 소형 eyebrow 라벨 + 브랜드명/제품명 헤드라인 + 이중 KPI 통계 바(버티컬 구분선) +
 *  섹션 라벨 pill + 단일 리뷰 카드(인용문 + 작성자명 + 별점 오버랩 pill 배지). */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  /** 상단 eyebrow 라벨 (예: "Real Review") */
  eyebrow: z.string().min(1),
  /** 브랜드명 (첫 번째 줄 — em 허용) */
  brandName: z.string().min(1),
  /** 제품명 (두 번째 줄 — em 허용) */
  productName: z.string().min(1),
  /** KPI 왼쪽 라벨 (예: "제품만족도") */
  statLeftLabel: z.string().min(1),
  /** KPI 왼쪽 수치 (예: "★4.5점") — em 허용 */
  statLeftValue: z.string().min(1),
  /** KPI 오른쪽 라벨 (예: "누적 리뷰수") */
  statRightLabel: z.string().min(1),
  /** KPI 오른쪽 수치 (예: "5,000건") — em 허용 */
  statRightValue: z.string().min(1),
  /** 리뷰 섹션 pill 라벨 (예: "리얼 고객 리뷰") */
  reviewSectionLabel: z.string().min(1),
  /** 리뷰 카드 본문 (em, br 허용) */
  reviewText: z.string().min(1),
  /** 작성자명 */
  reviewerName: z.string().min(1),
  /** 별점 1~5 */
  reviewStars: z.number().int().min(1).max(5).default(5),
})
type Data = z.infer<typeof schema>

/** 별점 렌더 — 채워진 별 n개 + 빈 별 (5-n)개 */
function renderStars(count: number): string {
  const filled =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="#d4a017"><path d="M12 2l2.4 7.3H22l-6.2 4.5 2.4 7.3L12 17l-6.2 4.1 2.4-7.3L2 9.3h7.6z"/></svg>'
  const empty =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d4a017" stroke-width="1.5"><path d="M12 2l2.4 7.3H22l-6.2 4.5 2.4 7.3L12 17l-6.2 4.1 2.4-7.3L2 9.3h7.6z"/></svg>'
  const n = Math.max(1, Math.min(5, count))
  return filled.repeat(n) + empty.repeat(5 - n)
}

export const reviewStatHeaderCard = defineBlock<Data>({
  id: 'review-stat-header-card',
  archetype: 'review',
  styleTags: ['warm', 'social-proof', 'kpi', 'review', 'template'],
  imageSlots: 0,
  describe:
    '리뷰 소셜증거 헤더형. eyebrow 라벨 + 브랜드/제품명 헤드라인 + 이중 KPI 통계 바(버티컬 구분선) + 섹션 라벨 pill + 단일 대표 리뷰 카드(인용 + 작성자 + 별점). 간결한 신뢰 시그널 섹션.',
  schema,
  css: `
/* review-stat-header-card — 접두사 rshc- */
.rshc{background:var(--paper);padding:52px 40px 56px;text-align:center;word-break:keep-all;overflow-wrap:break-word}
/* eyebrow */
.rshc-eyebrow{display:inline-block;font-size:13px;font-weight:600;letter-spacing:.08em;color:var(--muted);margin-bottom:18px}
/* 헤드라인 */
.rshc-brand{font-family:var(--font-display);font-weight:800;font-size:clamp(26px,5.6vw,38px);line-height:1.2;letter-spacing:-.02em;color:var(--ink)}
.rshc-brand .em{color:var(--accent-d)}
.rshc-product{font-family:var(--font-display);font-weight:800;font-size:clamp(26px,5.6vw,38px);line-height:1.2;letter-spacing:-.02em;color:var(--ink);margin-top:2px}
.rshc-product .em{color:var(--accent-d)}
/* KPI 통계 바 */
.rshc-stats{display:grid;grid-template-columns:1fr 1px 1fr;align-items:center;margin:28px 0 32px;padding:20px 16px;background:var(--bg);border-radius:calc(var(--r-scale,1)*12px);gap:0}
.rshc-divider{width:1px;height:44px;background:var(--line);justify-self:center}
.rshc-stat{display:flex;flex-direction:column;align-items:center;gap:6px}
.rshc-stat-label{font-size:12px;font-weight:600;letter-spacing:.04em;color:var(--muted)}
.rshc-stat-value{font-family:var(--font-display);font-weight:800;font-size:clamp(20px,4.2vw,28px);letter-spacing:-.01em;color:var(--ink);line-height:1.1}
.rshc-stat-value .em{color:var(--accent-d)}
/* 리뷰 섹션 pill */
.rshc-section-pill{display:inline-block;background:var(--accent);color:#fff;font-family:var(--font-display);font-weight:700;font-size:15px;letter-spacing:.04em;padding:10px 28px;border-radius:999px;margin-bottom:20px}
/* 리뷰 카드 */
.rshc-card{background:var(--paper);border:1.5px solid var(--line);border-radius:calc(var(--r-scale,1)*14px);padding:28px 24px 22px;text-align:left;box-shadow:0 4px 18px -8px rgba(0,0,0,.10)}
.rshc-quote{font-family:var(--font-body);font-size:15px;line-height:1.75;color:var(--ink);font-weight:500}
.rshc-quote .em{color:var(--accent-d);font-weight:700}
.rshc-reviewer-row{display:flex;align-items:center;justify-content:space-between;margin-top:18px;flex-wrap:wrap;gap:8px}
.rshc-reviewer{font-size:13px;font-weight:600;color:var(--muted);letter-spacing:.02em}
.rshc-stars{display:flex;align-items:center;gap:2px}
`,
  render: (d, { esc, richSafe }) => {
    const stars = renderStars(d.reviewStars)
    return `
<section class="rshc">
  <span class="rshc-eyebrow">${esc(d.eyebrow)}</span>
  <h2 class="rshc-brand">${richSafe(d.brandName)}</h2>
  <div class="rshc-product">${richSafe(d.productName)}</div>
  <div class="rshc-stats">
    <div class="rshc-stat">
      <span class="rshc-stat-label">${esc(d.statLeftLabel)}</span>
      <span class="rshc-stat-value">${richSafe(d.statLeftValue)}</span>
    </div>
    <div class="rshc-divider" aria-hidden="true"></div>
    <div class="rshc-stat">
      <span class="rshc-stat-label">${esc(d.statRightLabel)}</span>
      <span class="rshc-stat-value">${richSafe(d.statRightValue)}</span>
    </div>
  </div>
  <div>
    <span class="rshc-section-pill">${esc(d.reviewSectionLabel)}</span>
  </div>
  <div class="rshc-card">
    <p class="rshc-quote">${richSafe(d.reviewText)}</p>
    <div class="rshc-reviewer-row">
      <span class="rshc-reviewer">${esc(d.reviewerName)}</span>
      <span class="rshc-stars" aria-label="별점 ${d.reviewStars}점">${stars}</span>
    </div>
  </div>
</section>`
  },
})
