/** HERO 아키타입(템플릿 충실 재현): hero-photo-bottom.
 *  와디즈 200섹션 11_인트로_사진중심_1216:1113 패턴 재구성.
 *  레이아웃: 컬러 그라데이션 상단 존(브랜드+제품명 중앙) →
 *  하단 2/3 풀블리드 사진(배지/씰 오버레이 포함) → 브랜드 로고 푸터.
 *  사진이 하단에 배치된 역전 구조(↔ hero-photo는 사진 위에 텍스트 오버레이).
 *  badge는 gold-seal 씰 스타일 선택적 표시. 로고 텍스트는 액센트 색 푸터에. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  brand: z.string().min(1),                 // 브랜드명 (상단 존 소 레이블)
  productName: z.string().min(1),           // 제품 대표명 (대형 헤드라인, em·br)
  productSubName: z.string().optional(),    // 제품 서브명 (구분선 하단, em·br)
  heroImage: z.string().optional(),         // 하단 풀블리드 제품 사진 (url)
  badgeLabel: z.string().optional(),        // 씰/배지 상단 텍스트 (예: "1%")
  badgeMain: z.string().optional(),         // 씰/배지 주 텍스트 (예: "PDRN")
  badgeSub: z.string().optional(),          // 씰/배지 하단 소문자 (예: "HIGH CONCENTRATION FORMULA")
  logoText: z.string().optional(),          // 푸터 브랜드 로고 텍스트
})
type Data = z.infer<typeof schema>

export const heroPhotoBottom = defineBlock<Data>({
  id: 'hero-photo-bottom',
  archetype: 'hero',
  styleTags: ['premium', 'template', 'photo', 'colorblock', 'gradient'],
  imageSlots: 1,
  describe:
    '컬러 그라데이션 상단(브랜드+제품명+구분선+서브명) + 하단 풀블리드 제품 사진(배지/씰 오버레이) + 브랜드 로고 푸터. 사진이 하단에 배치된 역전 인트로 구조. 뷰티·스킨케어 제품에 적합.',
  schema,
  css: `
/* ── hpb = hero-photo-bottom 접두사 ── */
.hpb{background:var(--bg);overflow:hidden;margin:0;padding:0}

/* ─ 상단 그라데이션 헤더 존 ─ */
.hpb-header{
  background:linear-gradient(
    180deg,
    color-mix(in srgb,var(--accent) 72%,#000) 0%,
    color-mix(in srgb,var(--accent) 55%,#fff) 65%,
    color-mix(in srgb,var(--accent) 18%,#fff) 100%
  );
  padding:72px 48px 48px;
  text-align:center;
  position:relative
}
.hpb-brand{
  font-family:var(--font-body);
  font-size:13px;font-weight:700;
  letter-spacing:.24em;text-transform:uppercase;
  color:rgba(255,255,255,.82);
  margin-bottom:18px
}
.hpb-product-name{
  font-family:var(--font-display);
  font-weight:800;font-size:62px;
  letter-spacing:-.02em;line-height:1.1;
  color:#fff;
  text-shadow:0 2px 18px rgba(0,0,0,.18)
}
.hpb-product-name .em{color:color-mix(in srgb,var(--accent) 30%,#fff)}
.hpb-divider{
  width:220px;height:1px;
  background:rgba(255,255,255,.45);
  margin:22px auto
}
.hpb-sub-name{
  font-family:var(--font-display);
  font-weight:600;font-size:22px;
  letter-spacing:.04em;
  color:rgba(255,255,255,.88)
}
.hpb-sub-name .em{color:color-mix(in srgb,var(--accent) 20%,#fff)}

/* ─ 하단 사진 존 (풀블리드: 좌/우/하단 여백 없음) ─ */
.hpb-photo-zone{
  position:relative;
  width:100%;
  margin:0;
  padding:0;
  overflow:visible;
  background:linear-gradient(
    180deg,
    color-mix(in srgb,var(--accent) 10%,#fff) 0%,
    #fff 40%
  )
}
.hpb-img{
  display:block;
  width:100%;
  height:620px;
  object-fit:cover;
  object-position:center top;
  margin:0;padding:0
}
.hpb-img-empty{
  display:block;
  width:100%;height:620px;
  margin:0;padding:0;
  background:linear-gradient(180deg,color-mix(in srgb,var(--accent) 8%,#f4f4f6) 0%,#f0f0f2 100%)
}

/* ─ 배지/씰 오버레이 (우상단) ─ */
.hpb-badge{
  position:absolute;
  top:24px;right:40px;
  width:96px;height:96px;
  border-radius:50%;
  background:
    radial-gradient(circle at 38% 35%,
      color-mix(in srgb,var(--accent) 20%,#fff) 0%,
      color-mix(in srgb,var(--accent-d) 80%,#fff) 45%,
      var(--accent-d) 100%
    );
  box-shadow:
    0 0 0 4px var(--accent-d),
    0 0 0 7px color-mix(in srgb,var(--accent) 60%,#fff),
    0 4px 18px rgba(0,0,0,.35);
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  text-align:center;
  padding:10px 8px;
  gap:1px
}
.hpb-badge-top{
  font-family:var(--font-display);
  font-weight:800;font-size:22px;
  color:color-mix(in srgb,var(--ink) 85%,#000);
  line-height:1;
  letter-spacing:-.01em
}
.hpb-badge-main{
  font-family:var(--font-display);
  font-weight:800;font-size:15px;
  color:color-mix(in srgb,var(--ink) 85%,#000);
  line-height:1.1;
  letter-spacing:.04em
}
.hpb-badge-sub{
  font-size:7px;font-weight:700;
  letter-spacing:.04em;
  color:var(--ink);
  line-height:1.35;
  text-align:center;
  text-transform:uppercase;
  margin-top:2px
}

/* ─ 브랜드 로고 푸터 ─ */
.hpb-footer{
  background:#fff;
  padding:28px 48px 36px;
  text-align:center
}
.hpb-logo{
  font-family:var(--font-display);
  font-weight:800;font-size:26px;
  letter-spacing:.1em;
  color:var(--accent);
  text-transform:uppercase
}
`,
  render: (d, { esc, richSafe }) => {
    const img = d.heroImage && d.heroImage.trim() ? d.heroImage : undefined
    const hasBadge = d.badgeLabel || d.badgeMain || d.badgeSub
    return `
<section class="hpb">
  <!-- 상단 그라데이션 헤더 존 -->
  <div class="hpb-header">
    ${d.brand ? `<p class="hpb-brand">${esc(d.brand)}</p>` : ''}
    <h1 class="hpb-product-name">${richSafe(d.productName)}</h1>
    <div class="hpb-divider"></div>
    ${d.productSubName ? `<p class="hpb-sub-name">${richSafe(d.productSubName)}</p>` : ''}
  </div>

  <!-- 하단 풀블리드 사진 존 -->
  <div class="hpb-photo-zone">
    ${img ? media(img, 'hpb-img', esc(d.productName)) : '<div class="hpb-img-empty"></div>'}
    ${hasBadge ? `
    <div class="hpb-badge">
      ${d.badgeLabel ? `<span class="hpb-badge-top">${esc(d.badgeLabel)}</span>` : ''}
      ${d.badgeMain ? `<span class="hpb-badge-main">${esc(d.badgeMain)}</span>` : ''}
      ${d.badgeSub ? `<span class="hpb-badge-sub">${esc(d.badgeSub)}</span>` : ''}
    </div>` : ''}
  </div>

  <!-- 브랜드 로고 푸터 -->
  <div class="hpb-footer">
    <p class="hpb-logo">${esc(d.logoText ?? d.brand)}</p>
  </div>
</section>`
  },
})
