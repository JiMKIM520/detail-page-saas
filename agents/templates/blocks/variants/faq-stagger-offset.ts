/** FAQ 아키타입: faq-stagger-offset.
 *  [끝판왕] FAQ 문의 구성 #4 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: 스태거드 오프셋(Q카드 좌정렬 full-width + A카드 우측 인덴트 별도 박스)
 *  + trailing "A" 글리프(우측 외곽, 대형). 밝은 배경 라이트 커머스 FAQ. */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  /** 섹션 eyebrow (예: "FAQ") — 소문자 허용, em 금지 */
  eyebrow: z.string().min(1).optional(),
  /** 섹션 대제목 (예: "자주 묻는 질문") — em/br 허용 */
  title: z.string().min(1),
  /** Q&A 페어 (2~8개) */
  items: z
    .array(
      z.object({
        /** 질문 텍스트 (em/br 허용) */
        question: z.string().min(1),
        /** 답변 텍스트 (em/br 허용) */
        answer: z.string().min(1),
      }),
    )
    .min(2)
    .max(8),
})
type Data = z.infer<typeof schema>

export const faqStaggerOffset = defineBlock<Data>({
  id: 'faq-stagger-offset',
  archetype: 'faq' as any,
  styleTags: ['light', 'stagger', 'offset', 'clean', 'template'],
  imageSlots: 0,
  describe:
    'FAQ 스태거드 오프셋. 좌정렬 eyebrow+대제목 헤더 + Q카드(풀폭, 둥근 모서리, Q 글리프 좌측) / A카드(우측 인덴트, 답변 중앙+trailing A 글리프) 교번 반복. 밝고 클린한 커머스 Q&A.',
  schema,
  css: `
/* faq-stagger-offset — 접두사 fso- */
.fso{background:var(--paper);padding:56px 40px 64px;word-break:keep-all;overflow-wrap:break-word}
.fso-eyebrow{font-family:var(--font-display);font-weight:800;font-size:clamp(28px,6vw,42px);color:var(--muted);line-height:1.1;letter-spacing:-.01em;margin-bottom:4px}
.fso-title{font-family:var(--font-display);font-weight:800;font-size:clamp(32px,7vw,50px);color:var(--ink);line-height:1.18;letter-spacing:-.02em;margin-bottom:40px}
.fso-title .em{color:var(--accent-d)}
.fso-list{display:flex;flex-direction:column;gap:0}
.fso-pair{margin-bottom:32px}
.fso-pair:last-child{margin-bottom:0}
/* Q 카드 — 풀폭 좌정렬 */
.fso-q{display:flex;align-items:center;gap:14px;background:var(--bg);border-radius:16px;padding:20px 24px;box-shadow:0 4px 18px -8px rgba(0,0,0,.10)}
.fso-q-glyph{flex-shrink:0;font-family:var(--font-display);font-weight:800;font-size:22px;color:var(--ink);line-height:1}
.fso-q-text{font-family:var(--font-body);font-size:16px;font-weight:500;color:var(--ink);line-height:1.55}
.fso-q-text .em{color:var(--accent-d);font-weight:700}
/* A 카드 — 우측 인덴트(좌측 44px 오프셋), trailing A 글리프 우측 외곽 */
.fso-a-wrap{position:relative;margin-top:10px;margin-left:44px}
.fso-a{background:var(--bg);border-radius:16px;padding:22px 56px 22px 24px;box-shadow:0 4px 18px -8px rgba(0,0,0,.08)}
.fso-a-text{font-family:var(--font-body);font-size:15px;color:var(--ink);line-height:1.7;text-align:center}
.fso-a-text .em{color:var(--accent-d);font-weight:700}
/* trailing "A" glyph — 우측 외곽에 큰 글리프 */
.fso-a-glyph{position:absolute;right:14px;top:50%;transform:translateY(-50%);font-family:var(--font-display);font-weight:800;font-size:26px;color:var(--ink);line-height:1}
`,
  render: (d, { esc, richSafe }) => {
    const eyebrow = d.eyebrow
      ? `<p class="fso-eyebrow">${esc(d.eyebrow)}</p>`
      : ''

    const pairs = d.items
      .map(
        (it) => `
    <div class="fso-pair">
      <div class="fso-q">
        <span class="fso-q-glyph">Q</span>
        <p class="fso-q-text">${richSafe(it.question)}</p>
      </div>
      <div class="fso-a-wrap">
        <div class="fso-a">
          <p class="fso-a-text">${richSafe(it.answer)}</p>
        </div>
        <span class="fso-a-glyph">A</span>
      </div>
    </div>`,
      )
      .join('')

    return `
<section class="fso">
  ${eyebrow}
  <h2 class="fso-title">${richSafe(d.title)}</h2>
  <div class="fso-list">
    ${pairs}
  </div>
</section>`
  },
})
