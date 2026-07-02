/** CS 아키타입: cs-closure-calendar.
 *  [끝판왕] CS 구성 #21 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 웜베이지(--paper/--bg) 배경 + 로고 eyebrow + 대형 굵은 제목(휴진/임시휴업 안내) +
 *  날짜 목록 → 요일 헤더(SUN-SAT) + 미니 캘린더 그리드(강조일 빨간 원 + 라벨) → 하단 안내문.
 *  저자 정보 없는 순수 공지·휴무 안내 블록.
 */
import { z } from 'zod'
import { defineBlock } from '../types'

/** 캘린더 한 주(7칸). 빈 셀은 빈 문자열 "". */
const weekSchema = z.object({
  /** 일~토 날짜 숫자 문자열 또는 "" (예: ["21","22","23","24","25","26","27"]) */
  days: z.array(z.string()).length(7),
})

/** 강조(휴무) 날짜 항목 */
const closureDaySchema = z.object({
  /** "25" 처럼 날짜 숫자만 (캘린더 셀 매칭용) */
  day: z.string().min(1),
  /** 셀 아래 표시 라벨 (예: "성탄절 휴진") */
  label: z.string().min(1),
})

const schema = z.object({
  /** 로고 eyebrow 영역 텍스트 (예: "해당 자리에 로고 넣기"). 선택. */
  eyebrow: z.string().optional(),

  /** 메인 제목 (예: "휴진안내", "임시휴업 안내"). em/br 허용. */
  title: z.string().min(1),

  /** 휴무 날짜 목록 텍스트 행 (예: ["2025. 12. 25", "2025. 01. 01"]). 1~6개. */
  datelines: z.array(z.string().min(1)).min(1).max(6),

  /** 캘린더 표시 월 레이블 (선택). 예: "2025년 12월" */
  monthLabel: z.string().optional(),

  /** 캘린더 주 배열. 빈 셀은 "". 1~6주. */
  weeks: z.array(weekSchema).min(1).max(6),

  /** 강조 표시할 날짜 + 라벨 (빨간 원). 0~6개. */
  closureDays: z.array(closureDaySchema).max(6),

  /** 하단 안내 문구 (선택. em/br 허용). 예: "휴진 일정을 참고하여 내원 및 예약 시 불편함 없으시길 바랍니다" */
  footerNote: z.string().optional(),
})

type Data = z.infer<typeof schema>

export const csClosureCalendar = defineBlock<Data>({
  id: 'cs-closure-calendar',
  archetype: 'shipping',
  styleTags: ['light', 'warm', 'cs', 'notice', 'calendar', 'minimal'],
  imageSlots: 0,
  describe:
    '휴진·임시휴업 안내형 CS 블록. 웜베이지 배경 + 로고 eyebrow(선택) + 대형 굵은 제목 + 날짜 목록 + 미니 캘린더 그리드(요일헤더+강조일 빨간 원+라벨) + 하단 안내문. 병원·쇼핑몰 휴무 공지에 적합.',
  schema,
  css: `
/* cs-closure-calendar — 접두사 clc- */

/* 라이트 배경: --paper/--bg, 본문 --ink, 보조 --muted, 강조 --accent-d */
.clc{
  background:var(--bg);
  color:var(--ink);
  padding:52px 40px 56px;
}

/* eyebrow: 로고 자리 힌트 텍스트 */
.clc-eyebrow{
  font-family:var(--font-body);
  font-size:12px;
  color:var(--muted);
  letter-spacing:.04em;
  margin-bottom:20px;
}

/* 메인 제목 */
.clc-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(40px,9vw,64px);
  line-height:1.1;
  letter-spacing:-.03em;
  color:var(--ink);
  margin-bottom:24px;
}
.clc-title .em{color:var(--accent-d)}

/* 날짜 목록 */
.clc-datelist{
  display:flex;
  flex-direction:column;
  gap:4px;
  margin-bottom:40px;
}
.clc-date{
  font-family:var(--font-body);
  font-size:clamp(17px,3.8vw,24px);
  font-weight:400;
  color:var(--ink);
  line-height:1.5;
  letter-spacing:.01em;
}

/* 캘린더 구분선 */
.clc-divider{
  border:none;
  border-top:1px solid var(--line);
  margin:0 0 24px;
}

/* 월 레이블 (선택) */
.clc-month{
  font-family:var(--font-body);
  font-size:13px;
  font-weight:600;
  color:var(--muted);
  letter-spacing:.04em;
  margin-bottom:14px;
}

/* 캘린더 그리드 (7열) */
.clc-grid{
  display:grid;
  grid-template-columns:repeat(7,1fr);
  gap:0;
}

/* 요일 헤더 셀 */
.clc-dow{
  font-family:var(--font-body);
  font-size:12px;
  font-weight:600;
  color:var(--muted);
  text-align:center;
  padding:0 0 10px;
  letter-spacing:.04em;
}

/* 날짜 셀 래퍼 */
.clc-cell{
  display:flex;
  flex-direction:column;
  align-items:center;
  padding:6px 0 10px;
  position:relative;
  min-height:52px;
}

/* 날짜 숫자 기본 */
.clc-num{
  font-family:var(--font-body);
  font-size:clamp(14px,3vw,18px);
  font-weight:400;
  color:var(--ink);
  line-height:1;
  position:relative;
  z-index:1;
}

/* 강조(휴무) 날짜 — 빨간 원 배경 */
.clc-cell.closure .clc-num{
  color:#fff;
  font-weight:700;
}
.clc-cell.closure::before{
  content:'';
  position:absolute;
  top:4px;
  left:50%;
  transform:translateX(-50%);
  width:34px;
  height:34px;
  border-radius:50%;
  background:#c0392b;
  z-index:0;
}

/* 강조일 라벨 (원 아래 소형 텍스트) */
.clc-clabel{
  font-family:var(--font-body);
  font-size:10px;
  font-weight:600;
  color:#c0392b;
  text-align:center;
  line-height:1.3;
  margin-top:4px;
  letter-spacing:-.01em;
  word-break:keep-all;
}

/* 빈 셀 */
.clc-cell.empty .clc-num{
  visibility:hidden;
}

/* 하단 안내문 */
.clc-footer{
  margin-top:28px;
  font-family:var(--font-body);
  font-size:13px;
  color:var(--muted);
  line-height:1.7;
  text-align:center;
}
.clc-footer .em{color:var(--accent-d);font-weight:700}
`,
  render: (d, { esc, richSafe }) => {
    const DOWS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

    // 강조일 day → label 맵
    const closureMap = new Map<string, string>()
    for (const c of d.closureDays) {
      closureMap.set(c.day.trim(), c.label)
    }

    // 요일 헤더 행
    const headerHtml = DOWS.map(
      (dow) => `<span class="clc-dow">${esc(dow)}</span>`,
    ).join('')

    // 캘린더 주 행들
    const weeksHtml = d.weeks
      .map((week) =>
        week.days
          .map((dayStr) => {
            const trimmed = dayStr.trim()
            const isEmpty = trimmed === ''
            const isClosure = !isEmpty && closureMap.has(trimmed)
            const label = isClosure ? closureMap.get(trimmed)! : ''
            const cls = ['clc-cell', isEmpty ? 'empty' : '', isClosure ? 'closure' : '']
              .filter(Boolean)
              .join(' ')
            return `<div class="${esc(cls)}">
  <span class="clc-num">${esc(trimmed || '0')}</span>
  ${isClosure ? `<span class="clc-clabel">${esc(label)}</span>` : ''}
</div>`
          })
          .join(''),
      )
      .join('')

    return `
<section class="clc">
  ${d.eyebrow ? `<p class="clc-eyebrow">${esc(d.eyebrow)}</p>` : ''}
  <h2 class="clc-title">${richSafe(d.title)}</h2>
  <div class="clc-datelist">
    ${d.datelines.map((dl) => `<p class="clc-date">${esc(dl)}</p>`).join('')}
  </div>
  <hr class="clc-divider">
  ${d.monthLabel ? `<p class="clc-month">${esc(d.monthLabel)}</p>` : ''}
  <div class="clc-grid">
    ${headerHtml}
    ${weeksHtml}
  </div>
  ${d.footerNote ? `<p class="clc-footer">${richSafe(d.footerNote)}</p>` : ''}
</section>`
  },
})
