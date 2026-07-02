/** USAGE 아키타입(템플릿 충실 재현): usage-number-band.
 *  와디즈 200섹션 05_사용법 _01(HOW TO USE + 번호 밴드 + 초대형 배경 숫자 오버랩) 패턴 재구성.
 *  각 단계마다 accent 직사각형 밴드 위에 초대형 반투명 숫자(01~04) 오버랩,
 *  밴드 위/아래 텍스트(타이틀·설명). 이미지 없음. 라이트 배경. */
import { z } from 'zod'
import { defineBlock } from '../types'

const schema = z.object({
  title: z.string().min(1).optional(),    // 섹션 대제목 (기본 "HOW TO USE")
  subtitle: z.string().min(1).optional(), // 대제목 아래 한 줄 설명
  steps: z
    .array(
      z.object({
        label: z.string().min(1).optional(), // 밴드 내 앞 화살표+제목 (em,br)
        desc: z.string().min(1).optional(),  // 밴드 아래 설명 텍스트 (em,br)
      }),
    )
    .min(2)
    .max(4),
  closer: z.string().min(1).optional(),    // 마무리 카피 (em,br)
  closerSub: z.string().min(1).optional(), // 마무리 서브 카피 (em,br)
})
type Data = z.infer<typeof schema>

const pad2 = (n: number): string => String(n).padStart(2, '0')

export const usageNumberBand = defineBlock<Data>({
  id: 'usage-number-band',
  archetype: 'usage',
  styleTags: ['premium', 'light', 'template', 'howto', 'colorblock', 'numbered'],
  imageSlots: 0,
  describe:
    '사용법(번호 밴드+배경 숫자). 라이트 배경 + 영문 대제목(HOW TO USE) + 각 단계마다 accent 직사각형 밴드 위에 초대형 반투명 배경 숫자(01~04) 오버랩 + 밴드 내 타이틀·아래 설명 + 마무리. 이미지 없이 텍스트 중심.',
  schema,
  css: `
.unb{background:var(--bg);color:var(--ink);padding:52px 0 62px;text-align:center}
.unb-ic{width:48px;height:48px;margin:0 auto 12px;color:var(--accent)}
.unb-ic svg{width:48px;height:48px}
.unb-title{font-family:var(--font-display);font-weight:800;font-size:72px;color:var(--accent);letter-spacing:-.01em;line-height:1.0}
.unb-sub{margin-top:10px;font-size:16px;color:var(--ink-2);font-weight:500}
.unb-div{width:44px;height:3px;background:var(--accent);margin:18px auto 36px;border-radius:2px}
.unb-steps{padding:0 44px;text-align:left}
.unb-step{position:relative;margin-bottom:44px}
.unb-num{position:absolute;right:-6px;top:-28px;font-family:'Cafe24 ClassicType',var(--font-display),sans-serif;font-weight:700;font-size:130px;line-height:1;color:color-mix(in srgb,var(--accent) 18%,transparent);pointer-events:none;z-index:0;letter-spacing:-.04em;user-select:none}
.unb-band{position:relative;z-index:1;background:color-mix(in srgb,var(--accent) 22%,transparent);border-radius:8px;padding:22px 28px;display:flex;align-items:flex-start;gap:10px}
.unb-arrow{flex:0 0 auto;color:var(--accent);font-size:18px;font-weight:800;margin-top:1px}
.unb-label{font-family:var(--font-display);font-weight:800;font-size:20px;color:var(--ink);line-height:1.3}
.unb-label .em{color:var(--accent)}
.unb-desc{margin-top:12px;font-size:15px;color:var(--ink-2);line-height:1.65;padding-left:4px}
.unb-desc .em{color:var(--accent);font-weight:700}
.unb-dots{text-align:center;font-size:22px;color:var(--muted);letter-spacing:6px;margin-bottom:36px}
.unb-closer{padding:0 44px;font-family:var(--font-display);font-weight:800;font-size:30px;color:var(--ink);line-height:1.45;text-align:center}
.unb-closer .em{color:var(--accent)}
.unb-closer-sub{margin-top:6px;padding:0 44px;font-family:var(--font-display);font-weight:800;font-size:30px;color:var(--accent);line-height:1.45;text-align:center}
.unb-closer-sub .em{color:var(--ink)}
`,
  render: (d, { esc, richSafe, icon }) => `
<section class="unb">
  <span class="unb-ic">${icon('check')}</span>
  <h2 class="unb-title">${esc(d.title ?? 'HOW TO USE')}</h2>
  ${d.subtitle ? `<p class="unb-sub">${esc(d.subtitle)}</p>` : ''}
  <div class="unb-div"></div>
  <div class="unb-steps">
    ${d.steps
      .map(
        (s, i) => `
    <div class="unb-step">
      <div class="unb-num">${pad2(i + 1)}</div>
      <div class="unb-band">
        <span class="unb-arrow">→</span>
        <div class="unb-label">${richSafe(s.label ?? `단계 ${pad2(i + 1)}`)}</div>
      </div>
      ${s.desc ? `<p class="unb-desc">${richSafe(s.desc)}</p>` : ''}
    </div>`,
      )
      .join('')}
  </div>
  <div class="unb-dots">⋮</div>
  ${d.closer ? `<p class="unb-closer">${richSafe(d.closer)}</p>` : ''}
  ${d.closerSub ? `<p class="unb-closer-sub">${richSafe(d.closerSub)}</p>` : ''}
</section>`,
})
