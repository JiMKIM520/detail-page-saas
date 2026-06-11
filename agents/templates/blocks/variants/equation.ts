/** EQUATION 아키타입: equation-visual (A + B = C 비주얼 등식). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const itemSchema = z.object({ image: z.string().optional(), label: z.string().min(1) })
const schema = z.object({
  a: itemSchema,
  b: itemSchema,
  c: itemSchema,
  quote: z.string().optional(), // em 허용
})
type Data = z.infer<typeof schema>

export const equationVisual = defineBlock<Data>({
  id: 'equation-visual',
  archetype: 'equation',
  styleTags: ['warm', 'playful', 'food'],
  imageSlots: 3,
  describe: '비주얼 등식 A + B = C. 원형 마스킹 사진 3개 + 큰 +/= 기호 + 손글씨 인용. 페어링/조합 강조.',
  schema,
  css: `
.eq{position:relative;padding:46px 56px 60px;background:var(--bg);text-align:center}
.eq-row{display:flex;align-items:center;justify-content:center;gap:26px}
.eq-item{text-align:center}
.eq-media{width:150px;height:150px;border-radius:50%;object-fit:cover;box-shadow:0 14px 28px -12px rgba(42,33,24,.4);border:4px solid #fff}
.eq-label{display:block;margin-top:12px;font-size:16px;font-weight:700;color:var(--ink-2)}
.eq-op{font-family:var(--font-display);font-size:46px;color:var(--accent)}
.eq-quote{margin-top:34px;font-family:var(--font-hand);font-size:30px;font-weight:700;color:var(--brand)}
.eq-quote .em{color:var(--accent)}
`,
  render: (d, { esc, richSafe }) => {
    const item = (it: Data['a']): string =>
      `<div class="eq-item">${media(it.image, 'eq-media', it.label)}<span class="eq-label">${esc(it.label)}</span></div>`
    return `
<section class="eq">
  <div class="eq-row">${item(d.a)}<div class="eq-op">+</div>${item(d.b)}<div class="eq-op">=</div>${item(d.c)}</div>
  ${d.quote ? `<p class="eq-quote">${richSafe(d.quote)}</p>` : ''}
</section>`
  },
})
