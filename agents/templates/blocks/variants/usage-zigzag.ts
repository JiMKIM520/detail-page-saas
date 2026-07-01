/** USAGE 아키타입(템플릿 충실 재현): usage-zigzag.
 *  와디즈 200섹션 05_사용법 _01(HOW TO USE + 4단계 L/R 교차 블롭이미지+STEP/설명) 패턴 재구성.
 *  홀수 단계 = 이미지 왼쪽/텍스트 오른쪽, 짝수 단계 = 텍스트 왼쪽/이미지 오른쪽. 라이트 배경. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const pad2 = (n: number): string => String(n).padStart(2, '0')

const schema = z.object({
  title: z.string().min(1).optional(),    // 기본 "HOW TO USE" (em,br)
  subtitle: z.string().min(1).optional(), // 헤더 아래 한 줄 설명
  steps: z
    .array(
      z.object({
        image: z.string().optional(),          // 블롭 이미지 (url)
        label: z.string().min(1).optional(),   // 기본 "STEP 0N"
        text: z.string().min(1),               // 단계 설명 (em,br)
      }),
    )
    .min(2)
    .max(4),
  closer: z.string().min(1).optional(),   // 마무리 카피 (em,br)
  closerSub: z.string().min(1).optional(), // 마무리 부제 (em,br)
})
type Data = z.infer<typeof schema>

export const usageZigzag = defineBlock<Data>({
  id: 'usage-zigzag',
  archetype: 'usage',
  styleTags: ['light', 'template', 'howto', 'zigzag', 'editorial'],
  imageSlots: 4,
  describe:
    '사용법(지그재그 교차). 라이트 배경 + 영문 대제목(HOW TO USE) + 4단계 L/R 블롭이미지·STEP라벨·설명 교차 배치 + 마무리. 홀수=이미지왼쪽, 짝수=이미지오른쪽.',
  schema,
  css: `
.uzz{background:var(--bg);color:var(--ink);padding:54px 0 60px}
.uzz-hd{text-align:left;padding:0 56px 10px}
.uzz-title{font-family:var(--font-display);font-weight:800;font-size:70px;color:var(--accent);letter-spacing:-.02em;line-height:1.02}
.uzz-sub{margin-top:14px;font-size:17px;font-weight:500;color:var(--ink-2)}
.uzz-steps{margin-top:32px}
.uzz-step{display:flex;align-items:center;gap:0;padding:32px 56px;position:relative}
.uzz-step.rev{flex-direction:row-reverse}
.uzz-blob-wrap{flex:0 0 48%;width:48%}
.uzz-blob{width:100%;aspect-ratio:1/0.78;border-radius:42% 58% 54% 46% / 44% 42% 58% 56%;overflow:hidden;background:color-mix(in srgb,var(--accent) 10%,transparent)}
.uzz-blob img,.uzz-blob .ph{width:100%;height:100%;object-fit:cover;border-radius:inherit}
.uzz-body{flex:1;padding:0 36px}
.uzz-step.rev .uzz-body{padding:0 36px 0 0}
.uzz-label-row{display:flex;align-items:center;gap:10px;margin-bottom:12px}
.uzz-label{font-family:var(--font-display);font-weight:800;font-size:20px;color:var(--accent);letter-spacing:.06em}
.uzz-div{flex:1;height:2px;background:var(--accent);opacity:.35}
.uzz-text{font-size:16px;color:var(--ink-2);line-height:1.72}
.uzz-text .em{color:var(--accent);font-weight:700}
.uzz-closer{margin-top:50px;text-align:center;padding:0 56px;font-family:var(--font-display);font-weight:800;font-size:36px;color:var(--ink);line-height:1.35}
.uzz-closer .em{color:var(--accent)}
.uzz-closer-sub{margin-top:8px;text-align:center;padding:0 56px;font-family:var(--font-display);font-weight:700;font-size:28px;color:var(--accent);line-height:1.3}
.uzz-closer-sub .em{color:var(--ink)}
`,
  render: (d, { esc, richSafe }) => `
<section class="uzz">
  <div class="uzz-hd">
    <h2 class="uzz-title">${richSafe(d.title ?? 'HOW TO USE')}</h2>
    ${d.subtitle ? `<p class="uzz-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  <div class="uzz-steps">
    ${d.steps
      .map(
        (s, i) => `
    <div class="uzz-step${i % 2 === 1 ? ' rev' : ''}">
      <div class="uzz-blob-wrap">
        <div class="uzz-blob">${media(s.image, '', '사용법 단계')}</div>
      </div>
      <div class="uzz-body">
        <div class="uzz-label-row">
          <span class="uzz-label">${esc(s.label ?? `STEP ${pad2(i + 1)}`)}</span>
          <span class="uzz-div"></span>
        </div>
        <div class="uzz-text">${richSafe(s.text)}</div>
      </div>
    </div>`,
      )
      .join('')}
  </div>
  ${d.closer ? `<p class="uzz-closer">${richSafe(d.closer)}</p>` : ''}
  ${d.closerSub ? `<p class="uzz-closer-sub">${richSafe(d.closerSub)}</p>` : ''}
</section>`,
})
