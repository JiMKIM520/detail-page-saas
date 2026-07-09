/** CALLOUT 아키타입: callout-coupon-channel
 *  채널 친구추가 유도 배너.
 *  좌: CSS 폰 목업(채널 검색 UI 재구성) / 우: 티켓형 쿠폰(점선 절취 + 바코드 CSS).
 *  카카오 상표 노출 금지 — '채널 추가' 중립 표현 사용.
 *  원본 피그마 프레임: 008_pc_자유배너8 (1280×200, 노랑 배경)
 */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  /** 채널 ID 또는 브랜드 닉네임 (예: "@우리농원") */
  channelHandle: z.string().min(1),
  /** 헤드라인 (em/br 허용, 예: "채널 친구하고<br><em>혜택</em> 받으세요!") */
  headline: z.string().min(1),
  /** 쿠폰 금액·혜택 라벨 (예: "5,000원") */
  couponValue: z.string().min(1),
  /** 쿠폰 부제 (예: "즉시 사용 적립금") */
  couponSub: z.string().optional(),
  /** 화이트 배너 안 설명 텍스트 (예: "즉시 사용 가능한 적립금 5,000원 증정!") */
  benefitLine: z.string().optional(),
  /** 쿠폰 티켓 우측 탭 라벨 (짧게, 예: "적립금") */
  couponTabLabel: z.string().optional(),
  /** 리뷰 수·사용자 수 등 수치 슬롯 — 브리프에 근거 있을 때만 사용 */
  statNumber: z.string().optional(),
  /** statNumber 설명 레이블 (예: "채널 친구 수") — statNumber 있을 때만 표시 */
  statLabel: z.string().optional(),
})

type Data = z.infer<typeof schema>

export const calloutCouponChannel = defineBlock<Data>({
  id: 'callout-coupon-channel',
  archetype: 'callout',
  styleTags: ['warm', 'playful', 'food'],
  imageSlots: 0,
  describe:
    '채널 친구추가 유도 배너. 좌측 CSS 폰 목업에 채널 검색 UI, 우측 티켓형 쿠폰(점선 절취선 + CSS 바코드). 노랑 계열 밝은 배경. 카카오 상표 없는 중립 채널 추가 소구.',
  schema,
  css: `
/* ── 래퍼 ───────────────────────────────────── */
.ccch{
  background:var(--accent);
  padding:36px var(--pad-x,56px);
  display:flex;
  align-items:center;
  justify-content:center;
  gap:40px;
  min-height:200px;
  overflow:hidden;
}

/* ── 폰 목업 (좌) ──────────────────────────── */
.ccch-phone{
  position:relative;
  width:200px;
  min-width:200px;
  height:248px;
  background:var(--paper);
  border-radius:calc(var(--r-scale,1)*24px);
  box-shadow:0 8px 28px -8px rgba(0,0,0,.28);
  display:flex;
  flex-direction:column;
  overflow:hidden;
}
/* 카메라 바 */
.ccch-phone::before{
  content:'';
  display:block;
  width:52px;height:6px;
  background:var(--line);
  border-radius:999px;
  margin:14px auto 0;
  flex-shrink:0;
}
/* 스크린 영역 */
.ccch-screen{
  flex:1;
  background:var(--accent);
  margin:10px 12px 0;
  border-radius:calc(var(--r-scale,1)*10px) calc(var(--r-scale,1)*10px) 0 0;
  display:flex;
  align-items:center;
  justify-content:center;
}
/* 채널 아이콘(원형 로고 대체) */
.ccch-ch-icon{
  width:56px;height:56px;
  border-radius:50%;
  background:var(--brand);
  display:flex;align-items:center;justify-content:center;
}
.ccch-ch-icon svg{width:32px;height:32px;stroke:var(--paper);fill:none}
/* 채널 검색 바 */
.ccch-search{
  display:flex;
  align-items:center;
  gap:6px;
  background:var(--paper);
  padding:8px 10px;
  margin:0 0 0;
}
.ccch-search-box{
  flex:1;
  background:#f2f2f2;
  border-radius:calc(var(--r-scale,1)*6px);
  padding:5px 8px;
  font-size:11px;
  font-weight:700;
  font-family:var(--font-display);
  color:var(--ink);
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}
.ccch-add-btn{
  width:26px;height:26px;
  border-radius:50%;
  background:var(--brand);
  color:var(--paper);
  font-size:18px;
  font-weight:700;
  line-height:26px;
  text-align:center;
  flex-shrink:0;
}

/* ── 텍스트 영역 (중앙) ────────────────────── */
.ccch-copy{
  flex:1;
  display:flex;
  flex-direction:column;
  align-items:flex-start;
  gap:10px;
  min-width:0;
}
.ccch-handle{
  font-family:var(--font-display);
  font-size:22px;
  font-weight:700;
  color:var(--ink);
  opacity:.75;
}
.ccch-headline{
  font-family:var(--font-display);
  font-size:clamp(26px,3.2vw,42px);
  font-weight:800;
  line-height:1.25;
  color:var(--ink);
  word-break:keep-all;
}
.ccch .em{color:var(--brand)}
.ccch-benefit{
  background:var(--paper);
  border-radius:calc(var(--r-scale,1)*6px);
  padding:5px 14px;
  font-size:15px;
  font-weight:700;
  color:var(--ink);
}
/* 수치 슬롯 (optional) */
.ccch-stat{
  margin-top:2px;
  font-size:13px;
  font-weight:600;
  color:var(--ink);
  opacity:.7;
}
.ccch-stat strong{
  font-size:18px;
  font-weight:800;
  opacity:1;
  color:var(--ink);
  margin-right:3px;
}

/* ── 티켓형 쿠폰 (우) ──────────────────────── */
.ccch-ticket{
  display:flex;
  align-items:stretch;
  height:96px;
  filter:drop-shadow(0 6px 18px rgba(0,0,0,.18));
}
/* 쿠폰 본체 */
.ccch-ticket-body{
  background:var(--paper);
  border-radius:calc(var(--r-scale,1)*10px) 0 0 calc(var(--r-scale,1)*10px);
  width:160px;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  padding:10px 16px;
  position:relative;
}
/* 절취 반원 — 본체 우측 */
.ccch-ticket-body::after{
  content:'';
  position:absolute;
  right:-11px;top:50%;
  transform:translateY(-50%);
  width:22px;height:22px;
  border-radius:50%;
  background:var(--accent);
  z-index:1;
}
/* 쿠폰 금액 */
.ccch-coupon-sub{
  font-size:11px;
  font-weight:700;
  letter-spacing:.12em;
  text-transform:uppercase;
  color:var(--muted);
  font-family:var(--font-lat,'Cormorant Garamond',serif);
  margin-bottom:2px;
}
.ccch-coupon-value{
  font-family:var(--font-display);
  font-size:34px;
  font-weight:800;
  color:var(--ink);
  line-height:1.1;
}
/* 점선 절취선 */
.ccch-ticket-cut{
  width:1px;
  background:transparent;
  border-left:2px dashed var(--line);
  margin:8px 0;
  flex-shrink:0;
}
/* 쿠폰 우측 탭 (바코드 영역) */
.ccch-ticket-tab{
  background:var(--paper);
  border-radius:0 calc(var(--r-scale,1)*10px) calc(var(--r-scale,1)*10px) 0;
  width:56px;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:6px;
  padding:8px 0;
}
/* CSS 바코드 (얇은 세로 선 배열) */
.ccch-barcode{
  display:flex;
  gap:2px;
  height:36px;
  align-items:stretch;
}
.ccch-barcode span{
  display:block;
  background:var(--ink);
  border-radius:1px;
}
.ccch-tab-label{
  font-size:9px;
  font-weight:700;
  letter-spacing:.08em;
  color:var(--muted);
  text-align:center;
  line-height:1.2;
  writing-mode:horizontal-tb;
}
`,
  render: (d, { esc, richSafe, icon }) => {
    // CSS 바코드: 굵기 배열 (너비 px) — 고정 시각 장치, 브리프와 무관
    const bars: Array<{ w: number }> = [
      { w: 3 }, { w: 1 }, { w: 2 }, { w: 1 }, { w: 3 }, { w: 1 },
      { w: 1 }, { w: 2 }, { w: 3 }, { w: 1 }, { w: 2 }, { w: 1 },
      { w: 3 }, { w: 1 },
    ]
    const barHtml = bars.map(b => `<span style="width:${b.w}px"></span>`).join('')

    const couponSub = d.couponSub ?? 'sale coupon'
    const tabLabel = d.couponTabLabel ?? '쿠폰'

    return `
<section class="ccch">

  <!-- 폰 목업 -->
  <div class="ccch-phone">
    <div class="ccch-screen">
      <div class="ccch-ch-icon">
        ${icon('store')}
      </div>
    </div>
    <div class="ccch-search">
      <div class="ccch-search-box">${esc(d.channelHandle)}</div>
      <div class="ccch-add-btn">+</div>
    </div>
  </div>

  <!-- 카피 -->
  <div class="ccch-copy">
    <p class="ccch-handle">${esc(d.channelHandle)}</p>
    <h2 class="ccch-headline">${richSafe(d.headline)}</h2>
    ${d.benefitLine ? `<div class="ccch-benefit">${esc(d.benefitLine)}</div>` : ''}
    ${d.statNumber ? `<p class="ccch-stat"><strong>${esc(d.statNumber)}</strong>${d.statLabel ? esc(d.statLabel) : ''}</p>` : ''}
  </div>

  <!-- 티켓형 쿠폰 -->
  <div class="ccch-ticket">
    <div class="ccch-ticket-body">
      <span class="ccch-coupon-sub">${esc(couponSub)}</span>
      <span class="ccch-coupon-value">${esc(d.couponValue)}</span>
    </div>
    <div class="ccch-ticket-cut"></div>
    <div class="ccch-ticket-tab">
      <div class="ccch-barcode">${barHtml}</div>
      <span class="ccch-tab-label">${esc(tabLabel)}</span>
    </div>
  </div>

</section>`
  },
})
