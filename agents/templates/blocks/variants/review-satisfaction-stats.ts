/** REVIEW 아키타입: review-satisfaction-stats.
 *  [끝판왕] 리뷰·추천 #10 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 브랜드+제품명 헤더 → 말풍선 질문 → 별점+원형 점선 퍼센트 뱃지 좌우 배치
 *            → 다크 그린 채움 속성별 만족도 테이블(헤더 라벨+퍼센트 각 행). */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  /** 브랜드 이름 (상단 작은 헤드) */
  brand: z.string().min(1),
  /** 제품 이름 (대형 볼드 디스플레이) */
  product: z.string().min(1),
  /** 말풍선 질문 카피 */
  question: z.string().min(1),
  /** 별점 (1–5, 정수) */
  starCount: z.number().int().min(1).max(5).default(5),
  /** 별점 좌측 라벨 (예: "제품 만족도\n추천 의사") — br 허용 */
  starLabel: z.string().min(1),
  /** 원형 뱃지 중앙 수치 (예: "100%") */
  badgeValue: z.string().min(1),
  /** 테이블 컬럼 헤더 라벨 (예: "제품 만족도") */
  tableHeader: z.string().min(1),
  /** 속성별 만족도 행 (2–6개) */
  rows: z
    .array(
      z.object({
        /** 속성 라벨 (em 허용 — 볼드 강조 부분) */
        label: z.string().min(1),
        /** 퍼센트 수치 문자열 (예: "100%") */
        value: z.string().min(1),
      }),
    )
    .min(2)
    .max(6),
})
type Data = z.infer<typeof schema>

/** 별 n개 SVG 행 생성 — 골드 fill, 빈 별은 연회색 */
function renderStars(count: number): string {
  const GOLD = '#D4380D'
  const EMPTY = '#E0E0E0'
  const stars: string[] = []
  for (let i = 0; i < 5; i++) {
    const fill = i < count ? GOLD : EMPTY
    stars.push(
      `<svg class="rss-star" viewBox="0 0 24 24" fill="${fill}" xmlns="http://www.w3.org/2000/svg">` +
        `<path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>` +
        `</svg>`,
    )
  }
  return stars.join('')
}

export const reviewSatisfactionStats = defineBlock<Data>({
  id: 'review-satisfaction-stats',
  archetype: 'review',
  styleTags: ['stats', 'dark-green', 'satisfaction', 'table', 'badge', 'template'],
  imageSlots: 0,
  describe:
    '리뷰·만족도 통계 섹션. 브랜드+제품명 헤더 + 말풍선 질문 + 별점/원형 점선 퍼센트 뱃지 좌우 나란히 + 다크 그린 채움 속성별 만족도 테이블(속성 라벨 좌+퍼센트 우). 수치는 플레이스홀더.',
  schema,
  css: `
/* review-satisfaction-stats — 접두사 rss- */
.rss{background:var(--paper);padding:52px 40px 60px;word-break:keep-all;overflow-wrap:break-word}

/* 헤더: 브랜드 + 제품명 */
.rss-brand{font-family:var(--font-body);font-size:18px;font-weight:400;color:var(--ink);text-align:center;line-height:1.4;margin-bottom:6px}
.rss-product{font-family:var(--font-display);font-size:clamp(32px,7vw,48px);font-weight:800;color:var(--ink);text-align:center;line-height:1.15;letter-spacing:-.02em;margin-bottom:28px}
.rss-product .em{color:var(--accent-d)}

/* 말풍선 */
.rss-bubble-wrap{display:flex;justify-content:center;margin-bottom:36px}
.rss-bubble{position:relative;background:#EBEBEB;border-radius:999px;padding:12px 32px;font-family:var(--font-body);font-size:16px;color:var(--ink);line-height:1.5;text-align:center;display:inline-block}
.rss-bubble::after{content:'';position:absolute;bottom:-12px;left:50%;transform:translateX(-50%);border:7px solid transparent;border-top-color:#EBEBEB;border-bottom:0}

/* 별점+뱃지 행 */
.rss-hero{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:40px;padding:0 8px}

/* 별점 좌측 */
.rss-star-col{display:flex;flex-direction:column;align-items:flex-start;gap:10px}
.rss-stars{display:flex;gap:4px;align-items:center}
.rss-star{width:32px;height:32px;flex-shrink:0}
.rss-star-label{font-family:var(--font-display);font-size:clamp(18px,4vw,24px);font-weight:800;color:var(--ink);line-height:1.35;white-space:pre-line;text-align:left}

/* 원형 점선 뱃지 */
.rss-badge-ring{width:clamp(140px,38vw,180px);height:clamp(140px,38vw,180px);border-radius:50%;border:3px dashed var(--accent-d);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.rss-badge-val{font-family:var(--font-display);font-size:clamp(36px,9vw,54px);font-weight:800;color:var(--accent-d);letter-spacing:-.02em;line-height:1}

/* 만족도 테이블 */
.rss-table-wrap{width:100%}
.rss-table-header{text-align:right;font-family:var(--font-body);font-size:14px;font-weight:700;color:var(--ink);margin-bottom:6px;padding-right:4px}
.rss-table{width:100%;border-collapse:separate;border-spacing:0 6px}
.rss-row td{background:var(--brand);color:#fff;padding:16px 20px;vertical-align:middle}
.rss-row td:first-child{border-radius:calc(var(--r-scale,1)*6px) 0 0 calc(var(--r-scale,1)*6px);font-family:var(--font-display);font-size:16px;font-weight:400;line-height:1.45;width:100%}
.rss-row td:first-child strong{font-weight:800}
.rss-row td:last-child{border-radius:0 calc(var(--r-scale,1)*6px) calc(var(--r-scale,1)*6px) 0;font-family:var(--font-display);font-size:18px;font-weight:800;white-space:nowrap;text-align:right;padding-left:12px;padding-right:20px;color:#fff}
.rss-row td .em{color:var(--em-dark,#FFF7EA)}
`,
  render: (d, { esc, richSafe }) => {
    const rows = d.rows
      .map(
        (r) =>
          `<tr class="rss-row">` +
          `<td>${richSafe(r.label)}</td>` +
          `<td>${esc(r.value)}</td>` +
          `</tr>`,
      )
      .join('')

    return `
<section class="rss">
  <p class="rss-brand">${esc(d.brand)}</p>
  <h2 class="rss-product">${richSafe(d.product)}</h2>

  <div class="rss-bubble-wrap">
    <div class="rss-bubble">${esc(d.question)}</div>
  </div>

  <div class="rss-hero">
    <div class="rss-star-col">
      <div class="rss-stars">${renderStars(d.starCount)}</div>
      <div class="rss-star-label">${esc(d.starLabel)}</div>
    </div>
    <div class="rss-badge-ring">
      <span class="rss-badge-val">${esc(d.badgeValue)}</span>
    </div>
  </div>

  <div class="rss-table-wrap">
    <div class="rss-table-header">${esc(d.tableHeader)}</div>
    <table class="rss-table">
      <tbody>${rows}</tbody>
    </table>
  </div>
</section>`
  },
})
