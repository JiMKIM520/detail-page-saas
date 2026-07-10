/** CS 아키타입: cs-green-label-table
 *  초록 레이블 강조 2열 정보 테이블 + 주의사항 텍스트 박스 + 전폭 그린 CTA 배너 + 상담전화 행.
 *  배송·교환·반품 안내 섹션 전용. 라이트 톤.
 *
 *  원본 흡수: 170_FAQ_문의_구성_페이지_6.json
 *  장치: #0d7b45 레이블 Bold 좌열 + 본문 Regular 우열 — 4행 이내 정보 테이블
 *        라운드 주의사항 박스 (회색 텍스트)
 *        전폭 그린 배너 (흰 Bold 카피)
 *        상담전화 행 (그린 레이블 + 번호·운영시간 텍스트)
 */
import { z } from 'zod'
import { defineBlock } from '../types'

const rowSchema = z.object({
  label: z.string().min(1),  // 항목명 (초록 Bold — 예: "배송지역")
  value: z.string().min(1),  // 내용 텍스트 (br 허용 — 예: "전국 어디나 배송 가능합니다")
})

const schema = z.object({
  sectionTitle: z.string().min(1),             // 섹션 헤딩 (예: "배송 및 교환·반품 안내")
  rows: z.array(rowSchema).min(2).max(6),      // 정보 테이블 행 (2~6행)
  noticeTitle: z.string().optional(),          // 주의사항 박스 소제목 (예: "주의사항")
  noticeBody: z.string().min(1),               // 주의사항 본문 (br 허용)
  bannerText: z.string().min(1),               // 전폭 그린 배너 문구 (예: "고객 만족을 위해 최선을 다하겠습니다")
  phoneLabel: z.string().optional(),           // 상담전화 레이블 (기본: "상담 전화")
  phoneNumber: z.string().optional(),          // 전화번호 (예: "1234-5678")
  phoneHours: z.string().optional(),           // 운영시간 (예: "평일 (월-금) 9시~18시 / 주말·공휴일 제외")
})

type Data = z.infer<typeof schema>

export const csGreenLabelTable = defineBlock<Data>({
  id: 'cs-green-label-table',
  archetype: 'cs',
  styleTags: ['light', 'commerce', 'shipping'],
  imageSlots: 0,
  describe:
    '배송·교환·반품 CS 섹션. 초록(accent) Bold 레이블 좌열 + 본문 우열의 2열 정보 테이블(2~6행) + 라운드 주의사항 텍스트 박스 + 하단 전폭 그린 CTA 배너 + 상담전화 행. 라이트 배경, 선명한 그린 강조.',
  schema,
  css: `
/* ── cs-green-label-table (prefix: cyzx) ── */
.cyzx{background:var(--bg,#fff);padding:60px var(--pad-x,56px) 0;font-family:var(--font-body,'Pretendard',sans-serif)}

/* 섹션 헤딩 */
.cyzx-heading{font-size:28px;font-weight:700;color:var(--ink,#1f1f1f);margin-bottom:28px;letter-spacing:-.02em;line-height:1.3}

/* 정보 테이블 */
.cyzx-table{width:100%;border-top:1.5px solid var(--line,#e0e0e0)}
.cyzx-row{display:grid;grid-template-columns:110px 1fr;gap:0;border-bottom:1px solid var(--line,#e0e0e0);padding:14px 0;align-items:baseline}
.cyzx-label{font-size:18px;font-weight:700;color:var(--accent,#0d7b45);line-height:1.55;padding-right:16px;flex-shrink:0}
.cyzx-value{font-size:18px;font-weight:400;color:var(--ink,#1f1f1f);line-height:1.6}

/* 주의사항 박스 */
.cyzx-notice{margin-top:28px;background:var(--paper,#f5f5f5);border-radius:calc(var(--r-scale,1)*12px);padding:24px 28px}
.cyzx-notice-title{font-size:16px;font-weight:700;color:var(--ink-2,#555);margin-bottom:10px;letter-spacing:.01em}
.cyzx-notice-body{font-size:16px;font-weight:400;color:var(--muted,#868686);line-height:1.75}

/* 전폭 그린 CTA 배너 */
.cyzx-banner{margin:36px calc(-1 * var(--pad-x,56px)) 0;background:var(--accent,#0d7b45);padding:22px var(--pad-x,56px);text-align:center}
.cyzx-banner-text{font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-.01em;line-height:1.4}

/* 상담전화 행 */
.cyzx-phone{display:flex;align-items:flex-start;gap:20px;padding:24px 0;border-top:none}
.cyzx-phone-label{font-size:20px;font-weight:700;color:var(--accent,#0d7b45);white-space:nowrap;padding-top:2px;flex-shrink:0}
.cyzx-phone-info{font-size:20px;font-weight:400;color:var(--ink,#1f1f1f);line-height:1.6}
.cyzx-phone-number{font-weight:700;color:var(--ink,#1f1f1f)}
`,
  render: (d, { esc, richSafe }) => {
    // 정보 테이블 행
    const tableRows = d.rows
      .map(
        (r) => `
    <div class="cyzx-row">
      <span class="cyzx-label">${esc(r.label)}</span>
      <span class="cyzx-value">${richSafe(r.value)}</span>
    </div>`,
      )
      .join('')

    // 주의사항 소제목
    const noticeTitleBlock = d.noticeTitle
      ? `<div class="cyzx-notice-title">${esc(d.noticeTitle)}</div>`
      : ''

    // 상담전화 행
    const phoneBlock =
      d.phoneNumber || d.phoneHours
        ? `
  <div class="cyzx-phone">
    <span class="cyzx-phone-label">${esc(d.phoneLabel ?? '상담 전화')}</span>
    <div class="cyzx-phone-info">
      ${d.phoneNumber ? `<div class="cyzx-phone-number">${esc(d.phoneNumber)}</div>` : ''}
      ${d.phoneHours ? `<div>${esc(d.phoneHours)}</div>` : ''}
    </div>
  </div>`
        : ''

    return `
<section class="cyzx">
  <h2 class="cyzx-heading">${esc(d.sectionTitle)}</h2>
  <div class="cyzx-table">${tableRows}
  </div>
  <div class="cyzx-notice">
    ${noticeTitleBlock}
    <div class="cyzx-notice-body">${richSafe(d.noticeBody)}</div>
  </div>
  <div class="cyzx-banner">
    <p class="cyzx-banner-text">${esc(d.bannerText)}</p>
  </div>
  ${phoneBlock}
</section>`
  },
})
