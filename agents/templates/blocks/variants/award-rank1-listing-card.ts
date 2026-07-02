/** FEATURE 아키타입: award-rank1-listing-card.
 *  [끝판왕] 어워드(수상·권위) 구성 #17 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처:
 *    ① 딥 네이비(--ink) 배경 + 금색 테두리 프레임
 *    ② 상단 블리드 골드 트로피 히어로 (인라인 SVG 근사)
 *    ③ 카테고리 랭킹 달성 헤드라인 (서브 + 골드 별 행 + 대형 달성 선언)
 *    ④ 마켓플레이스 리스팅 카드 목업 — 썸네일 + "1위" 골드 원형 배지 오버랩 + 상품정보
 *    ⑤ 하단 월계관 앵커 (좌우 로렐 + 부문 1위 텍스트)
 *
 *  ⚠️  수상명·연도·기관은 모두 플레이스홀더로만 입력(brief 근거 없이 지어내기 금지).
 *       describe 및 schema 주석에도 명기.
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

// ── 인라인 SVG ────────────────────────────────────────────────────────────────

/** 골드 트로피 — 라인+형태 근사(픽셀 클론 아님). 커머스 권위 신호용 하드코딩 허용. */
const TROPHY_SVG = `<svg class="arlc-trophy" viewBox="0 0 160 180" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- 컵 본체 -->
  <path d="M40 20 h80 v70 a40 40 0 0 1-80 0 z" fill="url(#tg)" stroke="#A07820" stroke-width="1.5"/>
  <!-- 손잡이 좌 -->
  <path d="M40 35 Q14 35 14 60 Q14 82 40 80" stroke="url(#tg2)" stroke-width="8" stroke-linecap="round" fill="none"/>
  <!-- 손잡이 우 -->
  <path d="M120 35 Q146 35 146 60 Q146 82 120 80" stroke="url(#tg2)" stroke-width="8" stroke-linecap="round" fill="none"/>
  <!-- 받침 줄기 -->
  <rect x="72" y="130" width="16" height="22" rx="4" fill="url(#tg)"/>
  <!-- 받침대 -->
  <rect x="52" y="152" width="56" height="12" rx="6" fill="url(#tg)"/>
  <!-- 하이라이트 -->
  <ellipse cx="70" cy="50" rx="14" ry="22" fill="rgba(255,255,255,.18)" transform="rotate(-10 70 50)"/>
  <!-- 별 장식 -->
  <path d="M80 55 l3 9 h9 l-7 5 3 9-8-5-8 5 3-9-7-5h9z" fill="#FFF3B0" opacity=".9"/>
  <defs>
    <linearGradient id="tg" x1="40" y1="20" x2="120" y2="160" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#F5D77E"/>
      <stop offset="40%" stop-color="#C9A84C"/>
      <stop offset="80%" stop-color="#E8C050"/>
      <stop offset="100%" stop-color="#A07820"/>
    </linearGradient>
    <linearGradient id="tg2" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
      <stop offset="0%" stop-color="#F5D77E"/>
      <stop offset="100%" stop-color="#C9A84C"/>
    </linearGradient>
  </defs>
</svg>`

/** 골드 리본/스트리머 장식 (트로피 좌우 곡선) */
const RIBBON_SVG = `<svg class="arlc-ribbon" viewBox="0 0 320 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- 좌측 리본 -->
  <path d="M10 10 Q40 40 30 80 Q20 110 50 115" stroke="#D4A840" stroke-width="5" stroke-linecap="round" fill="none" opacity=".85"/>
  <path d="M30 5 Q50 30 45 70 Q40 100 65 108" stroke="#F5D77E" stroke-width="3" stroke-linecap="round" fill="none" opacity=".6"/>
  <!-- 우측 리본 -->
  <path d="M310 10 Q280 40 290 80 Q300 110 270 115" stroke="#D4A840" stroke-width="5" stroke-linecap="round" fill="none" opacity=".85"/>
  <path d="M290 5 Q270 30 275 70 Q280 100 255 108" stroke="#F5D77E" stroke-width="3" stroke-linecap="round" fill="none" opacity=".6"/>
  <!-- 좌측 작은 마름모 -->
  <path d="M22 50 l5-5 5 5-5 5z" fill="#F5D77E" opacity=".8"/>
  <!-- 우측 작은 마름모 -->
  <path d="M293 50 l5-5 5 5-5 5z" fill="#F5D77E" opacity=".8"/>
</svg>`

/** 골드 별 행 (달성 헤드라인 위) */
const STARS_ROW = `<div class="arlc-stars" aria-hidden="true">
  <svg viewBox="0 0 16 16" fill="#D4A840"><path d="M8 0l2 6.2H16l-5 3.8 1.9 6L8 12l-4.9 4 1.9-6L0 6.2h6z"/></svg>
  <svg viewBox="0 0 16 16" fill="#D4A840"><path d="M8 0l2 6.2H16l-5 3.8 1.9 6L8 12l-4.9 4 1.9-6L0 6.2h6z"/></svg>
  <svg viewBox="0 0 16 16" fill="#D4A840"><path d="M8 0l2 6.2H16l-5 3.8 1.9 6L8 12l-4.9 4 1.9-6L0 6.2h6z"/></svg>
  <svg viewBox="0 0 16 16" fill="#D4A840"><path d="M8 0l2 6.2H16l-5 3.8 1.9 6L8 12l-4.9 4 1.9-6L0 6.2h6z"/></svg>
  <svg viewBox="0 0 16 16" fill="#D4A840"><path d="M8 0l2 6.2H16l-5 3.8 1.9 6L8 12l-4.9 4 1.9-6L0 6.2h6z"/></svg>
</div>`

/** 좌측 월계관 (point-award-credential의 로렐 SVG 참고·응용) */
const LAUREL_L = `<svg class="arlc-laurel arlc-laurel-l" viewBox="0 0 54 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M46 10 C30 18 12 30 8 50 C4 70 18 90 30 110" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none"/>
  <ellipse cx="38" cy="22" rx="9" ry="5" transform="rotate(-40 38 22)" stroke="currentColor" stroke-width="1.8" fill="none"/>
  <ellipse cx="28" cy="38" rx="9" ry="5" transform="rotate(-50 28 38)" stroke="currentColor" stroke-width="1.8" fill="none"/>
  <ellipse cx="20" cy="55" rx="9" ry="5" transform="rotate(-55 20 55)" stroke="currentColor" stroke-width="1.8" fill="none"/>
  <ellipse cx="14" cy="73" rx="9" ry="5" transform="rotate(-60 14 73)" stroke="currentColor" stroke-width="1.8" fill="none"/>
  <ellipse cx="18" cy="91" rx="9" ry="5" transform="rotate(-50 18 91)" stroke="currentColor" stroke-width="1.8" fill="none"/>
</svg>`

/** 우측 월계관 (좌측 대칭) */
const LAUREL_R = `<svg class="arlc-laurel arlc-laurel-r" viewBox="0 0 54 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M8 10 C24 18 42 30 46 50 C50 70 36 90 24 110" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none"/>
  <ellipse cx="16" cy="22" rx="9" ry="5" transform="rotate(40 16 22)" stroke="currentColor" stroke-width="1.8" fill="none"/>
  <ellipse cx="26" cy="38" rx="9" ry="5" transform="rotate(50 26 38)" stroke="currentColor" stroke-width="1.8" fill="none"/>
  <ellipse cx="34" cy="55" rx="9" ry="5" transform="rotate(55 34 55)" stroke="currentColor" stroke-width="1.8" fill="none"/>
  <ellipse cx="40" cy="73" rx="9" ry="5" transform="rotate(60 40 73)" stroke="currentColor" stroke-width="1.8" fill="none"/>
  <ellipse cx="36" cy="91" rx="9" ry="5" transform="rotate(50 36 91)" stroke="currentColor" stroke-width="1.8" fill="none"/>
</svg>`

// ── Zod 스키마 ────────────────────────────────────────────────────────────────

const schema = z.object({
  /**
   * 카테고리 문맥 서브카피 (em 허용).
   * 예: "쇼핑카테고리 약 <span class=\"em\">N만개</span> [제품종류] 중"
   * ⚠️ 수치·카테고리명은 실제 근거 기반 플레이스홀더만 허용.
   */
  contextLine: z.string().min(1),

  /**
   * 달성 선언 대형 헤드라인 (em 허용, br 허용).
   * 예: "[회사명]의 [제품명]이<br><span class=\"em\">1위를 달성</span>했습니다!"
   * ⚠️ 회사명·제품명은 플레이스홀더로만 작성.
   */
  headline: z.string().min(1),

  /** 마켓플레이스 리스팅 카드 목업 */
  listing: z.object({
    /** 상품 썸네일 이미지 URL */
    image: z.string().optional(),
    /** 이미지 alt */
    imageAlt: z.string().optional(),
    /**
     * "1위" 배지 텍스트 (기본 "1위").
     * ⚠️ 플레이스홀더 — 실제 랭킹 근거 없이 변경 금지.
     */
    rankBadge: z.string().min(1).default('1위'),
    /**
     * 상품명 플레이스홀더
     * ⚠️ 실제 상품명으로만 입력.
     */
    productName: z.string().min(1),
    /** 상품 설명 (1줄) */
    productDesc: z.string().optional(),
    /** 판매가 (예: "59,900원") */
    price: z.string().optional(),
    /**
     * 카드 우측 영역 보조 텍스트 (쇼핑몰 리스트 컨텍스트 안내).
     * 기본: "쇼핑몰 리스트 이미지를 넣어주세요."
     */
    sideNote: z.string().optional(),
  }),

  /**
   * 하단 월계관 앵커 텍스트 (em 허용).
   * 예: "쇼핑카테고리 <span class=\"em\">[제품분류]부문 1위</span>"
   * ⚠️ 부문명은 실제 근거 기반 플레이스홀더.
   */
  anchorLabel: z.string().min(1),
})

type Data = z.infer<typeof schema>

// ── 블록 정의 ─────────────────────────────────────────────────────────────────

export const awardRank1ListingCard = defineBlock<Data>({
  id: 'award-rank1-listing-card',
  archetype: 'award',
  styleTags: ['dark', 'award', 'gold', 'rank', 'marketplace', 'premium', 'template'],
  imageSlots: 1,
  describe:
    '어워드 카테고리 1위 달성 마켓플레이스 카드. ' +
    '딥 네이비(--ink) 배경 + 골드 테두리 프레임 + 상단 블리드 골드 트로피 히어로(인라인 SVG) + ' +
    '카테고리 랭킹 달성 헤드라인(서브카피 + 골드 별 5개 행 + 대형 달성 선언) + ' +
    '마켓플레이스 리스팅 카드 목업(상품 썸네일 + "1위" 원형 골드 배지 오버랩 + 상품명/설명/가격) + ' +
    '하단 좌우 월계관 + 부문 1위 앵커 텍스트. ' +
    '⚠️ 수상명·연도·기관·카테고리명·순위 수치는 모두 플레이스홀더로만 사용(실제 근거 없이 지어내기 금지).',
  schema,
  css: `
/* award-rank1-listing-card — 접두사 arlc- */
/* 딥 네이비 배경: --ink 토큰 사용 */
.arlc{
  position:relative;background:var(--ink);color:#fff;
  padding:0 0 56px;text-align:center;
  word-break:keep-all;overflow-wrap:break-word;overflow:hidden
}

/* 골드 테두리 프레임 */
.arlc-frame{
  position:absolute;inset:56px 22px 22px;
  border:2px solid #C9A84C;pointer-events:none;z-index:0
}
/* 모서리 마름모 장식 */
.arlc-frame::before,.arlc-frame::after{
  content:'';position:absolute;
  width:10px;height:10px;background:#C9A84C;
  transform:rotate(45deg)
}
.arlc-frame::before{left:-6px;top:-6px}
.arlc-frame::after{right:-6px;bottom:-6px}

/* 골드 리본 스트리머 (트로피 배경) */
.arlc-ribbon{
  position:absolute;top:0;left:50%;transform:translateX(-50%);
  width:100%;max-width:320px;height:120px;z-index:1;pointer-events:none
}

/* 트로피 히어로 영역 */
.arlc-trophy-wrap{
  position:relative;z-index:2;
  padding-top:10px;margin-bottom:24px
}
.arlc-trophy{
  width:140px;height:158px;display:block;margin:0 auto;
  filter:drop-shadow(0 8px 24px rgba(0,0,0,.5))
}

/* 본문 영역 (프레임 내부) */
.arlc-body{position:relative;z-index:2;padding:0 36px}

/* 카테고리 컨텍스트 서브카피 */
.arlc-context{
  font-family:var(--font-display);font-weight:700;
  font-size:clamp(16px,4vw,22px);line-height:1.5;
  color:rgba(255,255,255,.9);margin-bottom:16px
}
.arlc-context .em{color:#F5D77E;font-weight:800}

/* 골드 별 5개 행 */
.arlc-stars{
  display:flex;align-items:center;justify-content:center;
  gap:8px;margin-bottom:12px
}
.arlc-stars svg{width:20px;height:20px}

/* 달성 대형 헤드라인 */
.arlc-headline{
  font-family:var(--font-display);font-weight:800;
  font-size:clamp(28px,7vw,46px);line-height:1.22;
  letter-spacing:-.02em;color:#fff;margin-bottom:32px
}
/* 다크 배경 — .em은 골드(커머스 권위 신호색 하드코딩 허용) */
.arlc-headline .em{color:#F5D77E}

/* 마켓플레이스 리스팅 카드 목업 */
.arlc-card{
  background:#fff;color:#1a1a1a;border-radius:14px;
  overflow:hidden;margin:0 0 32px;
  box-shadow:0 4px 32px rgba(0,0,0,.4);
  text-align:left;min-height:160px;
  display:flex;align-items:stretch
}

/* 카드 좌: 썸네일 + 배지 */
.arlc-card-thumb-wrap{
  position:relative;flex-shrink:0;
  width:140px
}
.arlc-card-thumb{
  width:140px;height:100%;min-height:160px;
  object-fit:cover;display:block
}
.arlc-card-thumb.ph{
  width:140px;min-height:160px;
  background:#f0e8b0;border:none;
  color:#999;font-size:11px;
  display:flex;align-items:center;justify-content:center
}

/* "1위" 원형 골드 배지 오버랩 */
.arlc-rank-badge{
  position:absolute;top:10px;left:10px;
  width:36px;height:36px;border-radius:50%;
  /* 골드: 커머스 순위 신호색 하드코딩 허용 */
  background:linear-gradient(135deg,#F5D77E 0%,#C9A84C 100%);
  color:#1a1a1a;font-family:var(--font-display);
  font-weight:800;font-size:12px;
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 2px 8px rgba(0,0,0,.35);
  letter-spacing:-.01em;z-index:1
}

/* 카드 우: 상품 정보 */
.arlc-card-info{
  flex:1;min-width:0;padding:18px 16px 14px;
  display:flex;flex-direction:column;justify-content:center;gap:4px
}
.arlc-card-note{
  font-size:13px;color:#888;line-height:1.5;margin-bottom:6px
}
.arlc-card-name{
  font-family:var(--font-body);font-weight:700;
  font-size:14px;color:#111;line-height:1.4
}
.arlc-card-desc{
  font-size:12px;color:#666;line-height:1.5;margin-top:2px
}
.arlc-card-price{
  margin-top:8px;font-family:var(--font-display);
  font-weight:800;font-size:16px;
  /* 가격 강조: 커머스 표준 색상 하드코딩 허용 */
  color:#111
}

/* 하단 월계관 앵커 */
.arlc-anchor{
  display:flex;align-items:center;justify-content:center;
  gap:10px;margin-top:4px
}
.arlc-laurel{
  width:36px;height:80px;
  /* 골드 월계관 커머스 신호색 하드코딩 허용 */
  color:#C9A84C;flex-shrink:0
}
.arlc-laurel-r{transform:scaleX(-1)}
.arlc-anchor-text{
  font-family:var(--font-display);font-weight:700;
  font-size:clamp(14px,3.5vw,18px);color:#fff;
  line-height:1.4;text-align:center
}
.arlc-anchor-text .em{color:#F5D77E;font-weight:800}
`,
  render: (d, { esc, richSafe }) => {
    const rankBadge = esc(d.listing.rankBadge ?? '1위')
    const sideNote = esc(d.listing.sideNote ?? '쇼핑몰 리스트 이미지를 넣어주세요.')

    const thumbHtml = media(
      d.listing.image,
      'arlc-card-thumb',
      esc(d.listing.imageAlt ?? '상품 이미지'),
    )

    return `
<section class="arlc">
  <!-- 골드 테두리 프레임 -->
  <div class="arlc-frame" aria-hidden="true"></div>

  <!-- 트로피 히어로 (상단 블리드) -->
  <div class="arlc-trophy-wrap">
    ${RIBBON_SVG}
    ${TROPHY_SVG}
  </div>

  <!-- 본문 -->
  <div class="arlc-body">
    <!-- 카테고리 컨텍스트 서브카피 -->
    <p class="arlc-context">${richSafe(d.contextLine)}</p>

    <!-- 골드 별 행 -->
    ${STARS_ROW}

    <!-- 달성 대형 헤드라인 -->
    <h2 class="arlc-headline">${richSafe(d.headline)}</h2>

    <!-- 마켓플레이스 리스팅 카드 목업 -->
    <div class="arlc-card" role="img" aria-label="마켓플레이스 상품 리스팅 목업">
      <div class="arlc-card-thumb-wrap">
        ${thumbHtml}
        <div class="arlc-rank-badge">${rankBadge}</div>
      </div>
      <div class="arlc-card-info">
        <p class="arlc-card-note">${sideNote}</p>
        <p class="arlc-card-name">${esc(d.listing.productName)}</p>
        ${d.listing.productDesc ? `<p class="arlc-card-desc">${esc(d.listing.productDesc)}</p>` : ''}
        ${d.listing.price ? `<p class="arlc-card-price">${esc(d.listing.price)}</p>` : ''}
      </div>
    </div>

    <!-- 하단 월계관 앵커 -->
    <div class="arlc-anchor">
      ${LAUREL_L}
      <p class="arlc-anchor-text">${richSafe(d.anchorLabel)}</p>
      ${LAUREL_R}
    </div>
  </div>
</section>`
  },
})
