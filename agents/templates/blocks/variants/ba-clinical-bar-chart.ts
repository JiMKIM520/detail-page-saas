/** COMPARE 아키타입: ba-clinical-bar-chart.
 *  [끝판왕] 추천·B&A #24 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 다크(--ink) 배경 + eyebrow + 대형 헤드라인
 *  → [지표명 + big-stat 개선율% + 사용전/후 수평 막대차트 카드] 반복(2~5회).
 *  막대는 CSS width%로 근사. 사용 전(긴 중립 회색) vs 사용 후(짧은 accent 강조). */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  /** eyebrow 소제목 (예: "임상 시험 완료") */
  eyebrow: z.string().min(1),
  /** 섹션 대제목 (em, br 허용) */
  title: z.string().min(1),
  /** 사용 전 축 레이블 (기본 "사용 전") */
  beforeLabel: z.string().optional(),
  /** 사용 후 축 레이블 (기본 "사용 후") */
  afterLabel: z.string().optional(),
  /** 축 최대값 표시 텍스트 (기본 "90") — 눈금 참고용 */
  axisMax: z.string().optional(),
  /** 반복 지표 유닛 (2~5개) */
  items: z
    .array(
      z.object({
        /** 지표명 (예: "눈가 처짐 및 주름") */
        metric: z.string().min(1),
        /** 개선율 숫자 문자열 (예: "42.53") — % 기호는 자동 */
        statValue: z.string().min(1),
        /** big-stat 뒤 단위/수식어 텍스트 (기본 "개선") */
        statSuffix: z.string().optional(),
        /** 사용 전 바 너비 % (0~100 정수) */
        beforePct: z.number().int().min(0).max(100),
        /** 사용 후 바 너비 % (0~100 정수) */
        afterPct: z.number().int().min(0).max(100),
      }),
    )
    .min(2)
    .max(5),
})
type Data = z.infer<typeof schema>

export const baClinicalBarChart = defineBlock<Data>({
  id: 'ba-clinical-bar-chart',
  archetype: 'compare',
  styleTags: ['dark', 'clinical', 'stats', 'before-after', 'chart', 'template'],
  imageSlots: 0,
  describe:
    '임상 B&A 수평 막대 차트. 다크 배경 + eyebrow + 대제목 + [지표명 → 개선율% big-stat → 사용전/후 수평 바 쌍 + 눈금 카드] 2~5회 반복. 사용 전은 중립 회색 긴 바, 사용 후는 accent 짧은 바로 개선 강조.',
  schema,
  css: `
/* ba-clinical-bar-chart — 접두사 bcbc- */
.bcbc{background:var(--ink);color:#fff;padding:60px 36px 72px;word-break:keep-all;overflow-wrap:break-word}

/* eyebrow */
.bcbc-eyebrow{font-family:var(--font-body);font-size:14px;font-weight:600;letter-spacing:.04em;color:rgba(255,255,255,.55);margin-bottom:8px}

/* 대형 헤드라인 */
.bcbc-title{font-family:var(--font-display);font-weight:800;font-size:clamp(32px,7vw,52px);line-height:1.18;letter-spacing:-.025em;color:#fff;margin-bottom:52px}
/* 다크 배경 — .em은 밝은 accent override (accent-d는 다크에서 대비 부족) */
.bcbc-title .em{color:var(--accent)}

/* 반복 지표 유닛 */
.bcbc-item{margin-bottom:44px}
.bcbc-item:last-child{margin-bottom:0}

/* 지표명 */
.bcbc-metric{font-family:var(--font-body);font-size:15px;font-weight:500;color:rgba(255,255,255,.72);letter-spacing:-.005em;margin-bottom:4px}

/* big-stat 개선율 */
.bcbc-stat{display:flex;align-items:baseline;gap:6px;margin-bottom:16px;line-height:1}
.bcbc-stat-value{font-family:var(--font-display);font-weight:800;font-size:clamp(38px,8vw,58px);letter-spacing:-.03em;color:#fff}
.bcbc-stat-pct{font-family:var(--font-display);font-weight:800;font-size:clamp(22px,4.5vw,34px);letter-spacing:-.02em;color:#fff}
.bcbc-stat-suffix{font-family:var(--font-body);font-size:clamp(14px,2.8vw,18px);font-weight:500;color:rgba(255,255,255,.72);margin-left:2px}

/* 차트 카드 */
.bcbc-card{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:20px 20px 16px}

/* 바 행 */
.bcbc-bar-row{display:flex;align-items:center;gap:12px;margin-bottom:14px}
.bcbc-bar-label{font-family:var(--font-body);font-size:13px;font-weight:500;color:rgba(255,255,255,.7);width:40px;flex-shrink:0;letter-spacing:-.005em}

/* 바 트랙 */
.bcbc-bar-track{flex:1;height:18px;background:rgba(255,255,255,.08);border-radius:999px;overflow:hidden;position:relative}

/* 사용 전 바 — 중립 회색 (하드코딩 허용: 커머스 중립 신호색) */
.bcbc-bar-before{height:100%;border-radius:999px;background:#6B7280;transition:width .3s ease}

/* 사용 후 바 — accent 강조 */
.bcbc-bar-after{height:100%;border-radius:999px;background:var(--accent);transition:width .3s ease}

/* 눈금 축 */
.bcbc-axis{display:flex;justify-content:space-between;padding:0 0 2px;margin-top:2px}
.bcbc-axis-tick{font-family:var(--font-body);font-size:11px;color:rgba(255,255,255,.35);letter-spacing:0}
`,
  render: (d, { esc, richSafe }) => {
    const bLabel = esc(d.beforeLabel ?? '사용 전')
    const aLabel = esc(d.afterLabel ?? '사용 후')
    const axisMax = esc(d.axisMax ?? '90')

    // Axis ticks: 0, max/9*1~8, max — approximate evenly spaced labels matching original 0 10 20…90
    // We generate ticks based on axisMax parsed as number, falling back to 9 steps
    const maxNum = parseInt(d.axisMax ?? '90', 10) || 90
    const step = maxNum / 9
    const ticks = Array.from({ length: 10 }, (_, i) => Math.round(step * i))
    const axisHtml = ticks.map((t) => `<span class="bcbc-axis-tick">${t}</span>`).join('')

    const itemsHtml = d.items
      .map((it) => {
        const suffix = esc(it.statSuffix ?? '개선')
        return `
    <div class="bcbc-item">
      <p class="bcbc-metric">${esc(it.metric)}</p>
      <div class="bcbc-stat">
        <span class="bcbc-stat-value">${esc(it.statValue)}</span><span class="bcbc-stat-pct">%</span>
        <span class="bcbc-stat-suffix">${suffix}</span>
      </div>
      <div class="bcbc-card">
        <div class="bcbc-bar-row">
          <span class="bcbc-bar-label">${bLabel}</span>
          <div class="bcbc-bar-track">
            <div class="bcbc-bar-before" style="width:${it.beforePct}%"></div>
          </div>
        </div>
        <div class="bcbc-bar-row">
          <span class="bcbc-bar-label">${aLabel}</span>
          <div class="bcbc-bar-track">
            <div class="bcbc-bar-after" style="width:${it.afterPct}%"></div>
          </div>
        </div>
        <div class="bcbc-axis">${axisHtml}</div>
      </div>
    </div>`
      })
      .join('')

    return `
<section class="bcbc">
  <p class="bcbc-eyebrow">${esc(d.eyebrow)}</p>
  <h2 class="bcbc-title">${richSafe(d.title)}</h2>
  ${itemsHtml}
</section>`
  },
})
