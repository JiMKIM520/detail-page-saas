/** REVIEW 아키타입: review-image-story-stack.
 *  [끝판왕] 리뷰·추천 #9 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 밝은 배경 + eyebrow+accent 대제목 헤더 +
 *  [풀와이드 라운드 이미지 → 하단 플로팅 화이트 텍스트카드(별점+리뷰어+굵은 헤딩+본문)] 수직 반복 스택.
 *  커머스 실사 후기 섹션. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** eyebrow 소제목 (상품명 등 컨텍스트 라벨) */
  eyebrow: z.string().min(1).optional(),
  /** 섹션 대제목 (em 허용 — accent 강조 어절) */
  title: z.string().min(1),
  /** 후기 카드 반복 (2~5개) */
  items: z
    .array(
      z.object({
        /** 후기 이미지 URL (풀와이드) */
        image: z.string().optional(),
        /** 이미지 alt */
        imageAlt: z.string().optional(),
        /** 별점 수 (1~5, 기본 5) */
        stars: z.number().int().min(1).max(5).default(5),
        /** 한 줄 별점 레이블 (예: "아주 좋아요") */
        ratingLabel: z.string().min(1),
        /** 리뷰어 표기 (예: "송**님의 실제 후기입니다.") */
        reviewer: z.string().optional(),
        /** 굵은 후기 소제목 (em, br 허용) */
        heading: z.string().min(1),
        /** 후기 본문 (em, br 허용) */
        body: z.string().optional(),
      }),
    )
    .min(2)
    .max(5),
})
type Data = z.infer<typeof schema>

/** 별 N개 인라인 SVG — gold 하드코딩(커머스 신호색). */
function renderStars(count: number): string {
  const star =
    '<svg class="riss-star" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>'
  return Array.from({ length: 5 }, (_, i) =>
    i < count
      ? star
      : '<svg class="riss-star riss-star--empty" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>',
  ).join('')
}

export const reviewImageStoryStack = defineBlock<Data>({
  id: 'review-image-story-stack',
  archetype: 'review' as any,
  styleTags: ['light', 'review', 'social-proof', 'stacked', 'template'],
  imageSlots: 3,
  describe:
    '고객 리얼 후기(이미지+플로팅카드 스택). 밝은 배경 + eyebrow+accent 대제목 + [풀와이드 라운드 이미지 위에 하단 플로팅 화이트 카드(별점·리뷰어 라벨+굵은 소제목+본문)] 2~5회 수직 반복. 실사 후기 신뢰 섹션.',
  schema,
  css: `
/* review-image-story-stack — 접두사 riss- */
.riss{background:var(--paper);padding:56px 20px 64px;word-break:keep-all;overflow-wrap:break-word}
.riss-hd{text-align:center;margin-bottom:36px}
.riss-eyebrow{font-family:var(--font-body);font-size:15px;font-weight:600;color:var(--muted);letter-spacing:.04em;margin-bottom:6px}
.riss-title{font-family:var(--font-display);font-weight:800;font-size:clamp(34px,7.5vw,52px);line-height:1.12;letter-spacing:-.02em;color:var(--ink)}
.riss-title .em{color:var(--accent-d)}

/* 아이템 래퍼: 이미지 + 하단 플로팅 카드 */
.riss-item{position:relative;margin-bottom:36px}
.riss-item:last-child{margin-bottom:0}

/* 풀와이드 라운드 이미지 */
.riss-img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block;border-radius:16px}
.riss-img.ph{width:100%;aspect-ratio:4/3;border-radius:16px;border:2px dashed var(--line);background:var(--bg);color:var(--muted)}

/* 하단 플로팅 카드 — 이미지 아래에 밀착, 약간 올라온 그림자 */
.riss-card{background:#ffffff;border-radius:16px;margin-top:-4px;padding:20px 22px 24px;box-shadow:0 6px 28px -10px rgba(0,0,0,.18),0 2px 8px -4px rgba(0,0,0,.10)}

/* 별점 행 */
.riss-rating-row{display:flex;align-items:center;gap:4px;flex-wrap:wrap;margin-bottom:10px}
.riss-stars{display:flex;align-items:center;gap:1px}
.riss-star{width:18px;height:18px;color:#1B5EF7}
.riss-star--empty{color:#D6D8E0}
.riss-rating-label{font-family:var(--font-display);font-weight:800;font-size:18px;color:var(--ink);margin-left:6px}
.riss-reviewer{font-size:12px;color:var(--muted);margin-left:auto;white-space:nowrap}

/* 후기 소제목 */
.riss-heading{font-family:var(--font-body);font-weight:700;font-size:16px;line-height:1.45;color:var(--ink);margin-bottom:6px}
.riss-heading .em{color:var(--accent-d)}

/* 후기 본문 */
.riss-body{font-family:var(--font-body);font-size:15px;line-height:1.7;color:var(--ink)}
.riss-body .em{color:var(--accent-d);font-weight:600}
`,
  render: (d, { esc, richSafe }) => {
    const items = d.items
      .map(
        (it) => `
    <div class="riss-item">
      ${media(it.image, 'riss-img', esc(it.imageAlt ?? '후기 이미지'))}
      <div class="riss-card">
        <div class="riss-rating-row">
          <span class="riss-stars" aria-label="${it.stars}점">${renderStars(it.stars)}</span>
          <span class="riss-rating-label">${esc(it.ratingLabel)}</span>
          ${it.reviewer ? `<span class="riss-reviewer">${esc(it.reviewer)}</span>` : ''}
        </div>
        <h3 class="riss-heading">${richSafe(it.heading)}</h3>
        ${it.body ? `<p class="riss-body">${richSafe(it.body)}</p>` : ''}
      </div>
    </div>`,
      )
      .join('')

    return `
<section class="riss">
  <div class="riss-hd">
    ${d.eyebrow ? `<p class="riss-eyebrow">${esc(d.eyebrow)}</p>` : ''}
    <h2 class="riss-title">${richSafe(d.title)}</h2>
  </div>
  ${items}
</section>`
  },
})
