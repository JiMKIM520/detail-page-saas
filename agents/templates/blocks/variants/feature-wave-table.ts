/** FEATURE 아키타입(템플릿 충실 재현): feature-wave-table.
 *  와디즈 200섹션 "03_특장점" 웨이브 히어로+테이블(_1279:3792) 패턴을 토큰 기반으로 재구성(클론 아님).
 *  풀블리드 히어로 이미지(하단 웨이브 SVG 컷) + accent 배경 + 중앙 서브/제목 + 2열 테이블 행 3개. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  heroImage: z.string().optional(),           // 풀블리드 히어로 이미지 (url)
  subtitle: z.string().min(1).optional(),     // 히어로 하단 서브카피 (예: "우리 제품이 특별한 이유를...")
  title: z.string().min(1),                   // 섹션 대제목 (em, br 허용)
  rows: z
    .array(
      z.object({
        label: z.string().min(1),             // 좌측 굵은 라벨 (em, br 허용)
        desc: z.string().min(1),              // 우측 설명 텍스트 (em, br 허용)
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const featureWaveTable = defineBlock<Data>({
  id: 'feature-wave-table',
  archetype: 'feature',
  styleTags: ['premium', 'light', 'template', 'editorial'],
  imageSlots: 1,
  describe:
    '특장점 웨이브 히어로+테이블. 풀블리드 히어로 이미지(하단 웨이브 SVG 컷) + accent 배경 + 중앙 서브/대제목 + 2열 테이블 행(라벨|설명) 2~4개. 밝고 구조적인 프리미엄 특장점.',
  schema,
  css: `
.fwt{background:var(--accent);color:var(--ink)}
.fwt-hero{position:relative;width:100%;line-height:0}
.fwt-hero-img{width:100%;height:520px;object-fit:cover;display:block}
.fwt-wave{position:absolute;bottom:-1px;left:0;width:100%;overflow:hidden;line-height:0}
.fwt-wave svg{display:block;width:100%;height:72px}
.fwt-body{padding:48px var(--pad-x,56px) 60px}
.fwt-sub{text-align:center;font-size:16px;font-weight:500;color:var(--ink);opacity:.72;margin-bottom:12px}
.fwt-title{text-align:center;font-family:var(--font-display);font-weight:800;font-size:56px;color:var(--accent-d);letter-spacing:-.02em;line-height:1.1;margin-bottom:42px}
.fwt-title .em{color:var(--ink)}
.fwt-table{width:100%;border-collapse:collapse}
.fwt-table tr{border-top:1px solid color-mix(in srgb,var(--ink) 16%,transparent)}
.fwt-table tr:last-child{border-bottom:1px solid color-mix(in srgb,var(--ink) 16%,transparent)}
.fwt-table td{padding:22px 0;vertical-align:middle}
.fwt-td-label{width:34%;padding-right:0;font-family:var(--font-display);font-weight:800;font-size:18px;color:var(--ink);line-height:1.35}
.fwt-td-label .em{color:color-mix(in srgb,var(--ink) 55%,transparent)}
.fwt-divider{width:1px;background:color-mix(in srgb,var(--ink) 20%,transparent);padding:0 0 0 1px}
.fwt-td-desc{padding-left:24px;font-size:15px;color:var(--ink);line-height:1.7;opacity:.88}
.fwt-td-desc .em{color:var(--ink);font-weight:700;opacity:1}
`,
  render: (d, { esc, richSafe }) => `
<section class="fwt">
  <div class="fwt-hero">
    ${media(d.heroImage, 'fwt-hero-img', '히어로 이미지')}
    <div class="fwt-wave">
      <svg viewBox="0 0 1000 72" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,72 L0,36 Q125,0 250,36 Q375,72 500,36 Q625,0 750,36 Q875,72 1000,36 L1000,72 Z" fill="var(--accent)"/>
      </svg>
    </div>
  </div>
  <div class="fwt-body">
    ${d.subtitle ? `<p class="fwt-sub">${esc(d.subtitle)}</p>` : ''}
    <h2 class="fwt-title">${richSafe(d.title)}</h2>
    <table class="fwt-table">
      ${d.rows
        .map(
          (r) => `
      <tr>
        <td class="fwt-td-label">${richSafe(r.label)}</td>
        <td class="fwt-divider"></td>
        <td class="fwt-td-desc">${richSafe(r.desc)}</td>
      </tr>`,
        )
        .join('')}
    </table>
  </div>
</section>`,
})
