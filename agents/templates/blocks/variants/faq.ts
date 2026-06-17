/** FAQ 아키타입: faq-chat (채팅 버블형 Q/A). Figma 200섹션 10_FAQ 패턴 재구성. */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  title: z.string().min(1).optional(), // 기본 "FAQ."
  subtitle: z.string().min(1).optional(), // 기본 "자주 묻는 질문"
  items: z.array(z.object({ q: z.string().min(1), a: z.string().min(1) })).min(2).max(8), // a: em/br 허용
})
type Data = z.infer<typeof schema>

export const faqChat = defineBlock<Data>({
  id: 'faq-chat',
  archetype: 'faq',
  styleTags: ['warm', 'playful', 'food'],
  imageSlots: 0,
  describe: '채팅 버블형 FAQ. "FAQ" 헤더 + 질문(accent 버블)/답변(화이트 버블) 쌍 반복.',
  schema,
  css: `
.fq{position:relative;padding:60px 56px 64px;background:var(--bg)}
.fq-head{margin-bottom:30px}
.fq-title{font-size:64px;color:var(--accent)}
.fq-sub{margin-top:6px;font-size:20px;font-weight:700;color:var(--ink-2)}
.fq-item + .fq-item{margin-top:22px}
.fq-q{display:inline-block;background:var(--accent);color:#fff;font-weight:800;font-size:19px;border-radius:18px 18px 18px 4px;padding:16px 26px}
.fq-a{margin-top:12px;background:var(--paper);border:1px solid var(--line);border-radius:4px 18px 18px 18px;padding:22px 26px;font-size:16.5px;color:var(--ink-2);line-height:1.7}
.fq-a .em{color:var(--accent);font-weight:700}
`,
  render: (d, { esc, richSafe }) => `
<section class="fq">
  <div class="wm"></div>
  <div class="fq-head">
    <h2 class="disp fq-title">${esc(d.title ?? 'FAQ.')}</h2>
    <p class="fq-sub">${esc(d.subtitle ?? '자주 묻는 질문')}</p>
  </div>
  ${d.items.map((it) => `<div class="fq-item"><div class="fq-q">Q. ${esc(it.q)}</div><div class="fq-a">A. ${richSafe(it.a)}</div></div>`).join('')}
</section>`,
})
