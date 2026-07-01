/** INGREDIENT 아키타입 추가 변형(템플릿 충실 재현): 04_원료소개 — 이미지-텍스트 지그재그.
 *  ingredient-zigzag: 라이트 배경 + 섹션 헤더 + 원료 4쌍 좌/우 교대(이미지↔텍스트) + 마무리 문구.
 *  각 원료를 개별 이미지와 함께 스토리텔링 형식으로 제시. ingredient-accent/grid/spotlight과 레이아웃 차별화. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  eyebrow: z.string().min(1).optional(), // 예 "INGREDIENTS"
  title: z.string().min(1),              // 섹션 대제목 (em,br)
  subtitle: z.string().min(1).optional(), // 섹션 부제목
  items: z
    .array(
      z.object({
        image: z.string().optional(),       // 원료 이미지 (url)
        label: z.string().min(1),           // 원료명 (em,br)
        desc: z.string().min(1).optional(), // 원료 설명 (em,br)
      }),
    )
    .min(2)
    .max(4),
  closer: z.string().min(1).optional(), // 마무리 문구 (em,br)
})
type Data = z.infer<typeof schema>

export const ingredientZigzag = defineBlock<Data>({
  id: 'ingredient-zigzag',
  archetype: 'ingredient' as any,
  styleTags: ['light', 'premium', 'storytelling', 'template', 'zigzag'],
  imageSlots: 4,
  describe:
    '원료 소개(지그재그). 라이트 배경 + 섹션 헤드라인 + 원료 2~4쌍을 이미지↔텍스트 좌/우 교대 배치 + 마무리 문구. 각 원료를 개별 사진과 스토리텔링 형식으로 제시.',
  schema,
  css: `
.izz{background:var(--bg);color:var(--ink);padding:60px 0 56px}
.izz-hd{text-align:center;padding:0 40px;margin-bottom:48px}
.izz-eye{display:inline-block;font-size:13px;font-weight:800;letter-spacing:.18em;color:var(--accent);margin-bottom:10px;text-transform:uppercase}
.izz-title{font-family:var(--font-display);font-weight:800;font-size:52px;letter-spacing:-.02em;line-height:1.1;color:var(--ink)}
.izz-sub{margin-top:14px;font-size:16px;color:var(--ink-2);line-height:1.65}
.izz-row{display:flex;align-items:center;gap:0;min-height:240px}
.izz-row:not(:last-child){margin-bottom:2px}
.izz-img{flex:0 0 52%;width:52%}
.izz-img-el{width:100%;height:240px;object-fit:cover;display:block}
.izz-tx{flex:1;padding:28px 40px}
.izz-no{font-family:'Cafe24 ClassicType',serif;font-size:30px;color:color-mix(in srgb,var(--accent) 35%,transparent);line-height:1;margin-bottom:6px}
.izz-label{font-family:var(--font-display);font-weight:800;font-size:22px;color:var(--accent);line-height:1.2;margin-bottom:12px}
.izz-label .em{color:var(--accent-d)}
.izz-desc{font-size:14px;color:var(--ink-2);line-height:1.75}
.izz-desc .em{color:var(--accent);font-weight:700}
.izz-row.izz-rev{flex-direction:row-reverse}
.izz-closer{margin-top:52px;padding:0 40px;text-align:center;font-family:var(--font-display);font-weight:800;font-size:30px;line-height:1.5;color:var(--ink)}
.izz-closer .em{color:var(--accent)}
`,
  render: (d, { esc, richSafe }) => {
    const pad2 = (n: number) => String(n).padStart(2, '0')
    return `
<section class="izz">
  <div class="izz-hd">
    ${d.eyebrow ? `<p class="izz-eye">${esc(d.eyebrow)}</p>` : ''}
    <h2 class="izz-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="izz-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  ${d.items
    .map(
      (it, i) => `
  <div class="izz-row${i % 2 === 1 ? ' izz-rev' : ''}">
    ${media(it.image, 'izz-img-el izz-img', `${esc(it.label)} 이미지`)}
    <div class="izz-tx">
      <div class="izz-no">${pad2(i + 1)}</div>
      <div class="izz-label">${richSafe(it.label)}</div>
      ${it.desc ? `<p class="izz-desc">${richSafe(it.desc)}</p>` : ''}
    </div>
  </div>`,
    )
    .join('')}
  ${d.closer ? `<p class="izz-closer">${richSafe(d.closer)}</p>` : ''}
</section>`
  },
})
