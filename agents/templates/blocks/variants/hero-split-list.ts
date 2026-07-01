/** HERO 아키타입 변형: hero-split-list (01_인트로 / 536:389).
 *  좌정렬 브랜드+제목 헤더, 기울어진 제품 이미지(좌), 번호 목록(우) 좌우 분할 구조.
 *  accent 풀배경 + 흰 텍스트 + 원형 번호 뱃지 2열 리스트. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const pad2 = (n: number): string => String(n).padStart(2, '0')

const schema = z.object({
  brand: z.string().min(1),                          // 브랜드 로고/이름 (plain)
  subtitle: z.string().optional(),                   // 제품 한 줄 설명 (em,br)
  title: z.string().min(1),                          // 대형 제품명 (em,br)
  productImage: z.string().optional(),               // 제품 이미지 — 기울어진 주인공 (url)
  items: z
    .array(
      z.object({
        label: z.string().min(1),                    // 번호 항목 제목 (em,br)
        desc: z.string().optional(),                 // 항목 설명 (em,br)
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const heroSplitList = defineBlock<Data>({
  id: 'hero-split-list',
  archetype: 'hero',
  styleTags: ['colorblock', 'cobalt', 'bold', 'template', 'numbered'],
  imageSlots: 1,
  describe:
    '좌우 분할 히어로. 좌상단 브랜드+대형 제품명, 중앙-좌에 기울어진 제품 이미지, 우측에 원형 번호 뱃지+텍스트 목록. accent 풀배경 + 흰 글자.',
  schema,
  css: `
.hsl{background:var(--accent);color:#fff;padding:54px 48px 60px;position:relative;overflow:hidden}
.hsl::before{content:"";position:absolute;left:-80px;top:50%;transform:translateY(-50%);width:280px;height:280px;border-radius:50%;background:color-mix(in srgb,#fff 8%,transparent);pointer-events:none}
.hsl-brand{font-size:13px;font-weight:800;letter-spacing:.16em;color:rgba(255,255,255,.75);text-transform:uppercase;margin-bottom:12px}
.hsl-sub{font-size:16px;font-weight:500;color:rgba(255,255,255,.85);line-height:1.5;margin-bottom:8px}
.hsl-sub .em{color:#fff;font-weight:700}
.hsl-title{font-family:var(--font-display);font-weight:800;font-size:52px;letter-spacing:-.02em;line-height:1.1;color:#fff;margin-bottom:0}
.hsl-title .em{color:color-mix(in srgb,#fff 70%,transparent)}
.hsl-body{display:flex;align-items:center;gap:0;margin-top:32px;min-height:340px;position:relative}
.hsl-img-wrap{flex:0 0 auto;width:220px;position:relative;align-self:flex-end}
.hsl-img-wrap::after{content:"";position:absolute;left:50%;bottom:-18px;transform:translateX(-50%);width:160px;height:30px;background:rgba(0,0,0,.18);border-radius:50%;filter:blur(8px)}
.hsl-product{width:200px;height:340px;object-fit:contain;display:block;transform:rotate(-8deg) translateX(10px);filter:drop-shadow(0 18px 32px rgba(0,0,0,.28));position:relative;z-index:1}
.hsl-list{flex:1;display:flex;flex-direction:column;gap:22px;padding-left:24px}
.hsl-item{display:flex;align-items:flex-start;gap:16px}
.hsl-num{flex:0 0 52px;width:52px;height:52px;border-radius:50%;border:2px solid rgba(255,255,255,.55);display:flex;align-items:center;justify-content:center;font-family:'Cafe24 ClassicType',serif;font-size:20px;font-weight:400;color:rgba(255,255,255,.9);letter-spacing:.02em;background:rgba(255,255,255,.08);flex-shrink:0}
.hsl-tx{padding-top:4px}
.hsl-label{font-family:var(--font-display);font-weight:800;font-size:18px;color:#fff;line-height:1.3}
.hsl-label .em{color:color-mix(in srgb,#fff 70%,transparent)}
.hsl-desc{margin-top:5px;font-size:13px;color:rgba(255,255,255,.78);line-height:1.6}
.hsl-desc .em{color:#fff;font-weight:600}
`,
  render: (d, { esc, richSafe }) => `
<section class="hsl">
  <p class="hsl-brand">${esc(d.brand)}</p>
  ${d.subtitle ? `<p class="hsl-sub">${richSafe(d.subtitle)}</p>` : ''}
  <h1 class="hsl-title disp">${richSafe(d.title)}</h1>
  <div class="hsl-body">
    <div class="hsl-img-wrap">
      ${media(d.productImage, 'hsl-product', '제품 이미지')}
    </div>
    <div class="hsl-list">
      ${d.items
        .map(
          (it, i) => `
      <div class="hsl-item">
        <div class="hsl-num">${pad2(i + 1)}</div>
        <div class="hsl-tx">
          <div class="hsl-label">${richSafe(it.label)}</div>
          ${it.desc ? `<div class="hsl-desc">${richSafe(it.desc)}</div>` : ''}
        </div>
      </div>`,
        )
        .join('')}
    </div>
  </div>
</section>`,
})
