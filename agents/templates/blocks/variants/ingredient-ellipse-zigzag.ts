/** INGREDIENT 아키타입: 04_원료소개 — 타원 이미지 지그재그.
 *  4개 원형 이미지가 홀수 행(왼쪽 이미지+오른쪽 텍스트) / 짝수 행(왼쪽 텍스트+오른쪽 이미지)으로 교대.
 *  각 행은 둥근 카드 + 점선 구분선. 라이트 배경. 피그마 1279:597 재현.
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const iezSchema = z.object({
  eyebrow: z.string().min(1).optional(),           // 예 "INGRIDIENTS"
  title: z.string().min(1),                         // em,br 허용
  subtitle: z.string().min(1).optional(),           // 한 줄 부제목
  items: z
    .array(
      z.object({
        label: z.string().min(1),                   // 원료명 (em,br)
        desc: z.string().min(1).optional(),         // 설명 (em,br)
        image: z.string().optional(),               // 타원 원료 사진 (url)
      }),
    )
    .min(2)
    .max(4),
  closer: z.string().min(1).optional(),             // 마무리 문구 (em,br)
})

type IezData = z.infer<typeof iezSchema>

export const ingredientEllipseZigzag = defineBlock<IezData>({
  id: 'ingredient-ellipse-zigzag',
  archetype: 'ingredient',
  styleTags: ['light', 'premium', 'template', 'zigzag'],
  imageSlots: 4,
  describe:
    '원료 소개(타원 지그재그). 라이트 배경 + 영문 아이브로 + 대형 컬러 제목 + 부제목 + 4개 둥근 카드(홀수=왼쪽 타원이미지·오른쪽 라벨설명, 짝수=반전) + 점선 구분선 + 마무리 문구. 깔끔·프리미엄 라이트.',
  schema: iezSchema,
  css: `
.iez{background:var(--bg);color:var(--ink);padding:58px 44px 66px}
.iez-hd{margin-bottom:36px}
.iez-eye{font-size:12px;font-weight:800;letter-spacing:.2em;color:var(--accent);text-transform:uppercase}
.iez-title{margin-top:10px;font-family:var(--font-display);font-weight:800;font-size:52px;letter-spacing:-.02em;line-height:1.1;color:var(--accent)}
.iez-sub{margin-top:14px;font-size:16px;color:var(--ink);opacity:.7;line-height:1.6}
.iez-list{display:flex;flex-direction:column;gap:0}
.iez-card{background:var(--paper);border-radius:20px;padding:32px 28px;display:flex;align-items:center;gap:28px;margin-bottom:0}
.iez-card+.iez-card{margin-top:0;border-top:none}
.iez-sep{height:1px;border:none;border-top:2px dashed var(--line);margin:0}
.iez-card.even{flex-direction:row-reverse}
.iez-ellipse{flex:0 0 160px;width:160px;height:160px;border-radius:50%;object-fit:cover;background:color-mix(in srgb,var(--accent) 10%,transparent)}
.iez-tx{flex:1;min-width:0}
.iez-label{font-family:var(--font-display);font-weight:800;font-size:26px;color:var(--accent);line-height:1.2}
.iez-desc{margin-top:10px;font-size:14px;color:var(--ink-2);line-height:1.7}
.iez-closer{margin-top:48px;text-align:center;font-family:var(--font-display);font-weight:800;font-size:28px;line-height:1.55;color:var(--ink)}
.iez-closer .em{color:var(--accent)}
.iez .em{color:var(--accent)}
`,
  render: (d, { esc, richSafe }) => `
<section class="iez">
  <div class="iez-hd">
    ${d.eyebrow ? `<p class="iez-eye">${esc(d.eyebrow)}</p>` : ''}
    <h2 class="iez-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="iez-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  <div class="iez-list">
    ${d.items
      .map((it, i) => {
        const cardClass = i % 2 === 1 ? 'iez-card even' : 'iez-card'
        const row = `<div class="${cardClass}">
      ${media(it.image, 'iez-ellipse', esc(it.label))}
      <div class="iez-tx">
        <div class="iez-label">${richSafe(it.label)}</div>
        ${it.desc ? `<div class="iez-desc">${richSafe(it.desc)}</div>` : ''}
      </div>
    </div>`
        return i === 0 ? row : `<hr class="iez-sep">${row}`
      })
      .join('')}
  </div>
  ${d.closer ? `<p class="iez-closer">${richSafe(d.closer)}</p>` : ''}
</section>`,
})
