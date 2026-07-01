/** CS 아키타입: cs-vacation-calendar.
 *  [끝판왕] CS #7 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 라이트 배경 + 대형 display 타이틀(여름휴가·명절 등) + 요일 헤더 + 압축 2~3주 캘린더 뷰.
 *  날짜 상태: 정상(plain) / 범위강조(연속 pill-band) / 휴무(filled circle) / 재개(outline circle).
 *  각 날짜 아래 짧은 레이블. 하단 안내 문구 1~3줄.
 *  monthly-calendar 차별점: 전체 월 그리드가 아닌 휴가·명절 구간만 표시하는 이벤트 창(compressed window). */
import { z } from 'zod'
import { defineBlock } from '../types'

/** 날짜 셀 상태 */
const DayState = z.enum(['normal', 'range', 'closed', 'resume'])

const schema = z.object({
  /** 대형 상단 타이틀 (예: "SUMMER VACATION", "추석 연휴 안내") */
  title: z.string().min(1),
  /** 표시할 주(week) 배열. 각 주는 7칸(일~토). 빈 칸은 빈 문자열. */
  weeks: z
    .array(
      z.object({
        /** 일~토 순서, 7개. 비어 있는 앞/뒷 날짜는 빈 문자열 "" */
        days: z
          .array(
            z.object({
              /** 날짜 숫자 텍스트 (예: "07") 또는 "" */
              date: z.string(),
              /** 날짜 상태. "" 날짜는 normal 무시됨 */
              state: DayState.default('normal'),
              /** 날짜 아래 짧은 레이블 (선택). em/br 허용 */
              label: z.string().optional(),
            }),
          )
          .length(7),
      }),
    )
    .min(1)
    .max(4),
  /** 하단 안내 문구 (1~3줄). em/br 허용 */
  notes: z.array(z.string().min(1)).min(1).max(3),
})
type Data = z.infer<typeof schema>

/** 요일 헤더 라벨 */
const DOW = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

export const csVacationCalendar = defineBlock<Data>({
  id: 'cs-vacation-calendar',
  archetype: 'shipping' as any,
  styleTags: ['light', 'cs', 'calendar', 'vacation', 'holiday', 'minimal', 'template'],
  imageSlots: 0,
  describe:
    'CS 휴가·명절 캘린더. 라이트 배경 + 대형 display 타이틀 + 요일 헤더 + 압축 2~3주 캘린더(정상/범위강조/휴무filled/재개outline 상태 표현) + 날짜별 짧은 레이블 + 하단 안내 문구. monthly-calendar와 달리 전체 월이 아닌 휴가 구간 이벤트 창 형태.',
  schema,
  css: `
/* cs-vacation-calendar — 접두사 cvc- */

/* 라이트 배경 블록: --paper/--bg, 본문 --ink, 보조 --muted, 레이블 --accent-d */
.cvc{
  background:var(--paper);
  color:var(--ink);
  padding:60px 32px 64px;
  text-align:center;
}

/* 대형 타이틀 */
.cvc-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(28px,7vw,48px);
  line-height:1.12;
  letter-spacing:-.01em;
  color:var(--ink);
  margin-bottom:40px;
}
.cvc-title .em{color:var(--accent-d)}

/* 캘린더 컨테이너 */
.cvc-cal{
  width:100%;
  max-width:640px;
  margin:0 auto;
}

/* 요일 헤더 행 */
.cvc-dow{
  display:grid;
  grid-template-columns:repeat(7,1fr);
  margin-bottom:0;
}
.cvc-dow-cell{
  font-family:var(--font-display);
  font-weight:700;
  font-size:clamp(10px,2.2vw,13px);
  letter-spacing:.04em;
  color:var(--ink);
  padding:8px 0;
  text-align:center;
}

/* 헤어라인 구분선 (헤더 하단) */
.cvc-rule{
  border:none;
  border-top:1.5px solid var(--ink);
  margin:0 0 4px;
  opacity:.18;
}

/* 주 행 */
.cvc-week{
  display:grid;
  grid-template-columns:repeat(7,1fr);
  margin-bottom:0;
  position:relative;
}

/* 범위 강조 band — range 셀들의 배경을 가로로 연결하는 pill 효과.
   첫 번째 range 셀: 왼쪽 반원, 마지막: 오른쪽 반원, 중간: 사각.
   JS 없이 CSS만으로 구현 — range 상태를 data-attr로 전달. */
.cvc-day[data-state="range"]{
  background:rgba(0,0,0,.07);
  border-radius:0;
}
.cvc-day[data-state="range"][data-range-start="1"]{
  border-radius:999px 0 0 999px;
}
.cvc-day[data-state="range"][data-range-end="1"]{
  border-radius:0 999px 999px 0;
}
/* 범위가 1칸일 때(start+end 동시) */
.cvc-day[data-state="range"][data-range-start="1"][data-range-end="1"]{
  border-radius:999px;
}

/* 날짜 셀 */
.cvc-day{
  display:flex;
  flex-direction:column;
  align-items:center;
  padding:10px 2px 0;
  min-height:70px;
  position:relative;
}

/* 날짜 숫자 래퍼 (circle 시각화) */
.cvc-num{
  width:clamp(30px,7vw,38px);
  height:clamp(30px,7vw,38px);
  display:flex;
  align-items:center;
  justify-content:center;
  font-family:var(--font-display);
  font-size:clamp(14px,3.2vw,20px);
  font-weight:500;
  color:var(--ink);
  border-radius:50%;
  flex-shrink:0;
}

/* 휴무(closed): filled circle — 중립 회색(커머스 신호색 아님) */
.cvc-day[data-state="closed"] .cvc-num{
  background:#9e9e9e;
  color:#fff;
  font-weight:700;
}

/* 재개(resume): outline circle */
.cvc-day[data-state="resume"] .cvc-num{
  border:2px solid var(--ink);
  font-weight:700;
}

/* 빈 셀 */
.cvc-day.cvc-empty .cvc-num{
  visibility:hidden;
}

/* 날짜 레이블 */
.cvc-label{
  font-family:var(--font-body);
  font-size:clamp(9px,2vw,11px);
  line-height:1.4;
  color:var(--muted);
  margin-top:4px;
  text-align:center;
  letter-spacing:-.01em;
}
.cvc-label .em{color:var(--accent-d);font-weight:700}

/* 주 사이 여백 */
.cvc-week+.cvc-week{
  margin-top:8px;
}

/* 하단 안내 문구 */
.cvc-notes{
  margin-top:40px;
  display:flex;
  flex-direction:column;
  gap:6px;
}
.cvc-note{
  font-family:var(--font-body);
  font-size:clamp(12px,2.8vw,14px);
  line-height:1.7;
  color:var(--muted);
  letter-spacing:-.005em;
}
.cvc-note .em{color:var(--accent-d);font-weight:700}
`,
  render: (d, { esc, richSafe }) => {
    // 요일 헤더
    const dowHtml = DOW.map(
      (day) => `<div class="cvc-dow-cell">${day}</div>`,
    ).join('')

    // 주 렌더 — range 연속 감지로 data-range-start/end 부여
    const weeksHtml = d.weeks
      .map((week) => {
        // range 연속 구간 계산 (주 내에서만)
        const states = week.days.map((c) => c.state)
        const isRangeStart = states.map(
          (s, i) => s === 'range' && (i === 0 || states[i - 1] !== 'range'),
        )
        const isRangeEnd = states.map(
          (s, i) => s === 'range' && (i === 6 || states[i + 1] !== 'range'),
        )

        const daysHtml = week.days
          .map((cell, i) => {
            const isEmpty = cell.date === ''
            const stateAttr = `data-state="${cell.state}"`
            const rangeStartAttr = isRangeStart[i] ? ' data-range-start="1"' : ''
            const rangeEndAttr = isRangeEnd[i] ? ' data-range-end="1"' : ''
            const emptyClass = isEmpty ? ' cvc-empty' : ''

            return `<div class="cvc-day${emptyClass}" ${stateAttr}${rangeStartAttr}${rangeEndAttr}>
  <div class="cvc-num">${isEmpty ? '' : esc(cell.date)}</div>
  ${cell.label ? `<div class="cvc-label">${richSafe(cell.label)}</div>` : ''}
</div>`
          })
          .join('')

        return `<div class="cvc-week">${daysHtml}</div>`
      })
      .join('')

    const notesHtml = d.notes
      .map((n) => `<p class="cvc-note">${richSafe(n)}</p>`)
      .join('')

    return `
<section class="cvc">
  <h2 class="cvc-title">${richSafe(d.title)}</h2>
  <div class="cvc-cal">
    <div class="cvc-dow">${dowHtml}</div>
    <hr class="cvc-rule">
    ${weeksHtml}
  </div>
  <div class="cvc-notes">
    ${notesHtml}
  </div>
</section>`
  },
})
