/** CLOSING 아키타입: closing-mood(다크 무드 히어로), closing-light(라이트 에디토리얼 CTA). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

// ── closing-mood ──────────────────────────────────────────────
const moodSchema = z.object({
  bgImage: z.string().optional(),
  title: z.string().min(1), // em 허용
  sub: z.string().min(1).optional(), // 있으면 비어있지 않게 (빈 DOM 노드 방지)
})
type MoodData = z.infer<typeof moodSchema>

export const closingMood = defineBlock<MoodData>({
  id: 'closing-mood',
  archetype: 'closing',
  styleTags: ['warm', 'bold', 'food'],
  imageSlots: 1,
  describe: '다크 무드 마무리. 어두운 배경 사진 위 대형 2톤 타이포 + 반짝이 데코 + 명조 한 줄.',
  schema: moodSchema,
  css: `
.clm{position:relative;min-height:560px;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;color:#fff;padding:60px 40px;overflow:hidden}
.clm-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0}
.clm-bg.ph{z-index:0}
.clm-shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(20,14,9,.55),rgba(20,14,9,.78));z-index:1}
.clm-inner{position:relative;z-index:2}
.clm-h{font-size:56px;text-shadow:0 4px 18px rgba(0,0,0,.5)}
.clm-h .em{color:var(--em-dark,#FFF7EA)}
.clm-sub{margin-top:16px;font-family:var(--font-serif);font-weight:700;font-size:22px;letter-spacing:.06em;color:#F1E4D2}
.clm-sp{position:absolute;z-index:2;color:#fff;opacity:.9}
.clm-sp svg{width:100%;height:100%;fill:#fff}
.clm-sp.a{top:60px;left:120px;width:34px;height:34px}
.clm-sp.b{top:150px;right:90px;width:22px;height:22px}
.clm-sp.c{bottom:90px;left:160px;width:18px;height:18px}
`,
  render: (d, { richSafe, icon }) => `
<section class="clm">
  ${media(d.bgImage, 'clm-bg', '무드 이미지')}
  <div class="clm-shade"></div>
  <span class="clm-sp a">${icon('star')}</span>
  <span class="clm-sp b">${icon('star')}</span>
  <span class="clm-sp c">${icon('star')}</span>
  <div class="clm-inner">
    <h2 class="disp clm-h">${richSafe(d.title)}</h2>
    ${d.sub ? `<p class="clm-sub">${richSafe(d.sub)}</p>` : ''}
  </div>
</section>`,
})

// ── closing-light ─────────────────────────────────────────────
const lightSchema = z.object({
  kicker: z.string().optional(),
  title: z.string().min(1), // em 허용
  sub: z.string().optional(),
  cta: z.string().optional(),
})
type LightData = z.infer<typeof lightSchema>

export const closingLight = defineBlock<LightData>({
  id: 'closing-light',
  archetype: 'closing',
  styleTags: ['editorial', 'minimal', 'premium'],
  imageSlots: 0,
  describe: '라이트 에디토리얼 마무리. 키커 + 큰 명조 헤드라인 + 보조 문장 + 얇은 외곽선 CTA.',
  schema: lightSchema,
  css: `
.cll{padding:104px 64px 110px;text-align:center;background:var(--bg)}
.cll-kick{font-size:13px;font-weight:700;letter-spacing:.42em;text-transform:uppercase;color:var(--accent);margin-bottom:24px}
.cll-h{font-family:var(--font-serif);font-weight:700;font-size:50px;line-height:1.2}
.cll-h .em{color:var(--accent)}
.cll-sub{margin-top:20px;font-size:16px;color:var(--ink-2);letter-spacing:.02em}
.cll-cta{display:inline-block;margin-top:40px;background:var(--accent-d);border:none;border-radius:calc(var(--r-scale,1)*6px);padding:16px 48px;font-size:14px;letter-spacing:.22em;text-transform:uppercase;color:#fff;font-weight:700;box-shadow:0 6px 18px color-mix(in srgb,var(--accent-d) 35%,transparent)}
`,
  render: (d, { esc, richSafe }) => `
<section class="cll">
  ${d.kicker ? `<p class="cll-kick">${esc(d.kicker)}</p>` : ''}
  <h2 class="cll-h">${richSafe(d.title)}</h2>
  ${d.sub ? `<p class="cll-sub">${esc(d.sub)}</p>` : ''}
  ${d.cta ? `<span class="cll-cta">${esc(d.cta)}</span>` : ''}
</section>`,
})
