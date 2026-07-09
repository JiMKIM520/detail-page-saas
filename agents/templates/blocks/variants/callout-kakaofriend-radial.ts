/**
 * CALLOUT 아키타입: callout-kakaofriend-radial
 *
 * 구조: 노란 계열 브랜드 배경 위에 방사형 선레이 SVG 장식을 깔고,
 * 좌(서브+헤드라인) → 중(혜택 안내 흰 박스) → 우(채널/앱 목업 패널) 3분할로 배치.
 * 카카오채널·SNS 친구추가 이벤트 배너 등 채널 유입 CTA에 적합.
 */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  /** 보조 타이틀 (예: "지금 바로 채널 추가하고") — 순수 텍스트 */
  sub: z.string().min(1),
  /** 메인 헤드라인 (em 허용, 예: "<em>친구추가</em> 이벤트") */
  headline: z.string().min(1),
  /** 혜택 안내 첫 줄 (예: "친구추가하면") */
  benefitLine1: z.string().min(1),
  /** 혜택 안내 두 번째 줄 — 강조 (예: "적립금 5,000P 증정!") */
  benefitLine2: z.string().min(1),
  /** 채널/앱 표시 이름 (목업 패널 상단, 예: "브랜드 공식 채널") */
  channelName: z.string().min(1),
  /** 채널 추가 버튼 레이블 (예: "채널 추가") */
  channelCta: z.string().optional(),
  /** 배경색 토큰 오버라이드용 인라인 hex — 미지정 시 var(--accent) 사용 */
  bgHex: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const calloutKakaofriendRadial = defineBlock<Data>({
  id: 'callout-kakaofriend-radial',
  archetype: 'callout',
  styleTags: ['light', 'playful', 'event', 'social'],
  imageSlots: 0,
  describe:
    '방사형 선레이 SVG 장식 위에 좌(헤드라인) · 중(혜택 흰 박스) · 우(채널 목업 패널) 3단 가로 배치 이벤트 배너. SNS 채널 친구추가/팔로우 유도 CTA에 최적. 노란 계열 밝은 톤.',
  schema,
  css: `
/* ── cadx: callout-kakaofriend-radial ───────────────────── */
.cadx{
  position:relative;
  overflow:hidden;
  padding:0 var(--pad-x,56px);
  background:var(--accent);
  min-height:200px;
  display:flex;
  align-items:center;
}
/* 배경 bgHex 오버라이드는 인라인 style로 주입 */
.cadx-ray{
  position:absolute;
  inset:0;
  pointer-events:none;
  /* SVG는 배너보다 훨씬 크게(~130%) 중앙 기준 확대해 선레이 끝이 잘림 */
  display:flex;
  align-items:center;
  justify-content:center;
  overflow:hidden;
}
.cadx-ray svg{
  width:160%;
  height:160%;
  opacity:.28;
  flex-shrink:0;
}
.cadx-inner{
  position:relative;
  z-index:1;
  width:100%;
  display:grid;
  grid-template-columns:1fr auto 1fr;
  align-items:center;
  gap:32px;
  padding:24px 0;
}
/* 좌: 헤드라인 영역 */
.cadx-copy{}
.cadx-sub{
  font-family:var(--font-body);
  font-size:17px;
  font-weight:400;
  color:rgba(0,0,0,.65);
  margin-bottom:4px;
  white-space:nowrap;
}
.cadx-hl{
  font-family:var(--font-display);
  font-size:clamp(28px,3.2vw,44px);
  font-weight:700;
  color:#1a1100;
  line-height:1.18;
  white-space:nowrap;
}
.cadx-hl .em{color:rgba(0,0,0,.75);font-weight:800}
/* 중앙: 혜택 박스 */
.cadx-benefit{
  background:#ffffff;
  border-radius:calc(var(--r-scale,1)*14px);
  padding:16px 28px;
  text-align:center;
  white-space:nowrap;
  box-shadow:0 4px 18px -4px rgba(0,0,0,.14);
}
.cadx-b1{
  font-size:16px;
  font-weight:400;
  color:#444;
  line-height:1.5;
}
.cadx-b2{
  font-size:clamp(18px,2vw,24px);
  font-weight:700;
  color:#1a1100;
  line-height:1.4;
}
/* 우: 채널 목업 패널 */
.cadx-mock{
  display:flex;
  justify-content:flex-end;
  align-items:center;
  overflow:hidden;
  min-width:0;
}
.cadx-phone{
  width:180px;
  background:#ffffff;
  border-radius:calc(var(--r-scale,1)*18px);
  overflow:hidden;
  box-shadow:0 6px 24px -6px rgba(0,0,0,.22);
  display:flex;
  flex-direction:column;
}
.cadx-ph-cam{
  height:6px;
  background:#e0e0e0;
  border-radius:0 0 calc(var(--r-scale,1)*4px) calc(var(--r-scale,1)*4px);
  width:42px;
  margin:0 auto 0;
}
.cadx-ph-screen{
  padding:10px 10px 12px;
  background:var(--accent);
  display:flex;
  flex-direction:column;
  align-items:stretch;
  gap:6px;
}
.cadx-ph-search{
  background:#fff;
  border-radius:calc(var(--r-scale,1)*6px);
  padding:5px 8px;
  display:flex;
  align-items:center;
  gap:6px;
  min-height:28px;
}
.cadx-ph-sname{
  font-size:11px;
  font-weight:700;
  color:#1a1100;
  flex:1 1 0%;
  min-width:40px;
  width:0; /* force flex child to shrink without losing text layout */
  text-align:center;
  overflow:hidden;
  white-space:nowrap;
  text-overflow:ellipsis;
  display:block;
}
.cadx-ph-plus{
  width:18px;
  height:18px;
  border-radius:50%;
  background:#3c2415;
  display:flex;
  align-items:center;
  justify-content:center;
  flex-shrink:0;
}
.cadx-ph-plus span{
  color:#fff;
  font-size:13px;
  line-height:1;
  font-weight:600;
  margin-top:-1px;
}
.cadx-ph-content{
  background:#f5f5f5;
  border-radius:calc(var(--r-scale,1)*8px);
  height:60px;
}
.cadx-ph-cta{
  padding:6px 10px 10px;
  background:#fff;
}
.cadx-ph-btn{
  display:block;
  width:100%;
  background:var(--brand, #3c2415);
  color:#ffffff;
  border-radius:calc(var(--r-scale,1)*6px);
  padding:6px 0;
  font-size:11px;
  font-weight:700;
  text-align:center;
}
`,
  render: (d, { esc, richSafe }) => {
    const bg = d.bgHex ? ` style="background:${esc(d.bgHex)}"` : ''
    const cta = d.channelCta ?? '채널 추가'
    return `
<section class="cadx"${bg}>
  <!-- 방사형 선레이 SVG 장식 (인라인, 30% 투명도) -->
  <div class="cadx-ray" aria-hidden="true">
    <svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg" fill="white">
      <g transform="translate(400,400)">
        <polygon points="0,-400 12,-20 -12,-20" transform="rotate(0)"/>
        <polygon points="0,-400 12,-20 -12,-20" transform="rotate(15)"/>
        <polygon points="0,-400 12,-20 -12,-20" transform="rotate(30)"/>
        <polygon points="0,-400 12,-20 -12,-20" transform="rotate(45)"/>
        <polygon points="0,-400 12,-20 -12,-20" transform="rotate(60)"/>
        <polygon points="0,-400 12,-20 -12,-20" transform="rotate(75)"/>
        <polygon points="0,-400 12,-20 -12,-20" transform="rotate(90)"/>
        <polygon points="0,-400 12,-20 -12,-20" transform="rotate(105)"/>
        <polygon points="0,-400 12,-20 -12,-20" transform="rotate(120)"/>
        <polygon points="0,-400 12,-20 -12,-20" transform="rotate(135)"/>
        <polygon points="0,-400 12,-20 -12,-20" transform="rotate(150)"/>
        <polygon points="0,-400 12,-20 -12,-20" transform="rotate(165)"/>
        <polygon points="0,-400 12,-20 -12,-20" transform="rotate(180)"/>
        <polygon points="0,-400 12,-20 -12,-20" transform="rotate(195)"/>
        <polygon points="0,-400 12,-20 -12,-20" transform="rotate(210)"/>
        <polygon points="0,-400 12,-20 -12,-20" transform="rotate(225)"/>
        <polygon points="0,-400 12,-20 -12,-20" transform="rotate(240)"/>
        <polygon points="0,-400 12,-20 -12,-20" transform="rotate(255)"/>
        <polygon points="0,-400 12,-20 -12,-20" transform="rotate(270)"/>
        <polygon points="0,-400 12,-20 -12,-20" transform="rotate(285)"/>
        <polygon points="0,-400 12,-20 -12,-20" transform="rotate(300)"/>
        <polygon points="0,-400 12,-20 -12,-20" transform="rotate(315)"/>
        <polygon points="0,-400 12,-20 -12,-20" transform="rotate(330)"/>
        <polygon points="0,-400 12,-20 -12,-20" transform="rotate(345)"/>
      </g>
    </svg>
  </div>
  <div class="cadx-inner">
    <!-- 좌: 헤드라인 -->
    <div class="cadx-copy">
      <p class="cadx-sub">${esc(d.sub)}</p>
      <p class="cadx-hl">${richSafe(d.headline)}</p>
    </div>
    <!-- 중: 혜택 흰 박스 -->
    <div class="cadx-benefit">
      <p class="cadx-b1">${esc(d.benefitLine1)}</p>
      <p class="cadx-b2">${esc(d.benefitLine2)}</p>
    </div>
    <!-- 우: 채널 목업 패널 -->
    <div class="cadx-mock">
      <div class="cadx-phone">
        <div class="cadx-ph-cam"></div>
        <div class="cadx-ph-screen">
          <div class="cadx-ph-search">
            <span class="cadx-ph-sname">${esc(d.channelName)}</span>
            <span class="cadx-ph-plus"><span>+</span></span>
          </div>
          <div class="cadx-ph-content"></div>
        </div>
        <div class="cadx-ph-cta">
          <span class="cadx-ph-btn">${esc(cta)}</span>
        </div>
      </div>
    </div>
  </div>
</section>`
  },
})
