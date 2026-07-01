/** HERO 아키타입(템플릿 충실 재현): hero-photo-glass-card.
 *  와디즈 200섹션 11_인트로_사진중심 (frame 1284:1815) 패턴 재구성.
 *  전체 배경 사진 위에 반투명 프로스트 글래스 카드(제품명 대형 헤드라인 + 수직 구분선 + WHY 서브헤드 + 설명) +
 *  상단 브랜드 로고 이미지 + 우하단 인셋 제품 사진.
 *  hero-photo-fullbg(사진 배경만, 카드 없음)와 차별화: 글래스 카드가 핵심 정보 블록을 형성함. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  brandLogo: z.string().optional(),        // (url) 상단 브랜드 로고 이미지
  heroImage: z.string().optional(),        // (url) 전체 배경 사진
  productName: z.string().min(1),          // 대형 제품명 헤드라인 (em,br 허용)
  whyLabel: z.string().min(1).optional(),  // WHY 서브헤드 (예: "WHY OUR PRODUCT?")
  desc: z.string().min(1),                 // 글래스 카드 설명 본문 (em,br 허용)
  insetImage: z.string().optional(),       // (url) 우하단 인셋 제품 사진
})
type Data = z.infer<typeof schema>

export const heroPhotoGlassCard = defineBlock<Data>({
  id: 'hero-photo-glass-card',
  archetype: 'hero',
  styleTags: ['premium', 'editorial', 'photo', 'template', 'glassmorphism'],
  imageSlots: 3,
  describe:
    '사진 배경 + 프로스트 글래스 카드 히어로. 전체 배경 사진 위 반투명 글래스 카드(대형 제품명+수직구분선+WHY 서브헤드+설명) + 상단 브랜드 로고 + 우하단 인셋 사진. 프리미엄 인트로.',
  schema,
  css: `
/* ── hpgc = hero-photo-glass-card 접두사 ── */
.hpgc{
  position:relative;
  width:100%;
  min-height:860px;
  overflow:hidden;
  background:var(--ink);
  display:flex;
  flex-direction:column;
}

/* ─ 배경 이미지 ─ */
.hpgc-bg{
  position:absolute;
  inset:0;
  width:100%;
  height:100%;
  object-fit:cover;
  display:block;
  z-index:0;
}

/* ─ 전체 어두운 스크림 (가독성) ─ */
.hpgc-scrim{
  position:absolute;
  inset:0;
  background:linear-gradient(
    160deg,
    rgba(0,0,0,.18) 0%,
    rgba(0,0,0,.08) 45%,
    rgba(0,0,0,.28) 100%
  );
  z-index:1;
  pointer-events:none;
}

/* ─ 콘텐츠 레이어 ─ */
.hpgc-body{
  position:relative;
  z-index:2;
  width:100%;
  min-height:860px;
  flex:1 1 auto;
  display:flex;
  flex-direction:column;
  justify-content:space-between;
  padding:52px 56px 60px;
}

/* ─ 상단: 브랜드 로고 ─ */
.hpgc-logo{
  width:auto;
  max-width:200px;
  height:56px;
  object-fit:contain;
  display:block;
  margin:0 auto;
}

/* ─ 중앙: 글래스 카드 ─ */
.hpgc-card{
  margin-top:40px;
  background:color-mix(in srgb, #fff 18%, transparent);
  backdrop-filter:blur(18px) saturate(140%);
  -webkit-backdrop-filter:blur(18px) saturate(140%);
  border:1px solid rgba(255,255,255,.32);
  border-radius:20px;
  padding:44px 48px 44px;
  max-width:580px;
  align-self:flex-start;
}

/* 제품명 ─ */
.hpgc-name{
  font-family:var(--font-display);
  font-weight:800;
  font-size:80px;
  letter-spacing:-.02em;
  line-height:1.05;
  color:var(--accent);
  text-shadow:0 2px 24px rgba(0,0,0,.12);
}
.hpgc-name .em{
  color:#fff;
}

/* 수직 구분선 ─ */
.hpgc-divider{
  width:3px;
  height:72px;
  background:rgba(255,255,255,.55);
  margin:28px 0 24px;
  border-radius:2px;
}

/* WHY 서브헤드 ─ */
.hpgc-why{
  font-family:var(--font-display);
  font-weight:800;
  font-size:20px;
  letter-spacing:.06em;
  text-transform:uppercase;
  color:#fff;
  margin-bottom:14px;
}

/* 설명 본문 ─ */
.hpgc-desc{
  font-family:var(--font-body);
  font-size:15px;
  font-weight:400;
  line-height:1.8;
  color:rgba(255,255,255,.88);
}
.hpgc-desc .em{
  font-weight:700;
  color:#fff;
}

/* ─ 우하단 인셋 사진 ─ */
.hpgc-inset-wrap{
  align-self:flex-end;
  margin-top:auto;
}

.hpgc-inset{
  width:260px;
  height:200px;
  object-fit:cover;
  border-radius:18px;
  border:2px solid rgba(255,255,255,.30);
  box-shadow:0 16px 40px rgba(0,0,0,.38);
  display:block;
}
`,
  render: (d, { esc, richSafe }) => {
    const bg = d.heroImage && d.heroImage.trim() ? d.heroImage : undefined
    const logo = d.brandLogo && d.brandLogo.trim() ? d.brandLogo : undefined
    const inset = d.insetImage && d.insetImage.trim() ? d.insetImage : undefined
    return `
<section class="hpgc">
  <!-- 배경 이미지 -->
  ${bg
    ? media(bg, 'hpgc-bg', esc(d.productName))
    : `<div class="hpgc-bg ph" style="position:absolute;inset:0;width:100%;height:100%">제품 배경 사진</div>`
  }

  <!-- 스크림 오버레이 -->
  <div class="hpgc-scrim"></div>

  <!-- 콘텐츠 -->
  <div class="hpgc-body">

    <!-- 상단: 브랜드 로고 -->
    ${logo
      ? media(logo, 'hpgc-logo', esc('브랜드 로고'))
      : `<div class="hpgc-logo ph" style="height:56px;max-width:200px;margin:0 auto">Brand Logo</div>`
    }

    <!-- 중앙: 글래스 카드 -->
    <div class="hpgc-card">
      <h1 class="hpgc-name">${richSafe(d.productName)}</h1>
      <div class="hpgc-divider"></div>
      ${d.whyLabel ? `<p class="hpgc-why">${esc(d.whyLabel)}</p>` : ''}
      <p class="hpgc-desc">${richSafe(d.desc)}</p>
    </div>

    <!-- 우하단: 인셋 사진 -->
    <div class="hpgc-inset-wrap">
      ${inset
        ? media(inset, 'hpgc-inset', esc('제품 인셋 사진'))
        : `<div class="hpgc-inset ph">제품 인셋 사진</div>`
      }
    </div>

  </div>
</section>`
  },
})
