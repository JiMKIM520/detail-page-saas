/** FAQ 아키타입: faq-dual-circle.
 *  [끝판왕] FAQ 문의 구성 #20 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처: "Q&A" 듀얼 컬러 헤더(Q=틸 accent, &A=네이비 brand) +
 *  각 항목 Q원형 글리프 배지(accent) / A원형 글리프 배지(brand) +
 *  2단 답변 타이포(볼드 헤드라인 + 소형 바디). 이미지 없음. */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  /** 섹션 타이틀 (기본 "Q&A"). em 허용. */
  title: z.string().min(1).optional(),
  /** FAQ 항목 (2~6개) */
  items: z
    .array(
      z.object({
        /** 질문 텍스트 (em 허용) */
        question: z.string().min(1),
        /** 굵은 답변 헤드라인 (em 허용) */
        answerHead: z.string().min(1),
        /** 보조 설명 본문 (선택, em/br 허용) */
        answerBody: z.string().optional(),
      }),
    )
    .min(2)
    .max(6),
})
type Data = z.infer<typeof schema>

export const faqDualCircle = defineBlock<Data>({
  id: 'faq-dual-circle',
  archetype: 'faq' as any,
  styleTags: ['light', 'clean', 'faq', 'dual-badge', 'template'],
  imageSlots: 0,
  describe:
    'FAQ 듀얼 원형 배지. 틸(Q) 네이비(A) 원형 글리프 배지 + 질문 + 볼드 헤드라인 + 보조 바디 반복(2~6개). 이미지 없음. 밝고 깔끔한 헬스·식품·뷰티 상세페이지 문의 섹션.',
  schema,
  css: `
/* faq-dual-circle — 접두사 fdc- */
*{word-break:keep-all;overflow-wrap:break-word}
.fdc{background:var(--paper);padding:56px 40px 64px;text-align:left}
.fdc-hd{text-align:center;margin-bottom:44px}
.fdc-title{font-family:var(--font-display);font-weight:800;font-size:clamp(36px,7vw,52px);letter-spacing:-.02em;line-height:1.1;color:var(--ink)}
/* Q 글자만 틸 accent, &A 파트는 기본 ink — .em으로 Q를 강조 */
.fdc-title .em{color:var(--accent)}
.fdc-item{display:flex;flex-direction:column;gap:0;margin-bottom:40px}
.fdc-item:last-child{margin-bottom:0}
.fdc-row{display:flex;align-items:flex-start;gap:18px}
.fdc-q-row{margin-bottom:12px}
.fdc-a-row{margin-bottom:0}
/* 원형 배지 공통 */
.fdc-badge{flex-shrink:0;width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:800;font-size:22px;color:#fff;line-height:1}
.fdc-badge-q{background:var(--accent)}
.fdc-badge-a{background:var(--brand)}
/* 텍스트 영역 */
.fdc-q-text{font-family:var(--font-body);font-weight:600;font-size:clamp(16px,3.4vw,19px);color:var(--ink);line-height:1.5;padding-top:10px}
.fdc-a-head{font-family:var(--font-display);font-weight:800;font-size:clamp(18px,3.8vw,22px);color:var(--ink);line-height:1.4;padding-top:10px}
.fdc-a-head .em{color:var(--accent-d)}
.fdc-a-body{font-family:var(--font-body);font-size:clamp(13px,2.8vw,15px);color:var(--muted);line-height:1.75;margin-top:8px;padding-left:66px}
.fdc-a-body .em{color:var(--accent-d);font-weight:700}
.fdc-divider{border:none;border-top:1px solid var(--line);margin:32px 0}
`,
  render: (d, { esc, richSafe }) => {
    const titleHtml = d.title
      ? richSafe(d.title)
      : `<span class="em">Q</span>&amp;A`

    const items = d.items
      .map(
        (it, i) => `
    <div class="fdc-item">
      <div class="fdc-row fdc-q-row">
        <div class="fdc-badge fdc-badge-q">Q</div>
        <p class="fdc-q-text">${richSafe(it.question)}</p>
      </div>
      <div class="fdc-row fdc-a-row">
        <div class="fdc-badge fdc-badge-a">A</div>
        <div>
          <p class="fdc-a-head">${richSafe(it.answerHead)}</p>
          ${it.answerBody ? `<p class="fdc-a-body">${richSafe(it.answerBody)}</p>` : ''}
        </div>
      </div>
    </div>${i < d.items.length - 1 ? '<hr class="fdc-divider">' : ''}`,
      )
      .join('')

    return `
<section class="fdc">
  <div class="fdc-hd">
    <h2 class="fdc-title">${titleHtml}</h2>
  </div>
  ${items}
</section>`
  },
})
