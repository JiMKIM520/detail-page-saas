/** FEATURE 아키타입: feature-quote-pill-stack
 *  출처: 086_문제해결_02 — 상단 브랜드 그린 배경 + 인용부호 + 2줄 대형 헤드라인 + 대형 라운드 제품 사진 +
 *  하단 연녹 배경 텍스트 영역(소제목·부제 + 너비가 다른 두 개의 그린 필 텍스트 pill 강조).
 *  핵심 장치: 두 pill의 폭 차이(전체 폭 → 약 75% 폭)가 폭포처럼 흘러 키워드 계층을 만든다. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 인용부호 뒤 상단 헤드라인 첫 줄 (em,br) */
  headLine1: z.string().min(1),
  /** 상단 헤드라인 둘째 줄 (em,br) */
  headLine2: z.string().min(1),
  /** 제품 사진 URL */
  image: z.string().optional(),
  /** 하단 섹션 소제목 (em,br) */
  subTitle: z.string().min(1),
  /** 하단 섹션 부제 (순수 텍스트) */
  bodyText: z.string().optional(),
  /** 첫 번째(전체 너비) pill 텍스트 */
  pill1: z.string().min(1),
  /** 두 번째(좁은) pill 텍스트 */
  pill2: z.string().min(1),
})
type Data = z.infer<typeof schema>

export const featureQuotePillStack = defineBlock<Data>({
  id: 'feature-quote-pill-stack',
  archetype: 'feature',
  styleTags: ['light', 'food', 'health', 'editorial', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '문제 해결 강조 블록. 상단 브랜드 그린 배경에 인용부호 SVG + 2줄 대형 흰색 헤드라인, 중앙 대형 라운드 제품 사진(이미지 없어도 붕괴 안 함), 하단 연녹 배경에 소제목·부제 + 너비가 다른 두 개의 그린 채워진 텍스트 pill로 핵심 키워드를 계층적으로 강조.',
  schema,
  css: `
.ftkq{background:var(--bg);overflow:hidden}

/* ── 상단 그린 배경 영역 ── */
.ftkq-top{
  background:var(--accent,#158044);
  padding:44px var(--pad-x,56px) 0;
  text-align:center;
  position:relative
}
/* 인용부호 — 인라인 SVG로 벡터 렌더 */
.ftkq-quote{
  display:block;
  width:48px;
  height:33px;
  margin:0 auto 18px;
  color:#ffffff;
  opacity:.85
}
/* 헤드라인 밑줄 구분선 */
.ftkq-headline-wrap{position:relative;display:inline-block;width:100%}
.ftkq-headline-wrap::after{
  content:'';
  display:block;
  width:calc(100% - 80px);
  height:2px;
  background:rgba(255,255,255,.35);
  margin:18px auto 0
}
.ftkq-h1,.ftkq-h2{
  font-family:var(--font-display);
  font-weight:600;
  font-size:clamp(40px,5.5vw,70px);
  line-height:1.18;
  color:#ffffff;
  letter-spacing:-.01em
}
/* 다크 배경 위 em 오버라이드 */
.ftkq .ftkq-top .em{color:var(--em-dark,#FFF7EA)}

/* ── 제품 사진 ── */
.ftkq-img-wrap{
  background:var(--accent,#158044);
  padding:28px var(--pad-x,56px) 0;
  display:flex;
  justify-content:center
}
.ftkq-photo{
  width:100%;
  max-width:760px;
  aspect-ratio:760/800;
  object-fit:cover;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*80px));
  display:block
}
/* noimg-safe: 사진 없을 때 img-wrap 자체를 숨겨 배경이 툭 튀어나오지 않게 */
.ftkq-img-wrap:has(.ph){display:none}

/* ── 하단 연녹 배경 텍스트 영역 ── */
.ftkq-bottom{
  background:#e9f2ea;
  padding:44px var(--pad-x,56px) 56px;
  text-align:center
}
.ftkq-subtitle{
  font-family:var(--font-display);
  font-weight:700;
  font-size:clamp(28px,4vw,60px);
  line-height:1.2;
  color:var(--accent,#158044)
}
.ftkq-body{
  margin-top:14px;
  font-size:clamp(15px,2vw,40px);
  font-weight:400;
  color:var(--accent,#158044);
  line-height:1.6
}
/* 구분 선 */
.ftkq-divider{
  width:60px;
  height:2px;
  background:var(--accent,#158044);
  opacity:.4;
  margin:22px auto
}
/* pill 컨테이너 */
.ftkq-pills{
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:10px
}
/* pill 공통 */
.ftkq-pill{
  display:block;
  background:var(--accent,#158044);
  color:#ffffff;
  font-family:var(--font-display);
  font-weight:600;
  font-size:clamp(22px,3.5vw,60px);
  line-height:1;
  padding:.38em .6em;
  border-radius:calc(var(--r-scale,1)*10px);
  text-align:center;
  word-break:keep-all
}
/* 첫 pill: 전체 너비 */
.ftkq-pill-wide{width:100%;max-width:612px}
/* 둘째 pill: 약 75% — 폭포 계층 효과 */
.ftkq-pill-narrow{width:75%;max-width:458px}
`,
  render: (d, { esc, richSafe }) => {
    const imgBlock = `
<div class="ftkq-img-wrap">
  ${media(d.image, 'ftkq-photo', '제품 사진')}
</div>`

    return `
<section class="ftkq">
  <div class="ftkq-top">
    <svg class="ftkq-quote" viewBox="0 0 48 33" fill="currentColor" aria-hidden="true">
      <path d="M0 33V19.8C0 8.53 6.4 2.13 19.2 0l2.4 3.6C14.93 5.07 11.2 8.27 10.4 13.2H19.2V33H0zm28.8 0V19.8C28.8 8.53 35.2 2.13 48 0l2.4 3.6C43.73 5.07 40 8.27 39.2 13.2H48V33H28.8z"/>
    </svg>
    <div class="ftkq-headline-wrap">
      <p class="ftkq-h1">${richSafe(d.headLine1)}</p>
      <p class="ftkq-h2">${richSafe(d.headLine2)}</p>
    </div>
  </div>
  ${imgBlock}
  <div class="ftkq-bottom">
    <p class="ftkq-subtitle">${richSafe(d.subTitle)}</p>
    ${d.bodyText ? `<p class="ftkq-body">${esc(d.bodyText)}</p>` : ''}
    <div class="ftkq-divider"></div>
    <div class="ftkq-pills">
      <span class="ftkq-pill ftkq-pill-wide">${esc(d.pill1)}</span>
      <span class="ftkq-pill ftkq-pill-narrow">${esc(d.pill2)}</span>
    </div>
  </div>
</section>`
  },
})
