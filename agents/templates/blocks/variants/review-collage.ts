/** REVIEW 아키타입(템플릿 충실 재현): review-collage.
 *  와디즈 200섹션 06_고객리뷰 184:3354 (말풍선 콜라주) 패턴 재구성.
 *  좌정렬 대제목 + 리뷰 말풍선 4개가 제품 이미지 위 자유 각도로 겹치는 콜라주. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  eyebrow: z.string().min(1).optional(),     // 예 "Customer Review"
  title: z.string().min(1),                  // em,br 허용. 예 "고객들의 극찬!"
  subtitle: z.string().min(1).optional(),    // 예 "고객들의 리뷰에 대해서 써주세요"
  productImage: z.string().optional(),       // (url) 배경에 깔리는 제품 이미지
  reviews: z
    .array(
      z.object({
        text: z.string().min(1),             // em,br 허용. 리뷰 본문
        stars: z.number().int().min(1).max(5).optional(), // 별점 (기본 5)
        rotate: z.number().min(-12).max(12).optional(),   // 기울기(deg, 기본 자동)
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

/** 버블별 기본 회전/위치 오프셋 — 지정값 없을 때 사용 */
const DEFAULT_ROTATES = [-4, 6, -7, 3]

export const reviewCollage = defineBlock<Data>({
  id: 'review-collage',
  archetype: 'review',
  styleTags: ['playful', 'collage', 'light', 'social', 'template'],
  imageSlots: 1,
  describe:
    '말풍선 콜라주형 리뷰. 좌정렬 대제목 + 부제목 + 제품 이미지 위에 말풍선 4개가 자유 각도로 겹치는 콜라주 레이아웃. 소셜 증거를 생동감 있게 연출.',
  schema,
  css: `
.rco{background:var(--bg);padding:54px 44px 0;overflow:hidden}
.rco-hd{margin-bottom:10px}
.rco-eye{display:inline-block;font-size:13px;font-weight:700;letter-spacing:.08em;color:var(--ink-2);margin-bottom:10px}
.rco-title{font-family:var(--font-display);font-weight:800;font-size:52px;letter-spacing:-.02em;color:var(--accent);line-height:1.1}
.rco-title .em{color:var(--ink)}
.rco-sub{margin-top:8px;font-size:15px;color:var(--ink-2);line-height:1.6}
.rco-stage{position:relative;width:100%;margin-top:32px;padding-bottom:480px}
.rco-product{position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:440px;height:420px;object-fit:contain;z-index:0;opacity:.92}
.rco-product.ph{position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:440px;height:420px;z-index:0;border-radius:calc(var(--r-scale,1)*16px)}
.rco-bubble{position:absolute;background:var(--paper);border-radius:calc(var(--r-scale,1)*18px);padding:18px 20px 20px;box-shadow:0 8px 28px -6px rgba(0,0,0,.18);z-index:2;max-width:220px}
.rco-bubble::after{content:"";position:absolute;bottom:-13px;left:22px;width:0;height:0;border-left:10px solid transparent;border-right:10px solid transparent;border-top:14px solid var(--paper);filter:drop-shadow(0 4px 4px rgba(0,0,0,.08))}
.rco-btext{font-size:13px;font-weight:600;color:var(--ink);line-height:1.65}
.rco-btext .em{color:var(--accent)}
.rco-stars{margin-top:10px;display:flex;gap:3px;color:var(--accent)}
.rco-stars svg{width:16px;height:16px;fill:var(--accent)}
/* 4 bubble positions (top-left, top-right, mid-left, mid-right) */
.rco-b0{top:0;left:-6px}
.rco-b1{top:0;right:-6px}
.rco-b2{top:210px;left:-6px}
.rco-b3{top:200px;right:-6px}
`,
  render: (d, { esc, richSafe }) => {
    const starSvg = `<svg viewBox="0 0 24 24"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>`

    const bubbles = d.reviews
      .slice(0, 4)
      .map((r, i) => {
        const rot = r.rotate ?? DEFAULT_ROTATES[i % DEFAULT_ROTATES.length]
        const stars = r.stars ?? 5
        const starRow = Array.from({ length: 5 }, (_, si) =>
          si < stars ? starSvg : `<svg viewBox="0 0 24 24" style="opacity:.25"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>`,
        ).join('')

        return `
  <div class="rco-bubble rco-b${i}" style="transform:rotate(${rot}deg)">
    <p class="rco-btext">${richSafe(r.text)}</p>
    <div class="rco-stars">${starRow}</div>
  </div>`
      })
      .join('')

    const productEl = d.productImage
      ? media(d.productImage, 'rco-product', '제품 이미지')
      : `<div class="rco-product ph">제품 이미지</div>`

    return `
<section class="rco">
  <div class="rco-hd">
    ${d.eyebrow ? `<p class="rco-eye">${esc(d.eyebrow)}</p>` : ''}
    <h2 class="rco-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="rco-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  <div class="rco-stage">
    ${productEl}
    ${bubbles}
  </div>
</section>`
  },
})
