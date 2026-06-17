/** STATS 아키타입: stats-highlight (수치 강조). Figma 200섹션 02_수치강조 패턴 재구성. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media, ICON_NAMES } from '../shared'

const schema = z.object({
  image: z.string().optional(), // 제품 이미지
  label: z.string().min(1).optional(), // 예 "누적 판매량"
  headline: z.string().min(1), // 대형 숫자 (예 "10,000<span class=\"em\">건!</span>")
  items: z
    .array(z.object({ icon: z.enum(ICON_NAMES), label: z.string().min(1), value: z.string().min(1) }))
    .min(2)
    .max(4), // value: em
})
type Data = z.infer<typeof schema>

export const statsHighlight = defineBlock<Data>({
  id: 'stats-highlight',
  archetype: 'stats',
  styleTags: ['warm', 'food', 'bold'],
  imageSlots: 1,
  describe: '수치 강조. (제품 이미지) + pill 라벨 + 대형 숫자 헤드라인 + 아이콘 통계행(라벨+값).',
  schema,
  css: `
.sn{position:relative;padding:48px 56px 60px;background:var(--bg);text-align:center}
.sn-media{display:block;width:100%;max-width:460px;height:360px;object-fit:cover;border-radius:20px;margin:0 auto 28px}
.sn-lab{display:inline-block;background:var(--accent);color:#fff;font-weight:800;font-size:20px;padding:10px 28px;border-radius:999px}
.sn-head{margin-top:18px;font-size:72px;color:var(--ink)}
.sn-head .em{color:var(--accent)}
.sn-list{margin:34px auto 0;max-width:480px;display:flex;flex-direction:column;gap:22px}
.sn-row{display:flex;align-items:center;gap:18px;text-align:left}
.sn-ico{flex:0 0 56px;width:56px;height:56px;border-radius:50%;background:rgba(0,0,0,.05);display:grid;place-items:center;color:var(--accent)}
.sn-ico svg{width:30px;height:30px}
.sn-rl{font-size:15px;color:var(--ink-2)}
.sn-rv{font-size:20px;font-weight:800;color:var(--accent)}
`,
  render: (d, { esc, richSafe, icon }) => `
<section class="sn">
  <div class="wm"></div>
  ${d.image ? media(d.image, 'sn-media', '제품 이미지') : ''}
  ${d.label ? `<span class="sn-lab">${esc(d.label)}</span>` : ''}
  <h2 class="disp sn-head">${richSafe(d.headline)}</h2>
  <div class="sn-list">
    ${d.items.map((it) => `<div class="sn-row"><span class="sn-ico">${icon(it.icon)}</span><div><div class="sn-rl">${esc(it.label)}</div><div class="sn-rv">${richSafe(it.value)}</div></div></div>`).join('')}
  </div>
</section>`,
})
