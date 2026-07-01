/** FAQ 아키타입(템플릿 충실 재현): faq-pill-bar.
 *  Figma 10_FAQ 1284:2710 — 전폭 솔리드 Q바 + 중앙 A.
 *  상단 풀폭 히어로 이미지 + 좌상단 "자주 묻는 질문 / FAQ." 헤더 오버레이 →
 *  각 항목: ink 다크 pill 바(중앙 "Q. 질문 텍스트", 흰 텍스트, 큰 라운드) +
 *  박스 없는 중앙 정렬 답변 텍스트 반복.
 *  faq-box(단일 외곽 카드)·faq-numbered(고스트 숫자)·faq-list(개별 박스)와 차별화. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  eyebrow: z.string().min(1).optional(),  // 기본 "자주 묻는 질문"
  title: z.string().min(1).optional(),    // 기본 "FAQ."  (em,br 허용)
  heroImage: z.string().optional(),       // 상단 풀폭 히어로 이미지 (url)
  items: z
    .array(
      z.object({
        q: z.string().min(1),   // 질문 텍스트 (em,br 허용)
        a: z.string().min(1),   // 답변 텍스트 (em,br 허용)
      }),
    )
    .min(2)
    .max(6),
})
type Data = z.infer<typeof schema>

export const faqPillBar = defineBlock<Data>({
  id: 'faq-pill-bar',
  archetype: 'faq' as any,
  styleTags: ['dark', 'structured', 'bold', 'template'],
  imageSlots: 1,
  describe:
    '전폭 솔리드 Q바 + 중앙 A형 FAQ. 상단 풀폭 히어로 이미지 + 좌상단 "자주 묻는 질문 / FAQ." 헤더 → ink 다크 전폭 pill 바(중앙 Q 텍스트·흰 글자) + 박스 없는 중앙 정렬 답변 반복. 강렬한 솔리드 바 강조형.',
  schema,
  css: `
.fpb{
  background:var(--bg);
  color:var(--ink);
  padding-bottom:64px;
}

/* ─ 히어로 이미지 + 헤더 오버레이 ─ */
.fpb-hero{
  position:relative;
  width:100%;
  overflow:hidden;
}
.fpb-hero-img{
  width:100%;
  height:300px;
  object-fit:cover;
  display:block;
}
.fpb-hd{
  position:absolute;
  left:0;
  bottom:0;
  padding:28px 44px 32px;
}
.fpb-eyebrow{
  font-size:17px;
  font-weight:500;
  color:var(--ink);
  line-height:1.4;
  margin-bottom:4px;
}
.fpb-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:76px;
  letter-spacing:-.03em;
  line-height:1;
  color:var(--ink);
}
.fpb-title .em{
  color:var(--accent);
}

/* ─ 헤더(이미지 없을 때 fallback) ─ */
.fpb-hd-flat{
  padding:48px 44px 12px;
}
.fpb-hd-flat .fpb-eyebrow{
  color:var(--ink-2);
}

/* ─ FAQ 리스트 ─ */
.fpb-list{
  padding:36px 44px 0;
  display:flex;
  flex-direction:column;
  gap:32px;
}

/* ─ 개별 항목 ─ */
.fpb-item{}

/* Q: 전폭 다크 pill 바 */
.fpb-q-bar{
  background:var(--ink);
  color:#fff;
  border-radius:999px;
  padding:20px 32px;
  text-align:center;
  font-size:17px;
  font-weight:700;
  line-height:1.45;
  letter-spacing:-.01em;
  width:100%;
  box-sizing:border-box;
  display:block;
}
.fpb-q-bar .em{
  color:color-mix(in srgb,var(--accent) 80%,#fff);
}

/* A: 박스 없는 중앙 정렬 텍스트 */
.fpb-a{
  margin-top:18px;
  font-size:15px;
  color:var(--ink-2);
  line-height:1.8;
  text-align:center;
  letter-spacing:-.005em;
}
.fpb-a .em{
  color:var(--accent);
  font-weight:700;
}
`,
  render: (d, { esc, richSafe }) => {
    const heroHtml = d.heroImage
      ? `<div class="fpb-hero">
  ${media(d.heroImage, 'fpb-hero-img', 'FAQ 히어로 이미지')}
  <div class="fpb-hd">
    <p class="fpb-eyebrow">${esc(d.eyebrow ?? '자주 묻는 질문')}</p>
    <p class="fpb-title">${richSafe(d.title ?? 'FAQ.')}</p>
  </div>
</div>`
      : `<div class="fpb-hero">
  ${media(undefined, 'fpb-hero-img', 'FAQ 히어로 이미지')}
  <div class="fpb-hd">
    <p class="fpb-eyebrow">${esc(d.eyebrow ?? '자주 묻는 질문')}</p>
    <p class="fpb-title">${richSafe(d.title ?? 'FAQ.')}</p>
  </div>
</div>`

    const itemsHtml = d.items
      .map(
        (it) => `
  <div class="fpb-item">
    <span class="fpb-q-bar">Q. ${richSafe(it.q)}</span>
    <p class="fpb-a">${richSafe(it.a)}</p>
  </div>`,
      )
      .join('')

    return `<section class="fpb">
  ${heroHtml}
  <div class="fpb-list">
    ${itemsHtml}
  </div>
</section>`
  },
})
