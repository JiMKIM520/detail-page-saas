/** REASON 아키타입: reason-question (큰 ? + 점선 불릿 질문 제시). */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({ question: z.string().min(1) }) // em/br 허용
type Data = z.infer<typeof schema>

export const reasonQuestion = defineBlock<Data>({
  id: 'reason-question',
  archetype: 'reason',
  styleTags: ['warm', 'playful', 'food'],
  imageSlots: 0,
  describe: '질문 제시 블록. 큰 반투명 "?" 데코 + 2톤 질문 + 세로 점 3개. 다음 답변 섹션으로 유도.',
  schema,
  css: `
.rs{position:relative;padding:66px var(--pad-x,56px) 56px;background:var(--bg);text-align:center}
.rs-q{position:relative;display:inline-block}
.rs-q::before{content:"?";position:absolute;right:-46px;top:-30px;font-family:var(--font-display);font-size:120px;color:var(--accent);opacity:.16;line-height:1}
.rs-h{font-size:32px;color:var(--brand);font-weight:800;line-height:1.4}
.rs-h .em{color:var(--accent)}
.rs-dots{margin:26px auto 0;display:flex;flex-direction:column;gap:9px;align-items:center}
.rs-dots i{width:9px;height:9px;border-radius:50%;background:var(--muted);opacity:.55}
`,
  render: (d, { richSafe }) => `
<section class="rs">
  <div class="wm"></div>
  <div class="rs-q"><h3 class="rs-h">${richSafe(d.question)}</h3></div>
  <div class="rs-dots"><i></i><i></i><i></i></div>
</section>`,
})
