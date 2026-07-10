/** CERT 아키타입: cert-badge-triptych
 *  013_pc_전환10 구조 흡수.
 *  좌측 전체 이미지 패널 + 중앙 세리프 2줄 타이틀 + 흰색 라운드 카드 3열 인증 배지 행
 *  + 우측 제품 이미지 오버랩. 신뢰 배지 트리플 레이아웃.
 *  noimg-safe: 좌측/우측 이미지 없을 때 베이지 색면으로 강등 렌더. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  title: z.string().min(1),       // 2줄 가능 (br 허용). em 사용 가능. richSafe
  titleSub: z.string().optional(), // 타이틀 바로 아래 보조 한 줄 (순수 텍스트)
  badges: z
    .array(
      z.object({
        image: z.string().optional(), // 인증마크 이미지 (url) — 없으면 텍스트 배지로 강등
        label: z.string().min(1),     // 인증명 (예: "무농약 인증", "HACCP", "유기농 인증")
      }),
    )
    .min(2)
    .max(5),
  leftImage: z.string().optional(),   // 좌측 전면 사진 패널 (url)
  productImage: z.string().optional(), // 우측 제품 누끼/이미지 오버랩 (url)
  bgColor: z.string().optional(),      // 섹션 배경색 — 기본 var(--bg)
})
type Data = z.infer<typeof schema>

export const certBadgeTriptych = defineBlock<Data>({
  id: 'cert-badge-triptych',
  archetype: 'cert',
  styleTags: ['light', 'warm', 'food', 'editorial', 'trust', 'noimg-safe'],
  imageSlots: 3,
  describe:
    '인증 배지 트리플 레이아웃. 좌측 전면 이미지 패널 + 중앙 세리프 2줄 타이틀 + 흰색 라운드 카드 2~5열 인증마크 배지 행 + 우측 제품 이미지 오버랩. 식품/농산물/뷰티의 원산지·품질·인증 신뢰 섹션에 최적.',
  schema,
  css: `
/* crby — cert-badge-triptych */
.crby{
  position:relative;
  display:flex;
  align-items:stretch;
  min-height:360px;
  height:auto;
  overflow:hidden;
  background:var(--bg);
  padding:0;
}
/* 좌측 이미지 패널 */
.crby-left{
  flex:0 0 26%;
  width:26%;
  position:relative;
  overflow:hidden;
  background:color-mix(in srgb,var(--accent) 12%,var(--bg));
}
.crby-left img,.crby-left .ph{
  width:100%;
  height:100%;
  object-fit:cover;
  object-position:center;
  display:block;
}
.crby-left.no-img{
  background:color-mix(in srgb,var(--accent) 15%,var(--paper,#fff));
}
/* 중앙 콘텐츠 */
.crby-center{
  flex:1;
  display:flex;
  flex-direction:column;
  justify-content:center;
  padding:44px var(--pad-x,56px) 40px;
  z-index:1;
}
.crby-title{
  font-family:var(--font-serif,var(--font-display));
  font-weight:700;
  font-size:clamp(26px,3.2vw,46px);
  color:var(--ink);
  line-height:1.25;
  text-align:center;
  letter-spacing:-.01em;
}
.crby-title .em{
  color:var(--accent-d,var(--accent));
}
.crby-title-sub{
  margin-top:8px;
  text-align:center;
  font-size:15px;
  font-family:var(--font-body);
  color:var(--ink-2);
  font-weight:500;
}
/* 인증 배지 행 */
.crby-badges{
  display:flex;
  flex-wrap:wrap;
  justify-content:center;
  gap:12px;
  margin-top:24px;
}
.crby-badge{
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:7px;
  width:148px;
  min-height:136px;
  background:var(--paper,#fff);
  border-radius:calc(var(--r-scale,1)*10px);
  box-shadow:0 2px 14px -4px rgba(0,0,0,.13);
  padding:12px 10px 14px;
  position:relative;
}
.crby-badge-img{
  width:120px;
  height:112px;
  object-fit:contain;
  display:block;
  border-radius:calc(var(--r-scale,1)*6px);
}
.crby-badge-img.ph{
  width:120px;
  height:112px;
  background:color-mix(in srgb,var(--accent) 10%,var(--paper,#fff));
  border-radius:calc(var(--r-scale,1)*6px);
  display:flex;
  align-items:center;
  justify-content:center;
}
/* 이미지 없을 때 텍스트 배지 */
.crby-badge.text-mode{
  min-height:80px;
  gap:0;
}
.crby-badge-label{
  font-size:12px;
  font-family:var(--font-body);
  font-weight:700;
  color:var(--ink-2);
  text-align:center;
  line-height:1.35;
  word-break:keep-all;
}
.crby-badge.text-mode .crby-badge-label{
  font-size:14px;
  color:var(--ink);
}
/* 우측 제품 이미지 오버랩 */
.crby-product{
  position:absolute;
  right:0;
  top:0;
  bottom:0;
  width:32%;
  height:100%;
  pointer-events:none;
  z-index:2;
  display:flex;
  align-items:flex-end;
  justify-content:flex-end;
  overflow:hidden;
}
.crby-product img{
  width:100%;
  height:100%;
  object-fit:contain;
  object-position:right bottom;
  display:block;
}
/* noimg-safe: 제품 이미지 없으면 숨김 */
.crby-product.no-img{
  display:none;
}
/* 시그니처 사진 프레임 토큰 등록 (좌측 패널) */
.crby-left{border-radius:var(--shape-photo, 0px);}
`,
  render: (d, { esc, richSafe }) => {
    const hasLeft = typeof d.leftImage === 'string' && d.leftImage.length > 0
    const hasProduct = typeof d.productImage === 'string' && d.productImage.length > 0

    // 배지: 이미지가 하나라도 있으면 이미지 모드 — 전무 시 텍스트 배지로 강등
    const anyBadgeImg = d.badges.some((b) => typeof b.image === 'string' && b.image.length > 0)

    const badgeHtml = d.badges
      .map((b) => {
        const hasImg = typeof b.image === 'string' && b.image.length > 0
        if (anyBadgeImg) {
          // 이미지 모드: 이미지 있으면 렌더, 없으면 ph 플레이스홀더
          return `<div class="crby-badge">
  ${hasImg ? `<img class="crby-badge-img" src="${esc(b.image)}" alt="${esc(b.label)}" loading="lazy">` : `<div class="crby-badge-img ph" aria-hidden="true"></div>`}
  <span class="crby-badge-label">${esc(b.label)}</span>
</div>`
        } else {
          // 텍스트 배지 강등
          return `<div class="crby-badge text-mode">
  <span class="crby-badge-label">${esc(b.label)}</span>
</div>`
        }
      })
      .join('\n')

    return `<section class="crby"${d.bgColor ? ` style="background:${esc(d.bgColor)}"` : ''}>
  <div class="crby-left${hasLeft ? '' : ' no-img'}">
    ${hasLeft ? media(d.leftImage, '', '품질 인증 사진') : ''}
  </div>
  <div class="crby-center">
    <h2 class="crby-title">${richSafe(d.title)}</h2>
    ${d.titleSub ? `<p class="crby-title-sub">${esc(d.titleSub)}</p>` : ''}
    <div class="crby-badges">
      ${badgeHtml}
    </div>
  </div>
  <div class="crby-product${hasProduct ? '' : ' no-img'}" aria-hidden="true">
    ${hasProduct ? `<img src="${esc(d.productImage)}" alt="">` : ''}
  </div>
</section>`
  },
})
