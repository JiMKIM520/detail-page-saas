/** CS 아키타입: shipping-illust-hero.
 *  [끝판왕] CS 구성 #15 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 밝은 하늘색(accent 계열) 배경 + 대형 2줄 헤드라인(2번째 줄 하이라이트 박스 강조)
 *  + 배송 일러스트 히어로 슬롯(3D-style placeholder). 장식 일러스트 의존형(high). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 헤드라인 1번째 줄 — 일반 굵기 (em 허용) */
  headLine1: z.string().min(1),
  /** 헤드라인 2번째 줄 — 하이라이트 박스 처리(accent 배경 + 반전색 텍스트) */
  headLine2: z.string().min(1),
  /** 배송 일러스트 URL (없으면 placeholder) */
  illustImage: z.string().optional(),
  /** 일러스트 alt */
  illustAlt: z.string().optional(),
  /** 배경 강도 조절: 'light'(기본 연하늘) | 'mid'(중간 블루) */
  bgTone: z.enum(['light', 'mid']).optional(),
})
type Data = z.infer<typeof schema>

export const shippingIllustHero = defineBlock<Data>({
  id: 'shipping-illust-hero',
  archetype: 'cs',
  styleTags: ['light', 'blue', 'illust', 'hero', 'cs', 'shipping', 'template'],
  imageSlots: 1,
  describe:
    'CS 배송 히어로. 밝은 하늘색 배경 + 대형 2줄 헤드라인(2번째 줄은 accent-색 하이라이트 박스) + 배송 일러스트 1장. 일러스트가 핵심 비주얼. 커머스 상세페이지 배송 섹션 상단용.',
  schema,
  css: `
/* shipping-illust-hero — 접두사 sih- */

/* 밝은 배경 블록: 배경 accent 연계 하늘색, 본문 --ink */
.sih{
  position:relative;
  background:var(--accent);
  overflow:hidden;
  padding:44px 28px 0;
  text-align:center;
}
/* bgTone='mid' 오버라이드 — 약간 더 진한 accent-d */
.sih.sih--mid{
  background:var(--accent-d);
}

/* 구름 장식 — 순수 CSS, 인라인 SVG 없이 */
.sih-clouds{
  position:absolute;
  top:0;left:0;right:0;
  height:100%;
  pointer-events:none;
  overflow:hidden;
}
.sih-cloud{
  position:absolute;
  background:#fff;
  border-radius:50px;
  opacity:.55;
}
.sih-cloud::before,.sih-cloud::after{
  content:'';
  position:absolute;
  background:#fff;
  border-radius:50%;
}
/* 왼쪽 구름 */
.sih-cloud-l{
  width:72px;height:22px;
  top:28px;left:14px;
}
.sih-cloud-l::before{
  width:30px;height:30px;
  top:-14px;left:12px;
}
.sih-cloud-l::after{
  width:22px;height:22px;
  top:-10px;left:32px;
}
/* 오른쪽 구름 */
.sih-cloud-r{
  width:56px;height:18px;
  top:22px;right:18px;
}
.sih-cloud-r::before{
  width:24px;height:24px;
  top:-11px;left:10px;
}
.sih-cloud-r::after{
  width:18px;height:18px;
  top:-8px;left:26px;
}

/* 헤드라인 영역 */
.sih-headline{
  position:relative;
  z-index:1;
  margin-bottom:20px;
}
.sih-h1{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(26px,6.6vw,46px);
  line-height:1.3;
  letter-spacing:-.02em;
  color:#fff;
  display:block;
  margin-bottom:8px;
}
/* 라이트 accent 배경 위 — .em은 흰색 */
.sih-h1 .em{color:#fff;text-decoration:underline;text-underline-offset:3px}

/* 2번째 줄: 노란(--paper 계열) 하이라이트 박스 + 진한 accent 텍스트 */
.sih-h2{
  display:inline-block;
  font-family:var(--font-display);
  font-weight:900;
  font-size:clamp(28px,7.2vw,52px);
  line-height:1.25;
  letter-spacing:-.025em;
  /* 커머스 강조색: 노랑은 시맨틱 danger/신호색으로 허용 */
  background:#FFE033;
  color:var(--accent-d);
  padding:4px 18px 6px;
  border-radius:6px;
}

/* 일러스트 슬롯 */
.sih-illust{
  position:relative;
  z-index:1;
  width:calc(100% + 56px);
  margin-left:-28px;
  margin-right:-28px;
  aspect-ratio:16/9;
  object-fit:contain;
  display:block;
  margin-top:4px;
}
.sih-illust.ph{
  width:calc(100% + 56px);
  margin-left:-28px;
  aspect-ratio:16/9;
  background:rgba(255,255,255,.18);
  border:2px dashed rgba(255,255,255,.35);
  color:rgba(255,255,255,.7);
  font-size:14px;
}
`,
  render: (d, { esc, richSafe }) => {
    const bgClass = d.bgTone === 'mid' ? 'sih sih--mid' : 'sih'
    const altText = d.illustAlt ?? '배송 일러스트'

    return `
<section class="${bgClass}">
  <!-- CSS 구름 장식 -->
  <div class="sih-clouds" aria-hidden="true">
    <div class="sih-cloud sih-cloud-l"></div>
    <div class="sih-cloud sih-cloud-r"></div>
  </div>

  <!-- 헤드라인 -->
  <div class="sih-headline">
    <span class="sih-h1">${richSafe(d.headLine1)}</span>
    <span class="sih-h2">${esc(d.headLine2)}</span>
  </div>

  <!-- 배송 일러스트 -->
  ${media(d.illustImage, 'sih-illust', esc(altText))}
</section>`
  },
})
