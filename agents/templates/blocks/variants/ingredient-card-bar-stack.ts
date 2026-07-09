/** INGREDIENT 아키타입: ingredient-card-bar-stack.
 *  피그마 147_성분소개_06 흡수 — 뱃지+헤드라인 + 라운드 카드 3개 수직 스택 재구성.
 *  각 카드: 카드 상단(타이틀+서브타이틀 | 아이콘 원) + 구분선 + 수평 그린 바 차트 행 목록.
 *  영양소 비율을 퍼센트 바로 시각화. 라이트 배경. 이미지 슬롯 없음. */
import { z } from 'zod'
import { defineBlock } from '../types'

const barRowSchema = z.object({
  name: z.string().min(1),   // 성분명
  pct: z.number().min(0).max(9999), // 1일 영양성분 기준치 %
})

const cardSchema = z.object({
  title: z.string().min(1),      // 카드 제목 (예: "비타민 13종")
  subtitle: z.string().min(1),   // 카드 부제 (예: "에너지 생성의 기본, 비타민")
  icon: z.string().optional(),   // 아이콘 이름 (ICON_NAMES 35종) — 미지정 시 leaf
  rows: z.array(barRowSchema).min(1).max(12), // 성분 바 행 목록
})

const schema = z.object({
  badge: z.string().optional(),    // 상단 뱃지 텍스트 (예: "성분안내")
  title: z.string().min(1),        // 메인 헤드라인 (em,br)
  subtitle: z.string().optional(), // 헤드라인 아래 부제 (em,br)
  cards: z.array(cardSchema).min(1).max(4), // 카드 1~4개
  footnote: z.string().optional(), // 하단 주석 (기본: "% 1일 영양성분 기준치")
})
type Data = z.infer<typeof schema>

/** 퍼센트 → 바 너비 (최대 100% 표시, 시각적 스케일은 max 기준 상대 비율) */
function barWidth(pct: number, maxPct: number): number {
  if (maxPct <= 0) return 0
  // 100% 기준 최대 80% 너비(여백 20% 확보), 시각 최소 4%
  return Math.max(4, Math.round(Math.min(pct / maxPct, 1) * 80))
}

/** 퍼센트 값 표시 포맷 */
function fmtPct(pct: number): string {
  return pct.toLocaleString('ko-KR') + '%'
}

// ICON SVG 인라인 (leaf, bolt, drop, check, shield — 성분 카드에 적합)
const CARD_ICONS: Record<string, string> = {
  leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19c0-8 6-14 15-14 0 9-6 15-15 14z"/><path d="M5 19C9 13 13 11 17 9"/></svg>',
  bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L5 13.5h5.5L9 22l9-12h-6z"/></svg>',
  drop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c-4 4-6 7-6 10a6 6 0 0 0 12 0c0-3-2-6-6-10z"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6z"/><path d="M9 12l2 2 4-4"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l2.4 9.6L24 12l-9.6 2.4L12 24l-2.4-9.6L0 12l9.6-2.4z"/></svg>',
  sprout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21v-7.5"/><path d="M12 13.5C12 10.5 9.8 8.3 6.8 8.3c0 3 2.2 5.2 5.2 5.2z"/><path d="M12 13.5c0-3 2.2-5.2 5.2-5.2 0 3-2.2 5.2-5.2 5.2z"/></svg>',
  target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.2"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/></svg>',
}

function getCardIcon(name: string | undefined): string {
  return CARD_ICONS[name ?? 'leaf'] ?? CARD_ICONS.leaf
}

export const ingredientCardBarStack = defineBlock<Data>({
  id: 'ingredient-card-bar-stack',
  archetype: 'ingredient',
  styleTags: ['light', 'food', 'health', 'editorial'],
  imageSlots: 0,
  describe:
    '성분/영양소 카드 스택 블록. 뱃지+헤드라인 아래 라운드 카드(최대 4개) 수직 나열. 각 카드: 타이틀·서브·아이콘 원 + 구분선 + 성분명·수평 그린 바·퍼센트 행 목록. 식품/건강기능식품 영양성분 함량 시각화에 최적.',
  schema,
  css: `
.icbs{background:var(--bg);padding:64px var(--pad-x,56px) 72px}
.icbs-top{text-align:center;margin-bottom:48px}
.icbs-badge{display:inline-block;background:var(--accent);color:var(--bg);font-family:var(--font-display);font-weight:700;font-size:15px;letter-spacing:.08em;padding:6px 22px;border-radius:999px;margin-bottom:20px}
.icbs-h{font-family:var(--font-display);font-weight:800;font-size:44px;line-height:1.15;color:var(--ink);letter-spacing:-.02em}
.icbs-h .em{color:var(--accent)}
.icbs-sub{margin-top:14px;font-size:17px;font-weight:500;color:var(--ink-2);line-height:1.6}
.icbs-sub .em{color:var(--accent);font-weight:700}
.icbs-cards{display:flex;flex-direction:column;gap:20px}
.icbs-card{background:var(--paper);border-radius:calc(var(--r-scale,1)*28px);padding:28px 32px 24px;border:1px solid var(--line)}
.icbs-card-hd{display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:68px}
.icbs-card-titles{flex:1}
.icbs-card-title{font-family:var(--font-display);font-weight:800;font-size:22px;color:var(--ink);line-height:1.2}
.icbs-card-subtitle{margin-top:5px;font-size:14px;font-weight:500;color:var(--ink-2);line-height:1.4}
.icbs-icon-wrap{flex:0 0 54px;width:54px;height:54px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0}
.icbs-icon-wrap svg{width:26px;height:26px;stroke:#fff}
.icbs-divider{width:100%;height:1px;background:var(--line);margin:18px 0 16px}
.icbs-rows{display:flex;flex-direction:column;gap:10px}
.icbs-row{display:grid;grid-template-columns:120px 1fr auto;align-items:center;gap:12px}
.icbs-row-name{font-size:15px;font-weight:600;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.icbs-bar-track{height:10px;background:color-mix(in srgb,var(--accent) 14%,transparent);border-radius:999px;overflow:hidden}
.icbs-bar-fill{height:100%;border-radius:999px;background:var(--accent);transition:width .3s ease}
.icbs-pct{font-size:14px;font-weight:700;color:var(--accent);white-space:nowrap;min-width:52px;text-align:right}
.icbs-footnote{margin-top:24px;text-align:right;font-size:13px;color:var(--muted);font-weight:400;letter-spacing:.01em}
`,
  render: (d, { esc, richSafe }) => {
    const footnote = d.footnote ?? '% 1일 영양성분 기준치'

    const cardsHtml = d.cards
      .map((card) => {
        const maxPct = Math.max(...card.rows.map((r) => r.pct), 1)
        const rowsHtml = card.rows
          .map((row) => {
            const w = barWidth(row.pct, maxPct)
            return `
    <div class="icbs-row">
      <span class="icbs-row-name">${esc(row.name)}</span>
      <div class="icbs-bar-track"><div class="icbs-bar-fill" style="width:${w}%"></div></div>
      <span class="icbs-pct">${fmtPct(row.pct)}</span>
    </div>`
          })
          .join('')

        return `
  <div class="icbs-card">
    <div class="icbs-card-hd">
      <div class="icbs-card-titles">
        <div class="icbs-card-title">${esc(card.title)}</div>
        <div class="icbs-card-subtitle">${esc(card.subtitle)}</div>
      </div>
      <div class="icbs-icon-wrap">${getCardIcon(card.icon)}</div>
    </div>
    <div class="icbs-divider"></div>
    <div class="icbs-rows">${rowsHtml}
    </div>
  </div>`
      })
      .join('')

    return `
<section class="icbs">
  <div class="icbs-top">
    ${d.badge ? `<div class="icbs-badge">${esc(d.badge)}</div>` : ''}
    <h2 class="icbs-h disp">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="icbs-sub">${richSafe(d.subtitle)}</p>` : ''}
  </div>
  <div class="icbs-cards">${cardsHtml}
  </div>
  <p class="icbs-footnote">${esc(footnote)}</p>
</section>`
  },
})
