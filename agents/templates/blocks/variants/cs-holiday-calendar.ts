/** CS 아키타입: cs-holiday-calendar.
 *  [끝판왕] CS 구성 #8 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 라이트 배경(--bg) + 대형 볼드 연도·시즌 헤드라인 + 다크(--brand) 배지 pill +
 *  다크(--brand) 배경 7열 달력 그리드(공휴일/순차출고/배송휴무 셀 색상 구분) +
 *  하단 라이트 배경 bullet 안내 리스트.
 *  공휴일 배송 마감 안내 캘린더형 CS 블록. */
import { z } from 'zod'
import { defineBlock } from '../types'

/** 달력 셀 하나의 상태 */
const dayStatusSchema = z.enum(['normal', 'holiday', 'sequential', 'span-start', 'span-mid', 'span-end'])

const calDaySchema = z.object({
  /** 날짜 숫자 (1~31, 0=빈 칸) */
  day: z.number().int().min(0).max(31),
  /** 셀 상태 — 색상 의미 결정 */
  status: dayStatusSchema.default('normal'),
  /** 셀 아래 표시할 짧은 라벨 (예: "배송 휴무", "순차 출고") */
  label: z.string().optional(),
})

const schema = z.object({
  /** 대형 헤드라인 (예: "2025 HOLIDAY!", em 허용) */
  title: z.string().min(1),
  /** 달력 위 pill 배지 텍스트 (예: "N월 연휴 배송 안내") */
  badgeLabel: z.string().min(1),
  /** 달력에 표시할 연월 (표시용, 예: "2025년 N월") */
  monthLabel: z.string().optional(),
  /**
   * 달력 셀 배열 — 주 첫 번째(일요일)부터 순서대로.
   * 빈 칸은 day:0, status:'normal' 으로 전달.
   * 최대 5주(35셀) 이내.
   */
  days: z.array(calDaySchema).min(1).max(35),
  /** 범례 항목 (선택, 최대 4개) */
  legend: z
    .array(
      z.object({
        status: dayStatusSchema,
        label: z.string().min(1),
      }),
    )
    .max(4)
    .optional(),
  /** 하단 bullet 안내 리스트 (em/br 허용, 최대 6개) */
  notes: z.array(z.string().min(1)).min(1).max(6),
})
type Data = z.infer<typeof schema>

/** 셀 상태 → 인라인 스타일 매핑 (하드코딩 허용: 커머스 신호색, 흰색, 중립회색) */
const STATUS_STYLE: Record<string, string> = {
  normal:       '',
  holiday:      'background:#F9A8C9;color:#1a1a1a;font-weight:700',   // 핑크 — 배송 휴무
  sequential:   'background:#fff;color:#1a1a1a;font-weight:700',       // 흰 — 순차 출고
  'span-start': 'background:#F5E642;color:#1a1a1a;font-weight:700;border-radius:50% 0 0 50%', // 노랑 범위 시작
  'span-mid':   'background:#F5E642;color:#1a1a1a;font-weight:700;border-radius:0',           // 노랑 범위 중간
  'span-end':   'background:#F5E642;color:#1a1a1a;font-weight:700;border-radius:0 50% 50% 0', // 노랑 범위 끝
}

const STATUS_LEGEND_DOT: Record<string, string> = {
  normal:       'background:rgba(255,255,255,.18)',
  holiday:      'background:#F9A8C9',
  sequential:   'background:#fff',
  'span-start': 'background:#F5E642',
  'span-mid':   'background:#F5E642',
  'span-end':   'background:#F5E642',
}

const DOW = ['일', '월', '화', '수', '목', '금', '토'] as const

export const csHolidayCalendar = defineBlock<Data>({
  id: 'cs-holiday-calendar',
  archetype: 'shipping',
  styleTags: ['light', 'cs', 'calendar', 'holiday', 'shipping', 'structured'],
  imageSlots: 0,
  describe:
    '공휴일 배송 마감 캘린더형 CS 블록. 라이트 배경 + 대형 연도/시즌 헤드라인 + 다크(brand) pill 배지 + 다크(brand) 배경 7열 달력(핑크=배송휴무/흰=순차출고/노랑=범위 배송휴무) + 하단 bullet 안내 리스트. 최대 5주(35셀) 달력 지원.',
  schema,
  css: `
/* cs-holiday-calendar — 접두사 chl- */

/* 라이트 배경 블록: --bg, 본문 --ink */
.chl{
  background:var(--bg);
  color:var(--ink);
  padding:56px 32px 60px;
  text-align:center;
}

/* 대형 헤드라인 */
.chl-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(36px,8vw,60px);
  line-height:1.12;
  letter-spacing:-.03em;
  color:var(--ink);
  margin-bottom:28px;
}
/* 라이트 배경 — .em은 --accent-d(어두운 포인트) */
.chl-title .em{color:var(--accent-d)}

/* pill 배지 */
.chl-badge{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  background:var(--brand);
  color:#fff;
  font-family:var(--font-body);
  font-weight:700;
  font-size:clamp(14px,3vw,18px);
  letter-spacing:.02em;
  padding:12px 32px;
  border-radius:999px;
  margin-bottom:36px;
}

/* 달력 컨테이너 */
.chl-cal{
  background:var(--brand);
  border-radius:calc(var(--r-scale,1)*12px);
  padding:32px 24px 36px;
  margin-bottom:36px;
  overflow:hidden;
}

/* 요일 헤더 행 */
.chl-dow{
  display:grid;
  grid-template-columns:repeat(7,1fr);
  margin-bottom:20px;
}
.chl-dow-cell{
  font-family:var(--font-display);
  font-weight:700;
  font-size:clamp(14px,2.8vw,18px);
  color:rgba(255,255,255,.85);
  text-align:center;
  padding:0 4px 8px;
  letter-spacing:.02em;
}

/* 날짜 그리드 */
.chl-grid{
  display:grid;
  grid-template-columns:repeat(7,1fr);
  gap:0 0;
  row-gap:8px;
}

/* 개별 날짜 셀 래퍼 (라벨 포함) */
.chl-day-wrap{
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:5px;
}

/* 날짜 숫자 원형 셀 */
.chl-day{
  width:clamp(36px,8vw,52px);
  height:clamp(36px,8vw,52px);
  display:flex;
  align-items:center;
  justify-content:center;
  border-radius:50%;
  font-family:var(--font-display);
  font-weight:600;
  font-size:clamp(15px,3.2vw,22px);
  color:rgba(255,255,255,.85);
  position:relative;
}
.chl-day.empty{visibility:hidden}

/* 셀 라벨 (배송 휴무 / 순차 출고 등) */
.chl-day-label{
  font-family:var(--font-body);
  font-size:clamp(9px,1.8vw,12px);
  color:rgba(255,255,255,.75);
  line-height:1.3;
  letter-spacing:-.01em;
  white-space:nowrap;
}

/* 범례 */
.chl-legend{
  display:flex;
  flex-wrap:wrap;
  gap:12px 20px;
  justify-content:center;
  margin-top:20px;
}
.chl-legend-item{
  display:flex;
  align-items:center;
  gap:6px;
  font-family:var(--font-body);
  font-size:13px;
  color:rgba(255,255,255,.7);
}
.chl-legend-dot{
  width:14px;
  height:14px;
  border-radius:50%;
  flex-shrink:0;
}

/* 하단 bullet 안내 리스트 */
.chl-notes{
  text-align:left;
  display:flex;
  flex-direction:column;
  gap:14px;
}
.chl-note{
  display:flex;
  align-items:flex-start;
  gap:10px;
  font-family:var(--font-body);
  font-size:clamp(13px,2.8vw,16px);
  color:var(--ink);
  line-height:1.7;
}
.chl-note-dot{
  flex-shrink:0;
  width:6px;
  height:6px;
  border-radius:50%;
  background:var(--ink);
  margin-top:calc(0.85em);
}
.chl-note .em{color:var(--accent-d);font-weight:700}
`,
  render: (d, { esc, richSafe }) => {
    // 요일 헤더
    const dowHtml = DOW.map(
      (dow) => `<span class="chl-dow-cell">${esc(dow)}</span>`,
    ).join('')

    // 날짜 셀
    const daysHtml = d.days
      .map((cell) => {
        if (cell.day === 0) {
          return `<div class="chl-day-wrap"><div class="chl-day empty">&nbsp;</div></div>`
        }
        const inlineStyle = STATUS_STYLE[cell.status] ?? ''
        const styleAttr = inlineStyle ? ` style="${inlineStyle}"` : ''
        const labelHtml = cell.label
          ? `<span class="chl-day-label">${esc(cell.label)}</span>`
          : ''
        return `
    <div class="chl-day-wrap">
      <div class="chl-day"${styleAttr}>${cell.day}</div>
      ${labelHtml}
    </div>`
      })
      .join('')

    // 범례
    const legendHtml =
      d.legend && d.legend.length > 0
        ? `<div class="chl-legend">
        ${d.legend
          .map(
            (lg) =>
              `<div class="chl-legend-item">
            <span class="chl-legend-dot" style="${STATUS_LEGEND_DOT[lg.status] ?? 'background:rgba(255,255,255,.4)'}"></span>
            <span>${esc(lg.label)}</span>
          </div>`,
          )
          .join('')}
      </div>`
        : ''

    // 하단 안내 bullet
    const notesHtml = d.notes
      .map(
        (n) => `
    <div class="chl-note">
      <span class="chl-note-dot"></span>
      <span>${richSafe(n)}</span>
    </div>`,
      )
      .join('')

    return `
<section class="chl">
  <h2 class="chl-title">${richSafe(d.title)}</h2>
  <div class="chl-badge">${esc(d.badgeLabel)}</div>
  <div class="chl-cal">
    <div class="chl-dow">${dowHtml}</div>
    <div class="chl-grid">${daysHtml}</div>
    ${legendHtml}
  </div>
  <div class="chl-notes">${notesHtml}</div>
</section>`
  },
})
