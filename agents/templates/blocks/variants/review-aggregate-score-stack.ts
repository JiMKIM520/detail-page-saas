/** REVIEW 아키타입: review-aggregate-score-stack.
 *  [끝판왕] 리뷰·추천 #21 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 다크(--ink) 배경 + 소형 eyebrow + 제품명 레이블 + 대형 집계 점수 히어로(중앙 풀폭)
 *  → 별점 행 + 점수 + 본문 + 강조 CTA 텍스트로 구성된 라운드 카드를 수직 반복.
 *  다크 리뷰 히어로 섹션 — score가 메인 비주얼 역할. */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  /** 최상단 소형 eyebrow (예: "제품의 감성을 입력하세요") — muted 색 */
  eyebrow: z.string().min(1).optional(),
  /** 집계 점수 위 제품 레이블 (예: "제품명") — accent 색 소형 */
  productLabel: z.string().min(1).optional(),
  /** 섹션 대제목 (예: "고객님들의 리얼리뷰") */
  title: z.string().min(1),
  /** 집계 점수 문자열 (예: "4.92") */
  score: z.string().min(1),
  /** 집계 점수 단위 레이블 (예: "5점", 기본 "5점") */
  scoreUnit: z.string().min(1).optional(),
  /** 리뷰 카드 목록 (2~5개) */
  reviews: z
    .array(
      z.object({
        /** 카드 별점 수 (1~5, 기본 5) */
        stars: z.number().int().min(1).max(5).optional(),
        /** 별점 옆 숫자 레이블 (예: "5") */
        starScore: z.string().optional(),
        /** 본문 1 (em/br 허용) */
        line1: z.string().min(1),
        /** 본문 2 (선택) */
        line2: z.string().optional(),
        /** 본문 3 (선택) */
        line3: z.string().optional(),
        /** 카드 하단 강조 CTA 텍스트 (예: "강조하고 싶은 문구를 넣어주세요!") — accent 색 볼드 */
        cta: z.string().min(1).optional(),
      }),
    )
    .min(2)
    .max(5),
})

type Data = z.infer<typeof schema>

/** 골드 별 SVG — 커머스 신호색(골드 #F5A623 filled / 빈 별 stroke). */
const STAR_FILLED =
  '<svg class="rass-star" viewBox="0 0 20 20" fill="#F5A623"><path d="M10 1.2l2.4 6.3H19l-5.3 3.9 2 6.3L10 14l-5.7 3.7 2-6.3L1 7.5h6.6z"/></svg>'
const STAR_EMPTY =
  '<svg class="rass-star" viewBox="0 0 20 20" fill="none" stroke="#F5A623" stroke-width="1.4"><path d="M10 1.2l2.4 6.3H19l-5.3 3.9 2 6.3L10 14l-5.7 3.7 2-6.3L1 7.5h6.6z"/></svg>'

function starRow(count: number, scoreLabel?: string): string {
  const stars = Array.from({ length: 5 }, (_, i) => (i < count ? STAR_FILLED : STAR_EMPTY)).join('')
  return `<div class="rass-star-row">${stars}${scoreLabel ? `<span class="rass-star-num">${scoreLabel}</span>` : ''}</div>`
}

export const reviewAggregateScoreStack = defineBlock<Data>({
  id: 'review-aggregate-score-stack',
  archetype: 'review',
  styleTags: ['dark', 'review', 'social-proof', 'aggregate', 'hero-score', 'template'],
  imageSlots: 0,
  describe:
    '리뷰 집계 점수 히어로 + 카드 수직 스택. 다크(ink) 배경 + 소형 eyebrow + 제품 레이블 + 대형 집계 점수("4.92 / 5점") 중앙 히어로 → 골드 별점행+점수+본문+강조CTA로 구성된 라운드 카드 수직 반복(2~5개). 다크 리뷰 섹션.',
  schema,
  css: `
/* review-aggregate-score-stack — 접두사 rass- */
.rass{background:var(--ink);padding:52px 28px 64px;text-align:center;word-break:keep-all;overflow-wrap:break-word}
/* eyebrow */
.rass-eyebrow{font-family:var(--font-body);font-size:14px;color:rgba(255,255,255,.46);letter-spacing:.02em;margin-bottom:14px}
/* 제품 레이블 */
.rass-product{font-family:var(--font-display);font-size:16px;font-weight:700;color:var(--accent);letter-spacing:.01em;margin-bottom:6px}
/* 섹션 대제목 */
.rass-title{font-family:var(--font-display);font-weight:800;font-size:clamp(24px,5.5vw,34px);color:#fff;letter-spacing:-.02em;line-height:1.22;margin-bottom:28px}
.rass-title .em{color:var(--accent)}
/* 집계 점수 히어로 */
.rass-hero{display:flex;align-items:baseline;justify-content:center;gap:0;margin-bottom:40px;line-height:1}
.rass-score-big{font-family:var(--font-display);font-weight:900;font-size:clamp(72px,18vw,108px);color:#fff;letter-spacing:-.04em;line-height:1}
.rass-score-unit{font-family:var(--font-display);font-weight:600;font-size:clamp(22px,5vw,32px);color:rgba(255,255,255,.58);letter-spacing:-.01em;padding-left:8px;padding-bottom:6px}
/* 리뷰 카드 스택 */
.rass-cards{display:flex;flex-direction:column;gap:16px;text-align:left}
.rass-card{background:var(--paper);border-radius:16px;padding:22px 24px 20px}
/* 별점 행 */
.rass-star-row{display:flex;align-items:center;gap:3px;margin-bottom:14px}
.rass-star{width:20px;height:20px;flex-shrink:0}
.rass-star-num{font-family:var(--font-display);font-size:18px;font-weight:800;color:var(--ink);margin-left:6px;line-height:1}
/* 본문 */
.rass-line{font-family:var(--font-body);font-size:15px;color:var(--ink);line-height:1.65}
.rass-line + .rass-line{margin-top:2px}
.rass-line .em{color:var(--accent-d);font-weight:700}
/* 강조 CTA */
.rass-cta{margin-top:14px;font-family:var(--font-display);font-weight:800;font-size:15px;color:var(--accent-d);line-height:1.4}
`,
  render: (d, { esc, richSafe }) => {
    const unit = esc(d.scoreUnit ?? '5점')

    const cards = d.reviews
      .map((r) => {
        const count = r.stars ?? 5
        const lines = [r.line1, r.line2, r.line3]
          .filter((l): l is string => !!l)
          .map((l) => `<p class="rass-line">${richSafe(l)}</p>`)
          .join('')
        return `
    <div class="rass-card">
      ${starRow(count, r.starScore)}
      ${lines}
      ${r.cta ? `<p class="rass-cta">${richSafe(r.cta)}</p>` : ''}
    </div>`
      })
      .join('')

    return `
<section class="rass">
  ${d.eyebrow ? `<p class="rass-eyebrow">${esc(d.eyebrow)}</p>` : ''}
  ${d.productLabel ? `<p class="rass-product">${esc(d.productLabel)}</p>` : ''}
  <h2 class="rass-title">${richSafe(d.title)}</h2>
  <div class="rass-hero">
    <span class="rass-score-big">${esc(d.score)}</span>
    <span class="rass-score-unit">/ ${unit}</span>
  </div>
  <div class="rass-cards">${cards}
  </div>
</section>`
  },
})
