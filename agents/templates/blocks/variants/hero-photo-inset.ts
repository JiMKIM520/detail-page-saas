/** HERO 아키타입(템플릿 충실 재현): hero-photo-inset.
 *  와디즈 200섹션 11_인트로_사진중심 패턴 재구성.
 *  3존 구조: ① 상단 텍스트 전용 헤더(브랜드 레이블 + 대형 제품명) →
 *            ② 패딩 처리된 인셋 사진(풀블리드 아님, 좌우 여백 유지) →
 *            ③ 하단 WHY/스토리 텍스트 존.
 *  다른 히어로 변형과의 차별화: 사진이 배경이 아닌 독립 인셋 요소 — 그라데이션 오버레이 없음. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  brand: z.string().min(1),               // 브랜드 레이블 (상단 소문자, 액센트 컬러)
  productName: z.string().min(1),          // 제품명 대형 (em,br 허용)
  heroImage: z.string().optional(),        // 인셋 사진 (url)
  sectionLabel: z.string().optional(),     // WHY 레이블 (기본: "WHY OUR PRODUCT?")
  story: z.string().min(1),               // 스토리 카피 (em,br 허용)
})
type Data = z.infer<typeof schema>

export const heroPhotoInset = defineBlock<Data>({
  id: 'hero-photo-inset',
  archetype: 'hero',
  styleTags: ['premium', 'template', 'photo', 'light', 'editorial'],
  imageSlots: 1,
  describe:
    '텍스트 헤더+인셋 사진+텍스트 푸터 3존 인트로. 브랜드 레이블과 대형 제품명을 상단 흰 존에 배치하고, 좌우 여백이 있는 인셋 사진을 중간에 두며, 하단 흰 존에 WHY 레이블과 스토리 카피를 나란히 배치. 사진이 배경이 아닌 독립 인셋 요소.',
  schema,
  css: `
/* ── hpi = hero-photo-inset 접두사 ── */
.hpi{background:var(--bg);overflow:hidden}

/* ─ 존 1: 텍스트 헤더 ─ */
.hpi-header{
  padding:56px 64px 36px;
  text-align:center
}
.hpi-brand{
  font-family:var(--font-body);
  font-size:14px;font-weight:600;
  letter-spacing:.18em;text-transform:uppercase;
  color:var(--accent);
  margin-bottom:16px
}
.hpi-product{
  font-family:var(--font-display);
  font-weight:800;font-size:72px;
  letter-spacing:-.02em;line-height:1.06;
  color:var(--ink);
  text-align:center
}
.hpi-product .em{color:var(--accent)}

/* ─ 존 2: 인셋 사진 ─ */
.hpi-photo-wrap{
  padding:0 72px;
}
.hpi-photo{
  width:100%;
  aspect-ratio:1/1;
  object-fit:cover;
  display:block
}

/* ─ 존 3: WHY/스토리 푸터 ─ */
.hpi-footer{
  padding:52px 64px 60px;
  text-align:center
}
.hpi-why{
  font-family:var(--font-display);
  font-weight:800;font-size:26px;
  letter-spacing:.04em;text-transform:uppercase;
  color:var(--ink);
  margin-bottom:22px
}
.hpi-story{
  font-family:var(--font-body);
  font-size:17px;font-weight:400;
  line-height:1.85;letter-spacing:-.01em;
  color:var(--ink-2);
  max-width:620px;margin:0 auto
}
.hpi-story .em{color:var(--accent);font-weight:700}
`,
  render: (d, { esc, richSafe }) => {
    const whyLabel = d.sectionLabel ?? 'WHY OUR PRODUCT?'
    return `
<section class="hpi">
  <!-- 존 1: 텍스트 헤더 -->
  <div class="hpi-header">
    <p class="hpi-brand">${esc(d.brand)}</p>
    <h1 class="hpi-product">${richSafe(d.productName)}</h1>
  </div>

  <!-- 존 2: 인셋 사진 -->
  <div class="hpi-photo-wrap">
    ${media(d.heroImage, 'hpi-photo', esc(d.productName))}
  </div>

  <!-- 존 3: WHY/스토리 푸터 -->
  <div class="hpi-footer">
    <p class="hpi-why">${esc(whyLabel)}</p>
    <p class="hpi-story">${richSafe(d.story)}</p>
  </div>
</section>`
  },
})
