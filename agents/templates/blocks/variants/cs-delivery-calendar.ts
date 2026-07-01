/** CS 아키타입: cs-delivery-calendar.
 *  [끝판왕] CS 구성 #9 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 밝은 웜그레이(--paper/--bg) 배경 + accent 대형 디스플레이 타이틀
 *  + 7열 캘린더 그리드(SUN-SAT 헤더 + border-bottom)
 *  + 날짜 셀: 기본 숫자 / 출고마감(다크 원형 테두리+라벨) / 연휴범위(danger 필 그룹+라벨)
 *  / 순차배송(다크 원형 테두리+라벨) / 휴일휴무(danger 원형 테두리+라벨).
 *  이미지 없음. 순수 레이아웃·데이터 블록. */
import { z } from 'zod'
import { defineBlock } from '../types'

/** 날짜 셀 상태 */
const DayKind = z.enum(['normal', 'cutoff', 'holiday-range', 'sequential', 'closed'])

const schema = z.object({
  /** 대형 타이틀 (영문 디스플레이 허용, em 허용) */
  title: z.string().min(1),
  /** 캘린더 시작 요일 오프셋 (0=SUN, 1=MON ... 6=SAT). 첫 날짜를 맞추기 위한 빈 셀 수. */
  startDayOffset: z.number().int().min(0).max(6),
  /** 날짜 행 묶음 — 캘린더 주(week) 단위로 그룹. 각 행은 최대 7 셀. */
  weeks: z
    .array(
      z.array(
        z.object({
          /** 날짜 숫자 (플레이스홀더). 빈 셀이면 0 또는 미제공. */
          day: z.number().int().min(0).max(31).optional(),
          /** 셀 상태 */
          kind: DayKind.default('normal'),
          /** 이 날짜 아래에 표시할 라벨 (배송마감, 추석연휴 등). 선택. */
          label: z.string().optional(),
          /** holiday-range에서 범위의 첫 날 여부 (pill 왼쪽 라운드) */
          rangeStart: z.boolean().optional(),
          /** holiday-range에서 범위의 마지막 날 여부 (pill 오른쪽 라운드) */
          rangeEnd: z.boolean().optional(),
        }),
      ).min(1).max(7),
    )
    .min(1)
    .max(6),
  /** 범례 항목 (선택 — 없으면 렌더 안 됨) */
  legend: z
    .array(
      z.object({
        /** 범례 아이콘 종류 (circle-dark | circle-danger | pill-danger) */
        iconKind: z.enum(['circle-dark', 'circle-danger', 'pill-danger']),
        /** 범례 설명 텍스트 */
        text: z.string().min(1),
      }),
    )
    .max(4)
    .optional(),
})
type Data = z.infer<typeof schema>

export const csDeliveryCalendar = defineBlock<Data>({
  id: 'cs-delivery-calendar',
  archetype: 'cs' as any,
  styleTags: ['light', 'warm', 'calendar', 'delivery', 'cs', 'minimal'],
  imageSlots: 0,
  describe:
    '배송 출고 일정 캘린더 CS 블록. 밝은 웜그레이 배경 + accent 대형 타이틀 + 7열(SUN-SAT) 캘린더 그리드. 날짜 셀 상태: 일반/출고마감(다크 원)/연휴범위(danger 필 pill)/순차배송(다크 원)/휴일휴무(danger 원). 이미지 없음.',
  schema,
  css: `
/* cs-delivery-calendar — 접두사 cdc- */

/* 라이트 배경 블록: --paper/--bg, 본문 --ink, 보조 --muted, eyebrow/강조 --accent-d */
.cdc{
  background:var(--paper);
  color:var(--ink);
  padding:56px 32px 60px;
  text-align:center;
}

/* 대형 타이틀 */
.cdc-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(32px,7vw,52px);
  line-height:1.14;
  letter-spacing:-.02em;
  color:var(--accent);
  margin-bottom:40px;
}
.cdc-title .em{color:var(--accent-d)}

/* 캘린더 래퍼 */
.cdc-cal{
  width:100%;
  max-width:520px;
  margin:0 auto;
}

/* 요일 헤더 행 */
.cdc-head{
  display:grid;
  grid-template-columns:repeat(7,1fr);
  border-bottom:1.5px solid var(--ink);
  padding-bottom:10px;
  margin-bottom:18px;
}
.cdc-dow{
  font-family:var(--font-body);
  font-weight:600;
  font-size:clamp(11px,2.4vw,14px);
  color:var(--muted);
  letter-spacing:.04em;
  text-align:center;
}

/* 날짜 행 */
.cdc-week{
  display:grid;
  grid-template-columns:repeat(7,1fr);
  margin-bottom:6px;
  position:relative;
}

/* 공통 날짜 셀 */
.cdc-cell{
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:4px;
  padding:4px 0 6px;
  position:relative;
}

/* 날짜 숫자 래퍼 (원형/필 배경 역할) */
.cdc-num{
  display:flex;
  align-items:center;
  justify-content:center;
  width:clamp(32px,6.5vw,42px);
  height:clamp(32px,6.5vw,42px);
  font-family:var(--font-body);
  font-weight:500;
  font-size:clamp(15px,3.2vw,20px);
  color:var(--ink);
  border-radius:50%;
  position:relative;
  z-index:1;
}

/* 빈 셀 */
.cdc-cell--empty .cdc-num{visibility:hidden}

/* 출고마감 — 다크 원형 테두리 */
.cdc-cell--cutoff .cdc-num{
  border:2px solid var(--ink);
  font-weight:700;
}

/* 순차배송 — 다크 원형 테두리 */
.cdc-cell--sequential .cdc-num{
  border:2px solid var(--ink);
  font-weight:700;
}

/* 휴일휴무 — danger 원형 테두리 + danger 텍스트 */
.cdc-cell--closed .cdc-num{
  border:2px solid #e05a5a;
  color:#e05a5a;
  font-weight:700;
}

/* 연휴범위 — danger 텍스트 */
.cdc-cell--holiday-range .cdc-num{
  color:#e05a5a;
  font-weight:700;
}

/* 연휴 pill 배경 (danger 테두리 범위 그룹) — 형제 선택자로 처리, 인라인 style override */
.cdc-pill-bg{
  position:absolute;
  top:4px;
  bottom:6px;
  left:0;right:0;
  border:2px solid #e05a5a;
  border-radius:0;
  pointer-events:none;
  z-index:0;
}
.cdc-pill-bg--start{
  left:20%;
  border-right:none;
  border-radius:999px 0 0 999px;
}
.cdc-pill-bg--end{
  right:20%;
  border-left:none;
  border-radius:0 999px 999px 0;
}
.cdc-pill-bg--start.cdc-pill-bg--end{
  left:10%;right:10%;
  border-radius:999px;
}
.cdc-pill-bg--mid{
  border-left:none;
  border-right:none;
}

/* 날짜 하단 라벨 */
.cdc-label{
  font-family:var(--font-body);
  font-size:clamp(9px,1.8vw,11px);
  line-height:1.3;
  color:var(--muted);
  letter-spacing:-.01em;
  white-space:nowrap;
}
.cdc-cell--cutoff .cdc-label,
.cdc-cell--sequential .cdc-label{
  color:var(--ink);
}
.cdc-cell--closed .cdc-label,
.cdc-cell--holiday-range .cdc-label{
  color:#e05a5a;
}

/* 범례 */
.cdc-legend{
  display:flex;
  flex-wrap:wrap;
  justify-content:center;
  gap:10px 20px;
  margin-top:28px;
}
.cdc-legend-item{
  display:flex;
  align-items:center;
  gap:6px;
  font-family:var(--font-body);
  font-size:12px;
  color:var(--muted);
}
.cdc-legend-icon{
  width:18px;height:18px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  flex-shrink:0;
}
.cdc-legend-icon--circle-dark{
  border:2px solid var(--ink);
  border-radius:50%;
}
.cdc-legend-icon--circle-danger{
  border:2px solid #e05a5a;
  border-radius:50%;
}
.cdc-legend-icon--pill-danger{
  border:2px solid #e05a5a;
  border-radius:999px;
  width:28px;
}
`,
  render: (d, { esc, richSafe }) => {
    const DOW = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

    const headHtml = DOW.map((w) => `<span class="cdc-dow">${w}</span>`).join('')

    const weeksHtml = d.weeks
      .map((week) => {
        const cells = week
          .map((cell) => {
            const isEmpty = !cell.day
            const kind = isEmpty ? 'empty' : cell.kind

            // pill background for holiday-range
            let pillBg = ''
            if (kind === 'holiday-range') {
              const cls = [
                'cdc-pill-bg',
                cell.rangeStart && cell.rangeEnd
                  ? 'cdc-pill-bg--start cdc-pill-bg--end'
                  : cell.rangeStart
                    ? 'cdc-pill-bg--start'
                    : cell.rangeEnd
                      ? 'cdc-pill-bg--end'
                      : 'cdc-pill-bg--mid',
              ]
                .filter(Boolean)
                .join(' ')
              pillBg = `<span class="${cls}" aria-hidden="true"></span>`
            }

            const numHtml = `<span class="cdc-num">${isEmpty ? '' : cell.day}</span>`
            const labelHtml =
              cell.label && !isEmpty
                ? `<span class="cdc-label">${esc(cell.label)}</span>`
                : ''

            return `<div class="cdc-cell cdc-cell--${kind}">${pillBg}${numHtml}${labelHtml}</div>`
          })
          .join('')
        return `<div class="cdc-week">${cells}</div>`
      })
      .join('')

    const legendHtml =
      d.legend && d.legend.length > 0
        ? `<div class="cdc-legend">${d.legend
            .map(
              (l) =>
                `<span class="cdc-legend-item"><span class="cdc-legend-icon cdc-legend-icon--${l.iconKind}" aria-hidden="true"></span><span>${esc(l.text)}</span></span>`,
            )
            .join('')}</div>`
        : ''

    return `
<section class="cdc">
  <h2 class="cdc-title">${richSafe(d.title)}</h2>
  <div class="cdc-cal">
    <div class="cdc-head">${headHtml}</div>
    ${weeksHtml}
  </div>
  ${legendHtml}
</section>`
  },
})
