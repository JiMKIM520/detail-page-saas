/** INGREDIENT 아키타입(템플릿 충실 재현): 04_원료 소개.
 *  ingredient-accent(_04 풀배경 컬러+원형이미지+숫자 리스트), ingredient-grid(_03 다크 2×2 카드).
 *  와디즈 200섹션 패턴을 토큰 기반으로 재구성(클론 아님). cobalt/sand 등 어떤 프리셋이든 적응. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const pad2 = (n: number): string => String(n).padStart(2, '0')

// ── ingredient-accent (_04: accent 풀배경 + 원형이미지 + 대형숫자 리스트) ──────────
const accentSchema = z.object({
  subtitle: z.string().min(1).optional(),
  title: z.string().min(1),
  image: z.string().optional(), // 상단 풀폭 밴드
  items: z
    .array(z.object({ label: z.string().min(1), desc: z.string().min(1).optional(), image: z.string().optional() }))
    .min(2)
    .max(5),
  closer: z.string().min(1).optional(), // em,br
})
type AccentData = z.infer<typeof accentSchema>

export const ingredientAccent = defineBlock<AccentData>({
  id: 'ingredient-accent',
  archetype: 'ingredient',
  styleTags: ['premium', 'cobalt', 'template', 'colorblock'],
  imageSlots: 6,
  describe:
    '원료 소개(컬러 풀배경). accent 배경 + 흰 대제목 + 풀폭 밴드 + 원형이미지·대형숫자·라벨·설명 리스트 + 마무리. 강한 컬러블록.',
  schema: accentSchema,
  css: `
.ia{background:var(--accent);color:#fff;padding:54px 0 58px}
.ia-hd{padding:0 56px;margin-bottom:28px}
.ia-sub{font-size:17px;font-weight:600;color:rgba(255,255,255,.85)}
.ia-title{margin-top:8px;font-family:var(--font-display);font-weight:800;font-size:60px;letter-spacing:-.02em;line-height:1.1}
.ia-band{width:100%;height:300px;object-fit:cover;display:block;margin-bottom:26px}
.ia-row{display:flex;align-items:center;gap:24px;padding:16px 56px}
.ia-ic{flex:0 0 104px;width:104px;height:104px;border-radius:50%;object-fit:cover}
.ia-tx{flex:1}
.ia-no{font-family:'Cafe24 ClassicType',serif;font-size:38px;color:rgba(255,255,255,.55);line-height:1}
.ia-l{font-family:var(--font-display);font-weight:800;font-size:22px;margin-top:2px}
.ia-d{margin-top:6px;font-size:14px;color:rgba(255,255,255,.82);line-height:1.6}
.ia-closer{margin-top:34px;padding:0 56px;font-family:var(--font-display);font-weight:800;font-size:30px;line-height:1.4}
.ia .em{color:var(--ink)}
`,
  render: (d, { esc, richSafe }) => `
<section class="ia">
  <div class="ia-hd">
    ${d.subtitle ? `<p class="ia-sub">${esc(d.subtitle)}</p>` : ''}
    <h2 class="ia-title">${richSafe(d.title)}</h2>
  </div>
  ${d.image ? media(d.image, 'ia-band', '원료 이미지') : ''}
  ${d.items
    .map(
      (it, i) => `
  <div class="ia-row">
    ${media(it.image, 'ia-ic', '원료')}
    <div class="ia-tx">
      <div class="ia-no">${pad2(i + 1)}</div>
      <div class="ia-l">${richSafe(it.label)}</div>
      ${it.desc ? `<div class="ia-d">${richSafe(it.desc)}</div>` : ''}
    </div>
  </div>`,
    )
    .join('')}
  ${d.closer ? `<p class="ia-closer">${richSafe(d.closer)}</p>` : ''}
</section>`,
})

// ── ingredient-grid (_03: 다크 2×2 카드 그리드) ────────────────────────────────
const gridSchema = z.object({
  eyebrow: z.string().min(1).optional(), // 예 "INGREDIENTS"
  title: z.string().min(1),
  subtitle: z.string().min(1).optional(),
  items: z
    .array(z.object({ label: z.string().min(1), desc: z.string().min(1).optional(), image: z.string().optional() }))
    .min(2)
    .max(6),
  closer: z.string().min(1).optional(), // em,br
})
type GridData = z.infer<typeof gridSchema>

export const ingredientGrid = defineBlock<GridData>({
  id: 'ingredient-grid',
  archetype: 'ingredient',
  styleTags: ['premium', 'dark', 'template'],
  imageSlots: 6,
  describe:
    '원료 소개(다크 그리드). 다크 배경 + 아이브로/대제목 + 2열 카드(라벨·설명·이미지) + 마무리. 다크 럭셔리.',
  schema: gridSchema,
  css: `
.ig{background:var(--ink);color:#fff;padding:56px 56px 58px}
.ig-hd{text-align:center;margin-bottom:30px}
.ig-eye{display:inline-block;font-size:13px;font-weight:800;letter-spacing:.2em;color:var(--accent);border-bottom:2px solid var(--accent);padding-bottom:5px}
.ig-title{margin-top:14px;font-family:var(--font-display);font-weight:800;font-size:48px;color:#fff;line-height:1.1}
.ig-sub{margin-top:10px;font-size:15px;color:rgba(255,255,255,.6)}
.ig-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.ig-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.12);border-radius:18px;padding:22px}
.ig-l{font-family:var(--font-display);font-weight:800;font-size:20px;color:var(--accent)}
.ig-d{margin-top:8px;font-size:13px;color:rgba(255,255,255,.7);line-height:1.6}
.ig-media{width:100%;height:150px;object-fit:cover;border-radius:12px;margin-top:14px}
.ig-closer{margin-top:36px;text-align:center;font-family:var(--font-display);font-weight:800;font-size:30px;line-height:1.4}
.ig-closer .em{color:var(--accent)}
`,
  render: (d, { esc, richSafe }) => `
<section class="ig">
  <div class="ig-hd">
    ${d.eyebrow ? `<span class="ig-eye">${esc(d.eyebrow)}</span>` : ''}
    <h2 class="ig-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="ig-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  <div class="ig-grid">
    ${d.items
      .map(
        (it) =>
          `<div class="ig-card"><div class="ig-l">${richSafe(it.label)}</div>${it.desc ? `<div class="ig-d">${richSafe(it.desc)}</div>` : ''}${media(it.image, 'ig-media', '원료')}</div>`,
      )
      .join('')}
  </div>
  ${d.closer ? `<p class="ig-closer">${richSafe(d.closer)}</p>` : ''}
</section>`,
})
