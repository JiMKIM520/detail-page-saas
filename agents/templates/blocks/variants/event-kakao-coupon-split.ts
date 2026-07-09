/** EVENT 아키타입: event-kakao-coupon-split
 *  원본: 024_모바일_자유배너_8 (750×240 모바일 배너)
 *  재구성: 872px 3단 — 좌(카카오채널 CSS 목업) · 중(쿠폰 티켓) · 우(브랜드핸들·헤드라인·혜택 필)
 *  모든 시각 장치(목업·티켓·바코드)는 CSS/인라인SVG. 이미지 슬롯 없음. */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  /** 카카오채널 검색창에 표시되는 브랜드/채널명. 예: "@우리농원과" */
  channelHandle: z.string().min(1),
  /** 헤드라인 (em/br 허용). 예: "카톡 친구해요!" */
  headline: z.string().min(1),
  /** 쿠폰 라벨 상단 작은 영문. 예: "KAKAO COUPON" */
  couponLabel: z.string().optional(),
  /** 쿠폰 금액/혜택 강조 텍스트. 예: "5,000p" */
  couponValue: z.string().min(1),
  /** 헤드라인 아래 혜택 한 줄 설명. 예: "즉시 사용 가능한 적립금 5,000p 증정!" */
  benefit: z.string().min(1),
  /** 쿠폰 우측 스텁에 들어갈 보조 텍스트(선택). 예: "친구추가" */
  stubText: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const eventKakaoCouponSplit = defineBlock<Data>({
  id: 'event-kakao-coupon-split',
  archetype: 'event',
  styleTags: ['light', 'playful', 'event', 'social'],
  imageSlots: 0,
  describe:
    '카카오채널 친구추가 유도 배너. 좌측 CSS 카카오채널 검색 목업 + 중앙 쿠폰 티켓(좌우 분리·점선·바코드 SVG) + 우측 브랜드핸들·헤드라인·혜택 텍스트 3단 구성. 밝은 yellow-accent 배경. 이미지 불필요.',
  schema,
  css: `
/* ── 루트 래퍼 ─────────────────────────────────────────── */
.ejmm{
  background:var(--accent);
  padding:44px var(--pad-x,56px);
  display:flex;
  align-items:center;
  gap:32px;
  min-height:220px;
  position:relative;
  overflow:hidden;
}
/* 배경 수평 줄무늬 장식 (subtle) */
.ejmm::before{
  content:'';
  position:absolute;
  inset:0;
  background:repeating-linear-gradient(
    0deg,
    transparent 0px,
    transparent 18px,
    rgba(0,0,0,.03) 18px,
    rgba(0,0,0,.03) 19px
  );
  pointer-events:none;
}

/* ── 좌: 카카오채널 목업 ────────────────────────────────── */
.ejmm-phone{
  flex:0 0 auto;
  width:148px;
  position:relative;
  z-index:1;
}
/* 폰 외곽 프레임 */
.ejmm-phone-frame{
  width:148px;
  height:180px;
  background:#fff;
  border-radius:calc(var(--r-scale,1)*18px);
  box-shadow:0 8px 24px -8px rgba(0,0,0,.25), inset 0 0 0 1.5px rgba(0,0,0,.08);
  position:relative;
  overflow:hidden;
  display:flex;
  flex-direction:column;
}
/* 상단 노치 바 */
.ejmm-phone-notch{
  width:48px;
  height:5px;
  background:#d0d0d0;
  border-radius:999px;
  margin:10px auto 0;
  flex-shrink:0;
}
/* 카카오채널 프로필 영역 */
.ejmm-phone-profile{
  flex:1;
  background:#fae100;
  margin:8px 10px 0;
  border-radius:calc(var(--r-scale,1)*10px);
  display:flex;
  align-items:center;
  justify-content:center;
  overflow:hidden;
}
/* 카카오 로고 SVG 간소 표현 */
.ejmm-kakao-logo{
  width:44px;
  height:44px;
  color:#3a1d09;
}
/* 채널 검색바 영역 */
.ejmm-phone-search{
  margin:8px 8px 10px;
  background:#fff;
  border-radius:calc(var(--r-scale,1)*7px);
  box-shadow:0 0 0 1.5px rgba(0,0,0,.09);
  display:flex;
  align-items:center;
  padding:0 8px;
  height:28px;
  gap:6px;
  flex-shrink:0;
}
.ejmm-search-label{
  flex:1;
  font-family:var(--font-display);
  font-weight:700;
  font-size:11px;
  color:#00020b;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}
.ejmm-search-plus{
  width:18px;
  height:18px;
  background:#351f15;
  border-radius:50%;
  display:flex;
  align-items:center;
  justify-content:center;
  flex-shrink:0;
}
.ejmm-search-plus svg{
  width:10px;
  height:10px;
  fill:#fff;
}

/* ── 중: 쿠폰 티켓 ──────────────────────────────────────── */
.ejmm-coupon{
  flex:0 0 auto;
  position:relative;
  z-index:1;
  display:flex;
  height:120px;
  filter:drop-shadow(0 6px 18px rgba(0,0,0,.18));
}
/* 쿠폰 좌측 본체 */
.ejmm-coupon-body{
  width:132px;
  height:120px;
  background:#fff;
  border-radius:calc(var(--r-scale,1)*8px) 0 0 calc(var(--r-scale,1)*8px);
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  padding:12px 10px;
  position:relative;
  /* 우측에 점선 보더 */
  border-right:none;
}
/* 점선 구분 (가상요소) */
.ejmm-coupon-body::after{
  content:'';
  position:absolute;
  right:-1px;
  top:12px;
  bottom:12px;
  border-right:2px dashed rgba(0,0,0,.18);
}
/* 상하 반원 노치 (clip-path 방식) */
.ejmm-coupon-body::before{
  content:'';
  position:absolute;
  right:-8px;
  top:50%;
  transform:translateY(-50%);
  width:16px;
  height:16px;
  background:var(--accent);
  border-radius:50%;
  z-index:2;
}
.ejmm-coupon-label{
  font-family:var(--font-display);
  font-weight:800;
  font-size:9px;
  letter-spacing:.14em;
  color:#888;
  text-transform:uppercase;
  margin-bottom:4px;
  line-height:1;
}
.ejmm-coupon-value{
  font-family:var(--font-display);
  font-weight:800;
  font-size:32px;
  color:#000;
  line-height:1;
  letter-spacing:-.02em;
}
/* 바코드 SVG */
.ejmm-barcode{
  margin-top:10px;
  width:88px;
  height:18px;
  color:#000;
  opacity:.75;
}
/* 쿠폰 우측 스텁 */
.ejmm-coupon-stub{
  width:40px;
  height:120px;
  background:#fff;
  border-radius:0 calc(var(--r-scale,1)*8px) calc(var(--r-scale,1)*8px) 0;
  display:flex;
  align-items:center;
  justify-content:center;
  overflow:hidden;
}
.ejmm-stub-text{
  font-family:var(--font-display);
  font-weight:800;
  font-size:10px;
  letter-spacing:.12em;
  color:#aaa;
  text-transform:uppercase;
  writing-mode:vertical-rl;
  text-orientation:mixed;
  transform:rotate(180deg);
}

/* ── 우: 텍스트 스택 ────────────────────────────────────── */
.ejmm-text{
  flex:1;
  min-width:0;
  position:relative;
  z-index:1;
  display:flex;
  flex-direction:column;
  justify-content:center;
  gap:10px;
}
.ejmm-handle{
  font-family:var(--font-display);
  font-weight:800;
  font-size:22px;
  color:var(--brand);
  line-height:1.1;
  letter-spacing:-.01em;
}
.ejmm-headline{
  font-family:var(--font-display);
  font-weight:600;
  font-size:42px;
  color:var(--brand);
  line-height:1.05;
  letter-spacing:-.02em;
}
.ejmm-headline .em{
  color:#fff;
  font-weight:800;
}
.ejmm-benefit-pill{
  display:inline-block;
  background:#fff;
  color:var(--brand);
  font-family:var(--font-display);
  font-weight:700;
  font-size:15px;
  padding:7px 18px;
  border-radius:calc(var(--r-scale,1)*6px);
  align-self:flex-start;
  line-height:1.2;
  max-width:100%;
  word-break:keep-all;
}
`,
  render: (d, { esc, richSafe }) => {
    const couponLabel = d.couponLabel ?? 'KAKAO COUPON'
    const stubText = d.stubText ?? '친구추가'
    return `
<section class="ejmm">
  <!-- 좌: 카카오채널 CSS 목업 -->
  <div class="ejmm-phone" aria-hidden="true">
    <div class="ejmm-phone-frame">
      <div class="ejmm-phone-notch"></div>
      <div class="ejmm-phone-profile">
        <!-- 카카오 말풍선 아이콘 (간소 SVG) -->
        <svg class="ejmm-kakao-logo" viewBox="0 0 44 44" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <ellipse cx="22" cy="19" rx="16" ry="13"/>
          <path d="M13 29 l3-6 c4 3 9 3 13 0 l3 6 L22 34z"/>
        </svg>
      </div>
      <div class="ejmm-phone-search">
        <span class="ejmm-search-label">${esc(d.channelHandle)}</span>
        <span class="ejmm-search-plus" aria-label="친구 추가">
          <svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M5 1v8M1 5h8" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
        </span>
      </div>
    </div>
  </div>

  <!-- 중: 쿠폰 티켓 -->
  <div class="ejmm-coupon" role="img" aria-label="쿠폰 ${esc(d.couponValue)}">
    <div class="ejmm-coupon-body">
      <span class="ejmm-coupon-label">${esc(couponLabel)}</span>
      <span class="ejmm-coupon-value">${esc(d.couponValue)}</span>
      <!-- 바코드 간소 SVG (장식) -->
      <svg class="ejmm-barcode" viewBox="0 0 88 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="currentColor">
        <rect x="0"  y="0" width="3"  height="18"/>
        <rect x="5"  y="0" width="1"  height="18"/>
        <rect x="8"  y="0" width="4"  height="18"/>
        <rect x="14" y="0" width="2"  height="18"/>
        <rect x="18" y="0" width="1"  height="18"/>
        <rect x="21" y="0" width="3"  height="18"/>
        <rect x="26" y="0" width="1"  height="18"/>
        <rect x="29" y="0" width="4"  height="18"/>
        <rect x="35" y="0" width="2"  height="18"/>
        <rect x="39" y="0" width="1"  height="18"/>
        <rect x="42" y="0" width="3"  height="18"/>
        <rect x="47" y="0" width="1"  height="18"/>
        <rect x="50" y="0" width="2"  height="18"/>
        <rect x="54" y="0" width="4"  height="18"/>
        <rect x="60" y="0" width="1"  height="18"/>
        <rect x="63" y="0" width="3"  height="18"/>
        <rect x="68" y="0" width="2"  height="18"/>
        <rect x="72" y="0" width="1"  height="18"/>
        <rect x="75" y="0" width="4"  height="18"/>
        <rect x="81" y="0" width="2"  height="18"/>
        <rect x="85" y="0" width="3"  height="18"/>
      </svg>
    </div>
    <div class="ejmm-coupon-stub">
      <span class="ejmm-stub-text">${esc(stubText)}</span>
    </div>
  </div>

  <!-- 우: 텍스트 스택 -->
  <div class="ejmm-text">
    <p class="ejmm-handle">${esc(d.channelHandle)}</p>
    <h2 class="ejmm-headline">${richSafe(d.headline)}</h2>
    <span class="ejmm-benefit-pill">${esc(d.benefit)}</span>
  </div>
</section>`
  },
})
