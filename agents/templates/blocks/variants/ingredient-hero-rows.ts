/** INGREDIENT 아키타입 변형: ingredient-hero-rows (04_원료소개 _01 패턴)
 *  풀폭 히어로 사진 상단 + 서브타이틀·대제목 헤더 + 각 원료를 번호뱃지(좌)·텍스트(중)·썸네일(우) 행으로 나열 + 마무리 문구.
 *  쇼핑몰 상세페이지 원료 소개 정석 패턴(라이트 그라데이션 배경). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const pad2 = (n: number): string => String(n).padStart(2, '0')

const schema = z.object({
  subtitle: z.string().min(1).optional(),       // 상단 소제목 (예: "우리의 제품은 이런 원료를 사용합니다")
  title: z.string().min(1),                      // 대제목 (em,br)
  heroImage: z.string().optional(),              // 풀폭 히어로 이미지 (url)
  items: z
    .array(
      z.object({
        label: z.string().min(1),                // 원료명 (em,br)
        desc: z.string().min(1).optional(),       // 원료 설명 (em,br)
        image: z.string().optional(),             // 원료 썸네일 (url)
      }),
    )
    .min(2)
    .max(6),
  closer: z.string().min(1).optional(),          // 마무리 문구 (em,br)
})
type Data = z.infer<typeof schema>

export const ingredientHeroRows = defineBlock<Data>({
  id: 'ingredient-hero-rows',
  archetype: 'ingredient',
  styleTags: ['light', 'premium', 'template', 'editorial'],
  imageSlots: 7,
  describe:
    '원료 소개(히어로+행 목록). 라이트 그라데이션 배경 + 서브타이틀·대제목 + 풀폭 히어로 이미지 + 번호뱃지·텍스트·썸네일 행 반복 + 마무리. 쇼핑몰 원료 정석 패턴.',
  schema,
  css: `
.ihr{background:color-mix(in srgb,var(--accent) 14%,var(--bg));color:var(--ink)}
.ihr-head{padding:52px 56px 36px;text-align:center}
.ihr-sub{font-size:16px;font-weight:500;color:var(--ink-2);margin-bottom:12px;letter-spacing:.01em}
.ihr-title{font-family:var(--font-display);font-weight:800;font-size:52px;letter-spacing:-.02em;line-height:1.1;color:var(--ink)}
.ihr-title .em{color:var(--accent)}
.ihr-hero{width:100%;height:340px;object-fit:cover;display:block}
.ihr-rows{padding:0}
.ihr-row{display:flex;align-items:stretch;border-bottom:1px solid color-mix(in srgb,var(--line) 60%,transparent);overflow:hidden;box-sizing:border-box;width:100%}
.ihr-row:last-child{border-bottom:none}
.ihr-num{flex:0 0 54px;min-width:0;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--accent) 18%,transparent);border-right:1px solid color-mix(in srgb,var(--accent) 25%,transparent)}
.ihr-badge{font-family:'Cafe24 ClassicType',serif;font-size:20px;font-weight:700;color:var(--accent);letter-spacing:.02em;writing-mode:horizontal-tb}
.ihr-body{flex:1 1 0;min-width:0;padding:22px 24px;display:flex;flex-direction:column;justify-content:center}
.ihr-label{font-family:var(--font-display);font-weight:800;font-size:21px;line-height:1.25;color:var(--ink)}
.ihr-label .em{color:var(--accent)}
.ihr-desc{margin-top:7px;font-size:14px;line-height:1.7;color:var(--ink-2)}
.ihr-desc .em{color:var(--accent);font-weight:700}
.ihr-thumb{flex:0 0 150px;width:150px;max-width:150px;height:120px;object-fit:cover;display:block;align-self:center;overflow:hidden;border-radius:10px;margin:18px 24px 18px 0}
.ihr-thumb.ph{height:120px;flex:0 0 150px;max-width:150px;margin:18px 24px 18px 0;border-radius:10px}
.ihr-closer{padding:44px 56px 52px;text-align:center;font-family:var(--font-display);font-weight:700;font-size:28px;line-height:1.55;color:var(--ink)}
.ihr-closer .em{color:var(--accent);font-weight:800}
`,
  render: (d, { esc, richSafe }) => `
<section class="ihr">
  <div class="ihr-head">
    ${d.subtitle ? `<p class="ihr-sub">${esc(d.subtitle)}</p>` : ''}
    <h2 class="ihr-title">${richSafe(d.title)}</h2>
  </div>
  ${media(d.heroImage, 'ihr-hero', '원료 대표 이미지')}
  <div class="ihr-rows">
    ${d.items
      .map(
        (it, i) => `
    <div class="ihr-row">
      <div class="ihr-num"><span class="ihr-badge">${pad2(i + 1)}</span></div>
      <div class="ihr-body">
        <div class="ihr-label">${richSafe(it.label)}</div>
        ${it.desc ? `<div class="ihr-desc">${richSafe(it.desc)}</div>` : ''}
      </div>
      ${media(it.image, 'ihr-thumb', '원료 이미지')}
    </div>`,
      )
      .join('')}
  </div>
  ${d.closer ? `<div class="ihr-closer">${richSafe(d.closer)}</div>` : ''}
</section>`,
})
