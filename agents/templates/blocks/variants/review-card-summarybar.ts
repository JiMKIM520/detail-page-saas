/** REVIEW 아키타입: review-card-summarybar
 *  095_후기_05 패턴 재구성.
 *  짙은 남색 배경 + 빨간 별점 + 대형 센터 제목 + 최대 3개 리뷰 카드.
 *  각 카드: 흰 내용 블록(파란 키워드 뱃지 + 리뷰 텍스트 + 닉네임·별점 행 + 우측 제품 사진)
 *         + 카드 하단 파란 한줄 요약 바.
 *  이미지 부재 시 사진 열을 숨겨 텍스트 영역이 전체 너비를 채우는 noimg-safe 강등 적용. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const reviewItem = z.object({
  keyword: z.string().min(1),          // 파란 뱃지 키워드 (예: "재구매")
  text: z.string().min(1),             // 리뷰 본문
  reviewer: z.string().min(1),         // 닉네임 (예: "김*희")
  summary: z.string().min(1),          // 한줄 요약 바 텍스트 (예: "슬개골 통증 개선 · 착용감 만족")
  image: z.string().optional(),        // 제품 사진 (url) — 없으면 텍스트 영역 풀폭으로 강등
})

const schema = z.object({
  stars: z.string().optional(),        // 별점 표시 문자열 (기본 "★★★★★")
  title: z.string().min(1),           // 섹션 제목 (em,br)
  reviews: z.array(reviewItem).min(1).max(3),
})
type Data = z.infer<typeof schema>

export const reviewCardSummarybar = defineBlock<Data>({
  id: 'review-card-summarybar',
  archetype: 'review',
  styleTags: ['dark', 'template', 'social-proof', 'noimg-safe'],
  imageSlots: 3,
  describe:
    '고객 후기(최대 3개). 짙은 남색 배경 + 빨간 별점 + 센터 대제목. 각 카드: 흰 내용 블록(파란 키워드 뱃지·리뷰 본문·닉네임+별점) + 우측 제품 사진 + 카드 하단 파란 한줄 요약 바. 다크 배경 리뷰 섹션 전용. 이미지 없으면 텍스트 풀폭으로 자동 강등.',
  schema,
  css: `
.rndo{background:var(--brand,#183168);padding:64px var(--pad-x,56px) 72px;color:var(--bg,#fff)}
.rndo .em{color:var(--em-dark,#FFF7EA)}
.rndo-stars{font-size:40px;color:#ff0000;text-align:center;line-height:1;margin-bottom:16px;letter-spacing:2px}
.rndo-title{font-family:var(--font-display);font-weight:800;font-size:clamp(38px,5.5vw,64px);line-height:1.15;text-align:center;color:#fff;margin-bottom:48px}
.rndo-title .em{color:var(--em-dark,#FFF7EA)}
.rndo-list{display:flex;flex-direction:column;gap:24px}
.rndo-card{border-radius:calc(var(--r-scale,1)*12px);overflow:hidden}
.rndo-body{background:#fff;display:flex;align-items:flex-start;gap:0;min-height:160px}
.rndo-txt{flex:1;padding:20px 20px 16px 22px;color:#000;min-width:0}
.rndo-kw{display:inline-block;background:#1966f1;color:#fff;font-size:14px;font-weight:700;padding:5px 14px;border-radius:calc(var(--r-scale,1)*8px);margin-bottom:12px;white-space:nowrap}
.rndo-review{font-size:15px;font-weight:500;line-height:1.65;color:#222;margin-bottom:14px;word-break:keep-all}
.rndo-meta{display:flex;align-items:center;gap:10px}
.rndo-nick{font-size:14px;font-weight:500;color:#b7b7b7}
.rndo-score{font-size:15px;color:#ff0000;letter-spacing:1px}
.rndo-photo{flex:0 0 160px;width:160px;height:160px;object-fit:cover;border-radius:var(--shape-photo, calc(var(--r-scale,1)*10px));margin:20px 20px 20px 0;background:color-mix(in srgb,var(--accent,#1966f1) 8%,#f5f5f5)}
.rndo-photo.ph{display:none!important}
.rndo-body.rndo-noimg .rndo-txt{padding-right:22px}
.rndo-bar{background:#1966f1;padding:11px 22px}
.rndo-bar-text{font-size:15px;font-weight:500;color:#fff;letter-spacing:.01em}
`,
  render: (d, { esc, richSafe }) => {
    const stars = d.stars ?? '★★★★★'
    return `
<section class="rndo">
  <p class="rndo-stars">${esc(stars)}</p>
  <h2 class="rndo-title">${richSafe(d.title)}</h2>
  <div class="rndo-list">
    ${d.reviews.map((r) => {
      const hasImg = typeof r.image === 'string' && /^(https?:\/\/|data:|\/)/.test(r.image.trim())
      return `
    <div class="rndo-card">
      <div class="rndo-body${hasImg ? '' : ' rndo-noimg'}">
        <div class="rndo-txt">
          <span class="rndo-kw">${esc(r.keyword)}</span>
          <p class="rndo-review">${esc(r.text)}</p>
          <div class="rndo-meta">
            <span class="rndo-nick">${esc(r.reviewer)}</span>
            <span class="rndo-score">★★★★★</span>
          </div>
        </div>
        ${media(r.image, 'rndo-photo', '리뷰 사진')}
      </div>
      <div class="rndo-bar">
        <span class="rndo-bar-text">${esc(r.summary)}</span>
      </div>
    </div>`
    }).join('')}
  </div>
</section>`
  },
})
