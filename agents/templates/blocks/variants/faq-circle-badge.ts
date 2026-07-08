/** FAQ 아키타입: faq-circle-badge.
 *  [끝판왕] FAQ 문의 구성 #3 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 밝은 배경 + 대형 bold Q&A 섹션 헤딩 + 흰 카드 + 각 항목 솔리드 원형 뱃지("Q.") + 질문(accent-d)+답변(ink) 수직 스택. */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  /** 섹션 대제목 (기본 "Q&A") */
  title: z.string().min(1).optional(),
  /** Q&A 항목 (2~8개) */
  items: z
    .array(
      z.object({
        /** 질문 텍스트 (em, br 허용) */
        question: z.string().min(1),
        /** 답변 본문 (em, br 허용) */
        answer: z.string().min(1),
      }),
    )
    .min(2)
    .max(8),
})
type Data = z.infer<typeof schema>

export const faqCircleBadge = defineBlock<Data>({
  id: 'faq-circle-badge',
  archetype: 'faq',
  styleTags: ['light', 'clean', 'card', 'template'],
  imageSlots: 0,
  describe:
    'FAQ 원형 뱃지형. 밝은 배경 + accent 대형 Q&A 헤딩 + 흰 카드 컨테이너 + 솔리드 원형 "Q." 뱃지(accent 배경/흰 글씨) + 굵은 질문(accent-d) + 답변 본문 수직 스택. 식품/뷰티/건강기능식품 FAQ 섹션에 적합.',
  schema,
  css: `
/* faq-circle-badge — 접두사 fcb- */
.fcb{background:var(--bg);padding:60px 40px 64px;word-break:keep-all;overflow-wrap:break-word}
.fcb-title{font-family:var(--font-display);font-weight:800;font-size:clamp(36px,8vw,52px);color:var(--accent-d);text-align:center;letter-spacing:-.02em;line-height:1.12;margin-bottom:36px}
.fcb-title .em{color:var(--accent)}
.fcb-card{background:#fff;border-radius:calc(var(--r-scale,1)*12px);padding:0 28px}
.fcb-item{padding:28px 0 26px;display:flex;flex-direction:column;gap:14px}
.fcb-item+.fcb-item{border-top:1px solid var(--line)}
.fcb-q-row{display:flex;align-items:flex-start;gap:14px}
.fcb-badge{flex-shrink:0;width:36px;height:36px;border-radius:50%;background:var(--accent-d);display:flex;align-items:center;justify-content:center;margin-top:1px}
.fcb-badge-label{font-family:var(--font-display);font-weight:800;font-size:14px;color:#fff;letter-spacing:.02em;line-height:1}
.fcb-question{font-family:var(--font-display);font-weight:800;font-size:clamp(16px,3.8vw,20px);color:var(--accent-d);line-height:1.45;flex:1}
.fcb-question .em{color:var(--accent)}
.fcb-answer{font-family:var(--font-body);font-size:15px;color:var(--ink);line-height:1.75;padding-left:50px}
.fcb-answer .em{color:var(--accent-d);font-weight:700}
`,
  render: (d, { esc, richSafe }) => {
    const heading = d.title ?? 'Q&A'

    const items = d.items
      .map(
        (it) => `
    <div class="fcb-item">
      <div class="fcb-q-row">
        <span class="fcb-badge"><span class="fcb-badge-label">Q.</span></span>
        <p class="fcb-question">${richSafe(it.question)}</p>
      </div>
      <div class="fcb-answer">${richSafe(it.answer)}</div>
    </div>`,
      )
      .join('')

    return `
<section class="fcb">
  <h2 class="fcb-title">${esc(heading)}</h2>
  <div class="fcb-card">
    ${items}
  </div>
</section>`
  },
})
