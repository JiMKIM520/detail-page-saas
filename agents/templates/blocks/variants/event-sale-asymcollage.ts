/** EVENT 아키타입: event-sale-asymcollage
 *  피그마 047_포인트_구성_페이지_2 재구성.
 *  그라디언트 배경, 초대형 타이포 헤더(이벤트 기간+브랜드명), 좌측 세로 의류 이미지
 *  + 우측 정방형·사각 이미지 스택 비대칭 콜라주, 별모양 할인 배지 플로팅.
 *  noimg-safe: 이미지 전무 시 이미지 프레임 은닉, 타이포+배지만 유지. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  tagline: z.string().min(1),               // 상단 소형 캐치프레이즈 (em 허용)
  brandName: z.string().min(1),             // 초대형 이벤트 타이틀 (em 허용)
  period: z.string().optional(),            // 이벤트 기간 (예: "2025. 07월 01일 ~ 07월 31일")
  discountRate: z.string().optional(),      // 별 배지 할인율 (예: "~75%") — 브리프 근거 시만
  capsuleLabel: z.string().optional(),      // 우측 캡슐 버튼 라벨 (예: "SUMMER LUCKY SALE")
  imagePortrait: z.string().optional(),     // 좌측 세로 의류 이미지 (url)
  imageSquare: z.string().optional(),       // 우측 상단 정방형 이미지 (url)
  imageRect: z.string().optional(),         // 우측 하단 직사각형 이미지 (url)
})
type Data = z.infer<typeof schema>

export const eventSaleAsymcollage = defineBlock<Data>({
  id: 'event-sale-asymcollage',
  archetype: 'event',
  styleTags: ['mixed', 'editorial', 'seasonal', 'collage', 'noimg-safe'],
  imageSlots: 3,
  describe:
    '시즌 세일 이벤트 비대칭 콜라주. 그라디언트 배경 + 상단 이벤트 기간·초대형 브랜드명 타이포 + 좌측 세로 의류 이미지(라운드 카드) + 우측 정방형·직사각형 이미지 스택 + SUMMER SALE 캡슐 버튼 + 별 모양 할인율 배지 플로팅. 패션/의류 쇼핑몰 세일 이벤트 섹션.',
  schema,
  css: `
.efev{
  position:relative;
  padding:0;
  background:linear-gradient(160deg,var(--bg) 0%,color-mix(in srgb,var(--accent) 12%,var(--bg)) 55%,color-mix(in srgb,var(--accent-d) 18%,var(--bg)) 100%);
  overflow:hidden;
  min-height:580px
}
/* ── 헤더 영역 ── */
.efev-hd{
  position:relative;
  z-index:2;
  padding:52px var(--pad-x,56px) 0;
  background:linear-gradient(180deg,rgba(0,0,0,.45) 0%,rgba(0,0,0,.22) 70%,transparent 100%)
}
.efev-tagline{
  font-family:var(--font-display);
  font-weight:600;
  font-size:17px;
  color:#fff;
  letter-spacing:.06em;
  margin-bottom:6px;
  opacity:.92
}
.efev-tagline .em{color:var(--em-dark,#FFF7EA)}
.efev-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(52px,8vw,96px);
  color:#fff;
  text-shadow:0 2px 14px rgba(0,0,0,.45),0 1px 4px rgba(0,0,0,.35);
  line-height:1;
  letter-spacing:-.03em;
  white-space:nowrap
}
.efev-title .em{color:var(--em-dark,#FFF7EA)}
.efev-period{
  font-family:var(--font-body);
  font-weight:500;
  font-size:16px;
  color:#fff;
  text-shadow:0 1px 8px rgba(0,0,0,.45);
  margin-top:14px;
  opacity:.85;
  letter-spacing:.02em
}
/* ── 콜라주 레이아웃 ── */
.efev-collage{
  display:flex;
  align-items:flex-start;
  gap:16px;
  padding:28px var(--pad-x,56px) 52px;
  position:relative;
  z-index:2
}
/* 좌측: 세로 긴 의류 이미지 */
.efev-left{
  flex:0 0 46%;
  position:relative
}
.efev-portrait{
  width:100%;
  aspect-ratio:400/860;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*28px));
  overflow:hidden;
  background:color-mix(in srgb,var(--accent) 14%,var(--paper))
}
.efev-portrait img,.efev-portrait .ph{
  width:100%;height:100%;object-fit:cover;border-radius:inherit
}
/* 좌측 이미지 위 라벨 */
.efev-port-label{
  position:absolute;
  top:18px;
  left:14px;
  font-family:var(--font-display);
  font-weight:800;
  font-size:14px;
  color:#fff;
  line-height:1.35;
  text-shadow:0 1px 6px rgba(0,0,0,.45)
}
/* 우측: 정방형 + 캡슐 + 직사각형 스택 — 배지 기준점 */
.efev-right{
  flex:1;
  display:flex;
  flex-direction:column;
  gap:12px;
  position:relative;
  overflow:visible
}
.efev-square{
  width:100%;
  aspect-ratio:1/0.72;
  border-radius:calc(var(--r-scale,1)*24px);
  overflow:hidden;
  background:color-mix(in srgb,var(--accent) 10%,var(--paper))
}
.efev-square img,.efev-square .ph{
  width:100%;height:100%;object-fit:cover;border-radius:inherit
}
/* 캡슐 라벨 버튼 */
.efev-capsule{
  display:inline-block;
  align-self:flex-start;
  background:color-mix(in srgb,var(--accent) 18%,#fff);
  color:var(--accent-d);
  font-family:var(--font-display);
  font-weight:700;
  font-size:15px;
  letter-spacing:.06em;
  padding:10px 22px;
  border-radius:999px;
  white-space:nowrap
}
.efev-rect{
  width:100%;
  aspect-ratio:360/360;
  border-radius:calc(var(--r-scale,1)*24px);
  overflow:hidden;
  background:color-mix(in srgb,var(--accent) 10%,var(--paper))
}
.efev-rect img,.efev-rect .ph{
  width:100%;height:100%;object-fit:cover;border-radius:inherit
}
/* ── 별 배지 (우측 이미지 영역 내부 고정) ── */
.efev-star-badge{
  position:absolute;
  bottom:14px;
  right:14px;
  z-index:10;
  width:100px;
  height:100px;
  pointer-events:none
}
.efev-star-badge svg{
  width:100%;height:100%;
  filter:drop-shadow(0 6px 18px rgba(0,0,0,.32))
}
.efev-star-badge .efev-badge-text{
  position:absolute;
  inset:0;
  display:flex;
  align-items:center;
  justify-content:center;
  font-family:var(--font-display);
  font-weight:800;
  font-size:22px;
  color:#fff;
  letter-spacing:-.02em;
  line-height:1
}
/* noimg-safe: 이미지 전무 시 이미지 컨테이너 숨김, 헤더+배지만 유지 */
.efev-portrait.ph-only,.efev-square.ph-only,.efev-rect.ph-only{display:none}
`,
  render: (d, { esc, richSafe }) => {
    // 이미지 전무 시 콜라주 붕괴 방지 — 모두 없으면 콜라주 블록 자체를 hide
    const hasAnyImg = d.imagePortrait || d.imageSquare || d.imageRect
    const portraitEl = media(d.imagePortrait, 'efev-portrait', '세일 의류 이미지')
    const squareEl = media(d.imageSquare, 'efev-square', '이벤트 상품 이미지')
    const rectEl = media(d.imageRect, 'efev-rect', '이벤트 보조 이미지')

    // 별 SVG (인라인) — fill은 accent-d 토큰, stroke 없음
    const starBadge = d.discountRate ? `
<div class="efev-star-badge" aria-label="할인율 ${esc(d.discountRate)}">
  <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path fill="var(--accent-d)" d="
      M60 4
      l10.6 33.2 33.2-3.6-22 25.8 12.4 31.4-31.4-13.6-30.2 15.4 10.8-32.2-23.4-24.6
      33.6 2.6z"/>
  </svg>
  <span class="efev-badge-text">${esc(d.discountRate)}</span>
</div>` : ''

    const capsule = d.capsuleLabel
      ? `<span class="efev-capsule">${esc(d.capsuleLabel)}</span>`
      : ''

    return `
<section class="efev">
  <div class="efev-hd">
    <p class="efev-tagline">${richSafe(d.tagline)}</p>
    <h2 class="efev-title">${richSafe(d.brandName)}</h2>
    ${d.period ? `<p class="efev-period">${esc(d.period)}</p>` : ''}
  </div>
  ${hasAnyImg ? `
  <div class="efev-collage">
    <div class="efev-left">
      ${portraitEl}
      <div class="efev-port-label">LUCKY SALE<br>WEEK</div>
    </div>
    <div class="efev-right">
      ${squareEl}
      ${capsule}
      ${rectEl}
      ${starBadge}
    </div>
  </div>` : ''}
</section>`
  },
})
