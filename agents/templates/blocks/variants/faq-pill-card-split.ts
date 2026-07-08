/** FAQ 아키타입: faq-pill-card-split.
 *  [끝판왕] FAQ 문의 구성 #17 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 대형 FAQ 타이포 + 자주 묻는 질문 헤딩 → Q&A 반복 페어.
 *  각 페어 = 다크 풀폭 pill(--ink 배경, 흰 볼드 질문 + 오렌지 Q.) + 화이트 카드(--paper 배경, 오렌지 A. + 본문).
 *  두 레이어가 accent 색 Q./A. 레이블로 통일되는 저대비 없는 2-layer FAQ 레이아웃. */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  /** 섹션 대제목 장식 텍스트 (예: "FAQ") — 대형 반투명 디스플레이 */
  displayTitle: z.string().min(1).optional(),
  /** 실제 헤딩 (예: "자주 묻는 질문") */
  heading: z.string().min(1),
  /** Q&A 반복 유닛 (2~7개) */
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
    .max(7),
})
type Data = z.infer<typeof schema>

export const faqPillCardSplit = defineBlock<Data>({
  id: 'faq-pill-card-split',
  archetype: 'faq',
  styleTags: ['faq', 'pill', 'dark-header', 'card-answer', 'orange-label', 'template'],
  imageSlots: 0,
  describe:
    'FAQ 2-레이어 구성. 대형 디스플레이 타이틀 + 섹션 헤딩 → Q&A 페어 반복: 다크 pill(--ink) 배경 위 흰색 굵은 질문 + 오렌지 Q. 레이블 / 화이트 카드(--paper) 위 본문 + 오렌지 A. 레이블. 이미지 없음. 식품·뷰티·전자제품 범용.',
  schema,
  css: `
/* faq-pill-card-split — 접두사 fpcs- */
.fpcs{background:var(--bg);padding:64px 32px 80px;word-break:keep-all;overflow-wrap:break-word}
.fpcs-hd{text-align:center;margin-bottom:48px}
.fpcs-display{font-family:var(--font-display);font-weight:800;font-size:clamp(72px,16vw,104px);line-height:1;letter-spacing:-.04em;color:var(--muted);opacity:.35;margin-bottom:4px;user-select:none}
.fpcs-heading{font-family:var(--font-display);font-weight:800;font-size:clamp(22px,5vw,30px);color:var(--ink);letter-spacing:-.02em;line-height:1.25}
/* Q&A 페어 */
.fpcs-pair{margin-bottom:24px}
.fpcs-pair:last-child{margin-bottom:0}
/* Q pill — 다크 풀폭, 큰 border-radius로 pill 형태 */
.fpcs-q{display:flex;align-items:center;gap:14px;background:var(--ink);border-radius:calc(var(--r-scale,1)*20px);padding:20px 28px;min-height:68px}
.fpcs-qlabel{font-family:var(--font-display);font-weight:800;font-size:clamp(22px,5vw,28px);color:var(--accent);line-height:1;flex-shrink:0;letter-spacing:-.01em}
.fpcs-qtext{font-family:var(--font-body);font-weight:700;font-size:clamp(15px,3.8vw,18px);color:#fff;line-height:1.45;letter-spacing:-.01em}
.fpcs-qtext .em{color:var(--accent)}
/* A card — 흰 카드, rounded */
.fpcs-a{display:flex;align-items:flex-start;gap:16px;background:var(--paper);border-radius:calc(var(--r-scale,1)*18px);padding:22px 28px;margin-top:8px;box-shadow:0 6px 18px -8px rgba(0,0,0,.12)}
.fpcs-alabel{font-family:var(--font-display);font-weight:800;font-size:clamp(24px,5.5vw,32px);color:var(--accent);line-height:1;flex-shrink:0;letter-spacing:-.01em;padding-top:2px}
.fpcs-atext{font-family:var(--font-body);font-weight:400;font-size:clamp(14px,3.4vw,16px);color:var(--ink);line-height:1.75;letter-spacing:-.005em}
.fpcs-atext .em{color:var(--accent);font-weight:700}
`,
  render: (d, { esc, richSafe }) => {
    const pairs = d.items
      .map(
        (it) => `
    <div class="fpcs-pair">
      <div class="fpcs-q">
        <span class="fpcs-qlabel">Q.</span>
        <span class="fpcs-qtext">${richSafe(it.question)}</span>
      </div>
      <div class="fpcs-a">
        <span class="fpcs-alabel">A.</span>
        <p class="fpcs-atext">${richSafe(it.answer)}</p>
      </div>
    </div>`,
      )
      .join('')

    return `
<section class="fpcs">
  <div class="fpcs-hd">
    ${d.displayTitle ? `<div class="fpcs-display">${esc(d.displayTitle)}</div>` : ''}
    <h2 class="fpcs-heading">${richSafe(d.heading)}</h2>
  </div>
  ${pairs}
</section>`
  },
})
