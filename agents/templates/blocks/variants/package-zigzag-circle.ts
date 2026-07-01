/** LINEUP 아키타입(템플릿 충실 재현): 08_상품구성 _지그재그 원형 이미지.
 *  피그마 204:587 — 중앙 대제목/소제목 + 3개 패키지 행(홀수=이미지 좌/텍스트 우, 짝수=텍스트 좌/이미지 우).
 *  각 행은 풀폭 pill-band(accent 틴트) + 원형 제품 이미지(band 위에 올라탐) + 이름/설명/가격 텍스트.
 *  package-band-rows(이미지 없음), package-hero-list(히어로+텍스트 리스트)와 구별되는 지그재그 교차 레이아웃. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  title: z.string().min(1).optional(),     // (em,br) 대제목 기본 "WHAT'S FOR YOU?"
  subtitle: z.string().min(1).optional(),  // 소제목 설명
  packages: z
    .array(
      z.object({
        name: z.string().min(1),              // (em,br) 패키지명 (굵은 accent 텍스트)
        desc: z.string().min(1).optional(),   // (em,br) 패키지 설명
        priceOriginal: z.string().min(1).optional(), // 정가 취소선
        price: z.string().min(1).optional(), // 최종가 (large accent)
        image: z.string().optional(),         // (url) 원형 제품 이미지
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const packageZigzagCircle = defineBlock<Data>({
  id: 'package-zigzag-circle',
  archetype: 'lineup',
  styleTags: ['light', 'centered', 'pricing', 'template', 'zigzag', 'circle'],
  imageSlots: 3,
  describe:
    '상품 구성(지그재그 원형 이미지). 중앙 대제목/소제목 + 패키지 행마다 풀폭 accent 틴트 pill-band + 원형 제품 이미지가 홀수/짝수 행에서 좌/우 교대 배치 + 이름·설명·가격. 가격/구성은 brief 근거만.',
  schema,
  css: `
.pzc{background:var(--bg);color:var(--ink);padding-bottom:60px}
.pzc-hd{text-align:center;padding:56px 44px 40px}
.pzc-title{font-family:var(--font-display);font-weight:800;font-size:64px;color:var(--accent);letter-spacing:-.02em;line-height:1.08}
.pzc-title .em{color:var(--accent-d)}
.pzc-sub{margin-top:14px;font-size:16px;color:var(--ink-2);line-height:1.6}
.pzc-rows{display:flex;flex-direction:column;gap:36px}
.pzc-row{position:relative;display:flex;align-items:center;min-height:220px}
.pzc-row:nth-child(odd){flex-direction:row}
.pzc-row:nth-child(even){flex-direction:row-reverse}
.pzc-band{position:absolute;top:50%;transform:translateY(-50%);left:0;right:0;height:160px;background:color-mix(in srgb,var(--accent) 18%,transparent);border-radius:999px;z-index:0}
.pzc-img-wrap{position:relative;z-index:1;flex:0 0 260px;display:flex;align-items:center;justify-content:center}
.pzc-row:nth-child(odd) .pzc-img-wrap{justify-content:flex-start;padding-left:0}
.pzc-row:nth-child(even) .pzc-img-wrap{justify-content:flex-end;padding-right:0}
.pzc-circle{width:220px;height:220px;border-radius:50%;object-fit:cover;flex-shrink:0}
.pzc-text{position:relative;z-index:1;flex:1 1 auto;padding:24px 44px}
.pzc-row:nth-child(odd) .pzc-text{text-align:left;padding-left:32px;padding-right:44px}
.pzc-row:nth-child(even) .pzc-text{text-align:left;padding-left:44px;padding-right:32px}
.pzc-name{font-family:var(--font-display);font-weight:800;font-size:26px;color:var(--accent);line-height:1.2}
.pzc-name .em{color:var(--accent-d)}
.pzc-desc{margin-top:8px;font-size:14px;color:var(--ink-2);line-height:1.6}
.pzc-divider{margin:14px 0;border:none;border-top:1px solid var(--line);width:180px}
.pzc-row:nth-child(odd) .pzc-divider{margin-left:0}
.pzc-row:nth-child(even) .pzc-divider{margin-left:0}
.pzc-orig{font-size:14px;color:var(--muted);text-decoration:line-through;margin-bottom:4px}
.pzc-price{font-family:var(--font-display);font-weight:800;font-size:32px;color:var(--accent);line-height:1.1}
`,
  render: (d, { esc, richSafe }) => `
<section class="pzc">
  <div class="pzc-hd">
    <h2 class="pzc-title">${richSafe(d.title ?? "WHAT'S FOR YOU?")}</h2>
    ${d.subtitle ? `<p class="pzc-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  <div class="pzc-rows">
    ${d.packages
      .map(
        (p) => `
    <div class="pzc-row">
      <div class="pzc-band"></div>
      <div class="pzc-img-wrap">
        ${media(p.image, 'pzc-circle', esc(p.name))}
      </div>
      <div class="pzc-text">
        <div class="pzc-name">${richSafe(p.name)}</div>
        ${p.desc ? `<div class="pzc-desc">${richSafe(p.desc)}</div>` : ''}
        <hr class="pzc-divider">
        ${p.priceOriginal ? `<div class="pzc-orig">${esc(p.priceOriginal)}</div>` : ''}
        ${p.price ? `<div class="pzc-price">${esc(p.price)}</div>` : ''}
      </div>
    </div>`,
      )
      .join('')}
  </div>
</section>`,
})
