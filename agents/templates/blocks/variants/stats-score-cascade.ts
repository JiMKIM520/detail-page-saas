/** STATS 아키타입: stats-score-cascade
 *  피그마 002_4_9_5.json — "4.9/5" 80px Bold 텍스트를
 *  좌(Stage1)/우(Stage2) 2열 × 5행으로 교차 배치한 평점 타이포그래피 애니메이션 프레임.
 *  데스크톱(872px) 재구성: 좌열 5개 + 우열 5개(행 절반 오프셋)가 동시에 CSS 카운트업 모션으로
 *  숫자 투명도·이동을 단계별로 드러낸다. 이미지 없음. */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  score: z.string().min(1),                    // 표시 평점 (예: "4.9/5")
  scoreLabel: z.string().optional(),           // 평점 라벨 (예: "평균 평점")
  headline: z.string().min(1),                 // 섹션 제목 (em,br)
  sub: z.string().optional(),                  // 부제/설명 (em,br)
  metrics: z
    .array(
      z.object({
        value: z.string().min(1),              // 수치 (예: "98%", "1,200건")
        label: z.string().min(1),             // 수치 설명
      }),
    )
    .min(2)
    .max(5)
    .optional(),                               // 하단 보조 수치 배열 — 브리프 근거 시만
})
type Data = z.infer<typeof schema>

export const statsScoreCascade = defineBlock<Data>({
  id: 'stats-score-cascade',
  archetype: 'stats',
  styleTags: ['light', 'editorial', 'motion', 'typography'],
  imageSlots: 0,
  describe:
    '평점 숫자 카스케이드 블록. 좌열 + 우열(절반 오프셋) 2열 구조에 평점 숫자(예: 4.9/5)를 80px Bold로 반복 배치하고, CSS 단계별 페이드·슬라이드 애니메이션으로 숫자 카운트업 인상을 준다. 라이트 배경. 선택적 보조 수치(재구매율/리뷰 수 등) 하단 격자.',
  schema,
  css: `
.stcu{background:var(--bg);color:var(--ink);padding:72px var(--pad-x,56px) 64px;overflow:hidden}

/* ── 헤더 ── */
.stcu-hd{text-align:center;margin-bottom:52px}
.stcu-headline{font-family:var(--font-display);font-weight:800;font-size:38px;line-height:1.25;color:var(--ink);letter-spacing:-.02em}
.stcu-headline .em{color:var(--accent)}
.stcu-sub{margin-top:14px;font-size:17px;font-weight:500;color:var(--ink-2);line-height:1.6}
.stcu-sub .em{color:var(--accent);font-weight:700}

/* ── 캐스케이드 그리드 ── */
.stcu-grid{display:grid;grid-template-columns:1fr 1fr;column-gap:0;row-gap:0;position:relative}

/* 좌열(홀수 1~5) — 상단 기준 정렬 */
.stcu-col-l{display:flex;flex-direction:column}
/* 우열(짝수 1~5) — 행 높이 절반(108px) 아래에서 시작해 피그마 교차 오프셋 재현 */
.stcu-col-r{display:flex;flex-direction:column;margin-top:108px}

/* 개별 셀 */
.stcu-cell{width:100%;height:108px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden}
/* 셀 사이 구분선 */
.stcu-cell+.stcu-cell{border-top:1px solid var(--line)}

/* 평점 숫자 — 80px Bold, 피그마와 동일 */
.stcu-num{font-family:var(--font-display);font-weight:800;font-size:80px;line-height:1;letter-spacing:-.04em;white-space:nowrap;user-select:none}

/* 컬럼 색상 대비: 좌열 어두운 잉크 / 우열 악센트 */
.stcu-col-l .stcu-num{color:var(--ink)}
.stcu-col-r .stcu-num{color:var(--accent)}

/* ── 단계별 카운트업 애니메이션 ── */
/* 각 셀은 초기 투명·하단에서 진입 — 행 순서에 따라 딜레이 */
@keyframes stcu-rise{
  from{opacity:0;transform:translateY(28px)}
  to  {opacity:1;transform:translateY(0)}
}
.stcu-cell{animation:stcu-rise .55s cubic-bezier(.16,1,.3,1) both}
.stcu-col-l .stcu-cell:nth-child(1){animation-delay:.05s}
.stcu-col-l .stcu-cell:nth-child(2){animation-delay:.15s}
.stcu-col-l .stcu-cell:nth-child(3){animation-delay:.25s}
.stcu-col-l .stcu-cell:nth-child(4){animation-delay:.35s}
.stcu-col-l .stcu-cell:nth-child(5){animation-delay:.45s}
.stcu-col-r .stcu-cell:nth-child(1){animation-delay:.10s}
.stcu-col-r .stcu-cell:nth-child(2){animation-delay:.20s}
.stcu-col-r .stcu-cell:nth-child(3){animation-delay:.30s}
.stcu-col-r .stcu-cell:nth-child(4){animation-delay:.40s}
.stcu-col-r .stcu-cell:nth-child(5){animation-delay:.50s}

/* 셀 배경 미묘한 교번 (짝수행은 paper tone) */
.stcu-col-l .stcu-cell:nth-child(even),
.stcu-col-r .stcu-cell:nth-child(even){background:color-mix(in srgb,var(--paper) 60%,transparent)}

/* 좌/우 열 세로 구분선 */
.stcu-grid::after{content:'';position:absolute;left:50%;top:0;bottom:0;width:1px;background:var(--line)}

/* 스코어 라벨 배지 — 그리드 중앙 상단에 오버레이 */
.stcu-badge{position:absolute;left:50%;top:calc(-1 * 28px);transform:translate(-50%,-50%);z-index:2;background:var(--accent);color:var(--bg);font-family:var(--font-display);font-weight:800;font-size:13px;letter-spacing:.08em;padding:6px 18px;border-radius:calc(var(--r-scale,1)*999px);white-space:nowrap;box-shadow:0 4px 14px -4px color-mix(in srgb,var(--accent) 55%,transparent)}

/* 그리드 래퍼: 배지 위치 기준점 */
.stcu-grid-wrap{position:relative;border:1px solid var(--line);border-radius:calc(var(--r-scale,1)*16px);overflow:hidden}

/* ── 보조 수치 하단 격자 ── */
.stcu-metrics{margin-top:48px;display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:1px;background:var(--line);border:1px solid var(--line);border-radius:calc(var(--r-scale,1)*12px);overflow:hidden}
.stcu-metric{background:var(--bg);padding:24px 20px;text-align:center}
.stcu-mval{font-family:var(--font-display);font-weight:800;font-size:28px;color:var(--accent);line-height:1.1}
.stcu-mlbl{margin-top:6px;font-size:13px;font-weight:600;color:var(--ink-2);line-height:1.4}
`,
  render: (d, { esc, richSafe }) => {
    // 좌열 4셀 × 우열 4셀: 우열이 108px 아래에서 시작하므로
    // 좌열을 5셀로 하면 하단 첫 행이 좌측 셀만 렌더돼 비대칭 발생.
    // 양쪽 모두 4셀로 맞추면 시각적 대칭이 유지되고 우열의 하단 캐스케이드
    // 돌출(108px)이 의도된 오프셋 디자인으로 자연스럽게 표현된다.
    const scoreText = esc(d.score)
    const leftCount = 4
    const rightCount = 4

    const leftCells = Array.from({ length: leftCount }, (_, i) => `
      <div class="stcu-cell" style="animation-delay:${0.05 + i * 0.10}s">
        <span class="stcu-num" aria-hidden="true">${scoreText}</span>
      </div>`).join('')

    const rightCells = Array.from({ length: rightCount }, (_, i) => `
      <div class="stcu-cell" style="animation-delay:${0.10 + i * 0.10}s">
        <span class="stcu-num" aria-hidden="true">${scoreText}</span>
      </div>`).join('')

    const metricsHtml =
      d.metrics && d.metrics.length > 0
        ? `<div class="stcu-metrics" role="list">
    ${d.metrics
      .map(
        (m) => `
      <div class="stcu-metric" role="listitem">
        <div class="stcu-mval">${esc(m.value)}</div>
        <div class="stcu-mlbl">${esc(m.label)}</div>
      </div>`,
      )
      .join('')}
  </div>`
        : ''

    return `
<section class="stcu">
  <div class="stcu-hd">
    <h2 class="stcu-headline">${richSafe(d.headline)}</h2>
    ${d.sub ? `<p class="stcu-sub">${richSafe(d.sub)}</p>` : ''}
  </div>
  <div class="stcu-grid-wrap" role="img" aria-label="${scoreText} 평점">
    ${d.scoreLabel ? `<div class="stcu-badge">${esc(d.scoreLabel)}</div>` : ''}
    <div class="stcu-grid">
      <div class="stcu-col-l">${leftCells}
      </div>
      <div class="stcu-col-r">${rightCells}
      </div>
    </div>
  </div>
  ${metricsHtml}
</section>`
  },
})
