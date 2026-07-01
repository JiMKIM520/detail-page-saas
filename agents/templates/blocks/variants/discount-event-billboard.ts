/** DISCOUNT 아키타입(템플릿 충실 재현): discount-event-billboard.
 *  와디즈 200섹션 15_할인_571:993 패턴을 토큰 기반으로 재구성(클론 아님).
 *  초대형 이벤트명 빌보드(다크) + 반복 텍스트 ticker 밴드(상하) + 2 이미지 소품 +
 *  3 pill 혜택 행 + 기간·클로징 마무리. 블랙프라이데이·시즌세일 임팩트형.
 *  세일 레드(#E8002D)는 브랜드색이 아닌 커머스 보편 신호 → 시맨틱 하드코딩. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  tickerText: z.string().min(1).optional(),         // 반복 ticker 문구 예: "BLACK FRIDAY SALE"
  preTitle: z.string().min(1).optional(),           // 빌보드 위 소자 캐치카피 (em,br)
  eventName: z.string().min(1),                     // 초대형 이벤트명 1행 예: "BLACK"
  eventNameLine2: z.string().min(1).optional(),     // 초대형 이벤트명 2행 예: "FRIDAY"
  prop1Image: z.string().optional(),                // 3D 소품 이미지 1 (url)
  prop2Image: z.string().optional(),                // 3D 소품 이미지 2 (url)
  benefits: z
    .array(z.object({ text: z.string().min(1) }))  // 혜택 pill 행 (em,br)
    .min(2)
    .max(4),
  period: z.string().min(1).optional(),             // 이벤트 기간 예: "2026.06.23~06.30"
  closing: z.string().min(1),                       // 마무리 헤드라인 (em,br)
})
type Data = z.infer<typeof schema>

export const discountEventBillboard = defineBlock<Data>({
  id: 'discount-event-billboard',
  archetype: 'discount' as any,
  styleTags: ['dark', 'impact', 'template', 'billboard', 'sale'],
  imageSlots: 2,
  describe:
    '이벤트 빌보드(다크 임팩트). 반복 ticker 밴드 + 초대형 이벤트명 + 3D 소품 이미지 + 3 pill 혜택 행 + 기간·클로징. 블랙프라이데이·시즌세일 전용.',
  schema,
  css: `
/* ── 전체 래퍼 ── */
.deb{background:var(--ink);color:#fff;overflow:hidden}

/* ── Ticker 밴드 ── */
.deb-ticker{
  background:color-mix(in srgb,var(--ink) 82%,#fff);
  border-top:1px solid rgba(255,255,255,.12);
  border-bottom:1px solid rgba(255,255,255,.12);
  padding:10px 0;
  overflow:hidden;
  white-space:nowrap
}
.deb-ticker-inner{
  display:inline-flex;
  gap:0;
  animation:deb-scroll 18s linear infinite
}
@keyframes deb-scroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
.deb-ticker-item{
  display:inline-block;
  font-family:'Paperlogy',var(--font-display),sans-serif;
  font-weight:800;
  font-size:14px;
  letter-spacing:.14em;
  color:rgba(255,255,255,.55);
  padding:0 28px;
  text-transform:uppercase
}
.deb-ticker-item .deb-sep{
  display:inline-block;
  width:6px;height:6px;
  background:#E8002D;
  border-radius:50%;
  vertical-align:middle;
  margin:0 14px 2px
}

/* ── 빌보드 본체 ── */
.deb-bb{
  position:relative;
  padding:48px 44px 0;
  min-height:420px;
  display:flex;
  flex-direction:column
}

/* 배경 방사 광원 */
.deb-bb::before{
  content:"";
  position:absolute;
  inset:0;
  background:radial-gradient(ellipse 76% 56% at 50% 38%,rgba(255,255,255,.04) 0%,transparent 70%);
  pointer-events:none
}

/* 상단 캐치카피 */
.deb-pretitle{
  display:flex;
  align-items:center;
  gap:8px;
  font-size:15px;
  font-weight:500;
  color:rgba(255,255,255,.72);
  letter-spacing:-.01em;
  margin-bottom:14px;
  position:relative;z-index:1
}
.deb-bolt{
  display:inline-flex;
  color:#E8002D;
  flex-shrink:0
}
.deb-pretitle .em{color:var(--accent)}

/* 초대형 이벤트명 */
.deb-eventname{
  font-family:'Paperlogy',var(--font-display),sans-serif;
  font-weight:800;
  font-size:clamp(82px,16vw,148px);
  line-height:.96;
  letter-spacing:-.03em;
  color:#fff;
  text-shadow:0 4px 32px rgba(0,0,0,.35);
  position:relative;z-index:1
}
.deb-eventname-l2{
  display:block;
  color:#fff
}

/* 소품 이미지 컨테이너 */
.deb-props{
  position:relative;
  height:200px;
  margin:0 -44px;
  overflow:visible;
  flex-shrink:0
}
.deb-prop1{
  position:absolute;
  left:24px;
  bottom:-10px;
  width:160px;height:160px;
  object-fit:contain
}
.deb-prop2{
  position:absolute;
  right:18px;
  bottom:-10px;
  width:180px;height:180px;
  object-fit:contain
}
.deb-prop1.ph,.deb-prop2.ph{
  background:rgba(255,255,255,.06);
  border:2px dashed rgba(255,255,255,.2);
  border-radius:16px
}

/* ── 혜택 pill 영역 ── */
.deb-benefits{
  padding:40px 44px 32px;
  display:flex;
  flex-direction:column;
  gap:14px
}
.deb-pill{
  display:flex;
  align-items:center;
  gap:16px;
  background:rgba(255,255,255,.07);
  border:1px solid rgba(255,255,255,.13);
  border-radius:12px;
  padding:20px 26px
}
.deb-pill-dot{
  flex-shrink:0;
  width:8px;height:8px;
  border-radius:50%;
  background:#E8002D
}
.deb-pill-text{
  font-family:var(--font-body),'Pretendard',sans-serif;
  font-size:17px;
  font-weight:500;
  color:#fff;
  letter-spacing:-.02em;
  line-height:1.45
}
.deb-pill-text .em{color:var(--accent);font-weight:700}

/* ── 클로징 영역 ── */
.deb-closing{
  padding:28px 44px 56px;
  border-top:1px solid rgba(255,255,255,.1)
}
.deb-period{
  font-size:14px;
  color:rgba(255,255,255,.48);
  letter-spacing:.04em;
  margin-bottom:14px;
  font-family:var(--font-body)
}
.deb-close-head{
  font-family:'Paperlogy',var(--font-display),sans-serif;
  font-weight:800;
  font-size:clamp(32px,6.5vw,52px);
  line-height:1.22;
  letter-spacing:-.025em;
  color:#fff
}
.deb-close-head .em{color:#E8002D}
`,
  render: (d, { esc, richSafe }) => {
    const ticker = d.tickerText ?? 'BLACK FRIDAY SALE'
    // Build ticker: repeat enough copies to fill double-width for seamless loop
    const copies = Array.from({ length: 10 }, () =>
      `<span class="deb-ticker-item">${esc(ticker)}<span class="deb-sep"></span></span>`
    ).join('')

    return `
<section class="deb">

  <!-- Top ticker -->
  <div class="deb-ticker" aria-hidden="true">
    <div class="deb-ticker-inner">${copies}${copies}</div>
  </div>

  <!-- Billboard body -->
  <div class="deb-bb">
    ${d.preTitle
      ? `<p class="deb-pretitle">
          <span class="deb-bolt">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M13 2L5 13.5h5.5L9 22l9-12h-6z"/></svg>
          </span>
          <span>${richSafe(d.preTitle)}</span>
        </p>`
      : ''}
    <h2 class="deb-eventname">
      ${esc(d.eventName)}${d.eventNameLine2 ? `<span class="deb-eventname-l2">${esc(d.eventNameLine2)}</span>` : ''}
    </h2>
    <div class="deb-props">
      ${media(d.prop1Image, 'deb-prop1', '이벤트 소품 1')}
      ${media(d.prop2Image, 'deb-prop2', '이벤트 소품 2')}
    </div>
  </div>

  <!-- Bottom ticker -->
  <div class="deb-ticker" aria-hidden="true" style="margin-top:0">
    <div class="deb-ticker-inner" style="animation-direction:reverse">${copies}${copies}</div>
  </div>

  <!-- Benefit pills -->
  <div class="deb-benefits">
    ${d.benefits.map(b => `
    <div class="deb-pill">
      <span class="deb-pill-dot"></span>
      <span class="deb-pill-text">${richSafe(b.text)}</span>
    </div>`).join('')}
  </div>

  <!-- Closing -->
  <div class="deb-closing">
    ${d.period ? `<p class="deb-period">${esc(d.period)}</p>` : ''}
    <h3 class="deb-close-head">${richSafe(d.closing)}</h3>
  </div>

</section>`
  },
})
