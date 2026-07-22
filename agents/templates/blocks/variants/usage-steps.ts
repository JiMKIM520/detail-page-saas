/** USAGE 아키타입(템플릿 충실 재현): usage-steps.
 *  와디즈 200섹션 05_사용법 _02(HOW TO USE + 아이콘 STEP 리스트) 패턴 재구성.
 *  영문 대제목 + (히어로 밴드) + 원형 아이콘·STEP 0N·설명 리스트 + 마무리. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media, ICON_NAMES } from '../shared'

const schema = z.object({
  title: z.string().min(1).optional(), // 기본 "HOW TO USE"
  subtitle: z.string().min(1).optional(),
  image: z.string().optional(), // 히어로 밴드
  steps: z
    .array(z.object({ icon: z.enum(ICON_NAMES), text: z.string().min(1), label: z.string().min(1).optional() }))
    .min(2)
    .max(5),
  closer: z.string().min(1).optional(), // em,br
})
type Data = z.infer<typeof schema>

const pad2 = (n: number): string => String(n).padStart(2, '0')

export const usageSteps = defineBlock<Data>({
  id: 'usage-steps',
  archetype: 'usage',
  styleTags: ['premium', 'template', 'howto'],
  imageSlots: 1,
  describe:
    '사용법 스텝. 영문 대제목(HOW TO USE) + (히어로 밴드) + 원형 아이콘·STEP 0N·설명 리스트 + 마무리. 단계별 가이드.',
  schema,
  css: `
.us{background:var(--bg);padding:52px 0 56px}
.us-hd{text-align:center;padding:0 var(--pad-x,56px)}
.us-title{font-family:var(--font-display);font-weight:800;font-size:64px;color:var(--accent-d);letter-spacing:-.01em;line-height:1.04}
.us-sub{margin-top:12px;font-size:16px;font-weight:600;color:var(--ink-2)}
/* 프레임을 이미지(3:4 세로 스타일링컷)에 맞춰 crop 최소화 — 가로 배너(height 고정)에 세로 컷이
   상하로 심하게 잘리던 것을, 세로 이미지 비율에 근접한 프레임(4:5, 상단 정렬)으로 담는다.
   max-height로 과도한 세로 확장은 억제. */
.us-hero{width:100%;aspect-ratio:4/5;max-height:560px;object-fit:cover;object-position:center 30%;margin:26px 0 8px}
.us-steps{padding:0 var(--pad-x,56px);margin-top:22px}
.us-step{display:flex;align-items:center;gap:22px;padding:24px 0}
.us-step + .us-step{border-top:1px solid var(--line)}
.us-ic{flex:0 0 70px;width:70px;height:70px;border-radius:50%;background:var(--paper);box-shadow:0 8px 20px rgba(0,0,0,.08);display:grid;place-items:center;color:var(--accent-d)}
.us-ic svg{width:34px;height:34px}
.us-l{font-family:var(--font-display);font-weight:800;font-size:16px;color:var(--accent-d);letter-spacing:.04em}
.us-t{margin-top:6px;font-size:16px;color:var(--ink-2);line-height:1.5}
.us-t .em{color:var(--accent);font-weight:700}
.us-closer{margin-top:38px;padding:0 var(--pad-x,56px);text-align:center;font-family:var(--font-display);font-weight:800;font-size:30px;color:var(--ink);line-height:1.4}
.us-closer .em{color:var(--accent)}
`,
  render: (d, { esc, richSafe, icon }) => `
<section class="us">
  <div class="us-hd">
    <h2 class="us-title">${esc(d.title ?? 'HOW TO USE')}</h2>
    ${d.subtitle ? `<p class="us-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  ${d.image ? media(d.image, 'us-hero', '사용법 이미지') : ''}
  <div class="us-steps">
    ${d.steps
      .map(
        (s, i) =>
          `<div class="us-step"><span class="us-ic">${icon(s.icon)}</span><div class="us-tx"><div class="us-l">${esc(s.label ?? `STEP ${pad2(i + 1)}`)}</div><div class="us-t">${richSafe(s.text)}</div></div></div>`,
      )
      .join('')}
  </div>
  ${d.closer ? `<p class="us-closer">${richSafe(d.closer)}</p>` : ''}
</section>`,
})
