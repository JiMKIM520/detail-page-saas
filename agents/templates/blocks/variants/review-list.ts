/** REVIEW 아키타입(템플릿 충실 재현): review-list.
 *  와디즈 200섹션 06_고객리뷰 _09(아바타+멀티라인 리뷰 리스트 + 인정 카운트) 패턴 재구성.
 *  시그니처 헤더(뱃지+코발트 대제목) + 아바타/별점/텍스트 카드 리스트 + 마무리 카운트. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  title: z.string().min(1), // 예 "고객들의 극찬!"
  subtitle: z.string().min(1).optional(),
  reviews: z
    .array(
      z.object({
        text: z.string().min(1), // em/br
        author: z.string().min(1).optional(),
        rating: z.number().min(1).max(5).optional(),
        image: z.string().optional(), // 원형 아바타
      }),
    )
    .min(2)
    .max(5),
  closer: z.string().min(1).optional(), // em,br (예 "우리 상품은 NN명의 고객이 인정")
})
type Data = z.infer<typeof schema>

const starN = (icon: (n: string) => string, n: number): string =>
  Array.from({ length: Math.max(1, Math.min(5, Math.round(n) || 5)) }, () => icon('star')).join('')

export const reviewList = defineBlock<Data>({
  id: 'review-list',
  archetype: 'review',
  styleTags: ['premium', 'trust', 'template'],
  imageSlots: 5,
  describe:
    '고객 리뷰 리스트. 코발트 뱃지+대제목 + 원형 아바타·별점·리뷰 텍스트 카드 리스트 + 인정 카운트 마무리. 신뢰형 사회적 증거.',
  schema,
  css: `
.rl{background:var(--bg);padding:54px var(--pad-x,56px) 56px}
.rl-hd{text-align:center;margin-bottom:28px}
.rl-badge{width:56px;height:56px;margin:0 auto 18px;border-radius:50%;background:var(--accent);display:grid;place-items:center;color:#fff}
.rl-badge svg{width:30px;height:30px}
.rl-title{font-family:var(--font-display);font-weight:800;font-size:46px;color:var(--accent);line-height:1.1}
.rl-sub{margin-top:10px;font-size:15px;color:var(--ink-2)}
.rl-list{display:flex;flex-direction:column;gap:14px}
.rl-card{display:flex;align-items:center;gap:20px;background:var(--paper);border:1px solid var(--line);border-radius:calc(var(--r-scale,1)*18px);padding:22px 24px;box-shadow:0 10px 26px -20px rgba(0,0,0,.28)}
.rl-av{flex:0 0 76px;width:76px;height:76px;border-radius:50%;object-fit:cover}
.rl-body{flex:1}
.rl-stars{display:inline-flex;gap:3px;color:var(--accent);margin-bottom:8px}
.rl-stars svg{width:18px;height:18px}
.rl-text{font-size:15px;color:var(--ink-2);line-height:1.6}
.rl-text .em{color:var(--accent);font-weight:700}
.rl-who{display:block;margin-top:8px;font-size:13px;font-weight:700;color:var(--ink)}
.rl-closer{margin-top:36px;text-align:center;font-family:var(--font-display);font-weight:800;font-size:30px;color:var(--ink);line-height:1.4}
.rl-closer .em{color:var(--accent)}
`,
  render: (d, { esc, richSafe, icon }) => `
<section class="rl">
  <div class="rl-hd">
    <span class="rl-badge">${icon('star')}</span>
    <h2 class="rl-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="rl-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  <div class="rl-list">
    ${d.reviews
      .map(
        (r) =>
          `<div class="rl-card">${media(r.image, 'rl-av', '고객')}<div class="rl-body"><span class="rl-stars">${starN(icon, r.rating ?? 5)}</span><div class="rl-text">${richSafe(r.text)}</div>${r.author ? `<span class="rl-who">— ${esc(r.author)}</span>` : ''}</div></div>`,
      )
      .join('')}
  </div>
  ${d.closer ? `<p class="rl-closer">${richSafe(d.closer)}</p>` : ''}
</section>`,
})
