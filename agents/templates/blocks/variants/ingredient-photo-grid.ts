/** INGREDIENT 아키타입 변형: ingredient-photo-grid
 *  04_원료소개 / 풀블리드 사진 + 2×2 다크 텍스트 카드(번호+라벨+설명, 이미지 없음).
 *  피그마 1282:112 — 상단 풀블리드 배경사진(eyebrow 오버레이), 중앙 대형 accent 제목,
 *  2×2 순번 다크 카드, 구분선+화살표, 마무리 클로저.
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const pad2 = (n: number): string => String(n).padStart(2, '0')

const schema = z.object({
  eyebrow: z.string().optional(),       // 예 "INGREDIENTS" (사진 위 영문 라벨)
  heroImage: z.string().optional(),     // 풀블리드 배경 사진
  title: z.string().min(1),             // 대형 accent 제목 (em,br)
  subtitle: z.string().optional(),      // 제목 아래 소제목
  items: z
    .array(
      z.object({
        label: z.string().min(1),       // 원료 이름 (em,br)
        desc: z.string().optional(),    // 원료 설명 (em,br)
      }),
    )
    .min(2)
    .max(4),
  closer: z.string().optional(),        // 마무리 문구 (em,br)
})

type Data = z.infer<typeof schema>

export const ingredientPhotoGrid = defineBlock<Data>({
  id: 'ingredient-photo-grid',
  archetype: 'ingredient',
  styleTags: ['dark', 'premium', 'editorial', 'template', 'colorblock'],
  imageSlots: 1,
  describe:
    '원료 소개(풀블리드 사진 + 다크 번호 카드). 상단 풀블리드 배경 사진(eyebrow 오버레이) + accent 대형 제목 + 2×2 다크 카드(번호·원료명·설명, 이미지 없음) + 구분선 + 마무리 클로저. 와디즈 04_원료소개 1282:112 충실 재현.',
  schema,
  css: `
.ipg{background:var(--paper);color:var(--ink)}

/* ── 풀블리드 사진 배너 ── */
.ipg-photo{position:relative;width:100%;height:320px;overflow:hidden;background:color-mix(in srgb,var(--ink) 80%,transparent)}
.ipg-photo-img{width:100%;height:100%;object-fit:cover;display:block}
.ipg-photo.ph{height:320px}
.ipg-eyebrow{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:14px;font-weight:800;letter-spacing:.28em;color:var(--accent);text-align:center;pointer-events:none}

/* ── 헤더 ── */
.ipg-hd{text-align:center;padding:52px 48px 36px}
.ipg-title{font-family:var(--font-display);font-weight:800;font-size:56px;letter-spacing:-.02em;line-height:1.1;color:var(--accent)}
.ipg-title .em{color:var(--ink)}
.ipg-sub{margin-top:14px;font-size:17px;color:var(--ink);opacity:.78;line-height:1.6}

/* ── 2×2 다크 카드 그리드 ── */
.ipg-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;padding:0 40px}
.ipg-card{background:var(--ink);border-radius:16px;padding:28px 24px 32px;min-height:180px}
.ipg-no{font-family:'Cafe24 ClassicType',serif;font-size:22px;font-weight:400;color:rgba(255,255,255,.45);letter-spacing:.04em;line-height:1}
.ipg-label{font-family:var(--font-display);font-weight:800;font-size:24px;color:#fff;margin-top:8px;line-height:1.2}
.ipg-label .em{color:var(--accent)}
.ipg-desc{margin-top:14px;font-size:13px;color:rgba(255,255,255,.65);line-height:1.7}
.ipg-desc .em{color:var(--accent)}

/* ── 구분선 + 화살표 ── */
.ipg-divider{display:flex;flex-direction:column;align-items:center;gap:0;padding:40px 0 36px}
.ipg-divider-line{width:1px;height:64px;background:var(--line)}
.ipg-arrow{margin-top:4px;width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:9px solid var(--line)}

/* ── 클로저 ── */
.ipg-closer{text-align:center;padding:0 48px 60px;font-family:var(--font-display);font-weight:800;font-size:32px;line-height:1.45;color:var(--ink)}
.ipg-closer .em{color:var(--accent)}
`,
  render: (d, { esc, richSafe }) => `
<section class="ipg">

  ${/* 풀블리드 사진 배너 */
    d.heroImage
      ? `<div class="ipg-photo">${media(d.heroImage, 'ipg-photo-img', '원료 배경 사진')}${d.eyebrow ? `<p class="ipg-eyebrow">${esc(d.eyebrow)}</p>` : ''}</div>`
      : `<div class="ipg-photo ph">${d.eyebrow ? `<p class="ipg-eyebrow">${esc(d.eyebrow)}</p>` : '원료 배경 사진'}</div>`
  }

  <div class="ipg-hd">
    <h2 class="ipg-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="ipg-sub">${esc(d.subtitle)}</p>` : ''}
  </div>

  <div class="ipg-grid">
    ${d.items
      .map(
        (it, i) => `
    <div class="ipg-card">
      <div class="ipg-no">${pad2(i + 1)}</div>
      <div class="ipg-label">${richSafe(it.label)}</div>
      ${it.desc ? `<div class="ipg-desc">${richSafe(it.desc)}</div>` : ''}
    </div>`,
      )
      .join('')}
  </div>

  ${d.closer ? `
  <div class="ipg-divider">
    <div class="ipg-divider-line"></div>
    <div class="ipg-arrow"></div>
  </div>
  <p class="ipg-closer">${richSafe(d.closer)}</p>` : ''}

</section>`,
})
