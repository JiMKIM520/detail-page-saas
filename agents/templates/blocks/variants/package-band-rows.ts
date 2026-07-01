/** LINEUP 아키타입(템플릿 충실 재현): 08_상품구성 _교차 밴드 행.
 *  package-band-rows: OFFER pill 배지 + 중앙 대제목 + 구분 선 + 3개 패키지 행이
 *  교차 풀폭 틴트 배경 띠 — 이름/설명/가격 중앙정렬, 이미지 없음. 가격표 느낌.
 *  와디즈 200섹션 08_상품구성 Figma 1284:2990 패턴을 토큰 기반 재구성. */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  badge: z.string().min(1).optional(),        // pill 배지 텍스트 (기본 "OFFER")
  title: z.string().min(1).optional(),        // 대제목 (em,br 허용)
  subtitle: z.string().min(1).optional(),     // 소제목 설명
  packages: z
    .array(
      z.object({
        name: z.string().min(1),              // 패키지명 (em,br 허용)
        desc: z.string().min(1).optional(),   // 패키지 설명
        priceOriginal: z.string().min(1).optional(), // 정가(취소선)
        price: z.string().min(1).optional(),  // 최종가
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const packageBandRows = defineBlock<Data>({
  id: 'package-band-rows',
  archetype: 'lineup',
  styleTags: ['light', 'centered', 'pricing', 'template', 'minimal'],
  imageSlots: 0,
  describe:
    '상품 구성(교차 밴드 행, 이미지 없음). OFFER pill 배지 + 중앙 대제목/소제목 + 구분선 + 패키지 행마다 교차 풀폭 틴트 배경띠, 이름/설명/가격 중앙정렬. 가격표 느낌. 가격/구성은 brief 근거만.',
  schema,
  css: `
.pbr{background:var(--bg);color:var(--ink);text-align:center;padding:56px 0 0}
.pbr-top{padding:0 44px 48px}
.pbr-badge{display:inline-block;background:var(--accent);color:#fff;font-size:13px;font-weight:800;letter-spacing:.14em;padding:6px 22px;border-radius:999px;margin-bottom:20px}
.pbr-title{font-family:var(--font-display);font-weight:800;font-size:64px;color:var(--accent);letter-spacing:-.02em;line-height:1.08}
.pbr-title .em{color:var(--accent-d)}
.pbr-sub{margin-top:16px;font-size:16px;color:var(--ink-2);line-height:1.6}
.pbr-divider{width:1px;height:64px;background:var(--line);margin:0 auto 0}
.pbr-rows{}
.pbr-row{padding:42px 44px}
.pbr-row:nth-child(odd){background:color-mix(in srgb,var(--accent) 13%,transparent)}
.pbr-row:nth-child(even){background:var(--bg)}
.pbr-name{font-family:var(--font-display);font-weight:800;font-size:28px;color:var(--accent);line-height:1.2}
.pbr-name .em{color:var(--accent-d)}
.pbr-desc{margin-top:10px;font-size:15px;color:var(--ink-2);line-height:1.55}
.pbr-price{margin-top:20px;display:flex;align-items:baseline;justify-content:center;gap:12px}
.pbr-orig{font-size:15px;color:var(--muted);text-decoration:line-through}
.pbr-final{font-family:var(--font-display);font-weight:800;font-size:32px;color:var(--ink)}
`,
  render: (d, { esc, richSafe }) => `
<section class="pbr">
  <div class="pbr-top">
    <div class="pbr-badge">${esc(d.badge ?? 'OFFER')}</div>
    <h2 class="pbr-title">${richSafe(d.title ?? "WHAT'S FOR YOU?")}</h2>
    ${d.subtitle ? `<p class="pbr-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  <div class="pbr-divider"></div>
  <div class="pbr-rows">
    ${d.packages
      .map(
        (p) => `
    <div class="pbr-row">
      <div class="pbr-name">${richSafe(p.name)}</div>
      ${p.desc ? `<div class="pbr-desc">${esc(p.desc)}</div>` : ''}
      ${
        p.price || p.priceOriginal
          ? `<div class="pbr-price">${p.priceOriginal ? `<span class="pbr-orig">${esc(p.priceOriginal)}</span>` : ''}${p.price ? `<span class="pbr-final">${esc(p.price)}</span>` : ''}</div>`
          : ''
      }
    </div>`,
      )
      .join('')}
  </div>
</section>`,
})
