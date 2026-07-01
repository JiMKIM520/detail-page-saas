/** REVIEW 아키타입: review-numbered-thumbnail-rows.
 *  [끝판왕] 리뷰·추천 #24 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 크림/베이지 배경 + "만족도 1등" 신뢰 앵커 헤드라인 +
 *  번호(01~N) · 이유 텍스트 · 우측 고정 썸네일의 행 반복 패턴. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 신뢰 앵커 eyebrow (예: "[제품명]이 만족도 1등인") */
  eyebrow: z.string().min(1),
  /** 대형 헤드라인 (em 허용 — 핵심 어절 accent 강조, 예: "N가지 <span class="em">이유</span>를 확인하세요!") */
  title: z.string().min(1),
  /** 이유 행 반복 (3~7개) */
  items: z
    .array(
      z.object({
        /** 이유 제목 (em 허용) */
        heading: z.string().min(1),
        /** 보조 설명 한두 줄 (선택, em/br 허용) */
        body: z.string().optional(),
        /** 우측 제품 썸네일 URL */
        image: z.string().optional(),
        /** 썸네일 alt */
        imageAlt: z.string().optional(),
      }),
    )
    .min(3)
    .max(7),
})
type Data = z.infer<typeof schema>

const pad2 = (n: number): string => String(n).padStart(2, '0')

export const reviewNumberedThumbnailRows = defineBlock<Data>({
  id: 'review-numbered-thumbnail-rows',
  archetype: 'review' as any,
  styleTags: ['warm', 'trust', 'numbered', 'review', 'template'],
  imageSlots: 5,
  describe:
    '리뷰·추천 이유 번호 행 반복. 크림/베이지 배경 + "만족도 1등" 신뢰 앵커 eyebrow + accent 강조 대형 헤드라인 + 01~N 번호·이유 제목·설명·우측 썸네일 행 반복(3~7회). 사회적 증거 강화 섹션.',
  schema,
  css: `
/* review-numbered-thumbnail-rows — 접두사 rntr- */
.rntr{background:var(--paper);padding:52px 36px 60px;word-break:keep-all;overflow-wrap:break-word}
/* 헤드 */
.rntr-hd{text-align:center;margin-bottom:36px}
.rntr-eyebrow{font-family:var(--font-body);font-size:15px;font-weight:500;color:var(--muted);line-height:1.5;margin-bottom:6px}
.rntr-title{font-family:var(--font-display);font-weight:800;font-size:clamp(28px,6vw,42px);line-height:1.2;letter-spacing:-.02em;color:var(--ink)}
.rntr-title .em{color:var(--accent-d)}
/* 행 */
.rntr-list{display:flex;flex-direction:column;gap:0}
.rntr-row{display:grid;grid-template-columns:1fr auto;align-items:center;gap:18px;padding:22px 0;border-top:1px solid var(--line)}
.rntr-row:last-child{border-bottom:1px solid var(--line)}
/* 좌측 텍스트 영역 */
.rntr-left{display:flex;flex-direction:column;gap:6px}
.rntr-meta{display:flex;align-items:baseline;gap:10px}
.rntr-no{font-family:var(--font-display);font-size:13px;font-weight:800;color:var(--accent-d);letter-spacing:.06em;line-height:1}
.rntr-heading{font-family:var(--font-display);font-weight:800;font-size:clamp(17px,3.6vw,22px);color:var(--ink);line-height:1.35}
.rntr-heading .em{color:var(--accent-d)}
.rntr-body{font-family:var(--font-body);font-size:14px;color:var(--muted);line-height:1.65}
.rntr-body .em{color:var(--accent-d);font-weight:700}
/* 우측 썸네일 */
.rntr-thumb{width:96px;height:96px;object-fit:cover;border-radius:10px;flex-shrink:0;background:var(--bg)}
.rntr-thumb.ph{width:96px;height:96px;border-radius:10px;flex-shrink:0}
`,
  render: (d, { esc, richSafe }) => {
    const rows = d.items
      .map(
        (it, i) => `
    <div class="rntr-row">
      <div class="rntr-left">
        <div class="rntr-meta">
          <span class="rntr-no">${pad2(i + 1)}</span>
          <h3 class="rntr-heading">${richSafe(it.heading)}</h3>
        </div>
        ${it.body ? `<p class="rntr-body">${richSafe(it.body)}</p>` : ''}
      </div>
      ${media(it.image, 'rntr-thumb', esc(it.imageAlt ?? `이유 ${pad2(i + 1)} 이미지`))}
    </div>`,
      )
      .join('')

    return `
<section class="rntr">
  <div class="rntr-hd">
    <p class="rntr-eyebrow">${esc(d.eyebrow)}</p>
    <h2 class="rntr-title">${richSafe(d.title)}</h2>
  </div>
  <div class="rntr-list">
    ${rows}
  </div>
</section>`
  },
})
