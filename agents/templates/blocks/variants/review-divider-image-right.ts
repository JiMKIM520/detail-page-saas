/** REVIEW 아키타입: review-divider-image-right.
 *  [끝판왕] 리뷰·추천 #11 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 밝은 배경 + 중앙 섹션 헤더(accent 상품명 + 굵은 헤드라인) +
 *  구분선-행(divider-row) 골격으로 반복되는 리뷰 유닛.
 *  각 유닛: [구분선] [라벨 행] [구분선] [2열 — 텍스트(3줄 + accent 강조 인용 + 소속) | 우측 고정 이미지] */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 상단 eyebrow (예: "상품명" — accent 색 렌더) */
  eyebrow: z.string().min(1),
  /** 섹션 대제목 (예: "고객 리얼 후기") */
  title: z.string().min(1),
  /** 리뷰 반복 유닛 (2~5개) */
  items: z
    .array(
      z.object({
        /** 라벨 행 텍스트 (예: "Review 01") */
        label: z.string().min(1),
        /** 리뷰 본문 줄 목록 — 일반 줄 (2~4개) */
        lines: z.array(z.string().min(1)).min(1).max(4),
        /** 하이라이트 인용 한 줄 — accent 색으로 강조 */
        highlight: z.string().min(1),
        /** 작성자·소속 (예: "송**님의 실제 후기입니다.") */
        attribution: z.string().min(1),
        /** 우측 이미지 URL */
        image: z.string().optional(),
        /** 이미지 alt */
        imageAlt: z.string().optional(),
      }),
    )
    .min(2)
    .max(5),
})
type Data = z.infer<typeof schema>

export const reviewDividerImageRight = defineBlock<Data>({
  id: 'review-divider-image-right',
  archetype: 'review',
  styleTags: ['light', 'divider', 'customer-review', 'template'],
  imageSlots: 3,
  describe:
    '고객 리뷰(구분선+이미지우측). 밝은 배경 + accent 상품명+굵은 헤드라인 섹션 헤더 + 구분선-라벨-구분선 골격의 리뷰 유닛 반복. 각 유닛: 좌측 텍스트(일반줄+accent 강조 인용+attribution) + 우측 고정 이미지. 2~5회 반복.',
  schema,
  css: `
/* review-divider-image-right — 접두사 rdir- */
.rdir{background:var(--bg);padding:64px 40px 72px;word-break:keep-all;overflow-wrap:break-word}
.rdir-hd{text-align:center;margin-bottom:44px}
.rdir-eyebrow{font-family:var(--font-display);font-weight:800;font-size:clamp(26px,5.6vw,40px);color:var(--accent);line-height:1.2;letter-spacing:-.01em}
.rdir-eyebrow .em{color:var(--accent-d)}
.rdir-title{font-family:var(--font-display);font-weight:800;font-size:clamp(28px,6vw,44px);color:var(--ink);line-height:1.2;letter-spacing:-.02em;margin-top:4px}
.rdir-title .em{color:var(--accent-d)}
/* 리뷰 유닛 */
.rdir-unit{margin-top:0}
.rdir-unit + .rdir-unit{margin-top:0}
/* 구분선 */
.rdir-line{width:100%;height:1px;background:var(--line);border:none;margin:0}
/* 라벨 행 */
.rdir-label-row{padding:14px 0}
.rdir-label{font-family:var(--font-body);font-size:15px;font-weight:600;color:var(--ink);line-height:1}
/* 본문 2열 래퍼 */
.rdir-body{display:grid;grid-template-columns:1fr 220px;gap:0;padding:20px 0 28px;align-items:start}
/* 텍스트 영역 */
.rdir-text{padding-right:20px}
.rdir-line-item{font-family:var(--font-body);font-size:16px;color:var(--ink);line-height:1.65;margin-bottom:2px}
.rdir-line-item .em{color:var(--accent-d);font-weight:700}
/* accent 강조 인용 한 줄 */
.rdir-highlight{font-family:var(--font-body);font-size:16px;font-weight:700;color:var(--accent);line-height:1.65;margin-bottom:2px}
.rdir-highlight .em{color:var(--accent-d)}
/* attribution */
.rdir-attr{font-family:var(--font-body);font-size:13px;color:var(--muted);line-height:1.5;margin-top:14px}
.rdir-attr .em{color:var(--accent-d)}
/* 우측 이미지 */
.rdir-img{width:220px;height:180px;object-fit:cover;display:block;border-radius:var(--shape-photo, calc(var(--r-scale,1)*4px));background:var(--paper)}
.rdir-img.ph{width:220px;height:180px;border:2px dashed var(--line);background:var(--paper);border-radius:var(--shape-photo, calc(var(--r-scale,1)*4px))}
`,
  render: (d, { esc, richSafe }) => {
    const units = d.items
      .map((it) => {
        const lineHtml = it.lines
          .map((ln) => `<p class="rdir-line-item">${richSafe(ln)}</p>`)
          .join('')
        return `
  <div class="rdir-unit">
    <hr class="rdir-line">
    <div class="rdir-label-row"><span class="rdir-label">${esc(it.label)}</span></div>
    <hr class="rdir-line">
    <div class="rdir-body">
      <div class="rdir-text">
        ${lineHtml}
        <p class="rdir-highlight">${richSafe(it.highlight)}</p>
        <p class="rdir-attr">${esc(it.attribution)}</p>
      </div>
      ${media(it.image, 'rdir-img', esc(it.imageAlt ?? '리뷰 이미지'))}
    </div>
  </div>`
      })
      .join('')

    return `
<section class="rdir">
  <div class="rdir-hd">
    <p class="rdir-eyebrow">${richSafe(d.eyebrow)}</p>
    <h2 class="rdir-title">${richSafe(d.title)}</h2>
  </div>
  ${units}
</section>`
  },
})
