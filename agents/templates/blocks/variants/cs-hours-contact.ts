/** CS 아키타입: cs-hours-contact.
 *  [끝판왕] CS 구성 #1 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 밝은(--paper) 배경 모노크롬.
 *    상단 로고 슬롯(플레이스홀더 텍스트) → 헤어라인
 *    → 2컬럼 시간표(좌: 제목+설명 / 수직 rule / 우: 요일-시간 rows + bullet 공지)
 *    → 헤어라인
 *    → 하단 아이콘 연락처(pin/phone) rows.
 *  병원·영업·서비스업 CS 섹션 전용. */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  /** 상단 로고 슬롯 — 이미지 URL 또는 undefined(없으면 브랜드명 텍스트로 폴백) */
  logo: z.string().optional(),
  /** 로고 이미지 alt / 폴백 브랜드명 */
  brand: z.string().min(1),

  /** 시간표 섹션 제목 (예: "진료일정", "영업시간") */
  hoursTitle: z.string().min(1),
  /** 시간표 좌측 설명 본문 (em, br 허용) */
  hoursDesc: z.string().min(1),

  /** 요일-시간 rows (2~6개) */
  hoursItems: z
    .array(
      z.object({
        /** 요일 라벨 (예: "월/화/수/목", "금 요 일") */
        day: z.string().min(1),
        /** 시간 문자열 (예: "AM 09:00 - PM 07:30") */
        time: z.string().min(1),
      }),
    )
    .min(1)
    .max(6),

  /** 시간표 우측 하단 공지 bullet 목록 (선택, 1~3개) */
  notices: z
    .array(z.string().min(1))
    .min(0)
    .max(3)
    .optional(),

  /** 연락처 rows (pin·phone 등, 1~3개) */
  contacts: z
    .array(
      z.object({
        /** 'pin' | 'phone' — shared ICONS에 있는 것만 */
        icon: z.enum(['pin', 'phone']),
        /** 표시 텍스트 (주소, 전화번호 등) */
        text: z.string().min(1),
      }),
    )
    .min(1)
    .max(3),
})
type Data = z.infer<typeof schema>

export const csHoursContact = defineBlock<Data>({
  id: 'cs-hours-contact',
  archetype: 'shipping' as any,
  styleTags: ['light', 'monochrome', 'minimal', 'cs', 'hours', 'contact', 'template'],
  imageSlots: 1,
  describe:
    'CS 운영시간+연락처. 밝은(--paper) 배경 모노크롬. 상단 로고 슬롯 → 헤어라인 → 2컬럼 시간표(좌:제목+설명 / 수직룰 / 우:요일-시간rows+bullet공지) → 헤어라인 → 하단 pin/phone 연락처 rows. 병원·영업·서비스업 CS 전용.',
  schema,
  css: `
/* cs-hours-contact — 접두사 chc- */

/* 라이트 배경 블록: --paper/--bg, 본문 --ink, 보조 --muted, accent → --accent-d */
.chc{
  background:var(--paper);
  color:var(--ink);
  padding:0;
  overflow:hidden;
}

/* ── 상단 로고 영역 ── */
.chc-logo-zone{
  padding:40px 40px 32px;
  text-align:center;
}
.chc-logo{
  max-width:160px;
  max-height:56px;
  object-fit:contain;
  display:inline-block;
}
.chc-brand-text{
  font-family:var(--font-body);
  font-size:15px;
  color:var(--muted);
  letter-spacing:.01em;
}

/* ── 구분 헤어라인 ── */
.chc-rule{
  border:none;
  border-top:1px solid var(--line);
  margin:0 40px;
}
.chc-rule-full{
  border:none;
  border-top:1px solid var(--line);
  margin:0;
}

/* ── 2컬럼 시간표 영역 ── */
.chc-hours-wrap{
  display:flex;
  align-items:flex-start;
  padding:36px 40px 32px;
  gap:0;
}

/* 좌: 제목+설명 */
.chc-left{
  flex:0 0 auto;
  width:180px;
  padding-right:24px;
}
.chc-hours-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(20px,3.6vw,26px);
  line-height:1.25;
  letter-spacing:-.02em;
  color:var(--ink);
  margin-bottom:14px;
}
.chc-hours-desc{
  font-family:var(--font-body);
  font-size:13px;
  line-height:1.85;
  color:var(--muted);
  letter-spacing:-.005em;
}
.chc-hours-desc .em{
  color:var(--accent-d);
  font-weight:700;
}

/* 수직 rule */
.chc-vline{
  flex:0 0 1px;
  align-self:stretch;
  background:var(--line);
  margin:0 28px 0 0;
}

/* 우: 요일-시간 rows + 공지 */
.chc-right{
  flex:1 1 0;
  min-width:0;
}
.chc-row{
  display:flex;
  align-items:baseline;
  gap:20px;
  padding:9px 0;
  border-bottom:1px solid var(--line);
}
.chc-row:first-child{
  border-top:none;
}
.chc-row:last-child{
  border-bottom:none;
}
.chc-day{
  font-family:var(--font-body);
  font-weight:700;
  font-size:14px;
  color:var(--ink);
  white-space:nowrap;
  min-width:80px;
  letter-spacing:.04em;
}
.chc-time{
  font-family:var(--font-body);
  font-size:14px;
  color:var(--ink);
  letter-spacing:.02em;
}

/* bullet 공지 목록 */
.chc-notices{
  margin-top:14px;
  padding:0;
  list-style:none;
}
.chc-notice-item{
  display:flex;
  align-items:flex-start;
  gap:6px;
  font-family:var(--font-body);
  font-size:13px;
  line-height:1.7;
  color:var(--muted);
  margin-bottom:2px;
}
.chc-notice-item::before{
  content:'•';
  flex-shrink:0;
  color:var(--muted);
  margin-top:1px;
}

/* ── 하단 연락처 rows ── */
.chc-contacts{
  padding:28px 40px 36px;
  display:flex;
  flex-direction:column;
  gap:16px;
}
.chc-contact-row{
  display:flex;
  align-items:center;
  gap:18px;
}
.chc-contact-icon{
  flex-shrink:0;
  width:28px;
  height:28px;
  color:var(--ink);
  display:flex;
  align-items:center;
  justify-content:center;
}
.chc-contact-icon svg{
  width:26px;
  height:26px;
  stroke:var(--ink);
}
.chc-contact-text{
  font-family:var(--font-body);
  font-weight:700;
  font-size:clamp(15px,2.8vw,18px);
  color:var(--ink);
  letter-spacing:-.01em;
  line-height:1.4;
}
`,
  render: (d, { esc, richSafe, icon }) => {
    /* 로고 슬롯 */
    const logoHtml = d.logo
      ? `<img class="chc-logo" src="${esc(d.logo)}" alt="${esc(d.brand)}">`
      : `<span class="chc-brand-text">${esc(d.brand)}</span>`

    /* 요일-시간 rows */
    const rowsHtml = d.hoursItems
      .map(
        (r) => `
    <div class="chc-row">
      <span class="chc-day">${esc(r.day)}</span>
      <span class="chc-time">${esc(r.time)}</span>
    </div>`,
      )
      .join('')

    /* bullet 공지 */
    const noticesHtml =
      d.notices && d.notices.length > 0
        ? `<ul class="chc-notices">${d.notices.map((n) => `<li class="chc-notice-item">${esc(n)}</li>`).join('')}</ul>`
        : ''

    /* 연락처 rows */
    const contactsHtml = d.contacts
      .map(
        (c) => `
    <div class="chc-contact-row">
      <span class="chc-contact-icon">${icon(c.icon)}</span>
      <span class="chc-contact-text">${esc(c.text)}</span>
    </div>`,
      )
      .join('')

    return `
<section class="chc">
  <div class="chc-logo-zone">
    ${logoHtml}
  </div>
  <hr class="chc-rule-full">
  <div class="chc-hours-wrap">
    <div class="chc-left">
      <h2 class="chc-hours-title">${esc(d.hoursTitle)}</h2>
      <p class="chc-hours-desc">${richSafe(d.hoursDesc)}</p>
    </div>
    <div class="chc-vline"></div>
    <div class="chc-right">
      ${rowsHtml}
      ${noticesHtml}
    </div>
  </div>
  <hr class="chc-rule-full">
  <div class="chc-contacts">
    ${contactsHtml}
  </div>
</section>`
  },
})
