/** HERO 아키타입 변형: hero-centered(따뜻한 플레이풀), hero-editorial(모던 명조). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

// ── hero-centered ─────────────────────────────────────────────
const heroCenteredSchema = z.object({
  badge: z.string().optional(),
  title: z.string().min(1), // <span class="em"> 강조 허용
  sub: z.string().optional(),
  heroImage: z.string().optional(),
  bubble: z.string().optional(),
  caption: z.string().optional(),
  brand: z.string().min(1),
})
type HeroCenteredData = z.infer<typeof heroCenteredSchema>

export const heroCentered = defineBlock<HeroCenteredData>({
  id: 'hero-centered',
  archetype: 'hero',
  styleTags: ['warm', 'playful', 'food'],
  imageSlots: 1,
  describe: '중앙 정렬 히어로. pill 뱃지 + 2톤 대제목 + 사진 위 말풍선 + 브랜드 로고. 따뜻하고 친근한 푸드 톤.',
  schema: heroCenteredSchema,
  css: `
.hc{position:relative;padding:64px 56px 56px;text-align:center;background:radial-gradient(120% 80% at 50% -10%,#FFFDF9 0%,var(--bg) 55%)}
.hc-badge{display:inline-flex;align-items:center;gap:7px;background:var(--brand);color:#F5ECDF;font-size:18px;font-weight:800;padding:9px 22px;border-radius:999px;box-shadow:0 6px 16px rgba(42,33,24,.18)}
.hc-badge::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--accent)}
.hc-title{margin-top:22px;font-size:62px}
.hc-sub{margin-top:14px;font-size:21px;font-weight:700;color:var(--ink-2)}
.hc-fig{position:relative;margin:38px auto 0;width:600px}
.hc-media{width:100%;height:430px;object-fit:cover;border-radius:26px;box-shadow:0 26px 50px -18px rgba(42,33,24,.45)}
.hc-bubble{position:absolute;top:30px;right:-12px;background:#fff;border:2.5px solid var(--brand);border-radius:22px;padding:11px 19px;font-size:25px;color:var(--accent);box-shadow:0 10px 20px rgba(42,33,24,.22);white-space:nowrap;font-weight:700;transform:rotate(-4deg)}
.hc-bubble::after{content:"";position:absolute;left:28px;bottom:-14px;width:24px;height:17px;background:#fff;border-right:2.5px solid var(--brand);border-bottom:2.5px solid var(--brand);transform:rotate(40deg)}
.hc-cap{margin-top:14px;font-size:13px;color:var(--muted)}
.hc-brand{margin-top:30px;display:inline-flex;align-items:center;gap:10px}
.hc-mk{width:34px;height:34px;border-radius:50%;background:var(--accent);display:grid;place-items:center}
.hc-mk svg{width:20px;height:20px}
.hc-nm{font-weight:700;font-size:20px;color:var(--brand);letter-spacing:.03em}
`,
  render: (d, { esc, richSafe }) => `
<section class="hc">
  <div class="wm"></div>
  ${d.badge ? `<span class="hc-badge">${esc(d.badge)}</span>` : ''}
  <h1 class="disp hc-title">${richSafe(d.title)}</h1>
  ${d.sub ? `<p class="hc-sub">${richSafe(d.sub)}</p>` : ''}
  <figure class="hc-fig">
    ${media(d.heroImage, 'hc-media', '히어로 이미지')}
    ${d.bubble ? `<span class="hc-bubble hand">${esc(d.bubble)}</span>` : ''}
  </figure>
  ${d.caption ? `<p class="hc-cap">${esc(d.caption)}</p>` : ''}
  <div class="hc-brand">
    <span class="hc-mk"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 14c0-4 3-7 7-7s7 3 7 7"/><path d="M4 14h16v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/></svg></span>
    <span class="hc-nm serif">${esc(d.brand)}</span>
  </div>
</section>`,
})

// ── hero-editorial ────────────────────────────────────────────
const heroEditorialSchema = z.object({
  kicker: z.string().optional(),
  title: z.string().min(1),
  lead: z.string().optional(),
  heroImage: z.string().optional(),
  figNo: z.string().optional(),
})
type HeroEditorialData = z.infer<typeof heroEditorialSchema>

export const heroEditorial = defineBlock<HeroEditorialData>({
  id: 'hero-editorial',
  archetype: 'hero',
  styleTags: ['editorial', 'minimal', 'premium'],
  imageSlots: 1,
  describe: '에디토리얼 히어로. 레터스페이스 키커 + 큰 명조 헤드라인 + 본문 + FIG 넘버가 박힌 풀폭 사진. 고급/미니멀.',
  schema: heroEditorialSchema,
  css: `
.he{padding:78px 64px 56px;text-align:center}
.he-kick{font-size:13px;font-weight:700;letter-spacing:.42em;text-transform:uppercase;color:var(--accent);margin-bottom:26px}
.he-title{font-family:var(--font-serif);font-weight:700;font-size:60px;line-height:1.14;letter-spacing:-.01em}
.he-title .em{color:var(--accent)}
.he-lead{margin:22px auto 0;max-width:520px;font-size:17px;line-height:1.85;color:var(--ink-2)}
.he-fig{margin:46px 0 0;position:relative}
.he-media{width:100%;height:460px;object-fit:cover}
.he-no{position:absolute;top:18px;left:18px;font-family:var(--font-lat);font-size:18px;letter-spacing:.2em;color:#fff;mix-blend-mode:difference}
`,
  render: (d, { esc, richSafe }) => `
<section class="he">
  ${d.kicker ? `<p class="he-kick">${esc(d.kicker)}</p>` : ''}
  <h1 class="he-title">${richSafe(d.title)}</h1>
  ${d.lead ? `<p class="he-lead">${esc(d.lead)}</p>` : ''}
  <figure class="he-fig">
    ${d.figNo ? `<span class="he-no">${esc(d.figNo)}</span>` : ''}
    ${media(d.heroImage, 'he-media', '히어로 이미지')}
  </figure>
</section>`,
})
