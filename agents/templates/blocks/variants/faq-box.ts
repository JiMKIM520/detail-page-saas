/** FAQ 아키타입(템플릿 충실 재현): faq-box.
 *  Figma 10_FAQ 208:1800 — 단일 외곽선 카드 컨테이너형.
 *  라이트 배경 + "자주 묻는 질문 / FAQ." 헤더 →
 *  모든 Q/A 쌍을 하나의 둥근 테두리 박스 안에 담고, 항목 사이 수평선으로만 구분.
 *  faq-chat(말풍선)·faq-list(개별 박스카드)·faq-plain(테두리 없는 플랫)·faq-numbered(accent 배경+고스트숫자)와 차별화.
 *  선택적 장식 이미지(FAQ 아이콘 등) 우하단 배치 가능. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media, attr } from '../shared'

const schema = z.object({
  eyebrow: z.string().min(1).optional(),  // 기본 "자주 묻는 질문"
  title: z.string().min(1).optional(),    // 기본 "FAQ."  (em,br 허용)
  items: z
    .array(
      z.object({
        q: z.string().min(1),   // 질문 텍스트 (em,br 허용)
        a: z.string().min(1),   // 답변 텍스트 (em,br 허용)
      }),
    )
    .min(2)
    .max(8),
  decorImage: z.string().optional(), // 우하단 장식 이미지 (url)
})
type Data = z.infer<typeof schema>

export const faqBox = defineBlock<Data>({
  id: 'faq-box',
  archetype: 'faq',
  styleTags: ['light', 'structured', 'minimal', 'template'],
  imageSlots: 1,
  describe:
    '단일 외곽선 카드 컨테이너형 FAQ. 라이트 배경 + "자주 묻는 질문 / FAQ." 헤더 → 모든 Q/A 항목을 하나의 둥근 테두리 박스로 감싸고 항목 사이 수평 헤어라인으로만 구분. 우하단 선택적 장식 이미지.',
  schema,
  css: `
.faqbox{
  background:var(--bg);
  color:var(--ink);
  padding:60px 44px 72px;
  position:relative;
}

/* ─ 헤더 ─ */
.faqbox-hd{
  text-align:center;
  margin-bottom:36px;
}
.faqbox-eyebrow{
  font-size:18px;
  font-weight:600;
  color:var(--ink-2);
  letter-spacing:.01em;
  margin-bottom:6px;
}
.faqbox-title{
  font-family:var(--font-display);
  font-weight:800;
  font-size:72px;
  letter-spacing:-.03em;
  line-height:1;
  color:var(--accent);
}
.faqbox-title .em{
  color:var(--accent-d);
}

/* ─ 단일 외곽선 컨테이너 ─ */
.faqbox-card{
  border:2px solid color-mix(in srgb,var(--accent) 35%,var(--line));
  border-radius:calc(var(--r-scale,1)*20px);
  overflow:hidden;
  background:var(--paper);
}

/* ─ 개별 Q/A 항목 ─ */
.faqbox-item{
  padding:28px 36px;
}
.faqbox-item + .faqbox-item{
  border-top:1px solid var(--line);
}

/* Q 행 */
.faqbox-q{
  font-size:17px;
  font-weight:800;
  color:var(--accent);
  line-height:1.5;
  letter-spacing:-.01em;
  margin-bottom:10px;
}
.faqbox-q .em{
  color:var(--accent-d);
}

/* A 행 */
.faqbox-a{
  font-size:15.5px;
  color:var(--ink-2);
  line-height:1.8;
  letter-spacing:-.005em;
}
.faqbox-a .em{
  color:var(--accent);
  font-weight:700;
}

/* ─ 우하단 장식 이미지 ─ */
.faqbox-decor{
  position:absolute;
  right:32px;
  bottom:28px;
  width:100px;
  height:100px;
  object-fit:contain;
  opacity:.85;
  pointer-events:none;
}
`,
  render: (d, { esc, richSafe }) => `
<section class="faqbox">
  <div class="faqbox-hd">
    <p class="faqbox-eyebrow">${esc(d.eyebrow ?? '자주 묻는 질문')}</p>
    <p class="faqbox-title">${richSafe(d.title ?? 'FAQ.')}</p>
  </div>
  <div class="faqbox-card">
    ${d.items
      .map(
        (it) => `
    <div class="faqbox-item">
      <p class="faqbox-q">Q. ${richSafe(it.q)}</p>
      <p class="faqbox-a">A. ${richSafe(it.a)}</p>
    </div>`,
      )
      .join('')}
  </div>
  ${d.decorImage ? `<img class="faqbox-decor" src="${attr(d.decorImage)}" alt="FAQ 장식">` : ''}
</section>`,
})
