/** REVIEW 아키타입: review-thumbnail-rows.
 *  [끝판왕] 리뷰·추천 #14 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 밝은 배경 + eyebrow 라벨 + 대형 2행 헤드라인 +
 *  [상품 썸네일 좌측 앵커 + 리뷰어 아이디·닉네임 인라인 + 2행 본문] 오픈 로우 반복,
 *  얇은 헤어라인 디바이더 분리. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** eyebrow 라벨 (예: "상세내용을 입력해주세요") */
  eyebrow: z.string().min(1).optional(),
  /** 섹션 대제목 1행 (em 허용) */
  titleLine1: z.string().min(1),
  /** 섹션 대제목 2행 (em 허용, 선택) */
  titleLine2: z.string().min(1).optional(),
  /** 리뷰 로우 목록 (2~6개) */
  items: z
    .array(
      z.object({
        /** 상품 썸네일 이미지 URL */
        image: z.string().optional(),
        /** 이미지 alt */
        imageAlt: z.string().optional(),
        /** 리뷰어 레이블 (예: "아이디 | 송**님") */
        reviewer: z.string().min(1),
        /** 본문 1행 */
        bodyLine1: z.string().min(1),
        /** 본문 2행 (선택) */
        bodyLine2: z.string().optional(),
        /** 별점 (1~5, 선택) */
        stars: z.number().int().min(1).max(5).optional(),
      }),
    )
    .min(2)
    .max(6),
})
type Data = z.infer<typeof schema>

/** 골드 별 SVG (fill) — 커머스 신호색 하드코딩 허용 */
const STAR_FILLED =
  '<svg viewBox="0 0 16 16" width="14" height="14" fill="#F5A623" xmlns="http://www.w3.org/2000/svg"><path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.4l-3.7 1.9.7-4.1-3-2.9 4.2-.7z"/></svg>'
const STAR_EMPTY =
  '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="#D4C5A9" stroke-width="1.2" xmlns="http://www.w3.org/2000/svg"><path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.4l-3.7 1.9.7-4.1-3-2.9 4.2-.7z"/></svg>'

function renderStars(count: number): string {
  const stars: string[] = []
  for (let i = 1; i <= 5; i++) {
    stars.push(i <= count ? STAR_FILLED : STAR_EMPTY)
  }
  return `<span class="rtr-stars" aria-label="${count}점">${stars.join('')}</span>`
}

export const reviewThumbnailRows = defineBlock<Data>({
  id: 'review-thumbnail-rows',
  archetype: 'review',
  styleTags: ['warm', 'light', 'social-proof', 'rows', 'template'],
  imageSlots: 3,
  describe:
    '고객 리뷰 오픈 로우. 밝은 배경 + eyebrow 라벨 + 대형 2행 헤드라인 + [좌측 앵커 상품 썸네일 + 리뷰어 아이디·닉네임 인라인 + 2행 본문] 반복, 헤어라인 디바이더 분리. 간결·신뢰감. 2~6개.',
  schema,
  css: `
/* review-thumbnail-rows — 접두사 rtr- */
.rtr{background:var(--bg);padding:52px 32px 60px;word-break:keep-all;overflow-wrap:break-word}
/* 헤더 */
.rtr-eyebrow{display:inline-block;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--accent-d);background:color-mix(in srgb,var(--accent) 12%,transparent);border-radius:999px;padding:5px 14px;margin-bottom:20px}
.rtr-title{font-family:var(--font-display);font-weight:800;font-size:clamp(26px,6.5vw,38px);line-height:1.22;letter-spacing:-.02em;color:var(--ink);margin-bottom:32px}
.rtr-title .em{color:var(--accent-d)}
/* 로우 리스트 */
.rtr-list{display:flex;flex-direction:column}
.rtr-row{display:grid;grid-template-columns:72px 1fr;gap:14px;padding:20px 0;border-top:1px solid var(--line)}
.rtr-list>.rtr-row:last-child{border-bottom:1px solid var(--line)}
/* 썸네일 */
.rtr-thumb{width:72px;height:72px;object-fit:cover;border-radius:8px;flex-shrink:0}
.rtr-thumb.ph{width:72px;height:72px;border-radius:8px;font-size:11px}
/* 우측 텍스트 영역 */
.rtr-body{display:flex;flex-direction:column;justify-content:center;gap:4px}
/* 리뷰어 메타 라인 */
.rtr-meta{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.rtr-reviewer{font-size:13px;font-weight:700;color:var(--ink);letter-spacing:.01em}
.rtr-stars{display:inline-flex;align-items:center;gap:1px;line-height:1}
/* 본문 */
.rtr-line{font-size:14px;line-height:1.6;color:var(--muted)}
.rtr-line.first{color:var(--ink);font-weight:500}
`,
  render: (d, { esc, richSafe }) => {
    const eyebrow = d.eyebrow
      ? `<span class="rtr-eyebrow">${esc(d.eyebrow)}</span>`
      : ''

    const titleHtml = d.titleLine2
      ? `${richSafe(d.titleLine1)}<br>${richSafe(d.titleLine2)}`
      : richSafe(d.titleLine1)

    const rows = d.items
      .map((it) => {
        const starsHtml = it.stars != null ? renderStars(it.stars) : ''
        const line2Html = it.bodyLine2
          ? `<span class="rtr-line">${esc(it.bodyLine2)}</span>`
          : ''
        return `
    <div class="rtr-row">
      ${media(it.image, 'rtr-thumb', esc(it.imageAlt ?? '상품 이미지'))}
      <div class="rtr-body">
        <div class="rtr-meta">
          <span class="rtr-reviewer">${esc(it.reviewer)}</span>
          ${starsHtml}
        </div>
        <span class="rtr-line first">${esc(it.bodyLine1)}</span>
        ${line2Html}
      </div>
    </div>`
      })
      .join('')

    return `
<section class="rtr">
  ${eyebrow}
  <h2 class="rtr-title">${titleHtml}</h2>
  <div class="rtr-list">
    ${rows}
  </div>
</section>`
  },
})
