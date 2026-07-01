/** FAQ 아키타입(템플릿 충실 재현): faq-badge-row.
 *  Figma 10_FAQ 568:5017 — 원형 Q 배지 + Q/A 수평 구분선 카드 행.
 *  라이트 배경 + 체커보드 패턴 헤더 영역 + 큰 "FAQ." 디스플레이 제목 →
 *  각 FAQ 항목: 카드 내 원형 accent Q 배지 + 굵은 질문 텍스트 → 헤어라인 구분선 →
 *  accent "A" 라벨 + 답변 텍스트 행.
 *  faq-chat(말풍선)·faq-list(박스+아이콘)·faq-plain(플랫 텍스트)·faq-numbered(다크 고스트숫자)와 차별화. */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  eyebrow: z.string().min(1).optional(),  // 기본 "자주 묻는 질문"
  title: z.string().min(1).optional(),    // 기본 "FAQ." (대형 디스플레이)
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

export const faqBadgeRow = defineBlock<Data>({
  id: 'faq-badge-row',
  archetype: 'faq' as any,
  styleTags: ['light', 'premium', 'structured', 'cobalt', 'template'],
  imageSlots: 0,
  describe:
    '원형 Q 배지 + Q/A 구분선 카드 행 FAQ. 라이트 배경 + 체커보드 헤더 + 대형 "FAQ." 제목 → 각 항목: 카드 내 원형 accent Q 배지·굵은 질문 → 헤어라인 구분선 → accent "A" 라벨·답변 행 반복. 정돈된 라이트 프리미엄.',
  schema,
  css: `
.fbr{background:var(--bg);color:var(--ink);padding:0 0 72px}

/* ─ 헤더 영역 (체커보드 패턴 배경) ─ */
.fbr-hd{
  position:relative;
  padding:56px 60px 52px;
  background-color:var(--paper);
  background-image:
    linear-gradient(45deg,color-mix(in srgb,var(--ink) 6%,transparent) 25%,transparent 25%),
    linear-gradient(-45deg,color-mix(in srgb,var(--ink) 6%,transparent) 25%,transparent 25%),
    linear-gradient(45deg,transparent 75%,color-mix(in srgb,var(--ink) 6%,transparent) 75%),
    linear-gradient(-45deg,transparent 75%,color-mix(in srgb,var(--ink) 6%,transparent) 75%);
  background-size:40px 40px;
  background-position:0 0,0 20px,20px -20px,-20px 0;
  border-top:1px solid var(--line);
}
.fbr-eyebrow{font-size:18px;font-weight:500;color:var(--ink-2);letter-spacing:.01em;margin-bottom:8px}
.fbr-title{font-family:var(--font-display);font-weight:800;font-size:80px;letter-spacing:-.03em;line-height:1;color:var(--ink)}

/* ─ 카드 목록 ─ */
.fbr-list{padding:36px 44px 0}

/* ─ 개별 카드 ─ */
.fbr-card{
  background:var(--paper);
  border:1px solid var(--line);
  border-radius:8px;
  overflow:hidden;
  margin-bottom:20px;
}
.fbr-card:last-child{margin-bottom:0}

/* ─ Q 행 ─ */
.fbr-q-row{
  display:flex;
  align-items:center;
  gap:18px;
  padding:22px 28px;
}
.fbr-badge{
  flex:0 0 40px;
  width:40px;
  height:40px;
  border-radius:50%;
  background:var(--accent);
  color:#fff;
  font-family:var(--font-display);
  font-weight:800;
  font-size:18px;
  display:flex;
  align-items:center;
  justify-content:center;
  line-height:1;
  flex-shrink:0;
}
.fbr-q-text{
  font-family:var(--font-display);
  font-weight:800;
  font-size:20px;
  color:var(--ink);
  letter-spacing:-.01em;
  line-height:1.4;
}
.fbr-q-text .em{color:var(--accent)}

/* ─ 구분선 ─ */
.fbr-divider{
  border:none;
  border-top:1px solid var(--line);
  margin:0 28px;
}

/* ─ A 행 ─ */
.fbr-a-row{
  display:flex;
  align-items:baseline;
  gap:18px;
  padding:18px 28px 24px;
}
.fbr-a-label{
  flex:0 0 40px;
  font-family:var(--font-display);
  font-weight:800;
  font-size:17px;
  color:var(--accent);
  text-align:center;
  line-height:1;
  flex-shrink:0;
}
.fbr-a-text{
  font-size:15.5px;
  color:var(--ink-2);
  line-height:1.75;
  letter-spacing:-.005em;
}
.fbr-a-text .em{color:var(--accent);font-weight:700}
`,
  render: (d, { esc, richSafe }) => `
<section class="fbr">
  <div class="fbr-hd">
    <p class="fbr-eyebrow">${esc(d.eyebrow ?? '자주 묻는 질문')}</p>
    <h2 class="fbr-title">${esc(d.title ?? 'FAQ.')}</h2>
  </div>
  <div class="fbr-list">
    ${d.items
      .map(
        (it) => `
    <div class="fbr-card">
      <div class="fbr-q-row">
        <span class="fbr-badge">Q</span>
        <span class="fbr-q-text">${richSafe(it.q)}</span>
      </div>
      <hr class="fbr-divider">
      <div class="fbr-a-row">
        <span class="fbr-a-label">A</span>
        <span class="fbr-a-text">${richSafe(it.a)}</span>
      </div>
    </div>`,
      )
      .join('')}
  </div>
</section>`,
})
