/** LINEUP 아키타입: lineup-gradient-gallery
 *  피그마 042_포인트_구성_페이지_3 흡수.
 *  다크 배경 + 브랜드명 초대형 타이포 + 할인 서브카피 +
 *  그라디언트 라운드 카드 6개(2행×3열) 수평 스크롤 갤러리.
 *  각 카드: 카테고리 라벨 + 링크 라벨 + 제품 이미지 + NEXT 버튼.
 *  noimg-safe: 이미지 전무 시 이미지 슬롯 생략, 라벨+버튼만 렌더. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

// ── 카드 스키마 ───────────────────────────────────────────────
const cardSchema = z.object({
  label: z.string().min(1),            // 카드 왼쪽 상단 카테고리 라벨
  linkLabel: z.string().min(1).optional(), // 카드 오른쪽 상단 링크 텍스트 (기본: "전체보기")
  image: z.string().optional(),        // 제품 이미지 URL
  nextLabel: z.string().min(1).optional(), // NEXT 버튼 텍스트 (기본: "NEXT")
  gradientFrom: z.string().optional(), // CSS 색 (기본 토큰 --accent)
  gradientTo: z.string().optional(),   // CSS 색 (기본 토큰 --brand)
})

// ── 변형 전체 스키마 ─────────────────────────────────────────
const schema = z.object({
  headline: z.string().min(1),         // 초대형 브랜드명/헤드라인 (em,br)
  sub: z.string().optional(),          // 할인/이벤트 서브카피 (순수 텍스트)
  cards: z.array(cardSchema).min(2).max(6),
})
type Data = z.infer<typeof schema>

export const lineupGradientGallery = defineBlock<Data>({
  id: 'lineup-gradient-gallery',
  archetype: 'lineup',
  styleTags: ['dark', 'editorial', 'gallery', 'noimg-safe'],
  imageSlots: 6,
  describe:
    '다크 배경 + 초대형 브랜드명 타이포 + 할인 서브카피 + 그라디언트 라운드 카드 2행×3열 수평 스크롤 갤러리. 패션/뷰티/식품 전 카테고리 쇼케이스에 적합. 이미지 없어도 라벨+버튼으로 강등 렌더.',
  schema,
  css: `
/* ── lineup-gradient-gallery (lgg) ── */
.lgg{background:var(--brand,#252525);color:var(--ink,#fff);padding:56px 0 72px}
.lgg .em{color:var(--em-dark,#FFF7EA)}
.lgg-head{padding:0 var(--pad-x,56px) 40px}
.lgg-headline{
  font-family:var(--font-display,'Inter',sans-serif);
  font-weight:800;
  font-size:clamp(56px,10vw,120px);
  line-height:1.0;
  letter-spacing:-.03em;
  color:#fff
}
.lgg-sub{
  margin-top:14px;
  font-family:var(--font-body,'Inter',sans-serif);
  font-size:clamp(18px,3vw,45px);
  font-weight:400;
  color:rgba(255,255,255,.85)
}
/* ── 갤러리 그리드 ── */
.lgg-gallery{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  grid-template-rows:repeat(2,auto);
  gap:16px;
  padding:0 var(--pad-x,56px);
  overflow-x:auto;
  min-width:0
}
@media(max-width:600px){
  .lgg-gallery{
    grid-template-columns:repeat(3,260px);
    padding:0 var(--pad-x,28px);
    scrollbar-width:none
  }
  .lgg-gallery::-webkit-scrollbar{display:none}
}
/* ── 카드 ── */
.lgg-card{
  position:relative;
  display:flex;
  flex-direction:column;
  border-radius:calc(var(--r-scale,1)*24px);
  overflow:hidden;
  background:linear-gradient(
    145deg,
    var(--lgg-gfrom,var(--accent,#ff8a05)),
    var(--lgg-gto,var(--accent-d,#c45c00))
  );
  padding:18px 18px 20px;
  min-height:320px
}
.lgg-card-top{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap:8px
}
.lgg-card-label{
  font-family:var(--font-body,'Inter',sans-serif);
  font-size:14px;
  font-weight:600;
  color:var(--accent,#ff8a05);
  line-height:1.3;
  word-break:keep-all
}
.lgg-card-link{
  font-family:var(--font-body,'Inter',sans-serif);
  font-size:13px;
  font-weight:400;
  color:var(--accent,#ff8a05);
  white-space:nowrap;
  flex-shrink:0
}
/* ── 이미지 프레임 ── */
.lgg-img-wrap{
  flex:1;
  display:flex;
  align-items:center;
  justify-content:center;
  margin:14px 0 12px;
  min-height:120px
}
.lgg-img-wrap img,.lgg-img-wrap .ph{
  width:var(--shape-photo,70%);
  max-height:240px;
  object-fit:contain;
  display:block;
  margin:0 auto
}
/* ── 이미지 없는 강등 ── */
.lgg-card--noimg{
  min-height:140px;
  justify-content:space-between
}
.lgg-card--noimg .lgg-img-wrap{display:none}
/* ── NEXT 버튼 ── */
.lgg-card-next{
  display:inline-block;
  margin-top:auto;
  font-family:var(--font-body,'Inter',sans-serif);
  font-size:14px;
  font-weight:600;
  color:var(--accent,#ff8a05);
  letter-spacing:.03em
}
`,
  render: (d, { esc, richSafe }) => {
    // noimg-safe: 카드 전체에 이미지가 하나도 없으면 이미지 슬롯을 숨기고 라벨+버튼만 렌더
    const withImgs = d.cards.some((c) => typeof c.image === 'string' && c.image.length > 0)

    const cardHtml = d.cards
      .map((c, i) => {
        const gFrom = c.gradientFrom ?? ''
        const gTo = c.gradientTo ?? ''
        const styleAttr =
          gFrom || gTo
            ? ` style="${gFrom ? `--lgg-gfrom:${gFrom};` : ''}${gTo ? `--lgg-gto:${gTo};` : ''}"`
            : ''
        const hasImg = typeof c.image === 'string' && c.image.length > 0
        const cardClass = `lgg-card${!withImgs ? ' lgg-card--noimg' : ''}`

        return `<div class="${cardClass}"${styleAttr}>
  <div class="lgg-card-top">
    <span class="lgg-card-label">${esc(c.label)}</span>
    ${c.linkLabel ? `<span class="lgg-card-link">${esc(c.linkLabel)}</span>` : ''}
  </div>
  ${
    withImgs
      ? `<div class="lgg-img-wrap">${
          hasImg
            ? media(c.image, '', `${c.label} 제품 이미지`)
            : '<span class="ph" aria-hidden="true"></span>'
        }</div>`
      : ''
  }
  <span class="lgg-card-next">${esc(c.nextLabel ?? 'NEXT')}</span>
</div>`
      })
      .join('\n')

    return `<section class="lgg">
  <div class="lgg-head">
    <h2 class="lgg-headline">${richSafe(d.headline)}</h2>
    ${d.sub ? `<p class="lgg-sub">${esc(d.sub)}</p>` : ''}
  </div>
  <div class="lgg-gallery" role="list">
    ${cardHtml}
  </div>
</section>`
  },
})
