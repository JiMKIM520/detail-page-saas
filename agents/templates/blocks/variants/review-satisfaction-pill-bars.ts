/** REVIEW 아키타입: review-satisfaction-pill-bars.
 *  [끝판왕] 리뷰·추천 #13 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 밝은 배경 + eyebrow + "만족도 N%" 대형 헤드라인 +
 *  제품명/서브 + 구분선 + 5행 pill-gradient 바(좌 라벨 → 점선 화살표 → 우 큰 %) 스택.
 *  커머스 만족도/설문 결과 섹션. */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  /** 상단 eyebrow (작은 회색 설명) */
  eyebrow: z.string().optional(),
  /** 헤드라인 만족도 수치 (예: "100") — "만족도 N%" 형태로 렌더 */
  satisfactionScore: z.string().min(1),
  /** 제품명 (em 허용) */
  productName: z.string().min(1),
  /** 영문 서브타이틀 */
  subtitle: z.string().optional(),
  /** pill 행 목록 (3~7개) */
  bars: z
    .array(
      z.object({
        /** 왼쪽 라벨 (짧은 장점/특징) */
        label: z.string().min(1),
        /** 오른쪽 % 수치 (숫자 문자열, 예: "95") */
        pct: z.string().min(1),
      }),
    )
    .min(3)
    .max(7),
})
type Data = z.infer<typeof schema>

export const reviewSatisfactionPillBars = defineBlock<Data>({
  id: 'review-satisfaction-pill-bars',
  archetype: 'review',
  styleTags: ['warm', 'soft', 'stats', 'review', 'template'],
  imageSlots: 0,
  describe:
    '만족도 pill-bar 리뷰. eyebrow + "만족도 N%" 대형 헤드라인 + 제품명/영문서브 + 구분선 + pill 그라데이션 행(좌 라벨 → 점선 화살표 → 우 % 수치) 3~7개 스택. 설문/후기 결과 요약에 적합.',
  schema,
  css: `
/* review-satisfaction-pill-bars — 접두사 rspb- */
.rspb{background:var(--paper);padding:60px 40px 68px;text-align:center;word-break:keep-all}
.rspb-eyebrow{font-family:var(--font-body);font-size:15px;color:var(--muted);line-height:1.6;margin-bottom:8px}
.rspb-score{font-family:var(--font-display);font-weight:800;font-size:clamp(40px,9vw,64px);letter-spacing:-.02em;line-height:1.1;color:var(--ink);margin-bottom:28px}
.rspb-score .em{color:var(--accent-d)}
.rspb-product{font-family:var(--font-display);font-weight:800;font-size:clamp(22px,5vw,32px);color:var(--ink);letter-spacing:-.01em;line-height:1.3}
.rspb-product .em{color:var(--accent-d)}
.rspb-sub{margin-top:6px;font-family:var(--font-body);font-size:14px;color:var(--muted);letter-spacing:.01em}
.rspb-divider{width:100%;height:1px;background:var(--line);margin:28px 0}
.rspb-bars{display:flex;flex-direction:column;gap:14px}
/* pill 행 — 그라데이션은 accent 계열, 단색 대체 가능하도록 fallback */
.rspb-pill{
  display:flex;align-items:center;
  background:linear-gradient(90deg,#f9c0cc 0%,#e0607a 100%);
  border-radius:999px;
  padding:0 20px 0 26px;
  height:62px;
  overflow:hidden;
}
.rspb-label{
  flex:1;
  font-family:var(--font-body);
  font-weight:600;
  font-size:15px;
  color:#fff;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
  text-align:left;
}
/* 점선 화살표 커넥터 */
.rspb-arrow{
  flex:1;
  display:flex;
  align-items:center;
  gap:0;
  padding:0 8px;
  min-width:48px;
  max-width:120px;
}
.rspb-arrow-line{
  flex:1;
  height:2px;
  background:repeating-linear-gradient(90deg,rgba(255,255,255,.7) 0,rgba(255,255,255,.7) 4px,transparent 4px,transparent 8px);
  border-radius:1px;
}
.rspb-arrow-head{
  width:0;height:0;
  border-top:5px solid transparent;
  border-bottom:5px solid transparent;
  border-left:8px solid rgba(255,255,255,.85);
  flex-shrink:0;
}
/* 오른쪽 % 수치 */
.rspb-pct{
  display:flex;align-items:baseline;gap:0;
  flex-shrink:0;
  margin-left:4px;
}
.rspb-num{
  font-family:var(--font-display);
  font-weight:800;
  font-size:clamp(28px,6vw,40px);
  color:#fff;
  line-height:1;
  letter-spacing:-.01em;
}
.rspb-unit{
  font-family:var(--font-body);
  font-weight:700;
  font-size:15px;
  color:rgba(255,255,255,.85);
  margin-left:2px;
  line-height:1;
}
`,
  render: (d, { esc, richSafe }) => {
    const bars = d.bars
      .map(
        (b) => `
    <div class="rspb-pill">
      <span class="rspb-label">${esc(b.label)}</span>
      <span class="rspb-arrow">
        <span class="rspb-arrow-line"></span>
        <span class="rspb-arrow-head"></span>
      </span>
      <span class="rspb-pct">
        <span class="rspb-num">${esc(b.pct)}</span>
        <span class="rspb-unit">%</span>
      </span>
    </div>`,
      )
      .join('')

    return `
<section class="rspb">
  ${d.eyebrow ? `<p class="rspb-eyebrow">${esc(d.eyebrow)}</p>` : ''}
  <h2 class="rspb-score">만족도 <span class="em">${esc(d.satisfactionScore)}%</span></h2>
  <h3 class="rspb-product">${richSafe(d.productName)}</h3>
  ${d.subtitle ? `<p class="rspb-sub">${esc(d.subtitle)}</p>` : ''}
  <div class="rspb-divider"></div>
  <div class="rspb-bars">${bars}
  </div>
</section>`
  },
})
