/** HERO 아키타입(템플릿 충실 재현): hero-photo-pinned.
 *  와디즈 200섹션 11_인트로_사진중심 (frame 1284:3248) 패턴 재구성.
 *  레이아웃: 전체 accent 컬러 배경 + 상단 블랙 바(브랜드 로고) + 서브타이틀 + 대형 제품명 +
 *  모서리 핀(원형) 장식 정사각 인셋 사진 + 하단 WHY 패널(제목 + 설명).
 *  다른 히어로 변형과 차별화: 컬러블록(단색 accent) 전면 사용, 핀 장식 인셋 프레임.
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  brandLogo: z.string().min(1).optional(),   // 상단 바 브랜드명/로고 텍스트
  subtitle: z.string().min(1).optional(),    // 제품명 위 소형 설명 (예: "제품 설명을 써주세요")
  productName: z.string().min(1),            // 대형 제품명 헤드라인 (em,br 허용)
  heroImage: z.string().optional(),          // 인셋 정사각 사진 (url)
  whyTitle: z.string().min(1).optional(),    // WHY 패널 제목 (예: "WHY OUR PRODUCT?")
  whyDesc: z.string().min(1).optional(),     // WHY 패널 설명 (em,br 허용)
})
type Data = z.infer<typeof schema>

export const heroPhotoPinned = defineBlock<Data>({
  id: 'hero-photo-pinned',
  archetype: 'hero',
  styleTags: ['premium', 'colorblock', 'photo', 'template', 'accent'],
  imageSlots: 1,
  describe:
    '핀 장식 인셋 사진 히어로. accent 풀컬러 배경 + 상단 블랙 바(브랜드 로고) + 서브타이틀 + 대형 제품명 + 모서리 핀(원형) 장식 정사각 인셋 프레임 사진 + 하단 WHY 패널. 강한 컬러블록형 인트로.',
  schema,
  css: `
/* ── hpp = hero-photo-pinned 접두사 ── */
.hpp {
  position: relative;
  width: 100%;
  background: var(--accent);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ─ 상단 블랙 바 ─ */
.hpp-topbar {
  width: 100%;
  background: #111;
  padding: 14px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.hpp-brand {
  font-family: var(--font-body);
  font-weight: 700;
  font-size: 14px;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: #fff;
}

/* ─ 메인 컬러 존 ─ */
.hpp-main {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 52px 40px 40px;
}

/* ─ 헤딩 존 ─ */
.hpp-sub {
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 400;
  color: rgba(255,255,255,.82);
  margin-bottom: 12px;
  text-align: center;
}

.hpp-product {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 72px;
  letter-spacing: -.02em;
  line-height: 1.0;
  color: #fff;
  text-align: center;
  margin-bottom: 40px;
}

.hpp-product .em {
  color: color-mix(in srgb, var(--accent-d) 80%, #fff);
}

/* ─ 인셋 사진 프레임 ─ */
.hpp-frame-wrap {
  position: relative;
  width: 100%;
  max-width: 640px;
  aspect-ratio: 1 / 1;
  margin: 0 auto;
}

/* 핀(원형) 장식 — 4 모서리 */
.hpp-pin {
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgba(255,255,255,.72);
  z-index: 2;
}
.hpp-pin-tl { top: -8px;  left: -8px; }
.hpp-pin-tr { top: -8px;  right: -8px; }
.hpp-pin-bl { bottom: -8px; left: -8px; }
.hpp-pin-br { bottom: -8px; right: -8px; }

/* 인셋 사진 테두리 */
.hpp-frame {
  position: relative;
  width: 100%;
  height: 100%;
  border: 2px solid rgba(255,255,255,.55);
  border-radius: 8px;
  overflow: hidden;
  background: rgba(255,255,255,.08);
}

/* 인셋 이미지 or placeholder */
.hpp-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* ─ WHY 패널 ─ */
.hpp-why {
  width: 100%;
  background: color-mix(in srgb, var(--accent) 72%, #000);
  padding: 52px 56px 60px;
  text-align: center;
  margin-top: 40px;
}

.hpp-why-title {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 36px;
  color: #fff;
  letter-spacing: .04em;
  margin-bottom: 20px;
}

.hpp-why-desc {
  font-family: var(--font-body);
  font-size: 17px;
  line-height: 1.8;
  color: rgba(255,255,255,.82);
}

.hpp-why-desc .em {
  color: #fff;
  font-weight: 700;
}
`,
  render: (d, { esc, richSafe }) => {
    const img = d.heroImage && d.heroImage.trim() ? d.heroImage : undefined
    return `
<section class="hpp">

  <!-- 상단 블랙 바 -->
  <div class="hpp-topbar">
    <span class="hpp-brand">${d.brandLogo ? esc(d.brandLogo) : ''}</span>
  </div>

  <!-- 메인 컬러 존 -->
  <div class="hpp-main">

    <!-- 서브타이틀 + 제품명 -->
    ${d.subtitle ? `<p class="hpp-sub">${esc(d.subtitle)}</p>` : ''}
    <h1 class="hpp-product">${richSafe(d.productName)}</h1>

    <!-- 핀 장식 인셋 사진 프레임 -->
    <div class="hpp-frame-wrap">
      <span class="hpp-pin hpp-pin-tl"></span>
      <span class="hpp-pin hpp-pin-tr"></span>
      <span class="hpp-pin hpp-pin-bl"></span>
      <span class="hpp-pin hpp-pin-br"></span>
      <div class="hpp-frame">
        ${img
          ? media(img, 'hpp-img', esc(d.productName))
          : `<div class="hpp-img ph">제품 사진</div>`
        }
      </div>
    </div>

  </div>

  <!-- WHY 패널 -->
  ${(d.whyTitle || d.whyDesc) ? `
  <div class="hpp-why">
    ${d.whyTitle ? `<h2 class="hpp-why-title">${esc(d.whyTitle)}</h2>` : ''}
    ${d.whyDesc ? `<p class="hpp-why-desc">${richSafe(d.whyDesc)}</p>` : ''}
  </div>` : ''}

</section>`
  },
})
