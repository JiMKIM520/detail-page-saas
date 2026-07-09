/** SHIPPING 아키타입: shipping-deadline-clock (당일발송 마감 시계 배너). */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  /** 배너 상단 슬래시 구호. 예: "당/일/발/송" (em 허용) */
  tagline: z.string().min(1),
  /** 마감 시각 표시용 숫자 네 자리 — HH:MM 순. 각 1글자. */
  d0: z.string().length(1).default('1'),
  d1: z.string().length(1).default('3'),
  d2: z.string().length(1).default('0'),
  d3: z.string().length(1).default('0'),
  /** 마감 안내 문구. 예: "오후 1시 이전 주문 시 당일발송됩니다." */
  cutoffDesc: z.string().min(1),
  /** 보조 안내 (선택). 브리프에 근거 있을 때만 사용. */
  subNote: z.string().optional(),
  /** 배송사·택배 정보 (선택). 브리프에 근거 있을 때만 사용. */
  carrierNote: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const shippingDeadlineClock = defineBlock<Data>({
  id: 'shipping-deadline-clock',
  archetype: 'shipping',
  styleTags: ['dark', 'bold', 'em-dark', 'noimg-safe'],
  imageSlots: 0,
  describe:
    '딥 블루 배경 전폭 배너. 인라인 SVG 아날로그 시계 + 디지털 숫자 카드(검정 라운드 박스) + 당일발송 마감 카피. 마감 시각 강조형 신뢰 배너.',
  schema,
  css: `
/* ── shipping-deadline-clock (sdcl) ── */
.sdcl{
  background:var(--brand);
  padding:0 var(--pad-x,56px);
  min-height:120px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:24px;
}
/* 왼쪽: 아날로그 시계 */
.sdcl-clock{
  flex:0 0 auto;
  width:88px;
  height:88px;
}
.sdcl-clock circle.face{fill:#000;stroke:none}
.sdcl-clock .hand-h{
  stroke:var(--accent,#fa462b);
  stroke-width:4;
  stroke-linecap:round;
}
.sdcl-clock .hand-m{
  stroke:var(--accent,#fa462b);
  stroke-width:3;
  stroke-linecap:round;
}
.sdcl-clock .tick{stroke:rgba(255,255,255,.25);stroke-width:1.2}
/* 중앙: 디지털 시각 카드 행 */
.sdcl-digits{
  flex:0 0 auto;
  display:flex;
  align-items:center;
  gap:6px;
}
.sdcl-card{
  width:calc(var(--r-scale,1)*50px + 6px);
  min-width:52px;
  height:calc(var(--r-scale,1)*58px + 6px);
  min-height:60px;
  background:#000;
  border-radius:calc(var(--r-scale,1)*10px);
  display:flex;
  align-items:center;
  justify-content:center;
}
.sdcl-card span{
  font-family:var(--font-display);
  font-weight:700;
  font-size:clamp(36px,4.5vw,52px);
  color:#fff;
  line-height:1;
  letter-spacing:-.02em;
}
.sdcl-colon{
  font-family:var(--font-display);
  font-weight:500;
  font-size:clamp(40px,5vw,60px);
  color:var(--bg);
  line-height:1;
  /* 배경과 같은 컬러로 역대비 처리 — 다크 배경 위에서 흰색으로 뒤집음 */
  filter:invert(1);
  margin:0 2px;
  opacity:.9;
}
/* 오른쪽: 카피 영역 */
.sdcl-copy{
  flex:1 1 auto;
  display:flex;
  flex-direction:column;
  gap:6px;
  text-align:right;
}
.sdcl-tagline{
  font-family:var(--font-display);
  font-weight:700;
  font-size:clamp(22px,2.6vw,32px);
  color:#fff;
  letter-spacing:.04em;
  line-height:1.2;
}
.sdcl-tagline .em{color:var(--em-dark,#FFF7EA)}
.sdcl-cutoff{
  font-size:clamp(13px,1.4vw,17px);
  font-weight:500;
  color:rgba(255,255,255,.82);
  line-height:1.5;
}
.sdcl-subnote{
  font-size:clamp(11px,1.1vw,13px);
  color:rgba(255,255,255,.5);
  font-weight:400;
  line-height:1.5;
}
/* 배너 좌우 경계 강조선 */
.sdcl::before,.sdcl::after{
  content:'';
  position:absolute;
  top:0;bottom:0;
  width:3px;
  background:var(--accent,#fa462b);
  opacity:.6;
}
.sdcl{position:relative}
.sdcl::before{left:0}
.sdcl::after{right:0}
/* 트럭 SVG 장식 */
.sdcl-truck{
  flex:0 0 auto;
  width:72px;
  height:44px;
  opacity:.35;
}
.sdcl-truck path,.sdcl-truck circle{stroke:#fff;fill:none;stroke-linecap:round;stroke-linejoin:round;stroke-width:2.2}
`,
  render: (d, { esc, richSafe }) => `
<section class="sdcl">
  <!-- 아날로그 시계 (인라인 SVG) -->
  <svg class="sdcl-clock" viewBox="0 0 88 88" aria-hidden="true">
    <circle class="face" cx="44" cy="44" r="44"/>
    <!-- 눈금 12개 -->
    <line class="tick" x1="44" y1="7"  x2="44" y2="13"  transform="rotate(0   44 44)"/>
    <line class="tick" x1="44" y1="7"  x2="44" y2="13"  transform="rotate(30  44 44)"/>
    <line class="tick" x1="44" y1="7"  x2="44" y2="13"  transform="rotate(60  44 44)"/>
    <line class="tick" x1="44" y1="7"  x2="44" y2="13"  transform="rotate(90  44 44)"/>
    <line class="tick" x1="44" y1="7"  x2="44" y2="13"  transform="rotate(120 44 44)"/>
    <line class="tick" x1="44" y1="7"  x2="44" y2="13"  transform="rotate(150 44 44)"/>
    <line class="tick" x1="44" y1="7"  x2="44" y2="13"  transform="rotate(180 44 44)"/>
    <line class="tick" x1="44" y1="7"  x2="44" y2="13"  transform="rotate(210 44 44)"/>
    <line class="tick" x1="44" y1="7"  x2="44" y2="13"  transform="rotate(240 44 44)"/>
    <line class="tick" x1="44" y1="7"  x2="44" y2="13"  transform="rotate(270 44 44)"/>
    <line class="tick" x1="44" y1="7"  x2="44" y2="13"  transform="rotate(300 44 44)"/>
    <line class="tick" x1="44" y1="7"  x2="44" y2="13"  transform="rotate(330 44 44)"/>
    <!-- 시침 (13시 → 360/12*1 + 30/60*30 = 30+15 = 45°  오후1시) -->
    <line class="hand-h" x1="44" y1="44" x2="44" y2="26" transform="rotate(45 44 44)"/>
    <!-- 분침 (0분 → 0°, 12 방향) -->
    <line class="hand-m" x1="44" y1="44" x2="44" y2="16" transform="rotate(0 44 44)"/>
    <circle cx="44" cy="44" r="3" fill="var(--accent,#fa462b)"/>
  </svg>

  <!-- 디지털 숫자 카드 -->
  <div class="sdcl-digits" aria-label="마감 시각">
    <div class="sdcl-card"><span>${esc(d.d0)}</span></div>
    <div class="sdcl-card"><span>${esc(d.d1)}</span></div>
    <span class="sdcl-colon" aria-hidden="true">:</span>
    <div class="sdcl-card"><span>${esc(d.d2)}</span></div>
    <div class="sdcl-card"><span>${esc(d.d3)}</span></div>
  </div>

  <!-- 카피 -->
  <div class="sdcl-copy">
    <p class="sdcl-tagline">${richSafe(d.tagline)}</p>
    <p class="sdcl-cutoff">${esc(d.cutoffDesc)}</p>
    ${d.subNote ? `<p class="sdcl-subnote">${esc(d.subNote)}</p>` : ''}
    ${d.carrierNote ? `<p class="sdcl-subnote">${esc(d.carrierNote)}</p>` : ''}
  </div>

  <!-- 트럭 장식 SVG -->
  <svg class="sdcl-truck" viewBox="0 0 72 44" aria-hidden="true">
    <path d="M4 8h36v24H4z"/>
    <path d="M40 18h11l8 8v6H40z"/>
    <circle cx="14" cy="36" r="5"/>
    <circle cx="52" cy="36" r="5"/>
    <path d="M4 36h4M24 36h16M58 36h6"/>
  </svg>
</section>`,
})
