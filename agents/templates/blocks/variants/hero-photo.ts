/** HERO 아키타입(템플릿 충실 재현): hero-photo.
 *  와디즈 200섹션 11_인트로 섹션_제품 사진 중심_02 패턴 재구성.
 *  풀블리드 제품 사진 위에 브랜드명+제품명 오버레이 → 수직 구분선 →
 *  액센트 컬러 하단 패널에 "WHY OUR PRODUCT?" 레이블 + 스토리텔링 카피.
 *  다른 히어로 변형과 차별화: 아이콘 포인트 없음, 아치/그라데이션 없음 —
 *  순수 사진 임팩트 + 2-zone 컬러블록 구조. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  brand: z.string().min(1),                   // 브랜드명 (사진 위 오버레이)
  productName: z.string().min(1),              // 제품명 대형 (사진 위 오버레이)
  eyebrow: z.string().optional(),              // 사진 상단 소 레이블 (예: "NEW ARRIVAL")
  heroImage: z.string().optional(),            // 풀블리드 배경 제품 사진
  sectionLabel: z.string().optional(),         // 하단 패널 섹션 레이블 (기본: "WHY OUR PRODUCT?")
  story: z.string().min(1),                    // 하단 패널 스토리텔링 카피 (br 허용)
})
type Data = z.infer<typeof schema>

export const heroPhoto = defineBlock<Data>({
  id: 'hero-photo',
  archetype: 'hero',
  styleTags: ['premium', 'template', 'photo', 'colorblock'],
  imageSlots: 1,
  describe:
    '풀블리드 제품 사진 인트로. 사진이 주인공 — 브랜드명+제품명을 사진 위에 흰색 오버레이로 배치하고, 하단 액센트 컬러 패널에 "WHY OUR PRODUCT?" 섹션 레이블 + 스토리텔링 카피를 둔다. 아이콘·포인트 없음. 이미지 미제공 시 점선 플레이스홀더로 구조 유지.',
  schema,
  css: `
/* ── hp2 = hero-photo 접두사 ── */
.hp2{background:var(--bg);overflow:hidden}

/* ─ 사진 존 ─ */
.hp2-photo-zone{position:relative;width:100%;height:520px;overflow:hidden}
.hp2-img{width:100%;height:520px;object-fit:cover;display:block}
/* 이미지 없을 때: 중복 라벨 없는 클린 뉴트럴 그라데이션(사진 자리 암시) */
.hp2-img-empty{width:100%;height:520px;background:linear-gradient(135deg,#e9ecf4 0%,#c8cedd 52%,#a7afc6 100%)}
/* 상단~하단 그라데이션 오버레이 — 텍스트 가독성 */
.hp2-photo-overlay{
  position:absolute;inset:0;
  background:linear-gradient(
    180deg,
    rgba(0,0,0,.18) 0%,
    rgba(0,0,0,.08) 40%,
    rgba(0,0,0,.52) 100%
  );
  pointer-events:none
}
/* 사진 위 텍스트 블록 — 하단 앵커 */
.hp2-photo-copy{
  position:absolute;bottom:0;left:0;right:0;
  padding:0 var(--pad-x,56px) 44px;
  text-align:center
}
.hp2-eyebrow{
  display:inline-block;
  font-family:var(--font-body);
  font-size:12px;font-weight:700;
  letter-spacing:.22em;text-transform:uppercase;
  color:#fff;
  margin-bottom:12px;
  padding:5px 15px;
  border:1px solid rgba(255,255,255,.5);
  border-radius:999px;
  backdrop-filter:blur(2px)
}
.hp2-brand{
  font-family:var(--font-display);
  font-weight:800;font-size:18px;
  letter-spacing:.18em;text-transform:uppercase;
  color:rgba(255,255,255,.88);
  margin-bottom:6px
}
.hp2-product{
  font-family:var(--font-display);
  font-weight:800;font-size:64px;
  letter-spacing:-.01em;line-height:1.08;
  color:#fff;
  text-shadow:0 4px 24px rgba(0,0,0,.28)
}

/* ─ 구분선 (두 존 경계) ─ */
.hp2-divider{
  position:relative;height:0;overflow:visible;
  display:flex;justify-content:center
}
.hp2-divider::before{
  content:"";
  display:block;width:1px;height:60px;
  background:rgba(255,255,255,.7);
  margin-top:-24px;
  position:relative;z-index:2
}

/* ─ 하단 컬러 패널 ─ */
.hp2-panel{
  background:var(--accent);
  padding:52px 64px 60px;
  text-align:center
}
.hp2-section-label{
  font-family:var(--font-display);
  font-weight:800;font-size:32px;
  letter-spacing:.02em;
  color:#fff;
  margin-bottom:28px;
  text-transform:uppercase
}
.hp2-story{
  font-family:var(--font-body);
  font-size:17px;font-weight:400;
  line-height:1.85;letter-spacing:-.02em;
  color:rgba(255,255,255,.88);
  max-width:680px;margin:0 auto
}
`,
  render: (d, { esc, richSafe }) => {
    const sectionLabel = d.sectionLabel ?? 'WHY OUR PRODUCT?'
    const img = d.heroImage && d.heroImage.trim() ? d.heroImage : undefined
    return `
<section class="hp2">
  <!-- 사진 존 -->
  <div class="hp2-photo-zone">
    ${img ? media(img, 'hp2-img', esc(d.productName)) : '<div class="hp2-img-empty"></div>'}
    <div class="hp2-photo-overlay"></div>
    <div class="hp2-photo-copy">
      ${d.eyebrow ? `<div class="hp2-eyebrow">${esc(d.eyebrow)}</div>` : ''}
      <div class="hp2-brand">${esc(d.brand)}</div>
      <h1 class="hp2-product">${esc(d.productName)}</h1>
    </div>
  </div>

  <!-- 수직 구분선 -->
  <div class="hp2-divider"></div>

  <!-- 하단 컬러 패널 -->
  <div class="hp2-panel">
    <p class="hp2-section-label">${esc(sectionLabel)}</p>
    <p class="hp2-story">${richSafe(d.story)}</p>
  </div>
</section>`
  },
})
