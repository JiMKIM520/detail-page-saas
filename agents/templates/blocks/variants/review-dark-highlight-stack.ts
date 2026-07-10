/** REVIEW 아키타입: review-dark-highlight-stack
 *  피그마 087_리뷰_및_추천_구성_페이지_23 구조 흡수.
 *  다크 배경 + 2줄 섹션 타이틀(연두 강조) + 5개 리뷰 카드 수직 스택.
 *  각 카드: 좌 정사각 사진 + 우 유저·별점·리뷰 본문.
 *  핵심 장치: 리뷰 본문 내 키워드를 흰 배경 인라인 하이라이트(<mark class="rvdp-hl">)로 강조.
 *  이미지 없는 카드는 사진 열을 숨기고 텍스트 전폭 확장(noimg-safe). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const reviewItemSchema = z.object({
  image: z.string().optional(),        // 정사각 리뷰 사진 (url)
  rating: z.number().min(1).max(5).optional(), // 별점 (기본 5)
  text: z.string().min(1),             // 리뷰 본문 — 일반 텍스트
  highlight: z.string().optional(),    // 본문 내 인라인 하이라이트 키워드 (순수 텍스트)
})

const schema = z.object({
  headSmall: z.string().min(1),        // 상단 소형 한 줄 (em,br 허용)
  headLarge: z.string().min(1),        // 하단 대형 첫 부분 (em,br 허용)
  headAccent: z.string().optional(),   // 대형 줄 끝 포인트 단어 (색 다른 강조, 순수 텍스트)
  reviews: z.array(reviewItemSchema).min(1).max(7),
})
type Data = z.infer<typeof schema>

/** 별점 → 별 SVG 5개 (채움/비움) */
function starRow(rating: number): string {
  const r = Math.round(Math.max(0, Math.min(5, rating)))
  return Array.from({ length: 5 }, (_, i) =>
    i < r
      ? `<svg class="rvdp-star filled" viewBox="0 0 14 14"><path d="M7 1l1.6 4.2H14l-3.7 2.7 1.4 4.3L7 9.5l-4.7 2.7 1.4-4.3L0 5.2h5.4z"/></svg>`
      : `<svg class="rvdp-star" viewBox="0 0 14 14"><path d="M7 1l1.6 4.2H14l-3.7 2.7 1.4 4.3L7 9.5l-4.7 2.7 1.4-4.3L0 5.2h5.4z"/></svg>`,
  ).join('')
}

export const reviewDarkHighlightStack = defineBlock<Data>({
  id: 'review-dark-highlight-stack',
  archetype: 'review',
  styleTags: ['dark', 'social-proof', 'highlight', 'image-card', 'noimg-safe'],
  imageSlots: 5,
  describe:
    '다크 배경 리뷰 스택. 연두 2줄 섹션 타이틀 + 최대 7개 카드(좌 정사각 이미지+우 별점·본문). 핵심 키워드를 흰 배경 인라인 하이라이트로 이중 강조. 이미지 없는 카드는 텍스트 전폭으로 강등(noimg-safe).',
  schema,
  css: `
.rvdp{background:#111;color:var(--ink);padding:58px var(--pad-x,56px) 64px}
/* ── 다크 영역 em 스코프 오버라이드 ── */
.rvdp .em{color:var(--em-dark,#FFF7EA)}
/* ── 섹션 헤더 ── */
.rvdp-hd{margin-bottom:32px}
.rvdp-head-sm{font-family:var(--font-display);font-weight:600;font-size:22px;line-height:1.3;color:#e1ffba;letter-spacing:-.01em}
.rvdp-head-lg{display:flex;flex-wrap:wrap;align-items:baseline;gap:0 10px;margin-top:6px}
.rvdp-head-main{font-family:var(--font-display);font-weight:800;font-size:48px;line-height:1.15;color:#e1ffba;letter-spacing:-.02em}
.rvdp-head-acc{font-family:var(--font-display);font-weight:800;font-size:48px;line-height:1.15;color:#6bbe00;letter-spacing:-.02em}
/* ── 리뷰 카드 리스트 ── */
.rvdp-list{display:flex;flex-direction:column;gap:14px}
/* ── 리뷰 카드 ── */
.rvdp-card{display:flex;gap:20px;align-items:stretch;background:#f6ffeb;border-radius:calc(var(--r-scale,1)*12px);overflow:hidden;padding:20px}
/* ── 이미지 열 ── */
.rvdp-img-wrap{flex:0 0 160px;width:160px}
.rvdp-img-wrap img,.rvdp-img-wrap .ph{width:160px;height:160px;object-fit:cover;border-radius:calc(var(--r-scale,1)*8px);display:block}
/* noimg-safe: 이미지 없으면 이미지 열 제거 — .ph는 baseCss에서 display:none!important */
.rvdp-card.no-img .rvdp-img-wrap{display:none}
.rvdp-card.no-img .rvdp-body{flex:1}
/* ── 텍스트 열 ── */
.rvdp-body{flex:1;display:flex;flex-direction:column;justify-content:space-between;min-width:0}
/* ── 별점 행 ── */
.rvdp-rating-row{display:flex;align-items:center;gap:6px;margin-bottom:10px}
.rvdp-stars{display:flex;gap:2px}
.rvdp-star{width:14px;height:14px;fill:none;stroke:#e0cb00;stroke-width:1.2}
.rvdp-star.filled{fill:#ffe030;stroke:#ffe030}
.rvdp-score{font-size:17px;font-weight:700;color:#111;letter-spacing:-.01em}
/* ── 리뷰 본문 ── */
.rvdp-text{font-size:14px;font-weight:300;color:#222;line-height:1.72;word-break:keep-all}
/* ── 인라인 하이라이트 ── */
.rvdp-hl{display:inline;background:#fff;color:#6bbe00;font-weight:600;font-size:14px;padding:2px 0;border-radius:0;line-height:inherit}
`,
  render: (d, { esc, richSafe }) => {
    const cards = d.reviews
      .map((r) => {
        const rating = r.rating ?? 5
        const ratingDisplay = Number.isInteger(rating) ? String(rating) : rating.toFixed(1)
        const hasImg = typeof r.image === 'string' && r.image.length > 0

        // 본문에서 highlight 키워드를 인라인 하이라이트로 감싸기
        // esc() 후 이스케이프된 텍스트에서 키워드(도 esc)를 찾아 <mark>로 교체
        let bodyHtml = esc(r.text)
        if (r.highlight && r.highlight.trim()) {
          const hlEsc = esc(r.highlight.trim())
          // 이스케이프된 문자열 내 키워드 첫 번째 등장을 하이라이트로 교체
          bodyHtml = bodyHtml.replace(
            hlEsc,
            `<mark class="rvdp-hl">${hlEsc}</mark>`,
          )
        }

        return `<div class="rvdp-card${hasImg ? '' : ' no-img'}">
  <div class="rvdp-img-wrap">
    ${media(r.image, '', '리뷰 사진')}
  </div>
  <div class="rvdp-body">
    <div class="rvdp-rating-row">
      <span class="rvdp-stars">${starRow(rating)}</span>
      <span class="rvdp-score">${esc(ratingDisplay)}</span>
    </div>
    <p class="rvdp-text">${bodyHtml}</p>
  </div>
</div>`
      })
      .join('\n')

    return `<section class="rvdp">
  <div class="rvdp-hd">
    <p class="rvdp-head-sm">${richSafe(d.headSmall)}</p>
    <div class="rvdp-head-lg">
      <span class="rvdp-head-main">${richSafe(d.headLarge)}</span>
      ${d.headAccent ? `<span class="rvdp-head-acc">${esc(d.headAccent)}</span>` : ''}
    </div>
  </div>
  <div class="rvdp-list">
    ${cards}
  </div>
</section>`
  },
})
