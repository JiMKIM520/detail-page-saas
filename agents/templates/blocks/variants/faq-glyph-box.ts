/** FAQ 아키타입: faq-glyph-box.
 *  Figma 10_FAQ 568:5308 — 장식 Q글리프 앵커 + 답변 둥근 박스 + accent 배너 헤딩.
 *  accent 직사각형 배너(수평룰 좌우) 헤딩 + 반복 FAQ쌍(대형 Q.글리프+볼드 질문 / 라운드 박스 답변). */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  heading: z.string().min(1).optional(),      // 배너 헤딩 텍스트 (기본 "FAQ.")
  items: z
    .array(
      z.object({
        q: z.string().min(1),                  // 질문 텍스트
        a: z.string().min(1),                  // 답변 텍스트 (em,br)
      }),
    )
    .min(2)
    .max(8),
})
type Data = z.infer<typeof schema>

export const faqGlyphBox = defineBlock<Data>({
  id: 'faq-glyph-box',
  archetype: 'faq' as any,
  styleTags: ['light', 'editorial', 'template', 'minimal'],
  imageSlots: 0,
  describe:
    '대형 Q.글리프 앵커 FAQ. accent 직사각형 배너 헤딩(좌우 수평룰) + 대형 Q.글리프+볼드 질문 행 + 라운드 박스 답변 반복. 라이트 배경 편집형.',
  schema,
  css: `
.fgb{background:color-mix(in srgb,var(--accent) 14%,#fff);padding:56px 0 70px}
.fgb-banner-row{display:flex;align-items:center;gap:0;margin:0 48px 52px}
.fgb-rule{flex:1;height:2px;background:var(--ink)}
.fgb-banner{flex:0 0 auto;background:var(--accent);color:#fff;font-family:var(--font-display);font-weight:800;font-size:52px;letter-spacing:.04em;line-height:1;padding:14px 56px}
.fgb-item{padding:0 48px;margin-bottom:36px}
.fgb-item:last-child{margin-bottom:0}
.fgb-q-row{display:flex;align-items:center;gap:14px;margin-bottom:14px}
.fgb-glyph{flex:0 0 auto;font-family:var(--font-serif),'Georgia',serif;font-weight:400;font-size:68px;line-height:1;color:var(--accent);letter-spacing:-.02em}
.fgb-question{font-family:var(--font-display);font-weight:800;font-size:22px;color:var(--ink);line-height:1.35}
.fgb-answer{background:#fff;border:1px solid color-mix(in srgb,var(--ink) 10%,transparent);border-radius:12px;padding:22px 26px;font-size:15px;color:var(--ink-2);line-height:1.75}
.fgb-answer .em{color:var(--accent);font-weight:700}
`,
  render: (d, { esc, richSafe }) => `
<section class="fgb">
  <div class="fgb-banner-row">
    <div class="fgb-rule"></div>
    <div class="fgb-banner">${esc(d.heading ?? 'FAQ.')}</div>
    <div class="fgb-rule"></div>
  </div>
  ${d.items
    .map(
      (it) => `
  <div class="fgb-item">
    <div class="fgb-q-row">
      <span class="fgb-glyph">Q.</span>
      <span class="fgb-question">${esc(it.q)}</span>
    </div>
    <div class="fgb-answer">${richSafe(it.a)}</div>
  </div>`,
    )
    .join('')}
</section>`,
})
