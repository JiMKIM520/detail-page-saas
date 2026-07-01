/** HERO 아키타입(템플릿 충실 재현): hero-photo-quote.
 *  와디즈 200섹션 11_인트로_사진중심 (frame 1284:1801) 패턴 재구성.
 *  전체 배경 사진 위에 서브카테고리 라인 + 제품명 대형 오버레이 →
 *  하단 accent 컬러 패널에 대형 따옴표 + 하이라이트 박스 인용구 + 스토리텔링 3줄 카피.
 *  다른 히어로 변형과 차별화: 풀배경 사진 + 하단 quote 박스 패널 구조.
 *  hero-photo(WHY 패널) / hero-photo-fullbg(스토리 카피)와 겹치지 않는 인용구 히어로. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  subcategory: z.string().min(1).optional(),   // 서브카테고리 한 줄 (수평선 사이, 예: "서브카피 한줄을 써주세요")
  productName: z.string().min(1),              // 제품명 대형 헤드라인 (em,br 허용)
  heroImage: z.string().optional(),            // 전체 배경 제품 사진 (url)
  quote: z.string().min(1),                    // 따옴표 박스 인용구 (em,br 허용)
  stories: z                                   // 하단 스토리텔링 라인 (2~4줄)
    .array(z.string().min(1))
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

export const heroPhotoQuote = defineBlock<Data>({
  id: 'hero-photo-quote',
  archetype: 'hero',
  styleTags: ['premium', 'editorial', 'photo', 'template', 'quote', 'colorblock'],
  imageSlots: 1,
  describe:
    '전체 배경 사진 + 인용구 히어로. 사진이 배경 전체를 커버하고 상단에 수평선 서브카테고리 + 대형 제품명 오버레이, 하단 accent 패널에 대형 따옴표·하이라이트 박스 인용구 + 스토리텔링 카피 반복 라인. 인용구 중심 브랜드 스토리에 적합.',
  schema,
  css: `
/* ── hpq = hero-photo-quote 접두사 ── */
.hpq{
  background:var(--ink);
  overflow:hidden;
  display:flex;
  flex-direction:column;
}

/* ─ 사진 배경 존 ─ */
.hpq-photo{
  position:relative;
  width:100%;
  min-height:620px;
  flex:0 0 auto;
  overflow:hidden;
}

.hpq-bg{
  position:absolute;
  inset:0;
  width:100%;
  height:100%;
  object-fit:cover;
  display:block;
  z-index:0;
}

/* 하단 그라데이션 — 텍스트 가독성 */
.hpq-photo::after{
  content:"";
  position:absolute;
  inset:0;
  background:linear-gradient(
    180deg,
    rgba(0,0,0,.10) 0%,
    rgba(0,0,0,.04) 30%,
    rgba(0,0,0,.42) 80%,
    rgba(0,0,0,.62) 100%
  );
  z-index:1;
  pointer-events:none;
}

/* 사진 위 콘텐츠 */
.hpq-photo-inner{
  position:relative;
  z-index:2;
  padding:54px 52px 60px;
  min-height:620px;
  display:flex;
  flex-direction:column;
  justify-content:flex-start;
}

/* 서브카테고리: 수평선 + 텍스트 */
.hpq-sub-row{
  display:flex;
  align-items:center;
  gap:14px;
  margin-bottom:28px;
}

.hpq-sub-line{
  flex:1;
  height:1px;
  background:rgba(255,255,255,.55);
}

.hpq-sub{
  font-family:var(--font-body);
  font-size:14px;
  font-weight:500;
  letter-spacing:.06em;
  color:rgba(255,255,255,.88);
  white-space:nowrap;
}

/* 제품명 대형 헤드라인 */
.hpq-product{
  font-family:var(--font-display);
  font-weight:800;
  font-size:72px;
  letter-spacing:-.02em;
  line-height:1.08;
  color:#fff;
  text-shadow:0 2px 18px rgba(0,0,0,.22);
}

.hpq-product .em{
  color:var(--accent);
}

/* ─ 전환 꺾쇠 (accent 패널 위) ─ */
.hpq-caret{
  width:100%;
  height:36px;
  background:var(--accent);
  position:relative;
  flex:0 0 auto;
}

.hpq-caret::before{
  content:"";
  position:absolute;
  top:-34px;
  left:50%;
  transform:translateX(-50%);
  border-left:28px solid transparent;
  border-right:28px solid transparent;
  border-bottom:36px solid var(--accent);
}

/* ─ 하단 accent 패널 ─ */
.hpq-panel{
  background:var(--accent);
  padding:0 52px 64px;
  flex:0 0 auto;
}

/* 대형 따옴표 + 박스 인용구 */
.hpq-quote-wrap{
  position:relative;
  margin-bottom:36px;
}

.hpq-qq-open{
  font-family:var(--font-display);
  font-size:56px;
  line-height:1;
  color:rgba(255,255,255,.85);
  position:absolute;
  left:-8px;
  top:-14px;
}

.hpq-qq-close{
  font-family:var(--font-display);
  font-size:56px;
  line-height:1;
  color:rgba(255,255,255,.85);
  position:absolute;
  right:-8px;
  bottom:-22px;
}

.hpq-quote-box{
  border:1.5px solid rgba(255,255,255,.6);
  border-radius:12px;
  padding:22px 36px 22px 32px;
  margin:0 12px;
}

.hpq-quote{
  font-family:var(--font-body);
  font-size:17px;
  font-weight:500;
  line-height:1.7;
  color:#fff;
  text-align:center;
}

.hpq-quote .em{
  font-weight:700;
  color:rgba(255,255,255,1);
}

/* 스토리 라인 목록 */
.hpq-stories{
  margin-top:48px;
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:10px;
}

.hpq-story-line{
  font-family:var(--font-body);
  font-size:16px;
  line-height:1.65;
  color:rgba(255,255,255,.88);
  text-align:center;
}

.hpq-story-line .em{
  font-weight:700;
  color:#fff;
}
`,
  render: (d, { esc, richSafe }) => {
    const img = d.heroImage && d.heroImage.trim() ? d.heroImage : undefined
    return `
<section class="hpq">
  <!-- 사진 배경 존 -->
  <div class="hpq-photo">
    ${img
      ? media(img, 'hpq-bg', esc(d.productName))
      : `<div class="hpq-bg ph" style="position:absolute;inset:0;width:100%;height:100%">제품 배경 사진</div>`
    }
    <div class="hpq-photo-inner">
      <!-- 서브카테고리 (수평선 사이) -->
      ${d.subcategory ? `
      <div class="hpq-sub-row">
        <div class="hpq-sub-line"></div>
        <span class="hpq-sub">${esc(d.subcategory)}</span>
        <div class="hpq-sub-line"></div>
      </div>` : ''}
      <!-- 제품명 대형 헤드라인 -->
      <h1 class="hpq-product">${richSafe(d.productName)}</h1>
    </div>
  </div>

  <!-- 전환 꺾쇠 -->
  <div class="hpq-caret"></div>

  <!-- 하단 accent 패널 -->
  <div class="hpq-panel">
    <!-- 대형 따옴표 + 하이라이트 인용구 박스 -->
    <div class="hpq-quote-wrap">
      <span class="hpq-qq-open">&ldquo;</span>
      <div class="hpq-quote-box">
        <p class="hpq-quote">${richSafe(d.quote)}</p>
      </div>
      <span class="hpq-qq-close">&rdquo;</span>
    </div>

    <!-- 스토리텔링 라인 -->
    <div class="hpq-stories">
      ${d.stories.map(s => `<p class="hpq-story-line">${richSafe(s)}</p>`).join('\n      ')}
    </div>
  </div>
</section>`
  },
})
