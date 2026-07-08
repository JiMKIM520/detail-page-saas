/** LINEUP 아키타입 추가 변형(템플릿 충실 재현): 08_상품 구성.
 *  package-cards(_06 컬러 풀배경+흰 카드 세로 스택+BEST 배지),
 *  package-dark(_03 다크+히어로 이미지+번호 가격카드).
 *  가격/구성은 brief 근거만(지어내지 말 것). 와디즈 200섹션을 토큰 기반 재구성. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const pad2 = (n: number): string => String(n).padStart(2, '0')

// ── package-cards (_06: accent 풀배경 + 흰 카드 세로 스택 + BEST 배지) ──
const cardsSchema = z.object({
  title: z.string().min(1).optional(), // 기본 "WHAT'S FOR YOU?"
  subtitle: z.string().min(1).optional(),
  packages: z
    .array(
      z.object({
        name: z.string().min(1), // em 허용
        desc: z.string().min(1).optional(),
        image: z.string().optional(),
        priceOriginal: z.string().min(1).optional(),
        price: z.string().min(1).optional(),
        best: z.boolean().optional(),
      }),
    )
    .min(2)
    .max(4),
})
type CardsData = z.infer<typeof cardsSchema>

export const packageCards = defineBlock<CardsData>({
  id: 'package-cards',
  archetype: 'lineup',
  styleTags: ['premium', 'colorblock', 'template', 'pricing', 'centered'],
  imageSlots: 4,
  describe:
    '상품 구성(컬러 풀배경 카드). accent 풀배경 + 중앙 대제목 + 흰 카드 세로 스택(이미지·패키지명·설명·가격·BEST). 강한 컬러블록. 가격/구성은 brief 근거만.',
  schema: cardsSchema,
  css: `
.pc{background:var(--accent);color:#fff;padding:54px 44px 58px;text-align:center}
.pc-title{font-family:var(--font-display);font-weight:800;font-size:52px;color:#fff;line-height:1.08;letter-spacing:-.01em}
.pc-sub{margin-top:12px;font-size:15px;color:rgba(255,255,255,.82)}
.pc-list{margin-top:30px;display:flex;flex-direction:column;gap:22px}
.pc-card{position:relative;background:var(--paper);color:var(--ink);border-radius:calc(var(--r-scale,1)*20px);padding:0 0 26px;overflow:hidden;box-shadow:0 18px 40px rgba(0,0,0,.16)}
.pc-img{width:100%;height:210px;object-fit:cover;display:block}
.pc-name{margin-top:22px;font-family:var(--font-display);font-weight:800;font-size:24px;color:var(--ink)}
.pc-name .em{color:var(--accent)}
.pc-desc{margin-top:8px;font-size:14px;color:var(--muted)}
.pc-price{margin-top:16px}
.pc-orig{font-size:14px;color:var(--muted);text-decoration:line-through;margin-right:8px}
.pc-final{font-family:var(--font-display);font-weight:800;font-size:24px;color:var(--accent)}
.pc-best{position:absolute;top:16px;right:16px;width:62px;height:62px;border-radius:50%;background:linear-gradient(135deg,color-mix(in srgb,var(--accent) 38%,#fff),var(--accent));color:#fff;font-family:var(--font-display);font-weight:800;font-size:14px;display:grid;place-items:center;box-shadow:0 6px 16px rgba(0,0,0,.22)}
`,
  render: (d, { esc, richSafe }) => `
<section class="pc">
  <h2 class="pc-title">${esc(d.title ?? "WHAT'S FOR YOU?")}</h2>
  ${d.subtitle ? `<p class="pc-sub">${esc(d.subtitle)}</p>` : ''}
  <div class="pc-list">
    ${d.packages
      .map(
        (p) => `
    <div class="pc-card">
      ${p.best ? `<span class="pc-best">BEST</span>` : ''}
      ${media(p.image, 'pc-img', '패키지')}
      <div class="pc-name">${richSafe(p.name)}</div>
      ${p.desc ? `<div class="pc-desc">${richSafe(p.desc)}</div>` : ''}
      ${
        p.price || p.priceOriginal
          ? `<div class="pc-price">${p.priceOriginal ? `<span class="pc-orig">${esc(p.priceOriginal)}</span>` : ''}${p.price ? `<span class="pc-final">${esc(p.price)}</span>` : ''}</div>`
          : ''
      }
    </div>`,
      )
      .join('')}
  </div>
</section>`,
})

// ── package-dark (_03: 다크 + 히어로 이미지 + 번호 가격카드) ──
const darkSchema = z.object({
  title: z.string().min(1).optional(), // 기본 "WHAT'S FOR YOU?"
  subtitle: z.string().min(1).optional(),
  image: z.string().optional(), // 상단 히어로(구성품 연출)
  packages: z
    .array(
      z.object({
        name: z.string().min(1), // em 허용
        desc: z.string().min(1).optional(),
        priceOriginal: z.string().min(1).optional(),
        price: z.string().min(1).optional(),
      }),
    )
    .min(2)
    .max(4),
})
type DarkData = z.infer<typeof darkSchema>

export const packageDark = defineBlock<DarkData>({
  id: 'package-dark',
  archetype: 'lineup',
  styleTags: ['premium', 'dark', 'template', 'pricing'],
  imageSlots: 1,
  describe:
    '상품 구성(다크). 다크 배경 + 대제목 + 상단 히어로 이미지 + 번호 가격카드(번호태그·이름/설명·정가/최종가). 다크 블록(명암 리듬용). 가격/구성은 brief 근거만.',
  schema: darkSchema,
  css: `
.pd{background:var(--ink);color:#fff;padding:52px 48px 56px;text-align:center}
.pd-title{font-family:var(--font-display);font-weight:800;font-size:48px;color:var(--accent);letter-spacing:-.01em;line-height:1.06}
.pd-sub{margin-top:10px;font-size:15px;color:rgba(255,255,255,.7)}
.pd-hero{width:100%;height:300px;object-fit:contain;margin:26px 0 30px}
.pd-list{display:flex;flex-direction:column;gap:16px}
.pd-card{display:flex;align-items:center;gap:18px;text-align:left;background:linear-gradient(120deg,rgba(255,255,255,.08),color-mix(in srgb,var(--accent) 18%,transparent));border:1px solid rgba(255,255,255,.12);border-radius:calc(var(--r-scale,1)*14px);padding:22px 24px}
.pd-no{flex:0 0 auto;font-family:var(--font-display);font-weight:800;font-size:13px;color:#fff;background:var(--accent);border-radius:calc(var(--r-scale,1)*6px);padding:4px 9px}
.pd-body{flex:1}
.pd-name{font-family:var(--font-display);font-weight:800;font-size:20px;color:#fff}
.pd-name .em{color:var(--accent)}
.pd-desc{margin-top:5px;font-size:13px;color:rgba(255,255,255,.62);line-height:1.5}
.pd-price{flex:0 0 auto;text-align:right}
.pd-orig{font-size:12px;color:rgba(255,255,255,.5);text-decoration:line-through}
.pd-final{font-family:var(--font-display);font-weight:800;font-size:20px;color:#fff}
`,
  render: (d, { esc, richSafe }) => `
<section class="pd">
  <h2 class="pd-title">${esc(d.title ?? "WHAT'S FOR YOU?")}</h2>
  ${d.subtitle ? `<p class="pd-sub">${esc(d.subtitle)}</p>` : ''}
  ${d.image ? media(d.image, 'pd-hero', '상품 구성') : ''}
  <div class="pd-list">
    ${d.packages
      .map(
        (p, i) => `
    <div class="pd-card">
      <span class="pd-no">${pad2(i + 1)}</span>
      <div class="pd-body">
        <div class="pd-name">${richSafe(p.name)}</div>
        ${p.desc ? `<div class="pd-desc">${richSafe(p.desc)}</div>` : ''}
      </div>
      ${
        p.price || p.priceOriginal
          ? `<div class="pd-price">${p.priceOriginal ? `<div class="pd-orig">${esc(p.priceOriginal)}</div>` : ''}${p.price ? `<div class="pd-final">${esc(p.price)}</div>` : ''}</div>`
          : ''
      }
    </div>`,
      )
      .join('')}
  </div>
</section>`,
})
