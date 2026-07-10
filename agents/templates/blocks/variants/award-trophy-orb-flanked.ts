/** AWARD 아키타입: award-trophy-orb-flanked
 *  좌우 대형 트로피 일러스트가 중앙 광택 구체(orb)를 프레임처럼 감싸는 3요소 오버랩 어워드 섹션.
 *  이미지 없을 때: 구체는 CSS 레이디얼 그라디언트 글로우로 강등(noimg-safe).
 */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  title: z.string().min(1),               // (em,br) 헤드라인
  subtitle: z.string().optional(),        // (em) 소제목/수상 기관
  badge: z.string().optional(),           // 상단 라벨 (예: "2024 수상")
  image: z.string().optional(),           // (url) 구체 안 원형 이미지
  awards: z
    .array(
      z.object({
        name: z.string().min(1),          // 수상명
        year: z.string().optional(),      // 연도 (예: "2024")
      }),
    )
    .min(1)
    .max(4),
})
type Data = z.infer<typeof schema>

/** 트로피 몸체 SVG — 좌측용. transform="scale(-1,1) translate(-W,0)" 로 우측 미러 */
const TROPHY_SVG = (cls: string) => `<svg class="${cls}" viewBox="0 0 282 507" aria-hidden="true">
  <!-- 받침대 -->
  <rect x="91" y="430" width="100" height="14" rx="7" fill="url(#arwe-g-base)"/>
  <rect x="106" y="444" width="70" height="28" rx="5" fill="url(#arwe-g-stem)"/>
  <rect x="82" y="470" width="118" height="18" rx="9" fill="url(#arwe-g-plinth)"/>
  <!-- 컵 몸체 -->
  <path d="M80 140 Q68 260 100 360 Q120 400 141 410 Q162 400 182 360 Q214 260 202 140 Z"
        fill="url(#arwe-g-cup)"/>
  <!-- 컵 테두리 광택 -->
  <path d="M80 140 Q68 260 100 360 Q120 400 141 410 Q162 400 182 360 Q214 260 202 140 Z"
        fill="url(#arwe-g-sheen)" opacity=".55"/>
  <!-- 핸들 좌 -->
  <path d="M80 180 Q38 190 36 250 Q34 310 80 320" fill="none" stroke="url(#arwe-g-handle)" stroke-width="22" stroke-linecap="round"/>
  <!-- 핸들 우 -->
  <path d="M202 180 Q244 190 246 250 Q248 310 202 320" fill="none" stroke="url(#arwe-g-handle)" stroke-width="22" stroke-linecap="round"/>
  <!-- 상단 원형 림 -->
  <ellipse cx="141" cy="140" rx="61" ry="14" fill="url(#arwe-g-rim)"/>
  <!-- 별 장식 -->
  <g fill="url(#arwe-g-star)" opacity=".9">
    <polygon points="141,60 146,78 164,78 150,89 155,107 141,96 127,107 132,89 118,78 136,78"
             transform="scale(.72) translate(55,20)"/>
  </g>
  <!-- 스파클 점들 -->
  <g fill="url(#arwe-g-spark)">
    <circle cx="52"  cy="170" r="4"/>
    <circle cx="38"  cy="230" r="2.5"/>
    <circle cx="44"  cy="290" r="3.5"/>
    <circle cx="230" cy="200" r="3"/>
    <circle cx="246" cy="270" r="2"/>
    <circle cx="238" cy="330" r="4"/>
    <circle cx="120" cy="88"  r="2.5"/>
    <circle cx="165" cy="72"  r="3"/>
  </g>
</svg>`

export const awardTrophyOrbFlanked = defineBlock<Data>({
  id: 'award-trophy-orb-flanked',
  archetype: 'award',
  styleTags: ['dark', 'premium', 'award', 'noimg-safe'],
  imageSlots: 1,
  describe:
    '좌우 대형 황금 트로피 일러스트가 중앙 광택 구체를 프레임처럼 감싸는 3요소 오버랩 어워드 섹션. 그라디언트 다크 배경, 수상 목록 하단 배치. 이미지 없으면 구체는 CSS 글로우로 강등(noimg-safe).',
  schema,
  css: `
/* ─── award-trophy-orb-flanked (prefix: arwe) ─── */
.arwe{
  position:relative;
  padding:72px var(--pad-x,56px) 80px;
  background:linear-gradient(160deg,#1a1224 0%,#2b1a3a 40%,#1e1030 70%,#120b20 100%);
  overflow:hidden;
  text-align:center;
}
/* 배경 글로우 후광 */
.arwe::before{
  content:'';
  position:absolute;
  inset:0;
  background:
    radial-gradient(ellipse 60% 55% at 50% 48%, rgba(212,168,72,.18) 0%, transparent 70%),
    radial-gradient(ellipse 35% 25% at 20% 60%, rgba(180,120,60,.12) 0%, transparent 60%),
    radial-gradient(ellipse 35% 25% at 80% 60%, rgba(180,120,60,.12) 0%, transparent 60%);
  pointer-events:none;
}
/* 배지/라벨 */
.arwe-badge{
  display:inline-block;
  background:linear-gradient(135deg,#c9922a,#f5d57a,#c07d20);
  color:#1a1224;
  font-family:var(--font-display);
  font-size:13px;
  font-weight:800;
  letter-spacing:.12em;
  padding:6px 22px;
  border-radius:999px;
  margin-bottom:24px;
}
/* 제목 */
.arwe-title{
  font-family:var(--font-display);
  font-size:clamp(28px,4.2vw,46px);
  font-weight:400;
  line-height:1.15;
  color:#F5ECDF;
  margin-bottom:10px;
}
.arwe-title .em{color:var(--em-dark,#FFF7EA)}
/* 소제목 */
.arwe-sub{
  font-size:15px;
  color:rgba(245,236,223,.55);
  letter-spacing:.04em;
  margin-bottom:0;
}
.arwe-sub .em{color:var(--em-dark,#FFF7EA)}
/* 3요소 무대 */
.arwe-stage{
  position:relative;
  display:flex;
  align-items:center;
  justify-content:center;
  margin:32px auto 0;
  width:100%;
  max-width:760px;
  height:380px;
}
/* 트로피 SVG */
.arwe-trophy-l,
.arwe-trophy-r{
  position:absolute;
  top:0;
  width:220px;
  height:380px;
  flex-shrink:0;
  filter:drop-shadow(0 12px 32px rgba(201,146,42,.35));
}
.arwe-trophy-l{ left:0; }
.arwe-trophy-r{ right:0; transform:scaleX(-1); }
/* 중앙 구체 */
.arwe-orb{
  position:relative;
  width:220px;
  height:220px;
  border-radius:50%;
  overflow:hidden;
  flex-shrink:0;
  box-shadow:
    0 0 0 3px rgba(212,168,72,.4),
    0 0 0 10px rgba(212,168,72,.12),
    0 24px 60px -10px rgba(0,0,0,.7),
    inset 0 0 40px rgba(245,213,122,.08);
  background:radial-gradient(circle at 38% 32%,#4a3060 0%,#2b1a3a 45%,#120b20 100%);
}
/* 이미지 있을 때 */
.arwe-orb-img{
  width:100%;
  height:100%;
  object-fit:cover;
  border-radius:50%;
  display:block;
}
/* 이미지 없을 때 fallback 글로우 (ph 클래스가 display:none!important 적용 — orb 자체 배경이 fallback) */
.arwe-orb .ph{ display:none!important }
/* 구체 상단 광택 */
.arwe-orb::after{
  content:'';
  position:absolute;
  top:8px;left:28px;
  width:80px;height:60px;
  background:radial-gradient(ellipse,rgba(255,255,255,.22) 0%,transparent 75%);
  border-radius:50%;
  pointer-events:none;
}
/* 수상 목록 */
.arwe-awards{
  display:flex;
  justify-content:center;
  flex-wrap:wrap;
  gap:12px 20px;
  margin-top:40px;
}
.arwe-award-item{
  display:flex;
  align-items:center;
  gap:8px;
  background:rgba(245,236,223,.07);
  border:1px solid rgba(212,168,72,.25);
  border-radius:calc(var(--r-scale,1)*10px);
  padding:10px 20px;
  color:#F5ECDF;
  font-size:14px;
  font-weight:600;
}
.arwe-award-item .arwe-trophy-icon{
  width:18px;height:18px;
  opacity:.75;
  color:#f5d57a;
  flex-shrink:0;
}
.arwe-award-year{
  font-size:12px;
  font-family:var(--font-lat,'Cormorant Garamond',serif);
  color:rgba(245,213,122,.7);
  margin-left:2px;
}
/* SVG 그라디언트 defs */
.arwe-defs{ position:absolute;width:0;height:0;overflow:hidden }
`,
  render: (d, { esc, richSafe, icon }) => {
    const awardItems = d.awards
      .map(
        (a) => `
      <div class="arwe-award-item">
        <span class="arwe-trophy-icon">${icon('trophy')}</span>
        <span>${esc(a.name)}</span>${a.year ? `<span class="arwe-award-year">${esc(a.year)}</span>` : ''}
      </div>`,
      )
      .join('')

    // 구체 내 이미지 — 이미지 없으면 orb 자체 배경(CSS 레이디얼 글로우)이 표시됨
    const orbContent = d.image
      ? media(d.image, 'arwe-orb-img', '수상 제품')
      : ''

    return `
<section class="arwe">
  <!-- SVG 그라디언트 팔레트 (황금/크림/그라디언트) -->
  <svg class="arwe-defs" aria-hidden="true">
    <defs>
      <linearGradient id="arwe-g-cup" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%"   stop-color="#f5d57a"/>
        <stop offset="35%"  stop-color="#c9922a"/>
        <stop offset="65%"  stop-color="#e8b84b"/>
        <stop offset="100%" stop-color="#755223"/>
      </linearGradient>
      <linearGradient id="arwe-g-sheen" x1="0" y1="0" x2=".6" y2="1">
        <stop offset="0%"  stop-color="#fff9c5" stop-opacity=".7"/>
        <stop offset="60%" stop-color="#fff9c5" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="arwe-g-handle" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%"   stop-color="#c9922a"/>
        <stop offset="50%"  stop-color="#f5d57a"/>
        <stop offset="100%" stop-color="#755223"/>
      </linearGradient>
      <linearGradient id="arwe-g-rim" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%"   stop-color="#755223"/>
        <stop offset="50%"  stop-color="#fff9c5"/>
        <stop offset="100%" stop-color="#755223"/>
      </linearGradient>
      <linearGradient id="arwe-g-base" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%"   stop-color="#755223"/>
        <stop offset="50%"  stop-color="#e8b84b"/>
        <stop offset="100%" stop-color="#755223"/>
      </linearGradient>
      <linearGradient id="arwe-g-stem" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%"   stop-color="#c9922a"/>
        <stop offset="100%" stop-color="#755223"/>
      </linearGradient>
      <linearGradient id="arwe-g-plinth" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%"   stop-color="#755223"/>
        <stop offset="40%"  stop-color="#f5d57a"/>
        <stop offset="100%" stop-color="#755223"/>
      </linearGradient>
      <radialGradient id="arwe-g-star" cx="50%" cy="40%" r="60%">
        <stop offset="0%"   stop-color="#fff9c5"/>
        <stop offset="100%" stop-color="#c9922a"/>
      </radialGradient>
      <radialGradient id="arwe-g-spark" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stop-color="#fff9c5"/>
        <stop offset="100%" stop-color="#f5d57a" stop-opacity=".5"/>
      </radialGradient>
    </defs>
  </svg>

  ${d.badge ? `<div class="arwe-badge">${esc(d.badge)}</div>` : ''}
  <h2 class="arwe-title">${richSafe(d.title)}</h2>
  ${d.subtitle ? `<p class="arwe-sub">${richSafe(d.subtitle)}</p>` : ''}

  <!-- 3요소 무대: 좌 트로피 + 중앙 구체 + 우 트로피 -->
  <div class="arwe-stage">
    ${TROPHY_SVG('arwe-trophy-l')}
    <div class="arwe-orb">${orbContent}</div>
    ${TROPHY_SVG('arwe-trophy-r')}
  </div>

  <!-- 수상 목록 -->
  <div class="arwe-awards">${awardItems}</div>
</section>`
  },
})
