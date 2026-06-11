/** CHECKLIST 아키타입: checklist-checks (체크 아이콘 + 키워드 강조 + 별 데코). */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  title: z.string().min(1), // em 강조 허용
  items: z
    .array(z.object({ text: z.string().min(1), star: z.boolean().optional() }))
    .min(2)
    .max(6),
})
type Data = z.infer<typeof schema>

export const checklistChecks = defineBlock<Data>({
  id: 'checklist-checks',
  archetype: 'checklist',
  styleTags: ['warm', 'playful', 'food'],
  imageSlots: 0,
  describe: '추천 대상/특징 체크리스트. 원형 체크 아이콘 + 키워드 강조 + 점선 구분, 마지막 항목 별 데코.',
  schema,
  css: `
.cl{position:relative;background:var(--bg);padding:60px 70px 64px}
.cl-h{text-align:center;font-size:34px;margin-bottom:34px}
.cl-item{display:flex;align-items:center;gap:18px;padding:20px 0}
.cl-item + .cl-item{border-top:1.5px dashed var(--line)}
.cl-ck{flex:0 0 40px;width:40px;height:40px;border-radius:50%;background:var(--accent);display:grid;place-items:center;box-shadow:0 6px 14px rgba(0,0,0,.12);color:#fff}
.cl-ck svg{width:22px;height:22px}
.cl-item p{font-size:22px;font-weight:700;color:var(--ink-2)}
.cl-star{margin-left:6px;color:var(--accent);font-size:20px}
`,
  render: (d, { richSafe, icon }) => `
<section class="cl">
  <div class="wm"></div>
  <h2 class="disp cl-h">${richSafe(d.title)}</h2>
  ${d.items
    .map((it) => `<div class="cl-item"><span class="cl-ck">${icon('check')}</span><p>${richSafe(it.text)}${it.star ? `<span class="cl-star">✦</span>` : ''}</p></div>`)
    .join('')}
</section>`,
})
