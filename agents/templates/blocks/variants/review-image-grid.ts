/** REVIEW 아키타입(템플릿 충실 재현): review-image-grid.
 *  와디즈 200섹션 06_고객리뷰 184:2803 — 2×2 이미지-텍스트 체커보드 그리드.
 *  각 셀: 제품 이미지 절반 + 리뷰 텍스트 절반, 홀/짝 행에서 이미지 좌우 교차.
 *  상단 accent 헤더(뱃지+대제목+소제목) + 하단 accent 마무리 문구. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  title: z.string().min(1),          // em,br — 예: "고객들의 극찬!"
  subtitle: z.string().min(1).optional(),
  reviews: z
    .array(
      z.object({
        image: z.string().optional(),     // url — 체커보드 절반 이미지
        rating: z.number().min(1).max(5).optional(),
        text: z.string().min(1),          // em,br — 리뷰 본문 (2줄 내외)
        author: z.string().min(1).optional(),
      }),
    )
    .min(2)
    .max(4),
  closer: z.string().min(1).optional(), // em,br — 예: "우리 상품은 NN명의 고객들이 인정했습니다."
})
type Data = z.infer<typeof schema>

const starN = (icon: (n: string) => string, n: number): string =>
  Array.from({ length: Math.max(1, Math.min(5, Math.round(n) || 5)) }, () => icon('star')).join('')

export const reviewImageGrid = defineBlock<Data>({
  id: 'review-image-grid',
  archetype: 'review',
  styleTags: ['premium', 'trust', 'template', 'grid', 'checkerboard'],
  imageSlots: 4,
  describe:
    '리뷰 체커보드 그리드. accent 헤더(대제목+소제목) + 2×2 타일(이미지 절반·별점+리뷰 절반, 홀짝 행 좌우 교차) + accent 마무리 문구. 이미지 중심 사회적 증거.',
  schema,
  css: `
.rig{background:var(--bg)}
.rig-hd{background:var(--accent);color:#fff;text-align:center;padding:52px 48px 48px}
.rig-title{font-family:var(--font-display);font-weight:800;font-size:52px;letter-spacing:-.02em;line-height:1.1;color:#fff}
.rig-title .em{color:var(--ink)}
.rig-sub{margin-top:12px;font-size:16px;color:rgba(255,255,255,.85);line-height:1.55}
.rig-grid{display:flex;flex-direction:column;gap:0}
.rig-row{display:flex;align-items:stretch;min-height:220px}
.rig-row:nth-child(odd)  .rig-img{order:0}
.rig-row:nth-child(odd)  .rig-txt{order:1}
.rig-row:nth-child(even) .rig-img{order:1}
.rig-row:nth-child(even) .rig-txt{order:0}
.rig-img{flex:0 0 50%;width:50%;height:220px;object-fit:cover;display:block}
.rig-txt{flex:1;background:var(--paper);padding:28px 30px;display:flex;flex-direction:column;justify-content:center;gap:10px;border-bottom:1px solid var(--line)}
.rig-stars{display:inline-flex;gap:3px;color:var(--accent)}
.rig-stars svg{width:18px;height:18px}
.rig-review{font-size:15px;color:var(--ink-2);line-height:1.65}
.rig-review .em{color:var(--accent);font-weight:700}
.rig-who{font-size:13px;font-weight:700;color:var(--ink);margin-top:4px}
.rig-closer{background:var(--accent);color:#fff;text-align:center;padding:44px 48px}
.rig-closer-txt{font-family:var(--font-display);font-weight:800;font-size:32px;line-height:1.35;color:#fff}
.rig-closer-txt .em{color:var(--ink)}
`,
  render: (d, { esc, richSafe, icon }) => `
<section class="rig">
  <div class="rig-hd">
    <h2 class="rig-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="rig-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  <div class="rig-grid">
    ${d.reviews
      .map(
        (r) => `
    <div class="rig-row">
      ${media(r.image, 'rig-img', '리뷰 이미지')}
      <div class="rig-txt">
        <span class="rig-stars">${starN(icon, r.rating ?? 5)}</span>
        <p class="rig-review">${richSafe(r.text)}</p>
        ${r.author ? `<span class="rig-who">— ${esc(r.author)}</span>` : ''}
      </div>
    </div>`,
      )
      .join('')}
  </div>
  ${d.closer ? `<div class="rig-closer"><p class="rig-closer-txt">${richSafe(d.closer)}</p></div>` : ''}
</section>`,
})
