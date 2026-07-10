/** CALLOUT 아키타입: callout-pill-cascade
 *  상단 질문형 대제목 + 너비 가변 라운드 알약 리스트(좌정렬 계단식) + 도트 구분자 + 하단 원인 설명 텍스트.
 *  원본 프레임: 078_문제제기_01 (문제제기 섹션, 라이트 톤)
 */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  question: z.string().min(1),        // (em,br) 허용 — 질문형 대제목
  items: z.array(
    z.object({
      text: z.string().min(1),        // 알약 라벨 (순수 텍스트)
    })
  ).min(2).max(5),
  causeHeading: z.string().min(1),    // 원인 소제목 (순수 텍스트)
  causeBody: z.string().optional(),   // (em,br) 허용 — 원인 설명 보조 텍스트
})
type Data = z.infer<typeof schema>

export const calloutPillCascade = defineBlock<Data>({
  id: 'callout-pill-cascade',
  archetype: 'callout',
  styleTags: ['light', 'editorial'],
  imageSlots: 0,
  describe:
    '문제제기 전용. 질문형 대제목 + 너비가 다른 라운드 알약(pill) 리스트를 좌정렬 계단식으로 배열해 시각 리듬 형성. 도트 구분자 후 원인 설명 텍스트. 이미지 없이 완결되는 라이트 콜아웃.',
  schema,
  css: `
.cobv{padding:72px var(--pad-x,56px) 80px;background:var(--bg);text-align:center}
.cobv-q{font-family:var(--font-display);font-size:clamp(28px,5vw,48px);font-weight:800;line-height:1.35;color:var(--accent);white-space:pre-line}
.cobv-q .em{color:var(--accent-d)}
.cobv-list{margin:44px auto 0;display:flex;flex-direction:column;gap:12px;align-items:flex-start;max-width:660px}
/* 알약별 너비: 고정 비율 배열(5단계 기준). items 수에 따라 JS-free CSS :nth-child 계단 패턴 */
.cobv-pill{display:inline-flex;align-items:center;padding:14px 28px;
  border-radius:999px;background:var(--accent,#558bff);opacity:.12;
  font-size:clamp(16px,2.2vw,22px);font-weight:500;color:var(--ink);line-height:1.3;
  white-space:nowrap}
/* 각 pill 개별 opacity(배경 틴트)와 너비 오프셋 — cascade 효과 */
.cobv-pill{opacity:1;background:color-mix(in oklch,var(--accent,#558bff) 14%,var(--paper,#fff))}
.cobv-list .cobv-pill:nth-child(1){width:62%;margin-left:20%}
.cobv-list .cobv-pill:nth-child(2){width:84%;margin-left:0}
.cobv-list .cobv-pill:nth-child(3){width:74%;margin-left:8%}
.cobv-list .cobv-pill:nth-child(4){width:64%;margin-left:16%}
.cobv-list .cobv-pill:nth-child(5){width:54%;margin-left:24%}
/* 너비 2개일 때 오버라이드 */
.cobv-list[data-count="2"] .cobv-pill:nth-child(1){width:70%;margin-left:15%}
.cobv-list[data-count="2"] .cobv-pill:nth-child(2){width:88%;margin-left:0}
/* 너비 3개일 때 */
.cobv-list[data-count="3"] .cobv-pill:nth-child(1){width:58%;margin-left:21%}
.cobv-list[data-count="3"] .cobv-pill:nth-child(2){width:80%;margin-left:0}
.cobv-list[data-count="3"] .cobv-pill:nth-child(3){width:68%;margin-left:11%}
.cobv-dot{width:2px;height:52px;margin:8px auto;
  background:repeating-linear-gradient(to bottom,var(--accent,#558bff) 0,var(--accent,#558bff) 6px,transparent 6px,transparent 12px)}
.cobv-cause{margin-top:8px}
.cobv-cause-h{font-family:var(--font-display);font-size:clamp(18px,2.8vw,28px);font-weight:600;color:var(--ink);line-height:1.4}
.cobv-cause-b{margin-top:10px;font-size:clamp(14px,2vw,18px);font-weight:400;color:var(--ink-2);line-height:1.7}
.cobv-cause-b .em{color:var(--accent);font-weight:700}
@media(max-width:600px){
  .cobv-list .cobv-pill:nth-child(1){width:80%;margin-left:5%}
  .cobv-list .cobv-pill:nth-child(2){width:95%;margin-left:0}
  .cobv-list .cobv-pill:nth-child(3){width:88%;margin-left:0}
  .cobv-list .cobv-pill:nth-child(4){width:80%;margin-left:5%}
  .cobv-list .cobv-pill:nth-child(5){width:70%;margin-left:10%}
}
`,
  render: (d, { esc, richSafe }) => {
    const count = d.items.length
    const pills = d.items
      .map(item => `<span class="cobv-pill">${esc(item.text)}</span>`)
      .join('\n    ')
    return `
<section class="cobv">
  <h2 class="cobv-q">${richSafe(d.question)}</h2>
  <div class="cobv-list" data-count="${count}">
    ${pills}
  </div>
  <div class="cobv-dot" aria-hidden="true"></div>
  <div class="cobv-cause">
    <p class="cobv-cause-h">${esc(d.causeHeading)}</p>
    ${d.causeBody ? `<p class="cobv-cause-b">${richSafe(d.causeBody)}</p>` : ''}
  </div>
</section>`
  },
})
