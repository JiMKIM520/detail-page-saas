/** COMPARE 아키타입: compare-bar-years (기간별 수직 막대 비교 차트).
 *  피그마 127_비교_04 구조 흡수 — 좌표·색·카피는 전부 토큰/슬롯으로 일반화.
 *  CSS 바 차트(flex + height %) + 인라인 SVG 화살표 장식. 이미지 에셋 불필요. */
import { z } from 'zod'
import { defineBlock } from '../types'

// 단일 막대 슬롯
const barSchema = z.object({
  period: z.string().min(1),          // 기간 라벨 (예: "1년", "5년", "10년")
  label: z.string().min(1),          // 제품 라벨 (예: "일반제품", "당사제품")
  value: z.number().int().min(1).max(100), // 차트 높이 비율 (1~100, %)
  highlight: z.boolean().optional(), // true = 브랜드 강조 막대 (화살표 장식 + 강조색)
  note: z.string().optional(),        // 막대 위 보조 주석 (브리프에 근거 있을 때만)
})

const schema = z.object({
  title: z.string().min(1),          // 섹션 제목 (em,br 허용)
  subtitle: z.string().optional(),   // 제목 아래 부제 (순수 텍스트)
  bars: z.array(barSchema).min(2).max(5), // 비교 막대 2~5개
  caption: z.string().optional(),    // 그래프 아래 보조 설명 (순수 텍스트)
  sourceNote: z.string().optional(), // 출처·근거 주석 (브리프에 근거 있을 때만)
})
type Data = z.infer<typeof schema>

export const compareBarYears = defineBlock<Data>({
  id: 'compare-bar-years',
  archetype: 'compare',
  styleTags: ['light', 'data', 'chart', 'noimg-safe'],
  imageSlots: 0,
  describe:
    '기간·수명·수치를 수직 막대 그래프로 비교하는 섹션. 라이트 배경 + 대제목 + CSS 바 차트(높이 비율 슬롯) + 기간·제품 라벨 + 강조 막대(화살표 SVG 장식) + 하단 캡션. 전자제품/뷰티/식품의 내구성·효과 지속 기간 비교에 적합. 수치·출처 슬롯은 브리프에 근거 있을 때만 사용.',
  schema,
  css: `
.cbys{background:var(--bg);color:var(--ink);padding:64px var(--pad-x,56px) 60px;text-align:center}
.cbys-hd{margin-bottom:40px}
.cbys-title{font-family:var(--font-display);font-weight:800;font-size:44px;line-height:1.18;letter-spacing:-.02em;color:var(--ink)}
.cbys-title .em{color:var(--accent-d)}
.cbys-sub{margin-top:14px;font-size:17px;font-weight:500;color:var(--ink-2);line-height:1.65}
.cbys-chart-wrap{background:var(--paper);border-radius:calc(var(--r-scale,1)*20px);padding:48px 40px 36px;display:inline-block;width:100%;max-width:640px;box-shadow:0 8px 32px -12px rgba(0,0,0,.10)}
.cbys-grid{position:relative;display:flex;align-items:flex-end;justify-content:center;gap:32px;height:260px;border-bottom:2px solid var(--line);padding-bottom:0}
.cbys-grid-lines{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:space-between;pointer-events:none}
.cbys-grid-line{width:100%;height:1px;background:var(--line);opacity:.55}
.cbys-bars{display:flex;align-items:flex-end;justify-content:center;gap:32px;height:100%;position:relative;z-index:1}
.cbys-bar-col{display:flex;flex-direction:column;align-items:center;gap:0;position:relative}
.cbys-period{font-family:var(--font-display);font-weight:700;font-size:20px;color:var(--ink-2);margin-bottom:8px;line-height:1}
.cbys-bar-col.hl .cbys-period{color:var(--accent-d);font-weight:800}
.cbys-note{font-size:12px;font-weight:600;color:var(--muted);margin-bottom:4px;line-height:1.3;max-width:100px}
.cbys-bar-col.hl .cbys-note{color:var(--accent)}
.cbys-bar{border-radius:calc(var(--r-scale,1)*8px) calc(var(--r-scale,1)*8px) 0 0;width:80px;background:var(--muted);opacity:.55;transition:none}
.cbys-bar-col.hl .cbys-bar{background:var(--accent);opacity:1}
.cbys-arrow{display:flex;justify-content:center;margin-bottom:6px;color:var(--accent)}
.cbys-arrow svg{width:28px;height:28px}
.cbys-prod{font-size:14px;font-weight:600;color:var(--ink-2);margin-top:10px;line-height:1.3}
.cbys-bar-col.hl .cbys-prod{color:var(--accent-d);font-weight:800}
.cbys-caption{margin-top:28px;font-size:15px;font-weight:400;color:var(--ink-2);line-height:1.72;max-width:560px;margin-left:auto;margin-right:auto}
.cbys-source{margin-top:14px;font-size:12px;color:var(--muted);font-weight:400;line-height:1.5}
`,
  render: (d, { esc, richSafe }) => {
    // 바 높이: value(1~100) → 실제 픽셀 높이 비율. 최대값을 100%로 정규화해 차트 공간을 최대 활용.
    const maxVal = Math.max(...d.bars.map((b) => b.value))
    const CHART_HEIGHT = 220 // px (chart area max height for tallest bar)

    // 격자선 5개 (20% 간격)
    const gridLines = Array.from({ length: 5 }, (_, i) =>
      `<div class="cbys-grid-line"></div>`,
    ).join('')

    const barsHtml = d.bars
      .map((bar) => {
        const pct = Math.round((bar.value / maxVal) * 100)
        const barPx = Math.round((bar.value / maxVal) * CHART_HEIGHT)
        const isHl = bar.highlight === true

        // 화살표 SVG (강조 막대에만)
        const arrow = isHl
          ? `<div class="cbys-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg></div>`
          : ''

        // 보조 주석 (optional)
        const noteHtml = bar.note ? `<div class="cbys-note">${esc(bar.note)}</div>` : ''

        return `<div class="cbys-bar-col${isHl ? ' hl' : ''}">
  <div class="cbys-period">${esc(bar.period)}</div>
  ${noteHtml}
  ${arrow}
  <div class="cbys-bar" style="height:${barPx}px" role="img" aria-label="${esc(bar.period)} ${esc(bar.label)} ${bar.value}%"></div>
  <div class="cbys-prod">${esc(bar.label)}</div>
</div>`
      })
      .join('\n')

    return `
<section class="cbys">
  <div class="cbys-hd">
    <h2 class="disp cbys-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="cbys-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  <div class="cbys-chart-wrap">
    <div class="cbys-grid">
      <div class="cbys-grid-lines">${gridLines}</div>
      <div class="cbys-bars">${barsHtml}</div>
    </div>
  </div>
  ${d.caption ? `<p class="cbys-caption">${esc(d.caption)}</p>` : ''}
  ${d.sourceNote ? `<p class="cbys-source">${esc(d.sourceNote)}</p>` : ''}
</section>`
  },
})
