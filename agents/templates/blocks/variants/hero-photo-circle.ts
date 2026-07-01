/** HERO 아키타입(템플릿 충실 재현): hero-photo-circle.
 *  피그마 1284:1807 — 11_인트로_사진중심 / 원형 마스크 사진 프레임.
 *  3존 구조:
 *    ① 상단 라이트 존 — 제품명(대형 대문자 accent 디스플레이) + 한 줄 설명.
 *    ② 원형 마스크 존 — 초대형 원형 클리핑 마스크 안에 제품 사진.
 *                        원 아래 절반을 가리는 accent 컬러 스트립이 전체 폭으로 확장.
 *    ③ 하단 라이트 존 — 여백 + 브랜드 로고 중앙 정렬.
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  productName: z.string().min(1),          // 대형 제품명 (em,br 허용)
  subtitle: z.string().min(1).optional(),  // 한 줄 설명 텍스트
  productImage: z.string().optional(),     // 원형 마스크 안 제품 사진 (url)
  brandLogo: z.string().optional(),        // 하단 브랜드 로고 이미지 (url)
})
type Data = z.infer<typeof schema>

export const heroPhotoCircle = defineBlock<Data>({
  id: 'hero-photo-circle',
  archetype: 'hero',
  styleTags: ['premium', 'template', 'colorblock', 'centered', 'circle-mask', 'light'],
  imageSlots: 2,
  describe:
    '초대형 원형 마스크 안 제품 사진 + 하단 accent 컬러 스트립 인트로. ' +
    '상단 라이트 존에 대형 대문자 제품명+설명, 중앙 원형 클리핑 마스크(원 하단 절반에 accent 스트립 전체폭 확장), ' +
    '하단 여백+브랜드 로고. 사진 중심의 강렬한 인트로.',
  schema,
  css: `
/* ── hpc = hero-photo-circle 접두사 ── */
.hpc{background:var(--bg);overflow:hidden}

/* ─ 존 1: 상단 텍스트 ─ */
.hpc-header{
  padding:52px 48px 36px;
  text-align:center
}
.hpc-name{
  font-family:var(--font-display);
  font-weight:800;
  font-size:72px;
  letter-spacing:-.01em;
  line-height:1.05;
  color:var(--accent);
  text-transform:uppercase
}
.hpc-name .em{color:var(--ink)}
.hpc-sub{
  margin-top:16px;
  font-family:var(--font-body);
  font-size:18px;
  font-weight:400;
  color:var(--ink-2);
  line-height:1.6
}
.hpc-sub .em{color:var(--accent);font-weight:700}

/* ─ 존 2: 원형 마스크 + 컬러 스트립 ─ */
.hpc-stage{
  position:relative;
  width:100%;
  /* 원(700px 지름)의 절반 높이 + 스트립 높이를 포함하는 충분한 공간 */
  padding-top:56px;
  padding-bottom:0;
  overflow:hidden
}

/* accent 컬러 스트립: 원의 하단 절반부터 아래로 전폭 */
.hpc-strip{
  position:absolute;
  left:0;right:0;
  bottom:0;
  /* strip 높이 = 원 지름의 절반(350px) + 약간의 여유 */
  height:380px;
  background:var(--accent);
  z-index:0
}

/* 원형 마스크 래퍼: 가운데 정렬, z-index 1로 strip 위 */
.hpc-circle-wrap{
  position:relative;
  z-index:1;
  width:640px;
  height:640px;
  margin:0 auto;
  border-radius:50%;
  overflow:hidden;
  /* 원 바깥 공간을 strip이 채우도록 margin-bottom 제거 */
  margin-bottom:-32px
}

/* 원형 마스크 안 제품 이미지 */
.hpc-product{
  width:100%;
  height:100%;
  object-fit:cover;
  display:block
}

/* ─ 존 3: 하단 여백 + 브랜드 로고 ─ */
.hpc-footer{
  background:var(--bg);
  padding:64px 48px 60px;
  text-align:center
}

/* 브랜드 로고: 이미지 or placeholder */
.hpc-logo{
  display:block;
  margin:0 auto;
  max-width:220px;
  height:56px;
  object-fit:contain
}
.hpc-logo-text{
  font-family:var(--font-display);
  font-weight:800;
  font-size:22px;
  letter-spacing:.06em;
  color:var(--accent)
}
`,
  render: (d, { esc, richSafe }) => `
<section class="hpc">

  <!-- 존 1: 제품명 + 설명 -->
  <div class="hpc-header">
    <h1 class="hpc-name">${richSafe(d.productName)}</h1>
    ${d.subtitle ? `<p class="hpc-sub">${richSafe(d.subtitle)}</p>` : ''}
  </div>

  <!-- 존 2: 원형 마스크 + accent 컬러 스트립 -->
  <div class="hpc-stage">
    <div class="hpc-strip"></div>
    <div class="hpc-circle-wrap">
      ${media(d.productImage, 'hpc-product', esc(d.productName))}
    </div>
  </div>

  <!-- 존 3: 브랜드 로고 -->
  <div class="hpc-footer">
    ${d.brandLogo
      ? media(d.brandLogo, 'hpc-logo', 'Brand Logo')
      : `<span class="hpc-logo-text">Brand Logo</span>`}
  </div>

</section>`,
})
