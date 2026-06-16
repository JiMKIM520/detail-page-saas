/** REVIEW 아키타입: review-bubbles(둥근 버블 쇼케이스), review-cards(카드 그리드 + 평점 요약).
 *  와디즈 200섹션 템플릿 06_고객리뷰 섹션 패턴을 토큰 기반 파라메트릭 블록으로 재구성(클론 아님). */
import { z } from 'zod'
import { defineBlock } from '../types'

const star5 = (icon: (n: string) => string): string => Array.from({ length: 5 }, () => icon('star')).join('')
const starN = (icon: (n: string) => string, n: number): string =>
  Array.from({ length: Math.max(1, Math.min(5, Math.round(n) || 5)) }, () => icon('star')).join('')

// ── review-bubbles ───────────────────────────────────────────
const bubblesSchema = z.object({
  title: z.string().min(1), // em 허용
  subtitle: z.string().min(1).optional(),
  reviews: z
    .array(z.object({ text: z.string().min(1), author: z.string().min(1).optional() }))
    .min(2)
    .max(6),
  stat: z.string().min(1).optional(), // em/br 허용
})
type BubblesData = z.infer<typeof bubblesSchema>

export const reviewBubbles = defineBlock<BubblesData>({
  id: 'review-bubbles',
  archetype: 'review',
  styleTags: ['warm', 'playful', 'food'],
  imageSlots: 0,
  describe: '리뷰 쇼케이스. 별점 헤더 + 2톤 타이틀 + 둥근 리뷰 버블 카드(accent 배경·흰 텍스트) + 마무리 통계 문구. 사회적 증거 강조.',
  schema: bubblesSchema,
  css: `
.rv{position:relative;padding:64px 56px 64px;background:var(--bg);text-align:center}
.rv-stars{display:inline-flex;gap:6px;color:var(--accent);margin-bottom:18px}
.rv-stars svg{width:30px;height:30px}
.rv-h{font-size:40px}
.rv-sub{margin-top:10px;font-size:17px;color:var(--ink-2)}
.rv-list{margin:34px auto 0;display:flex;flex-direction:column;gap:18px;max-width:620px}
.rv-card{background:var(--accent);color:#fff;border-radius:30px;padding:26px 32px;box-shadow:0 14px 30px -16px rgba(0,0,0,.35)}
.rv-card p{font-size:18px;font-weight:600;line-height:1.6}
.rv-who{display:block;margin-top:10px;font-size:14px;font-weight:700;opacity:.85}
.rv-stat{margin-top:38px;font-size:32px;line-height:1.4;font-weight:800;color:var(--ink)}
.rv-stat .em{color:var(--accent)}
`,
  render: (d, { esc, richSafe, icon }) => `
<section class="rv">
  <div class="wm"></div>
  <span class="rv-stars">${star5(icon)}</span>
  <h2 class="disp rv-h">${richSafe(d.title)}</h2>
  ${d.subtitle ? `<p class="rv-sub">${esc(d.subtitle)}</p>` : ''}
  <div class="rv-list">
    ${d.reviews
      .map((r) => `<div class="rv-card"><p>${richSafe(r.text)}</p>${r.author ? `<span class="rv-who">— ${esc(r.author)}</span>` : ''}</div>`)
      .join('')}
  </div>
  ${d.stat ? `<p class="rv-stat">${richSafe(d.stat)}</p>` : ''}
</section>`,
})

// ── review-cards ─────────────────────────────────────────────
const cardsSchema = z.object({
  kicker: z.string().min(1).optional(),
  title: z.string().min(1), // em 허용
  summary: z
    .object({ score: z.string().min(1), count: z.string().min(1).optional(), stars: z.number().min(1).max(5).optional() })
    .optional(),
  reviews: z
    .array(z.object({ author: z.string().min(1), text: z.string().min(1), rating: z.number().min(1).max(5).optional(), tag: z.string().min(1).optional() }))
    .min(2)
    .max(6),
})
type CardsData = z.infer<typeof cardsSchema>

export const reviewCards = defineBlock<CardsData>({
  id: 'review-cards',
  archetype: 'review',
  styleTags: ['editorial', 'minimal', 'premium'],
  imageSlots: 0,
  describe: '리뷰 카드 그리드 + (선택) 평점 요약(점수·별·건수). 작성자·별점·본문·태그 카드. 깔끔/신뢰형.',
  schema: cardsSchema,
  css: `
.rvc{position:relative;padding:64px 56px 64px;background:var(--bg)}
.rvc-head{text-align:center;margin-bottom:28px}
.rvc-kick{font-size:13px;font-weight:700;letter-spacing:.3em;text-transform:uppercase;color:var(--accent);margin-bottom:12px}
.rvc-h{font-family:var(--font-serif);font-weight:700;font-size:36px}
.rvc-summary{display:flex;align-items:center;justify-content:center;gap:14px;margin-top:18px}
.rvc-score{font-family:var(--font-display);font-size:52px;color:var(--accent);line-height:1}
.rvc-sstars{color:var(--accent)} .rvc-sstars svg{width:20px;height:20px}
.rvc-count{font-size:14px;color:var(--muted)}
.rvc-list{margin-top:26px;display:flex;flex-direction:column;gap:14px}
.rvc-card{background:var(--paper);border:1px solid var(--line);border-radius:18px;padding:24px 26px;box-shadow:0 10px 28px -20px rgba(0,0,0,.3)}
.rvc-top{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px}
.rvc-who{font-size:15px;font-weight:800;color:var(--ink)}
.rvc-cstars{color:var(--accent);display:inline-flex;gap:2px} .rvc-cstars svg{width:16px;height:16px}
.rvc-text{font-size:16px;color:var(--ink-2);line-height:1.7}
.rvc-text .em{color:var(--accent);font-weight:700}
.rvc-tag{display:inline-block;margin-top:12px;font-size:12px;font-weight:700;color:var(--accent);border:1px solid var(--line);border-radius:999px;padding:4px 12px}
`,
  render: (d, { esc, richSafe, icon }) => `
<section class="rvc">
  <div class="rvc-head">
    ${d.kicker ? `<p class="rvc-kick">${esc(d.kicker)}</p>` : ''}
    <h2 class="rvc-h">${richSafe(d.title)}</h2>
    ${d.summary ? `<div class="rvc-summary"><span class="rvc-score">${esc(d.summary.score)}</span><span class="rvc-sstars">${starN(icon, d.summary.stars ?? 5)}</span>${d.summary.count ? `<span class="rvc-count">${esc(d.summary.count)}</span>` : ''}</div>` : ''}
  </div>
  <div class="rvc-list">
    ${d.reviews
      .map(
        (r) =>
          `<div class="rvc-card"><div class="rvc-top"><span class="rvc-who">${esc(r.author)}</span><span class="rvc-cstars">${starN(icon, r.rating ?? 5)}</span></div><p class="rvc-text">${richSafe(r.text)}</p>${r.tag ? `<span class="rvc-tag">${esc(r.tag)}</span>` : ''}</div>`,
      )
      .join('')}
  </div>
</section>`,
})
