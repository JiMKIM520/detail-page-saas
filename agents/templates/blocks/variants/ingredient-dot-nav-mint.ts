/** INGREDIENT 아키타입: ingredient-dot-nav-mint
 *  출처: 052_포인트_구성_페이지_20 (민트 배경, 성분 키워드 dot+수평선 태그 내비, 라이트 이탤릭 대형 헤드라인, 우측 이미지 오버랩, 하단 클로징).
 *  핵심 장치: 성분 키워드를 ellipse 닷과 수평 실선으로 연결한 태그 라인 내비게이션.
 *  noimg-safe: 이미지 부재 시 우측 컬럼이 민트 틴트 배경 패널로 자동 강등(레이아웃 붕괴 없음). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const tagSchema = z.object({
  keyword: z.string().min(1), // 성분 키워드 라벨 (영문/한글)
})

const schema = z.object({
  productName: z.string().min(1),       // 상단 영문·브랜드 제품명 (esc)
  productDesc: z.string().optional(),   // 제품 설명 1~2줄 (esc)
  tags: z.array(tagSchema).min(2).max(5), // dot-nav 성분 태그 (2~5개)
  subHeadline: z.string().min(1),       // 헤드라인 위 서브 텍스트 (esc, light)
  headline: z.string().min(1),          // 라이트 이탤릭 대형 헤드라인 (em, br)
  badge: z.string().optional(),         // 하이라이트 배지 텍스트 (esc, optional)
  image: z.string().optional(),         // 제품 사진 (url)
  closing: z.string().optional(),       // 하단 클로징 문구 (em, br)
})

type Data = z.infer<typeof schema>

export const ingredientDotNavMint = defineBlock<Data>({
  id: 'ingredient-dot-nav-mint',
  archetype: 'ingredient',
  styleTags: ['light', 'editorial', 'beauty', 'ingredient', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '민트 배경 성분 소개. 상단 영문 제품명 + 성분 키워드를 ellipse 닷·수평선으로 연결한 태그 내비게이션 + 라이트 이탤릭 대형 헤드라인(좌) + 제품 이미지(우) + 하이라이트 배지 + 하단 클로징 문구. 이미지 부재 시 민트 패널 강등(noimg-safe).',
  schema,
  css: `
/* ── iqig: ingredient-dot-nav-mint ─────────────────────────────── */
.iqig{
  position:relative;
  background:var(--bg);
  color:var(--ink);
  padding:52px 0 0;
  overflow:hidden;
}

/* 상단 제품명 + 설명 */
.iqig-top{
  padding:0 var(--pad-x,56px) 32px;
}
.iqig-product-name{
  font-family:var(--font-display);
  font-weight:600;
  font-size:22px;
  letter-spacing:.01em;
  color:var(--ink);
  line-height:1.3;
}
.iqig-product-desc{
  margin-top:8px;
  font-size:15px;
  font-weight:400;
  color:var(--ink-2);
  line-height:1.65;
  max-width:560px;
}

/* dot-nav 태그 라인 ──────────────────────────────────────────────
   전체 너비 실선 + 그 위 등간격 ellipse 닷 + 닷 아래 이탤릭 라벨 */
.iqig-nav{
  position:relative;
  padding:0 var(--pad-x,56px);
  margin-bottom:44px;
}
.iqig-nav-line{
  position:absolute;
  top:8px; /* 닷 중심 정렬 */
  left:0;
  right:0;
  height:2px;
  background:var(--ink);
}
.iqig-nav-dots{
  position:relative;
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
}
.iqig-nav-item{
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:10px;
}
.iqig-dot{
  width:16px;
  height:16px;
  border-radius:50%;
  background:var(--ink);
  flex-shrink:0;
}
.iqig-tag-label{
  font-family:var(--font-lat);
  font-style:italic;
  font-weight:300;
  font-size:16px;
  color:var(--ink);
  white-space:nowrap;
}

/* 바디: 좌(카피) + 우(이미지) ────────────────────────────────── */
.iqig-body{
  display:flex;
  align-items:flex-start;
  padding:0 var(--pad-x,56px) 52px;
  gap:0;
  position:relative;
}
.iqig-copy{
  flex:0 0 52%;
  padding-right:24px;
}
.iqig-sub{
  font-family:var(--font-display);
  font-weight:300;
  font-size:28px;
  line-height:1.3;
  color:var(--ink);
  letter-spacing:-.01em;
  margin-bottom:16px;
}
.iqig-headline{
  font-family:var(--font-display);
  font-weight:300;
  font-style:italic;
  font-size:clamp(52px, 8vw, 72px);
  line-height:1.12;
  color:var(--ink);
  letter-spacing:-.02em;
  word-break:keep-all;
}
.iqig-headline .em{
  color:var(--accent-d);
}
.iqig-badge{
  display:inline-block;
  margin-top:28px;
  background:var(--accent);
  color:var(--ink);
  font-weight:700;
  font-size:16px;
  padding:14px 26px;
  border-radius:calc(var(--r-scale,1)*8px);
  line-height:1.3;
  letter-spacing:.02em;
}

/* 이미지 컬럼 ─────────────────────────────────────────────────── */
.iqig-img-col{
  flex:0 0 48%;
  position:relative;
  min-height:280px;
}
/* 이미지 있을 때: 오버플로우 블리드 */
.iqig-photo{
  width:110%;
  aspect-ratio:4/3.2;
  object-fit:cover;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*18px) 0 0 calc(var(--r-scale,1)*18px));
  display:block;
}
/* noimg-safe 강등: .ph일 때 민트 틴트 패널로 채움 */
.iqig-img-col .ph{
  display:block!important;
  width:100%;
  height:100%;
  min-height:280px;
  border-radius:calc(var(--r-scale,1)*18px);
  background:color-mix(in srgb, var(--accent) 22%, var(--bg));
}

/* 하단 클로징 ─────────────────────────────────────────────────── */
.iqig-closing{
  background:var(--bg);
  border-top:2px solid var(--line);
  padding:36px var(--pad-x,56px) 48px;
}
.iqig-closing-text{
  font-family:var(--font-display);
  font-weight:300;
  font-size:clamp(24px, 4vw, 36px);
  line-height:1.45;
  color:var(--accent-d);
  letter-spacing:-.01em;
  word-break:keep-all;
}
.iqig-closing-text .em{
  color:var(--ink);
  font-weight:600;
}
`,
  render: (d, { esc, richSafe }) => {
    // dot-nav: 태그 2~5개를 flex justify-between으로 균등 배치
    const navItems = d.tags
      .map(
        (t) => `
      <div class="iqig-nav-item">
        <span class="iqig-dot"></span>
        <span class="iqig-tag-label">${esc(t.keyword)}</span>
      </div>`,
      )
      .join('')

    return `
<section class="iqig">

  <div class="iqig-top">
    <p class="iqig-product-name">${esc(d.productName)}</p>
    ${d.productDesc ? `<p class="iqig-product-desc">${esc(d.productDesc)}</p>` : ''}
  </div>

  <div class="iqig-nav">
    <div class="iqig-nav-line"></div>
    <div class="iqig-nav-dots">${navItems}
    </div>
  </div>

  <div class="iqig-body">
    <div class="iqig-copy">
      <p class="iqig-sub">${esc(d.subHeadline)}</p>
      <h2 class="iqig-headline">${richSafe(d.headline)}</h2>
      ${d.badge ? `<span class="iqig-badge">${esc(d.badge)}</span>` : ''}
    </div>
    <div class="iqig-img-col">
      ${media(d.image, 'iqig-photo', '성분 제품 이미지')}
    </div>
  </div>

  ${
    d.closing
      ? `<div class="iqig-closing">
    <p class="iqig-closing-text">${richSafe(d.closing)}</p>
  </div>`
      : ''
  }

</section>`
  },
})
