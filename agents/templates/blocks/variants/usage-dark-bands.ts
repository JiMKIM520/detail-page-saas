/** USAGE 아키타입(템플릿 충실 재현): usage-dark-bands.
 *  와디즈 200섹션 05_사용법 _05(HOW TO USE + 다크 배경 + 전폭 accent 직사각형 밴드 중앙텍스트) 패턴 재구성.
 *  다크 배경(var(--ink)), 영문 대제목(HOW TO USE), 각 단계마다 전폭 accent 직사각형 밴드 안에
 *  중앙정렬 2줄 텍스트, 마무리 카피 2줄. 이미지 없음. */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  title: z.string().min(1).optional(),    // 섹션 대제목 (기본 "HOW TO USE")
  subtitle: z.string().min(1).optional(), // 대제목 아래 한 줄 설명
  steps: z
    .array(
      z.object({
        heading: z.string().min(1), // 밴드 내 위쪽 줄 (em,br)
        body: z.string().min(1),    // 밴드 내 아래쪽 줄 (em,br)
      }),
    )
    .min(2)
    .max(4),
  closer: z.string().min(1).optional(),    // 마무리 카피 1줄 (em,br)
  closerAccent: z.string().min(1).optional(), // 마무리 카피 2줄 accent 강조 (em,br)
})
type Data = z.infer<typeof schema>

export const usageDarkBands = defineBlock<Data>({
  id: 'usage-dark-bands',
  archetype: 'usage',
  styleTags: ['dark', 'premium', 'template', 'howto', 'colorblock', 'centered'],
  imageSlots: 0,
  describe:
    '사용법(다크+강조색 전폭 밴드). 다크 배경(var(--ink)) + 영문 대제목(HOW TO USE) + 각 단계마다 accent 색 전폭 직사각형 밴드 중앙 2줄 텍스트 + 마무리 카피 2줄. 이미지 없이 텍스트 중심 다크 블록.',
  schema,
  css: `
.udb{background:var(--ink);color:#fff;padding:54px 0 60px;text-align:center}
.udb-title{font-family:var(--font-display);font-weight:800;font-size:64px;color:var(--accent);letter-spacing:-.01em;line-height:1.0;padding:0 48px;text-align:left}
.udb-sub{margin-top:10px;font-size:16px;color:rgba(255,255,255,.65);padding:0 48px;text-align:left}
.udb-steps{margin-top:36px;display:flex;flex-direction:column;gap:18px;padding:0 44px}
.udb-band{background:var(--accent);border-radius:8px;padding:26px 32px;text-align:center}
.udb-heading{font-family:var(--font-display);font-weight:800;font-size:19px;color:#fff;line-height:1.4}
.udb-heading .em{color:var(--ink)}
.udb-body{margin-top:6px;font-size:15px;color:rgba(255,255,255,.88);line-height:1.55}
.udb-body .em{color:var(--ink);font-weight:700}
.udb-dots{text-align:center;font-size:20px;color:rgba(255,255,255,.28);letter-spacing:6px;margin:28px 0}
.udb-closer{padding:0 44px;font-family:var(--font-display);font-weight:800;font-size:26px;color:#fff;line-height:1.45;text-align:center}
.udb-closer .em{color:var(--accent)}
.udb-closer-acc{margin-top:8px;padding:0 44px;font-family:var(--font-display);font-weight:800;font-size:28px;color:var(--accent);line-height:1.4;text-align:center}
.udb-closer-acc .em{color:#fff}
`,
  render: (d, { esc, richSafe }) => `
<section class="udb">
  <h2 class="udb-title">${esc(d.title ?? 'HOW TO USE')}</h2>
  ${d.subtitle ? `<p class="udb-sub">${esc(d.subtitle)}</p>` : ''}
  <div class="udb-steps">
    ${d.steps
      .map(
        (s) => `
    <div class="udb-band">
      <div class="udb-heading">${richSafe(s.heading)}</div>
      <div class="udb-body">${richSafe(s.body)}</div>
    </div>`,
      )
      .join('')}
  </div>
  <div class="udb-dots">⋮</div>
  ${d.closer ? `<p class="udb-closer">${richSafe(d.closer)}</p>` : ''}
  ${d.closerAccent ? `<p class="udb-closer-acc">${richSafe(d.closerAccent)}</p>` : ''}
</section>`,
})
