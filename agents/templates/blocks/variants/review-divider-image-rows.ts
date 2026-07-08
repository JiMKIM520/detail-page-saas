/** REVIEW 아키타입: review-divider-image-rows.
 *  [끝판왕] 리뷰·추천 #3 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 채팅 아이콘 + 2줄 헤드라인(평문+accent 강조) → HR 구분선
 *            → [별점(5★ gold)+닉네임 헤더 → 굵은 제목+본문(좌) / 썸네일 2장(우) → HR] 반복. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 섹션 헤드라인 상단 평문 (예: "많은 고객님들께서") */
  headingTop: z.string().min(1),
  /** accent 강조 하단 헤드라인 (예: "저희 제품을 사용 중입니다!") */
  headingAccent: z.string().min(1),
  /** 리뷰 아이템 (2~5개) */
  items: z
    .array(
      z.object({
        /** 별점 (1~5, 정수) */
        rating: z.number().int().min(1).max(5).default(5),
        /** 닉네임 (예: "송**님") */
        nickname: z.string().min(1),
        /** 굵은 리뷰 제목 */
        title: z.string().min(1),
        /** 리뷰 본문 (em/br 허용) */
        body: z.string().min(1),
        /** 첫 번째 후기 이미지 URL */
        image1: z.string().optional(),
        /** 두 번째 후기 이미지 URL */
        image2: z.string().optional(),
      }),
    )
    .min(2)
    .max(5),
})
type Data = z.infer<typeof schema>

/** 별점 HTML 렌더 — gold 하드코딩 (#FFB800: 커머스 신호색) */
const renderStars = (rating: number): string => {
  const filled = Math.min(5, Math.max(0, rating))
  const stars = Array.from({ length: 5 }, (_, i) => {
    const color = i < filled ? '#FFB800' : '#D8D8D8'
    return `<span style="color:${color};font-size:20px;line-height:1">★</span>`
  }).join('')
  return `<span class="rdir-stars" role="img" aria-label="${rating}점 만점 5점">${stars}</span>`
}

/** 채팅 아이콘 — ICONS에 없으므로 인라인 SVG (stroke=currentColor) */
const CHAT_ICON =
  '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" width="48" height="48"><path d="M8 8h32a3 3 0 0 1 3 3v20a3 3 0 0 1-3 3H16l-9 7V11a3 3 0 0 1 1-3z"/><path d="M16 21h16M16 28h10"/></svg>'

export const reviewDividerImageRows = defineBlock<Data>({
  id: 'review-divider-image-rows',
  archetype: 'review',
  styleTags: ['light', 'social-proof', 'divider', 'image-rows', 'template'],
  imageSlots: 4,
  describe:
    '고객 리뷰(구분선+이미지 행). 채팅 아이콘+2줄 헤드라인(평문+accent 강조) → HR → [5★ 별점+닉네임 헤더 / 굵은 제목+본문(좌 60%)+썸네일 2장(우 40%) / HR] 반복(2~5회). 밝은 배경, 커머스 소셜프루프 영역.',
  schema,
  css: `
/* review-divider-image-rows — 접두사 rdir- */
.rdir{background:var(--paper);padding:60px 40px 48px;word-break:keep-all;overflow-wrap:break-word}
/* 섹션 헤더 */
.rdir-hd{text-align:center;margin-bottom:36px}
.rdir-icon{color:var(--accent);margin-bottom:16px;display:flex;justify-content:center}
.rdir-ht{font-family:var(--font-display);font-weight:800;font-size:clamp(24px,5.5vw,38px);color:var(--ink);line-height:1.25;letter-spacing:-.02em;margin-bottom:4px}
.rdir-ha{font-family:var(--font-display);font-weight:800;font-size:clamp(24px,5.5vw,38px);color:var(--accent-d);line-height:1.25;letter-spacing:-.02em}
/* 최상단 HR */
.rdir-top-hr{border:none;border-top:1px solid var(--line);margin:0 0 0 0}
/* 리뷰 아이템 */
.rdir-item{padding:28px 0 0}
/* 별점+닉네임 헤더 행 */
.rdir-meta{display:flex;align-items:center;gap:10px;margin-bottom:16px}
.rdir-stars{display:inline-flex;gap:2px;line-height:1}
.rdir-sep{color:var(--line);font-size:16px;line-height:1;user-select:none}
.rdir-nick{font-family:var(--font-body);font-size:15px;color:var(--muted);line-height:1}
/* 콘텐츠 행: 텍스트 좌 + 이미지 우 */
.rdir-row{display:grid;grid-template-columns:1fr auto;gap:16px;align-items:start;margin-bottom:28px}
.rdir-txt{}
.rdir-title{font-family:var(--font-body);font-weight:700;font-size:16px;color:var(--ink);line-height:1.45;margin-bottom:8px}
.rdir-body{font-family:var(--font-body);font-size:14px;color:var(--ink);line-height:1.75}
.rdir-body .em{color:var(--accent-d);font-weight:700}
/* 썸네일 2장 */
.rdir-imgs{display:flex;gap:8px;flex-shrink:0}
.rdir-thumb{width:100px;height:100px;object-fit:cover;border-radius:calc(var(--r-scale,1)*6px);display:block}
.rdir-thumb.ph{width:100px;height:100px;border-radius:calc(var(--r-scale,1)*6px);border:2px dashed var(--line);background:var(--bg);display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--muted)}
/* 구분선 */
.rdir-hr{border:none;border-top:1px solid var(--line);margin:0}
`,
  render: (d, { esc, richSafe }) => {
    const items = d.items
      .map(
        (it) => `
    <div class="rdir-item">
      <div class="rdir-meta">
        ${renderStars(it.rating)}
        <span class="rdir-sep" aria-hidden="true">|</span>
        <span class="rdir-nick">${esc(it.nickname)}</span>
      </div>
      <div class="rdir-row">
        <div class="rdir-txt">
          <p class="rdir-title">${esc(it.title)}</p>
          <p class="rdir-body">${richSafe(it.body)}</p>
        </div>
        <div class="rdir-imgs">
          ${media(it.image1, 'rdir-thumb', esc(it.nickname) + ' 후기 이미지 1')}
          ${media(it.image2, 'rdir-thumb', esc(it.nickname) + ' 후기 이미지 2')}
        </div>
      </div>
      <hr class="rdir-hr">
    </div>`,
      )
      .join('')

    return `
<section class="rdir">
  <div class="rdir-hd">
    <div class="rdir-icon" aria-hidden="true">${CHAT_ICON}</div>
    <p class="rdir-ht">${esc(d.headingTop)}</p>
    <p class="rdir-ha">${esc(d.headingAccent)}</p>
  </div>
  <hr class="rdir-top-hr">
  ${items}
</section>`
  },
})
