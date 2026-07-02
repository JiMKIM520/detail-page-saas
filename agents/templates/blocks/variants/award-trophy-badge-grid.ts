/** FEATURE 아키타입(어워드 뱃지 그리드): award-trophy-badge-grid.
 *  [끝판왕] 어워드(수상·권위) 구성 #9 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 딥블랙 배경 + 골드 보케 파티클 + 대형 골드 트로피+월계관 앵커 히어로
 *  + 대형 헤드라인 + 7개 월계관 뱃지 비대칭 그리드(2·3·2 행 배치, 수상 아카이브).
 *
 *  ⚠ 수상명·연도·기관은 반드시 플레이스홀더로 넣어야 합니다.
 *    brief(제품 설명)에 수상 근거가 없는 경우 직접 지어내지 마십시오.
 *    (schema describe 및 이 주석 참고) */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  /** 골드 대형 헤드라인 (em 허용). 플레이스홀더: "[수상 문구]를 입력하세요." */
  title: z.string().min(1),
  /** 헤드라인 아래 보조 카피 (em 허용). 예: "[회사명]은 수상기록으로 증명합니다." */
  subtitle: z.string().min(1).optional(),
  /** 월계관 뱃지 배열 (5~7개 권장; 최소 2, 최대 7).
   *  비대칭 그리드: 2·3·2 또는 2·3 등 자동 배분.
   *  각 뱃지 내 텍스트는 플레이스홀더 권장("[수상명]", "[연도] [기관명]"). */
  badges: z
    .array(
      z.object({
        /** 뱃지 상단 작은 레이블 (선택). 예: "[기관명]" */
        topLine: z.string().min(1).optional(),
        /** 뱃지 중앙 주 텍스트 (필수). 예: "[수상명]" */
        mainText: z.string().min(1),
        /** 뱃지 하단 작은 레이블 (선택). 예: "[연도]" */
        bottomLine: z.string().min(1).optional(),
      }),
    )
    .min(2)
    .max(7),
})
type Data = z.infer<typeof schema>

/* ─── 인라인 SVG: 월계관(로렐 리스) 원형 뱃지 ────────────────────────────
   좌우 대칭 잎사귀 + 하단 리본 매듭. 뱃지 내부에 텍스트 슬롯 있음.
   point-award-credential.ts 로렐 SVG 구조 참고 + 원형 닫힘 구도.
   best-effort 근사 — 픽셀 클론 금지. */
const LAUREL_BADGE_SVG = `<svg class="atbg-wreath-svg" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="atbg-lg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F5D77E"/>
      <stop offset="55%" stop-color="#C9A84C"/>
      <stop offset="100%" stop-color="#8C6A10"/>
    </linearGradient>
  </defs>
  <!-- 왼쪽 줄기 -->
  <path d="M60 108 C44 104 28 90 20 72 C13 56 16 38 26 24 C36 12 50 7 62 8"
        stroke="url(#atbg-lg)" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  <!-- 왼쪽 잎 6장 -->
  <ellipse cx="56" cy="10"  rx="9" ry="4"   transform="rotate(-62 56 10)"  fill="url(#atbg-lg)" opacity="0.95"/>
  <ellipse cx="43" cy="16"  rx="9" ry="4"   transform="rotate(-75 43 16)"  fill="url(#atbg-lg)" opacity="0.90"/>
  <ellipse cx="30" cy="28"  rx="9" ry="4"   transform="rotate(-85 30 28)"  fill="url(#atbg-lg)" opacity="0.90"/>
  <ellipse cx="21" cy="44"  rx="9" ry="4"   transform="rotate(-93 21 44)"  fill="url(#atbg-lg)" opacity="0.88"/>
  <ellipse cx="18" cy="62"  rx="9" ry="4"   transform="rotate(-98 18 62)"  fill="url(#atbg-lg)" opacity="0.85"/>
  <ellipse cx="23" cy="80"  rx="9" ry="4"   transform="rotate(-88 23 80)"  fill="url(#atbg-lg)" opacity="0.82"/>
  <!-- 오른쪽 줄기 -->
  <path d="M60 108 C76 104 92 90 100 72 C107 56 104 38 94 24 C84 12 70 7 58 8"
        stroke="url(#atbg-lg)" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  <!-- 오른쪽 잎 6장 (좌우 대칭) -->
  <ellipse cx="64"  cy="10"  rx="9" ry="4"   transform="rotate(62 64 10)"   fill="url(#atbg-lg)" opacity="0.95"/>
  <ellipse cx="77"  cy="16"  rx="9" ry="4"   transform="rotate(75 77 16)"   fill="url(#atbg-lg)" opacity="0.90"/>
  <ellipse cx="90"  cy="28"  rx="9" ry="4"   transform="rotate(85 90 28)"   fill="url(#atbg-lg)" opacity="0.90"/>
  <ellipse cx="99"  cy="44"  rx="9" ry="4"   transform="rotate(93 99 44)"   fill="url(#atbg-lg)" opacity="0.88"/>
  <ellipse cx="102" cy="62"  rx="9" ry="4"   transform="rotate(98 102 62)"  fill="url(#atbg-lg)" opacity="0.85"/>
  <ellipse cx="97"  cy="80"  rx="9" ry="4"   transform="rotate(88 97 80)"   fill="url(#atbg-lg)" opacity="0.82"/>
  <!-- 하단 리본 매듭 -->
  <path d="M52 107 Q60 114 68 107" stroke="url(#atbg-lg)" stroke-width="2.2" stroke-linecap="round" fill="none"/>
</svg>`

/* ─── 인라인 SVG: 히어로 트로피 + 대형 월계관 합성 ───────────────────────
   award-trophy-declare.ts TROPHY_SVG / WREATH_SVG 구조 참고, 별도 크기.
   best-effort 근사 — 픽셀 클론 금지. */
const HERO_TROPHY_SVG = `<svg class="atbg-hero-trophy" viewBox="0 0 180 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="atbg-cup-g" x1="50" y1="8" x2="130" y2="160" gradientUnits="userSpaceOnUse">
      <stop offset="0%"   stop-color="#F5D77E"/>
      <stop offset="35%"  stop-color="#E8B84B"/>
      <stop offset="65%"  stop-color="#C9A030"/>
      <stop offset="100%" stop-color="#8C6A10"/>
    </linearGradient>
    <linearGradient id="atbg-cup-hi" x1="72" y1="8" x2="88" y2="110" gradientUnits="userSpaceOnUse">
      <stop offset="0%"   stop-color="#FFFBE8" stop-opacity="0.88"/>
      <stop offset="100%" stop-color="#F5D77E" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="atbg-leaf-g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"   stop-color="#F5D77E"/>
      <stop offset="100%" stop-color="#A07820"/>
    </linearGradient>
    <radialGradient id="atbg-glow" cx="50%" cy="28%" r="50%">
      <stop offset="0%"   stop-color="#FFF3B0" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#FFF3B0" stop-opacity="0"/>
    </radialGradient>
    <filter id="atbg-blur" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="10"/>
    </filter>
  </defs>
  <!-- 글로우 후광 -->
  <ellipse cx="90" cy="72" rx="70" ry="60" fill="url(#atbg-glow)" filter="url(#atbg-blur)"/>
  <!-- 월계관 리스 (트로피 뒤) -->
  <!-- 왼쪽 줄기 -->
  <path d="M90 188 C66 182 40 160 26 132 C14 108 18 76 34 52 C50 28 72 16 90 16"
        stroke="url(#atbg-leaf-g)" stroke-width="2" stroke-linecap="round" fill="none"/>
  <ellipse cx="82"  cy="18"  rx="11" ry="4.5" transform="rotate(-60 82 18)"  fill="url(#atbg-leaf-g)" opacity="0.93"/>
  <ellipse cx="64"  cy="27"  rx="11" ry="4.5" transform="rotate(-72 64 27)"  fill="url(#atbg-leaf-g)" opacity="0.88"/>
  <ellipse cx="46"  cy="44"  rx="11" ry="4.5" transform="rotate(-82 46 44)"  fill="url(#atbg-leaf-g)" opacity="0.90"/>
  <ellipse cx="32"  cy="66"  rx="11" ry="4.5" transform="rotate(-90 32 66)"  fill="url(#atbg-leaf-g)" opacity="0.86"/>
  <ellipse cx="24"  cy="92"  rx="11" ry="4.5" transform="rotate(-96 24 92)"  fill="url(#atbg-leaf-g)" opacity="0.88"/>
  <ellipse cx="24"  cy="120" rx="11" ry="4.5" transform="rotate(-100 24 120)" fill="url(#atbg-leaf-g)" opacity="0.84"/>
  <ellipse cx="34"  cy="148" rx="11" ry="4.5" transform="rotate(-90 34 148)" fill="url(#atbg-leaf-g)" opacity="0.80"/>
  <!-- 오른쪽 줄기 -->
  <path d="M90 188 C114 182 140 160 154 132 C166 108 162 76 146 52 C130 28 108 16 90 16"
        stroke="url(#atbg-leaf-g)" stroke-width="2" stroke-linecap="round" fill="none"/>
  <ellipse cx="98"  cy="18"  rx="11" ry="4.5" transform="rotate(60 98 18)"   fill="url(#atbg-leaf-g)" opacity="0.93"/>
  <ellipse cx="116" cy="27"  rx="11" ry="4.5" transform="rotate(72 116 27)"  fill="url(#atbg-leaf-g)" opacity="0.88"/>
  <ellipse cx="134" cy="44"  rx="11" ry="4.5" transform="rotate(82 134 44)"  fill="url(#atbg-leaf-g)" opacity="0.90"/>
  <ellipse cx="148" cy="66"  rx="11" ry="4.5" transform="rotate(90 148 66)"  fill="url(#atbg-leaf-g)" opacity="0.86"/>
  <ellipse cx="156" cy="92"  rx="11" ry="4.5" transform="rotate(96 156 92)"  fill="url(#atbg-leaf-g)" opacity="0.88"/>
  <ellipse cx="156" cy="120" rx="11" ry="4.5" transform="rotate(100 156 120)" fill="url(#atbg-leaf-g)" opacity="0.84"/>
  <ellipse cx="146" cy="148" rx="11" ry="4.5" transform="rotate(90 146 148)" fill="url(#atbg-leaf-g)" opacity="0.80"/>
  <!-- 하단 리본 -->
  <path d="M78 186 Q90 194 102 186" stroke="url(#atbg-leaf-g)" stroke-width="2.5" stroke-linecap="round" fill="none"/>
  <!-- 트로피 컵 몸체 (월계관 앞) -->
  <path d="M58 20 L122 20 L114 112 Q90 126 66 112 Z" fill="url(#atbg-cup-g)"/>
  <!-- 컵 상단 림 -->
  <rect x="54" y="16" width="72" height="10" rx="5" fill="#F0C84A"/>
  <!-- 하이라이트 -->
  <path d="M74 22 Q80 32 78 62 Q77 82 76 106" stroke="url(#atbg-cup-hi)" stroke-width="9" stroke-linecap="round" fill="none"/>
  <!-- 왼쪽 핸들 -->
  <path d="M62 32 C42 32 34 48 36 62 C38 74 48 82 62 82" stroke="#C9A030" stroke-width="7" stroke-linecap="round" fill="none"/>
  <path d="M62 32 C46 32 40 46 42 60 C44 70 52 78 62 76" stroke="#F5D77E" stroke-width="2.5" stroke-linecap="round" fill="none" opacity="0.55"/>
  <!-- 오른쪽 핸들 -->
  <path d="M118 32 C138 32 146 48 144 62 C142 74 132 82 118 82" stroke="#C9A030" stroke-width="7" stroke-linecap="round" fill="none"/>
  <path d="M118 32 C134 32 140 46 138 60 C136 70 128 78 118 76" stroke="#F5D77E" stroke-width="2.5" stroke-linecap="round" fill="none" opacity="0.55"/>
  <!-- 스템 -->
  <path d="M76 112 L79 138 L101 138 L104 112" fill="#C9A030"/>
  <path d="M79 138 L76 150 L104 150 L101 138" fill="#B8901E"/>
  <!-- 받침대 -->
  <rect x="70" y="150" width="40" height="9" rx="4.5" fill="#C9A030"/>
  <rect x="64" y="159" width="52" height="7" rx="3.5" fill="#B8901E"/>
  <!-- 컵 광택 점 -->
  <circle cx="90" cy="44" r="4.5" fill="#FFFBE8" opacity="0.65"/>
  <circle cx="84" cy="32" r="2.2" fill="#FFFBE8" opacity="0.50"/>
</svg>`

export const awardTrophyBadgeGrid = defineBlock<Data>({
  id: 'award-trophy-badge-grid',
  archetype: 'award',
  styleTags: ['dark', 'award', 'gold', 'trophy', 'laurel', 'grid', 'premium', 'template'],
  imageSlots: 0,
  describe:
    '어워드 트로피+뱃지 그리드(수상 아카이브). 딥블랙 배경 + 골드 보케 파티클 + 대형 골드 트로피·월계관 합성 히어로 앵커 + 대형 헤드라인 + 최대 7개 월계관 원형 뱃지 비대칭 그리드(2·3·2 행). ' +
    '수상명·연도·기관은 반드시 플레이스홀더("[수상명]", "[연도]", "[기관명]")로 — brief에 근거 없이 지어내지 않는다.',
  schema,
  css: `
/* award-trophy-badge-grid — 접두사 atbg- */
.atbg{
  position:relative;
  background:#0a0805;
  color:#fff;
  padding:52px 28px 64px;
  text-align:center;
  overflow:hidden;
  word-break:keep-all;
  overflow-wrap:break-word;
}

/* 골드 보케 파티클 — 상단 CSS 근사 (픽셀 클론 아님) */
.atbg::before{
  content:'';
  position:absolute;
  top:0;left:0;right:0;
  height:200px;
  background:
    radial-gradient(circle 3px at 18% 12%, rgba(245,215,126,.70) 0%, transparent 100%),
    radial-gradient(circle 5px at 35% 6%,  rgba(245,215,126,.55) 0%, transparent 100%),
    radial-gradient(circle 2px at 52% 10%, rgba(245,215,126,.80) 0%, transparent 100%),
    radial-gradient(circle 4px at 68% 7%,  rgba(245,215,126,.60) 0%, transparent 100%),
    radial-gradient(circle 3px at 82% 14%, rgba(245,215,126,.65) 0%, transparent 100%),
    radial-gradient(circle 6px at 90% 5%,  rgba(245,215,126,.40) 0%, transparent 100%),
    radial-gradient(circle 2px at 10% 22%, rgba(245,215,126,.50) 0%, transparent 100%),
    radial-gradient(circle 4px at 60% 18%, rgba(245,215,126,.45) 0%, transparent 100%),
    radial-gradient(circle 3px at 75% 24%, rgba(245,215,126,.35) 0%, transparent 100%),
    radial-gradient(circle 30px at 20% 8%,  rgba(201,168,76,.18) 0%, transparent 100%),
    radial-gradient(circle 50px at 80% 10%, rgba(201,168,76,.14) 0%, transparent 100%),
    radial-gradient(circle 80px at 50% 0%,  rgba(201,168,76,.10) 0%, transparent 100%);
  pointer-events:none;
  z-index:0;
}

/* 중앙 하단 글로우 오버레이 */
.atbg::after{
  content:'';
  position:absolute;
  bottom:-60px;left:50%;
  transform:translateX(-50%);
  width:400px;height:280px;
  border-radius:50%;
  background:radial-gradient(ellipse,rgba(201,168,76,.12) 0%,transparent 70%);
  pointer-events:none;
  z-index:0;
}

/* 히어로 트로피 SVG */
.atbg-hero-wrap{
  position:relative;
  z-index:1;
  margin:0 auto 28px;
  width:160px;
  height:auto;
}
.atbg-hero-trophy{
  width:160px;
  height:auto;
  display:block;
  margin:0 auto;
  filter:drop-shadow(0 6px 28px rgba(201,160,48,.60)) drop-shadow(0 2px 8px rgba(0,0,0,.80));
}

/* 헤드라인 */
.atbg-title{
  position:relative;
  z-index:1;
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(30px,8vw,52px);
  line-height:1.16;
  letter-spacing:-.02em;
  color:#C9A84C;
  margin-bottom:10px;
}
.atbg-title .em{color:#F5D77E}

/* 서브 카피 */
.atbg-subtitle{
  position:relative;
  z-index:1;
  font-family:var(--font-body);
  font-size:clamp(13px,3.5vw,16px);
  line-height:1.65;
  color:rgba(255,255,255,.62);
  margin-bottom:36px;
}
.atbg-subtitle .em{color:#E8B84B;font-weight:700}

/* 뱃지 그리드 컨테이너 */
.atbg-grid{
  position:relative;
  z-index:1;
  display:flex;
  flex-direction:column;
  gap:16px;
}

/* 그리드 행 */
.atbg-row{
  display:flex;
  justify-content:center;
  gap:12px;
  flex-wrap:nowrap;
}

/* 월계관 뱃지 단위 */
.atbg-badge{
  position:relative;
  width:120px;
  height:120px;
  flex-shrink:0;
  display:flex;
  align-items:center;
  justify-content:center;
}

/* 월계관 SVG — 뱃지 배경 레이어 */
.atbg-wreath-svg{
  position:absolute;
  top:0;left:0;
  width:100%;
  height:100%;
}

/* 뱃지 텍스트 — 월계관 안쪽 */
.atbg-badge-inner{
  position:relative;
  z-index:1;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:2px;
  padding:0 14px;
  text-align:center;
  width:100%;
  height:100%;
}

.atbg-badge-top{
  font-family:var(--font-body);
  font-size:9px;
  font-weight:700;
  letter-spacing:.06em;
  color:rgba(245,215,126,.70);
  line-height:1.2;
  text-align:center;
}

.atbg-badge-main{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(11px,2.5vw,14px);
  line-height:1.25;
  color:#F5D77E;
  text-align:center;
  letter-spacing:-.01em;
  text-shadow:0 1px 4px rgba(0,0,0,.6);
}

.atbg-badge-bottom{
  font-family:var(--font-body);
  font-size:9px;
  font-weight:600;
  letter-spacing:.05em;
  color:rgba(245,215,126,.60);
  line-height:1.2;
  text-align:center;
}
`,
  render: (d, { esc, richSafe }) => {
    // 비대칭 그리드: badges를 2·3·2 행으로 분배.
    // badges가 7개 미만이면 가능한 만큼 중앙 정렬 행으로 자동 분배.
    const total = d.badges.length
    let rows: (typeof d.badges)[]

    if (total <= 2) {
      rows = [d.badges]
    } else if (total <= 5) {
      // 2·3 또는 2·2·1 등 균형 배분
      const mid = Math.ceil(total / 2)
      rows = [d.badges.slice(0, mid), d.badges.slice(mid)]
    } else {
      // 6~7개: 2·3·2 또는 2·2·2
      const first = 2
      const last = total - 5 >= 2 ? 2 : total - first - 3
      const mid = total - first - (last > 0 ? last : 0)
      if (last > 0) {
        rows = [d.badges.slice(0, first), d.badges.slice(first, first + mid), d.badges.slice(first + mid)]
      } else {
        rows = [d.badges.slice(0, first), d.badges.slice(first)]
      }
    }

    const badgeHtml = (b: (typeof d.badges)[number]) => `
      <div class="atbg-badge" role="img" aria-label="${esc(b.mainText)}">
        ${LAUREL_BADGE_SVG}
        <div class="atbg-badge-inner">
          ${b.topLine ? `<div class="atbg-badge-top">${esc(b.topLine)}</div>` : ''}
          <div class="atbg-badge-main">${esc(b.mainText)}</div>
          ${b.bottomLine ? `<div class="atbg-badge-bottom">${esc(b.bottomLine)}</div>` : ''}
        </div>
      </div>`

    const rowsHtml = rows
      .map(
        (row) =>
          `<div class="atbg-row">${row.map(badgeHtml).join('')}</div>`,
      )
      .join('')

    const subtitleHtml = d.subtitle
      ? `<p class="atbg-subtitle">${richSafe(d.subtitle)}</p>`
      : ''

    return `
<section class="atbg" aria-label="수상 기록">
  <div class="atbg-hero-wrap" aria-hidden="true">
    ${HERO_TROPHY_SVG}
  </div>
  <h2 class="atbg-title">${richSafe(d.title)}</h2>
  ${subtitleHtml}
  <div class="atbg-grid">
    ${rowsHtml}
  </div>
</section>`
  },
})
