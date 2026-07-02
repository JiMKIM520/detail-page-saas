/** STATS 아키타입(어워드 수치 히어로): award-trophy-stat.
 *  [끝판왕] 어워드(수상·권위) 구성 #7 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 블랙 스포트라이트 배경 + 대형 골드 트로피+원형 월계관(SVG) 레이어드 배경
 *  + 초대형 골드 수치 히어로(트로피 위에 오버랩) + 하단 리본 배너 2행(각 라벨+수치).
 *
 *  ⚠ 수치·라벨은 반드시 실제 데이터 기반 플레이스홀더로 채울 것.
 *    brief(제품 설명)에 수치 근거가 없는 경우 직접 지어내지 마십시오.
 *    (schema describe 및 이 주석 참고) */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  /** 최상단 별 행 개수 (기본 5, 최대 7) */
  starCount: z.number().int().min(1).max(7).optional(),
  /** 수치 위 아이브로 소제목 (예: "제품명을 입력하세요."). 플레이스홀더 권장 */
  eyebrow: z.string().min(1).optional(),
  /** 수치 바로 위 라벨 (예: "누적 판매수"). 플레이스홀더: "[지표명]" */
  statLabel: z.string().min(1),
  /** 초대형 히어로 수치 (em 허용 — 단위/부호 강조). 플레이스홀더: "[N,000]+" */
  statValue: z.string().min(1),
  /** 하단 리본 배너 2행. label=배너 중앙 소라벨, value=큰 수치/텍스트, hasStar=★ 표시 */
  ribbons: z
    .array(
      z.object({
        /** 리본 중앙 소라벨 (예: "누적 판매량"). 플레이스홀더: "[지표명]" */
        label: z.string().min(1),
        /** 리본 큰 수치/텍스트 (em 허용). 플레이스홀더: "약 [N]건 이상!" */
        value: z.string().min(1),
        /** 라벨 양측 ★ 표시 여부 (기본 false) */
        hasStar: z.boolean().optional(),
      }),
    )
    .min(1)
    .max(3),
})
type Data = z.infer<typeof schema>

/* ─── 인라인 SVG: 골드 트로피 컵 ────────────────────────────────────────────
   구조 패턴 근사(best-effort). 픽셀 클론 금지. award-trophy-declare.ts SVG 구조 참고. */
const TROPHY_SVG = `<svg class="ats-trophy" viewBox="0 0 200 230" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="ats-cup-g" x1="60" y1="10" x2="140" y2="180" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#F5D77E"/>
      <stop offset="30%" stop-color="#E8B84B"/>
      <stop offset="62%" stop-color="#C9A030"/>
      <stop offset="100%" stop-color="#8C6A10"/>
    </linearGradient>
    <linearGradient id="ats-cup-hi" x1="80" y1="10" x2="100" y2="130" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFFBE8" stop-opacity="0.88"/>
      <stop offset="100%" stop-color="#F5D77E" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="ats-glow" cx="50%" cy="28%" r="50%">
      <stop offset="0%" stop-color="#FFF3B0" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#FFF3B0" stop-opacity="0"/>
    </radialGradient>
    <filter id="ats-blur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="9"/>
    </filter>
  </defs>
  <!-- 글로우 후광 -->
  <ellipse cx="100" cy="72" rx="64" ry="64" fill="url(#ats-glow)" filter="url(#ats-blur)"/>
  <!-- 컵 몸체 -->
  <path d="M63 20 L137 20 L129 126 Q100 142 71 126 Z" fill="url(#ats-cup-g)"/>
  <!-- 컵 상단 림 -->
  <rect x="59" y="15" width="82" height="13" rx="6.5" fill="#F0C84A"/>
  <!-- 컵 내부 음영 -->
  <path d="M90 24 Q100 30 110 24" stroke="#8C6A10" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.4"/>
  <!-- 컵 하이라이트 -->
  <path d="M83 22 Q89 32 87 65 Q86 84 85 116" stroke="url(#ats-cup-hi)" stroke-width="11" stroke-linecap="round" fill="none"/>
  <!-- 왼쪽 핸들 -->
  <path d="M67 36 C44 36 36 56 38 72 C40 86 52 94 67 94" stroke="#C9A030" stroke-width="8.5" stroke-linecap="round" fill="none"/>
  <path d="M67 36 C50 36 44 54 46 68 C48 80 57 88 67 88" stroke="#F5D77E" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.55"/>
  <!-- 오른쪽 핸들 -->
  <path d="M133 36 C156 36 164 56 162 72 C160 86 148 94 133 94" stroke="#C9A030" stroke-width="8.5" stroke-linecap="round" fill="none"/>
  <path d="M133 36 C150 36 156 54 154 68 C152 80 143 88 133 88" stroke="#F5D77E" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.55"/>
  <!-- 스템 -->
  <path d="M85 126 L88 154 L112 154 L115 126" fill="#C9A030"/>
  <!-- 받침 단 1 -->
  <path d="M88 154 L84 168 L116 168 L112 154" fill="#B8901E"/>
  <!-- 받침대 -->
  <rect x="78" y="168" width="44" height="11" rx="5.5" fill="#C9A030"/>
  <rect x="72" y="179" width="56" height="9" rx="4.5" fill="#B8901E"/>
  <!-- 받침 하이라이트 -->
  <rect x="80" y="169" width="40" height="3" rx="1.5" fill="#F5D77E" opacity="0.35"/>
  <!-- 컵 표면 빛 반사 -->
  <circle cx="100" cy="50" r="5.5" fill="#FFFBE8" opacity="0.65"/>
  <circle cx="93" cy="37" r="2.8" fill="#FFFBE8" opacity="0.5"/>
</svg>`

/* ─── 인라인 SVG: 원형 월계관 리스 ─────────────────────────────────────────
   award-trophy-declare.ts 로렐 SVG 구조 참고 + 원형 완결 구도(하단 리본 매듭 포함).
   픽셀 클론 금지 — 잎사귀 배치 패턴만 재현. */
const WREATH_SVG = `<svg class="ats-wreath" viewBox="0 0 320 280" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="ats-leaf-g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F5D77E"/>
      <stop offset="100%" stop-color="#A07820"/>
    </linearGradient>
    <linearGradient id="ats-leaf-g2" x1="1" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#F5D77E"/>
      <stop offset="100%" stop-color="#A07820"/>
    </linearGradient>
  </defs>
  <!-- 왼쪽 줄기 -->
  <path d="M160 256 C118 244 76 210 56 170 C36 130 42 84 62 54 C82 24 116 10 152 12"
        stroke="url(#ats-leaf-g)" stroke-width="2.6" stroke-linecap="round" fill="none"/>
  <!-- 왼쪽 잎사귀 8장 (상→하) -->
  <ellipse cx="142" cy="18"  rx="13" ry="6"   transform="rotate(-55 142 18)"  fill="url(#ats-leaf-g)" opacity="0.92"/>
  <ellipse cx="116" cy="28"  rx="13" ry="6"   transform="rotate(-68 116 28)"  fill="url(#ats-leaf-g)" opacity="0.88"/>
  <ellipse cx="92"  cy="48"  rx="13" ry="6"   transform="rotate(-78 92 48)"   fill="url(#ats-leaf-g)" opacity="0.90"/>
  <ellipse cx="72"  cy="74"  rx="13" ry="6"   transform="rotate(-88 72 74)"   fill="url(#ats-leaf-g)" opacity="0.87"/>
  <ellipse cx="56"  cy="106" rx="13" ry="6"   transform="rotate(-94 56 106)"  fill="url(#ats-leaf-g)" opacity="0.88"/>
  <ellipse cx="50"  cy="140" rx="13" ry="6"   transform="rotate(-98 50 140)"  fill="url(#ats-leaf-g)" opacity="0.84"/>
  <ellipse cx="56"  cy="174" rx="13" ry="6"   transform="rotate(-90 56 174)"  fill="url(#ats-leaf-g)" opacity="0.80"/>
  <ellipse cx="74"  cy="204" rx="12" ry="5.5" transform="rotate(-78 74 204)"  fill="url(#ats-leaf-g)" opacity="0.76"/>
  <!-- 오른쪽 줄기 -->
  <path d="M160 256 C202 244 244 210 264 170 C284 130 278 84 258 54 C238 24 204 10 168 12"
        stroke="url(#ats-leaf-g2)" stroke-width="2.6" stroke-linecap="round" fill="none"/>
  <!-- 오른쪽 잎사귀 8장 (대칭) -->
  <ellipse cx="178" cy="18"  rx="13" ry="6"   transform="rotate(55 178 18)"   fill="url(#ats-leaf-g2)" opacity="0.92"/>
  <ellipse cx="204" cy="28"  rx="13" ry="6"   transform="rotate(68 204 28)"   fill="url(#ats-leaf-g2)" opacity="0.88"/>
  <ellipse cx="228" cy="48"  rx="13" ry="6"   transform="rotate(78 228 48)"   fill="url(#ats-leaf-g2)" opacity="0.90"/>
  <ellipse cx="248" cy="74"  rx="13" ry="6"   transform="rotate(88 248 74)"   fill="url(#ats-leaf-g2)" opacity="0.87"/>
  <ellipse cx="264" cy="106" rx="13" ry="6"   transform="rotate(94 264 106)"  fill="url(#ats-leaf-g2)" opacity="0.88"/>
  <ellipse cx="270" cy="140" rx="13" ry="6"   transform="rotate(98 270 140)"  fill="url(#ats-leaf-g2)" opacity="0.84"/>
  <ellipse cx="264" cy="174" rx="13" ry="6"   transform="rotate(90 264 174)"  fill="url(#ats-leaf-g2)" opacity="0.80"/>
  <ellipse cx="246" cy="204" rx="12" ry="5.5" transform="rotate(78 246 204)"  fill="url(#ats-leaf-g2)" opacity="0.76"/>
  <!-- 하단 중앙 리본 매듭 -->
  <path d="M145 254 Q160 264 175 254" stroke="url(#ats-leaf-g)" stroke-width="3.2" stroke-linecap="round" fill="none"/>
</svg>`

/* ─── 인라인 SVG: 별 (배지 행·리본 라벨용) ─────────────────────────────── */
const STAR_INLINE = `<svg class="ats-star" viewBox="0 0 16 16" fill="#C9A84C" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M8 0l1.8 5.5H16l-4.9 3.6 1.9 5.9L8 11.4l-5 3.6 1.9-5.9L0 5.5h6.2z"/></svg>`

/* ─── 인라인 SVG: 리본 양측 소형 월계 브래킷 장식 ──────────────────────── */
const BRACKET_L = `<svg class="ats-bracket" viewBox="0 0 32 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M28 56 C16 50 8 38 8 30 C8 22 16 10 28 4" stroke="#C9A84C" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.75"/>
  <ellipse cx="22" cy="10" rx="7" ry="3" transform="rotate(-50 22 10)" fill="#C9A84C" opacity="0.72"/>
  <ellipse cx="12" cy="22" rx="7" ry="3" transform="rotate(-68 12 22)" fill="#C9A84C" opacity="0.68"/>
  <ellipse cx="8"  cy="36" rx="7" ry="3" transform="rotate(-85 8 36)"  fill="#C9A84C" opacity="0.65"/>
  <ellipse cx="12" cy="50" rx="7" ry="3" transform="rotate(-72 12 50)" fill="#C9A84C" opacity="0.62"/>
</svg>`

const BRACKET_R = `<svg class="ats-bracket ats-bracket--r" viewBox="0 0 32 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M4 56 C16 50 24 38 24 30 C24 22 16 10 4 4" stroke="#C9A84C" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.75"/>
  <ellipse cx="10" cy="10" rx="7" ry="3" transform="rotate(50 10 10)"  fill="#C9A84C" opacity="0.72"/>
  <ellipse cx="20" cy="22" rx="7" ry="3" transform="rotate(68 20 22)"  fill="#C9A84C" opacity="0.68"/>
  <ellipse cx="24" cy="36" rx="7" ry="3" transform="rotate(85 24 36)"  fill="#C9A84C" opacity="0.65"/>
  <ellipse cx="20" cy="50" rx="7" ry="3" transform="rotate(72 20 50)"  fill="#C9A84C" opacity="0.62"/>
</svg>`

export const awardTrophyStat = defineBlock<Data>({
  id: 'award-trophy-stat',
  archetype: 'award',
  styleTags: ['dark', 'award', 'gold', 'trophy', 'stats', 'hero', 'premium', 'template'],
  imageSlots: 0,
  describe:
    '어워드 수치 히어로(판매량·리뷰 등 성과 강조). 블랙 스포트라이트 배경 + 원형 월계관+골드 트로피(인라인 SVG, 배경 레이어) + 초대형 골드 수치(트로피 앞 오버랩) + 하단 리본 배너 1~3행(라벨+수치). ' +
    '수치·라벨은 반드시 실제 데이터 기반 플레이스홀더("[N,000]+", "[지표명]")로 — brief에 근거 없이 지어내지 않는다.',
  schema,
  css: `
/* award-trophy-stat — 접두사 ats- */
.ats{
  position:relative;
  background:#0d0b07;
  color:#fff;
  padding:48px 28px 56px;
  text-align:center;
  overflow:hidden;
  word-break:keep-all;
  overflow-wrap:break-word;
}

/* 스포트라이트 원뿔 오버레이 */
.ats::before{
  content:'';
  position:absolute;
  top:-6%;left:50%;
  transform:translateX(-50%);
  width:260px;height:360px;
  border-radius:50% 50% 50% 50%/30% 30% 70% 70%;
  background:radial-gradient(ellipse 70% 90% at 50% 0%,rgba(245,215,126,.28) 0%,rgba(245,215,126,.06) 55%,transparent 100%);
  pointer-events:none;
  z-index:0;
}

/* 최상단 별 행 */
.ats-star-row{
  position:relative;
  z-index:2;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:6px;
  margin-bottom:18px;
}
.ats-star{
  width:16px;height:16px;
  flex-shrink:0;
  vertical-align:middle;
}

/* 아이브로 소제목 */
.ats-eyebrow{
  position:relative;
  z-index:2;
  font-family:var(--font-body);
  font-size:clamp(13px,3vw,16px);
  color:rgba(255,255,255,.62);
  margin-bottom:4px;
  letter-spacing:.01em;
}

/* 수치 위 라벨 */
.ats-stat-label{
  position:relative;
  z-index:2;
  font-family:var(--font-display);
  font-weight:700;
  font-size:clamp(18px,4.5vw,24px);
  color:#F5D77E;
  letter-spacing:.04em;
  margin-bottom:6px;
}

/* ── 트로피+리스+수치 합성 영역 ── */
.ats-hero{
  position:relative;
  z-index:1;
  display:flex;
  flex-direction:column;
  align-items:center;
  margin:0 auto 8px;
  max-width:400px;
}

/* 초대형 수치 — 트로피 위 오버랩 (z-index로 앞에) */
.ats-stat-value{
  position:relative;
  z-index:3;
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(68px,20vw,112px);
  line-height:1.0;
  letter-spacing:-.03em;
  color:#C9A84C;
  text-shadow:0 0 40px rgba(201,168,76,.55),0 2px 12px rgba(0,0,0,.9);
  margin-bottom:-24px;/* 아래 트로피+리스와 겹침 */
}
.ats-stat-value .em{color:#F5D77E}

/* 트로피+리스 합성 래퍼 (수치 뒤 레이어) */
.ats-visual{
  position:relative;
  z-index:2;
  width:100%;
  max-width:340px;
  display:inline-block;
}

/* 월계관 SVG — 트로피 뒤 배경 레이어 */
.ats-wreath{
  position:absolute;
  top:50%;left:50%;
  transform:translate(-50%,-52%);
  width:95%;
  max-width:320px;
  height:auto;
  z-index:0;
}

/* 트로피 SVG — 리스 앞 */
.ats-trophy{
  position:relative;
  z-index:1;
  width:60%;
  max-width:210px;
  height:auto;
  display:block;
  margin:0 auto;
  filter:drop-shadow(0 10px 36px rgba(201,160,48,.6)) drop-shadow(0 3px 10px rgba(0,0,0,.8));
}

/* ── 하단 리본 배너 영역 ── */
.ats-ribbons{
  position:relative;
  z-index:2;
  display:flex;
  flex-direction:column;
  gap:0;
  margin-top:28px;
}

/* 개별 리본 배너 */
.ats-ribbon{
  position:relative;
  display:flex;
  flex-direction:column;
  align-items:center;
  padding:18px 24px 20px;
  margin:0 0 2px;
}

/* 리본 상단 구분선 (골드 hairline) */
.ats-ribbon::before{
  content:'';
  position:absolute;
  top:0;left:8%;right:8%;
  height:1px;
  background:linear-gradient(90deg,transparent,rgba(201,168,76,.45) 30%,rgba(201,168,76,.45) 70%,transparent);
}

/* 리본 소라벨 행 */
.ats-ribbon-label-row{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:6px;
  margin-bottom:6px;
}
.ats-ribbon-label{
  font-family:var(--font-body);
  font-size:clamp(12px,2.8vw,15px);
  font-weight:600;
  color:rgba(201,168,76,.85);
  letter-spacing:.08em;
}

/* 리본 큰 수치/텍스트 */
.ats-ribbon-value{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(26px,7vw,40px);
  line-height:1.2;
  letter-spacing:-.01em;
  color:#F5D77E;
}
.ats-ribbon-value .em{color:#fff;font-weight:900}

/* 리본 양측 브래킷 장식 */
.ats-ribbon-body{
  position:relative;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:10px;
  width:100%;
}

/* 소형 월계 브래킷 SVG */
.ats-bracket{
  width:28px;height:52px;
  flex-shrink:0;
  opacity:0.82;
}
`,
  render: (d, { esc, richSafe }) => {
    /* 최상단 별 행 */
    const stars = d.starCount ?? 5
    const starRow = Array.from({ length: stars }, () => STAR_INLINE).join('')

    /* 리본 배너 HTML */
    const ribbonsHtml = d.ribbons
      .map((r) => {
        const labelStars = r.hasStar
          ? `${STAR_INLINE}<span class="ats-ribbon-label">${esc(r.label)}</span>${STAR_INLINE}`
          : `<span class="ats-ribbon-label">${esc(r.label)}</span>`

        return `
<div class="ats-ribbon">
  <div class="ats-ribbon-label-row">${labelStars}</div>
  <div class="ats-ribbon-body">
    ${BRACKET_L}
    <div class="ats-ribbon-value">${richSafe(r.value)}</div>
    ${BRACKET_R}
  </div>
</div>`
      })
      .join('')

    return `
<section class="ats" aria-label="수상 성과 수치">
  <!-- 최상단 별 행 -->
  <div class="ats-star-row" aria-hidden="true">${starRow}</div>

  ${d.eyebrow ? `<p class="ats-eyebrow">${esc(d.eyebrow)}</p>` : ''}
  <p class="ats-stat-label">${esc(d.statLabel)}</p>

  <!-- 초대형 수치 (트로피 앞 오버랩) -->
  <div class="ats-hero">
    <div class="ats-stat-value">${richSafe(d.statValue)}</div>
    <!-- 트로피+원형 월계관 합성 (수치 뒤 배경 레이어) -->
    <div class="ats-visual">
      ${WREATH_SVG}
      ${TROPHY_SVG}
    </div>
  </div>

  <!-- 하단 리본 배너 행들 -->
  <div class="ats-ribbons">
    ${ribbonsHtml}
  </div>
</section>`
  },
})
