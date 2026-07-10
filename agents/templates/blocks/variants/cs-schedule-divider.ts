/** CS 아키타입: cs-schedule-divider
 *  상단 로고 영역 + 수직 구분선으로 요일/시간 2열 분리한 진료일정 표 + 하단 위치·전화 아이콘 행.
 *  흰 배경 라이트 톤. 병원·의원·클리닉 CS 섹션 전용.
 */
import { z } from 'zod'
import { defineBlock } from '../types'

const rowSchema = z.object({
  day: z.string().min(1),   // 요일 레이블 (예: "월/화/수/목")
  time: z.string().min(1),  // 운영 시간 (예: "AM 09:00 - PM 07:30")
})

const schema = z.object({
  logoText: z.string().optional(),                    // 로고 대체 텍스트 (이미지 없을 때 노출)
  sectionTitle: z.string().min(1),                    // 섹션 헤딩 (예: "진료일정")
  tagline: z.string().optional(),                     // 요일열 하단 홍보 문구 (br 허용)
  rows: z.array(rowSchema).min(1).max(8),             // 진료 요일·시간 행
  notices: z.array(z.string().min(1)).max(4).optional(), // 추가 안내 (예: 점심시간, 공휴일 등)
  address: z.string().optional(),                     // 주소
  phone: z.string().optional(),                       // 전화번호
})

type Data = z.infer<typeof schema>

export const csScheduleDivider = defineBlock<Data>({
  id: 'cs-schedule-divider',
  archetype: 'cs',
  styleTags: ['light', 'minimal', 'clinic'],
  imageSlots: 0,
  describe:
    '병원·의원 고객센터 섹션. 상단 로고/상호 영역 + 수직 구분선으로 요일-시간 2열 분리한 진료일정 표 + 하단 주소·전화번호 아이콘 행. 흰 배경, 라이트 톤.',
  schema,
  css: `
/* ── cs-schedule-divider (prefix: cogw) ── */
.cogw{background:var(--bg,#fff);padding:60px var(--pad-x,56px) 56px;font-family:var(--font-body,'Pretendard',sans-serif)}

/* 로고 영역 */
.cogw-logo{margin-bottom:44px;font-size:22px;font-weight:600;color:var(--ink);letter-spacing:-.01em;line-height:1}

/* 섹션 구분선 */
.cogw-rule{border:none;border-top:1.5px solid var(--ink);margin:0}

/* 진료일정 헤딩 */
.cogw-heading{font-size:34px;font-weight:700;color:var(--ink);margin:18px 0 16px;letter-spacing:-.02em}

/* 2열 표 래퍼 */
.cogw-table{display:grid;grid-template-columns:1fr 2px 1.6fr;gap:0;width:100%}

/* 수직 구분선 */
.cogw-vdiv{background:var(--line,#565454);width:2px;margin:0 24px}

/* 요일 열 */
.cogw-days{padding:0 0 0 4px}
.cogw-day-row{display:flex;align-items:center;min-height:44px}
.cogw-day{font-size:20px;font-weight:700;color:var(--ink);line-height:1.3}

/* 시간 열 */
.cogw-times{padding:0 0 0 24px}
.cogw-time-row{display:flex;align-items:center;min-height:44px}
.cogw-time{font-size:20px;font-weight:400;color:var(--ink);line-height:1.3}

/* 태그라인 (요일열 하단) */
.cogw-tagline{margin-top:14px;font-size:15px;color:var(--ink-2,#555);line-height:1.7}

/* 안내 문구 */
.cogw-notices{margin-top:10px;padding-top:10px}
.cogw-notice{font-size:15px;color:var(--muted,#888);line-height:1.6}

/* 하단 구분선 */
.cogw-foot-rule{border:none;border-top:1.5px solid var(--line,#d0d0d0);margin:24px 0 0}

/* 하단 정보 행 */
.cogw-info{display:flex;flex-wrap:wrap;gap:6px 32px;margin-top:18px;align-items:flex-start}
.cogw-info-item{display:flex;align-items:center;gap:10px;font-size:19px;font-weight:700;color:var(--ink)}
.cogw-icon{width:22px;height:22px;flex-shrink:0;color:var(--ink)}
`,
  render: (d, { esc, richSafe, icon }) => {
    const logoBlock = d.logoText
      ? `<div class="cogw-logo">${esc(d.logoText)}</div>`
      : `<div class="cogw-logo" aria-hidden="true" style="height:32px"></div>`

    const dayRows = d.rows
      .map((r) => `<div class="cogw-day-row"><span class="cogw-day">${esc(r.day)}</span></div>`)
      .join('')

    const timeRows = d.rows
      .map((r) => `<div class="cogw-time-row"><span class="cogw-time">${esc(r.time)}</span></div>`)
      .join('')

    const taglineBlock = d.tagline
      ? `<div class="cogw-tagline">${richSafe(d.tagline)}</div>`
      : ''

    const noticesBlock =
      d.notices && d.notices.length > 0
        ? `<div class="cogw-notices">${d.notices.map((n) => `<div class="cogw-notice">${esc(n)}</div>`).join('')}</div>`
        : ''

    const infoItems: string[] = []
    if (d.address) {
      infoItems.push(
        `<div class="cogw-info-item"><span class="cogw-icon">${icon('pin')}</span><span>${esc(d.address)}</span></div>`,
      )
    }
    if (d.phone) {
      infoItems.push(
        `<div class="cogw-info-item"><span class="cogw-icon">${icon('phone')}</span><span>${esc(d.phone)}</span></div>`,
      )
    }
    const footBlock =
      infoItems.length > 0
        ? `<hr class="cogw-foot-rule"><div class="cogw-info">${infoItems.join('')}</div>`
        : ''

    return `
<section class="cogw">
  ${logoBlock}
  <hr class="cogw-rule">
  <h2 class="cogw-heading">${esc(d.sectionTitle)}</h2>
  <div class="cogw-table">
    <div class="cogw-days">
      ${dayRows}
      ${taglineBlock}
      ${noticesBlock}
    </div>
    <div class="cogw-vdiv" aria-hidden="true"></div>
    <div class="cogw-times">
      ${timeRows}
    </div>
  </div>
  ${footBlock}
</section>`
  },
})
