/** AWARD 아키타입: award-trophy-flanked-stat
 *
 *  원본 패턴(135_어워드_구성_페이지_15.json) 흡수, 픽셀 클론 아님.
 *  구조 특징:
 *    - 최상단 오렌지 배너바 (SINCE 연도 + 브랜드 슬로건)
 *    - 중앙: 트로피 일러스트 2개가 좌우를 호위(flanking) + 그 사이 브랜드명·리뷰수 강조
 *    - 오렌지 다이아몬드 구분선
 *    - 누적판매 대형 숫자 (2단: 억 단위 + 천만 단위)
 *    - 하단 2열 수상 카드 (그라디언트 배경 + 트로피 씰 SVG + 수상명)
 *
 *  톤: dark — .em 스코프 오버라이드 필수
 *
 *  ⚠ 리뷰수·누적판매 수치는 반드시 실제 데이터 기반 플레이스홀더("[N,000]건" 등)로.
 *    brief에 근거 없으면 지어내지 말 것.
 */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  /** 배너바 SINCE 연도 (예: "2012"). 없으면 배너 전체 숨김. */
  sinceYear: z.string().optional(),
  /** 배너바 브랜드 슬로건 (예: "더 건강한 내일을 함께합니다"). 없으면 숨김. */
  bannerSlogan: z.string().optional(),

  /** 브랜드명 / 제품 카테고리 1행 (예: "건강기능식품"). em 허용. */
  brandLine1: z.string().min(1),
  /** 브랜드명 / 제품 카테고리 2행 (em 허용 — 회사명 강조 권장). */
  brandLine2: z.string().min(1),

  /** 리뷰 수 레이블 (예: "리뷰"). 없으면 리뷰 블록 숨김. */
  reviewLabel: z.string().optional(),
  /**
   * 리뷰 수 수치 (em 허용, 단위 포함 — 예: "<span class=\"em\">25,283건</span>").
   * 브리프 근거 있을 때만 채울 것.
   */
  reviewValue: z.string().optional(),
  /** 리뷰 수 뒤 보조 문구 (예: "이상 돌파!"). 없으면 숨김. */
  reviewSuffix: z.string().optional(),

  /** 누적판매 레이블 (예: "누적판매"). 없으면 숫자 구역 전체 숨김. */
  salesLabel: z.string().optional(),
  /**
   * 누적판매 주수치 (em 허용 — 억/만 단위 포함. 예: "<span class=\"em\">2억</span>").
   * 브리프 근거 있을 때만 채울 것.
   */
  salesMain: z.string().optional(),
  /**
   * 누적판매 보조수치 (em 허용 — 예: "<span class=\"em\">5천만</span>").
   * 없으면 생략.
   */
  salesSub: z.string().optional(),

  /**
   * 하단 수상 카드 목록 (2~4개).
   * awardBody: 수여기관/시상 주체 (예: "대한민국소비자대상위원회 수상")
   * awardName: 수상명 (예: "올해의 최고 브랜드")
   */
  awards: z
    .array(
      z.object({
        /** 수여기관/시상 주체 텍스트. 근거 없으면 "[수여기관]" 플레이스홀더 사용. */
        awardBody: z.string().min(1),
        /** 수상명. 근거 없으면 "[수상명]" 플레이스홀더 사용. */
        awardName: z.string().min(1),
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

/* ─── 인라인 SVG: 트로피 씰 (카드용 소형) ────────────────────────────────────
   원본 피그마의 복잡한 그라디언트 벡터 트로피를 기하학적으로 재현.
   픽셀 클론 금지 — 트로피 컵 + 월계 가지 패턴만 추상화. */
const TROPHY_SEAL_SVG = `<svg class="atfs-seal" viewBox="0 0 120 130" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="atfs-cup" x1="30" y1="10" x2="90" y2="110" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#F5D77E"/>
      <stop offset="45%" stop-color="#C9A030"/>
      <stop offset="100%" stop-color="#8C6A10"/>
    </linearGradient>
    <linearGradient id="atfs-hi" x1="46" y1="10" x2="56" y2="80" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFFBE8" stop-opacity="0.75"/>
      <stop offset="100%" stop-color="#F5D77E" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="atfs-glow" cx="50%" cy="30%" r="48%">
      <stop offset="0%" stop-color="#FFF3B0" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#FFF3B0" stop-opacity="0"/>
    </radialGradient>
    <filter id="atfs-blur"><feGaussianBlur stdDeviation="6"/></filter>
  </defs>
  <!-- 글로우 -->
  <ellipse cx="60" cy="44" rx="38" ry="38" fill="url(#atfs-glow)" filter="url(#atfs-blur)"/>
  <!-- 컵 몸체 -->
  <path d="M37 12 L83 12 L77 76 Q60 86 43 76 Z" fill="url(#atfs-cup)"/>
  <!-- 림 -->
  <rect x="34" y="8" width="52" height="8" rx="4" fill="#F0C84A"/>
  <!-- 하이라이트 스트로크 -->
  <path d="M49 13 Q54 20 52 55 Q51 66 50 74" stroke="url(#atfs-hi)" stroke-width="7" stroke-linecap="round" fill="none"/>
  <!-- 왼쪽 핸들 -->
  <path d="M40 22 C22 22 16 38 18 50 C20 60 30 66 40 66" stroke="#C9A030" stroke-width="5.5" stroke-linecap="round" fill="none"/>
  <!-- 오른쪽 핸들 -->
  <path d="M80 22 C98 22 104 38 102 50 C100 60 90 66 80 66" stroke="#C9A030" stroke-width="5.5" stroke-linecap="round" fill="none"/>
  <!-- 스템 + 받침 -->
  <path d="M51 76 L53 92 L67 92 L69 76" fill="#C9A030"/>
  <rect x="47" y="92" width="26" height="7" rx="3.5" fill="#C9A030"/>
  <rect x="43" y="99" width="34" height="6" rx="3" fill="#B8901E"/>
  <!-- 받침 하이라이트 -->
  <rect x="48" y="93" width="24" height="2" rx="1" fill="#F5D77E" opacity="0.3"/>
  <!-- 왼쪽 월계 가지 -->
  <path d="M28 100 C18 90 14 74 18 60" stroke="#C9A030" stroke-width="1.8" stroke-linecap="round" fill="none" opacity="0.65"/>
  <ellipse cx="22" cy="68" rx="8" ry="3.5" transform="rotate(-70 22 68)" fill="#C9A030" opacity="0.6"/>
  <ellipse cx="16" cy="82" rx="8" ry="3.5" transform="rotate(-82 16 82)" fill="#C9A030" opacity="0.55"/>
  <ellipse cx="20" cy="96" rx="8" ry="3.5" transform="rotate(-65 20 96)" fill="#C9A030" opacity="0.5"/>
  <!-- 오른쪽 월계 가지 -->
  <path d="M92 100 C102 90 106 74 102 60" stroke="#C9A030" stroke-width="1.8" stroke-linecap="round" fill="none" opacity="0.65"/>
  <ellipse cx="98" cy="68" rx="8" ry="3.5" transform="rotate(70 98 68)" fill="#C9A030" opacity="0.6"/>
  <ellipse cx="104" cy="82" rx="8" ry="3.5" transform="rotate(82 104 82)" fill="#C9A030" opacity="0.55"/>
  <ellipse cx="100" cy="96" rx="8" ry="3.5" transform="rotate(65 100 96)" fill="#C9A030" opacity="0.5"/>
  <!-- 하단 매듭 -->
  <path d="M48 106 Q60 112 72 106" stroke="#C9A030" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.7"/>
</svg>`

/* ─── 인라인 SVG: 측면 호위 트로피 — 좌측 (크고 화려하게) ──────────────────
   원본의 복잡한 그라디언트 벡터 더미(~300개 노드)를 구조적으로 재해석.
   좌·우 대칭쌍으로 브랜드 텍스트를 플랭킹(flanking)하는 시각 장치. */
const FLANK_TROPHY_L = `<svg class="atfs-flank atfs-flank--l" viewBox="0 0 160 300" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="atfs-fl-cup" x1="20" y1="10" x2="130" y2="200" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#F8E090"/>
      <stop offset="35%" stop-color="#D4952A"/>
      <stop offset="65%" stop-color="#B07A18"/>
      <stop offset="100%" stop-color="#6B4C08"/>
    </linearGradient>
    <linearGradient id="atfs-fl-hi" x1="52" y1="8" x2="62" y2="160" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFFBE8" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="#F5D77E" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="atfs-fl-glow" cx="50%" cy="28%" r="52%">
      <stop offset="0%" stop-color="#FFE87A" stop-opacity="0.32"/>
      <stop offset="100%" stop-color="#FFE87A" stop-opacity="0"/>
    </radialGradient>
    <filter id="atfs-fl-blur"><feGaussianBlur stdDeviation="10"/></filter>
  </defs>
  <!-- 글로우 후광 -->
  <ellipse cx="80" cy="90" rx="56" ry="56" fill="url(#atfs-fl-glow)" filter="url(#atfs-fl-blur)"/>
  <!-- 컵 몸체 -->
  <path d="M30 20 L130 20 L118 160 Q80 178 42 160 Z" fill="url(#atfs-fl-cup)"/>
  <!-- 림 -->
  <rect x="26" y="12" width="108" height="16" rx="8" fill="#F0C84A"/>
  <!-- 내부 음영 -->
  <path d="M68 24 Q80 32 92 24" stroke="#7A5808" stroke-width="5" stroke-linecap="round" fill="none" opacity="0.35"/>
  <!-- 하이라이트 -->
  <path d="M56 24 Q64 38 61 90 Q59 115 57 154" stroke="url(#atfs-fl-hi)" stroke-width="14" stroke-linecap="round" fill="none"/>
  <!-- 왼쪽 핸들 -->
  <path d="M34 44 C6 44 -4 76 0 100 C4 120 18 132 34 132" stroke="#B8901E" stroke-width="11" stroke-linecap="round" fill="none"/>
  <path d="M34 44 C12 44 4 72 8 94 C12 112 24 122 34 122" stroke="#F5D77E" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.45"/>
  <!-- 오른쪽 핸들 -->
  <path d="M126 44 C154 44 164 76 160 100 C156 120 142 132 126 132" stroke="#B8901E" stroke-width="11" stroke-linecap="round" fill="none"/>
  <path d="M126 44 C148 44 156 72 152 94 C148 112 136 122 126 122" stroke="#F5D77E" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.45"/>
  <!-- 스템 -->
  <path d="M58 160 L63 194 L97 194 L102 160" fill="#C9A030"/>
  <!-- 받침 단 1 -->
  <path d="M63 194 L58 214 L102 214 L97 194" fill="#A8821A"/>
  <!-- 받침대 -->
  <rect x="48" y="214" width="64" height="14" rx="7" fill="#C9A030"/>
  <rect x="38" y="228" width="84" height="12" rx="6" fill="#A8821A"/>
  <!-- 받침 하이라이트 -->
  <rect x="50" y="215" width="60" height="4" rx="2" fill="#F5D77E" opacity="0.28"/>
  <!-- 중앙 반짝임 -->
  <circle cx="80" cy="68" r="7" fill="#FFFBE8" opacity="0.55"/>
  <circle cx="70" cy="46" r="3.5" fill="#FFFBE8" opacity="0.42"/>
</svg>`

const FLANK_TROPHY_R = `<svg class="atfs-flank atfs-flank--r" viewBox="0 0 160 300" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="atfs-fr-cup" x1="130" y1="10" x2="20" y2="200" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#F8E090"/>
      <stop offset="35%" stop-color="#D4952A"/>
      <stop offset="65%" stop-color="#B07A18"/>
      <stop offset="100%" stop-color="#6B4C08"/>
    </linearGradient>
    <linearGradient id="atfs-fr-hi" x1="108" y1="8" x2="98" y2="160" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFFBE8" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="#F5D77E" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="atfs-fr-glow" cx="50%" cy="28%" r="52%">
      <stop offset="0%" stop-color="#FFE87A" stop-opacity="0.32"/>
      <stop offset="100%" stop-color="#FFE87A" stop-opacity="0"/>
    </radialGradient>
    <filter id="atfs-fr-blur"><feGaussianBlur stdDeviation="10"/></filter>
  </defs>
  <ellipse cx="80" cy="90" rx="56" ry="56" fill="url(#atfs-fr-glow)" filter="url(#atfs-fr-blur)"/>
  <path d="M130 20 L30 20 L42 160 Q80 178 118 160 Z" fill="url(#atfs-fr-cup)"/>
  <rect x="26" y="12" width="108" height="16" rx="8" fill="#F0C84A"/>
  <path d="M68 24 Q80 32 92 24" stroke="#7A5808" stroke-width="5" stroke-linecap="round" fill="none" opacity="0.35"/>
  <path d="M104 24 Q96 38 99 90 Q101 115 103 154" stroke="url(#atfs-fr-hi)" stroke-width="14" stroke-linecap="round" fill="none"/>
  <path d="M34 44 C6 44 -4 76 0 100 C4 120 18 132 34 132" stroke="#B8901E" stroke-width="11" stroke-linecap="round" fill="none"/>
  <path d="M34 44 C12 44 4 72 8 94 C12 112 24 122 34 122" stroke="#F5D77E" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.45"/>
  <path d="M126 44 C154 44 164 76 160 100 C156 120 142 132 126 132" stroke="#B8901E" stroke-width="11" stroke-linecap="round" fill="none"/>
  <path d="M126 44 C148 44 156 72 152 94 C148 112 136 122 126 122" stroke="#F5D77E" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.45"/>
  <path d="M102 160 L97 194 L63 194 L58 160" fill="#C9A030"/>
  <path d="M97 194 L102 214 L58 214 L63 194" fill="#A8821A"/>
  <rect x="48" y="214" width="64" height="14" rx="7" fill="#C9A030"/>
  <rect x="38" y="228" width="84" height="12" rx="6" fill="#A8821A"/>
  <rect x="50" y="215" width="60" height="4" rx="2" fill="#F5D77E" opacity="0.28"/>
  <circle cx="80" cy="68" r="7" fill="#FFFBE8" opacity="0.55"/>
  <circle cx="90" cy="46" r="3.5" fill="#FFFBE8" opacity="0.42"/>
</svg>`

/* ─── 인라인 SVG: 오렌지 다이아몬드 구분선 ──────────────────────────────── */
const DIVIDER_SVG = `<svg class="atfs-divider" viewBox="0 0 420 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <line x1="0" y1="24" x2="185" y2="24" stroke="var(--accent)" stroke-width="2" opacity="0.7"/>
  <rect x="202" y="10" width="16" height="16" rx="2" transform="rotate(45 210 18)" fill="var(--accent)"/>
  <line x1="235" y1="24" x2="420" y2="24" stroke="var(--accent)" stroke-width="2" opacity="0.7"/>
</svg>`

export const awardTrophyFlankedStat = defineBlock<Data>({
  id: 'award-trophy-flanked-stat',
  archetype: 'award',
  styleTags: ['dark', 'award', 'gold', 'trophy', 'stats', 'review', 'premium'],
  imageSlots: 0,
  describe:
    '어워드 트로피 플랭킹 + 누적 통계 블록. 다크 배경 + 최상단 오렌지 배너바(SINCE 연도·슬로건) + ' +
    '중앙 좌우 금빛 트로피 일러스트 2개가 호위하는 브랜드명·리뷰수(오렌지 대형 수치) + ' +
    '오렌지 다이아몬드 구분선 + 누적판매 초대형 숫자(억/천만 분리) + ' +
    '하단 2열 수상 카드(그라디언트 배경·트로피 씰·수상명). ' +
    '⚠ 리뷰수·판매수치는 브리프 근거 시에만 — 없으면 "[N,000건]" 플레이스홀더 사용.',
  schema,
  css: `
/* award-trophy-flanked-stat — 접두사 atfs- */
.atfs{
  position:relative;
  background:#150a00;
  color:#fff;
  overflow:hidden;
  word-break:keep-all;
  overflow-wrap:break-word;
}
/* 다크 배경 위 .em 스코프 오버라이드 */
.atfs .em{color:var(--em-dark,#FFF7EA)}

/* ── 배너바 ── */
.atfs-banner{
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:0 var(--pad-x,56px);
  height:66px;
  background:var(--accent);
  flex-shrink:0;
}
.atfs-banner-since,
.atfs-banner-slogan{
  font-family:var(--font-display);
  font-weight:600;
  font-size:clamp(18px,3vw,26px);
  color:#fff;
  letter-spacing:.01em;
  line-height:1.2;
}

/* ── 중앙 플랭킹 구역 ── */
.atfs-center{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:0;
  padding:32px 0 24px;
  position:relative;
}

/* 트로피 플랭크 */
.atfs-flank{
  flex-shrink:0;
  width:clamp(110px,22vw,160px);
  height:auto;
  filter:drop-shadow(0 8px 24px rgba(201,160,48,.55));
}
.atfs-flank--r{
  transform:scaleX(-1);
}

/* 브랜드+리뷰 텍스트 블록 */
.atfs-brand-block{
  flex:1;
  min-width:0;
  text-align:center;
  padding:0 12px;
}

/* 브랜드명 */
.atfs-brand-l1{
  display:block;
  font-family:var(--font-display);
  font-weight:400;
  font-size:clamp(22px,5vw,50px);
  color:#fff;
  line-height:1.15;
  letter-spacing:-.01em;
}
.atfs-brand-l2{
  display:block;
  font-family:var(--font-display);
  font-weight:700;
  font-size:clamp(22px,5vw,50px);
  color:#fff;
  line-height:1.15;
  letter-spacing:-.01em;
  margin-bottom:18px;
}
.atfs-brand-l1 .em,
.atfs-brand-l2 .em{color:var(--em-dark,#FFF7EA)}

/* 리뷰 수 행 */
.atfs-review-row{
  display:flex;
  align-items:baseline;
  justify-content:center;
  flex-wrap:wrap;
  gap:4px 8px;
  line-height:1.1;
}
.atfs-review-label{
  font-family:var(--font-display);
  font-weight:700;
  font-size:clamp(32px,8vw,56px);
  color:#fff;
}
.atfs-review-value{
  font-family:var(--font-display);
  font-weight:700;
  font-size:clamp(38px,9vw,64px);
  color:var(--accent);
  letter-spacing:-.02em;
}
/* .em 안 강조 — accent 위에서 밝은 색 */
.atfs-review-value .em{color:var(--em-dark,#FFF7EA)}
.atfs-review-suffix{
  font-family:var(--font-display);
  font-weight:700;
  font-size:clamp(32px,8vw,56px);
  color:#fff;
}

/* ── 오렌지 다이아몬드 구분선 ── */
.atfs-divider{
  display:block;
  width:100%;
  max-width:100%;
  height:48px;
  margin:0;
}

/* ── 누적판매 구역 ── */
.atfs-sales{
  padding:16px var(--pad-x,56px) 28px;
}
.atfs-sales-label{
  font-family:var(--font-display);
  font-weight:700;
  font-size:clamp(32px,7vw,64px);
  color:#eeae42;
  margin-bottom:4px;
}
.atfs-sales-nums{
  display:flex;
  align-items:baseline;
  gap:0;
  flex-wrap:wrap;
}
/* 개별 수치 덩어리: 작은 상단 점(원본 Ellipse 장식) + 큰 숫자 */
.atfs-sales-chunk{
  position:relative;
  display:flex;
  align-items:baseline;
  padding-top:20px;
}
.atfs-sales-chunk::before{
  content:'';
  position:absolute;
  top:0;left:2px;
  width:18px;height:18px;
  border-radius:50%;
  background:var(--accent);
}
.atfs-sales-digit{
  font-family:var(--font-display);
  font-weight:700;
  font-size:clamp(90px,22vw,148px);
  line-height:1;
  letter-spacing:-.04em;
  color:var(--accent);
}
.atfs-sales-unit{
  font-family:var(--font-display);
  font-weight:700;
  font-size:clamp(48px,11vw,82px);
  line-height:1;
  color:var(--accent);
  margin-left:4px;
}
/* .em 안 강조 — 밝은 em-dark */
.atfs-sales-digit .em,
.atfs-sales-unit .em{color:var(--em-dark,#FFF7EA)}

/* ── 하단 수상 카드 그리드 ── */
.atfs-awards{
  display:grid;
  grid-template-columns:repeat(2,1fr);
  gap:12px;
  padding:0 var(--pad-x,56px) 40px;
}
.atfs-award-card{
  border-radius:calc(var(--r-scale,1)*20px);
  background:linear-gradient(135deg,#3a2000 0%,#1e1000 100%);
  padding:24px 16px 22px;
  display:flex;
  flex-direction:column;
  align-items:center;
  text-align:center;
  gap:0;
}
.atfs-seal{
  width:clamp(80px,14vw,110px);
  height:auto;
  flex-shrink:0;
  display:block;
  margin-bottom:12px;
}
.atfs-award-body{
  font-family:var(--font-body);
  font-size:clamp(11px,2.2vw,14px);
  font-weight:400;
  color:rgba(255,255,255,.72);
  line-height:1.5;
  margin-bottom:6px;
}
.atfs-award-name{
  font-family:var(--font-display);
  font-weight:600;
  font-size:clamp(14px,2.8vw,18px);
  color:#fff;
  line-height:1.3;
}
`,
  render: (d, { esc, richSafe }) => {
    /* 배너바 */
    const bannerHtml =
      d.sinceYear || d.bannerSlogan
        ? `<div class="atfs-banner">
    ${d.sinceYear ? `<span class="atfs-banner-since">SINCE ${esc(d.sinceYear)}</span>` : '<span></span>'}
    ${d.bannerSlogan ? `<span class="atfs-banner-slogan">${esc(d.bannerSlogan)}</span>` : ''}
  </div>`
        : ''

    /* 리뷰 수 행 */
    const reviewHtml =
      d.reviewLabel || d.reviewValue
        ? `<div class="atfs-review-row">
    ${d.reviewLabel ? `<span class="atfs-review-label">${esc(d.reviewLabel)}</span>` : ''}
    ${d.reviewValue ? `<span class="atfs-review-value">${richSafe(d.reviewValue)}</span>` : ''}
    ${d.reviewSuffix ? `<span class="atfs-review-suffix">${esc(d.reviewSuffix)}</span>` : ''}
  </div>`
        : ''

    /* 누적판매 수치 — salesMain 은 "2억" 형태, salesSub 은 "5천만" 형태
       각각 숫자 부분(digit)과 단위(unit)를 분리해 다른 크기로 표현하기 위해
       richSafe 로 그대로 렌더 (em 강조는 슬롯 문자열에 span 태그로 직접 지정) */
    const salesHtml = d.salesLabel
      ? `<div class="atfs-sales">
    <div class="atfs-sales-label">${esc(d.salesLabel)}</div>
    <div class="atfs-sales-nums">
      ${
        d.salesMain
          ? `<div class="atfs-sales-chunk">
        <span class="atfs-sales-digit">${richSafe(d.salesMain)}</span>
      </div>`
          : ''
      }
      ${
        d.salesSub
          ? `<div class="atfs-sales-chunk">
        <span class="atfs-sales-unit">${richSafe(d.salesSub)}</span>
      </div>`
          : ''
      }
    </div>
  </div>`
      : ''

    /* 수상 카드 */
    const awardsHtml = d.awards
      .map(
        (a) => `
<div class="atfs-award-card">
  ${TROPHY_SEAL_SVG}
  <p class="atfs-award-body">${esc(a.awardBody)}</p>
  <p class="atfs-award-name">${esc(a.awardName)}</p>
</div>`,
      )
      .join('')

    return `
<section class="atfs" aria-label="수상 및 판매 성과">
  ${bannerHtml}
  <!-- 좌우 트로피 플랭킹 + 중앙 브랜드·리뷰 -->
  <div class="atfs-center">
    ${FLANK_TROPHY_L}
    <div class="atfs-brand-block">
      <span class="atfs-brand-l1">${richSafe(d.brandLine1)}</span>
      <span class="atfs-brand-l2">${richSafe(d.brandLine2)}</span>
      ${reviewHtml}
    </div>
    ${FLANK_TROPHY_R}
  </div>
  ${DIVIDER_SVG}
  ${salesHtml}
  <!-- 하단 수상 카드 그리드 -->
  <div class="atfs-awards">
    ${awardsHtml}
  </div>
</section>`
  },
})
