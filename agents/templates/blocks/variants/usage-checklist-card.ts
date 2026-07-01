/** USAGE 아키타입(템플릿 충실 재현): usage-checklist-card.
 *  와디즈 200섹션 05_사용법 1282:474 패턴 재구성.
 *  솔리드 강조색 풀배경 + 영문 대제목 + 부제 + 흰 둥근 카드(체크마크+STEP 라벨+설명 행 목록) + 마무리. */
import { z } from 'zod'
import { defineBlock } from '../types'



const schema = z.object({
  title: z.string().min(1).optional(),        // 기본 "HOW TO USE"
  subtitle: z.string().min(1).optional(),     // 부제 (em,br)
  steps: z
    .array(
      z.object({
        label: z.string().min(1).optional(),  // 기본 "STEP 0N"
        desc: z.string().min(1),              // 스텝 설명 (em,br)
      }),
    )
    .min(2)
    .max(4),
  closerSmall: z.string().min(1).optional(),  // 마무리 소문자 행
  closerLarge: z.string().min(1).optional(),  // 마무리 대형 굵은 행 (em,br)
})
type Data = z.infer<typeof schema>

const pad2 = (n: number): string => String(n).padStart(2, '0')

// Circle-check SVG (Figma 원형 체크 아이콘 재현)
const CIRCLE_CHECK =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.8 2.8L16 9"/></svg>'

export const usageChecklistCard = defineBlock<Data>({
  id: 'usage-checklist-card',
  archetype: 'usage',
  styleTags: ['premium', 'template', 'colorblock', 'checklist', 'howto'],
  imageSlots: 0,
  describe:
    '사용법 체크리스트 카드. 솔리드 accent 풀배경 + 대형 영문 제목 + 부제 + 흰 둥근 카드(원형 체크아이콘·STEP 라벨·설명 행 목록, 점선 구분) + 마무리 클로저(소+대 2행). 강한 컬러블록.',
  schema,
  css: `
.ucc{background:var(--accent);color:#fff;padding:56px 0 64px}
.ucc-hd{padding:0 52px;margin-bottom:36px;text-align:left}
.ucc-title{font-family:var(--font-display);font-weight:800;font-size:68px;letter-spacing:-.01em;line-height:1.0;color:#fff}
.ucc-sub{margin-top:14px;font-size:18px;color:rgba(255,255,255,.88);line-height:1.5}
.ucc-sub .em{color:#fff;font-weight:700}
.ucc-card{margin:0 28px;background:#fff;border-radius:20px;padding:0 36px;overflow:hidden}
.ucc-row{display:flex;align-items:flex-start;gap:18px;padding:32px 0}
.ucc-row+.ucc-row{border-top:1.5px dashed var(--line)}
.ucc-icon{flex:0 0 36px;width:36px;height:36px;color:var(--accent);margin-top:2px}
.ucc-icon svg{width:36px;height:36px;display:block}
.ucc-body{flex:1}
.ucc-step{font-family:var(--font-display);font-weight:800;font-size:20px;color:var(--accent);letter-spacing:.04em;line-height:1}
.ucc-desc{margin-top:8px;font-size:16px;color:var(--ink-2);line-height:1.65}
.ucc-desc .em{color:var(--accent);font-weight:700}
.ucc-divider{width:2px;height:52px;background:rgba(255,255,255,.45);margin:32px auto 0}
.ucc-closer{padding:28px 52px 0;text-align:center}
.ucc-closer-small{font-size:18px;color:rgba(255,255,255,.88);font-weight:500;line-height:1.5}
.ucc-closer-large{margin-top:8px;font-family:var(--font-display);font-weight:800;font-size:40px;color:#fff;line-height:1.2;letter-spacing:-.01em}
.ucc-closer-large .em{color:var(--ink)}
`,
  render: (d, { esc, richSafe }) => `
<section class="ucc">
  <div class="ucc-hd">
    <h2 class="ucc-title">${esc(d.title ?? 'HOW TO USE')}</h2>
    ${d.subtitle ? `<p class="ucc-sub">${richSafe(d.subtitle)}</p>` : ''}
  </div>
  <div class="ucc-card">
    ${d.steps
      .map(
        (s, i) => `
    <div class="ucc-row">
      <span class="ucc-icon">${CIRCLE_CHECK}</span>
      <div class="ucc-body">
        <div class="ucc-step">${esc(s.label ?? `STEP ${pad2(i + 1)}`)}</div>
        <div class="ucc-desc">${richSafe(s.desc)}</div>
      </div>
    </div>`,
      )
      .join('')}
  </div>
  ${d.closerSmall || d.closerLarge ? `
  <div class="ucc-divider"></div>
  <div class="ucc-closer">
    ${d.closerSmall ? `<p class="ucc-closer-small">${esc(d.closerSmall)}</p>` : ''}
    ${d.closerLarge ? `<p class="ucc-closer-large">${richSafe(d.closerLarge)}</p>` : ''}
  </div>` : ''}
</section>`,
})
