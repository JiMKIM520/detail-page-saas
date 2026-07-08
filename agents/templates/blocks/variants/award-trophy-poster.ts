/** PROMO 아키타입(어워드 이벤트 포스터): award-trophy-poster.
 *  [끝판왕] 어워드(수상·권위) 구성 #13 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 블랙/딥브라운 방사형 그라데이션 배경 + 상단 코너 골드 리본 컨페티
 *  + 세리프 아이브로우("Premium") + 대형 골드 "AWARDS" 디스플레이 타이틀
 *  + 서브 카피 라인 + 대형 골드 트로피 컵(인라인 SVG) + 양측 측면 로렐 가지
 *  + 하단 이벤트 기간 필 배지 — 수상 이벤트/캠페인 포스터 포맷.
 *
 *  ↔ award-trophy-declare(#14) 과의 차이:
 *     #14: 트로피 뒤 원형 리스 + 별·연도 행 + 수상명 헤드라인 + 메시지 → "수상 선언"
 *     #13(이 변형): 트로피 좌우 측면 로렐 가지 + 이벤트 기간 필 → "이벤트 포스터"
 *
 *  ⚠ 수상명·이벤트명·기간·주최기관은 반드시 플레이스홀더로 넣어야 합니다.
 *    brief(제품 설명)에 근거 없이 직접 지어내지 마십시오.
 *    (schema describe 및 이 주석 참고) */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  /** 세리프 아이브로우 한 줄 (예: "Premium"). 플레이스홀더: "[카테고리/등급]" */
  eyebrow: z.string().min(1).optional(),
  /** 대형 골드 이벤트/어워드 타이틀 (em 허용). 플레이스홀더: "[이벤트명]" 필수 */
  awardTitle: z.string().min(1),
  /** 타이틀 아래 서브 카피 (em, br 허용). 플레이스홀더: "[수상 부문 설명]" */
  subtitle: z.string().min(1).optional(),
  /** 하단 기간 필 배지 텍스트 (예: "02.01 ~ 03.30"). 플레이스홀더: "[시작일] ~ [종료일]" */
  periodLabel: z.string().min(1).optional(),
})
type Data = z.infer<typeof schema>

/* ─── 인라인 SVG: 대형 골드 트로피 컵 ────────────────────────────────────
   픽셀 클론 금지 — 구조·색감 패턴만 재현(best-effort).
   award-trophy-declare.ts 트로피 SVG를 참고, 독립적으로 재작성. */
const TROPHY_SVG = `<svg class="atp-trophy" viewBox="0 0 200 230" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="atp-cup-g" x1="55" y1="8" x2="145" y2="175" gradientUnits="userSpaceOnUse">
      <stop offset="0%"   stop-color="#F5D77E"/>
      <stop offset="30%"  stop-color="#E8B030"/>
      <stop offset="62%"  stop-color="#C9A030"/>
      <stop offset="100%" stop-color="#7A5010"/>
    </linearGradient>
    <linearGradient id="atp-hi" x1="78" y1="8" x2="96" y2="128" gradientUnits="userSpaceOnUse">
      <stop offset="0%"   stop-color="#FFFBE8" stop-opacity="0.88"/>
      <stop offset="100%" stop-color="#F5D77E" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="atp-stem-g" x1="86" y1="122" x2="114" y2="172" gradientUnits="userSpaceOnUse">
      <stop offset="0%"   stop-color="#D4A840"/>
      <stop offset="100%" stop-color="#8C6010"/>
    </linearGradient>
    <radialGradient id="atp-glow" cx="50%" cy="36%" r="46%">
      <stop offset="0%"   stop-color="#FFF5B0" stop-opacity="0.60"/>
      <stop offset="100%" stop-color="#FFF5B0" stop-opacity="0"/>
    </radialGradient>
    <filter id="atp-sf" x="-25%" y="-25%" width="150%" height="150%">
      <feGaussianBlur stdDeviation="9"/>
    </filter>
  </defs>
  <!-- 글로우 후광 -->
  <ellipse cx="100" cy="72" rx="64" ry="64" fill="url(#atp-glow)" filter="url(#atp-sf)"/>
  <!-- 컵 몸체 -->
  <path d="M60 16 L140 16 L132 122 Q100 140 68 122 Z" fill="url(#atp-cup-g)"/>
  <!-- 컵 상단 림 -->
  <rect x="56" y="10" width="88" height="14" rx="7" fill="#EEC840"/>
  <!-- 하이라이트 세로 스트라이프 -->
  <path d="M80 18 Q86 30 84 64 Q83 90 82 116"
        stroke="url(#atp-hi)" stroke-width="11" stroke-linecap="round" fill="none"/>
  <!-- 왼쪽 핸들 외곽 -->
  <path d="M64 32 C40 32 32 52 34 70 C36 86 50 96 64 96"
        stroke="#C9A030" stroke-width="9" stroke-linecap="round" fill="none"/>
  <!-- 왼쪽 핸들 하이라이트 -->
  <path d="M64 32 C48 32 42 50 44 66 C46 80 54 88 64 90"
        stroke="#F5D77E" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.55"/>
  <!-- 오른쪽 핸들 외곽 -->
  <path d="M136 32 C160 32 168 52 166 70 C164 86 150 96 136 96"
        stroke="#C9A030" stroke-width="9" stroke-linecap="round" fill="none"/>
  <!-- 오른쪽 핸들 하이라이트 -->
  <path d="M136 32 C152 32 158 50 156 66 C154 80 146 88 136 90"
        stroke="#F5D77E" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.55"/>
  <!-- 스템 상단 넥 -->
  <path d="M84 122 L88 150 L112 150 L116 122" fill="url(#atp-stem-g)"/>
  <!-- 스템 하단 플레어 -->
  <path d="M88 150 L82 164 L118 164 L112 150" fill="#A07818"/>
  <!-- 받침대 상단 -->
  <rect x="76" y="164" width="48" height="11" rx="5.5" fill="#C9A030"/>
  <!-- 받침대 하단(넓음) -->
  <rect x="68" y="175" width="64" height="10" rx="5" fill="#A07818"/>
  <!-- 컵 상단 스파클 점들 -->
  <circle cx="100" cy="46"  r="5.5" fill="#FFFBE8" opacity="0.72"/>
  <circle cx="93"  cy="33"  r="3"   fill="#FFFBE8" opacity="0.52"/>
  <circle cx="108" cy="30"  r="2"   fill="#FFFBE8" opacity="0.38"/>
</svg>`

/* ─── 인라인 SVG: 양측 로렐 가지 (좌·우 별도) ──────────────────────────
   원본 #13은 트로피 좌우에 가지가 펼쳐지는 구도 (원형 리스가 아님).
   point-award-credential.ts 로렐 SVG 구조 참고, 독립 재작성. */
const LAUREL_BRANCH_LEFT = `<svg class="atp-branch atp-branch-l" viewBox="0 0 90 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="atp-bl-g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"   stop-color="#F5D77E"/>
      <stop offset="100%" stop-color="#9A7010"/>
    </linearGradient>
  </defs>
  <!-- 메인 줄기: 오른쪽 상단에서 왼쪽 하단으로 -->
  <path d="M72 8 C56 28 34 54 22 86 C10 118 12 148 24 172"
        stroke="url(#atp-bl-g)" stroke-width="2.4" stroke-linecap="round" fill="none"/>
  <!-- 잎사귀 8장 — 줄기 왼쪽으로 펼침 -->
  <ellipse cx="62"  cy="20"  rx="13" ry="5.5" transform="rotate(-52 62 20)"  fill="url(#atp-bl-g)" opacity="0.90"/>
  <ellipse cx="50"  cy="36"  rx="13" ry="5.5" transform="rotate(-60 50 36)"  fill="url(#atp-bl-g)" opacity="0.86"/>
  <ellipse cx="38"  cy="54"  rx="13" ry="5.5" transform="rotate(-68 38 54)"  fill="url(#atp-bl-g)" opacity="0.88"/>
  <ellipse cx="28"  cy="74"  rx="13" ry="5.5" transform="rotate(-76 28 74)"  fill="url(#atp-bl-g)" opacity="0.84"/>
  <ellipse cx="20"  cy="96"  rx="12" ry="5"   transform="rotate(-82 20 96)"  fill="url(#atp-bl-g)" opacity="0.82"/>
  <ellipse cx="16"  cy="118" rx="12" ry="5"   transform="rotate(-86 16 118)" fill="url(#atp-bl-g)" opacity="0.78"/>
  <ellipse cx="18"  cy="140" rx="11" ry="4.5" transform="rotate(-78 18 140)" fill="url(#atp-bl-g)" opacity="0.72"/>
  <ellipse cx="24"  cy="160" rx="10" ry="4"   transform="rotate(-70 24 160)" fill="url(#atp-bl-g)" opacity="0.65"/>
  <!-- 작은 둥근 열매/꽃봉오리 3개 -->
  <circle cx="30" cy="130" r="3" fill="#C9A030" opacity="0.70"/>
  <circle cx="22" cy="148" r="2.5" fill="#C9A030" opacity="0.60"/>
  <circle cx="28" cy="168" r="2" fill="#C9A030" opacity="0.50"/>
</svg>`

const LAUREL_BRANCH_RIGHT = `<svg class="atp-branch atp-branch-r" viewBox="0 0 90 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="atp-br-g" x1="1" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#F5D77E"/>
      <stop offset="100%" stop-color="#9A7010"/>
    </linearGradient>
  </defs>
  <!-- 메인 줄기: 왼쪽 상단에서 오른쪽 하단으로 -->
  <path d="M18 8 C34 28 56 54 68 86 C80 118 78 148 66 172"
        stroke="url(#atp-br-g)" stroke-width="2.4" stroke-linecap="round" fill="none"/>
  <!-- 잎사귀 8장 — 줄기 오른쪽으로 펼침 -->
  <ellipse cx="28"  cy="20"  rx="13" ry="5.5" transform="rotate(52 28 20)"  fill="url(#atp-br-g)" opacity="0.90"/>
  <ellipse cx="40"  cy="36"  rx="13" ry="5.5" transform="rotate(60 40 36)"  fill="url(#atp-br-g)" opacity="0.86"/>
  <ellipse cx="52"  cy="54"  rx="13" ry="5.5" transform="rotate(68 52 54)"  fill="url(#atp-br-g)" opacity="0.88"/>
  <ellipse cx="62"  cy="74"  rx="13" ry="5.5" transform="rotate(76 62 74)"  fill="url(#atp-br-g)" opacity="0.84"/>
  <ellipse cx="70"  cy="96"  rx="12" ry="5"   transform="rotate(82 70 96)"  fill="url(#atp-br-g)" opacity="0.82"/>
  <ellipse cx="74"  cy="118" rx="12" ry="5"   transform="rotate(86 74 118)" fill="url(#atp-br-g)" opacity="0.78"/>
  <ellipse cx="72"  cy="140" rx="11" ry="4.5" transform="rotate(78 72 140)" fill="url(#atp-br-g)" opacity="0.72"/>
  <ellipse cx="66"  cy="160" rx="10" ry="4"   transform="rotate(70 66 160)" fill="url(#atp-br-g)" opacity="0.65"/>
  <!-- 작은 둥근 열매/꽃봉오리 3개 -->
  <circle cx="60" cy="130" r="3"   fill="#C9A030" opacity="0.70"/>
  <circle cx="68" cy="148" r="2.5" fill="#C9A030" opacity="0.60"/>
  <circle cx="62" cy="168" r="2"   fill="#C9A030" opacity="0.50"/>
</svg>`

export const awardTrophyPoster = defineBlock<Data>({
  id: 'award-trophy-poster',
  archetype: 'award',
  styleTags: ['dark', 'award', 'gold', 'trophy', 'poster', 'event', 'premium', 'template'],
  imageSlots: 0,
  describe:
    '어워드 이벤트 포스터. 블랙/딥브라운 방사형 배경 + 상단 코너 골드 리본 컨페티 장식 + 세리프 아이브로우("Premium" 등) + 대형 골드 디스플레이 타이틀("AWARDS" 등) + 서브 카피 라인 + 대형 골드 트로피(인라인 SVG) + 트로피 좌우 측면 로렐 가지 SVG + 하단 이벤트 기간 필 배지. ' +
    '이벤트 기간·수상명·주최기관은 반드시 플레이스홀더("[이벤트명]", "[시작일]~[종료일]")로 — brief에 근거 없이 지어내지 않는다. ' +
    '#14 award-trophy-declare와 달리 "기간 필 배지" 포맷의 캠페인 포스터 섹션.',
  schema,
  css: `
/* award-trophy-poster — 접두사 atp- */
.atp{
  position:relative;
  background:radial-gradient(ellipse 75% 55% at 50% 30%, #5c3f0e 0%, #2c1e06 42%, #0e0a02 100%);
  color:#fff;
  padding:52px 28px 56px;
  text-align:center;
  overflow:hidden;
  word-break:keep-all;
  overflow-wrap:break-word;
}

/* 중앙 후광 오버레이 */
.atp::before{
  content:'';
  position:absolute;
  top:10%;left:50%;
  transform:translateX(-50%);
  width:360px;height:360px;
  border-radius:50%;
  background:radial-gradient(circle,rgba(245,215,126,.20) 0%,rgba(245,215,126,0) 68%);
  pointer-events:none;
}

/* ── 상단 코너 리본 컨페티 (CSS pseudo + clip) ── */
.atp-confetti-l,.atp-confetti-r{
  position:absolute;
  top:0;
  width:68px;height:100px;
  pointer-events:none;
  overflow:hidden;
}
.atp-confetti-l{left:0}
.atp-confetti-r{right:0;transform:scaleX(-1)}

/* 리본 가닥 1 (넓은 황금 리본) */
.atp-confetti-l::before{
  content:'';
  position:absolute;
  left:2px;top:2px;
  width:10px;height:52px;
  background:linear-gradient(160deg,#F5D77E 0%,#C9A030 55%,#8C6010 100%);
  border-radius:calc(var(--r-scale,1)*3px);
  transform:rotate(22deg);
  transform-origin:top left;
  opacity:.92;
}
/* 리본 가닥 2 (얇은 밝은 리본) */
.atp-confetti-l::after{
  content:'';
  position:absolute;
  left:22px;top:0;
  width:6px;height:38px;
  background:linear-gradient(150deg,#FFFBE0 0%,#E8B84B 100%);
  border-radius:calc(var(--r-scale,1)*2px);
  transform:rotate(10deg);
  transform-origin:top left;
  opacity:.80;
}

/* ── 아이브로우 ── */
.atp-eyebrow{
  display:block;
  font-family:var(--font-lat),'Cormorant Garamond',serif;
  font-size:clamp(18px,4.5vw,26px);
  font-weight:500;
  font-style:italic;
  letter-spacing:.08em;
  color:rgba(255,255,255,.82);
  margin-bottom:6px;
  position:relative;z-index:1;
}

/* ── 대형 어워드 타이틀 ── */
.atp-title{
  font-family:var(--font-lat),'Cormorant Garamond',serif;
  font-size:clamp(52px,14vw,88px);
  font-weight:600;
  letter-spacing:.06em;
  line-height:1.06;
  color:#C9A84C;
  position:relative;z-index:1;
  margin-bottom:10px;
  /* 골드 텍스트 그라디언트 */
  background:linear-gradient(170deg,#F5D77E 0%,#C9A030 50%,#E8B840 100%);
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
  background-clip:text;
}
/* em 강조 — 텍스트 그라디언트 위에서 별도 override 어렵음, 밝은 outline으로 대비 */
.atp-title .em{
  -webkit-text-fill-color:#F5D77E;
  font-style:italic;
}

/* ── 서브 카피 ── */
.atp-subtitle{
  font-family:var(--font-body);
  font-size:clamp(13px,3.5vw,16px);
  font-weight:500;
  letter-spacing:.04em;
  color:rgba(255,255,255,.68);
  margin-bottom:24px;
  position:relative;z-index:1;
}
.atp-subtitle .em{color:#E8B84B;font-weight:700}

/* ── 트로피 + 로렐 가지 합성 영역 ── */
.atp-visual{
  position:relative;
  display:flex;
  align-items:flex-end;
  justify-content:center;
  gap:0;
  /* 양측 가지와 중앙 트로피의 가로 배치 */
  margin:0 auto 28px;
  max-width:360px;
  min-height:200px;
}

/* 로렐 가지 — 공통 */
.atp-branch{
  flex-shrink:0;
  width:80px;
  height:auto;
  /* 가지 하단이 트로피 받침대 레벨과 맞도록 */
  align-self:flex-end;
  margin-bottom:8px;
  filter:drop-shadow(0 2px 6px rgba(0,0,0,.55));
}
.atp-branch-l{ margin-right:-14px;z-index:0 }
.atp-branch-r{ margin-left:-14px;z-index:0 }

/* 트로피 SVG */
.atp-trophy{
  flex-shrink:0;
  width:160px;
  height:auto;
  position:relative;
  z-index:1;
  filter:
    drop-shadow(0 0 28px rgba(245,183,60,.50))
    drop-shadow(0 6px 20px rgba(0,0,0,.75));
}

/* ── 기간 필 배지 ── */
.atp-period{
  display:inline-block;
  border:1.5px solid #C9A84C;
  border-radius:999px;
  padding:10px 32px;
  font-family:var(--font-body);
  font-size:clamp(16px,4vw,22px);
  font-weight:700;
  letter-spacing:.08em;
  color:#C9A84C;
  position:relative;z-index:1;
  /* 필 내부 미세 반투명 골드 */
  background:rgba(201,168,76,.06);
}
`,
  render: (d, { esc, richSafe }) => {
    const eyebrowHtml = d.eyebrow
      ? `<span class="atp-eyebrow">${esc(d.eyebrow)}</span>`
      : ''

    const subtitleHtml = d.subtitle
      ? `<p class="atp-subtitle">${richSafe(d.subtitle)}</p>`
      : ''

    const periodHtml = d.periodLabel
      ? `<div class="atp-period" role="note" aria-label="이벤트 기간">${esc(d.periodLabel)}</div>`
      : ''

    return `
<section class="atp" aria-label="어워드 이벤트 포스터">
  <div class="atp-confetti-l" aria-hidden="true"></div>
  <div class="atp-confetti-r" aria-hidden="true"></div>

  ${eyebrowHtml}
  <h2 class="atp-title">${richSafe(d.awardTitle)}</h2>
  ${subtitleHtml}

  <div class="atp-visual" aria-hidden="true">
    ${LAUREL_BRANCH_LEFT}
    ${TROPHY_SVG}
    ${LAUREL_BRANCH_RIGHT}
  </div>

  ${periodHtml}
</section>`
  },
})
