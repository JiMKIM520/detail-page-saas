/** HERO 아키타입(템플릿 충실 재현): hero-photo-fullbg.
 *  와디즈 200섹션 11_인트로_사진중심 (frame 1284:1771) 패턴 재구성.
 *  사진이 전체 배경 커버 → 상단에 제품명(대형) + 서브카테고리(소형 대문자) + 수평 구분선 →
 *  중앙 스토리 카피(타이포그래피 강조 허용) → 하단 브랜드 로고 텍스트.
 *  별도 컬러 존 없음 — 사진만 배경, 하단 페이드 그라데이션으로 텍스트 가독성 확보.
 *  다른 히어로 변형과 차별화: 2-존 컬러블록 없음, 하단 패널 없음, 순수 full-bleed 사진 한 장. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  productName: z.string().min(1),          // 제품명 대형 헤드라인 (사진 위 상단, em/br 허용)
  subcategory: z.string().min(1).optional(), // 서브카테고리 영문 소형 대문자 (예: "PERFUME DIFFUSER")
  story: z.string().min(1),                // 중앙 스토리 카피 (em,br 허용)
  brandLogo: z.string().optional(),        // 하단 브랜드 로고 텍스트
  heroImage: z.string().optional(),        // 전체 배경 제품 사진 (url)
})
type Data = z.infer<typeof schema>

export const heroPhotoFullbg = defineBlock<Data>({
  id: 'hero-photo-fullbg',
  archetype: 'hero',
  styleTags: ['premium', 'editorial', 'photo', 'template', 'fullbleed'],
  imageSlots: 1,
  describe:
    '풀배경 사진 히어로. 사진 한 장이 전체 배경 — 상단에 대형 제품명+서브카테고리+구분선, 중앙에 스토리 카피, 하단에 브랜드 로고. 별도 컬러 존 없음. 세로로 긴 인트로 섹션에 적합.',
  schema,
  css: `
/* ── hpfb = hero-photo-fullbg 접두사 ── */
.hpfb{
  position:relative;
  width:100%;
  min-height:860px;
  height:auto;
  overflow:hidden;
  background:var(--ink);
  display:flex;
  flex-direction:column;
}

/* ─ 배경 이미지 ─ */
.hpfb-bg{
  position:absolute;
  inset:0;
  width:100%;
  height:100%;
  object-fit:cover;
  display:block;
  z-index:0;
}

/* ─ 하단 그라데이션 오버레이 (텍스트 가독성) ─ */
.hpfb-grad{
  position:absolute;
  inset:0;
  background:linear-gradient(
    180deg,
    rgba(0,0,0,.08) 0%,
    rgba(0,0,0,.04) 35%,
    rgba(0,0,0,.55) 70%,
    rgba(0,0,0,.78) 100%
  );
  z-index:1;
  pointer-events:none;
}

/* ─ 콘텐츠 레이어 ─ */
.hpfb-content{
  position:relative;
  z-index:2;
  width:100%;
  min-height:860px;
  flex:1 1 auto;
  display:flex;
  flex-direction:column;
  justify-content:space-between;
  padding:60px 56px 64px;
}

/* ─ 상단 텍스트 존 ─ */
.hpfb-top{
  flex:0 0 auto;
}

.hpfb-product{
  font-family:var(--font-display);
  font-weight:800;
  font-size:96px;
  letter-spacing:-.02em;
  line-height:1.0;
  color:#fff;
  text-shadow:0 2px 20px rgba(0,0,0,.18);
  margin-bottom:18px;
}

.hpfb-product .em{
  color:var(--accent);
}

.hpfb-sub{
  font-family:var(--font-body);
  font-weight:700;
  font-size:14px;
  letter-spacing:.22em;
  text-transform:uppercase;
  color:rgba(255,255,255,.82);
  text-align:center;
  margin-bottom:20px;
}

.hpfb-rule{
  width:100%;
  height:1px;
  background:rgba(255,255,255,.35);
  margin:0 0 0 0;
}

/* ─ 중앙 스토리 카피 ─ */
.hpfb-mid{
  flex:1 1 auto;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:48px 0;
}

.hpfb-story{
  font-family:var(--font-body);
  font-size:22px;
  font-weight:400;
  line-height:1.7;
  letter-spacing:-.01em;
  color:rgba(255,255,255,.92);
  text-align:center;
  max-width:640px;
}

.hpfb-story .em{
  font-weight:700;
  color:#fff;
}

/* ─ 하단 브랜드 존 ─ */
.hpfb-bottom{
  flex:0 0 auto;
  display:flex;
  flex-direction:column;
  align-items:center;
}

.hpfb-brand{
  font-family:var(--font-display);
  font-weight:800;
  font-size:18px;
  letter-spacing:.18em;
  text-transform:uppercase;
  color:var(--accent);
  text-align:center;
}
`,
  render: (d, { esc, richSafe }) => {
    const img = d.heroImage && d.heroImage.trim() ? d.heroImage : undefined
    return `
<section class="hpfb">
  <!-- 배경 이미지 -->
  ${img
    ? media(img, 'hpfb-bg', esc(d.productName))
    : `<div class="hpfb-bg ph" style="position:absolute;inset:0;width:100%;height:100%">제품 배경 사진</div>`
  }

  <!-- 하단 그라데이션 -->
  <div class="hpfb-grad"></div>

  <!-- 콘텐츠 -->
  <div class="hpfb-content">
    <!-- 상단: 제품명 + 서브카테고리 + 구분선 -->
    <div class="hpfb-top">
      <h1 class="hpfb-product">${richSafe(d.productName)}</h1>
      ${d.subcategory ? `<p class="hpfb-sub">${esc(d.subcategory)}</p>` : ''}
      <hr class="hpfb-rule">
    </div>

    <!-- 중앙: 스토리 카피 -->
    <div class="hpfb-mid">
      <p class="hpfb-story">${richSafe(d.story)}</p>
    </div>

    <!-- 하단: 브랜드 로고 -->
    <div class="hpfb-bottom">
      ${d.brandLogo ? `<span class="hpfb-brand">${esc(d.brandLogo)}</span>` : ''}
    </div>
  </div>
</section>`
  },
})
