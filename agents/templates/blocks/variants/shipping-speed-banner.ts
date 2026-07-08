/** CS 아키타입: shipping-speed-banner.
 *  [끝판왕] CS 구성 #13 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 솔리드 커머스 블루(--brand) 배경 + 좌측 초대형 흰 헤드라인 + 굵은 accent 강조 서브라인
 *  + 우측 배송 3D 일러스트 이미지 — 빠른/당일배송 임팩트 배너.
 *  배경 및 레이아웃: 풀폭 분할(텍스트 좌 / 이미지 우), 수평 가운데 정렬, 모바일은 수직 스택. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 상단 흰 헤드라인 (예: "지금사면") — em/br 허용 */
  headline: z.string().min(1),
  /** accent 강조 서브라인 — 핵심 배송 메시지 (예: "내일도착") — em/br 허용 */
  subline: z.string().min(1),
  /** 하단 소각주/예외 안내 (예: "*토요일, 일요일 및 공휴일 제외") — 선택 */
  note: z.string().optional(),
  /** 우측 3D 배송 일러스트 URL (트럭·박스 등) — 없으면 placeholder */
  image: z.string().optional(),
  /** 이미지 alt */
  imageAlt: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const shippingSpeedBanner = defineBlock<Data>({
  id: 'shipping-speed-banner',
  archetype: 'cs',
  styleTags: ['dark', 'commerce', 'split', 'banner', 'fast-delivery', 'impact'],
  imageSlots: 1,
  describe:
    '빠른/당일배송 강조 배너(CS). 솔리드 커머스 블루(--brand) 배경 + 좌측 초대형 흰 헤드라인 + accent 강조 서브라인 + 우측 배송 3D 일러스트 이미지. 하단 소각주(예외 안내) 선택적 추가. 텍스트 좌/이미지 우 분할 레이아웃.',
  schema,
  css: `
/* shipping-speed-banner — 접두사 ssb- */

/* 다크 배경(--brand) 블록: 본문 #fff, accent 강조는 --accent(밝은쪽)로 override */
.ssb{
  background:var(--brand);
  overflow:hidden;
  position:relative;
}

/* 분할 레이아웃: 텍스트 좌 / 이미지 우 */
.ssb-inner{
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:52px var(--pad-x,56px) 52px 64px;
  gap:24px;
}

/* ─ 텍스트 구역 ─ */
.ssb-text{
  flex:0 0 auto;
  display:flex;
  flex-direction:column;
  align-items:flex-start;
  gap:0;
  z-index:1;
}

/* 상단 흰 헤드라인 (초대형, 다크 배경이므로 흰색 고정) */
.ssb-headline{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(48px,10vw,76px);
  line-height:1.08;
  letter-spacing:-.03em;
  color:#fff;
  margin-bottom:2px;
}
.ssb-headline .em{
  /* 다크 배경 — .em은 --accent(밝은)로 override */
  color:var(--accent);
}

/* accent 강조 서브라인 (커머스 신호색 — 골든/옐로우 계열 --accent) */
.ssb-subline{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(52px,11vw,84px);
  line-height:1.0;
  letter-spacing:-.03em;
  /* 다크 배경: 서브라인 자체가 accent 색상 강조 */
  color:var(--accent);
}
.ssb-subline .em{
  color:#fff;
}

/* 소각주 (예외 안내) */
.ssb-note{
  margin-top:16px;
  font-family:var(--font-body);
  font-size:13px;
  line-height:1.6;
  color:rgba(255,255,255,.65);
  letter-spacing:.01em;
}

/* ─ 이미지 구역 ─ */
.ssb-img-wrap{
  flex:0 0 auto;
  width:clamp(180px,40%,320px);
  display:flex;
  align-items:center;
  justify-content:center;
}

/* 이미지 — object-fit contain (일러스트 여백 보존) */
.ssb-img{
  width:100%;
  aspect-ratio:1/1;
  object-fit:contain;
  display:block;
}

/* placeholder */
.ssb-img.ph{
  width:100%;
  aspect-ratio:1/1;
  border:2px dashed rgba(255,255,255,.25);
  background:rgba(255,255,255,.08);
  color:rgba(255,255,255,.45);
  border-radius:calc(var(--r-scale,1)*8px);
}
`,
  render: (d, { esc, richSafe }) => {
    return `
<section class="ssb">
  <div class="ssb-inner">
    <div class="ssb-text">
      <p class="ssb-headline">${richSafe(d.headline)}</p>
      <p class="ssb-subline">${richSafe(d.subline)}</p>
      ${d.note ? `<p class="ssb-note">${esc(d.note)}</p>` : ''}
    </div>
    <div class="ssb-img-wrap">
      ${media(d.image, 'ssb-img', esc(d.imageAlt ?? '배송 일러스트'))}
    </div>
  </div>
</section>`
  },
})
