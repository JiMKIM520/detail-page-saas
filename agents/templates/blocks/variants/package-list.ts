/** LINEUP 아키타입(템플릿 충실 재현): package-list.
 *  와디즈 200섹션 08_상품 구성 _01(WHAT'S FOR YOU? + 패키지 리스트 + 가격) 패턴 재구성.
 *  대제목 + 이미지·패키지명·설명·가격(정가 취소선+최종가) 행 리스트. 가격은 brief 근거만. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  title: z.string().min(1).optional(), // 기본 "WHAT'S FOR YOU?"
  subtitle: z.string().min(1).optional(),
  packages: z
    .array(
      z.object({
        name: z.string().min(1), // em 허용
        desc: z.string().min(1).optional(),
        image: z.string().optional(),
        priceOriginal: z.string().min(1).optional(), // 정가(취소선)
        price: z.string().min(1).optional(), // 최종가
        best: z.boolean().optional(),
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const packageList = defineBlock<Data>({
  id: 'package-list',
  archetype: 'lineup',
  styleTags: ['premium', 'template', 'pricing'],
  imageSlots: 4,
  describe:
    '상품 구성/패키지. 대제목 + 이미지·패키지명·설명·가격(정가 취소선+최종가) 행 리스트. 가격/구성은 brief 근거만(지어내지 말 것).',
  schema,
  css: `
.pk{background:var(--bg);padding:54px var(--pad-x,56px) 56px}
.pk-hd{margin-bottom:30px}
.pk-title{font-family:var(--font-display);font-weight:800;font-size:56px;color:var(--accent);letter-spacing:-.01em;line-height:1.06}
.pk-sub{margin-top:12px;font-size:16px;font-weight:600;color:var(--ink-2)}
.pk-row{display:flex;gap:26px;align-items:center;padding:22px 0}
.pk-row + .pk-row{border-top:1px solid var(--line)}
.pk-media{flex:0 0 220px;width:220px;height:220px;object-fit:cover;border-radius:var(--shape-photo, calc(var(--r-scale,1)*14px))}
.pk-body{flex:1}
.pk-best{display:inline-block;margin-bottom:8px;font-size:12px;font-weight:800;letter-spacing:.08em;color:#fff;background:var(--accent);border-radius:999px;padding:4px 14px}
.pk-name{font-family:var(--font-display);font-weight:800;font-size:26px;color:var(--accent);line-height:1.2}
.pk-desc{margin-top:8px;font-size:15px;color:var(--ink-2);line-height:1.5}
.pk-price{margin-top:16px;text-align:right}
.pk-orig{font-size:15px;color:var(--muted);text-decoration:line-through}
.pk-final{font-family:var(--font-display);font-weight:800;font-size:28px;color:var(--ink)}
`,
  render: (d, { esc, richSafe }) => `
<section class="pk">
  <div class="pk-hd">
    <h2 class="pk-title">${esc(d.title ?? "WHAT'S FOR YOU?")}</h2>
    ${d.subtitle ? `<p class="pk-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  ${d.packages
    .map(
      (p) => `
  <div class="pk-row">
    ${media(p.image, 'pk-media', '패키지')}
    <div class="pk-body">
      ${p.best ? `<span class="pk-best">BEST</span><br>` : ''}
      <span class="pk-name">${richSafe(p.name)}</span>
      ${p.desc ? `<div class="pk-desc">${richSafe(p.desc)}</div>` : ''}
      ${
        p.price || p.priceOriginal
          ? `<div class="pk-price">${p.priceOriginal ? `<div class="pk-orig">${esc(p.priceOriginal)}</div>` : ''}${p.price ? `<div class="pk-final">${esc(p.price)}</div>` : ''}</div>`
          : ''
      }
    </div>
  </div>`,
    )
    .join('')}
</section>`,
})
