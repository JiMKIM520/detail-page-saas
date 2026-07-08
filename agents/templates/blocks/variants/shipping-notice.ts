/** SHIPPING 아키타입(템플릿 충실 재현): shipping-notice.
 *  와디즈 200섹션 16_배송 섹션_04 패턴 재구성.
 *  타원형 NOTICE 라벨 → 수직선 → 대형 배송 안내 제목 → DELIVERY INFORMATION 소문자 부제 →
 *  흰 카드(체크마크 행 리스트) → CUSTOMER CENTER 타원 라벨 → 대형 전화번호 →
 *  다크 상담시간 카드 → Q&A + 카카오채널 행.
 *  기존 shipping-info(좌측 액센트보더 행 리스트)와 레이아웃/무드 완전 차별화. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { ICON_NAMES } from '../shared'

const checkRowSchema = z.object({
  text: z.string().min(1),       // 행 본문 (em/br 허용)
  accent: z.boolean().optional(), // true면 행 전체를 accent색으로 강조
  sub: z.string().min(1).optional(), // 강조행 아래 소각주 (예: * 제주 및 도서산간은 별도 문의)
})

const schema = z.object({
  noticeLabel: z.string().min(1).optional(),      // 기본 "NOTICE"
  title: z.string().min(1).optional(),            // 기본 "배송 안내"
  subtitle: z.string().min(1).optional(),         // 기본 "DELIVERY INFORMATION"
  rows: z.array(checkRowSchema).min(1).max(6),    // 체크마크 정보 행

  // 고객센터 섹션 (선택)
  customerLabel: z.string().min(1).optional(),    // 기본 "CUSTOMER CENTER"
  phone: z.string().min(1).optional(),            // 전화번호 (예: "000 · 0000 · 0000")
  hours: z.array(z.string().min(1)).max(4).optional(), // 상담 시간 행들
  hoursNote: z.string().min(1).optional(),        // 상담시간 아래 주의 (예: 주말 및 공휴일 휴무)
  contactIcon: z.enum(ICON_NAMES).optional(),     // 고객센터 카드 왼쪽 아이콘 (기본 phone)
  qaTitle: z.string().min(1).optional(),          // Q&A 행 제목 (예: "전화 연결이 어려우신가요?")
  qaDesc: z.string().min(1).optional(),           // Q&A 행 설명
  channelLabel: z.string().min(1).optional(),     // 채널 배지 텍스트 (예: "Ch")
  channelDesc: z.string().min(1).optional(),      // 채널 설명 (em/br 허용)
})
type Data = z.infer<typeof schema>

export const shippingNotice = defineBlock<Data>({
  id: 'shipping-notice',
  archetype: 'shipping',
  styleTags: ['premium', 'template', 'structured', 'cobalt'],
  imageSlots: 0,
  describe:
    '배송 안내 노티스형. 타원 NOTICE 라벨 + 수직선 + 대형 제목(배송 안내) + 소문자 영문 부제 + 흰 카드 체크마크 행 리스트. 선택적으로 CUSTOMER CENTER 섹션(대형 전화번호 + 다크 상담시간 카드 + Q&A행 + 카카오채널 행) 추가 가능. 기존 shipping-info(좌측보더 행)와 다른 타원라벨+카드 구조.',
  schema,
  css: `
/* ── shipping-notice: sn prefix ── */
.sn{background:var(--bg);padding:0 0 8px}

/* ─ 배송 안내 섹션 ─ */
.sn-top{padding:54px 64px 60px;display:flex;flex-direction:column;align-items:center}
.sn-oval{display:inline-flex;align-items:center;justify-content:center;border:1.5px solid var(--ink);border-radius:999px;padding:8px 28px;font-size:12px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:var(--ink)}
.sn-vline{width:1px;height:42px;background:var(--ink);margin:18px 0}
.sn-title{font-family:var(--font-display);font-weight:800;font-size:52px;color:var(--ink);letter-spacing:-.02em;line-height:1.1;text-align:center}
.sn-sub{margin-top:10px;font-size:11px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);text-align:center}
.sn-card{margin-top:32px;width:100%;background:var(--paper);border-radius:calc(var(--r-scale,1)*14px);padding:38px 44px;display:flex;flex-direction:column;gap:26px;box-shadow:0 2px 16px rgba(0,0,0,.06)}
.sn-row{display:flex;align-items:flex-start;gap:14px;font-size:16px;color:var(--ink);line-height:1.65}
.sn-check{flex-shrink:0;width:22px;height:22px;border-radius:50%;background:var(--ink);display:flex;align-items:center;justify-content:center;margin-top:2px}
.sn-check svg{width:12px;height:12px;color:#fff}
.sn-row.ac .sn-check{background:var(--accent)}
.sn-row.ac .sn-rtxt{color:var(--accent);font-weight:700}
.sn-rtxt{flex:1}
.sn-rtxt .em{color:var(--accent);font-weight:700}
.sn-rsub{font-size:12px;color:var(--muted);margin-top:4px;display:block}

/* ─ 고객센터 섹션 ─ */
.sn-bot{padding:52px 64px 60px;display:flex;flex-direction:column;align-items:center;border-top:1px solid var(--line)}
.sn-phone{font-family:var(--font-display);font-weight:800;font-size:44px;color:var(--ink);letter-spacing:-.02em;text-align:center;margin-top:18px}
.sn-hours{margin-top:24px;width:100%;background:var(--brand);border-radius:calc(var(--r-scale,1)*12px);padding:28px 36px;display:flex;align-items:center;gap:28px}
.sn-hicon{flex-shrink:0;width:44px;height:44px;color:rgba(255,255,255,.7)}
.sn-hicon svg{width:100%;height:100%}
.sn-hlist{flex:1;display:flex;flex-direction:column;gap:6px}
.sn-hrow{font-size:14px;color:rgba(255,255,255,.85);line-height:1.5}
.sn-hnote{font-size:13px;color:rgba(255,255,255,.5);margin-top:4px}
.sn-qa{margin-top:24px;width:100%;display:flex;gap:20px;align-items:flex-start;padding:20px 0;border-bottom:1px solid var(--line)}
.sn-qat{font-size:15px;font-weight:700;color:var(--ink);flex:0 0 auto;min-width:140px;line-height:1.5}
.sn-qad{font-size:14px;color:var(--ink-2);line-height:1.65;flex:1}
.sn-ch{margin-top:20px;width:100%;display:flex;gap:20px;align-items:flex-start;padding-bottom:8px}
.sn-chbadge{flex-shrink:0;width:46px;height:46px;border-radius:50%;background:#F7E300;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:800;color:#2A2A2A;letter-spacing:-.01em}
.sn-chdesc{flex:1;font-size:14px;color:var(--ink-2);line-height:1.7}
.sn-chdesc .em{color:var(--accent);font-weight:700}
`,
  render: (d, { esc, richSafe, icon }) => {
    const noticeLabel = d.noticeLabel ?? 'NOTICE'
    const title = d.title ?? '배송 안내'
    const subtitle = d.subtitle ?? 'DELIVERY INFORMATION'

    const rowsHtml = d.rows.map((r) => `
    <div class="sn-row${r.accent ? ' ac' : ''}">
      <span class="sn-check">${icon('check')}</span>
      <span class="sn-rtxt">
        ${richSafe(r.text)}
        ${r.sub ? `<span class="sn-rsub">${esc(r.sub)}</span>` : ''}
      </span>
    </div>`).join('')

    const hasCustomer = !!(d.phone || d.hours?.length || d.qaTitle || d.channelDesc)

    const hoursHtml = d.hours?.length
      ? `<div class="sn-hours">
          <span class="sn-hicon">${icon(d.contactIcon ?? 'phone')}</span>
          <div class="sn-hlist">
            ${d.hours.map((h) => `<span class="sn-hrow">${esc(h)}</span>`).join('')}
            ${d.hoursNote ? `<span class="sn-hnote">${esc(d.hoursNote)}</span>` : ''}
          </div>
        </div>`
      : ''

    const qaHtml = (d.qaTitle && d.qaDesc)
      ? `<div class="sn-qa">
          <span class="sn-qat">${richSafe(d.qaTitle)}</span>
          <span class="sn-qad">${esc(d.qaDesc)}</span>
        </div>`
      : ''

    const chHtml = d.channelDesc
      ? `<div class="sn-ch">
          <span class="sn-chbadge">${esc(d.channelLabel ?? 'Ch')}</span>
          <span class="sn-chdesc">${richSafe(d.channelDesc)}</span>
        </div>`
      : ''

    const customerHtml = hasCustomer
      ? `<div class="sn-bot">
          <span class="sn-oval">${esc(d.customerLabel ?? 'CUSTOMER CENTER')}</span>
          ${d.phone ? `<p class="sn-phone">${esc(d.phone)}</p>` : ''}
          ${hoursHtml}
          ${qaHtml}
          ${chHtml}
        </div>`
      : ''

    return `
<section class="sn">
  <div class="sn-top">
    <span class="sn-oval">${esc(noticeLabel)}</span>
    <div class="sn-vline"></div>
    <h2 class="sn-title">${esc(title)}</h2>
    <p class="sn-sub">${esc(subtitle)}</p>
    <div class="sn-card">
      ${rowsHtml}
    </div>
  </div>
  ${customerHtml}
</section>`
  },
})
