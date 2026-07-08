/** CALLOUT 아키타입: callout-banner(다크 라운드 배너), statement-serif(명조 인용). */
import { z } from 'zod'
import { defineBlock } from '../types'

// ── callout-banner ────────────────────────────────────────────
const bannerSchema = z.object({
  big: z.string().min(1), // br/em 허용
  small: z.string().optional(),
})
type BannerData = z.infer<typeof bannerSchema>

export const calloutBanner = defineBlock<BannerData>({
  id: 'callout-banner',
  archetype: 'callout',
  styleTags: ['warm', 'playful', 'food'],
  imageSlots: 0,
  describe: '다크 라운드 강조 배너. 큰 문장(키워드 강조) + 보조 한 줄. 메시지를 박스로 강조.',
  schema: bannerSchema,
  css: `
.cb{background:var(--bg);padding:20px var(--pad-x,56px) 64px;text-align:center}
.cb-box{position:relative;background:var(--brand);color:#F3E9DA;border-radius:calc(var(--r-scale,1)*30px);padding:38px 40px;box-shadow:0 20px 40px -22px rgba(42,33,24,.6)}
.cb-box::before{content:"• •";position:absolute;top:14px;left:50%;transform:translateX(-50%);color:var(--accent);letter-spacing:4px;font-size:14px}
.cb-big{font-size:28px;font-weight:800;line-height:1.45}
.cb-box .em,.cb-box .acc{color:var(--em-dark,#FFF7EA)}
.cb-small{margin-top:8px;font-size:17px;color:#CBB79C;font-weight:600}
`,
  render: (d, { richSafe, esc }) => `
<section class="cb">
  <div class="cb-box">
    <p class="cb-big">${richSafe(d.big)}</p>
    ${d.small ? `<p class="cb-small">${esc(d.small)}</p>` : ''}
  </div>
</section>`,
})

// ── statement-serif ───────────────────────────────────────────
const statementSchema = z.object({
  quote: z.string().min(1), // br/em 허용
  by: z.string().optional(),
})
type StatementData = z.infer<typeof statementSchema>

export const statementSerif = defineBlock<StatementData>({
  id: 'statement-serif',
  archetype: 'callout',
  styleTags: ['editorial', 'minimal', 'premium'],
  imageSlots: 0,
  describe: '여백 큰 명조 인용문 + 서명 라인. 브랜드 철학을 조용히 강조.',
  schema: statementSchema,
  css: `
.ss{padding:96px 90px;text-align:center;background:var(--paper)}
.ss-q{font-family:var(--font-serif);font-weight:700;font-size:33px;line-height:1.6}
.ss-q .em{color:var(--accent)}
.ss-by{margin-top:30px;font-size:13px;letter-spacing:.3em;text-transform:uppercase;color:var(--muted)}
`,
  render: (d, { richSafe, esc }) => `
<section class="ss">
  <p class="ss-q">${richSafe(d.quote)}</p>
  ${d.by ? `<p class="ss-by">${esc(d.by)}</p>` : ''}
</section>`,
})
