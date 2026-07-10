/** SHIPPING 아키타입: shipping-notice-twin-truck.
 *  CS 구성 페이지_20(860px 정방형) 흡수 — 긴급 배송 공지 패턴 재구성.
 *  강렬한 노란 전면 배경 + NOTICE 라벨 + 대형 볼드 헤딩 + 본문 텍스트 +
 *  트럭 일러스트 2대 병렬(각자 원형 그림자 포함). 이미지 부재 시 트럭 SVG 아이콘 강등(noimg-safe). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  badge: z.string().optional(),            // 상단 라벨 (기본 "NOTICE")
  title: z.string().min(1),               // 대형 헤딩 (em,br 허용)
  desc: z.string().min(1),                // 본문 설명 (em,br 허용)
  truckLeft: z.string().optional(),       // 왼쪽 트럭 이미지 (url)
  truckRight: z.string().optional(),      // 오른쪽 트럭 이미지 (url)
  note: z.string().optional(),            // 하단 보조 안내 (순수 텍스트, optional)
})
type Data = z.infer<typeof schema>

export const shippingNoticeTwinTruck = defineBlock<Data>({
  id: 'shipping-notice-twin-truck',
  archetype: 'shipping',
  // noimg-safe: 트럭 이미지 없을 때 인라인 SVG 트럭 아이콘으로 강등 — 레이아웃 유지
  styleTags: ['light', 'urgent', 'notice', 'noimg-safe'],
  imageSlots: 2,
  describe:
    '긴급 배송 공지 블록. 노란(--secv-yellow) 전면 배경 + NOTICE 뱃지 + 대형 헤딩 + 설명 + 트럭 이미지 2대 병렬(원형 그림자). 이미지 없으면 SVG 트럭 아이콘으로 강등. 배송 지연·파업·불가 안내에 최적.',
  schema,
  css: `
.secv{
  background:#ffe401;
  padding:60px var(--pad-x,56px) 56px;
  text-align:center;
  position:relative;
}
/* 배경을 강제 노란으로 — 토큰 --bg 대신 고정(브랜드 긴급 배색) */
.secv-badge{
  display:inline-block;
  font-family:var(--font-display);
  font-weight:800;
  font-size:18px;
  letter-spacing:.18em;
  color:#000;
  border:2.5px solid #000;
  border-radius:calc(var(--r-scale,1)*4px);
  padding:4px 18px;
  margin-bottom:22px;
  line-height:1.4;
}
.secv-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(36px,5vw,60px);
  color:#000;
  line-height:1.18;
  letter-spacing:-.02em;
  margin-bottom:20px;
}
.secv-title .em{color:#333}
.secv-desc{
  font-family:var(--font-body);
  font-weight:500;
  font-size:clamp(16px,1.8vw,22px);
  color:#000;
  line-height:1.72;
  max-width:600px;
  margin:0 auto 44px;
}
.secv-desc .em{font-weight:800;color:#333}
/* 트럭 2대 병렬 래퍼 */
.secv-trucks{
  display:flex;
  justify-content:center;
  gap:28px;
  align-items:flex-end;
}
.secv-truck-wrap{
  display:flex;
  flex-direction:column;
  align-items:center;
  flex:0 0 calc(50% - 14px);
  max-width:340px;
}
/* 이미지 프레임 */
.secv-img{
  width:100%;
  aspect-ratio:3/2;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*12px));
  object-fit:contain;
  background:transparent;
  display:block;
}
/* 이미지 없을 때 강등: SVG 트럭 아이콘 박스 */
.secv-truck-icon{
  width:100%;
  aspect-ratio:3/2;
  display:flex;
  align-items:center;
  justify-content:center;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*12px));
  background:rgba(0,0,0,.06);
}
.secv-truck-icon svg{
  width:54%;
  height:54%;
  color:#000;
  opacity:.7;
}
/* 원형 그림자 (ellipse) */
.secv-shadow{
  width:88%;
  height:14px;
  border-radius:50%;
  background:rgba(80,60,0,.22);
  margin-top:8px;
  filter:blur(4px);
  flex-shrink:0;
}
/* 하단 보조 안내 */
.secv-note{
  margin-top:30px;
  font-size:14px;
  color:rgba(0,0,0,.55);
  font-weight:500;
  line-height:1.6;
}
`,
  render: (d, { esc, richSafe, icon }) => {
    const badge = d.badge ?? 'NOTICE'
    const hasLeft  = typeof d.truckLeft  === 'string' && /^(https?:\/\/|data:|\/)/.test(d.truckLeft.trim())
    const hasRight = typeof d.truckRight === 'string' && /^(https?:\/\/|data:|\/)/.test(d.truckRight.trim())

    // 트럭 슬롯 렌더 — 이미지 있으면 <img>, 없으면 SVG 아이콘 강등
    const truckSlot = (url: string | undefined, hasImg: boolean, label: string) => hasImg
      ? `${media(url, 'secv-img', label)}`
      : `<div class="secv-truck-icon">${icon('truck')}</div>`

    return `
<section class="secv">
  <span class="secv-badge">${esc(badge)}</span>
  <h2 class="secv-title">${richSafe(d.title)}</h2>
  <p class="secv-desc">${richSafe(d.desc)}</p>
  <div class="secv-trucks">
    <div class="secv-truck-wrap">
      ${truckSlot(d.truckLeft,  hasLeft,  '배송 차량 1')}
      <div class="secv-shadow"></div>
    </div>
    <div class="secv-truck-wrap">
      ${truckSlot(d.truckRight, hasRight, '배송 차량 2')}
      <div class="secv-shadow"></div>
    </div>
  </div>
  ${d.note ? `<p class="secv-note">${esc(d.note)}</p>` : ''}
</section>`
  },
})
