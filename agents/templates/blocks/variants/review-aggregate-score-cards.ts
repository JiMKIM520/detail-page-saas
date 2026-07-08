/** REVIEW 아키타입: review-aggregate-score-cards.
 *  [끝판왕] 리뷰·추천 #7 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 민트/세이지 배경 + accent 아이워드 eyebrow + 볼드 섹션 헤드라인
 *  → 좌우 분할 집계 평점 헤더(좌: 眼워드+제품명 레이블, 우: 대형 점수 + 빨간 별 5개)
 *  + 수평 구분선 + 카드별 평점 없는 풀폭 흰 라운드 카드 스택 (볼드 첫줄 + 우정렬 닉네임). */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  /** 섹션 상단 eyebrow (예: "상품명를 넣어주세요") — accent 색 표시 */
  eyebrow: z.string().min(1).optional(),
  /** 섹션 대제목 (예: "고객 리얼 후기") */
  title: z.string().min(1),
  /** 집계 헤더 좌측 보조 레이블 (예: "생생한 만족 후기") */
  aggregateLabel: z.string().min(1).optional(),
  /** 집계 헤더 좌측 제품명 레이블 (예: "제품명 입력하세요") */
  aggregateProduct: z.string().min(1).optional(),
  /** 집계 점수 표시 문자열 (예: "5.0") */
  score: z.string().min(1),
  /** 별점 개수 (1~5, 기본 5) */
  starCount: z.number().int().min(1).max(5).optional(),
  /** 리뷰 카드 목록 (2~6개) */
  reviews: z
    .array(
      z.object({
        /** 첫 줄 볼드 헤드 (em 허용) */
        heading: z.string().min(1),
        /** 본문 (em/br 허용, 선택) */
        body: z.string().optional(),
        /** 닉네임 (우정렬 표시, 예: "-닉네임-") */
        nickname: z.string().min(1),
      }),
    )
    .min(2)
    .max(6),
})

type Data = z.infer<typeof schema>

/** 빨간 별 SVG (커머스 리뷰 신호색 #E53935 — 하드코딩 허용). */
const STAR_SVG = (filled: boolean): string =>
  filled
    ? '<svg class="rasc-star" viewBox="0 0 20 20" fill="#E53935"><path d="M10 1.2l2.4 6.3H19l-5.3 3.9 2 6.3L10 14l-5.7 3.7 2-6.3L1 7.5h6.6z"/></svg>'
    : '<svg class="rasc-star" viewBox="0 0 20 20" fill="none" stroke="#E53935" stroke-width="1.4"><path d="M10 1.2l2.4 6.3H19l-5.3 3.9 2 6.3L10 14l-5.7 3.7 2-6.3L1 7.5h6.6z"/></svg>'

export const reviewAggregateScoreCards = defineBlock<Data>({
  id: 'review-aggregate-score-cards',
  archetype: 'review',
  styleTags: ['light', 'mint', 'review', 'social-proof', 'template'],
  imageSlots: 0,
  describe:
    '리뷰 집계 평점 + 카드 스택. 민트/세이지 배경 + accent eyebrow + 볼드 섹션 타이틀 → 좌우 분할 집계 헤더(좌: 레이블+제품명, 우: 대형 점수+빨간 별) + 구분선 + 풀폭 흰 라운드 카드 반복(볼드 첫줄+본문+우정렬 닉네임). 평점 없는 심플 후기 섹션.',
  schema,
  css: `
/* review-aggregate-score-cards — 접두사 rasc- */
.rasc{background:var(--bg);padding:52px 32px 60px;word-break:keep-all;overflow-wrap:break-word}
/* 상단 헤더 */
.rasc-eyebrow{font-family:var(--font-display);font-size:22px;font-weight:700;color:var(--accent-d);text-align:center;letter-spacing:-.01em;margin-bottom:6px}
.rasc-title{font-family:var(--font-display);font-size:clamp(32px,6vw,44px);font-weight:800;color:var(--ink);text-align:center;letter-spacing:-.02em;line-height:1.18;margin-bottom:32px}
/* 집계 헤더 — 좌우 분할 */
.rasc-agg{display:flex;align-items:center;justify-content:space-between;padding:0 4px;margin-bottom:24px;gap:16px}
.rasc-agg-left{display:flex;flex-direction:column;gap:4px}
.rasc-agg-meta{font-family:var(--font-body);font-size:14px;color:var(--muted);line-height:1.4}
.rasc-agg-product{font-family:var(--font-display);font-size:20px;font-weight:800;color:var(--ink);line-height:1.2;letter-spacing:-.01em}
.rasc-agg-right{display:flex;flex-direction:column;align-items:center;gap:6px;flex-shrink:0}
.rasc-score{font-family:var(--font-display);font-size:clamp(56px,12vw,80px);font-weight:900;color:var(--ink);line-height:1;letter-spacing:-.03em}
.rasc-stars{display:flex;gap:3px;align-items:center}
.rasc-star{width:20px;height:20px;flex-shrink:0}
/* 구분선 */
.rasc-divider{height:1px;background:var(--line);margin-bottom:24px}
/* 카드 스택 */
.rasc-cards{display:flex;flex-direction:column;gap:14px}
.rasc-card{background:var(--paper);border-radius:calc(var(--r-scale,1)*14px);padding:22px 24px 18px;box-shadow:0 2px 8px -3px rgba(0,0,0,.10)}
.rasc-card-head{font-family:var(--font-display);font-size:17px;font-weight:800;color:var(--ink);line-height:1.4;margin-bottom:6px}
.rasc-card-head .em{color:var(--accent-d)}
.rasc-card-body{font-family:var(--font-body);font-size:15px;color:var(--ink);line-height:1.65;margin-bottom:12px}
.rasc-card-body .em{color:var(--accent-d);font-weight:700}
.rasc-nick{text-align:right;font-family:var(--font-body);font-size:14px;color:var(--muted)}
`,
  render: (d, { esc, richSafe }) => {
    const count = d.starCount ?? 5

    const stars = Array.from({ length: 5 }, (_, i) => STAR_SVG(i < count)).join('')

    const cards = d.reviews
      .map(
        (r) => `
    <div class="rasc-card">
      <div class="rasc-card-head">${richSafe(r.heading)}</div>
      ${r.body ? `<div class="rasc-card-body">${richSafe(r.body)}</div>` : ''}
      <div class="rasc-nick">${esc(r.nickname)}</div>
    </div>`,
      )
      .join('')

    return `
<section class="rasc">
  ${d.eyebrow ? `<div class="rasc-eyebrow">${esc(d.eyebrow)}</div>` : ''}
  <h2 class="rasc-title">${richSafe(d.title)}</h2>
  <div class="rasc-agg">
    <div class="rasc-agg-left">
      ${d.aggregateLabel ? `<span class="rasc-agg-meta">${esc(d.aggregateLabel)}</span>` : ''}
      ${d.aggregateProduct ? `<span class="rasc-agg-product">${esc(d.aggregateProduct)}</span>` : ''}
    </div>
    <div class="rasc-agg-right">
      <span class="rasc-score">${esc(d.score)}</span>
      <div class="rasc-stars">${stars}</div>
    </div>
  </div>
  <div class="rasc-divider"></div>
  <div class="rasc-cards">${cards}
  </div>
</section>`
  },
})
