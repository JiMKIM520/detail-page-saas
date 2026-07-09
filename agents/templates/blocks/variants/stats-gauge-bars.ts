/** STATS 아키타입: stats-gauge-bars (만족도 도넛 + 수평 바 3항목). */
import { z } from 'zod'
import { defineBlock } from '../types'

// ── 스키마 ──────────────────────────────────────────────────────────────────

const barItemSchema = z.object({
  label: z.string().min(1),          // 예: "#가려움 개선"
  pct: z.number().int().min(1).max(100), // 실측 퍼센트 (근거 있을 때만 사용)
})

const schema = z.object({
  /** 제품명 / 섹션 헤드라인. (em) 허용. */
  productName: z.string().min(1),
  /** 상단 배지 문구. 예: "제품 만족도 98%". 근거 수치일 때만. */
  badgeText: z.string().optional(),
  /** 체험단 규모·기간 설명. 예: "100명 체험단 4주 사용 후 실제 후기". */
  surveyNote: z.string().optional(),
  /** 도넛 안쪽 레이블. 예: "사용감 만족도". */
  gaugeLabel: z.string().min(1),
  /** 도넛 중심 퍼센트 수치 (정수, 1~100). 근거 있을 때만. */
  gaugePct: z.number().int().min(1).max(100),
  /** 수평 바 항목 (2~3개). 모두 브리프에 근거 있는 수치 전용. */
  bars: z.array(barItemSchema).min(2).max(3),
  /** 면책 문구. 예: "*개인에 따라 차이가 있을 수 있습니다." */
  disclaimer: z.string().optional(),
})

type Data = z.infer<typeof schema>

// ── 변형 정의 ────────────────────────────────────────────────────────────────

export const statsGaugeBars = defineBlock<Data>({
  id: 'stats-gauge-bars',
  archetype: 'stats',
  styleTags: ['light', 'trust', 'evidence', 'noimg-safe'],
  imageSlots: 0,
  describe:
    '체험단·임상 결과 수치 전용 블록. 상단 헤드라인 + 만족도 배지 + CSS conic-gradient 도넛 게이지(중심 퍼센트) + 수평 진행 바 2~3항목. 브리프에 실측 근거(체험단, 임상, 설문 등)가 있을 때만 사용. 수치·후기성 슬롯은 모두 optional — 실제 수치 없으면 해당 슬롯 생략.',
  schema,
  css: `
/* ── stats-gauge-bars (접두: sgbr) ── */
.sgbr{
  position:relative;
  padding:72px var(--pad-x,56px) 64px;
  background:var(--bg);
  text-align:center;
}

/* 헤드라인 */
.sgbr-head{
  font-family:var(--font-display);
  font-size:clamp(28px,4vw,48px);
  font-weight:700;
  color:var(--accent-d);
  line-height:1.15;
  letter-spacing:-.01em;
}

/* 만족도 배지 */
.sgbr-badge{
  display:inline-block;
  margin:18px auto 0;
  padding:12px 36px;
  background:linear-gradient(90deg, var(--accent-d), var(--accent));
  color:#fff;
  font-family:var(--font-display);
  font-size:clamp(22px,3vw,36px);
  font-weight:700;
  border-radius:999px;
  line-height:1.2;
}

/* 체험단 주석 */
.sgbr-note{
  margin-top:14px;
  font-size:clamp(13px,1.6vw,18px);
  font-weight:600;
  color:var(--ink-2);
  letter-spacing:.01em;
}

/* 도넛 영역 */
.sgbr-donut-wrap{
  display:flex;
  justify-content:center;
  margin:40px auto 0;
}
.sgbr-donut{
  position:relative;
  width:200px;
  height:200px;
  border-radius:50%;
  /* 회색 트랙 + 컬러 진행(conic-gradient). JS 없이 인라인 style로 각도 주입 */
  background:conic-gradient(
    var(--accent) 0deg var(--sgbr-deg, 0deg),
    var(--line) var(--sgbr-deg, 0deg) 360deg
  );
}
/* 도넛 구멍 */
.sgbr-donut::after{
  content:'';
  position:absolute;
  inset:32px;
  border-radius:50%;
  background:var(--bg);
}
/* 중심 텍스트 레이어 */
.sgbr-donut-inner{
  position:absolute;
  inset:0;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  z-index:1;
}
.sgbr-gauge-label{
  font-size:clamp(10px,1.3vw,14px);
  font-weight:700;
  color:var(--ink);
  line-height:1.2;
}
.sgbr-gauge-pct{
  display:flex;
  align-items:flex-end;
  line-height:1;
  margin-top:4px;
}
.sgbr-gauge-num{
  font-family:var(--font-display);
  font-size:clamp(32px,4.2vw,52px);
  font-weight:700;
  color:var(--accent-d);
}
.sgbr-gauge-unit{
  font-family:var(--font-display);
  font-size:clamp(16px,2vw,24px);
  font-weight:500;
  color:var(--accent-d);
  padding-bottom:4px;
  margin-left:2px;
}

/* 수평 바 영역 */
.sgbr-bars{
  max-width:620px;
  margin:36px auto 0;
  display:flex;
  flex-direction:column;
  gap:20px;
}
.sgbr-bar-row{
  display:flex;
  flex-direction:column;
  gap:8px;
  text-align:left;
}
.sgbr-bar-top{
  display:flex;
  justify-content:space-between;
  align-items:baseline;
}
.sgbr-bar-label{
  font-size:clamp(13px,1.7vw,17px);
  font-weight:700;
  color:var(--ink);
}
.sgbr-bar-pct{
  font-family:var(--font-display);
  font-size:clamp(16px,2vw,22px);
  font-weight:600;
  color:var(--accent-d);
}
.sgbr-bar-track{
  width:100%;
  height:14px;
  background:var(--line);
  border-radius:999px;
  overflow:hidden;
}
.sgbr-bar-fill{
  height:100%;
  border-radius:999px;
  background:linear-gradient(90deg, var(--accent-d), var(--accent));
  /* 너비는 인라인 style로 주입 */
}

/* 면책 문구 */
.sgbr-disclaimer{
  margin-top:32px;
  font-size:clamp(11px,1.3vw,14px);
  font-weight:300;
  color:var(--muted);
  text-align:center;
}
`,
  render: (d, { esc, richSafe }) => {
    // conic-gradient 각도: 퍼센트 → degree
    const deg = Math.round((d.gaugePct / 100) * 360)

    const barsHtml = d.bars
      .map(
        (b) => `
    <div class="sgbr-bar-row">
      <div class="sgbr-bar-top">
        <span class="sgbr-bar-label">${esc(b.label)}</span>
        <span class="sgbr-bar-pct">${b.pct}%</span>
      </div>
      <div class="sgbr-bar-track">
        <div class="sgbr-bar-fill" style="width:${b.pct}%"></div>
      </div>
    </div>`,
      )
      .join('')

    return `
<section class="sgbr">
  <h2 class="sgbr-head">${richSafe(d.productName)}</h2>
  ${d.badgeText ? `<div class="sgbr-badge">${esc(d.badgeText)}</div>` : ''}
  ${d.surveyNote ? `<p class="sgbr-note">[ ${esc(d.surveyNote)} ]</p>` : ''}

  <div class="sgbr-donut-wrap">
    <div class="sgbr-donut" style="--sgbr-deg:${deg}deg">
      <div class="sgbr-donut-inner">
        <span class="sgbr-gauge-label">${esc(d.gaugeLabel)}</span>
        <div class="sgbr-gauge-pct">
          <span class="sgbr-gauge-num">${d.gaugePct}</span>
          <span class="sgbr-gauge-unit">%</span>
        </div>
      </div>
    </div>
  </div>

  <div class="sgbr-bars">${barsHtml}
  </div>

  ${d.disclaimer ? `<p class="sgbr-disclaimer">${esc(d.disclaimer)}</p>` : ''}
</section>`
  },
})
