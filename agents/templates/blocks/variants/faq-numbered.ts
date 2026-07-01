/** FAQ 아키타입(템플릿 충실 재현): faq-numbered.
 *  Figma 10_FAQ 568:4933 — 넘버링 고스트 숫자 목록형.
 *  accent 풀배경 + 중앙 "자주 묻는 질문 / FAQ." 헤더 + 헤어라인 →
 *  각 항목: 대형 반투명 고스트 서수(01/02) 뒤 굵은 질문 인라인 + 들여쓰기 답변 + 구분선.
 *  에디토리얼/프리미엄. 이미지 없음. faq-chat(말풍선)·faq-list(박스카드)와 차별화. */
import { z } from 'zod'
import { defineBlock } from '../types'

const pad2 = (n: number): string => String(n).padStart(2, '0')

const schema = z.object({
  eyebrow: z.string().min(1).optional(),  // 기본 "자주 묻는 질문"
  title: z.string().min(1).optional(),    // 기본 "FAQ."
  items: z
    .array(
      z.object({
        q: z.string().min(1),   // 질문 텍스트 (em/br 허용)
        a: z.string().min(1),   // 답변 텍스트 (em/br 허용)
      }),
    )
    .min(2)
    .max(6),
})
type Data = z.infer<typeof schema>

export const faqNumbered = defineBlock<Data>({
  id: 'faq-numbered',
  archetype: 'faq',
  styleTags: ['premium', 'editorial', 'dark', 'cobalt', 'template'],
  imageSlots: 0,
  describe:
    '넘버링 고스트 숫자 목록형 FAQ. accent 풀배경 + "자주 묻는 질문 / FAQ." 중앙 헤더 + 구분선 → 대형 반투명 고스트 서수(01/02/03/04)가 장식된 굵은 질문 + 들여쓰기 답변 + 헤어라인 반복. 에디토리얼·프리미엄 다크.',
  schema,
  css: `
.fn{background:var(--brand,var(--accent));color:#fff;padding:60px 0 0}

/* ─ 헤더 ─ */
.fn-hd{text-align:center;padding:0 56px 40px}
.fn-eyebrow{font-size:18px;font-weight:400;color:rgba(255,255,255,.7);letter-spacing:.04em;line-height:1.3}
.fn-title{font-family:var(--font-display);font-weight:800;font-size:80px;letter-spacing:-.02em;line-height:1;color:#fff;margin-top:4px}

/* ─ 헤더 구분선 ─ */
.fn-rule{border:none;border-top:1px solid rgba(255,255,255,.28);margin:0 56px}

/* ─ FAQ 아이템 ─ */
.fn-list{padding:0 56px}
.fn-item{padding:36px 0 0;position:relative}
.fn-item-inner{padding-bottom:36px;border-bottom:1px solid rgba(255,255,255,.28)}

/* 고스트 서수: 대형, 반투명, 절대 위치로 질문 라인 왼쪽 뒤에 깔림 */
.fn-num{
  font-family:var(--font-display);
  font-weight:800;
  font-size:100px;
  line-height:.85;
  color:rgba(255,255,255,.18);
  display:block;
  margin-bottom:-54px;  /* 질문 텍스트가 숫자 위로 올라오도록 당김 */
  letter-spacing:-.03em;
  pointer-events:none;
  user-select:none;
}

/* 질문 */
.fn-q{
  font-family:var(--font-display);
  font-weight:800;
  font-size:24px;
  color:#fff;
  line-height:1.35;
  letter-spacing:-.01em;
  position:relative;
  z-index:1;
  padding-left:4px;
}
.fn-q .em{color:color-mix(in srgb,var(--accent) 80%,#fff)}

/* 답변 */
.fn-a{
  margin-top:14px;
  font-size:15px;
  color:rgba(255,255,255,.65);
  line-height:1.75;
  padding-left:4px;
  letter-spacing:-.003em;
}
.fn-a .em{color:rgba(255,255,255,.9);font-weight:700}
`,
  render: (d, { esc, richSafe }) => `
<section class="fn">
  <div class="fn-hd">
    <p class="fn-eyebrow">${esc(d.eyebrow ?? '자주 묻는 질문')}</p>
    <p class="fn-title">${esc(d.title ?? 'FAQ.')}</p>
  </div>
  <hr class="fn-rule">
  <div class="fn-list">
    ${d.items
      .map(
        (it, i) => `
    <div class="fn-item">
      <div class="fn-item-inner">
        <span class="fn-num">${pad2(i + 1)}</span>
        <p class="fn-q">${richSafe(it.q)}</p>
        <p class="fn-a">${richSafe(it.a)}</p>
      </div>
    </div>`,
      )
      .join('')}
  </div>
</section>`,
})
