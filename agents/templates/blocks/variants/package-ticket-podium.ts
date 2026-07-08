/** LINEUP 아키타입(템플릿 충실 재현): package-ticket-podium.
 *  와디즈 200섹션 08_상품구성 _09 (티켓 카드 + 2열 하단) 패턴 재구성.
 *  연단 히어로(라벤더 무대 배경) + 아이브로 + 대형 디스플레이 제목 +
 *  큰 티켓 카드 1개(좌:텍스트+가격, 우:원형이미지, BEST SELLER 배지) +
 *  작은 티켓 카드 2개 하단 2열. 티켓 형태(점선 외곽선+톱니 절취선). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const ticketSchema = z.object({
  name: z.string().min(1),          // em,br — 패키지명
  desc: z.string().min(1).optional(), // em,br — 한 줄 설명
  image: z.string().optional(),       // url — 원형 썸네일
  priceOriginal: z.string().min(1).optional(), // 정가(취소선)
  price: z.string().min(1).optional(),         // 최종가
  best: z.boolean().optional(),                // BEST SELLER 배지
})

const schema = z.object({
  eyebrow: z.string().min(1).optional(), // 상단 소제목 ("여러분을 위한 상품 패키지입니다")
  title: z.string().min(1).optional(),   // em,br — 대형 디스플레이 제목 (기본 "WHAT'S FOR YOU?")
  hero: ticketSchema,                    // 큰 메인 티켓 카드 (imageSlot 1)
  cards: z.array(ticketSchema).min(2).max(2), // 하단 2열 작은 티켓 카드 (imageSlot 2~3) — 고정 2개
})
type Data = z.infer<typeof schema>

export const packageTicketPodium = defineBlock<Data>({
  id: 'package-ticket-podium',
  archetype: 'lineup',
  styleTags: ['premium', 'template', 'pricing', 'ticket', 'playful'],
  imageSlots: 3, // hero(1) + small×2(2~3)
  describe:
    '상품 구성/패키지(티켓 카드 + 연단). 라벤더 배경 연단 히어로 + 아이브로 + 대형 영문 제목 + 큰 메인 티켓(BEST SELLER 배지·원형 이미지·가격) + 하단 2열 작은 티켓 카드. 가격/구성은 brief 근거만(지어내지 말 것).',
  schema,
  css: `
.ptp{background:var(--bg);padding-bottom:56px}

/* ── 연단 히어로 영역 ── */
.ptp-stage{
  position:relative;
  width:100%;
  height:260px;
  background:linear-gradient(160deg,color-mix(in srgb,var(--accent) 22%,#fff) 0%,color-mix(in srgb,var(--accent) 10%,#fff) 60%,color-mix(in srgb,var(--accent) 4%,#fff) 100%);
  overflow:hidden;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:flex-end;
  padding-bottom:0;
}
/* 반타원 연단 */
.ptp-stage::after{
  content:"";
  position:absolute;
  bottom:-30px;
  left:50%;
  transform:translateX(-50%);
  width:560px;
  height:180px;
  border-radius:50%;
  background:color-mix(in srgb,var(--accent) 28%,#fff);
  z-index:0;
}
.ptp-stage-inner{
  position:relative;
  z-index:1;
  text-align:center;
  padding:32px 40px 20px;
}
.ptp-eyebrow{
  font-size:15px;
  font-weight:600;
  color:var(--ink-2);
  margin-bottom:10px;
  letter-spacing:.02em;
}
.ptp-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:62px;
  color:var(--accent);
  letter-spacing:-.02em;
  line-height:1.05;
}
.ptp-title .em{color:var(--accent-d)}

/* ── 공통 티켓 ── */
.ptp-body{
  padding:32px 36px 0;
  display:flex;
  flex-direction:column;
  gap:18px;
  position:relative;
  z-index:1;
}

/* 티켓 공통 — 점선 외곽 */
.ptp-ticket{
  background:#fff;
  border:2px dashed color-mix(in srgb,var(--accent) 40%,var(--line));
  border-radius:calc(var(--r-scale,1)*16px);
  position:relative;
  overflow:visible;
}
/* 절취선 노치 — 좌우 원형 컷아웃
   radial-gradient로 배경색 원을 겹쳐 티켓 테두리를 시각적으로 잘라냄 */
.ptp-ticket::before,.ptp-ticket::after{
  content:"";
  position:absolute;
  top:50%;
  transform:translateY(-50%);
  width:22px;
  height:22px;
  border-radius:50%;
  /* 배경과 동일한 색으로 채워 점선 테두리를 "잘라낸" 것처럼 보이게 */
  background:radial-gradient(circle,var(--bg) 65%,transparent 66%);
  /* 원 자체 테두리는 없음 — 티켓 점선이 원 뒤로 가려지며 노치 효과 완성 */
  z-index:2;
}
.ptp-ticket::before{left:-12px}
.ptp-ticket::after{right:-12px}

/* ── 큰 메인 티켓 ── */
.ptp-hero-ticket{
  display:flex;
  align-items:center;
  gap:0;
  min-height:200px;
}
.ptp-hero-text{
  flex:1;
  padding:28px 24px 28px 32px;
}
.ptp-hero-img-wrap{
  flex:0 0 150px;
  padding:20px 28px 20px 0;
  display:flex;
  align-items:center;
  justify-content:center;
}
.ptp-hero-thumb{
  width:130px;
  height:130px;
  border-radius:50%;
  object-fit:cover;
  background:color-mix(in srgb,var(--accent) 14%,#fff);
}

/* BEST SELLER 배지 */
.ptp-best{
  position:absolute;
  top:-14px;
  right:24px;
  background:var(--ink);
  color:#fff;
  font-size:11px;
  font-weight:800;
  letter-spacing:.08em;
  padding:5px 14px;
  border-radius:999px;
  white-space:nowrap;
}

.ptp-name{
  font-family:var(--font-display);
  font-weight:800;
  font-size:22px;
  color:var(--ink);
  line-height:1.2;
}
.ptp-name .em{color:var(--accent)}
.ptp-desc{
  margin-top:8px;
  font-size:14px;
  color:var(--ink-2);
  line-height:1.55;
}
.ptp-desc .em{color:var(--accent);font-weight:700}
.ptp-price{margin-top:16px}
.ptp-orig{
  font-size:13px;
  color:var(--muted);
  text-decoration:line-through;
}
.ptp-final{
  font-family:var(--font-display);
  font-weight:800;
  font-size:26px;
  color:var(--ink);
}

/* ── 하단 2열 작은 티켓 그리드 ── */
.ptp-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:14px;
  padding:0 36px 0;
}
.ptp-small-ticket{
  min-height:160px;
  display:flex;
  flex-direction:column;
}
.ptp-small-text{
  padding:20px 18px 18px;
  flex:1;
  display:flex;
  flex-direction:column;
}
.ptp-small-thumb-wrap{
  padding:10px 14px 0;
  display:flex;
  justify-content:flex-end;
}
.ptp-small-thumb{
  width:72px;
  height:72px;
  border-radius:50%;
  object-fit:cover;
  background:color-mix(in srgb,var(--accent) 14%,#fff);
}
.ptp-small-name{
  font-family:var(--font-display);
  font-weight:800;
  font-size:16px;
  color:var(--ink);
  line-height:1.2;
}
.ptp-small-name .em{color:var(--accent)}
.ptp-small-desc{
  margin-top:6px;
  font-size:12px;
  color:var(--ink-2);
  line-height:1.5;
}
.ptp-small-desc .em{color:var(--accent);font-weight:700}
.ptp-small-price{margin-top:auto;padding-top:10px}
.ptp-small-orig{
  font-size:12px;
  color:var(--muted);
  text-decoration:line-through;
}
.ptp-small-final{
  font-family:var(--font-display);
  font-weight:800;
  font-size:20px;
  color:var(--ink);
}
/* 작은 티켓 노치 — 세로 중간 기준 (small 카드는 높이가 낮아 top:50% 그대로 유지) */
.ptp-small-ticket::before{left:-12px}
.ptp-small-ticket::after{right:-12px}

/* 티켓 내부 점선 구분선 — 큰 티켓: 텍스트↔이미지 사이 세로선 */
.ptp-hero-divider{
  width:1px;
  align-self:stretch;
  border-left:2px dashed color-mix(in srgb,var(--accent) 30%,var(--line));
  margin:20px 0;
}
/* 작은 티켓: 이미지↔텍스트 사이 가로선 */
.ptp-small-divider{
  height:1px;
  border-top:2px dashed color-mix(in srgb,var(--accent) 30%,var(--line));
  margin:0 18px;
}
`,
  render: (d, { esc, richSafe }) => {
    const h = d.hero
    return `
<section class="ptp">
  <!-- 연단 히어로 -->
  <div class="ptp-stage">
    <div class="ptp-stage-inner">
      ${d.eyebrow ? `<p class="ptp-eyebrow">${esc(d.eyebrow)}</p>` : ''}
      <h2 class="ptp-title">${richSafe(d.title ?? "WHAT'S FOR YOU?")}</h2>
    </div>
  </div>

  <!-- 메인 큰 티켓 -->
  <div class="ptp-body">
    <div class="ptp-ticket ptp-hero-ticket">
      ${h.best ? `<span class="ptp-best">BEST SELLER</span>` : ''}
      <div class="ptp-hero-text">
        <div class="ptp-name">${richSafe(h.name)}</div>
        ${h.desc ? `<div class="ptp-desc">${richSafe(h.desc)}</div>` : ''}
        ${h.price || h.priceOriginal ? `
        <div class="ptp-price">
          ${h.priceOriginal ? `<div class="ptp-orig">${esc(h.priceOriginal)}</div>` : ''}
          ${h.price ? `<div class="ptp-final">${esc(h.price)}</div>` : ''}
        </div>` : ''}
      </div>
      <div class="ptp-hero-divider"></div>
      <div class="ptp-hero-img-wrap">
        ${media(h.image, 'ptp-hero-thumb', '패키지 이미지')}
      </div>
    </div>
  </div>

  <!-- 하단 2열 작은 티켓 -->
  <div class="ptp-grid" style="margin-top:14px">
    ${d.cards.map((c) => `
    <div class="ptp-ticket ptp-small-ticket">
      ${c.best ? `<span class="ptp-best">BEST SELLER</span>` : ''}
      <div class="ptp-small-thumb-wrap">
        ${media(c.image, 'ptp-small-thumb', '패키지 이미지')}
      </div>
      <div class="ptp-small-divider"></div>
      <div class="ptp-small-text">
        <div class="ptp-small-name">${richSafe(c.name)}</div>
        ${c.desc ? `<div class="ptp-small-desc">${richSafe(c.desc)}</div>` : ''}
        ${c.price || c.priceOriginal ? `
        <div class="ptp-small-price">
          ${c.priceOriginal ? `<div class="ptp-small-orig">${esc(c.priceOriginal)}</div>` : ''}
          ${c.price ? `<div class="ptp-small-final">${esc(c.price)}</div>` : ''}
        </div>` : ''}
      </div>
    </div>`).join('')}
  </div>
</section>`
  },
})
