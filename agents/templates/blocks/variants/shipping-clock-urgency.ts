/** SHIPPING 아키타입: shipping-clock-urgency
 *  피그마 028_모바일_자유배너_6 재구성 — 아날로그 시계 SVG(좌) + 디지털 카드 시간(중) + 당일발송 헤드라인·서브(우).
 *  872px 데스크톱 3구역 수평 확장. 다크 블루 배경. 이미지 슬롯 없음.
 *  톤 dark → richSafe 영역 .em 오버라이드 필수 적용. */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  headline: z.string().min(1),         // 당일발송 강조 대제목 (em,br) — 예: "당/일/발/송"
  deadline: z.string().min(1),         // 마감 시각 설명 (em,br) — 예: "오후 <em>1시</em> 이전 주문하시면 당일발송됩니다."
  cutoffHour: z.string().min(1),       // 시 두 자리 문자 (슬롯) — 예: "1" → 카드 2장으로 표시
  cutoffMin: z.string().min(1),        // 분 두 자리 문자 (슬롯) — 예: "00"
  badge: z.string().optional(),        // 배지 라벨 (순수 텍스트) — 예: "오늘만 특가"
  sub: z.string().optional(),          // 하단 보조 안내 (em,br)
})
type Data = z.infer<typeof schema>

/** 두 자리 패딩 — "1" → "01", "13" → "13" */
const pad2 = (s: string): [string, string] => {
  const str = s.padStart(2, '0').slice(0, 2)
  return [str[0], str[1]]
}

export const shippingClockUrgency = defineBlock<Data>({
  id: 'shipping-clock-urgency',
  archetype: 'shipping',
  styleTags: ['dark', 'urgency', 'shipping', 'banner'],
  imageSlots: 0,
  describe:
    '당일발송 긴박감 배너. 좌측 아날로그 시계 SVG + 중앙 검정 라운드 카드형 디지털 마감시각 + 우측 당일발송 대제목·마감안내. 다크 블루 배경. 이미지 없음. 배송/한정 타임오퍼 섹션에 적합.',
  schema,
  css: `
/* shipping-clock-urgency — prefix: siqh */
.siqh{
  position:relative;
  background:var(--brand,#0099EE);
  color:#fff;
  padding:48px var(--pad-x,56px);
  display:flex;
  align-items:center;
  gap:0;
  overflow:hidden;
}
/* richSafe em 오버라이드 — 다크 배경 위 강조 텍스트 */
.siqh .em{color:var(--em-dark,#FFF7EA)}

/* 좌: 아날로그 시계 영역 */
.siqh-clock{
  flex:0 0 160px;
  display:flex;
  align-items:center;
  justify-content:center;
}
.siqh-clock-svg{
  width:128px;
  height:128px;
  filter:drop-shadow(0 4px 18px rgba(0,0,0,.35));
}

/* 구분선 */
.siqh-divider{
  width:1px;
  height:80px;
  background:rgba(255,255,255,.25);
  margin:0 40px;
  flex-shrink:0;
}

/* 중: 디지털 시각 카드 */
.siqh-digital{
  flex:0 0 auto;
  display:flex;
  align-items:center;
  gap:6px;
}
.siqh-digit{
  width:64px;
  height:76px;
  background:#000;
  border-radius:calc(var(--r-scale,1)*10px);
  display:flex;
  align-items:center;
  justify-content:center;
  font-family:var(--font-display);
  font-weight:700;
  font-size:52px;
  color:#fff;
  line-height:1;
  box-shadow:0 6px 20px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.08);
}
.siqh-colon{
  font-family:var(--font-display);
  font-weight:500;
  font-size:64px;
  color:#fff;
  line-height:1;
  margin:0 2px;
  opacity:.9;
  /* 깜빡임 애니메이션 */
  animation:siqh-blink 1.2s step-start infinite;
}
@keyframes siqh-blink{0%,100%{opacity:.9}50%{opacity:.3}}

/* 우: 헤드라인 + 마감 안내 */
.siqh-copy{
  flex:1;
  padding-left:44px;
}
.siqh-badge{
  display:inline-block;
  background:rgba(255,255,255,.18);
  color:#fff;
  font-size:13px;
  font-weight:700;
  letter-spacing:.08em;
  padding:4px 14px;
  border-radius:calc(var(--r-scale,1)*4px);
  margin-bottom:14px;
  border:1px solid rgba(255,255,255,.28);
}
.siqh-headline{
  font-family:var(--font-display);
  font-weight:800;
  font-size:44px;
  line-height:1.1;
  letter-spacing:.06em;
  color:#fff;
  word-break:keep-all;
}
.siqh-headline .em{color:var(--em-dark,#FFF7EA)}
.siqh-deadline{
  margin-top:14px;
  font-size:17px;
  font-weight:500;
  line-height:1.6;
  color:rgba(255,255,255,.88);
  word-break:keep-all;
}
.siqh-deadline .em{color:var(--em-dark,#FFF7EA);font-weight:700}
.siqh-sub{
  margin-top:10px;
  font-size:14px;
  font-weight:400;
  color:rgba(255,255,255,.6);
  line-height:1.55;
}
.siqh-sub .em{color:var(--em-dark,#FFF7EA)}

/* 배경 장식 — 아날로그 시계 링 희미한 에코 */
.siqh-deco{
  position:absolute;
  right:var(--pad-x,56px);
  top:50%;
  transform:translateY(-50%);
  width:200px;
  height:200px;
  border-radius:50%;
  border:1.5px solid rgba(255,255,255,.08);
  pointer-events:none;
}
.siqh-deco::before{
  content:'';
  position:absolute;
  inset:20px;
  border-radius:50%;
  border:1px solid rgba(255,255,255,.05);
}
`,
  render: (d, { esc, richSafe }) => {
    const [hh0, hh1] = pad2(d.cutoffHour)
    const [mm0, mm1] = pad2(d.cutoffMin)
    return `
<section class="siqh">
  <div class="siqh-deco"></div>

  <!-- 좌: 아날로그 시계 SVG -->
  <div class="siqh-clock">
    <svg class="siqh-clock-svg" viewBox="0 0 108 108" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <!-- 시계 본체 -->
      <circle cx="54" cy="54" r="54" fill="#000"/>
      <!-- 시각 눈금 (12 · 3 · 6 · 9) -->
      <line x1="54" y1="6"  x2="54" y2="14" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
      <line x1="102" y1="54" x2="94" y2="54" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
      <line x1="54" y1="102" x2="54" y2="94" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
      <line x1="6" y1="54"  x2="14" y2="54" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
      <!-- 보조 눈금 (4개) -->
      <line x1="80.4" y1="10.5" x2="77.6" y2="15.4" stroke="rgba(255,255,255,.35)" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="97.5" y1="27.6" x2="92.6" y2="30.4" stroke="rgba(255,255,255,.35)" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="97.5" y1="80.4" x2="92.6" y2="77.6" stroke="rgba(255,255,255,.35)" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="80.4" y1="97.5" x2="77.6" y2="92.6" stroke="rgba(255,255,255,.35)" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="27.6" y1="10.5" x2="30.4" y2="15.4" stroke="rgba(255,255,255,.35)" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="10.5" y1="27.6" x2="15.4" y2="30.4" stroke="rgba(255,255,255,.35)" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="10.5" y1="80.4" x2="15.4" y2="77.6" stroke="rgba(255,255,255,.35)" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="27.6" y1="97.5" x2="30.4" y2="92.6" stroke="rgba(255,255,255,.35)" stroke-width="1.5" stroke-linecap="round"/>
      <!-- 긴 바늘 (분침) — 12시 방향으로 올라가는 형태 -->
      <line x1="54" y1="54" x2="54" y2="24" stroke="#FA462B" stroke-width="4" stroke-linecap="round"/>
      <!-- 짧은 바늘 (시침) — 1시 방향 -->
      <line x1="54" y1="54" x2="68" y2="36" stroke="#FA462B" stroke-width="5" stroke-linecap="round"/>
      <!-- 중심 원 -->
      <circle cx="54" cy="54" r="5" fill="#FA462B"/>
      <circle cx="54" cy="54" r="2.5" fill="#fff"/>
    </svg>
  </div>

  <div class="siqh-divider"></div>

  <!-- 중: 디지털 카드 시각 -->
  <div class="siqh-digital" role="img" aria-label="마감 시각 ${esc(d.cutoffHour)}시 ${esc(d.cutoffMin)}분">
    <div class="siqh-digit">${esc(hh0)}</div>
    <div class="siqh-digit">${esc(hh1)}</div>
    <span class="siqh-colon" aria-hidden="true">:</span>
    <div class="siqh-digit">${esc(mm0)}</div>
    <div class="siqh-digit">${esc(mm1)}</div>
  </div>

  <!-- 우: 카피 -->
  <div class="siqh-copy">
    ${d.badge ? `<span class="siqh-badge">${esc(d.badge)}</span>` : ''}
    <h2 class="siqh-headline">${richSafe(d.headline)}</h2>
    <p class="siqh-deadline">${richSafe(d.deadline)}</p>
    ${d.sub ? `<p class="siqh-sub">${richSafe(d.sub)}</p>` : ''}
  </div>
</section>`
  },
})
