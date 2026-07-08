/** FEATURE 아키타입(템플릿 충실 재현): feature-dark-inset-card.
 *  와디즈 200섹션 "03_특장점" 다크 외부 + 라이트 카드 + 하단 이미지 패턴을 토큰 기반 재구성.
 *  구조: 다크 배경 섹션 → 중앙 제목/서브 → 라이트 인셋 카드(번호 뱃지 행 3개) → 하단 제품 이미지. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const pad2 = (n: number): string => String(n).padStart(2, '0')

const schema = z.object({
  title: z.string().min(1),              // 섹션 대제목 (em,br)
  subtitle: z.string().min(1).optional(), // 헤더 서브카피
  items: z
    .array(
      z.object({
        heading: z.string().min(1),          // 번호 뱃지 옆 볼드 소제목 (em,br)
        desc: z.string().min(1).optional(),  // 소제목 아래 설명 (em,br)
      }),
    )
    .min(2)
    .max(4),
  image: z.string().optional(), // 하단 제품 이미지 (url)
})
type Data = z.infer<typeof schema>

export const featureDarkInsetCard = defineBlock<Data>({
  id: 'feature-dark-inset-card',
  archetype: 'feature',
  styleTags: ['premium', 'dark', 'cobalt', 'card', 'template'],
  imageSlots: 1,
  describe:
    '특장점 다크 인셋 카드. 다크(블랙) 배경 + 중앙 정렬 대제목/서브 + 라이트 퍼리윙클 인셋 카드(번호 뱃지+볼드 소제목+설명 행 반복) + 하단 제품 이미지. 다크 럭셔리.',
  schema,
  css: `
.fdic{background:var(--ink);padding:60px 40px 56px;text-align:center;color:#fff}
.fdic-hd{margin-bottom:36px}
.fdic-title{font-family:var(--font-display);font-weight:800;font-size:52px;color:var(--accent);letter-spacing:-.02em;line-height:1.12}
.fdic-title .em{color:#fff}
.fdic-sub{margin-top:14px;font-size:16px;color:rgba(255,255,255,.65);line-height:1.6}
.fdic-card{background:color-mix(in srgb,var(--accent) 18%,#fff);border-radius:calc(var(--r-scale,1)*20px);padding:36px 32px 28px;text-align:left;margin-bottom:36px}
.fdic-row{display:flex;align-items:flex-start;gap:20px}
.fdic-row + .fdic-row{margin-top:28px;padding-top:28px;border-top:1px solid rgba(0,0,0,.08)}
.fdic-badge{flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;width:44px;height:28px;border-radius:calc(var(--r-scale,1)*4px);background:var(--accent);color:#fff;font-family:var(--font-display);font-weight:800;font-size:15px;letter-spacing:.04em;line-height:1;margin-top:3px}
.fdic-tx{flex:1}
.fdic-h{font-family:var(--font-display);font-weight:800;font-size:22px;color:var(--ink);line-height:1.25}
.fdic-h .em{color:var(--accent)}
.fdic-d{margin-top:8px;font-size:14px;color:var(--ink-2);line-height:1.65}
.fdic-d .em{color:var(--accent);font-weight:700}
.fdic-img-wrap{display:flex;justify-content:center}
.fdic-img{width:84%;border-radius:var(--shape-photo, calc(var(--r-scale,1)*12px));object-fit:cover;display:block}
`,
  render: (d, { esc, richSafe }) => `
<section class="fdic">
  <div class="fdic-hd">
    <h2 class="fdic-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="fdic-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  <div class="fdic-card">
    ${d.items
      .map(
        (it, i) => `
    <div class="fdic-row">
      <span class="fdic-badge">${pad2(i + 1)}</span>
      <div class="fdic-tx">
        <div class="fdic-h">${richSafe(it.heading)}</div>
        ${it.desc ? `<div class="fdic-d">${richSafe(it.desc)}</div>` : ''}
      </div>
    </div>`,
      )
      .join('')}
  </div>
  ${d.image
    ? `<div class="fdic-img-wrap">${media(d.image, 'fdic-img', '제품 이미지')}</div>`
    : media(undefined, 'fdic-img', '제품 이미지')}
</section>`,
})
