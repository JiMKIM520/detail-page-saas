/** CS 아키타입: shipping-vehicle-composite-hero.
 *  [끝판왕] CS 구성 #18 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 다크(--ink) 배경 + 시계 아이콘 + 주문마감 아이브로 + 대형 출발/도착 헤드라인
 *  + 배송차량 이미지(중앙 풀폭) + 제품 누끼 이미지(좌·우 floating 합성 슬롯) + 하단 캡션.
 *  커머스 배송 당일출발 임팩트 섹션 — "이 시간 전에 주문하면 오늘 출발" 신호색 강조. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 시계 아이콘 상단 아이브로 (예: "오후 2시 이전에 주문 시") */
  eyebrow: z.string().min(1),
  /** 메인 헤드라인 (em 허용, 예: "<span class="em">당일</span> 출발") */
  headline: z.string().min(1),
  /** 헤드라인 아래 보조 설명 (선택, 예: "평일 기준 / 주말·공휴일 제외") */
  subCaption: z.string().optional(),
  /** 배송차량 이미지 URL (트럭·밴·오토바이 등, 중앙 메인) */
  vehicleImage: z.string().optional(),
  /** 배송차량 이미지 alt */
  vehicleImageAlt: z.string().optional(),
  /** 좌측 제품 누끼 이미지 URL */
  productLeftImage: z.string().optional(),
  /** 좌측 제품 이미지 alt */
  productLeftAlt: z.string().optional(),
  /** 우측 제품 누끼 이미지 URL */
  productRightImage: z.string().optional(),
  /** 우측 제품 이미지 alt */
  productRightAlt: z.string().optional(),
  /** 하단 캡션 — 추가 배송 안내 (선택, em 허용) */
  footerCaption: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const shippingVehicleCompositeHero = defineBlock<Data>({
  id: 'shipping-vehicle-composite-hero',
  archetype: 'shipping',
  styleTags: ['dark', 'cs', 'hero', 'composite', 'cutoff', 'template', 'centered'],
  imageSlots: 3,
  describe:
    '배송 당일출발 임팩트 히어로(차량+제품 합성). 다크 배경 + 시계 아이콘 + 주문마감 아이브로 + 대형 출발 헤드라인(accent 강조) + 배송차량 중앙 이미지에 제품 누끼 좌우 floating 합성 슬롯 + 하단 캡션. 커머스 당일출발·당일배송 CS 섹션에 특화.',
  schema,
  css: `
/* ── shipping-vehicle-composite-hero: svch prefix ── */

/* ─ 섹션 래퍼 ─ */
.svch{
  background:var(--ink);
  color:#fff;
  padding:56px 0 52px;
  text-align:center;
  overflow:hidden;
  position:relative;
}

/* ─ 아이브로 영역: 시계 아이콘 + 텍스트 ─ */
.svch-eyebrow-wrap{
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:10px;
  margin-bottom:18px;
}
.svch-clock{
  width:48px;
  height:48px;
  color:rgba(255,255,255,.7);
  display:flex;
  align-items:center;
  justify-content:center;
}
.svch-clock svg{width:100%;height:100%}
.svch-eyebrow{
  font-family:var(--font-body),'Pretendard',sans-serif;
  font-size:16px;
  font-weight:600;
  letter-spacing:.04em;
  color:rgba(255,255,255,.65);
  line-height:1.4;
}

/* ─ 메인 헤드라인 ─ */
.svch-headline{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(52px,11vw,80px);
  line-height:1.05;
  letter-spacing:-.03em;
  color:#fff;
  padding:0 32px;
  margin-bottom:12px;
}
/* 다크 배경: .em은 밝은 accent로 override — 커머스 신호색(당일·오늘) 강조 */
.svch-headline .em{color:var(--accent)}

/* ─ 보조 캡션 ─ */
.svch-sub{
  font-family:var(--font-body),'Pretendard',sans-serif;
  font-size:14px;
  color:rgba(255,255,255,.45);
  letter-spacing:.02em;
  line-height:1.6;
  margin-bottom:36px;
}

/* ─ 차량+제품 합성 영역 ─ */
.svch-composite{
  position:relative;
  width:100%;
  /* 차량 이미지 높이에 맞게 자동 확장, 제품 이미지 오버플로우 허용 */
  display:flex;
  align-items:flex-end;
  justify-content:center;
  min-height:220px;
  padding:0 0 0;
}

/* 배송차량 — 중앙, 전폭의 70~80% */
.svch-vehicle{
  width:78%;
  max-width:600px;
  aspect-ratio:3/2;
  object-fit:contain;
  display:block;
  position:relative;
  z-index:2;
}
.svch-vehicle.ph{
  width:78%;
  max-width:600px;
  aspect-ratio:3/2;
  border:2px dashed rgba(255,255,255,.15);
  background:rgba(255,255,255,.05);
  color:rgba(255,255,255,.3);
  z-index:2;
  position:relative;
}

/* 제품 누끼 — 절대 위치, 좌/우 floating */
.svch-product-left,
.svch-product-right{
  position:absolute;
  bottom:0;
  width:34%;
  max-width:240px;
  aspect-ratio:1/1;
  object-fit:contain;
  z-index:3;
}
.svch-product-left{left:0}
.svch-product-right{right:0}

/* placeholder 스타일 */
.svch-product-left.ph,
.svch-product-right.ph{
  border:2px dashed rgba(255,255,255,.12);
  background:rgba(255,255,255,.04);
  color:rgba(255,255,255,.25);
  font-size:11px;
}

/* ─ 하단 캡션 ─ */
.svch-footer{
  padding:28px 40px 0;
  font-family:var(--font-body),'Pretendard',sans-serif;
  font-size:14px;
  color:rgba(255,255,255,.45);
  line-height:1.65;
  letter-spacing:-.005em;
}
.svch-footer .em{color:var(--accent);font-weight:700}
`,
  render: (d, { esc, richSafe }) => {
    // inline clock SVG (shared ICONS에 'clock'이 있으나 직접 노출이 더 명확)
    const clockSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></svg>`

    const vehicleHtml = media(
      d.vehicleImage,
      'svch-vehicle',
      esc(d.vehicleImageAlt ?? '배송차량'),
    )
    const leftHtml = media(
      d.productLeftImage,
      'svch-product-left',
      esc(d.productLeftAlt ?? '제품 이미지 (좌)'),
    )
    const rightHtml = media(
      d.productRightImage,
      'svch-product-right',
      esc(d.productRightAlt ?? '제품 이미지 (우)'),
    )

    return `
<section class="svch">
  <div class="svch-eyebrow-wrap">
    <span class="svch-clock">${clockSvg}</span>
    <span class="svch-eyebrow">${esc(d.eyebrow)}</span>
  </div>
  <h2 class="svch-headline">${richSafe(d.headline)}</h2>
  ${d.subCaption ? `<p class="svch-sub">${esc(d.subCaption)}</p>` : ''}
  <div class="svch-composite">
    ${leftHtml}
    ${vehicleHtml}
    ${rightHtml}
  </div>
  ${d.footerCaption ? `<p class="svch-footer">${richSafe(d.footerCaption)}</p>` : ''}
</section>`
  },
})
