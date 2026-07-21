/** HERO 아키타입 변형: hero-centered(따뜻한 플레이풀), hero-editorial(모던 명조), hero-points(그라데이션+포인트), hero-arch(아치 프레임+포인트). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media, ICON_NAMES } from '../shared'

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
.hc{position:relative;padding:64px var(--pad-x,56px) 56px;text-align:center;background:radial-gradient(120% 80% at 50% -10%,#FFFDF9 0%,var(--bg) 55%)}
.hc-badge{display:inline-flex;align-items:center;gap:7px;background:var(--brand);color:#F5ECDF;font-size:18px;font-weight:800;padding:9px 22px;border-radius:999px;box-shadow:0 6px 16px rgba(42,33,24,.18)}
.hc-badge::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--accent)}
.hc-title{margin-top:22px;font-size:62px}
.hc-sub{margin-top:14px;font-size:21px;font-weight:700;color:var(--ink)}
.hc-fig{position:relative;margin:38px auto 0;width:600px}
.hc-media{width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:var(--shape-photo, calc(var(--r-scale,1)*26px));box-shadow:0 26px 50px -18px rgba(42,33,24,.45)}
.hc-bubble{position:absolute;top:30px;right:-12px;background:#fff;border:2.5px solid var(--brand);border-radius:calc(var(--r-scale,1)*22px);padding:11px 19px;font-size:25px;color:var(--accent);box-shadow:0 10px 20px rgba(42,33,24,.22);white-space:nowrap;font-weight:700;transform:rotate(-4deg)}
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
.he-media{width:100%;aspect-ratio:3/4;object-fit:cover}
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

// ── hero-points ───────────────────────────────────────────────
const heroPointsSchema = z.object({
  brand: z.string().min(1),
  sub: z.string().optional(),
  title: z.string().min(1), // em 허용
  heroImage: z.string().optional(),
  points: z
    .array(z.object({ icon: z.enum(ICON_NAMES), label: z.string().min(1), desc: z.string().min(1) }))
    .min(2)
    .max(4),
})
type HeroPointsData = z.infer<typeof heroPointsSchema>

export const heroPoints = defineBlock<HeroPointsData>({
  id: 'hero-points',
  archetype: 'hero',
  styleTags: ['modern', 'premium', 'commerce'],
  imageSlots: 1,
  describe: '그라데이션 히어로 + 핵심 포인트. 상단 브랜드로고 + 2톤 대제목 + 풀폭 사진 + 원형 아이콘 3~4포인트 행. 모던 커머스.',
  schema: heroPointsSchema,
  css: `
.hp{position:relative;padding:54px 52px 60px;text-align:center;background:var(--bg);overflow:hidden}
.hp::before{content:"";position:absolute;inset:0 0 auto;height:64%;background:linear-gradient(180deg,var(--accent),transparent);opacity:.13;pointer-events:none}
.hp-in{position:relative}
.hp-brand{font-size:15px;font-weight:800;letter-spacing:.24em;text-transform:uppercase;color:var(--accent)}
.hp-sub{margin-top:18px;font-size:20px;font-weight:700;color:var(--ink-2)}
.hp-title{margin-top:6px;font-size:58px}
.hp-title .em{color:var(--accent)}
.hp-fig{margin:34px auto 0;width:100%}
/* 히어로 샷은 3:4 세로로 생성된다(aspectRatio 고정). 프레임도 3/4로 맞춰 crop을 없앤다 —
   height 고정 가로 프레임이 세로 사진을 잘라 제품(하단)이 날아가던 실측(2026-07-21) 수정.
   I1(제품 완전 노출)은 면적이 아니라 잘림 여부의 문제다. */
.hp-media{width:100%;aspect-ratio:3/4;object-fit:cover;object-position:center;border-radius:var(--shape-photo, calc(var(--r-scale,1)*24px));box-shadow:0 22px 44px -20px rgba(0,0,0,.32)}
.hp-points{margin-top:46px;display:flex;justify-content:center;gap:16px}
.hp-pt{flex:1 1 0;max-width:200px;text-align:center}
.hp-ic{width:84px;height:84px;margin:0 auto;border-radius:50%;background:var(--paper);box-shadow:0 10px 24px rgba(0,0,0,.09);display:grid;place-items:center;color:var(--accent)}
.hp-ic svg{width:38px;height:38px}
.hp-pl{margin-top:16px;font-size:18px;font-weight:800;color:var(--accent)}
.hp-pd{margin-top:8px;font-size:14px;line-height:1.6;color:var(--ink-2)}
`,
  render: (d, { esc, richSafe, icon }) => `
<section class="hp">
  <div class="wm"></div>
  <div class="hp-in">
    <p class="hp-brand">${esc(d.brand)}</p>
    ${d.sub ? `<p class="hp-sub">${richSafe(d.sub)}</p>` : ''}
    <h1 class="disp hp-title">${richSafe(d.title)}</h1>
    <figure class="hp-fig">${media(d.heroImage, 'hp-media', '히어로 이미지')}</figure>
    <div class="hp-points">
      ${d.points
        .map(
          (p) =>
            `<div class="hp-pt"><span class="hp-ic">${icon(p.icon)}</span><div class="hp-pl">${esc(p.label)}</div><div class="hp-pd">${richSafe(p.desc)}</div></div>`,
        )
        .join('')}
    </div>
  </div>
</section>`,
})

// ── hero-arch ─────────────────────────────────────────────────
const heroArchSchema = z.object({
  brand: z.string().min(1),
  title: z.string().min(1), // em 허용
  sub: z.string().optional(),
  en: z.string().optional(), // 아치 상단 영문 라벨
  heroImage: z.string().optional(),
  points: z
    .array(z.object({ icon: z.enum(ICON_NAMES), label: z.string().min(1), desc: z.string().min(1) }))
    .min(2)
    .max(4),
})
type HeroArchData = z.infer<typeof heroArchSchema>

export const heroArch = defineBlock<HeroArchData>({
  id: 'hero-arch',
  archetype: 'hero',
  styleTags: ['premium', 'editorial', 'commerce'],
  imageSlots: 1,
  describe: '아치 프레임 히어로 + 포인트. 브랜드로고 + 대제목 + 영문라벨이 박힌 아치형 컬러 패널 안 사진 + 세로 구분선 3~4포인트. 고급 커머스.',
  schema: heroArchSchema,
  css: `
.ha{padding:56px 52px 58px;text-align:center;background:var(--bg)}
.ha-brand{font-size:14px;font-weight:800;letter-spacing:.24em;text-transform:uppercase;color:var(--accent)}
.ha-title{margin-top:12px;font-size:54px}
.ha-title .em{color:var(--accent)}
.ha-sub{margin-top:12px;font-size:18px;font-weight:600;color:var(--ink-2)}
.ha-arch{position:relative;margin:42px auto 0;width:74%;background:var(--accent);border-radius:170px 170px calc(var(--r-scale,1)*22px) calc(var(--r-scale,1)*22px);padding:36px 26px 0}
.ha-en{font-family:var(--font-lat);font-size:24px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.94)}
.ha-media{width:100%;height:360px;object-fit:cover;border-radius:var(--shape-photo, calc(var(--r-scale,1)*12px));margin-top:18px;display:block}
.ha-points{margin-top:42px;display:flex;justify-content:center}
.ha-pt{flex:1 1 0;max-width:180px;padding:0 14px;text-align:center;border-right:1px solid var(--line)}
.ha-pt:last-child{border-right:none}
.ha-ic{width:54px;height:54px;margin:0 auto;display:grid;place-items:center;color:var(--accent)}
.ha-ic svg{width:34px;height:34px}
.ha-pl{margin-top:12px;font-size:17px;font-weight:800;color:var(--accent)}
.ha-pd{margin-top:8px;font-size:13px;line-height:1.6;color:var(--ink-2)}
`,
  render: (d, { esc, richSafe, icon }) => `
<section class="ha">
  <p class="ha-brand">${esc(d.brand)}</p>
  <h1 class="disp ha-title">${richSafe(d.title)}</h1>
  ${d.sub ? `<p class="ha-sub">${richSafe(d.sub)}</p>` : ''}
  <div class="ha-arch">
    ${d.en ? `<div class="ha-en">${esc(d.en)}</div>` : ''}
    ${media(d.heroImage, 'ha-media', '히어로 이미지')}
  </div>
  <div class="ha-points">
    ${d.points
      .map(
        (p) =>
          `<div class="ha-pt"><span class="ha-ic">${icon(p.icon)}</span><div class="ha-pl">${esc(p.label)}</div><div class="ha-pd">${richSafe(p.desc)}</div></div>`,
      )
      .join('')}
  </div>
</section>`,
})
