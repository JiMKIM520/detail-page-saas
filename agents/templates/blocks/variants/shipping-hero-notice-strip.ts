/** CS 아키타입: shipping-hero-notice-strip.
 *  [끝판왕] CS 구성 #14 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 다크(--brand/--ink) 배경 + 얇은 eyebrow 라벨 + 대형 2행 헤드라인(2행은 danger accent)
 *           + 우측 3D/일러스트 이미지 → 하단 코랄/포인트 컬러 공지 스트립(불릿 리스트).
 *  배송 마감·당일배송 강조 히어로 + 유의사항 공지를 한 블록으로 처리. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 상단 작은 eyebrow 텍스트 (예: "Today Delivery") */
  eyebrow: z.string().min(1),
  /** 첫 번째 헤드라인 행 — 흰 대형 텍스트 (em 허용) */
  headlineTop: z.string().min(1),
  /** 두 번째 헤드라인 행 — danger 강조색 대형 텍스트 (em 허용) */
  headlineBottom: z.string().min(1),
  /** 우측 배송/일러스트 이미지 URL (3D 트럭, 선물박스 등) */
  heroImage: z.string().optional(),
  /** 이미지 alt */
  heroImageAlt: z.string().optional(),
  /** 하단 공지 스트립 불릿 항목 (2~5개) */
  notices: z
    .array(z.string().min(1))
    .min(2)
    .max(5),
})
type Data = z.infer<typeof schema>

export const shippingHeroNoticeStrip = defineBlock<Data>({
  id: 'shipping-hero-notice-strip',
  archetype: 'shipping',
  styleTags: ['dark', 'hero', 'notice', 'cs', 'delivery', 'playful'],
  imageSlots: 1,
  describe:
    '배송 히어로 + 하단 공지 스트립. 다크 배경에 eyebrow + 2행 대형 헤드라인(하단행 danger 강조) + 우측 3D/일러스트 이미지, 하단에 코랄 띠 + 불릿 유의사항(2~5개). 당일배송·마감 강조 CS 섹션.',
  schema,
  css: `
/* shipping-hero-notice-strip — 접두사 shns- */

/* ── 히어로 영역 (다크 배경) ── */
.shns{
  background:var(--brand);
  overflow:hidden;
  position:relative;
}

.shns-hero{
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:36px 28px 32px 36px;
  min-height:200px;
  position:relative;
}

/* 텍스트 좌측 */
.shns-copy{
  flex:1 1 55%;
  min-width:0;
}

.shns-eyebrow{
  font-family:var(--font-body);
  font-size:13px;
  font-weight:400;
  letter-spacing:.12em;
  color:rgba(255,255,255,.72);
  margin-bottom:10px;
  display:block;
}

.shns-hl-top{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(34px,7.2vw,54px);
  line-height:1.12;
  letter-spacing:-.03em;
  color:#fff;
  display:block;
  margin-bottom:2px;
}
/* 다크 배경 — .em은 밝은 --accent로 override */
.shns-hl-top .em{color:var(--accent)}

.shns-hl-bottom{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(34px,7.2vw,54px);
  line-height:1.12;
  letter-spacing:-.03em;
  /* danger-red: 커머스 신호색, 시맨틱 하드코딩 허용 */
  color:#ff3b30;
  display:block;
}
.shns-hl-bottom .em{color:#fff}

/* 이미지 우측 */
.shns-img-wrap{
  flex:0 0 auto;
  width:clamp(140px,38%,200px);
  margin-left:12px;
}

.shns-img{
  width:100%;
  aspect-ratio:1/1;
  object-fit:contain;
  display:block;
}
.shns-img.ph{
  width:100%;
  aspect-ratio:1/1;
  border:2px dashed rgba(255,255,255,.25);
  background:rgba(255,255,255,.07);
  color:rgba(255,255,255,.4);
}

/* ── 하단 공지 스트립 ── */
.shns-strip{
  /* 코랄/살몬: 커머스 notice 신호색, 시맨틱 하드코딩 허용 */
  background:#e8736a;
  padding:20px 28px 20px 36px;
}

.shns-notices{
  list-style:none;
  margin:0;
  padding:0;
  display:flex;
  flex-direction:column;
  gap:7px;
}

.shns-notice-item{
  font-family:var(--font-body);
  font-size:14px;
  line-height:1.65;
  color:#fff;
  display:flex;
  align-items:flex-start;
  gap:8px;
}

.shns-bullet{
  flex-shrink:0;
  width:5px;
  height:5px;
  border-radius:50%;
  background:#fff;
  margin-top:8px;
}
`,
  render: (d, { esc, richSafe }) => {
    const noticesHtml = d.notices
      .map(
        (n) => `
    <li class="shns-notice-item">
      <span class="shns-bullet" aria-hidden="true"></span>
      <span>${esc(n)}</span>
    </li>`,
      )
      .join('')

    return `
<section class="shns">
  <div class="shns-hero">
    <div class="shns-copy">
      <span class="shns-eyebrow">${esc(d.eyebrow)}</span>
      <span class="shns-hl-top">${richSafe(d.headlineTop)}</span>
      <span class="shns-hl-bottom">${richSafe(d.headlineBottom)}</span>
    </div>
    <div class="shns-img-wrap">
      ${media(d.heroImage, 'shns-img', esc(d.heroImageAlt ?? '배송 이미지'))}
    </div>
  </div>
  <div class="shns-strip">
    <ul class="shns-notices">
      ${noticesHtml}
    </ul>
  </div>
</section>`
  },
})
