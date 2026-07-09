/** SHIPPING 아키타입: shipping-roundcard-cs
 *  피그마 351_배송교환반품_13 구조 흡수.
 *  대형 Paperlogy 타이틀 → 2×2 앰버 라운드 카드 그리드(아이콘+배지+설명)
 *  → 배송·교환반품 텍스트 블록 → 다크 고객센터 풀위드 배너.
 *  톤: light. 다크 배너 내 richSafe em 스코프 오버라이드 포함. */
import { z } from 'zod'
import { defineBlock } from '../types'

// ── 카드 4항목 스키마 ──────────────────────────────────────────
const cardSchema = z.object({
  badge: z.string().min(1),   // 라운드 배지 텍스트 (예: 배송방법)
  icon: z.enum([
    'truck','calendar','clock','box','shield','snow','thermometer',
    'check','bolt','phone','badge','bell','leaf','drop','sprout',
  ]),
  desc: z.string().min(1),    // 카드 본문 강조 (em 허용)
})

const schema = z.object({
  sectionTitle: z.string().min(1),       // 대형 타이틀 (em 허용)
  sectionSub: z.string().optional(),     // 타이틀 아래 한 줄

  cards: z.array(cardSchema).min(2).max(4), // 2~4항목 (2×2 또는 2+1)

  shippingTitle: z.string().optional(),  // 배송안내 헤딩
  shippingBody: z.string().optional(),   // 배송안내 본문 (개행 \n 허용)

  returnTitle: z.string().optional(),    // 교환반품 헤딩
  returnBody: z.string().optional(),     // 교환반품 본문 (개행 \n 허용)

  csPhone: z.string().optional(),        // 고객센터 전화번호
  csHours: z.string().optional(),        // 상담 가능 시간
  csOff: z.string().optional(),          // 휴무 안내
})
type Data = z.infer<typeof schema>

// ── 아이콘 SVG (inline, stroke=currentColor) ──────────────────
const CARD_ICONS: Record<string, string> = {
  truck:        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h11v9H3z"/><path d="M14 10h3.5l3 3v3H14z"/><circle cx="7" cy="18" r="1.7"/><circle cx="17.5" cy="18" r="1.7"/></svg>',
  calendar:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 9h16M8 3v4M16 3v4"/></svg>',
  clock:        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></svg>',
  box:          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/></svg>',
  shield:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6z"/><path d="M9 12l2 2 4-4"/></svg>',
  snow:         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 11a5 5 0 1 1 10 0a3 3 0 0 1 0 6H7a3 3 0 0 1 0-6z"/><path d="M9 17v3M12 17v3M15 17v3"/></svg>',
  thermometer:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 14.8V6a2 2 0 1 0-4 0v8.8a4 4 0 1 0 4 0z"/><path d="M12 9v5.6"/></svg>',
  check:        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>',
  bolt:         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L5 13.5h5.5L9 22l9-12h-6z"/></svg>',
  phone:        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 18h2"/></svg>',
  badge:        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="10" r="6"/><path d="M9 15l-2 6 5-3 5 3-2-6"/><path d="M9.5 10l1.7 1.7L15 8.5"/></svg>',
  bell:         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 16.5h12l-1.6-2.2V10a4.4 4.4 0 0 0-8.8 0v4.3z"/><path d="M10.2 19.2a2 2 0 0 0 3.6 0"/></svg>',
  leaf:         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19c0-8 6-14 15-14 0 9-6 15-15 14z"/><path d="M5 19C9 13 13 11 17 9"/></svg>',
  drop:         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c-4 4-6 7-6 10a6 6 0 0 0 12 0c0-3-2-6-6-10z"/></svg>',
  sprout:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21v-7.5"/><path d="M12 13.5C12 10.5 9.8 8.3 6.8 8.3c0 3 2.2 5.2 5.2 5.2z"/><path d="M12 13.5c0-3 2.2-5.2 5.2-5.2 0 3-2.2 5.2-5.2 5.2z"/></svg>',
}

export const shippingRoundcardCs = defineBlock<Data>({
  id: 'shipping-roundcard-cs',
  archetype: 'shipping',
  styleTags: ['light', 'warm', 'food', 'grid'],
  imageSlots: 0,
  describe:
    '배송안내 전용. Paperlogy 대형 타이틀 + 2×2 앰버 라운드 카드 그리드(아이콘+배지+강조문구) + 배송·교환반품 텍스트 블록 + 다크 브라운 고객센터 풀위드 배너. 식품·신선식품 상세페이지에 최적.',
  schema,
  css: `
/* ── siqv: shipping-roundcard-cs ────────────────────────────── */
.siqv{background:var(--bg);color:var(--ink);padding:0 0 0}

/* 타이틀 영역 */
.siqv-hd{text-align:center;padding:56px var(--pad-x,56px) 40px}
.siqv-title{font-family:var(--font-display),'Paperlogy','Black Han Sans',sans-serif;font-weight:800;font-size:72px;line-height:1.1;letter-spacing:-.02em;color:var(--accent-d)}
.siqv-title .em{color:var(--accent)}
.siqv-sub{margin-top:14px;font-size:18px;font-weight:500;color:var(--ink-2)}

/* 카드 그리드 */
.siqv-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;padding:0 var(--pad-x,56px) 40px}
.siqv-card{background:var(--paper);border-radius:calc(var(--r-scale,1)*28px);padding:32px 28px 30px;display:flex;flex-direction:column;align-items:center;gap:0;position:relative}
/* 배지 */
.siqv-pill{display:inline-block;background:var(--brand);color:#f5eddc;font-size:15px;font-weight:700;padding:6px 20px;border-radius:999px;letter-spacing:.02em;margin-bottom:20px}
/* 아이콘 */
.siqv-icon{width:60px;height:60px;color:var(--brand);margin-bottom:16px}
.siqv-icon svg{width:100%;height:100%}
/* 카드 설명 */
.siqv-cdesc{font-size:18px;font-weight:700;color:var(--brand);text-align:center;line-height:1.5}
.siqv-cdesc .em{color:var(--accent-d)}

/* 텍스트 블록(배송안내 / 교환반품) */
.siqv-info{padding:0 var(--pad-x,56px) 36px}
.siqv-info-block{margin-bottom:28px}
.siqv-info-block:last-child{margin-bottom:0}
.siqv-info-h{font-size:20px;font-weight:700;color:var(--ink);margin-bottom:10px}
.siqv-info-body{font-size:15px;line-height:1.85;color:var(--ink-2);white-space:pre-line}

/* 구분선 */
.siqv-rule{margin:0 var(--pad-x,56px) 32px;border:none;border-top:1px solid var(--line)}

/* 고객센터 다크 배너 */
.siqv-cs{background:var(--brand);padding:36px var(--pad-x,56px);display:flex;align-items:center;gap:32px}
.siqv .siqv-cs .em{color:var(--em-dark,#FFF7EA)}
.siqv-cs-icon{flex:0 0 72px;width:72px;height:72px;color:#f5eddc;display:flex;flex-direction:column;align-items:center;gap:6px}
.siqv-cs-icon svg{width:44px;height:44px}
.siqv-cs-icon-label{font-size:13px;font-weight:700;color:#f5eddc;letter-spacing:.02em}
.siqv-cs-body{flex:1;min-width:0}
.siqv-cs-phone{font-size:44px;font-weight:800;color:#f5eddc;letter-spacing:-.01em;line-height:1.1}
.siqv-cs-meta{margin-top:10px;display:flex;flex-direction:column;gap:6px}
.siqv-cs-row{display:flex;align-items:center;gap:10px}
.siqv-cs-badge{display:inline-block;background:#f5eddc;color:var(--brand);font-size:13px;font-weight:700;padding:3px 12px;border-radius:999px;flex-shrink:0}
.siqv-cs-text{font-size:15px;font-weight:500;color:#f5eddc}
`,
  render: (d, { esc, richSafe }) => {
    const cardHtml = d.cards.map((c) => {
      const svgStr = CARD_ICONS[c.icon] ?? CARD_ICONS.check
      return `
    <div class="siqv-card">
      <span class="siqv-pill">${esc(c.badge)}</span>
      <div class="siqv-icon">${svgStr}</div>
      <p class="siqv-cdesc">${richSafe(c.desc)}</p>
    </div>`
    }).join('')

    const infoHtml = (d.shippingTitle || d.shippingBody || d.returnTitle || d.returnBody)
      ? `
  <section class="siqv-info" aria-label="배송 및 교환반품 안내">
    ${d.shippingTitle || d.shippingBody ? `
    <div class="siqv-info-block">
      ${d.shippingTitle ? `<p class="siqv-info-h">${esc(d.shippingTitle)}</p>` : ''}
      ${d.shippingBody ? `<p class="siqv-info-body">${esc(d.shippingBody)}</p>` : ''}
    </div>` : ''}
    ${d.returnTitle || d.returnBody ? `
    <div class="siqv-info-block">
      ${d.returnTitle ? `<p class="siqv-info-h">${esc(d.returnTitle)}</p>` : ''}
      ${d.returnBody ? `<p class="siqv-info-body">${esc(d.returnBody)}</p>` : ''}
    </div>` : ''}
  </section>
  <hr class="siqv-rule">` : ''

    const csHtml = (d.csPhone || d.csHours || d.csOff)
      ? `
  <div class="siqv-cs" role="complementary" aria-label="고객센터">
    <div class="siqv-cs-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 18h2"/></svg>
      <span class="siqv-cs-icon-label">고객센터</span>
    </div>
    <div class="siqv-cs-body">
      ${d.csPhone ? `<p class="siqv-cs-phone">${esc(d.csPhone)}</p>` : ''}
      <div class="siqv-cs-meta">
        ${d.csHours ? `
        <div class="siqv-cs-row">
          <span class="siqv-cs-badge">상담시간</span>
          <span class="siqv-cs-text">${esc(d.csHours)}</span>
        </div>` : ''}
        ${d.csOff ? `
        <div class="siqv-cs-row">
          <span class="siqv-cs-badge">휴무안내</span>
          <span class="siqv-cs-text">${esc(d.csOff)}</span>
        </div>` : ''}
      </div>
    </div>
  </div>` : ''

    return `
<section class="siqv" aria-label="배송안내">
  <header class="siqv-hd">
    <h2 class="siqv-title">${richSafe(d.sectionTitle)}</h2>
    ${d.sectionSub ? `<p class="siqv-sub">${esc(d.sectionSub)}</p>` : ''}
  </header>
  <div class="siqv-grid" role="list">
    ${cardHtml}
  </div>
  ${infoHtml}
  ${csHtml}
</section>`
  },
})
