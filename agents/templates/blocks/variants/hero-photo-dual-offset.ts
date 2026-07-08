/** HERO 아키타입(템플릿 충실 재현): hero-photo-dual-offset.
 *  와디즈 200섹션 11_인트로_사진중심 / Figma 1284:1805 패턴 재구성.
 *  3존 구조: ① 풀블리드 그라데이션 헤더(브랜드 레이블 + 대형 제품명 + 설명) →
 *            ② 풀블리드 메인 사진 →
 *            ③ 하단 흰 존: 좌측 포인트 텍스트 + 우측 오프셋 인셋 사진(우측 경계 돌출).
 *  다른 히어로 변형과의 차별화: 두 장의 사진(풀블리드 + 우측 오프셋 인셋)과
 *  액센트 바 포인트 레이블을 조합한 풀/인셋 듀얼 구조. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  brand: z.string().min(1),              // 브랜드 레이블 (상단 헤더 소 레이블)
  productName: z.string().min(1),        // 제품 대표명 (대형 헤드라인, em·br)
  subtitle: z.string().optional(),       // 제품 설명 (헤더 하단 한 줄, em·br)
  heroImage: z.string().optional(),      // 풀블리드 메인 사진 (url)
  pointLabel: z.string().optional(),     // 포인트 레이블 (기본: "POINT 1")
  pointText: z.string().min(1),          // 포인트 본문 카피 (em·br)
  insetImage: z.string().optional(),     // 우측 오프셋 인셋 사진 (url)
})
type Data = z.infer<typeof schema>

export const heroPhotoDualOffset = defineBlock<Data>({
  id: 'hero-photo-dual-offset',
  archetype: 'hero',
  styleTags: ['premium', 'template', 'photo', 'gradient', 'editorial', 'colorblock'],
  imageSlots: 2,
  describe:
    '풀블리드 그라데이션 헤더(브랜드+대형 제품명+설명) + 풀블리드 메인 사진 + 하단 좌 포인트 텍스트/우 오프셋 인셋 사진 듀얼 구조 인트로. 두 장의 사진을 풀블리드와 오프셋 인셋으로 분리 배치.',
  schema,
  css: `
/* ── hpdo = hero-photo-dual-offset 접두사 ── */
.hpdo{background:var(--bg);overflow:hidden;margin:0;padding:0}

/* ─ 존 1: 풀블리드 그라데이션 헤더 ─ */
.hpdo-header{
  background:linear-gradient(
    180deg,
    color-mix(in srgb,var(--accent) 80%,#000) 0%,
    color-mix(in srgb,var(--accent) 52%,#fff) 60%,
    color-mix(in srgb,var(--accent) 18%,#fff) 100%
  );
  padding:64px 48px 48px;
  text-align:center;
  position:relative
}
.hpdo-brand{
  font-family:var(--font-body);
  font-size:14px;font-weight:700;
  letter-spacing:.22em;text-transform:uppercase;
  color:rgba(255,255,255,.82);
  margin-bottom:16px
}
.hpdo-product{
  font-family:var(--font-display);
  font-weight:800;font-size:68px;
  letter-spacing:-.02em;line-height:1.06;
  color:#fff;
  text-shadow:0 2px 18px rgba(0,0,0,.18)
}
.hpdo-product .em{color:color-mix(in srgb,var(--accent) 25%,#fff)}
.hpdo-subtitle{
  margin-top:16px;
  font-family:var(--font-body);
  font-size:17px;font-weight:400;
  letter-spacing:.01em;line-height:1.7;
  color:rgba(255,255,255,.78)
}
.hpdo-subtitle .em{color:#fff;font-weight:600}

/* ─ 존 2: 풀블리드 메인 사진 ─ */
.hpdo-hero{
  width:100%;
  height:480px;
  object-fit:cover;
  display:block;
  margin:0;padding:0
}

/* ─ 존 3: 하단 텍스트+오프셋 인셋 ─ */
.hpdo-bottom{
  position:relative;
  background:#fff;
  min-height:320px;
  display:flex;
  align-items:flex-start;
  overflow:visible
}
.hpdo-text{
  flex:0 0 auto;
  width:295px;
  padding:56px 32px 56px 44px
}
.hpdo-point-bar{
  display:flex;
  align-items:center;
  gap:10px;
  margin-bottom:18px
}
.hpdo-bar{
  width:4px;
  height:22px;
  background:var(--accent);
  border-radius:calc(var(--r-scale,1)*2px);
  flex-shrink:0
}
.hpdo-point-label{
  font-family:var(--font-body);
  font-weight:800;font-size:15px;
  letter-spacing:.12em;text-transform:uppercase;
  color:var(--accent)
}
.hpdo-point-text{
  font-family:var(--font-display);
  font-weight:700;font-size:26px;
  letter-spacing:-.01em;line-height:1.45;
  color:var(--ink)
}
.hpdo-point-text .em{color:var(--accent);font-weight:800}

/* ─ 오프셋 인셋 사진: 우측으로 약간 돌출, 상단 살짝 올라옴 ─ */
.hpdo-inset-wrap{
  position:absolute;
  right:-24px;
  top:-32px;
  width:390px;
  height:400px;
  overflow:hidden;
  box-shadow:0 8px 40px rgba(0,0,0,.18)
}
.hpdo-inset{
  width:100%;
  height:100%;
  object-fit:cover;
  display:block
}
`,
  render: (d, { esc, richSafe }) => {
    const pointLabel = d.pointLabel ?? 'POINT 1'
    return `
<section class="hpdo">
  <!-- 존 1: 풀블리드 그라데이션 헤더 -->
  <div class="hpdo-header">
    <p class="hpdo-brand">${esc(d.brand)}</p>
    <h1 class="hpdo-product">${richSafe(d.productName)}</h1>
    ${d.subtitle ? `<p class="hpdo-subtitle">${richSafe(d.subtitle)}</p>` : ''}
  </div>

  <!-- 존 2: 풀블리드 메인 사진 -->
  ${media(d.heroImage, 'hpdo-hero', esc(d.productName))}

  <!-- 존 3: 좌 포인트 텍스트 + 우 오프셋 인셋 사진 -->
  <div class="hpdo-bottom">
    <div class="hpdo-text">
      <div class="hpdo-point-bar">
        <div class="hpdo-bar"></div>
        <span class="hpdo-point-label">${esc(pointLabel)}</span>
      </div>
      <p class="hpdo-point-text">${richSafe(d.pointText)}</p>
    </div>
    <div class="hpdo-inset-wrap">
      ${media(d.insetImage, 'hpdo-inset', '보조 제품 사진')}
    </div>
  </div>
</section>`
  },
})
