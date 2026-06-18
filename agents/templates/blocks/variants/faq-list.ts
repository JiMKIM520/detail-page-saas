/** FAQ 아키타입(템플릿 충실 재현): faq-list.
 *  와디즈 200섹션 10_FAQ_06 정돈된 리스트/아코디언형 재구성.
 *  대형 "FAQ." 헤더(Cafe24 Dangdanghae) + 서브타이틀 → Q행(연한 accent 배경+테두리+검색아이콘) /
 *  A행(흰 배경+테두리) 카드 반복. faq-chat(말풍선형)과 달리 박스 카드 구조. */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  title: z.string().min(1).optional(),    // 기본 "FAQ."  (대형 디스플레이)
  subtitle: z.string().min(1).optional(), // 기본 "자주 묻는 질문"
  items: z
    .array(
      z.object({
        q: z.string().min(1),   // 질문
        a: z.string().min(1),   // 답변 (em/br 허용)
      }),
    )
    .min(2)
    .max(8),
})
type Data = z.infer<typeof schema>

export const faqList = defineBlock<Data>({
  id: 'faq-list',
  archetype: 'faq',
  styleTags: ['premium', 'template', 'cobalt', 'structured'],
  imageSlots: 0,
  describe:
    '정돈된 리스트/아코디언형 FAQ. 대형 "FAQ." 헤더(Cafe24 Dangdanghae 손글씨체) + 서브타이틀 → 질문행(연한 accent 배경+테두리+검색 아이콘+굵은 Q 텍스트) / 답변행(흰 배경+테두리+A 텍스트) 카드 반복. faq-chat(말풍선형)과 달리 박스 카드 구조로 정돈된 느낌.',
  schema,
  css: `
.fl{background:var(--paper);padding:60px 70px 72px}

/* ─ 헤더 ─ */
.fl-hd{text-align:center;margin-bottom:48px}
.fl-sub{font-size:22px;font-weight:400;color:var(--ink);letter-spacing:-.01em;line-height:1.2;margin-bottom:4px}
.fl-title{font-family:'Cafe24 Dangdanghae',var(--font-hand),sans-serif;font-size:96px;font-weight:400;color:var(--accent);line-height:1.1;letter-spacing:-.02em}

/* ─ FAQ 아이템 ─ */
.fl-item{margin-top:28px;border:2px solid var(--ink)}
.fl-item:first-of-type{margin-top:0}

/* Q행: 연한 accent 배경, 아이콘 + 질문 텍스트 */
.fl-q{display:flex;align-items:center;gap:0;background:rgba(88,116,215,.13);border-bottom:2px solid var(--ink);padding:0}
.fl-q-icon{flex:0 0 72px;display:flex;align-items:center;justify-content:center;align-self:stretch;border-right:2px solid var(--ink);color:var(--accent)}
.fl-q-icon svg{width:28px;height:28px}
.fl-q-text{flex:1;padding:20px 28px;font-size:19px;font-weight:800;color:var(--ink);letter-spacing:-.01em;line-height:1.45;font-family:var(--font-display)}

/* A행: 흰 배경 */
.fl-a{padding:28px 34px;background:var(--paper);font-size:16px;color:var(--ink-2);line-height:1.75;letter-spacing:-.005em}
.fl-a .em{color:var(--accent);font-weight:700}
`,
  render: (d, { esc, richSafe, icon }) => `
<section class="fl">
  <div class="fl-hd">
    <p class="fl-sub">${esc(d.subtitle ?? '자주 묻는 질문')}</p>
    <p class="fl-title">${esc(d.title ?? 'FAQ.')}</p>
  </div>
  ${d.items
    .map(
      (it) => `
  <div class="fl-item">
    <div class="fl-q">
      <span class="fl-q-icon">${icon('search')}</span>
      <span class="fl-q-text">Q. ${esc(it.q)}</span>
    </div>
    <div class="fl-a">A. ${richSafe(it.a)}</div>
  </div>`,
    )
    .join('')}
</section>`,
})
