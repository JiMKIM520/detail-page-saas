/** FAQ 아키타입(템플릿 충실 재현): faq-plain.
 *  극미니멀: 강조색 Q/A 글자 라벨 옆 plain 텍스트, 항목은 얇은 수평선만으로 구분.
 *  카드/버블/테두리 없음. faq-chat(말풍선)·faq-list(박스 카드)와 달리 완전 플랫 텍스트 목록형. */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  title: z.string().min(1).optional(),    // 기본 "FAQ."  — 대형 accent 디스플레이
  subtitle: z.string().min(1).optional(), // 기본 "자주 묻는 질문" — 소형 상단 레이블
  items: z
    .array(
      z.object({
        q: z.string().min(1),  // 질문 (em,br 허용)
        a: z.string().min(1),  // 답변 (em,br 허용)
      }),
    )
    .min(2)
    .max(8),
})
type Data = z.infer<typeof schema>

export const faqPlain = defineBlock<Data>({
  id: 'faq-plain',
  archetype: 'faq',
  styleTags: ['minimal', 'light', 'editorial', 'flat'],
  imageSlots: 0,
  describe:
    '극미니멀 플랫 텍스트 FAQ. 중앙 정렬 "자주 묻는 질문" + 대형 accent "FAQ." 헤더 → Q(accent 라벨+굵은 질문) / A(잉크 라벨+본문) 행을 얇은 수평선만으로 구분. 카드·버블·테두리 없음.',
  schema,
  css: `
.fpn{background:var(--bg);color:var(--ink);padding:70px var(--pad-x,56px) 80px}

/* ─ 헤더 ─ */
.fpn-hd{text-align:center;margin-bottom:52px}
.fpn-sub{font-size:18px;font-weight:500;color:var(--ink-2);letter-spacing:.01em;margin-bottom:10px}
.fpn-title{font-family:var(--font-display);font-weight:800;font-size:80px;line-height:1;letter-spacing:-.03em;color:var(--accent)}

/* ─ 목록 ─ */
.fpn-list{max-width:860px;margin:0 auto}

/* 첫 번째 아이템 위 구분선 없음; 이후 아이템은 얇은 수평선으로만 구분 */
.fpn-item{padding:28px 0}
.fpn-item + .fpn-item{border-top:1px solid var(--line)}

/* Q 행 */
.fpn-q{display:flex;align-items:baseline;gap:18px;margin-bottom:8px}
.fpn-ql{font-family:var(--font-display);font-weight:800;font-size:18px;color:var(--accent);flex:0 0 auto;line-height:1}
.fpn-qt{font-size:17px;font-weight:700;color:var(--accent);line-height:1.5;letter-spacing:-.01em}
.fpn-qt .em{color:var(--accent-d)}

/* A 행 */
.fpn-a{display:flex;align-items:baseline;gap:18px}
.fpn-al{font-family:var(--font-display);font-weight:800;font-size:18px;color:var(--ink-2);flex:0 0 auto;line-height:1}
.fpn-at{font-size:15.5px;color:var(--ink-2);line-height:1.75;letter-spacing:-.005em}
.fpn-at .em{color:var(--accent);font-weight:700}
`,
  render: (d, { esc, richSafe }) => `
<section class="fpn">
  <div class="fpn-hd">
    <p class="fpn-sub">${esc(d.subtitle ?? '자주 묻는 질문')}</p>
    <p class="fpn-title">${esc(d.title ?? 'FAQ.')}</p>
  </div>
  <div class="fpn-list">
    ${d.items
      .map(
        (it) => `
    <div class="fpn-item">
      <div class="fpn-q">
        <span class="fpn-ql">Q</span>
        <span class="fpn-qt">${richSafe(it.q)}</span>
      </div>
      <div class="fpn-a">
        <span class="fpn-al">A</span>
        <span class="fpn-at">${richSafe(it.a)}</span>
      </div>
    </div>`,
      )
      .join('')}
  </div>
</section>`,
})
