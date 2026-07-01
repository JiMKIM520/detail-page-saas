/** CS 아키타입: shipping-date-timeline.
 *  [끝판왕] CS 구성 #19 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 라이트 배경 + 대형 배송공지 헤드라인 + 수평 컬러 레일 + 날짜-텍스트 타임라인 반복.
 *  각 스텝: 굵은 컬러 수평 바(레일)가 왼쪽에 붙고 대형 날짜 숫자 + 설명 카피(일부 볼드).
 *  마지막 스텝은 레일 없이 들여쓰기 형태(선택). 하단 보조 이미지 슬롯 1개(선택). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

/** 레일 색상: accent=브랜드 포인트색, danger=경고/빨강, neutral=중립회색, none=레일 없음 */
const RAIL_COLOR = ['accent', 'danger', 'neutral', 'none'] as const

const schema = z.object({
  /** 상단 대형 헤드라인 (예: "배송공지", "출고 안내") */
  title: z.string().min(1),
  /** 타임라인 스텝 (2~5개) */
  steps: z
    .array(
      z.object({
        /** 레일 바 색상 (기본 "neutral") */
        rail: z.enum(RAIL_COLOR).optional(),
        /** 대형 날짜 숫자 또는 키워드 (예: "19", "D-7") */
        date: z.string().min(1),
        /** 날짜 뒤 부가 정보 (예: "일(목)까지", "일(금) 부터") */
        dateSuffix: z.string().optional(),
        /** 핵심 카피 (em 허용 — 볼드 강조 어절) */
        label: z.string().min(1),
        /** 두 번째 날짜+설명이 같은 줄에 이어질 때 (예: "20 일(금) 부터") */
        continuation: z.string().optional(),
      }),
    )
    .min(2)
    .max(5),
  /** 하단 보조 이미지 URL (선택 — 창고/물류 일러스트 등) */
  image: z.string().optional(),
  /** 이미지 alt */
  imageAlt: z.string().optional(),
})
type Data = z.infer<typeof schema>

/** 레일 색상 → CSS color 값 매핑 */
function railColor(rail: (typeof RAIL_COLOR)[number] | undefined): string {
  switch (rail) {
    case 'accent':
      return 'var(--accent)'
    case 'danger':
      return '#e02020'
    case 'none':
      return 'transparent'
    case 'neutral':
    default:
      return '#444'
  }
}

export const shippingDateTimeline = defineBlock<Data>({
  id: 'shipping-date-timeline',
  archetype: 'cs' as any,
  styleTags: ['light', 'cs', 'timeline', 'shipping', 'notice', 'template'],
  imageSlots: 1,
  describe:
    '배송공지 날짜 타임라인. 라이트 배경 + 대형 헤드라인 + [수평 컬러 레일 바 + 대형 날짜 숫자 + 설명 카피] 수직 반복(2~5스텝). 레일 색은 neutral/accent/danger/none 선택. 마지막 스텝은 레일 없이 가능. 하단 일러스트 이미지 선택.',
  schema,
  css: `
/* ── shipping-date-timeline: sdt prefix ── */

/* 라이트 배경 블록: --paper/--bg, 본문 --ink, 보조 --muted, 강조 --accent-d */
.sdt{
  background:var(--paper);
  color:var(--ink);
  padding:52px 40px 48px;
}

/* 대형 헤드라인 */
.sdt-title{
  font-family:var(--font-display);
  font-weight:900;
  font-size:clamp(40px,9vw,64px);
  line-height:1.1;
  letter-spacing:-.03em;
  color:var(--ink);
  margin-bottom:36px;
}
.sdt-title .em{color:var(--accent-d)}

/* 타임라인 컨테이너 */
.sdt-timeline{
  display:flex;
  flex-direction:column;
  gap:0;
}

/* 개별 스텝 행 */
.sdt-step{
  display:flex;
  align-items:center;
  min-height:54px;
  margin-bottom:20px;
}
.sdt-step:last-child{margin-bottom:0}

/* 수평 컬러 레일 바 — 왼쪽 */
.sdt-rail{
  flex-shrink:0;
  width:56px;
  height:10px;
  border-radius:2px;
  margin-right:18px;
  /* color는 인라인 style로 주입 */
}

/* 레일 없는 스텝(none): 레일 너비만큼 들여쓰기 */
.sdt-rail-none{
  flex-shrink:0;
  width:74px; /* 56px rail + 18px gap */
}

/* 날짜+카피 영역 */
.sdt-content{
  display:flex;
  align-items:baseline;
  flex-wrap:wrap;
  gap:0 8px;
}

/* 대형 날짜 숫자 */
.sdt-date{
  font-family:var(--font-display);
  font-weight:900;
  font-size:clamp(32px,7vw,52px);
  line-height:1;
  letter-spacing:-.03em;
  color:var(--ink);
}
/* accent rail 스텝은 날짜를 accent-d로 강조 */
.sdt-step--accent .sdt-date{
  color:var(--accent-d);
}
/* danger rail 스텝은 날짜를 danger 색으로 */
.sdt-step--danger .sdt-date{
  color:#e02020;
}

/* 날짜 접미사 (일(목)까지 …) */
.sdt-date-suffix{
  font-family:var(--font-body);
  font-size:clamp(14px,2.4vw,17px);
  font-weight:400;
  color:var(--ink);
  line-height:1;
}

/* 핵심 카피 */
.sdt-label{
  font-family:var(--font-body);
  font-size:clamp(14px,2.4vw,17px);
  font-weight:400;
  color:var(--ink);
  line-height:1.5;
}
.sdt-label .em{
  font-weight:700;
  color:var(--ink);
}

/* 연속 카피 (한 줄 이어지는 두 번째 날짜+설명) */
.sdt-continuation{
  font-family:var(--font-body);
  font-size:clamp(14px,2.4vw,17px);
  font-weight:400;
  color:var(--ink);
  line-height:1.5;
}
.sdt-continuation .em{
  font-weight:700;
  color:var(--accent-d);
}

/* 물결 밑줄 장식 (스퀴글) — 각 스텝 하단 */
.sdt-squiggle{
  width:80px;
  height:4px;
  margin-top:6px;
  background:
    radial-gradient(ellipse 4px 3px at 4px 1px, transparent 2px, var(--line) 2px, var(--line) 3px, transparent 3px),
    radial-gradient(ellipse 4px 3px at 4px 3px, transparent 2px, var(--line) 2px, var(--line) 3px, transparent 3px);
  background-size:8px 4px;
  background-repeat:repeat-x;
  opacity:.5;
}

/* 하단 보조 이미지 */
.sdt-image{
  width:100%;
  display:block;
  margin-top:32px;
  max-height:320px;
  object-fit:contain;
  object-position:center bottom;
}
.sdt-image.ph{
  width:100%;
  height:200px;
  border:2px dashed var(--line);
  background:rgba(0,0,0,.03);
  color:var(--muted);
  margin-top:32px;
}
`,
  render: (d, { esc, richSafe }) => {
    const stepsHtml = d.steps
      .map((step) => {
        const rail = step.rail ?? 'neutral'
        const isNone = rail === 'none'
        const modClass = isNone ? '' : ` sdt-step--${rail}`

        const railEl = isNone
          ? `<div class="sdt-rail-none"></div>`
          : `<div class="sdt-rail" style="background:${railColor(rail)}"></div>`

        const continuationEl = step.continuation
          ? `<span class="sdt-continuation">${richSafe(step.continuation)}</span>`
          : ''

        return `
    <div class="sdt-step${modClass}">
      ${railEl}
      <div>
        <div class="sdt-content">
          <span class="sdt-date">${esc(step.date)}</span>
          ${step.dateSuffix ? `<span class="sdt-date-suffix">${esc(step.dateSuffix)}</span>` : ''}
          <span class="sdt-label">${richSafe(step.label)}</span>
          ${continuationEl}
        </div>
        <div class="sdt-squiggle"></div>
      </div>
    </div>`
      })
      .join('')

    const imageEl =
      d.image || d.imageAlt
        ? media(d.image, 'sdt-image', esc(d.imageAlt ?? '배송 안내 이미지'))
        : ''

    return `
<section class="sdt">
  <h2 class="sdt-title">${richSafe(d.title)}</h2>
  <div class="sdt-timeline">
    ${stepsHtml}
  </div>
  ${imageEl}
</section>`
  },
})
