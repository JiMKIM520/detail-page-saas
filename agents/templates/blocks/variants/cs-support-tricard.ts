/** CS 아키타입: cs-support-tricard
 *  고객센터 헤더 + 전화/운영시간 박스 → 배송안내 3열 카드(배송사·마감·기간) + 텍스트 박스
 *  → 교환반품 텍스트 박스. 피그마 182_배송교환반품_04 구조 흡수 재구성.
 */
import { z } from 'zod'
import { defineBlock } from '../types'

const cardSchema = z.object({
  badge: z.string().min(1),          // 녹색 필 배지 라벨 (예: "배송사")
  icon: z.enum(['truck','calendar','clock','box','bolt','shield','check','gift','phone','star']),
  value: z.string().min(1),          // 핵심 수치·값 (em 허용)
  sub: z.string().optional(),         // 보조 한 줄
})

const schema = z.object({
  // ── 고객센터 ──────────────────────────────────────────────
  csTitle: z.string().min(1),         // 대제목 (예: "고객센터")
  csSub: z.string().optional(),       // 소제목 (예: "작은 목소리 하나에도 귀 기울이겠습니다.")
  phone: z.string().min(1),           // 전화번호
  hoursLine1: z.string().min(1),      // 운영시간 1행
  hoursLine2: z.string().optional(),  // 운영시간 2행 (점심시간 등)

  // ── 배송안내 ──────────────────────────────────────────────
  shippingTitle: z.string().min(1),   // 섹션 제목 (예: "배송안내")
  cards: z.array(cardSchema).min(2).max(4), // 배송사·마감·기간 카드 (2~4개)
  shippingNotes: z.string().min(1),   // 배송 상세 안내 텍스트 (em 허용)

  // ── 교환·반품 ─────────────────────────────────────────────
  returnTitle: z.string().min(1),     // 섹션 제목 (예: "교환 & 반품안내")
  returnNotes: z.string().min(1),     // 교환·반품 안내 텍스트 (em 허용)
})
type Data = z.infer<typeof schema>

// ── 아이콘 인라인 SVG (허용 35종 중 배송 CS에 적합한 아이콘 직접 임베드) ──
const CARD_ICONS: Record<string, string> = {
  truck:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h11v9H3z"/><path d="M14 10h3.5l3 3v3H14z"/><circle cx="7" cy="18" r="1.7"/><circle cx="17.5" cy="18" r="1.7"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 9h16M8 3v4M16 3v4"/></svg>',
  clock:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></svg>',
  box:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/></svg>',
  bolt:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L5 13.5h5.5L9 22l9-12h-6z"/></svg>',
  shield:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6z"/><path d="M9 12l2 2 4-4"/></svg>',
  check:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>',
  gift:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="11" width="15" height="9" rx="1"/><path d="M3.5 8.5h17v2.5h-17z"/><path d="M12 8.5V20"/><path d="M12 8.5C10.5 8.5 8 8 8 6.3 8 5.2 9 4.7 9.8 5.2c1 .6 2.2 2.2 2.2 3.3zM12 8.5c1.5 0 4-.5 4-2.2 0-1.1-1-1.6-1.8-1.1-1 .6-2.2 2.2-2.2 3.3z"/></svg>',
  phone:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 18h2"/></svg>',
  star:     '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l2.4 9.6L24 12l-9.6 2.4L12 24l-2.4-9.6L0 12l9.6-2.4z"/></svg>',
}

export const csSupportTricard = defineBlock<Data>({
  id: 'cs-support-tricard',
  archetype: 'cs',
  styleTags: ['light', 'clean', 'utility'],
  imageSlots: 0,
  describe: '고객센터(전화+운영시간 흰 박스) + 배송안내 3열 카드(배지+아이콘+정보) + 배송·교환반품 텍스트 박스. 녹색 계열 필 배지로 섹션 아이덴티티 통일.',
  schema,
  css: `
.cmfl{background:var(--bg);padding:0 0 56px}

/* ── 고객센터 헤더 ── */
.cmfl-cs{padding:56px var(--pad-x,56px) 0;text-align:center}
.cmfl-cs-title{font-family:var(--font-display);font-weight:800;font-size:64px;line-height:1.1;color:var(--ink);letter-spacing:-.02em}
.cmfl-cs-sub{margin-top:10px;font-size:18px;color:var(--ink-2);line-height:1.5}
.cmfl-phone-box{margin:22px auto 0;background:var(--paper);border-radius:calc(var(--r-scale,1)*16px);padding:28px 36px;max-width:640px;box-shadow:0 2px 16px -4px rgba(0,0,0,.08)}
.cmfl-phone-num{font-family:var(--font-display);font-weight:800;font-size:44px;color:var(--ink);letter-spacing:.01em}
.cmfl-hours{margin-top:10px;font-size:16px;color:var(--muted);line-height:1.75}

/* ── 섹션 공통 ── */
.cmfl-sec{padding:44px var(--pad-x,56px) 0}
.cmfl-sec-title{font-family:var(--font-display);font-weight:800;font-size:46px;color:var(--ink);letter-spacing:-.02em;margin-bottom:22px;text-align:center}

/* ── 배송 3열 카드 ── */
.cmfl-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:16px}
.cmfl-card{background:var(--paper);border-radius:calc(var(--r-scale,1)*20px);padding:22px 16px 26px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:0}
.cmfl-badge{display:inline-block;background:var(--accent);color:#fff;font-size:14px;font-weight:700;padding:4px 18px;border-radius:999px;letter-spacing:.04em;margin-bottom:16px}
.cmfl-icon-ring{width:72px;height:72px;border-radius:50%;background:var(--paper);border:2px solid var(--line);display:flex;align-items:center;justify-content:center;color:var(--ink);margin-bottom:14px;flex-shrink:0}
.cmfl-icon-ring svg{width:34px;height:34px}
.cmfl-card-val{font-family:var(--font-display);font-weight:700;font-size:24px;color:var(--ink);line-height:1.3;white-space:pre-line}
.cmfl-card-val .em{color:var(--accent-d)}
.cmfl-card-sub{margin-top:4px;font-size:13px;color:var(--muted)}

/* ── 텍스트 박스 (배송안내 / 교환반품 공용) ── */
.cmfl-notes{background:var(--paper);border-radius:calc(var(--r-scale,1)*16px);padding:26px 28px;font-size:16px;line-height:1.9;color:var(--ink-2);white-space:pre-line}
.cmfl-notes .em{color:var(--accent-d);font-weight:700}
`,
  render: (d, { esc, richSafe }) => {
    const cardHtml = d.cards.map(c => {
      const iconSvg = CARD_ICONS[c.icon] ?? CARD_ICONS.truck
      return `
    <div class="cmfl-card">
      <span class="cmfl-badge">${esc(c.badge)}</span>
      <div class="cmfl-icon-ring">${iconSvg}</div>
      <p class="cmfl-card-val">${richSafe(c.value)}</p>
      ${c.sub ? `<p class="cmfl-card-sub">${esc(c.sub)}</p>` : ''}
    </div>`
    }).join('')

    // 카드 3개 미만이면 grid-columns 조정 (인라인 style 오버라이드)
    const cols = d.cards.length === 2 ? 'style="grid-template-columns:repeat(2,1fr);max-width:480px;margin-left:auto;margin-right:auto"' : ''

    return `
<section class="cmfl">

  <!-- 고객센터 -->
  <div class="cmfl-cs">
    <h2 class="cmfl-cs-title">${esc(d.csTitle)}</h2>
    ${d.csSub ? `<p class="cmfl-cs-sub">${esc(d.csSub)}</p>` : ''}
    <div class="cmfl-phone-box">
      <p class="cmfl-phone-num">${esc(d.phone)}</p>
      <p class="cmfl-hours">${esc(d.hoursLine1)}${d.hoursLine2 ? `<br>${esc(d.hoursLine2)}` : ''}</p>
    </div>
  </div>

  <!-- 배송안내 -->
  <div class="cmfl-sec">
    <h3 class="cmfl-sec-title">${esc(d.shippingTitle)}</h3>
    <div class="cmfl-cards" ${cols}>${cardHtml}
    </div>
    <div class="cmfl-notes">${richSafe(d.shippingNotes)}</div>
  </div>

  <!-- 교환·반품 -->
  <div class="cmfl-sec">
    <h3 class="cmfl-sec-title">${esc(d.returnTitle)}</h3>
    <div class="cmfl-notes">${richSafe(d.returnNotes)}</div>
  </div>

</section>`
  },
})
