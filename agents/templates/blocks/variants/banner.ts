/** BANNER 아키타입: banner-event (시즈널/이벤트 배너). Figma 200섹션 18·19 배너 패턴 재구성. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  eyebrow: z.string().min(1).optional(), // 예 "SPRING EVENT"
  title: z.string().min(1), // em/br
  subtitle: z.string().min(1).optional(), // 날짜/부제
  bgImage: z.string().optional(), // 배경 이미지(없으면 토큰 배경)
})
type Data = z.infer<typeof schema>

export const bannerEvent = defineBlock<Data>({
  id: 'banner-event',
  archetype: 'banner',
  styleTags: ['warm', 'bold', 'food'],
  imageSlots: 1,
  describe: '시즈널/이벤트 배너. (배경 이미지) + eyebrow(양옆 선) + 대형 2톤 타이틀 + 날짜/부제. 컴팩트 프로모.',
  schema,
  css: `
.bn{position:relative;min-height:420px;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:56px 40px;overflow:hidden;background:radial-gradient(120% 90% at 50% 0%, var(--paper), var(--bg))}
.bn-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0}
.bn-shade{position:absolute;inset:0;background:rgba(255,255,255,.1);z-index:1}
.bn-in{position:relative;z-index:2}
.bn-eye{display:inline-flex;align-items:center;gap:12px;font-size:14px;font-weight:800;letter-spacing:.2em;color:var(--accent);text-transform:uppercase}
.bn-eye::before,.bn-eye::after{content:"";width:26px;height:2px;background:var(--accent)}
.bn-title{margin-top:14px;font-size:54px;line-height:1.15;color:var(--ink)}
.bn-title .em{color:var(--accent)}
.bn-sub{margin-top:14px;font-size:18px;font-weight:700;color:var(--ink-2)}
`,
  render: (d, { esc, richSafe }) => `
<section class="bn">
  ${d.bgImage ? media(d.bgImage, 'bn-bg', '배너 배경') : ''}
  ${d.bgImage ? `<div class="bn-shade"></div>` : ''}
  <div class="bn-in">
    ${d.eyebrow ? `<span class="bn-eye">${esc(d.eyebrow)}</span>` : ''}
    <h2 class="disp bn-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="bn-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
</section>`,
})
