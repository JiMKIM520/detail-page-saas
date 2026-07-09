/** LINEUP 아키타입: lineup-wordmark-split
 *  원본: 014_모바일_전환_6.json (모바일_전환/6)
 *  구조: 상단 좌우 50:50 분할 사진 + 중앙 타이틀+서브텍스트 + 낱자 컬러박스 워드마크 행 + CTA 버튼.
 *  핵심 장치: 제품명 낱자(2~4자)를 각각 다른 색 사각형 블록에 담아 수평 배열하는 워드마크.
 *  noimg-safe: 이미지 부재 시 분할 프레임을 숨기고 워드마크+카피+CTA 레이아웃으로 강등.
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

/** 워드마크 낱자 1칸 */
const tileSchema = z.object({
  char: z.string().min(1).max(2),          // 한 글자 (또는 짧은 영문)
  bg: z.string().min(1),                    // 배경색 토큰 or hex (예: "var(--accent)" / "#f74162")
  color: z.string().min(1).default('#ffffff'), // 글자색
})

const schema = z.object({
  imageLeft: z.string().optional(),         // 좌측 사진 (url)
  imageRight: z.string().optional(),        // 우측 사진 (url)
  title: z.string().min(1),                 // 메인 타이틀 (em/br 허용)
  subtitle: z.string().optional(),          // 타이틀 아래 한 줄 설명
  tiles: z.array(tileSchema).min(2).max(6), // 워드마크 낱자 블록 (2~6칸)
  ctaText: z.string().min(1),              // CTA 버튼 텍스트
  ctaUrl: z.string().optional(),           // CTA 링크 (없으면 button)
})
type Data = z.infer<typeof schema>

export const lineupWordmarkSplit = defineBlock<Data>({
  id: 'lineup-wordmark-split',
  archetype: 'lineup',
  styleTags: ['light', 'warm', 'food', 'gift', 'playful', 'noimg-safe'],
  imageSlots: 2,
  describe:
    '상단 좌우 50:50 분할 사진 + 중앙 대형 타이틀 + 제품명 낱자를 컬러 박스에 담은 워드마크 행 + CTA. 선물세트·패키지·시즌 상품 구성 소개에 적합. 이미지 없이도 워드마크+카피 레이아웃으로 강등(noimg-safe).',
  schema,
  css: `
/* ── pyvo: lineup-wordmark-split ── */
.pyvo{background:var(--bg);color:var(--ink);text-align:center;padding-bottom:52px}

/* 좌우 분할 사진 영역 */
.pyvo-split{display:flex;width:100%;height:260px;overflow:hidden}
.pyvo-split-img{flex:0 0 50%;width:50%;height:100%;object-fit:cover}
.pyvo-split-img.ph{display:none!important}

/* noimg-safe: 두 이미지가 모두 없으면 분할 영역 자체를 숨김 */
.pyvo-split.pyvo-no-img{display:none}

/* 워드마크 + 타이틀 래퍼 */
.pyvo-body{padding:36px var(--pad-x,56px) 0}

/* 낱자 워드마크 행 */
.pyvo-tiles{display:flex;justify-content:center;gap:10px;margin-bottom:24px}
.pyvo-tile{
  display:flex;align-items:center;justify-content:center;
  width:60px;height:60px;
  border-radius:calc(var(--r-scale,1)*10px);
  font-family:var(--font-display);font-weight:800;font-size:32px;line-height:1;
  flex-shrink:0
}

/* 타이틀 */
.pyvo-title{
  font-family:var(--font-display);font-weight:800;
  font-size:clamp(36px,5.5vw,62px);line-height:1.15;
  color:var(--brand,#293372);letter-spacing:-.02em;
  margin-bottom:14px
}
.pyvo-title .em{color:var(--accent)}

/* 서브텍스트 */
.pyvo-sub{
  font-size:clamp(15px,1.8vw,19px);font-weight:400;
  color:var(--ink);line-height:1.6;
  margin-bottom:32px
}

/* CTA 버튼 */
.pyvo-cta{
  display:inline-flex;align-items:center;gap:10px;
  background:var(--ink);color:#ffffff;
  padding:14px 32px;
  border-radius:calc(var(--r-scale,1)*6px);
  font-family:var(--font-display);font-weight:300;font-size:18px;
  letter-spacing:.02em;cursor:pointer;border:none;text-decoration:none;
  transition:opacity .18s
}
.pyvo-cta:hover{opacity:.82}

/* CTA 화살표 */
.pyvo-arrow{
  display:inline-block;width:22px;height:2px;background:#ffffff;
  position:relative;flex-shrink:0
}
.pyvo-arrow::after{
  content:'';position:absolute;right:-1px;top:-4px;
  width:10px;height:10px;border-top:2px solid #ffffff;border-right:2px solid #ffffff;
  transform:rotate(45deg)
}
`,
  render: (d, { esc, richSafe }) => {
    const hasLeft  = typeof d.imageLeft  === 'string' && /^(https?:\/\/|data:|\/)/.test(d.imageLeft.trim())
    const hasRight = typeof d.imageRight === 'string' && /^(https?:\/\/|data:|\/)/.test(d.imageRight.trim())
    const hasAnyImg = hasLeft || hasRight

    const tilesHtml = d.tiles
      .map(
        (t) =>
          `<span class="pyvo-tile" style="background:${esc(t.bg)};color:${esc(t.color)}">${esc(t.char)}</span>`,
      )
      .join('')

    const ctaTag = d.ctaUrl
      ? `<a class="pyvo-cta" href="${esc(d.ctaUrl)}">`
      : `<button class="pyvo-cta" type="button">`
    const ctaClose = d.ctaUrl ? `</a>` : `</button>`

    return `
<section class="pyvo">
  <div class="pyvo-split${hasAnyImg ? '' : ' pyvo-no-img'}">
    ${media(d.imageLeft,  'pyvo-split-img', '상품 이미지 1')}
    ${media(d.imageRight, 'pyvo-split-img', '상품 이미지 2')}
  </div>
  <div class="pyvo-body">
    <div class="pyvo-tiles">${tilesHtml}</div>
    <h2 class="pyvo-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="pyvo-sub">${esc(d.subtitle)}</p>` : ''}
    ${ctaTag}
      <span>${esc(d.ctaText)}</span>
      <span class="pyvo-arrow" aria-hidden="true"></span>
    ${ctaClose}
  </div>
</section>`
  },
})
