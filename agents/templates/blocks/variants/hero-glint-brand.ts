/** HERO 아키타입: hero-glint-brand
 *  피그마 044_인트로_09 패턴 재구성:
 *  검정 배경 + 상단 대형 그라디언트 브랜드명 + 제품 이미지 위 흰색 세로 글린트 선 2줄 오버레이
 *  + 하단 그라디언트 타이포 블록(서브타이틀 / 구분선 / 슬로건 2줄).
 *  다크 톤. noimg-safe: 이미지 부재 시 글린트 오버레이 생략, 배경 패널로 강등.
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  brandName: z.string().min(1),           // 대형 브랜드명 (em,br) — 2줄 권장
  subtitle: z.string().min(1).optional(), // 이미지 아래 소형 서브타이틀 (em,br)
  slogan: z.string().min(1),              // 중앙 슬로건 대문자 2줄 (em,br)
  tagline: z.string().min(1).optional(),  // 슬로건 아래 보조 카피 (em,br)
  image: z.string().optional(),           // 제품 이미지 (url)
})
type Data = z.infer<typeof schema>

export const heroGlintBrand = defineBlock<Data>({
  id: 'hero-glint-brand',
  archetype: 'hero',
  styleTags: ['dark', 'luxury', 'gradient', 'editorial', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '다크 히어로. 검정 배경 위 상단 대형 그라디언트 브랜드명 → 제품 이미지(흰색 세로 글린트 선 2줄 오버레이) → 하단 그라디언트 슬로건/태그라인 순의 3단 구조. 전자제품·뷰티·프리미엄 패키지에 적합.',
  schema,
  css: `
.hgb{position:relative;background:#000;color:#fff;padding:0 0 64px;overflow:hidden;text-align:center}
/* 상단 브랜드명 */
.hgb-brand{padding:40px var(--pad-x,56px) 28px;font-family:var(--font-display);font-weight:800;font-size:clamp(56px,9vw,96px);line-height:1.05;letter-spacing:-.03em;background:linear-gradient(135deg,#fff 0%,var(--accent,#b8a48a) 55%,#fff 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.hgb-brand .em{-webkit-text-fill-color:transparent;color:inherit}
/* 제품 이미지 영역 */
.hgb-img-wrap{position:relative;width:100%;aspect-ratio:860/794;overflow:hidden;background:var(--brand,#111)}
.hgb-img-wrap img,.hgb-img-wrap .ph{width:100%;height:100%;object-fit:cover;border-radius:var(--shape-photo,0px);display:block}
/* 글린트 세로선 — 이미지 위 오버레이 */
.hgb-glint{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:hidden}
.hgb-glint::before,.hgb-glint::after{content:'';position:absolute;top:2%;bottom:4%;border-radius:calc(var(--r-scale,1)*4px);background:linear-gradient(180deg,transparent 0%,rgba(255,255,255,.72) 30%,rgba(255,255,255,.9) 50%,rgba(255,255,255,.72) 70%,transparent 100%);mix-blend-mode:screen;filter:blur(1.5px)}
.hgb-glint::before{left:14.3%;width:0.8%}
.hgb-glint::after{left:15.8%;width:2.7%}
/* noimg 강등: 이미지 없으면 글린트 숨김 */
.hgb-img-wrap.hgb--noimg .hgb-glint{display:none}
.hgb-img-wrap.hgb--noimg{aspect-ratio:auto;min-height:180px;background:linear-gradient(160deg,#1a1a1a 0%,#0a0a0a 100%)}
/* 하단 타이포 블록 */
.hgb-lower{padding:32px var(--pad-x,56px) 0}
.hgb-subtitle{font-family:var(--font-display);font-weight:700;font-size:clamp(22px,3.2vw,44px);line-height:1.2;letter-spacing:-.01em;background:linear-gradient(90deg,var(--accent,#c8b090) 0%,#fff 50%,var(--accent,#c8b090) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:18px}
.hgb-subtitle .em{-webkit-text-fill-color:transparent;color:inherit}
.hgb-rule{width:calc(var(--pad-x,56px)*2.2 + 200px);max-width:80%;height:1px;background:rgba(217,217,217,.35);margin:0 auto 28px}
.hgb-slogan{font-family:var(--font-display);font-weight:800;font-size:clamp(36px,5.5vw,88px);line-height:1.1;letter-spacing:-.03em;background:linear-gradient(135deg,var(--accent,#c8b090) 0%,#fff 40%,var(--accent,#c8b090) 80%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.hgb-slogan .em{-webkit-text-fill-color:transparent;color:inherit}
.hgb-tagline{margin-top:20px;font-family:var(--font-display);font-weight:500;font-size:clamp(18px,2.5vw,52px);line-height:1.35;letter-spacing:-.01em;background:linear-gradient(90deg,#fff 0%,var(--accent,#c8b090) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.hgb-tagline .em{-webkit-text-fill-color:transparent;color:inherit}
/* 다크 em 오버라이드 */
.hgb .em{color:var(--em-dark,#FFF7EA)}
`,
  render: (d, { richSafe }) => {
    const hasImg = typeof d.image === 'string' && /^(https?:\/\/|data:|\/)/.test(d.image.trim())
    return `
<section class="hgb">
  <h2 class="hgb-brand">${richSafe(d.brandName)}</h2>
  <div class="hgb-img-wrap${hasImg ? '' : ' hgb--noimg'}">
    ${media(d.image, '', '제품 이미지')}
    ${hasImg ? '<div class="hgb-glint" aria-hidden="true"></div>' : ''}
  </div>
  <div class="hgb-lower">
    ${d.subtitle ? `<p class="hgb-subtitle">${richSafe(d.subtitle)}</p>` : ''}
    <div class="hgb-rule"></div>
    <p class="hgb-slogan">${richSafe(d.slogan)}</p>
    ${d.tagline ? `<p class="hgb-tagline">${richSafe(d.tagline)}</p>` : ''}
  </div>
</section>`
  },
})
