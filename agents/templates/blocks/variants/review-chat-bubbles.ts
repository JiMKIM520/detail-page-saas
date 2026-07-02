/** REVIEW 아키타입(템플릿 충실 재현): review-chat-bubbles.
 *  와디즈 200섹션 06_고객리뷰 184:2763 (채팅/메신저 버블 레이아웃) 패턴 재구성.
 *  KakaoTalk 대화창 느낌: 이모지 아바타 + 좌우 교차 말풍선 리뷰 + 인정 카운트. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  eyebrow: z.string().min(1).optional(),         // 예 "Customer Review"
  subtitle: z.string().min(1).optional(),        // 예 "고객들의 리뷰에 대해서 써주세요"
  title: z.string().min(1),                      // em,br 허용. 예 "고객들의 극찬!"
  heroImage: z.string().optional(),              // (url) 대표 상품 이미지
  reviews: z
    .array(
      z.object({
        text: z.string().min(1),                 // em,br 허용. 리뷰 본문
        emoji: z.string().min(1).optional(),     // 아바타 이모지 (예 "😊" "😍")
        side: z.enum(['left', 'right']).optional(), // 기본: 교대(짝수=left, 홀수=right)
      }),
    )
    .min(2)
    .max(6),
  closer: z.string().min(1).optional(),          // em,br 허용. 예 "우리 상품은 NN명의<br>고객들이 인정했습니다."
})
type Data = z.infer<typeof schema>

export const reviewChatBubbles = defineBlock<Data>({
  id: 'review-chat-bubbles',
  archetype: 'review',
  styleTags: ['playful', 'social', 'messenger', 'kakao', 'template'],
  imageSlots: 1,
  describe:
    '메신저 버블형 리뷰. "Customer Review" 뱃지 + 대제목 + 대표상품 이미지 + 이모지 아바타가 붙은 좌우 교차 말풍선 리뷰(KakaoTalk 느낌) + 인정 카운트 마무리. 소셜 증거 강조.',
  schema,
  css: `
.rcb{background:var(--bg);padding:54px 0 62px;text-align:center}
.rcb-badge{display:inline-block;border:1.5px solid var(--line);border-radius:999px;font-size:13px;font-weight:700;letter-spacing:.06em;color:var(--ink-2);padding:6px 20px;margin-bottom:18px}
.rcb-sub{font-size:15px;color:var(--ink-2);margin-bottom:6px}
.rcb-title{font-family:var(--font-display);font-weight:800;font-size:48px;letter-spacing:-.02em;color:var(--ink);line-height:1.1;padding:0 40px}
.rcb-title .em{color:var(--accent)}
.rcb-hero{margin:28px 40px;border-radius:16px;overflow:hidden;background:color-mix(in srgb,var(--accent) 8%,transparent)}
.rcb-hero img,.rcb-hero.ph{width:100%;height:320px;object-fit:cover;border-radius:16px}
.rcb-list{display:flex;flex-direction:column;gap:14px;margin:28px 0 0}
.rcb-row{display:flex;align-items:flex-end;gap:10px;padding:0 24px;width:100%;box-sizing:border-box}
.rcb-row--left{flex-direction:row;justify-content:flex-start}
.rcb-row--right{flex-direction:row-reverse;justify-content:flex-start}
.rcb-avatar{flex:0 0 44px;width:44px;height:44px;border-radius:50%;background:color-mix(in srgb,var(--accent) 14%,transparent);display:grid;place-items:center;font-size:22px;line-height:1;border:2px solid color-mix(in srgb,var(--accent) 30%,transparent)}
.rcb-bubble{background:var(--brand);color:#fff;border-radius:20px;padding:14px 18px;max-width:72%;text-align:left;box-shadow:0 6px 20px -8px rgba(0,0,0,.35)}
.rcb-row--left .rcb-bubble{border-bottom-left-radius:4px}
.rcb-row--right .rcb-bubble{border-bottom-right-radius:4px}
.rcb-bubble p{font-size:15px;font-weight:600;line-height:1.6;color:#fff}
.rcb-bubble .em{color:color-mix(in srgb,var(--accent) 100%,#fff 30%)}
.rcb-closer{margin-top:40px;padding:0 40px;font-family:var(--font-display);font-weight:800;font-size:32px;color:var(--ink);line-height:1.4}
.rcb-closer .em{color:var(--accent)}
`,
  render: (d, { esc, richSafe }) => {
    const DEFAULT_EMOJIS = ['😊', '😍', '🤩', '😄', '🥰', '😎']
    const rows = d.reviews
      .map((r, i) => {
        const side = r.side ?? (i % 2 === 0 ? 'left' : 'right')
        const emoji = r.emoji ? esc(r.emoji) : DEFAULT_EMOJIS[i % DEFAULT_EMOJIS.length]
        return `
  <div class="rcb-row rcb-row--${side}">
    <div class="rcb-avatar">${emoji}</div>
    <div class="rcb-bubble"><p>${richSafe(r.text)}</p></div>
  </div>`
      })
      .join('')

    return `
<section class="rcb">
  ${d.eyebrow ? `<span class="rcb-badge">${esc(d.eyebrow)}</span>` : ''}
  ${d.subtitle ? `<p class="rcb-sub">${esc(d.subtitle)}</p>` : ''}
  <h2 class="rcb-title">${richSafe(d.title)}</h2>
  ${d.heroImage ? media(d.heroImage, 'rcb-hero', '대표 상품') : `<div class="rcb-hero ph">상품 이미지</div>`}
  <div class="rcb-list">${rows}
  </div>
  ${d.closer ? `<p class="rcb-closer">${richSafe(d.closer)}</p>` : ''}
</section>`
  },
})
