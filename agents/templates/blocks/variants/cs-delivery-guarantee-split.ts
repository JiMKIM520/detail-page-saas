/** CS 아키타입: cs-delivery-guarantee-split.
 *  [끝판왕] CS 구성 #6 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: brand 솔리드 배경 상단 존 (아치/원형 모티프 + 일러스트 이미지 + eyebrow + 대형 발송 헤드라인)
 *  + 2컬럼 조건 카드 분리 (평일=라이트, 주말=브랜드 다크) + 도착보장 배지
 *  + 하단 footnote 본문 + 유의사항 리스트. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 상단 eyebrow 텍스트 (예: "밤 12시까지 주문 시") */
  eyebrow: z.string().min(1),
  /** 대형 발송 헤드라인 (em 허용, 예: "당일 발송!") */
  headline: z.string().min(1),
  /** 상단 아치존 일러스트 이미지 URL (트럭·선물상자 3D 오브젝트 등, 선택) */
  heroImage: z.string().optional(),
  /** 일러스트 alt */
  heroImageAlt: z.string().optional(),

  /** 평일 조건 카드 */
  weekday: z.object({
    /** 카드 배지 라벨 (예: "도착보장") */
    badge: z.string().min(1),
    /** 카드 본문 — 결제 마감 조건 (em 허용, 예: "평일 PM 11:30까지 결제 시") */
    condition: z.string().min(1),
  }),

  /** 주말 조건 카드 */
  weekend: z.object({
    /** 강조 헤드 (대형, em 허용, 예: "주말에도") */
    head: z.string().min(1),
    /** 카드 배지 라벨 (예: "도착보장") */
    badge: z.string().min(1),
    /** 카드 본문 — 결제 마감 조건 (em 허용) */
    condition: z.string().min(1),
    /** 보조 조건 설명 (선택, 예: "일요일 도착 (수도권역 한정)") */
    subCondition: z.string().optional(),
  }),

  /** 하단 footnote 본문 (em 허용, 선택) */
  footnote: z.string().optional(),
  /** 유의사항 리스트 (1~5개, 선택) */
  notices: z
    .array(z.string().min(1))
    .min(1)
    .max(5)
    .optional(),
})
type Data = z.infer<typeof schema>

export const csDeliveryGuaranteeSplit = defineBlock<Data>({
  id: 'cs-delivery-guarantee-split',
  archetype: 'cs',
  styleTags: ['cs', 'shipping', 'brand', 'split', 'guarantee', 'light'],
  imageSlots: 1,
  describe:
    '당일발송·도착보장 CS 블록. brand 배경 상단 아치존(일러스트+eyebrow+대형 헤드라인) + 2컬럼 조건 카드(평일=라이트/주말=brand다크, 도착보장 배지) + 하단 footnote+유의사항 리스트.',
  schema,
  css: `
/* cs-delivery-guarantee-split — 접두사 cdg- */

/* 라이트 배경 블록 래퍼 */
.cdg{
  background:var(--paper);
  color:var(--ink);
  overflow:hidden;
}

/* ── 상단 아치존 (brand 배경) ── */
.cdg-hero{
  background:var(--brand);
  padding:36px 32px 48px;
  text-align:center;
  position:relative;
  /* 아래쪽 원형 아치 모티프 — pseudo로 연출 */
}
.cdg-hero::after{
  content:'';
  display:block;
  position:absolute;
  bottom:-32px;
  left:50%;
  transform:translateX(-50%);
  width:200%;
  height:64px;
  background:var(--brand);
  border-radius:0 0 50% 50%;
  pointer-events:none;
}

/* 일러스트 이미지 */
.cdg-illust{
  width:clamp(120px,30vw,160px);
  height:clamp(120px,30vw,160px);
  object-fit:contain;
  display:block;
  margin:0 auto 20px;
}
.cdg-illust.ph{
  width:clamp(120px,30vw,160px);
  height:clamp(120px,30vw,160px);
  border:2px dashed rgba(255,255,255,.3);
  background:rgba(255,255,255,.08);
  color:rgba(255,255,255,.5);
  border-radius:calc(var(--r-scale,1)*12px);
  margin:0 auto 20px;
}

/* eyebrow */
.cdg-eyebrow{
  font-family:var(--font-body);
  font-size:clamp(14px,3vw,17px);
  font-weight:500;
  line-height:1.4;
  color:rgba(255,255,255,.88);
  letter-spacing:.01em;
  margin-bottom:4px;
}

/* 대형 헤드라인 */
.cdg-headline{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(36px,8vw,56px);
  line-height:1.12;
  letter-spacing:-.025em;
  color:#fff;
  margin-bottom:0;
}
/* 다크 배경 — .em은 밝은 accent로 override */
.cdg-headline .em{color:var(--accent)}

/* ── 카드 영역 ── */
.cdg-cards{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:0;
  margin:52px 20px 32px;
  border-radius:calc(var(--r-scale,1)*16px);
  overflow:hidden;
  box-shadow:0 2px 16px rgba(0,0,0,.08);
}

/* 공통 카드 */
.cdg-card{
  padding:24px 16px 28px;
  display:flex;
  flex-direction:column;
  align-items:center;
  text-align:center;
  gap:10px;
}

/* 평일 카드 — 라이트 */
.cdg-card--weekday{
  background:var(--bg);
}

/* 주말 카드 — brand 다크 */
.cdg-card--weekend{
  background:var(--brand);
}

/* 트럭 아이콘 래퍼 */
.cdg-card-icon{
  width:36px;
  height:36px;
  flex-shrink:0;
}
.cdg-card--weekday .cdg-card-icon{
  color:var(--accent-d);
}
.cdg-card--weekend .cdg-card-icon{
  color:var(--accent);
}

/* 배지 라벨 */
.cdg-badge{
  display:inline-block;
  font-family:var(--font-body);
  font-weight:700;
  font-size:clamp(11px,2.4vw,13px);
  letter-spacing:.04em;
  padding:4px 10px;
  border-radius:999px;
  line-height:1.3;
}
.cdg-card--weekday .cdg-badge{
  background:var(--accent-d);
  color:#fff;
}
.cdg-card--weekend .cdg-badge{
  background:#fff;
  color:var(--brand);
}

/* 주말 대형 강조 헤드 */
.cdg-weekend-head{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(24px,5.5vw,36px);
  line-height:1.15;
  letter-spacing:-.02em;
  color:#fff;
  margin-bottom:2px;
}
.cdg-weekend-head .em{color:var(--accent)}

/* 조건 텍스트 */
.cdg-condition{
  font-family:var(--font-body);
  font-size:clamp(12px,2.6vw,14px);
  line-height:1.6;
  letter-spacing:-.01em;
}
.cdg-card--weekday .cdg-condition{
  color:var(--ink);
}
.cdg-card--weekend .cdg-condition{
  color:rgba(255,255,255,.9);
}
.cdg-card--weekday .cdg-condition .em{color:var(--accent-d);font-weight:700}
.cdg-card--weekend .cdg-condition .em{color:var(--accent);font-weight:700}

/* 보조 조건 */
.cdg-sub-condition{
  font-family:var(--font-body);
  font-size:clamp(11px,2.2vw,12px);
  line-height:1.5;
  color:rgba(255,255,255,.7);
  letter-spacing:-.005em;
}

/* ── 하단 footnote + 유의사항 ── */
.cdg-footer{
  padding:0 28px 48px;
  text-align:center;
}
.cdg-footnote{
  font-family:var(--font-body);
  font-weight:500;
  font-size:clamp(13px,2.8vw,15px);
  line-height:1.7;
  color:var(--ink);
  margin-bottom:20px;
}
.cdg-footnote .em{color:var(--accent-d);font-weight:700}

.cdg-notices{
  list-style:none;
  display:flex;
  flex-direction:column;
  gap:6px;
  text-align:left;
}
.cdg-notice{
  font-family:var(--font-body);
  font-size:clamp(11px,2.2vw,13px);
  line-height:1.6;
  color:var(--muted);
  padding-left:14px;
  position:relative;
  letter-spacing:-.005em;
}
.cdg-notice::before{
  content:'·';
  position:absolute;
  left:4px;
  color:var(--muted);
}
`,
  render: (d, { esc, richSafe, icon }) => {
    const truckIcon = `<span class="cdg-card-icon" aria-hidden="true">${icon('truck')}</span>`

    // 평일 카드
    const weekdayCard = `
<div class="cdg-card cdg-card--weekday">
  ${truckIcon}
  <span class="cdg-badge">${esc(d.weekday.badge)}</span>
  <p class="cdg-condition">${richSafe(d.weekday.condition)}</p>
</div>`

    // 주말 카드
    const weekendCard = `
<div class="cdg-card cdg-card--weekend">
  <h3 class="cdg-weekend-head">${richSafe(d.weekend.head)}</h3>
  ${truckIcon}
  <span class="cdg-badge">${esc(d.weekend.badge)}</span>
  <p class="cdg-condition">${richSafe(d.weekend.condition)}</p>
  ${d.weekend.subCondition ? `<p class="cdg-sub-condition">${esc(d.weekend.subCondition)}</p>` : ''}
</div>`

    // 유의사항 리스트
    const noticesHtml =
      d.notices && d.notices.length > 0
        ? `<ul class="cdg-notices">${d.notices.map((n) => `<li class="cdg-notice">${esc(n)}</li>`).join('')}</ul>`
        : ''

    // footnote
    const footnoteHtml = d.footnote
      ? `<p class="cdg-footnote">${richSafe(d.footnote)}</p>`
      : ''

    return `
<section class="cdg">
  <div class="cdg-hero">
    ${media(d.heroImage, 'cdg-illust', esc(d.heroImageAlt ?? '배송 일러스트'))}
    <p class="cdg-eyebrow">${esc(d.eyebrow)}</p>
    <h2 class="cdg-headline">${richSafe(d.headline)}</h2>
  </div>
  <div class="cdg-cards">
    ${weekdayCard}
    ${weekendCard}
  </div>
  <div class="cdg-footer">
    ${footnoteHtml}
    ${noticesHtml}
  </div>
</section>`
  },
})
