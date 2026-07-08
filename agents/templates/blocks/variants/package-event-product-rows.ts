/** LINEUP 아키타입: package-event-product-rows.
 *  [끝판왕] 상품구성 #20 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 이벤트 축제 다크 히어로(풍선·콘페티 데코 오브젝트 + pill 배지 + 대형 헤드라인)
 *  + 3단계 가격 공개 상품 리스트(정상가 취소선 → 행사가 취소선 → 최종가 bold + 역삼각형 할인율 배지).
 *  흥분·축제 커머스 분위기. 어두운 히어로와 밝은 상품 리스트가 한 유닛으로 결합. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media, attr } from '../shared'

const schema = z.object({
  /** 이벤트 기간 배지 (pill) */
  eventBadge: z.string().optional(),
  /** 대형 헤드라인 (em 허용 — accent 강조 어절) */
  title: z.string().min(1),
  /** 히어로 배경 데코 이미지 (풍선/오브젝트 합성 PNG, optional) */
  heroDecoImage: z.string().optional(),
  /** 상품 행 목록 (2~6개) */
  items: z
    .array(
      z.object({
        /** 상품 썸네일 이미지 URL */
        image: z.string().optional(),
        /** 상품명 (br, em 허용) */
        name: z.string().min(1),
        /** 정상가 (취소선 표시, 예: "17,000") */
        originalPrice: z.string().min(1),
        /** 행사가 (취소선 표시, 예: "12,900") */
        salePrice: z.string().min(1),
        /** 최종가 (bold 강조, 예: "9,900") */
        finalPrice: z.string().min(1),
        /** 할인율 (역삼각형 배지, 예: "42") — 숫자만 */
        discountRate: z.string().min(1),
      }),
    )
    .min(2)
    .max(6),
})
type Data = z.infer<typeof schema>

export const packageEventProductRows = defineBlock<Data>({
  id: 'package-event-product-rows',
  archetype: 'lineup',
  styleTags: ['event', 'dark-hero', 'price-stack', 'promo', 'festival', 'template'],
  imageSlots: 4,
  describe:
    '이벤트 축제 상품구성. 다크 히어로(pill 이벤트 배지 + 대형 헤드라인 + 풍선·데코 오브젝트) + 밝은 상품 행 리스트(정상가 취소선 → 행사가 취소선 → 최종가 bold + 역삼각형 할인율 배지) 결합. 설 추석 기획전 등 축제 커머스.',
  schema,
  css: `
/* package-event-product-rows — 접두사 pepr- */
.pepr{word-break:keep-all;overflow-wrap:break-word}

/* ── 히어로 ─────────────────────────────── */
.pepr-hero{
  position:relative;
  background:var(--ink);
  padding:40px 32px 44px;
  overflow:hidden;
  min-height:220px;
  display:flex;
  flex-direction:column;
  justify-content:flex-end;
}
/* 우상단 데코 이미지 (풍선/% 오브젝트) */
.pepr-deco{
  position:absolute;
  right:-12px;
  top:-8px;
  width:200px;
  height:200px;
  object-fit:contain;
  pointer-events:none;
  z-index:1;
}
.pepr-deco.ph{
  position:absolute;
  right:-12px;
  top:-8px;
  width:200px;
  height:200px;
  background:transparent;
  border:none;
}
/* 좌하단 콘페티 레이어 (CSS only) */
.pepr-confetti{
  position:absolute;
  inset:0;
  pointer-events:none;
  z-index:0;
  overflow:hidden;
}
.pepr-confetti::before,.pepr-confetti::after{
  content:'';
  position:absolute;
  border-radius:calc(var(--r-scale,1)*2px);
}
/* 파티 느낌 컬러 점들 */
.pepr-confetti::before{
  width:6px;height:12px;
  background:var(--accent);
  top:30%;left:10%;
  transform:rotate(30deg);
  opacity:.7;
}
.pepr-confetti::after{
  width:8px;height:8px;
  background:#FFD700;
  top:50%;left:22%;
  transform:rotate(-20deg);
  border-radius:50%;
  opacity:.6;
}

/* pill 배지 */
.pepr-badge{
  position:relative;
  z-index:2;
  display:inline-block;
  background:var(--accent);
  color:#fff;
  font-family:var(--font-body);
  font-weight:700;
  font-size:13px;
  padding:6px 16px;
  border-radius:999px;
  letter-spacing:.02em;
  margin-bottom:16px;
  align-self:flex-start;
}

/* 히어로 헤드라인 */
.pepr-title{
  position:relative;
  z-index:2;
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(28px,7vw,42px);
  line-height:1.22;
  letter-spacing:-.025em;
  color:#fff;
}
.pepr-title .em{
  /* 다크 배경 — accent 밝은 값 사용 */
  color:var(--accent);
}

/* ── 상품 리스트 ─────────────────────────── */
.pepr-list{
  background:var(--paper);
  padding:0 0 8px;
}
.pepr-row{
  display:grid;
  grid-template-columns:108px 1fr;
  gap:0 16px;
  align-items:center;
  padding:20px 24px;
  border-bottom:1px solid var(--line);
}
.pepr-row:last-child{
  border-bottom:none;
}

/* 썸네일 */
.pepr-thumb{
  width:108px;
  height:108px;
  object-fit:cover;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*8px));
  flex-shrink:0;
}
.pepr-thumb.ph{
  width:108px;
  height:108px;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*8px));
  font-size:12px;
}

/* 우측 텍스트+가격 영역 */
.pepr-info{
  display:flex;
  flex-direction:column;
  gap:0;
}
.pepr-name{
  font-family:var(--font-display);
  font-weight:700;
  font-size:16px;
  line-height:1.45;
  color:var(--ink);
  margin-bottom:12px;
}
.pepr-name .em{
  color:var(--accent-d);
}

/* 가격 그리드 */
.pepr-prices{
  display:grid;
  grid-template-columns:40px 1fr auto;
  row-gap:3px;
  align-items:baseline;
  position:relative;
}

/* 라벨 (정상가/행사가) */
.pepr-plabel{
  font-family:var(--font-body);
  font-size:11px;
  color:var(--muted);
  font-weight:500;
  white-space:nowrap;
  padding-right:4px;
}

/* 취소선 가격 */
.pepr-cross{
  font-family:var(--font-body);
  font-size:13px;
  color:var(--muted);
  text-decoration:line-through;
  font-weight:500;
}
/* 행사가 취소선 — accent 계열 */
.pepr-cross.sale{
  color:var(--accent);
  text-decoration-color:var(--accent);
}

/* 최종가 행 — 3컬럼 spanning 없이 자체 행 */
.pepr-final-row{
  grid-column:1/-1;
  display:flex;
  align-items:center;
  justify-content:flex-end;
  gap:10px;
  margin-top:6px;
}

/* 역삼각형 할인율 배지 */
.pepr-burst{
  position:relative;
  display:inline-flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  width:48px;
  height:52px;
  flex-shrink:0;
}
/* 역삼각형 clip-path */
.pepr-burst-bg{
  position:absolute;
  inset:0;
  background:var(--accent);
  clip-path:polygon(0 0, 100% 0, 50% 100%);
  border-radius:calc(var(--r-scale,1)*2px);
}
.pepr-burst-txt{
  position:relative;
  z-index:1;
  font-family:var(--font-display);
  font-weight:800;
  font-size:13px;
  color:#fff;
  line-height:1;
  margin-top:4px;
  letter-spacing:-.01em;
}
.pepr-burst-pct{
  position:relative;
  z-index:1;
  font-family:var(--font-body);
  font-weight:700;
  font-size:9px;
  color:rgba(255,255,255,.9);
  line-height:1;
}

/* 최종 가격 */
.pepr-final-price{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(26px,5.5vw,32px);
  color:var(--accent);
  letter-spacing:-.02em;
  line-height:1;
}
.pepr-final-won{
  font-family:var(--font-body);
  font-weight:700;
  font-size:16px;
  color:var(--accent);
}
`,
  render: (d, { esc, richSafe }) => {
    const badge = d.eventBadge
      ? `<span class="pepr-badge">${esc(d.eventBadge)}</span>`
      : ''

    const decoImg = d.heroDecoImage
      ? `<img class="pepr-deco" src="${attr(d.heroDecoImage)}" alt="이벤트 데코">`
      : `<div class="pepr-deco ph"></div>`

    const rows = d.items
      .map(
        (it) => `
    <div class="pepr-row">
      ${media(it.image, 'pepr-thumb', esc(it.name))}
      <div class="pepr-info">
        <div class="pepr-name">${richSafe(it.name)}</div>
        <div class="pepr-prices">
          <span class="pepr-plabel">정상가</span>
          <span class="pepr-cross">${esc(it.originalPrice)}</span>
          <span></span>
          <span class="pepr-plabel">행사가</span>
          <span class="pepr-cross sale">${esc(it.salePrice)}</span>
          <span></span>
          <div class="pepr-final-row">
            <span class="pepr-burst" aria-label="할인율 ${esc(it.discountRate)}%">
              <span class="pepr-burst-bg"></span>
              <span class="pepr-burst-txt">${esc(it.discountRate)}%</span>
            </span>
            <span class="pepr-final-price">${esc(it.finalPrice)}</span><span class="pepr-final-won">원</span>
          </div>
        </div>
      </div>
    </div>`,
      )
      .join('')

    return `
<section class="pepr">
  <div class="pepr-hero">
    <div class="pepr-confetti" aria-hidden="true"></div>
    ${decoImg}
    ${badge}
    <h2 class="pepr-title">${richSafe(d.title)}</h2>
  </div>
  <div class="pepr-list">
    ${rows}
  </div>
</section>`
  },
})
