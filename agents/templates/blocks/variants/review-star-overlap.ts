/** REVIEW 아키타입: review-star-overlap
 *  원본: 081_리뷰_및_추천_구성_페이지_8
 *  전면 배경 이미지 위에 대형 REVIEWS 타이포 + 브랜드 로고 필 + 해시태그 라인,
 *  검정 라운드 카드 3장 수직 배치, 각 카드 좌상단 모서리에 흰색 대형 별 아이콘이
 *  카드 위로 오버랩되는 시각 장치 + 황금 별점 내장. 다크/프리미엄 리뷰 섹션. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const reviewItem = z.object({
  reviewer: z.string().min(1),             // 구매자 이름 (예: 김**님)
  rating: z.number().int().min(1).max(5).default(5),
  text: z.string().min(1),                 // 후기 본문 (em,br)
})

const schema = z.object({
  bgImage: z.string().optional(),          // 전면 배경 이미지 URL
  brandLabel: z.string().optional(),       // 브랜드명 / 로고 텍스트 (필 라벨)
  headline: z.string().min(1).optional(),  // 대형 헤드라인 (기본 REVIEWS)
  tag: z.string().optional(),              // #제품특징 해시태그 라인
  reviews: z.array(reviewItem).min(1).max(5),
})
type Data = z.infer<typeof schema>

/** 별점 n개를 황금 SVG 별로 렌더. 빈 자리는 연한 색으로 채워 5칸 유지. */
function starRow(n: number): string {
  return Array.from({ length: 5 }, (_, i) => {
    const filled = i < n
    return `<svg class="rfqo-star-sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" fill="${filled ? '#ffc300' : 'rgba(255,255,255,.18)'}" stroke="none"/></svg>`
  }).join('')
}

export const reviewStarOverlap = defineBlock<Data>({
  id: 'review-star-overlap',
  archetype: 'review',
  styleTags: ['dark', 'premium', 'photo-bg', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '다크 전면 배경사진 위 대형 REVIEWS 타이포 + 브랜드 로고 필. 검정 라운드 카드 수직 3행, 각 카드 좌상단에 흰색 대형 별이 오버랩되는 시그니처 장치 + 황금 별점. 프리미엄·리뷰 집중 섹션.',
  schema,
  css: `
.rfqo{position:relative;padding:0;overflow:hidden;background:var(--brand,#1a1a1a)}
/* 배경 이미지 레이어 */
.rfqo-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;opacity:.55}
.rfqo-bg.ph{display:none!important}
/* 스크림: 상단 투명 → 하단 브랜드 다크로 텍스트 가독성 보장 */
.rfqo-scrim{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(18,16,14,.18) 0%,rgba(18,16,14,.62) 42%,rgba(18,16,14,.82) 100%)}
/* 내용 래퍼 */
.rfqo-inner{position:relative;z-index:1;padding:54px var(--pad-x,56px) 66px}
/* 브랜드 로고 필 */
.rfqo-brand{display:inline-block;border:2px solid rgba(255,255,255,.7);border-radius:999px;padding:8px 28px;font-family:var(--font-display);font-weight:700;font-size:18px;color:#fff;letter-spacing:.06em;margin-bottom:28px}
/* 대형 REVIEWS 헤드라인 */
.rfqo-headline{font-family:var(--font-display);font-weight:500;font-size:80px;letter-spacing:-.01em;line-height:1;color:#cdbfaf;margin-bottom:0}
/* 해시태그 라인 */
.rfqo-tag{margin-top:12px;font-family:var(--font-body);font-size:20px;font-weight:400;color:rgba(255,255,255,.82);letter-spacing:.01em}
/* 리뷰 카드 스택 */
.rfqo-cards{margin-top:40px;display:flex;flex-direction:column;gap:0;overflow:hidden}
/* 카드 외부 래퍼 — 별 오버랩을 위한 포지셔닝 컨텍스트 */
.rfqo-card-wrap{position:relative;padding-top:40px}
.rfqo-card-wrap+.rfqo-card-wrap{margin-top:24px}
/* 오버랩 흰 별 — 카드(rfqo-card) 기준 절대 위치, 최대 24px 돌출 */
.rfqo-big-star{position:absolute;top:calc(40px - 24px);left:16px;width:80px;height:80px;z-index:2;color:#fff;filter:drop-shadow(0 4px 14px rgba(0,0,0,.35));pointer-events:none}
.rfqo-big-star svg{width:100%;height:100%}
/* 검정 라운드 카드 — overflow:hidden으로 별이 카드 외부 배경에 이탈 방지 */
.rfqo-card{position:relative;z-index:1;background:#000;border-radius:calc(var(--r-scale,1)*32px);padding:32px 28px 28px 28px;margin-left:0;overflow:visible}
/* 카드 상단 행: 구매자 + 별점 */
.rfqo-card-meta{display:flex;align-items:center;gap:14px;margin-bottom:14px;padding-left:72px}
.rfqo-reviewer{font-family:var(--font-body);font-size:15px;font-weight:400;color:#b9b9b9;flex-shrink:0}
.rfqo-stars{display:flex;align-items:center;gap:3px}
.rfqo-star-sm{width:18px;height:18px;flex-shrink:0}
/* 후기 본문 */
.rfqo-text{font-family:var(--font-body);font-size:16px;font-weight:500;line-height:1.7;color:#fff;padding-left:0}
.rfqo-text .em{color:var(--em-dark,#FFF7EA)}
/* 다크 섹션 .em 스코프 오버라이드 */
.rfqo .em{color:var(--em-dark,#FFF7EA)}
`,
  render: (d, { esc, richSafe }) => {
    const headline = d.headline ?? 'REVIEWS'
    const cards = d.reviews.map((r) => `
    <div class="rfqo-card-wrap">
      <div class="rfqo-big-star" aria-hidden="true">
        <svg viewBox="0 0 120 120">
          <path d="M60 6l13.1 40.3H113L80.5 69.7l12.6 38.6L60 86.2 27 108.3l12.6-38.6L7 46.3H46.9z" fill="#ffffff"/>
        </svg>
      </div>
      <div class="rfqo-card">
        <div class="rfqo-card-meta">
          <span class="rfqo-reviewer">${esc(r.reviewer)}</span>
          <span class="rfqo-stars" aria-label="${r.rating}점">${starRow(r.rating)}</span>
        </div>
        <div class="rfqo-text">${richSafe(r.text)}</div>
      </div>
    </div>`).join('')

    return `
<section class="rfqo">
  ${media(d.bgImage, 'rfqo-bg', '리뷰 섹션 배경')}
  <div class="rfqo-scrim"></div>
  <div class="rfqo-inner">
    ${d.brandLabel ? `<div class="rfqo-brand">${esc(d.brandLabel)}</div>` : ''}
    <h2 class="rfqo-headline">${esc(headline)}</h2>
    ${d.tag ? `<p class="rfqo-tag">${esc(d.tag)}</p>` : ''}
    <div class="rfqo-cards">${cards}
    </div>
  </div>
</section>`
  },
})
