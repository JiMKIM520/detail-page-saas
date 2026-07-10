/** HERO 아키타입: hero-kanji-bead
 *  전체 블랙 배경 + 상단 배경 이미지 마스크(그라디언트 스크림) + 세로 골드 비즈 체인 두 줄(좌우) +
 *  한자+한글 혼합 세로 타이포(名家/명가/한우) + 골드 그라디언트 텍스트 카피.
 *  프리미엄 한우·식품 브랜드 다크 고급 연출. 톤: dark. CSS 접두: hkry. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 한자 세로 표기 — 2자 이내 권장 (em 허용) */
  kanjiLine: z.string().min(1),
  /** 한글 브랜드명 왼쪽 (em 허용) */
  brandLeft: z.string().min(1),
  /** 한글 브랜드명 오른쪽 (em 허용) */
  brandRight: z.string().min(1),
  /** 영문 서브 레이블 (em 허용) */
  labelEn: z.string().optional(),
  /** 메인 카피 헤드라인 (em,br 허용) */
  headline: z.string().min(1),
  /** 헤드라인 아래 보조 카피 (em,br 허용) */
  subCopy: z.string().optional(),
  /** 상단 마스크용 배경 이미지 — 없으면 순수 다크 그라디언트로 강등 */
  bgImage: z.string().optional(),
  /** 하단 제품 이미지 — 없으면 영역 숨김 */
  productImage: z.string().optional(),
})
type Data = z.infer<typeof schema>

/** 비즈 체인 SVG (골드, 세로 방향) — 타원 3개 + 선 2개 */
function beadChain(x: number): string {
  // 세 비즈 + 두 연결선 (위아래 여백 포함 161px 높이 원본 재현)
  return `<svg class="hkry-bead" style="left:${x}px" viewBox="0 0 7 161" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="bg${x}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#fbd080"/>
      <stop offset="55%" stop-color="#ffe9a0"/>
      <stop offset="100%" stop-color="#c8900a"/>
    </linearGradient>
  </defs>
  <!-- 상단 비즈 -->
  <ellipse cx="3.5" cy="3.5" rx="3.5" ry="3.5" fill="url(#bg${x})"/>
  <!-- 상단 연결선 -->
  <rect x="3" y="7" width="1" height="60" fill="url(#bg${x})"/>
  <!-- 중단 비즈 -->
  <ellipse cx="3.5" cy="70.5" rx="3.5" ry="3.5" fill="url(#bg${x})"/>
  <!-- 하단 연결선 -->
  <rect x="3" y="74" width="1" height="60" fill="url(#bg${x})"/>
  <!-- 하단 비즈 -->
  <ellipse cx="3.5" cy="137.5" rx="3.5" ry="3.5" fill="url(#bg${x})"/>
</svg>`
}

export const heroKanjiBead = defineBlock<Data>({
  id: 'hero-kanji-bead',
  archetype: 'hero',
  // noimg-safe: bgImage 없을 때 순수 다크 그라디언트로 강등(마스크 영역 붕괴 없음)
  styleTags: ['dark', 'premium', 'food', 'editorial', 'noimg-safe'],
  imageSlots: 2,
  describe:
    '프리미엄 한우·식품 브랜드 다크 히어로. 전체 블랙 배경 + 상단 마스크 사진(그라디언트 오버레이) + 세로 골드 비즈 체인 장식 좌우 1열씩 + 한자·한글 혼합 세로 타이포 중앙 배치 + 골드 그라디언트 카피 하단. 배경 이미지 없으면 다크 그라디언트로 안전 강등. 브리프 근거 있을 때만 productImage 슬롯 사용.',
  schema,
  css: `
/* ── 래퍼 ───────────────────────────────────────── */
.hkry{
  position:relative;
  background:#000;
  color:#fff;
  overflow:hidden;
  font-family:var(--font-display)
}

/* ── 상단 마스크 영역 (사진 + 그라디언트 스크림) ── */
.hkry-mask{
  position:relative;
  width:100%;
  height:300px;
  overflow:hidden;
  background:linear-gradient(180deg,#1a0e04 0%,#000 100%)
}
.hkry-mask-img{
  position:absolute;
  inset:0;
  width:100%;
  height:100%;
  object-fit:cover;
  object-position:center top;
  opacity:.55;
  border-radius:0
}
.hkry-mask-img.ph{display:none!important}
/* 하단 페이드 아웃 스크림 — 이미지 유무 무관 항상 렌더 */
.hkry-mask::after{
  content:'';
  position:absolute;
  inset:0;
  background:linear-gradient(
    180deg,
    rgba(0,0,0,.08) 0%,
    rgba(0,0,0,.25) 40%,
    rgba(0,0,0,.9) 85%,
    #000 100%
  );
  pointer-events:none
}

/* ── 골드 그라디언트 구분선 ─────────────────────── */
.hkry-divider{
  width:100%;
  height:10px;
  background:linear-gradient(
    90deg,
    transparent 0%,
    #c8900a 15%,
    #fbd080 35%,
    #ffe9a0 50%,
    #fbd080 65%,
    #c8900a 85%,
    transparent 100%
  );
  position:relative;
  z-index:2
}

/* ── 비즈 체인 ──────────────────────────────────── */
.hkry-bead{
  position:absolute;
  top:44px;
  width:7px;
  height:161px;
  z-index:3;
  pointer-events:none
}

/* ── 중앙 타이포 영역 ───────────────────────────── */
.hkry-typo{
  position:relative;
  z-index:3;
  display:flex;
  align-items:flex-start;
  justify-content:center;
  gap:32px;
  padding:40px var(--pad-x,56px) 28px
}

/* 한자 세로 블록 */
.hkry-kanji-col{
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:0
}
.hkry-kanji{
  font-family:var(--font-serif);
  font-weight:700;
  font-size:78px;
  line-height:1;
  writing-mode:vertical-rl;
  text-orientation:mixed;
  background:linear-gradient(180deg,#ffe9a0 0%,#fbd080 50%,#c8900a 100%);
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
  background-clip:text;
  letter-spacing:.05em
}
.hkry-kanji .em{
  -webkit-text-fill-color:transparent;
  color:var(--em-dark,#FFF7EA)
}

/* 한글 브랜드 좌·우 블록 */
.hkry-brands{
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:0;
  padding-top:4px
}
.hkry-brand{
  font-family:var(--font-display);
  font-weight:900;
  font-size:80px;
  line-height:1;
  background:linear-gradient(180deg,#ffe9a0 0%,#fbd080 45%,#c8900a 100%);
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
  background-clip:text;
  letter-spacing:-.01em
}
.hkry-brand .em{
  -webkit-text-fill-color:transparent;
  color:var(--em-dark,#FFF7EA)
}

/* ── 카피 영역 ──────────────────────────────────── */
.hkry-copy{
  position:relative;
  z-index:3;
  text-align:center;
  padding:0 var(--pad-x,56px) 36px
}
.hkry-label-en{
  font-family:var(--font-lat);
  font-weight:700;
  font-size:18px;
  letter-spacing:.12em;
  background:linear-gradient(90deg,#c8900a 0%,#fbd080 50%,#c8900a 100%);
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
  background-clip:text;
  margin-bottom:14px
}
.hkry-label-en .em{-webkit-text-fill-color:transparent}
.hkry-headline{
  font-family:var(--font-display);
  font-weight:700;
  font-size:36px;
  line-height:1.35;
  background:linear-gradient(90deg,#ffe9a0 0%,#fff5d6 40%,#fbd080 70%,#c8900a 100%);
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
  background-clip:text;
  letter-spacing:-.01em
}
.hkry-headline .em{
  -webkit-text-fill-color:transparent;
  color:var(--em-dark,#FFF7EA)
}
.hkry-subcopy{
  margin-top:10px;
  font-size:16px;
  font-weight:500;
  color:rgba(255,255,255,.65);
  line-height:1.6
}
.hkry-subcopy .em{color:var(--em-dark,#FFF7EA);font-weight:700}

/* ── 제품 이미지 ────────────────────────────────── */
.hkry-product-wrap{
  position:relative;
  z-index:2;
  width:100%;
  overflow:hidden
}
.hkry-product{
  display:block;
  width:100%;
  height:535px;
  object-fit:cover;
  object-position:center;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*0px))
}
.hkry-product.ph{display:none!important}
`,
  render: (d, { esc, richSafe }) => {
    // 비즈 체인 위치 — 원본 좌(Group 594 x=1545-1176=369) 우(Group 595 x=1660-1176=484)
    const beadLeft = beadChain(369)
    const beadRight = beadChain(484)

    return `
<section class="hkry">

  <!-- 상단 마스크 영역 -->
  <div class="hkry-mask">
    ${d.bgImage ? media(d.bgImage, 'hkry-mask-img', '브랜드 배경') : ''}
  </div>

  <!-- 골드 구분선 -->
  <div class="hkry-divider" role="presentation"></div>

  <!-- 비즈 체인 (좌우) -->
  ${beadLeft}
  ${beadRight}

  <!-- 중앙 타이포 -->
  <div class="hkry-typo">
    <!-- 한글 왼쪽 브랜드 -->
    <div class="hkry-brands">
      <span class="hkry-brand">${richSafe(d.brandLeft)}</span>
    </div>

    <!-- 한자 세로 -->
    <div class="hkry-kanji-col">
      <span class="hkry-kanji">${richSafe(d.kanjiLine)}</span>
    </div>

    <!-- 한글 오른쪽 브랜드 -->
    <div class="hkry-brands">
      <span class="hkry-brand">${richSafe(d.brandRight)}</span>
    </div>
  </div>

  <!-- 카피 -->
  <div class="hkry-copy">
    ${d.labelEn ? `<p class="hkry-label-en">${richSafe(d.labelEn)}</p>` : ''}
    <h2 class="hkry-headline">${richSafe(d.headline)}</h2>
    ${d.subCopy ? `<p class="hkry-subcopy">${richSafe(d.subCopy)}</p>` : ''}
  </div>

  <!-- 제품 이미지 -->
  ${d.productImage ? `
  <div class="hkry-product-wrap">
    ${media(d.productImage, 'hkry-product', '제품 사진')}
  </div>` : ''}

</section>`
  },
})
