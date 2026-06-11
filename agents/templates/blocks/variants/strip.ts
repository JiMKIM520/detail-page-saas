/** STRIP 아키타입: strip-band (얇은 다크 브랜드 구분 띠). */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({ text: z.string().min(1) })
type Data = z.infer<typeof schema>

export const stripBand = defineBlock<Data>({
  id: 'strip-band',
  archetype: 'strip',
  styleTags: ['warm', 'minimal', 'food'],
  imageSlots: 0,
  describe: '얇은 다크 띠 구분선. 브랜드명을 레터스페이스로 중앙 배치. 섹션 사이 리듬.',
  schema,
  css: `
.sp{background:var(--brand);text-align:center;padding:16px 0}
.sp-t{color:#C9B295;font-size:14px;font-weight:800;letter-spacing:.5em;padding-left:.5em}
`,
  render: (d, { esc }) => `
<section class="sp"><span class="sp-t">${esc(d.text)}</span></section>`,
})
