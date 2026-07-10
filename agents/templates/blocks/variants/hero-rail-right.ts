/** HERO 아키타입: hero-rail-right
 *  피그마 311_인트로_54 구조 흡수.
 *  핵심 장치: 우측 정렬 브랜드 가로선(레일) + 영문 브랜드명, 대형 우측 정렬 타이틀 2행,
 *  제품 서브텍스트, 하단 전폭 제품 사진. 비대칭 편집 감성(라이트).
 *  noimg-safe: 이미지 미제공 시 사진 패널 숨기고 타이틀 영역만으로 강등 렌더. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  brandName: z.string().min(1),             // 브랜드 영문/한글 이름 (우측 정렬 레일 옆)
  title: z.string().min(1),                 // 대형 헤드라인 (em,br) — 2행 권장
  productName: z.string().min(1),           // 제품명 서브텍스트
  image: z.string().optional(),             // 전폭 제품 사진 (url) — 없으면 강등
})
type Data = z.infer<typeof schema>

export const heroRailRight = defineBlock<Data>({
  id: 'hero-rail-right',
  archetype: 'hero',
  styleTags: ['light', 'editorial', 'asymmetric', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '우측 정렬 브랜드 가로선(레일)+영문 브랜드명 / 대형 우측 정렬 타이틀 2행 / 제품 서브텍스트 / 하단 전폭 제품 사진. 비대칭 편집 감성 인트로. 라이트 배경.',
  schema,
  css: `
.hedy{position:relative;background:var(--bg);color:var(--ink);padding:0 0 0}
/* 타이틀 영역 */
.hedy-head{padding:46px var(--pad-x,56px) 40px;text-align:right}
/* 브랜드 레일 행: 가로선 + 브랜드명 우측 정렬 */
.hedy-brand-row{display:flex;align-items:center;justify-content:flex-end;gap:18px;margin-bottom:26px}
.hedy-rail{flex:0 0 auto;width:220px;height:2px;background:var(--ink);opacity:.85}
.hedy-brand{font-family:var(--font-lat);font-size:22px;font-weight:600;letter-spacing:.06em;color:var(--ink);text-transform:uppercase;white-space:nowrap}
/* 대형 타이틀 */
.hedy-title{font-family:var(--font-display);font-size:72px;font-weight:700;line-height:1.12;letter-spacing:-.025em;color:var(--ink);text-align:right;word-break:keep-all}
.hedy-title .em{color:var(--accent)}
/* 제품명 서브텍스트 */
.hedy-product{margin-top:18px;font-family:var(--font-body);font-size:26px;font-weight:400;color:var(--ink-2);text-align:right;letter-spacing:.01em}
/* 전폭 사진 */
.hedy-photo-wrap{width:100%;line-height:0}
.hedy-photo{width:100%;aspect-ratio:860/700;object-fit:cover;border-radius:var(--shape-photo, 0px);display:block}
/* noimg-safe: .ph가 display:none!important 이므로 .hedy-photo-wrap 자체를 조건부 숨김 */
.hedy-photo-wrap:has(.ph){display:none}
`,
  render: (d, { esc, richSafe }) => `
<section class="hedy">
  <div class="hedy-head">
    <div class="hedy-brand-row">
      <div class="hedy-rail" aria-hidden="true"></div>
      <span class="hedy-brand">${esc(d.brandName)}</span>
    </div>
    <h2 class="hedy-title">${richSafe(d.title)}</h2>
    <p class="hedy-product">${esc(d.productName)}</p>
  </div>
  <div class="hedy-photo-wrap">
    ${media(d.image, 'hedy-photo', esc(d.productName))}
  </div>
</section>`,
})
