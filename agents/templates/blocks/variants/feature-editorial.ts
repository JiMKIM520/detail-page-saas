/** FEATURE 아키타입(템플릿 충실 재현): feature-editorial.
 *  와디즈 200섹션 "03_특장점" 거대숫자 에디토리얼(_08) 패턴을 토큰 기반으로 재구성(클론 아님).
 *  시그니처 헤더(뱃지+코발트 대제목+서브+구분선) + Cafe24 ClassicType 대형 숫자 오버랩 + 풀폭 이미지 밴드. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  title: z.string().min(1), // 섹션 대제목 (예: "제품 특장점")
  subtitle: z.string().min(1).optional(), // 헤더 서브카피
  items: z
    .array(
      z.object({
        heading: z.string().min(1), // em 허용
        desc: z.string().min(1).optional(), // em/br 허용
        image: z.string().optional(), // 풀폭 밴드 이미지(url)
      }),
    )
    .min(2)
    .max(4),
})
type Data = z.infer<typeof schema>

const pad2 = (n: number): string => String(n).padStart(2, '0')

export const featureEditorial = defineBlock<Data>({
  id: 'feature-editorial',
  archetype: 'feature',
  styleTags: ['premium', 'editorial', 'cobalt', 'template'],
  imageSlots: 4,
  describe:
    '특장점 에디토리얼. 시그니처 헤더(코발트 뱃지+대제목+서브+구분선) + 대형 숫자(01/02/03) 오버랩한 소제목/설명 + 풀폭 이미지 밴드 반복. 프리미엄 다크커머스 템플릿 톤.',
  schema,
  css: `
.fen{background:var(--bg);padding:58px 0 60px}
.fen-hd{text-align:center;padding:0 56px;margin-bottom:46px}
.fen-badge{width:62px;height:62px;margin:0 auto 20px;border-radius:50%;background:var(--accent);display:grid;place-items:center;color:#fff}
.fen-badge svg{width:32px;height:32px}
.fen-title{font-family:var(--font-display);font-weight:800;font-size:58px;color:var(--accent);letter-spacing:-.02em;line-height:1.12}
.fen-sub{margin-top:14px;font-size:18px;font-weight:600;color:var(--ink-2)}
.fen-div{width:64px;height:3px;border-radius:2px;background:var(--accent);margin:22px auto 0}
.fen-item + .fen-item{margin-top:10px}
.fen-txt{position:relative;padding:34px 56px 22px;min-height:120px}
.fen-no{position:absolute;left:42px;top:2px;font-family:var(--font-serif);font-size:132px;line-height:1;color:var(--accent);opacity:.20}
.fen-h{position:relative;padding-left:106px;padding-top:30px;font-family:var(--font-display);font-weight:800;font-size:30px;color:var(--ink);line-height:1.25}
.fen-h .em{color:var(--accent)}
.fen-d{position:relative;padding-left:106px;margin-top:10px;font-size:15px;color:var(--ink-2);line-height:1.65}
.fen-band{width:100%;height:430px;object-fit:cover;display:block;margin-top:16px}
`,
  render: (d, { esc, richSafe, icon }) => `
<section class="fen">
  <div class="fen-hd">
    <span class="fen-badge">${icon('check')}</span>
    <h2 class="fen-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="fen-sub">${esc(d.subtitle)}</p>` : ''}
    <div class="fen-div"></div>
  </div>
  ${d.items
    .map(
      (it, i) => `
  <div class="fen-item">
    <div class="fen-txt">
      <span class="fen-no">${pad2(i + 1)}</span>
      <h3 class="fen-h">${richSafe(it.heading)}</h3>
      ${it.desc ? `<p class="fen-d">${richSafe(it.desc)}</p>` : ''}
    </div>
    ${media(it.image, 'fen-band', '특장점 이미지')}
  </div>`,
    )
    .join('')}
</section>`,
})
