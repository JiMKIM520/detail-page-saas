/** BANNER/FEATURE 아키타입: award-no1-emblem-banner.
 *  [끝판왕] 어워드(수상·권위) 구성 #3 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 블랙 배경 + 중앙 배치 방사형 골드 글로우 + 헤드라인(골드 "1위" 강조) +
 *  날짜/기간 필 배지 + 대형 순환 로렐 리스 SVG 안 황금 "1" 엠블럼 + 3단 대리석 포디움.
 *
 *  ⚠ 수상명·수여기관·연도·기간은 반드시 플레이스홀더로만 채워야 하며,
 *    근거 없이 실제 값을 지어내서는 안 된다(brief 금지 규칙). */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  /** 브랜드 로고 URL (없으면 숨김) */
  logoImage: z.string().optional(),
  /** 로고 alt */
  logoAlt: z.string().optional(),
  /** 상단 소문자 에어브로우 (예: "HAPPY NEW YEAR") */
  eyebrow: z.string().optional(),
  /** 대형 헤드라인 (em 허용 — "1위" 등 핵심 골드 강조 어절) */
  headline: z.string().min(1),
  /** 날짜/기간 필 배지 텍스트 (예: "2/20 - 3/15"). 없으면 숨김. */
  dateBadge: z.string().optional(),
  /** 엠블럼 중앙 숫자 (기본 "1") */
  rankNumber: z.string().optional(),
  /** 포디움 아래 보조 카피 (em, br 허용). 없으면 숨김. */
  subCopy: z.string().optional(),
})
type Data = z.infer<typeof schema>

/* ── 인라인 SVG 에셋 ─────────────────────────────────────────────────────── */

/**
 * 순환 로렐 리스 SVG — 좌·우 각 5엽 대칭 가지, 하단 연결 호.
 * 복잡도 high: 픽셀 클론 금지, 패턴(원형 월계관) 근사.
 * 색상은 부모 color 상속(currentColor) — CSS에서 골드 하드코딩.
 */
const WREATH_SVG = `<svg class="aneb-wreath" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <!-- 중앙 스템 링 -->
  <circle cx="100" cy="105" r="56" stroke="currentColor" stroke-width="1.6" stroke-dasharray="4 3" opacity="0.35"/>
  <!-- 왼쪽 가지 줄기 -->
  <path d="M100 170 C72 162 48 140 40 112 C34 90 42 68 58 52" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
  <!-- 오른쪽 가지 줄기 -->
  <path d="M100 170 C128 162 152 140 160 112 C166 90 158 68 142 52" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
  <!-- 왼쪽 잎 (5쌍) -->
  <ellipse cx="74" cy="158" rx="11" ry="5.5" transform="rotate(-25 74 158)" stroke="currentColor" stroke-width="1.7" fill="currentColor" fill-opacity="0.18"/>
  <ellipse cx="55" cy="136" rx="11" ry="5.5" transform="rotate(-42 55 136)" stroke="currentColor" stroke-width="1.7" fill="currentColor" fill-opacity="0.18"/>
  <ellipse cx="44" cy="112" rx="11" ry="5.5" transform="rotate(-60 44 112)" stroke="currentColor" stroke-width="1.7" fill="currentColor" fill-opacity="0.18"/>
  <ellipse cx="46" cy="87"  rx="11" ry="5.5" transform="rotate(-72 46 87)"  stroke="currentColor" stroke-width="1.7" fill="currentColor" fill-opacity="0.18"/>
  <ellipse cx="60" cy="66"  rx="11" ry="5.5" transform="rotate(-80 60 66)"  stroke="currentColor" stroke-width="1.7" fill="currentColor" fill-opacity="0.18"/>
  <!-- 오른쪽 잎 (5쌍) -->
  <ellipse cx="126" cy="158" rx="11" ry="5.5" transform="rotate(25 126 158)"  stroke="currentColor" stroke-width="1.7" fill="currentColor" fill-opacity="0.18"/>
  <ellipse cx="145" cy="136" rx="11" ry="5.5" transform="rotate(42 145 136)"  stroke="currentColor" stroke-width="1.7" fill="currentColor" fill-opacity="0.18"/>
  <ellipse cx="156" cy="112" rx="11" ry="5.5" transform="rotate(60 156 112)"  stroke="currentColor" stroke-width="1.7" fill="currentColor" fill-opacity="0.18"/>
  <ellipse cx="154" cy="87"  rx="11" ry="5.5" transform="rotate(72 154 87)"   stroke="currentColor" stroke-width="1.7" fill="currentColor" fill-opacity="0.18"/>
  <ellipse cx="140" cy="66"  rx="11" ry="5.5" transform="rotate(80 140 66)"   stroke="currentColor" stroke-width="1.7" fill="currentColor" fill-opacity="0.18"/>
  <!-- 하단 연결 호 + 스탠드 -->
  <path d="M78 170 Q100 178 122 170" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
  <rect x="88" y="174" width="24" height="6" rx="3" fill="currentColor" opacity="0.7"/>
  <rect x="82" y="179" width="36" height="5" rx="2.5" fill="currentColor" opacity="0.5"/>
</svg>`

/**
 * 3단 대리석 포디움 SVG — clip-path 기반 사다리꼴 스텝.
 * 블랙/딥그레이 팔레트(커머스 권위 신호색 — 하드코딩 허용).
 */
const PODIUM_SVG = `<svg class="aneb-podium" viewBox="0 0 260 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <!-- 하단 가장 넓은 단 -->
  <rect x="20" y="70" width="220" height="50" rx="4" fill="#1a1a1a"/>
  <rect x="20" y="70" width="220" height="50" rx="4" fill="url(#pdm-g3)"/>
  <!-- 중간 단 -->
  <rect x="50" y="42" width="160" height="32" rx="3" fill="#222222"/>
  <rect x="50" y="42" width="160" height="32" rx="3" fill="url(#pdm-g2)"/>
  <!-- 상단 단 -->
  <rect x="82" y="20" width="96" height="26" rx="3" fill="#2a2a2a"/>
  <rect x="82" y="20" width="96" height="26" rx="3" fill="url(#pdm-g1)"/>
  <!-- 대리석 결 라인 (하단) -->
  <path d="M40 82 Q80 78 120 84 Q160 90 210 80" stroke="rgba(255,255,255,0.07)" stroke-width="1" fill="none"/>
  <path d="M30 95 Q90 89 150 96 Q200 102 240 92" stroke="rgba(255,255,255,0.05)" stroke-width="1" fill="none"/>
  <!-- 대리석 결 라인 (중간) -->
  <path d="M60 52 Q100 48 130 54 Q170 60 200 50" stroke="rgba(255,255,255,0.06)" stroke-width="0.8" fill="none"/>
  <!-- 상단 단 결 -->
  <path d="M90 28 Q120 25 145 30" stroke="rgba(255,255,255,0.06)" stroke-width="0.8" fill="none"/>
  <!-- 그라디언트 정의 -->
  <defs>
    <linearGradient id="pdm-g1" x1="82" y1="20" x2="178" y2="46" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#3a3a3a"/>
      <stop offset="100%" stop-color="#111111"/>
    </linearGradient>
    <linearGradient id="pdm-g2" x1="50" y1="42" x2="210" y2="74" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#333333"/>
      <stop offset="100%" stop-color="#0d0d0d"/>
    </linearGradient>
    <linearGradient id="pdm-g3" x1="20" y1="70" x2="240" y2="120" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#2e2e2e"/>
      <stop offset="100%" stop-color="#0a0a0a"/>
    </linearGradient>
  </defs>
</svg>`

/** 파티클/스파클 장식 SVG — 배경 골드 별빛 효과 */
const SPARKLES_SVG = `<svg class="aneb-sparkles" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <circle cx="60"  cy="80"  r="2"   fill="#F5D77E" opacity="0.7"/>
  <circle cx="340" cy="60"  r="1.5" fill="#F5D77E" opacity="0.5"/>
  <circle cx="30"  cy="200" r="1.5" fill="#C9A84C" opacity="0.6"/>
  <circle cx="370" cy="180" r="2"   fill="#C9A84C" opacity="0.5"/>
  <circle cx="80"  cy="320" r="1"   fill="#F5D77E" opacity="0.4"/>
  <circle cx="320" cy="330" r="1.5" fill="#F5D77E" opacity="0.45"/>
  <circle cx="200" cy="30"  r="1.5" fill="#E8C060" opacity="0.5"/>
  <!-- 4점 별 스파클 -->
  <path d="M48 140 l2-6 2 6 6 2-6 2-2 6-2-6-6-2z" fill="#F5D77E" opacity="0.55"/>
  <path d="M352 240 l1.5-4.5 1.5 4.5 4.5 1.5-4.5 1.5-1.5 4.5-1.5-4.5-4.5-1.5z" fill="#F5D77E" opacity="0.5"/>
  <path d="M22 270 l1.2-3.6 1.2 3.6 3.6 1.2-3.6 1.2-1.2 3.6-1.2-3.6-3.6-1.2z" fill="#C9A84C" opacity="0.45"/>
  <path d="M378 120 l1.2-3.6 1.2 3.6 3.6 1.2-3.6 1.2-1.2 3.6-1.2-3.6-3.6-1.2z" fill="#C9A84C" opacity="0.4"/>
</svg>`

export const awardNo1EmblemBanner = defineBlock<Data>({
  id: 'award-no1-emblem-banner',
  archetype: 'banner' as any,
  styleTags: ['dark', 'award', 'gold', 'emblem', 'no1', 'ranking', 'premium', 'template'],
  imageSlots: 1,
  describe:
    '어워드 No.1 엠블럼 배너. 블랙 배경 + 방사형 골드 글로우 + 브랜드 로고(선택) + ' +
    '에어브로우 + 골드 "1위" 강조 대형 헤드라인 + 기간 필 배지 + ' +
    '순환 로렐 리스 SVG 안 황금 대형 숫자 엠블럼 + 3단 대리석 포디움 + 골드 파티클 장식. ' +
    '커머스 업계 1위·랭킹 수상 섹션. ' +
    '⚠ 수상명·수여기관·연도·기간은 반드시 플레이스홀더로만 채울 것(근거 없이 지어내기 금지).',
  schema,
  css: `
/* award-no1-emblem-banner — 접두사 aneb- */
.aneb{
  position:relative;overflow:hidden;
  background:#0a0a0a;
  color:#fff;
  padding:48px 40px 56px;
  text-align:center;
  word-break:keep-all;overflow-wrap:break-word
}
/* 방사형 골드 글로우 (배경 후광) */
.aneb::before{
  content:'';position:absolute;
  top:10%;left:50%;transform:translateX(-50%);
  width:520px;height:420px;
  border-radius:50%;
  background:radial-gradient(ellipse at center,rgba(201,168,76,0.18) 0%,rgba(201,168,76,0.06) 45%,transparent 72%);
  pointer-events:none;z-index:0
}
.aneb>*{position:relative;z-index:1}

/* 스파클 장식 — 절대 배치, z 낮게 */
.aneb-sparkles{
  position:absolute;inset:0;width:100%;height:100%;
  pointer-events:none;z-index:0
}

/* 로고 */
.aneb-logo{
  display:block;height:28px;width:auto;
  margin:0 0 20px;object-fit:contain;
  filter:brightness(0) invert(1);
  opacity:.85
}

/* 에어브로우 */
.aneb-eyebrow{
  display:block;
  font-family:var(--font-body);
  font-size:12px;font-weight:700;
  letter-spacing:.20em;text-transform:uppercase;
  color:rgba(255,255,255,.52);
  margin-bottom:10px
}

/* 대형 헤드라인 */
.aneb-headline{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(28px,7.5vw,46px);
  line-height:1.2;
  letter-spacing:-.025em;
  color:#fff;
  margin-bottom:18px
}
/* 골드 강조 — 커머스 권위 신호색 하드코딩 허용 */
.aneb-headline .em{color:#F5D77E}

/* 기간 필 배지 */
.aneb-date{
  display:inline-block;
  padding:8px 22px;
  border-radius:999px;
  background:rgba(255,255,255,.10);
  border:1.5px solid rgba(255,255,255,.22);
  font-family:var(--font-body);
  font-size:15px;font-weight:700;
  color:rgba(255,255,255,.88);
  letter-spacing:.04em;
  margin-bottom:28px
}

/* 엠블럼 영역 — 로렐 + 숫자 + 포디움 스택 */
.aneb-emblem-wrap{
  position:relative;
  display:inline-flex;flex-direction:column;align-items:center;
  margin:0 auto 0
}

/* 로렐 리스 SVG */
.aneb-wreath{
  width:200px;height:200px;
  color:#C9A84C;   /* 골드 — 커머스 권위 신호색 하드코딩 허용 */
  display:block;flex-shrink:0
}

/* 대형 랭킹 숫자 — 로렐 위에 절대 오버랩 */
.aneb-rank-num{
  position:absolute;
  top:50%;left:50%;
  transform:translate(-50%,-58%);
  font-family:var(--font-display);
  font-weight:900;
  font-size:clamp(72px,17vw,110px);
  line-height:1;
  letter-spacing:-.04em;
  /* 골드 그라디언트 텍스트 — 커머스 권위 신호색 하드코딩 허용 */
  background:linear-gradient(160deg,#F5D77E 0%,#C9A84C 40%,#E8C060 70%,#A8872A 100%);
  -webkit-background-clip:text;background-clip:text;
  -webkit-text-fill-color:transparent;
  text-shadow:none;
  /* 입체감용 drop shadow (filter는 -webkit-text-fill-color와 병용 불가 → box-shadow 대신 ::after 트릭 생략, 브라우저 대응) */
  filter:drop-shadow(0 6px 18px rgba(201,168,76,0.55))
}

/* 포디움 SVG */
.aneb-podium{
  width:260px;max-width:100%;
  display:block;
  margin-top:-16px    /* 엠블럼과 자연스럽게 이어지도록 올려붙임 */
}

/* 보조 카피 */
.aneb-sub{
  margin-top:20px;
  font-family:var(--font-body);
  font-size:14px;line-height:1.65;
  color:rgba(255,255,255,.55)
}
.aneb-sub .em{color:#F5D77E;font-weight:700}
`,
  render: (d, { esc, richSafe }) => {
    const logo = d.logoImage
      ? `<img class="aneb-logo" src="${esc(d.logoImage)}" alt="${esc(d.logoAlt ?? '브랜드 로고')}">`
      : ''

    const eyebrow = d.eyebrow
      ? `<span class="aneb-eyebrow">${esc(d.eyebrow)}</span>`
      : ''

    const dateBadge = d.dateBadge
      ? `<div class="aneb-date">${esc(d.dateBadge)}</div>`
      : ''

    const rankNum = esc(d.rankNumber ?? '1')

    const subCopy = d.subCopy
      ? `<p class="aneb-sub">${richSafe(d.subCopy)}</p>`
      : ''

    return `
<section class="aneb">
  ${SPARKLES_SVG}
  ${logo}
  ${eyebrow}
  <h2 class="aneb-headline">${richSafe(d.headline)}</h2>
  ${dateBadge}
  <div class="aneb-emblem-wrap">
    ${WREATH_SVG}
    <div class="aneb-rank-num" aria-label="No.${rankNum}">${rankNum}</div>
    ${PODIUM_SVG}
  </div>
  ${subCopy}
</section>`
  },
})
