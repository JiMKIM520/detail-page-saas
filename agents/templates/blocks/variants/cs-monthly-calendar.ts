/** CS 아키타입: cs-monthly-calendar.
 *  [끝판왕] CS 구성 #4 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: accent 다크 히어로존(월 타이틀 + 부제 + 주소/공지) + 흰 배경 7컬럼 캘린더 그리드
 *  + 네이비 pill 요일 헤더(일요일 danger색) + 날짜 원형 상태 배지(운영=accent/휴진=danger).
 *  병원·클리닉·매장 운영일정 안내용 CS 블록. */
import { z } from 'zod'
import { defineBlock } from '../types'

/** 날짜 셀 상태 */
const DayStatus = z.enum(['normal', 'operating', 'closed', 'empty'])
type DayStatusType = z.infer<typeof DayStatus>

const schema = z.object({
  /** 월 표기 (예: "10월", "11월") */
  month: z.string().min(1),
  /** 메인 부제 (예: "진료일정 안내") */
  subtitle: z.string().min(1),
  /** 공지 첫째 줄 (선택, em 허용) */
  notice1: z.string().optional(),
  /** 공지 둘째 줄 (선택) */
  notice2: z.string().optional(),
  /** 날짜 데이터 배열.
   *  7의 배수로 채울 것 (빈 셀은 date:"", status:"empty").
   *  status: normal=일반, operating=운영배지(accent원형), closed=휴진배지(danger원형), empty=빈칸.
   *  label: 배지 아래 작은 설명 (선택, 예: "기존장소 진료"). */
  days: z
    .array(
      z.object({
        /** 표시할 날짜 숫자 문자열 (빈 셀이면 "") */
        date: z.string(),
        /** 셀 상태 */
        status: DayStatus,
        /** 배지 아래 표시할 짧은 라벨 (선택) */
        label: z.string().optional(),
      }),
    )
    .min(7)
    .max(42),
})
type Data = z.infer<typeof schema>

/** 요일 헤더 레이블 — 고정 7컬럼 */
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

/** 날짜 셀 하나 렌더 */
function renderDay(
  day: { date: string; status: DayStatusType; label?: string },
  colIdx: number,
): string {
  if (day.status === 'empty' || day.date === '') {
    return '<div class="cmc-cell cmc-cell--empty"></div>'
  }
  const isSunday = colIdx === 0
  const isOperating = day.status === 'operating'
  const isClosed = day.status === 'closed'
  const hasBadge = isOperating || isClosed

  let dateEl: string
  if (hasBadge) {
    const badgeCls = isClosed ? 'cmc-badge cmc-badge--closed' : 'cmc-badge cmc-badge--op'
    dateEl = `<span class="${badgeCls}">${day.date}</span>`
  } else {
    const numCls = isSunday ? 'cmc-num cmc-num--sun' : 'cmc-num'
    dateEl = `<span class="${numCls}">${day.date}</span>`
  }

  const labelEl = day.label
    ? `<span class="cmc-label">${day.label}</span>`
    : ''

  return `<div class="cmc-cell">${dateEl}${labelEl}</div>`
}

export const csMonthlyCalendar = defineBlock<Data>({
  id: 'cs-monthly-calendar',
  archetype: 'shipping',
  styleTags: ['cs', 'calendar', 'schedule', 'light', 'accent-hero', 'clinic', 'template'],
  imageSlots: 0,
  describe:
    'CS 운영일정(월 캘린더). accent 다크 히어로존(대형 월 타이틀 + 부제 + 주소·공지) + 흰 배경 7컬럼 그리드 + 네이비 pill 요일 헤더(일=danger색) + 날짜 원형 배지(운영=accent/휴진=danger). 병원·클리닉·매장 일정 안내에 최적.',
  schema,
  css: `
/* cs-monthly-calendar — 접두사 cmc- */

/* ── 히어로존 (accent 다크 배경) ── */
.cmc{
  background:var(--paper);
  color:var(--ink);
  overflow:hidden;
}
.cmc-hero{
  background:var(--accent-d);
  color:#fff;
  text-align:center;
  padding:52px 32px 48px;
}
.cmc-month{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(56px,13vw,88px);
  line-height:1;
  letter-spacing:-.03em;
  color:#fff;
  margin-bottom:8px;
}
.cmc-subtitle{
  font-family:var(--font-display);
  font-weight:700;
  font-size:clamp(20px,4.5vw,28px);
  line-height:1.3;
  letter-spacing:-.01em;
  color:rgba(255,255,255,.92);
  margin-bottom:24px;
}
.cmc-notice{
  font-family:var(--font-body);
  font-size:14px;
  line-height:1.8;
  color:rgba(255,255,255,.76);
  letter-spacing:-.005em;
}
.cmc-notice .em{
  color:#fff;
  font-weight:700;
}

/* ── 캘린더 영역 ── */
.cmc-cal{
  background:#fff;
  padding:32px 24px 40px;
}

/* 요일 헤더 pill */
.cmc-weekdays{
  display:grid;
  grid-template-columns:repeat(7,1fr);
  background:var(--accent-d);
  border-radius:999px;
  margin-bottom:16px;
  overflow:hidden;
}
.cmc-wday{
  font-family:var(--font-display);
  font-weight:700;
  font-size:14px;
  text-align:center;
  padding:10px 0;
  color:#fff;
  letter-spacing:.01em;
}
/* 일요일(첫 번째) — danger 색 */
.cmc-wday:first-child{
  color:#ff4e4e;
}

/* 날짜 그리드 */
.cmc-grid{
  display:grid;
  grid-template-columns:repeat(7,1fr);
  gap:4px 0;
}

/* 날짜 셀 공통 */
.cmc-cell{
  display:flex;
  flex-direction:column;
  align-items:center;
  padding:6px 2px 8px;
  min-height:64px;
}
.cmc-cell--empty{
  min-height:64px;
}

/* 일반 날짜 숫자 */
.cmc-num{
  font-family:var(--font-display);
  font-weight:700;
  font-size:clamp(17px,3.8vw,22px);
  color:var(--ink);
  line-height:1.2;
}
/* 일요일 숫자 — danger 색 */
.cmc-num--sun{
  color:#ff4e4e;
}

/* 원형 배지 — 운영(accent/네이비) */
.cmc-badge{
  display:flex;
  align-items:center;
  justify-content:center;
  width:clamp(38px,8.5vw,48px);
  height:clamp(38px,8.5vw,48px);
  border-radius:50%;
  font-family:var(--font-display);
  font-weight:700;
  font-size:clamp(15px,3.4vw,19px);
  color:#fff;
  line-height:1;
  flex-shrink:0;
}
.cmc-badge--op{
  background:var(--accent-d);
}
/* 원형 배지 — 휴진(danger) */
.cmc-badge--closed{
  background:#ff4e4e;
}

/* 배지 아래 라벨 */
.cmc-label{
  font-family:var(--font-body);
  font-size:10px;
  line-height:1.4;
  color:var(--muted);
  text-align:center;
  margin-top:4px;
  letter-spacing:-.01em;
  max-width:48px;
}
`,
  render: (d, { esc, richSafe }) => {
    const noticeParts: string[] = []
    if (d.notice1) noticeParts.push(`<p class="cmc-notice">${richSafe(d.notice1)}</p>`)
    if (d.notice2) noticeParts.push(`<p class="cmc-notice">${esc(d.notice2)}</p>`)

    const weekdaysHtml = WEEKDAYS.map(
      (w) => `<div class="cmc-wday">${w}</div>`,
    ).join('')

    const cellsHtml = d.days
      .map((day, idx) => renderDay(day, idx % 7))
      .join('')

    return `
<section class="cmc">
  <div class="cmc-hero">
    <div class="cmc-month">${esc(d.month)}</div>
    <div class="cmc-subtitle">${esc(d.subtitle)}</div>
    ${noticeParts.join('\n    ')}
  </div>
  <div class="cmc-cal">
    <div class="cmc-weekdays">${weekdaysHtml}</div>
    <div class="cmc-grid">${cellsHtml}</div>
  </div>
</section>`
  },
})
