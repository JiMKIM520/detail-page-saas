/** SHIPPING 아키타입: shipping-info (배송 안내). Figma 200섹션 16_배송 패턴 재구성. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  label: z.string().min(1).optional(), // 기본 "배송 안내"
  image: z.string().optional(), // 배송 그래픽(트럭 등)
  rows: z.array(z.object({ title: z.string().min(1), desc: z.string().min(1) })).min(1).max(5), // desc: em/br
  schedule: z.array(z.object({ when: z.string().min(1), detail: z.string().min(1) })).max(4).optional(), // detail: em
  note: z.string().min(1).optional(), // em/br
})
type Data = z.infer<typeof schema>

export const shippingInfo = defineBlock<Data>({
  id: 'shipping-info',
  archetype: 'shipping',
  styleTags: ['warm', 'food', 'minimal'],
  imageSlots: 1,
  describe: '배송 안내. 라벨 + (배송 그래픽) + 좌측 액센트보더 정보행 + 배송일정 불릿 + 주의 문구.',
  schema,
  css: `
.sh{position:relative;padding:56px var(--pad-x,56px) 60px;background:var(--bg)}
.sh-lab{display:inline-block;background:var(--accent);color:#fff;font-weight:800;font-size:16px;padding:8px 22px;border-radius:999px}
.sh-media{display:block;width:100%;height:260px;object-fit:cover;border-radius:var(--shape-photo, calc(var(--r-scale,1)*16px));margin:18px 0 8px}
.sh-rows{margin-top:18px;display:flex;flex-direction:column;gap:22px}
.sh-row{border-left:4px solid var(--accent);padding:4px 0 4px 20px}
.sh-rt{font-size:21px;font-weight:800;color:var(--ink);margin-bottom:6px}
.sh-rd{font-size:16px;color:var(--ink-2);line-height:1.6}
.sh-rd .em{color:var(--accent);font-weight:700}
.sh-sched{margin-top:24px;border-top:1px solid var(--line);padding-top:20px;display:flex;flex-direction:column;gap:12px}
.sh-s{font-size:16px;color:var(--ink-2)}
.sh-s .when{font-weight:700;color:var(--ink)}
.sh-s .em{color:var(--accent);font-weight:700}
.sh-note{margin-top:22px;font-size:13px;color:var(--muted);line-height:1.7}
`,
  render: (d, { esc, richSafe }) => `
<section class="sh">
  <div class="wm"></div>
  <span class="sh-lab">${esc(d.label ?? '배송 안내')}</span>
  ${d.image ? media(d.image, 'sh-media', '배송 안내') : ''}
  <div class="sh-rows">
    ${d.rows.map((r) => `<div class="sh-row"><div class="sh-rt">${esc(r.title)}</div><div class="sh-rd">${richSafe(r.desc)}</div></div>`).join('')}
  </div>
  ${d.schedule && d.schedule.length ? `<div class="sh-sched">${d.schedule.map((s) => `<div class="sh-s"><span class="when">${esc(s.when)}</span> → ${richSafe(s.detail)}</div>`).join('')}</div>` : ''}
  ${d.note ? `<p class="sh-note">${richSafe(d.note)}</p>` : ''}
</section>`,
})
