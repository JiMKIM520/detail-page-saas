/** REVIEW 아키타입(템플릿 충실 재현): review-thumbnail-cards.
 *  와디즈 200섹션 06_고객리뷰 _625 (인라인 썸네일 리뷰 카드) 패턴 재구성.
 *  다크 배경 + 인용부호 헤더 + 정사각 제품 썸네일 인라인 카드 리스트 + 마무리 임팩트 문구.
 *  review-list(원형 아바타)와 달리 구매 인증 이미지 첨부형 느낌 — 제품 썸네일이 카드 좌측에 고정. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  eyebrow: z.string().min(1).optional(),           // 예 "REAL REVIEW" (소형 레이블)
  quote: z.string().min(1).optional(),             // 예 "고객들의 리뷰에 대해서 써주세요" (부제)
  title: z.string().min(1),                        // 예 "고객들의 극찬!" (em,br)
  reviews: z
    .array(
      z.object({
        image: z.string().optional(),              // 사각 제품 썸네일 (url)
        author: z.string().min(1).optional(),      // 예 "tnwjd***"
        rating: z.number().min(1).max(5).optional(),
        text: z.string().min(1),                   // 리뷰 본문 (em,br)
      }),
    )
    .min(2)
    .max(4),
  closer: z.string().min(1).optional(),            // 예 "우리 상품은 NN명의\n고객들이 인정했습니다." (em,br)
})
type Data = z.infer<typeof schema>

const starN = (icon: (n: string) => string, n: number): string =>
  Array.from({ length: Math.max(1, Math.min(5, Math.round(n) || 5)) }, () => icon('star')).join('')

export const reviewThumbnailCards = defineBlock<Data>({
  id: 'review-thumbnail-cards',
  archetype: 'review',
  styleTags: ['dark', 'premium', 'trust', 'template'],
  imageSlots: 4,
  describe:
    '구매 인증 리뷰 카드(인라인 썸네일). 다크 배경 + 인용부호+헤더 + 정사각 제품 썸네일이 카드 좌측에 인라인 배치된 리뷰 카드 리스트 + 임팩트 마무리 문구. 이미지 첨부형 구매 후기 느낌.',
  schema,
  css: `
.rtc{background:var(--ink);color:#fff;padding:60px 48px 72px}
.rtc-hd{text-align:center;margin-bottom:40px}
.rtc-eye{display:inline-block;font-size:12px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.28);border-radius:calc(var(--r-scale,1)*4px);padding:5px 14px;margin-bottom:22px}
.rtc-qmark{display:block;font-family:var(--font-lat);font-size:48px;color:var(--accent);line-height:1;margin-bottom:10px}
.rtc-quote{font-size:15px;color:rgba(255,255,255,.55);margin-bottom:8px;line-height:1.5}
.rtc-title{font-family:var(--font-display);font-weight:800;font-size:52px;color:#fff;line-height:1.1;letter-spacing:-.02em}
.rtc-title .em{color:var(--accent)}
.rtc-list{display:flex;flex-direction:column;gap:16px}
.rtc-card{display:flex;align-items:stretch;gap:0;background:var(--paper);border-radius:calc(var(--r-scale,1)*20px);overflow:hidden;box-shadow:0 12px 30px -18px rgba(0,0,0,.55)}
.rtc-thumb{flex:0 0 140px;width:140px;height:140px;object-fit:cover;display:block}
.rtc-body{flex:1;padding:20px 22px;display:flex;flex-direction:column;justify-content:center}
.rtc-meta{display:flex;align-items:center;gap:10px;margin-bottom:12px}
.rtc-stars{display:inline-flex;gap:2px;color:var(--accent)}
.rtc-stars svg{width:16px;height:16px}
.rtc-sep{width:1px;height:16px;background:var(--line)}
.rtc-author{font-size:13px;font-weight:700;color:var(--ink-2)}
.rtc-text{font-size:14px;color:var(--ink-2);line-height:1.65}
.rtc-text .em{color:var(--accent);font-weight:700}
.rtc-closer{margin-top:52px;text-align:center;font-family:var(--font-display);font-weight:800;font-size:38px;color:#fff;line-height:1.3;letter-spacing:-.02em}
.rtc-closer .em{color:var(--accent)}
`,
  render: (d, { esc, richSafe, icon }) => `
<section class="rtc">
  <div class="rtc-hd">
    ${d.eyebrow ? `<span class="rtc-eye">${esc(d.eyebrow)}</span>` : ''}
    <span class="rtc-qmark">"</span>
    ${d.quote ? `<p class="rtc-quote">${esc(d.quote)}</p>` : ''}
    <h2 class="rtc-title">${richSafe(d.title)}</h2>
  </div>
  <div class="rtc-list">
    ${d.reviews
      .map(
        (r) =>
          `<div class="rtc-card">${media(r.image, 'rtc-thumb', '제품 리뷰 이미지')}<div class="rtc-body"><div class="rtc-meta"><span class="rtc-stars">${starN(icon, r.rating ?? 5)}</span><span class="rtc-sep"></span>${r.author ? `<span class="rtc-author">${esc(r.author)}</span>` : ''}</div><div class="rtc-text">${richSafe(r.text)}</div></div></div>`,
      )
      .join('')}
  </div>
  ${d.closer ? `<p class="rtc-closer">${richSafe(d.closer)}</p>` : ''}
</section>`,
})
