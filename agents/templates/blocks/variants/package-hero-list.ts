/** LINEUP 아키타입(템플릿 충실 재현): 08_상품 구성 _히어로리스트.
 *  피그마 1279:1274 — 중앙 대제목 + 풀폭 히어로 제품 이미지;
 *  아래 텍스트 전용 3행(이름/설명 좌, 가격 accent pill 우), 헤어라인 구분 — 행별 이미지 없음.
 *  package-list(행마다 이미지), package-dark(다크+번호카드)와 구별되는 라이트 히어로+텍스트 리스트. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  subtitle: z.string().min(1).optional(), // 중앙 소제목 (예: "여러분을 위한 상품 패키지입니다")
  title: z.string().min(1).optional(), // 중앙 대제목 기본 "WHAT'S FOR YOU?"
  heroImage: z.string().optional(), // (url) 풀폭 히어로 제품 이미지
  packages: z
    .array(
      z.object({
        name: z.string().min(1), // (em,br) 패키지명 (좌측 굵은 텍스트)
        desc: z.string().min(1).optional(), // 패키지 설명 (이름 아래 소문자)
        priceOriginal: z.string().min(1).optional(), // 정가 취소선
        price: z.string().min(1).optional(), // 최종가 accent pill
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const packageHeroList = defineBlock<Data>({
  id: 'package-hero-list',
  archetype: 'lineup',
  styleTags: ['premium', 'light', 'template', 'pricing', 'centered'],
  imageSlots: 1,
  describe:
    '상품 구성(히어로+텍스트 리스트). 중앙 소제목+대형 display 타이틀 + 풀폭 히어로 제품 이미지 + 행별 이미지 없는 패키지명·설명·가격(정가취소선+accent pill) 텍스트 리스트 + 헤어라인 구분. 가격/구성은 brief 근거만.',
  schema,
  css: `
.phl{background:var(--bg);color:var(--ink)}
.phl-hero-wrap{position:relative;overflow:hidden;background:color-mix(in srgb,var(--accent) 18%,var(--bg))}
.phl-hero-inner{display:flex;align-items:flex-start;justify-content:center;gap:0}
.phl-hd{position:relative;z-index:2;text-align:center;padding:48px 44px 0}
.phl-sub{font-size:15px;font-weight:600;color:var(--ink-2);letter-spacing:.01em;margin-bottom:10px}
.phl-title{font-family:var(--font-display);font-weight:800;font-size:72px;color:var(--accent);letter-spacing:-.02em;line-height:1.05}
.phl-img{width:100%;display:block;object-fit:cover;margin-top:0}
.phl-list{padding:0 44px 52px}
.phl-row{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:26px 0}
.phl-row+.phl-row{border-top:1px solid var(--line)}
.phl-left{flex:1 1 auto}
.phl-name{font-family:var(--font-display);font-weight:800;font-size:24px;color:var(--accent);line-height:1.2}
.phl-name .em{color:var(--accent-d)}
.phl-desc{margin-top:6px;font-size:14px;color:var(--ink-2);line-height:1.55}
.phl-right{flex:0 0 auto;text-align:right}
.phl-orig{font-size:14px;color:var(--muted);text-decoration:line-through;margin-bottom:5px}
.phl-pill{display:inline-block;font-family:var(--font-display);font-weight:800;font-size:22px;color:#fff;background:var(--accent);border-radius:999px;padding:8px 22px;line-height:1.1}
`,
  render: (d, { esc, richSafe }) => `
<section class="phl">
  <div class="phl-hero-wrap">
    <div class="phl-hd">
      ${d.subtitle ? `<p class="phl-sub">${esc(d.subtitle)}</p>` : ''}
      <h2 class="phl-title">${esc(d.title ?? "WHAT'S FOR YOU?")}</h2>
    </div>
    ${media(d.heroImage, 'phl-img', '상품 구성 히어로')}
  </div>
  <div class="phl-list">
    ${d.packages
      .map(
        (p) => `
    <div class="phl-row">
      <div class="phl-left">
        <div class="phl-name">${richSafe(p.name)}</div>
        ${p.desc ? `<div class="phl-desc">${richSafe(p.desc)}</div>` : ''}
      </div>
      ${
        p.price || p.priceOriginal
          ? `<div class="phl-right">${p.priceOriginal ? `<div class="phl-orig">${esc(p.priceOriginal)}</div>` : ''}${p.price ? `<div class="phl-pill">${esc(p.price)}</div>` : ''}</div>`
          : ''
      }
    </div>`,
      )
      .join('')}
  </div>
</section>`,
})
