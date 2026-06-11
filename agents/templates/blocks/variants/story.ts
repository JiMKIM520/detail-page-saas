/** STORY 아키타입: story-pair (브랜드 스토리 사진 묶음 + 카피). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  label: z.string().optional(),
  title: z.string().min(1), // em 허용
  images: z.array(z.string()).min(1).max(3),
  lead: z.string().optional(), // em/br 허용
})
type Data = z.infer<typeof schema>

export const storyPair = defineBlock<Data>({
  id: 'story-pair',
  archetype: 'story',
  styleTags: ['warm', 'food', 'editorial'],
  imageSlots: 3,
  describe: '브랜드 스토리. 라벨 + 2톤 제목 + 사진 묶음(첫 장 풀폭 + 나머지 2열) + 강조 카피. 제조/원료 신뢰.',
  schema,
  css: `
.sy{position:relative;padding:70px 56px 60px;background:var(--bg);text-align:center}
.sy-h{margin-top:18px;font-size:38px}
.sy-pair{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:38px 0 0}
.sy-media{width:100%;height:240px;object-fit:cover;border-radius:20px;box-shadow:0 16px 32px -18px rgba(42,33,24,.4)}
.sy-media.full{grid-column:1/-1;height:300px}
.sy-lead{max-width:600px;margin:34px auto 0;font-size:20px;font-weight:600;line-height:1.6;color:var(--ink-2)}
.sy-lead .em{color:var(--accent);font-weight:800}
`,
  render: (d, { esc, richSafe }) => `
<section class="sy">
  <div class="wm"></div>
  ${d.label ? `<span class="lab">${esc(d.label)}</span>` : ''}
  <h2 class="disp sy-h">${richSafe(d.title)}</h2>
  <div class="sy-pair">
    ${d.images.map((img, i) => media(img, `sy-media${i === 0 ? ' full' : ''}`, '스토리 이미지')).join('')}
  </div>
  ${d.lead ? `<p class="sy-lead">${richSafe(d.lead)}</p>` : ''}
</section>`,
})
