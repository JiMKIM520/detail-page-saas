/** CS 아키타입: cs-notice-typo-split.
 *  099_CS_구성_페이지_10 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 크림(--paper) 전체 배경 + 좌측 대형 에디토리얼 타이포(fs96급 배송공지 워드마크) +
 *  우측 콤팩트 7열 달력 그리드(요일헤더 border-bottom + 연휴범위 그라디언트 바 + 강조일 다크 원) +
 *  하단 풀너비 다크(--brand) 패널(출고일정 안내문 + 문의 라인).
 *  이미지 없음. 순수 타이포·레이아웃 블록. */
import { z } from 'zod'
import { defineBlock } from '../types'

/** 달력 이벤트 범위(그라디언트 바 하이라이트) */
const rangeSchema = z.object({
  /** 시작 열 인덱스 0~6 (0=SUN) */
  colStart: z.number().int().min(0).max(6),
  /** 끝 열 인덱스 0~6 */
  colEnd: z.number().int().min(0).max(6),
  /** 범위 위에 표시할 라벨 (예: "추석연휴", "대체휴일") */
  label: z.string().min(1),
  /** 행 인덱스 (0=1주차) */
  row: z.number().int().min(0).max(4),
})

/** 달력 강조일(다크 원 마커) */
const markerSchema = z.object({
  /** 날짜 숫자 (1~31) */
  day: z.number().int().min(1).max(31),
  /** 라벨 (예: "개천절") */
  label: z.string().optional(),
})

const schema = z.object({
  /** 대형 에디토리얼 워드마크 — 2줄 허용, 예: "Delivery\nNotice". em/br 허용. */
  headline: z.string().min(1),
  /** 캘린더 위 서브 타이틀 (예: "2025년 9월\n추석연휴 배송공지"). em/br 허용. */
  calTitle: z.string().min(1),
  /** 캘린더 표시 월 (7열 × N행). 빈 칸은 day:0. */
  weeks: z
    .array(
      z.array(
        z.object({
          /** 날짜 숫자 (0=빈 칸) */
          day: z.number().int().min(0).max(31),
          /** 빨간(sunday) 색상 강조 여부 */
          red: z.boolean().optional(),
        }),
      ).length(7),
    )
    .min(1)
    .max(5),
  /** 그라디언트 바 범위 이벤트 (optional, 최대 4개) */
  ranges: z.array(rangeSchema).max(4).optional(),
  /** 강조 마커일 (다크 원, optional, 최대 3개) */
  markers: z.array(markerSchema).max(3).optional(),
  /** 하단 다크 패널 출고 안내 본문 (em/br 허용) */
  noticeBody: z.string().min(1),
  /** 하단 문의 안내 라인 (순수 텍스트, optional) */
  contactLine: z.string().optional(),
})
type Data = z.infer<typeof schema>

const DOW = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const

export const csNoticeTypoSplit = defineBlock<Data>({
  id: 'cs-notice-typo-split',
  archetype: 'cs',
  styleTags: ['light', 'warm', 'editorial', 'cs', 'calendar', 'delivery'],
  imageSlots: 0,
  describe:
    '배송공지 에디토리얼 분할 CS 블록. 크림 배경 + 좌측 fs96 대형 타이포 워드마크 + 우측 7열 달력(연휴범위 그라디언트 바 + 다크 원 마커) + 하단 풀너비 다크 패널(출고일정 안내문 + 문의 라인). 이미지 없음.',
  schema,
  css: `
/* cs-notice-typo-split — 접두사 cvnq- */

/* 크림 배경 블록 */
.cvnq{
  background:var(--paper);
  color:var(--ink);
  padding:0;
  overflow:hidden;
}

/* 상단 좌우 분할 영역 */
.cvnq-body{
  display:flex;
  align-items:flex-start;
  gap:0;
  padding:56px var(--pad-x,56px) 40px;
}

/* 좌: 대형 에디토리얼 타이포 */
.cvnq-left{
  flex:0 0 42%;
  padding-right:32px;
}
.cvnq-headline{
  font-family:var(--font-display);
  font-weight:500;
  font-size:clamp(60px,9.6vw,96px);
  line-height:1.04;
  letter-spacing:-.03em;
  color:var(--ink);
  white-space:pre-line;
  word-break:keep-all;
}
.cvnq-headline .em{color:var(--accent-d)}

/* 우: 캘린더 영역 */
.cvnq-right{
  flex:1;
  min-width:0;
}
.cvnq-cal-title{
  font-family:var(--font-body);
  font-weight:400;
  font-size:clamp(16px,2.6vw,25px);
  line-height:1.45;
  color:var(--ink);
  margin-bottom:24px;
  white-space:pre-line;
}
.cvnq-cal-title .em{color:var(--accent-d);font-weight:700}

/* 달력 래퍼 */
.cvnq-cal{
  position:relative;
  width:100%;
}

/* 요일 헤더 */
.cvnq-dow-row{
  display:grid;
  grid-template-columns:repeat(7,1fr);
  border-bottom:1.5px solid var(--ink);
  padding-bottom:10px;
  margin-bottom:0;
}
.cvnq-dow{
  font-family:var(--font-body);
  font-weight:400;
  font-size:clamp(12px,2vw,22px);
  color:var(--ink);
  text-align:center;
  letter-spacing:.01em;
}
.cvnq-dow.sun{ color:#e05a5a }

/* 달력 날짜 그리드 (주 단위로 position:relative 행) */
.cvnq-week{
  display:grid;
  grid-template-columns:repeat(7,1fr);
  position:relative;
  min-height:56px;
}

/* 범위 그라디언트 바 오버레이 — position absolute, z-index 0 */
.cvnq-range-bar{
  position:absolute;
  top:50%;
  transform:translateY(-50%);
  height:42px;
  border-radius:999px;
  /* 그라디언트 방향: 브랜드(진한 갈색) → 밝은 크림 */
  background:linear-gradient(90deg,var(--brand) 0%,color-mix(in srgb,var(--brand) 60%,var(--paper)) 100%);
  z-index:0;
  display:flex;
  align-items:center;
  justify-content:center;
  pointer-events:none;
}
.cvnq-range-label{
  font-family:var(--font-body);
  font-weight:700;
  font-size:clamp(11px,1.8vw,18px);
  color:#fff;
  letter-spacing:.01em;
  white-space:nowrap;
  position:relative;
  z-index:1;
}

/* 날짜 셀 */
.cvnq-cell{
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  position:relative;
  z-index:1;
  min-height:56px;
}
.cvnq-num{
  font-family:var(--font-body);
  font-weight:400;
  font-size:clamp(14px,2.4vw,20px);
  color:var(--ink);
  line-height:1;
  display:flex;
  align-items:center;
  justify-content:center;
  width:clamp(30px,5.5vw,42px);
  height:clamp(30px,5.5vw,42px);
  border-radius:50%;
  position:relative;
  z-index:2;
}
.cvnq-num.red{ color:#e05a5a }
.cvnq-num.empty{ visibility:hidden }

/* 강조 마커 — 다크 원 배경 */
.cvnq-num.marker{
  background:var(--brand);
  color:#fff;
  font-weight:700;
}

/* 마커 라벨 (원 위 작은 텍스트) */
.cvnq-mlabel{
  font-family:var(--font-body);
  font-size:clamp(9px,1.5vw,13px);
  font-weight:600;
  color:var(--ink);
  line-height:1.2;
  text-align:center;
  white-space:nowrap;
  margin-bottom:2px;
  position:relative;
  z-index:2;
}

/* 범위 바가 있는 주에서 날짜가 바 위에 오도록 */
.cvnq-week .cvnq-cell{ background:transparent }

/* 하단 다크 패널 */
.cvnq-notice{
  background:var(--brand);
  color:#fff;
  padding:36px var(--pad-x,56px) 40px;
}
.cvnq-notice-body{
  font-family:var(--font-body);
  font-weight:500;
  font-size:clamp(15px,2.4vw,24px);
  line-height:1.65;
  color:#fff;
  margin-bottom:0;
}
/* 다크 배경 .em 오버라이드 */
.cvnq .cvnq-notice .em{color:var(--em-dark,#FFF7EA)}
.cvnq-contact{
  margin-top:20px;
  font-family:var(--font-body);
  font-weight:500;
  font-size:clamp(13px,2vw,18px);
  color:rgba(255,255,255,.7);
  line-height:1.5;
}
`,
  render: (d, { esc, richSafe }) => {
    // 마커일 set — day → label
    const markerMap = new Map<number, string | undefined>()
    if (d.markers) {
      for (const m of d.markers) markerMap.set(m.day, m.label)
    }

    // 달력 주 행 렌더
    const weeksHtml = d.weeks
      .map((week, rowIdx) => {
        // 이 행에 걸치는 범위 바들
        const barsForRow = (d.ranges ?? []).filter((r) => r.row === rowIdx)

        // 각 열의 너비를 백분율로 계산 (100% / 7 단위)
        const colW = 100 / 7

        const barsHtml = barsForRow
          .map((rng) => {
            const startPct = rng.colStart * colW
            const endPct = (rng.colEnd + 1) * colW
            const widthPct = endPct - startPct
            // 바 안쪽 약간 여백
            const leftPct = startPct + colW * 0.1
            const wPct = widthPct - colW * 0.2
            return `<div class="cvnq-range-bar" style="left:${leftPct.toFixed(2)}%;width:${wPct.toFixed(2)}%" aria-hidden="true"><span class="cvnq-range-label">${esc(rng.label)}</span></div>`
          })
          .join('')

        const cellsHtml = week
          .map((cell) => {
            const isEmpty = cell.day === 0
            const isMarker = !isEmpty && markerMap.has(cell.day)
            const markerLabel = isMarker ? markerMap.get(cell.day) : undefined

            const numCls = [
              'cvnq-num',
              isEmpty ? 'empty' : '',
              cell.red && !isMarker ? 'red' : '',
              isMarker ? 'marker' : '',
            ]
              .filter(Boolean)
              .join(' ')

            return `<div class="cvnq-cell">
              ${markerLabel ? `<span class="cvnq-mlabel">${esc(markerLabel)}</span>` : ''}
              <span class="${numCls}">${isEmpty ? '0' : cell.day}</span>
            </div>`
          })
          .join('')

        return `<div class="cvnq-week">${barsHtml}${cellsHtml}</div>`
      })
      .join('')

    // 요일 헤더
    const dowHtml = DOW.map(
      (w, i) => `<span class="cvnq-dow${i === 0 ? ' sun' : ''}">${w}</span>`,
    ).join('')

    return `
<section class="cvnq">
  <div class="cvnq-body">
    <div class="cvnq-left">
      <h2 class="cvnq-headline">${richSafe(d.headline)}</h2>
    </div>
    <div class="cvnq-right">
      <p class="cvnq-cal-title">${richSafe(d.calTitle)}</p>
      <div class="cvnq-cal">
        <div class="cvnq-dow-row">${dowHtml}</div>
        ${weeksHtml}
      </div>
    </div>
  </div>
  <div class="cvnq-notice">
    <p class="cvnq-notice-body">${richSafe(d.noticeBody)}</p>
    ${d.contactLine ? `<p class="cvnq-contact">${esc(d.contactLine)}</p>` : ''}
  </div>
</section>`
  },
})
