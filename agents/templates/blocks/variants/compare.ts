/** COMPARE 아키타입: compare-cooking(2단 조리법 비교). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { ICON_NAMES } from '../shared'

const colSchema = z.object({
  tag: z.string().optional(),
  icon: z.enum(ICON_NAMES),
  name: z.string().min(1),
  steps: z.array(z.object({ text: z.string().min(1) })).min(1).max(4), // em 허용
})

const compareSchema = z.object({
  label: z.string().optional(),
  title: z.string().min(1), // em 허용
  left: colSchema,
  right: colSchema,
  note: z.string().optional(), // em 허용
})
type CompareData = z.infer<typeof compareSchema>

export const compareCooking = defineBlock<CompareData>({
  id: 'compare-cooking',
  archetype: 'compare',
  styleTags: ['warm', 'playful', 'food'],
  imageSlots: 0,
  describe: '2단 비교(예: 에어프라이어 vs 오븐). 큰 라인 아이콘 + 손글씨 태그 + 번호 스텝 + 온도/시간 강조. 점선 구분.',
  schema: compareSchema,
  css: `
.cc{position:relative;padding:72px 48px 76px;background:var(--bg);text-align:center}
.cc-h{margin-top:20px;font-size:38px}
.cc-h .em{display:block}
.cc-cols{position:relative;margin-top:46px;display:grid;grid-template-columns:1fr 1fr}
.cc-cols::before{content:"";position:absolute;top:8px;bottom:8px;left:50%;border-left:2px dashed var(--line)}
.cc-col{padding:0 22px}
.cc-tag{display:inline-block;background:var(--accent);color:#fff;font-family:var(--font-hand);font-weight:700;font-size:20px;padding:5px 16px;border-radius:calc(var(--r-scale,1)*14px);transform:rotate(-3deg);position:relative;z-index:1}
.cc-big{height:120px;display:grid;place-items:center;margin:10px 0 6px;color:var(--brand)}
.cc-big svg{width:104px;height:104px}
.cc-nm{font-family:var(--font-display);font-size:24px;color:var(--brand);margin-bottom:22px}
.cc-step{display:flex;align-items:flex-start;gap:14px;text-align:left;margin-top:18px}
.cc-num{flex:0 0 30px;width:30px;height:30px;border-radius:50%;background:var(--brand);color:#fff;font-weight:800;font-size:16px;display:grid;place-items:center;margin-top:2px}
.cc-tx{font-size:16.5px;font-weight:600;color:var(--ink-2);line-height:1.5;word-break:keep-all}
.cc-tx .em{font-weight:800}
.cc-note{margin-top:42px;font-size:18px;font-weight:700;color:var(--brand)}
`,
  render: (d, { esc, richSafe, icon }) => {
    const col = (c: CompareData['left']): string => `
    <div class="cc-col">
      ${c.tag ? `<span class="cc-tag">${esc(c.tag)}</span>` : ''}
      <div class="cc-big">${icon(c.icon)}</div>
      <div class="cc-nm">${esc(c.name)}</div>
      ${c.steps.map((s, i) => `<div class="cc-step"><span class="cc-num">${i + 1}</span><span class="cc-tx">${richSafe(s.text)}</span></div>`).join('')}
    </div>`
    return `
<section class="cc">
  <div class="wm"></div>
  ${d.label ? `<span class="lab">${esc(d.label)}</span>` : ''}
  <h2 class="disp cc-h">${richSafe(d.title)}</h2>
  <div class="cc-cols">${col(d.left)}${col(d.right)}</div>
  ${d.note ? `<p class="cc-note">${richSafe(d.note)}</p>` : ''}
</section>`
  },
})
