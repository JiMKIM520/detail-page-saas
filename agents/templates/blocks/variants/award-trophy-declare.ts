/** FEATURE 아키타입(어워드 히어로): award-trophy-declare.
 *  [끝판왕] 어워드(수상·권위) 구성 #14 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 딥브라운/블랙 배경 + 대형 골드 트로피 컵(인라인 SVG) + 양측 로렐 리스 원형 구도
 *  + 별·연도 배지 행 + 골드 수상명 대형 헤드라인 + 구분선 + 마무리 메시지.
 *
 *  ⚠ 수상명·연도·기관은 반드시 플레이스홀더로 넣어야 합니다.
 *    brief(제품 설명)에 수상 근거가 없는 경우 직접 지어내지 마십시오.
 *    (schema describe 및 이 주석 참고) */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  /** 별+연도+별 배지 행 — 연도 레이블 (예: "2025"). 플레이스홀더: "[연도]" */
  year: z.string().min(1),
  /** 골드 대형 수상명 (em 허용 — 핵심 어절 강조). 플레이스홀더: "[수상명]" 필수 */
  awardTitle: z.string().min(1),
  /** 연도 행 양측 별 개수 (기본 5) */
  starCount: z.number().int().min(1).max(7).optional(),
  /** 구분선 아래 마무리 메시지 본문 (em, br 허용) */
  message: z.string().min(1).optional(),
  /** 브랜드/회사 서브 카피 (em, br 허용). 플레이스홀더: "[회사명]과 함께하세요" */
  subMessage: z.string().min(1).optional(),
})
type Data = z.infer<typeof schema>

/* ─── 인라인 SVG: 대형 골드 트로피 컵 ────────────────────────────────────
   실제 렌더링 근사(best-effort). 픽셀 클론 금지 — 구조 패턴만 재현. */
const TROPHY_SVG = `<svg class="atd-trophy" viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="atd-cup-g" x1="60" y1="10" x2="140" y2="170" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#F5D77E"/>
      <stop offset="35%" stop-color="#E8B84B"/>
      <stop offset="65%" stop-color="#C9A030"/>
      <stop offset="100%" stop-color="#8C6A10"/>
    </linearGradient>
    <linearGradient id="atd-cup-hi" x1="80" y1="10" x2="100" y2="120" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFFBE8" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#F5D77E" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="atd-glow" cx="50%" cy="30%" r="50%">
      <stop offset="0%" stop-color="#FFF3B0" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#FFF3B0" stop-opacity="0"/>
    </radialGradient>
    <filter id="atd-blur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8"/>
    </filter>
  </defs>
  <!-- 글로우 후광 -->
  <ellipse cx="100" cy="70" rx="62" ry="62" fill="url(#atd-glow)" filter="url(#atd-blur)"/>
  <!-- 컵 몸체 -->
  <path d="M62 18 L138 18 L130 120 Q100 136 70 120 Z" fill="url(#atd-cup-g)"/>
  <!-- 컵 상단 림 -->
  <rect x="58" y="14" width="84" height="12" rx="6" fill="#F0C84A"/>
  <!-- 컵 하이라이트 -->
  <path d="M82 20 Q88 28 86 60 Q85 80 84 110" stroke="url(#atd-cup-hi)" stroke-width="10" stroke-linecap="round" fill="none"/>
  <!-- 왼쪽 핸들 -->
  <path d="M66 34 C44 34 36 52 38 68 C40 82 52 90 66 90" stroke="#C9A030" stroke-width="8" stroke-linecap="round" fill="none"/>
  <path d="M66 34 C50 34 44 50 46 64 C48 76 56 84 66 84" stroke="#F5D77E" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.6"/>
  <!-- 오른쪽 핸들 -->
  <path d="M134 34 C156 34 164 52 162 68 C160 82 148 90 134 90" stroke="#C9A030" stroke-width="8" stroke-linecap="round" fill="none"/>
  <path d="M134 34 C150 34 156 50 154 64 C152 76 144 84 134 84" stroke="#F5D77E" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.6"/>
  <!-- 스템 -->
  <path d="M85 120 L88 148 L112 148 L115 120" fill="#C9A030"/>
  <path d="M88 148 L84 162 L116 162 L112 148" fill="#B8901E"/>
  <!-- 받침대 -->
  <rect x="78" y="162" width="44" height="10" rx="5" fill="#C9A030"/>
  <rect x="72" y="172" width="56" height="8" rx="4" fill="#B8901E"/>
  <!-- 컵 표면 빛 반사 점 -->
  <circle cx="100" cy="48" r="5" fill="#FFFBE8" opacity="0.7"/>
  <circle cx="94" cy="36" r="2.5" fill="#FFFBE8" opacity="0.5"/>
</svg>`

/* ─── 인라인 SVG: 로렐 리스 (좌+우 합성 원형 구도) ─────────────────────
   point-award-credential.ts 로렐 SVG 구조 참고 + 원형 리스 근사. */
const WREATH_SVG = `<svg class="atd-wreath" viewBox="0 0 300 240" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="atd-leaf-g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F5D77E"/>
      <stop offset="100%" stop-color="#A07820"/>
    </linearGradient>
  </defs>
  <!-- 왼쪽 리스 줄기 -->
  <path d="M150 220 C110 210 70 180 52 148 C36 118 40 80 58 54 C76 28 106 16 138 18"
        stroke="url(#atd-leaf-g)" stroke-width="2.4" stroke-linecap="round" fill="none"/>
  <!-- 왼쪽 잎사귀 7장 -->
  <ellipse cx="128" cy="24"  rx="12" ry="5.5" transform="rotate(-58 128 24)"  fill="url(#atd-leaf-g)" opacity="0.92"/>
  <ellipse cx="104" cy="34"  rx="12" ry="5.5" transform="rotate(-68 104 34)"  fill="url(#atd-leaf-g)" opacity="0.88"/>
  <ellipse cx="82"  cy="52"  rx="12" ry="5.5" transform="rotate(-78 82 52)"   fill="url(#atd-leaf-g)" opacity="0.90"/>
  <ellipse cx="64"  cy="76"  rx="12" ry="5.5" transform="rotate(-88 64 76)"   fill="url(#atd-leaf-g)" opacity="0.86"/>
  <ellipse cx="52"  cy="104" rx="12" ry="5.5" transform="rotate(-95 52 104)"  fill="url(#atd-leaf-g)" opacity="0.88"/>
  <ellipse cx="50"  cy="134" rx="12" ry="5.5" transform="rotate(-100 50 134)" fill="url(#atd-leaf-g)" opacity="0.84"/>
  <ellipse cx="60"  cy="162" rx="12" ry="5.5" transform="rotate(-92 60 162)"  fill="url(#atd-leaf-g)" opacity="0.80"/>
  <!-- 오른쪽 리스 줄기 -->
  <path d="M150 220 C190 210 230 180 248 148 C264 118 260 80 242 54 C224 28 194 16 162 18"
        stroke="url(#atd-leaf-g)" stroke-width="2.4" stroke-linecap="round" fill="none"/>
  <!-- 오른쪽 잎사귀 7장 (좌우 대칭) -->
  <ellipse cx="172" cy="24"  rx="12" ry="5.5" transform="rotate(58 172 24)"   fill="url(#atd-leaf-g)" opacity="0.92"/>
  <ellipse cx="196" cy="34"  rx="12" ry="5.5" transform="rotate(68 196 34)"   fill="url(#atd-leaf-g)" opacity="0.88"/>
  <ellipse cx="218" cy="52"  rx="12" ry="5.5" transform="rotate(78 218 52)"   fill="url(#atd-leaf-g)" opacity="0.90"/>
  <ellipse cx="236" cy="76"  rx="12" ry="5.5" transform="rotate(88 236 76)"   fill="url(#atd-leaf-g)" opacity="0.86"/>
  <ellipse cx="248" cy="104" rx="12" ry="5.5" transform="rotate(95 248 104)"  fill="url(#atd-leaf-g)" opacity="0.88"/>
  <ellipse cx="250" cy="134" rx="12" ry="5.5" transform="rotate(100 250 134)" fill="url(#atd-leaf-g)" opacity="0.84"/>
  <ellipse cx="240" cy="162" rx="12" ry="5.5" transform="rotate(92 240 162)"  fill="url(#atd-leaf-g)" opacity="0.80"/>
  <!-- 하단 중앙 리본 매듭 -->
  <path d="M138 218 Q150 226 162 218" stroke="url(#atd-leaf-g)" stroke-width="3" stroke-linecap="round" fill="none"/>
</svg>`

/* ─── 별 아이콘 (연도 행 양측) ─────────────────────────────────────────── */
const STAR_INLINE = `<svg class="atd-star" viewBox="0 0 16 16" fill="#C9A84C" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M8 0l1.8 5.5H16l-4.9 3.6 1.9 5.9L8 11.4l-5 3.6 1.9-5.9L0 5.5h6.2z"/></svg>`

export const awardTrophyDeclare = defineBlock<Data>({
  id: 'award-trophy-declare',
  archetype: 'award',
  styleTags: ['dark', 'award', 'gold', 'trophy', 'hero', 'premium', 'template'],
  imageSlots: 0,
  describe:
    '어워드 선언 히어로(수상·권위). 딥브라운/블랙 배경 + 대형 골드 트로피(인라인 SVG) + 양측 로렐 리스 원형 구도 + 별·연도 배지 행 + 골드 수상명 대형 헤드라인 + 구분선 + 마무리 메시지. ' +
    '수상명·연도는 반드시 플레이스홀더("[수상명]", "[연도]")로 — brief에 근거 없이 지어내지 않는다.',
  schema,
  css: `
/* award-trophy-declare — 접두사 atd- */
.atd{
  position:relative;
  background:radial-gradient(ellipse 80% 60% at 50% 28%, #5a3e10 0%, #2a1e08 45%, #110c04 100%);
  color:#fff;
  padding:52px 32px 60px;
  text-align:center;
  overflow:hidden;
  word-break:keep-all;
  overflow-wrap:break-word;
}

/* 골드 방사형 후광 오버레이 */
.atd::before{
  content:'';
  position:absolute;
  top:-10%;left:50%;
  transform:translateX(-50%);
  width:340px;height:340px;
  border-radius:50%;
  background:radial-gradient(circle,rgba(245,215,126,.22) 0%,rgba(245,215,126,0) 70%);
  pointer-events:none;
}

/* 컨페티 리본 — 상단 좌우 장식 (CSS로 근사) */
.atd-ribbon-l,.atd-ribbon-r{
  position:absolute;
  top:0;
  width:48px;height:80px;
  pointer-events:none;
  overflow:hidden;
}
.atd-ribbon-l{left:0}
.atd-ribbon-r{right:0;transform:scaleX(-1)}
.atd-ribbon-l::before,.atd-ribbon-l::after,
.atd-ribbon-r::before,.atd-ribbon-r::after{
  content:'';
  position:absolute;
  border-radius:2px;
}
.atd-ribbon-l::before{
  left:4px;top:4px;
  width:6px;height:38px;
  background:linear-gradient(180deg,#F5D77E,#C9A030);
  transform:rotate(18deg);
  transform-origin:top center;
}
.atd-ribbon-l::after{
  left:16px;top:0;
  width:5px;height:28px;
  background:linear-gradient(180deg,#FFFBE0,#E8B84B);
  transform:rotate(8deg);
  transform-origin:top center;
}

/* 트로피+리스 합성 래퍼 */
.atd-visual{
  position:relative;
  display:inline-block;
  width:100%;
  max-width:320px;
  margin:0 auto 28px;
}

/* 로렐 리스 SVG — 트로피 뒤 배경 레이어 */
.atd-wreath{
  position:absolute;
  top:50%;left:50%;
  transform:translate(-50%,-54%);
  width:90%;
  max-width:290px;
  height:auto;
  z-index:0;
}

/* 트로피 SVG — 리스 앞 */
.atd-trophy{
  position:relative;
  z-index:1;
  width:62%;
  max-width:200px;
  height:auto;
  display:block;
  margin:0 auto;
  filter:drop-shadow(0 8px 32px rgba(201,160,48,.55)) drop-shadow(0 2px 8px rgba(0,0,0,.7));
}

/* 별 · 연도 배지 행 */
.atd-badge-row{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:5px;
  margin-bottom:20px;
  flex-wrap:wrap;
}
.atd-star{
  width:14px;height:14px;
  flex-shrink:0;
  vertical-align:middle;
}
.atd-year{
  font-family:var(--font-display);
  font-size:clamp(18px,4vw,24px);
  font-weight:800;
  color:#C9A84C;
  letter-spacing:.16em;
  line-height:1;
  padding:0 6px;
}

/* 수상명 대형 골드 헤드라인 */
.atd-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(36px,9vw,64px);
  line-height:1.14;
  letter-spacing:-.02em;
  color:#C9A84C;
  margin-bottom:0;
}
/* .em → 더 밝은 골드 강조 */
.atd-title .em{color:#F5D77E}

/* 구분선 */
.atd-divider{
  width:80%;
  max-width:280px;
  height:1px;
  background:rgba(201,168,76,.35);
  margin:28px auto 24px;
}

/* 마무리 메시지 */
.atd-message{
  font-family:var(--font-body);
  font-size:clamp(14px,3.5vw,17px);
  line-height:1.7;
  color:rgba(255,255,255,.78);
  margin-bottom:0;
}
/* 다크 배경 — .em은 밝은 골드 override */
.atd-message .em{color:#F5D77E;font-weight:700}

.atd-sub{
  margin-top:10px;
  font-family:var(--font-body);
  font-size:clamp(13px,3vw,15px);
  line-height:1.6;
  color:rgba(255,255,255,.52);
}
.atd-sub .em{color:#E8B84B;font-weight:600}
`,
  render: (d, { esc, richSafe }) => {
    const stars = d.starCount ?? 5
    const starRow = Array.from({ length: stars }, () => STAR_INLINE).join('')

    const badgeRow = `
<div class="atd-badge-row">
  ${starRow}
  <span class="atd-year">${esc(d.year)}</span>
  ${starRow}
</div>`

    const divider = d.message || d.subMessage
      ? '<div class="atd-divider" role="separator"></div>'
      : ''

    const messageHtml = d.message
      ? `<p class="atd-message">${richSafe(d.message)}</p>`
      : ''

    const subHtml = d.subMessage
      ? `<p class="atd-sub">${richSafe(d.subMessage)}</p>`
      : ''

    return `
<section class="atd" aria-label="수상 선언">
  <div class="atd-ribbon-l" aria-hidden="true"></div>
  <div class="atd-ribbon-r" aria-hidden="true"></div>
  <div class="atd-visual">
    ${WREATH_SVG}
    ${TROPHY_SVG}
  </div>
  ${badgeRow}
  <h2 class="atd-title">${richSafe(d.awardTitle)}</h2>
  ${divider}
  ${messageHtml}
  ${subHtml}
</section>`
  },
})
