/** SHIPPING 아키타입: shipping-poly-deadline-split
 *  피그마 011_pc_자유배너11 구조 흡수.
 *  좌우 제품 사진 2장 사이에 노란 불규칙 다각형 SVG를 겹쳐 배송마감 시각(검정 배지) +
 *  당일발송 구호(형광펜 오렌지 밑줄)를 수직 스택으로 강조하는 긴장감 유도 배너.
 *  이미지 없어도 다각형+텍스트만으로 구조가 유지되는 noimg-safe 강등 구현. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 배지 안 레이블. 예: "배송마감" */
  badgeLabel: z.string().min(1).default('배송마감'),
  /** 마감 시각 문자열. 예: "02 : 00" — 콜론 포함 자유 형식 */
  cutoffTime: z.string().min(1).default('02 : 00'),
  /** 마감 시각 앞 수식어. 예: "오후" */
  timePeriod: z.string().optional(),
  /** 당일발송 구호. 슬래시 분절 또는 일반 문자열. 예: "당/일/발/송" */
  tagline: z.string().min(1).default('당일발송'),
  /** 왼쪽 제품 이미지 (url). 브리프에 근거 있을 때만. */
  imageLeft: z.string().optional(),
  /** 오른쪽 제품 이미지 (url). 브리프에 근거 있을 때만. */
  imageRight: z.string().optional(),
  /** 보조 안내 문구 (선택). 예: "오후 2시 이전 주문 시 당일발송" — 브리프 근거 시만. */
  subNote: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const shippingPolyDeadlineSplit = defineBlock<Data>({
  id: 'shipping-poly-deadline-split',
  archetype: 'shipping',
  styleTags: ['light', 'bold', 'urgency', 'noimg-safe'],
  imageSlots: 2,
  describe:
    '라이트 배경 전폭 배너. 좌우 제품 사진 2장 사이 중앙에 노란 불규칙 다각형 SVG를 겹쳐 배송마감 검정 배지+마감 시각+당일발송 형광펜 구호를 수직 스택으로 강조. 이미지 없을 때 다각형+텍스트 구조로 강등.',
  schema,
  css: `
/* ── shipping-poly-deadline-split (sxvu) ── */
.sxvu{
  position:relative;
  display:flex;
  flex-direction:row;
  align-items:stretch;
  background:var(--bg);
  overflow:hidden;
  min-height:200px;
  height:200px;
  max-width:872px;
  width:100%;
}

/* 좌우 이미지 패널 */
.sxvu-img{
  flex:0 0 29.6875%;
  position:relative;
  overflow:hidden;
  height:100%;
}
.sxvu-img img{
  position:absolute;
  inset:0;
  width:100%;
  height:100%;
  object-fit:cover;
  display:block;
  border-radius:var(--shape-photo, calc(var(--r-scale,1)*0px));
}
/* noimg-safe: 이미지 없으면 패널을 얇게 수축해 구조 유지 */
.sxvu-img.sxvu--noimg{
  flex:0 0 24px;
  background:color-mix(in srgb,var(--accent) 8%,transparent);
}

/* 중앙 콘텐츠 영역 */
.sxvu-center{
  flex:1 1 auto;
  position:relative;
  display:flex;
  align-items:center;
  justify-content:center;
  z-index:2;
}

/* 노란 불규칙 다각형 배경 (인라인 SVG 절대 배치) */
.sxvu-poly{
  position:absolute;
  inset:0;
  width:100%;
  height:100%;
  z-index:0;
}
.sxvu-poly-shape{
  fill:#fff700;
}

/* 텍스트 스택 */
.sxvu-stack{
  position:relative;
  z-index:1;
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:6px;
  padding:0 var(--pad-x,56px);
  width:100%;
}

/* 배송마감 배지 */
.sxvu-badge{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  background:#000;
  border-radius:calc(var(--r-scale,1)*10px);
  padding:4px 20px 5px;
}
.sxvu-badge-label{
  font-family:var(--font-display);
  font-weight:500;
  font-size:clamp(18px,2.2vw,28px);
  color:#ffc3c3;
  letter-spacing:.04em;
  line-height:1.1;
}

/* 시각 행: [오후] [02 : 00] */
.sxvu-time-row{
  display:flex;
  align-items:baseline;
  gap:10px;
}
.sxvu-period{
  font-family:var(--font-display);
  font-weight:700;
  font-size:clamp(22px,2.8vw,38px);
  color:var(--ink);
  line-height:1;
}
.sxvu-time{
  font-family:var(--font-display);
  font-weight:700;
  font-size:clamp(38px,5.5vw,70px);
  color:var(--ink);
  letter-spacing:-.02em;
  line-height:1;
}

/* 당일발송 구호 + 형광펜 밑줄 */
.sxvu-tagline-wrap{
  position:relative;
  display:inline-block;
}
.sxvu-tagline{
  font-family:var(--font-display);
  font-weight:700;
  font-size:clamp(22px,3vw,45px);
  color:var(--ink);
  letter-spacing:.02em;
  line-height:1.1;
  position:relative;
  z-index:1;
}
/* 형광펜 오렌지 밑줄 — 텍스트 아래 20px 높이 직사각형 */
.sxvu-highlight{
  position:absolute;
  bottom:1px;
  left:0;
  right:0;
  height:clamp(10px,1.4vw,20px);
  background:#ff7200;
  opacity:.72;
  border-radius:calc(var(--r-scale,1)*2px);
  z-index:0;
}

/* 보조 안내 */
.sxvu-subnote{
  font-size:clamp(11px,1.1vw,14px);
  color:var(--ink-2);
  font-weight:500;
  letter-spacing:.01em;
  line-height:1.5;
}
`,
  render: (d, { esc, richSafe }) => {
    const hasLeft  = typeof d.imageLeft  === 'string' && d.imageLeft.trim().length  > 0
    const hasRight = typeof d.imageRight === 'string' && d.imageRight.trim().length > 0

    const leftPanel  = `<div class="sxvu-img${hasLeft  ? '' : ' sxvu--noimg'}">${hasLeft  ? media(d.imageLeft,  'sxvu-img-el', '제품 이미지 좌') : ''}</div>`
    const rightPanel = `<div class="sxvu-img${hasRight ? '' : ' sxvu--noimg'}">${hasRight ? media(d.imageRight, 'sxvu-img-el', '제품 이미지 우') : ''}</div>`

    return `
<section class="sxvu" aria-label="배송 마감 안내">
  ${leftPanel}

  <div class="sxvu-center">
    <!-- 노란 불규칙 다각형 배경 -->
    <svg class="sxvu-poly" viewBox="0 0 766 200" preserveAspectRatio="none" aria-hidden="true">
      <polygon class="sxvu-poly-shape" points="
        38,0
        728,0
        766,38
        750,100
        766,162
        728,200
        38,200
        0,162
        16,100
        0,38
      "/>
    </svg>

    <!-- 텍스트 스택 -->
    <div class="sxvu-stack">
      <div class="sxvu-badge">
        <span class="sxvu-badge-label">${esc(d.badgeLabel)}</span>
      </div>

      <div class="sxvu-time-row">
        ${d.timePeriod ? `<span class="sxvu-period">${esc(d.timePeriod)}</span>` : ''}
        <span class="sxvu-time">${esc(d.cutoffTime)}</span>
      </div>

      <div class="sxvu-tagline-wrap">
        <span class="sxvu-tagline">${richSafe(d.tagline)}</span>
        <span class="sxvu-highlight" aria-hidden="true"></span>
      </div>

      ${d.subNote ? `<p class="sxvu-subnote">${esc(d.subNote)}</p>` : ''}
    </div>
  </div>

  ${rightPanel}
</section>`
  },
})
