/** PROMO 아키타입(패턴 재구성): event-countdown-product-grid.
 *  [끝판왕] 상품 구성 #22 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 다크 히어로(월/이벤트 eyebrow + 대형 헤드라인 + 서브카피) +
 *  우상단 카운트다운 타이머(HH:MM) + 이벤트 배지 + 2×2 상품 카드 그리드 + 하단 안내. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  /** 이벤트 라벨 (예: "Month Event", "Summer Sale") */
  eventLabel: z.string().min(1),
  /** 대형 헤드라인 — em, br 허용 */
  title: z.string().min(1),
  /** 헤드라인 아래 서브 카피 (선택, em 허용) */
  subtitle: z.string().optional(),
  /** 카운트다운 시작 시각 표시 (예: "05:30") */
  countdownStart: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  /** 카운트다운 종료 시각 표시 (예: "08:30") */
  countdownEnd: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  /** 상품 카드 목록 (정확히 4개 권장, 2×2 그리드) */
  products: z
    .array(
      z.object({
        /** 상품 사진 URL */
        image: z.string().optional(),
        /** 상품 사진 alt */
        imageAlt: z.string().optional(),
        /** 상품 라벨/뱃지 (예: "01", "BEST") — 선택 */
        badge: z.string().optional(),
        /** 상품명 (em 허용) */
        name: z.string().min(1),
        /** 간단 설명 (선택) */
        desc: z.string().optional(),
      }),
    )
    .min(2)
    .max(4),
  /** 하단 안내 카피 (선택, em, br 허용) */
  footer: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const eventCountdownProductGrid = defineBlock<Data>({
  id: 'event-countdown-product-grid',
  archetype: 'promo',
  styleTags: ['dark', 'event', 'countdown', 'grid', 'commerce', 'template'],
  imageSlots: 4,
  describe:
    '이벤트 프로모션 블록. 다크 히어로(accent eyebrow + 대형 헤드라인 + 서브카피) + 우상단 HH:MM 카운트다운 타이머 + 2×2 상품 카드 그리드 + 하단 안내. 시즌 이벤트/한정 특가에 적합.',
  schema,
  css: `
/* event-countdown-product-grid — 접두사 ecpg- */
.ecpg{background:var(--ink);color:#fff;word-break:keep-all;overflow-wrap:break-word}

/* ── 히어로 영역 ── */
.ecpg-hero{position:relative;padding:48px 40px 40px;min-height:220px}
.ecpg-timer{position:absolute;top:18px;right:20px;display:flex;flex-direction:column;align-items:flex-end;gap:2px}
.ecpg-timer-row{display:flex;align-items:center;gap:4px}
.ecpg-timer-label{font-size:11px;font-weight:700;letter-spacing:.08em;color:rgba(255,255,255,.5);text-transform:uppercase}
.ecpg-timer-val{font-family:'Cafe24 ClassicType',var(--font-display),serif;font-size:22px;font-weight:400;letter-spacing:.04em;color:#fff;line-height:1}
.ecpg-timer-sep{color:rgba(255,255,255,.4);font-size:14px;padding:0 2px}

.ecpg-eyebrow{display:inline-block;font-size:13px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:14px}
.ecpg-title{font-family:var(--font-display);font-weight:800;font-size:clamp(34px,7.5vw,52px);line-height:1.18;letter-spacing:-.02em;color:#fff;margin-bottom:10px}
.ecpg-title .em{color:var(--accent)}
.ecpg-sub{font-size:14px;line-height:1.7;color:rgba(255,255,255,.62);max-width:360px}
.ecpg-sub .em{color:var(--accent);font-weight:700}

/* ── 상품 그리드 ── */
.ecpg-grid{display:grid;grid-template-columns:1fr 1fr;gap:2px;background:rgba(255,255,255,.08);margin:0}
.ecpg-card{background:var(--ink);display:flex;flex-direction:column}
.ecpg-card-img{width:100%;aspect-ratio:1/1;object-fit:cover;display:block}
.ecpg-card-img.ph{aspect-ratio:1/1;background:rgba(255,255,255,.06);border:none;color:rgba(255,255,255,.3);font-size:12px}
.ecpg-card-body{padding:14px 16px 18px;flex:1;display:flex;flex-direction:column;gap:4px}
.ecpg-card-badge{font-size:11px;font-weight:800;letter-spacing:.08em;color:var(--accent);text-transform:uppercase}
.ecpg-card-name{font-family:var(--font-display);font-weight:700;font-size:15px;line-height:1.4;color:#fff}
.ecpg-card-name .em{color:var(--accent)}
.ecpg-card-desc{font-size:12px;color:rgba(255,255,255,.5);line-height:1.55;margin-top:2px}

/* ── 하단 안내 ── */
.ecpg-footer{padding:20px 40px 28px;text-align:center;font-size:12px;line-height:1.7;color:rgba(255,255,255,.45)}
.ecpg-footer .em{color:var(--accent);font-weight:700}
`,
  render: (d, { esc, richSafe }) => {
    /* 카운트다운 타이머 */
    const timer =
      d.countdownStart || d.countdownEnd
        ? `<div class="ecpg-timer">
        ${
          d.countdownStart
            ? `<div class="ecpg-timer-row">
            <span class="ecpg-timer-label">START</span>
            <span class="ecpg-timer-val">${esc(d.countdownStart)}</span>
          </div>`
            : ''
        }
        ${d.countdownStart && d.countdownEnd ? `<span class="ecpg-timer-sep">—</span>` : ''}
        ${
          d.countdownEnd
            ? `<div class="ecpg-timer-row">
            <span class="ecpg-timer-label">END</span>
            <span class="ecpg-timer-val">${esc(d.countdownEnd)}</span>
          </div>`
            : ''
        }
      </div>`
        : ''

    /* 상품 카드 */
    const cards = d.products
      .map(
        (p) => `
    <div class="ecpg-card">
      ${media(p.image, 'ecpg-card-img', esc(p.imageAlt ?? '상품 사진'))}
      <div class="ecpg-card-body">
        ${p.badge ? `<span class="ecpg-card-badge">${esc(p.badge)}</span>` : ''}
        <div class="ecpg-card-name">${richSafe(p.name)}</div>
        ${p.desc ? `<div class="ecpg-card-desc">${esc(p.desc)}</div>` : ''}
      </div>
    </div>`,
      )
      .join('')

    return `
<section class="ecpg">
  <div class="ecpg-hero">
    ${timer}
    <span class="ecpg-eyebrow">${esc(d.eventLabel)}</span>
    <h2 class="ecpg-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="ecpg-sub">${richSafe(d.subtitle)}</p>` : ''}
  </div>
  <div class="ecpg-grid">
    ${cards}
  </div>
  ${d.footer ? `<div class="ecpg-footer">${richSafe(d.footer)}</div>` : ''}
</section>`
  },
})
