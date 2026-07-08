/** REVIEW 아키타입: review-photo-bubble-staggered.
 *  [끝판왕] 리뷰·추천 #1 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 다크(--ink) 배경 + 집계 평점 pill 헤더 + 대형 세로 포토 2장을
 *  2열에 수직 오프셋으로 배치, 각 포토 인접 오렌지 pill-bubble 후기 스태거드 쌍. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 섹션 eyebrow 레이블 (예: "Real Review") */
  eyebrow: z.string().min(1).optional(),
  /** 상품명 포함 대제목 (em 허용, 예: "<span class=\"em\">상품명</span> 고객 리얼 후기") */
  title: z.string().min(1),
  /** 집계 평점 수치 (예: "4.9/5") */
  ratingScore: z.string().min(1).optional(),
  /** 집계 평점 라벨 (예: "사용자 리뷰") */
  ratingLabel: z.string().min(1).optional(),
  /** 별점 개수 1-5 */
  ratingStars: z.number().int().min(1).max(5).optional(),
  /** 포토 리뷰 2~3개 — 각 포토 + bubble 쌍 */
  reviews: z
    .array(
      z.object({
        /** 후기 이미지 URL (세로 포토 권장) */
        image: z.string().optional(),
        /** 이미지 alt */
        imageAlt: z.string().optional(),
        /** bubble 강조 첫 줄 (em 허용) */
        highlight: z.string().min(1),
        /** bubble 본문 (em 허용, br 허용) */
        body: z.string().min(1),
      }),
    )
    .min(2)
    .max(3),
})
type Data = z.infer<typeof schema>

export const reviewPhotoBubbleStaggered = defineBlock<Data>({
  id: 'review-photo-bubble-staggered',
  archetype: 'review',
  styleTags: ['dark', 'photo', 'review', 'staggered', 'bubble', 'social-proof', 'template'],
  imageSlots: 3,
  describe:
    '고객 리얼 후기 스태거드 포토버블. 다크 배경 + 집계 평점 pill 헤더 + 대형 세로 포토 2장을 2열에 수직 오프셋으로 배치(왼쪽 위/오른쪽 아래), 각 포토 인접 오렌지 pill-bubble 후기 쌍. 강렬한 리뷰 사회적 증거 섹션.',
  schema,
  css: `
/* review-photo-bubble-staggered — 접두사 rpbs- */
.rpbs{background:var(--ink);color:#fff;padding:60px 36px 68px;word-break:keep-all;overflow-wrap:break-word}
.rpbs-hd{text-align:center;margin-bottom:36px}
.rpbs-eyebrow{font-family:var(--font-body);font-size:15px;font-weight:400;letter-spacing:.06em;color:rgba(255,255,255,.55);margin-bottom:18px}
.rpbs-title{font-family:var(--font-display);font-weight:800;font-size:clamp(28px,6.5vw,42px);line-height:1.22;letter-spacing:-.02em;color:#fff}
.rpbs-title .em{color:var(--accent)}
/* 집계 평점 pill */
.rpbs-pill{display:inline-flex;align-items:center;gap:10px;border:2px solid rgba(255,255,255,.35);border-radius:999px;padding:10px 28px;margin-top:24px}
.rpbs-pill-label{font-family:var(--font-body);font-size:14px;color:rgba(255,255,255,.7);white-space:nowrap}
.rpbs-pill-score{font-family:var(--font-display);font-weight:800;font-size:18px;color:var(--accent);white-space:nowrap}
.rpbs-pill-stars{display:inline-flex;gap:2px;color:#F5A623;font-size:15px;line-height:1}
/* 2열 스태거드 그리드 */
.rpbs-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;align-items:start;margin-top:32px}
/* 왼쪽 열: 포토 위 — bubble 오른쪽 열 상단 오버랩 */
.rpbs-col-l{display:flex;flex-direction:column;gap:0}
.rpbs-col-r{display:flex;flex-direction:column;gap:14px;padding-top:0}
/* 포토 공통 */
.rpbs-photo{width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:var(--shape-photo, calc(var(--r-scale,1)*16px));display:block}
.rpbs-photo.ph{width:100%;aspect-ratio:3/4;border-radius:var(--shape-photo, calc(var(--r-scale,1)*16px));border:2px dashed rgba(255,255,255,.18);background:rgba(255,255,255,.07);color:rgba(255,255,255,.35);font-size:13px}
/* 오렌지 bubble */
.rpbs-bubble{background:var(--accent);border-radius:calc(var(--r-scale,1)*18px);padding:18px 22px}
.rpbs-bubble-hl{font-family:var(--font-display);font-weight:800;font-size:clamp(14px,3.2vw,17px);line-height:1.35;color:#fff;margin-bottom:6px}
.rpbs-bubble-hl .em{color:#fff;text-decoration:underline;text-underline-offset:2px}
.rpbs-bubble-body{font-family:var(--font-body);font-size:clamp(13px,2.8vw,15px);line-height:1.6;color:rgba(255,255,255,.9)}
.rpbs-bubble-body .em{font-weight:700;color:#fff}
/* 세 번째 리뷰(선택) — 풀폭 하단 */
.rpbs-third{margin-top:14px;display:grid;grid-template-columns:1fr 1fr;gap:14px;align-items:start}
.rpbs-third-photo{width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:var(--shape-photo, calc(var(--r-scale,1)*16px));display:block}
.rpbs-third-photo.ph{width:100%;aspect-ratio:3/4;border-radius:var(--shape-photo, calc(var(--r-scale,1)*16px));border:2px dashed rgba(255,255,255,.18);background:rgba(255,255,255,.07);color:rgba(255,255,255,.35);font-size:13px}
`,
  render: (d, { esc, richSafe }) => {
    /* 별점 렌더 — 채워진 별(골드)/빈 별 구분 */
    const stars = d.ratingStars ?? 5
    const starHtml = Array.from({ length: 5 }, (_, i) =>
      i < stars
        ? `<span style="color:#F5A623">★</span>`
        : `<span style="color:rgba(255,255,255,.25)">★</span>`,
    ).join('')

    /* 집계 pill (선택) */
    const pillHtml =
      d.ratingScore || d.ratingLabel
        ? `<div class="rpbs-pill">
            ${d.ratingLabel ? `<span class="rpbs-pill-label">${esc(d.ratingLabel)}</span>` : ''}
            ${d.ratingScore ? `<span class="rpbs-pill-score">${esc(d.ratingScore)}</span>` : ''}
            <span class="rpbs-pill-stars">${starHtml}</span>
          </div>`
        : ''

    /* bubble 렌더 헬퍼 */
    const bubble = (r: Data['reviews'][number]) => `
      <div class="rpbs-bubble">
        <div class="rpbs-bubble-hl">${richSafe(r.highlight)}</div>
        <div class="rpbs-bubble-body">${richSafe(r.body)}</div>
      </div>`

    /* photo 렌더 헬퍼 */
    const photo = (r: Data['reviews'][number]) =>
      media(r.image, 'rpbs-photo', esc(r.imageAlt ?? '고객 리뷰 이미지'))

    /* 1번: 왼쪽 열 상단 포토 / 2번: 오른쪽 열 하단 포토
     * bubble 1 → 오른쪽 열 상단 (위에 먼저)
     * bubble 2 → 왼쪽 열 하단 (사진 아래) */
    const r0 = d.reviews[0]
    const r1 = d.reviews[1]
    const r2 = d.reviews.length > 2 ? d.reviews[2] : undefined

    const thirdHtml = r2
      ? `<div class="rpbs-third">
          ${photo(r2)}
          ${bubble(r2)}
        </div>`
      : ''

    return `
<section class="rpbs">
  <div class="rpbs-hd">
    ${d.eyebrow ? `<div class="rpbs-eyebrow">${esc(d.eyebrow)}</div>` : ''}
    <h2 class="rpbs-title">${richSafe(d.title)}</h2>
    ${pillHtml}
  </div>
  <div class="rpbs-grid">
    <div class="rpbs-col-l">
      ${photo(r0)}
      ${bubble(r1)}
    </div>
    <div class="rpbs-col-r">
      ${bubble(r0)}
      ${photo(r1)}
    </div>
  </div>
  ${thirdHtml}
</section>`
  },
})
