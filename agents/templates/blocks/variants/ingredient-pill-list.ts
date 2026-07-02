/** INGREDIENT 아키타입 추가 변형(템플릿 충실 재현): 04_원료소개 — 필/캡슐형 행 카드.
 *  ingredient-pill-list: 라이트 배경 + 중앙정렬 헤더 + pill 모양 카드 4개(원형이미지 좌 + 라벨·설명 우)
 *  + 하단 accent 그라데이션 페이드 + 클로저 카피. 깔끔 라이트 프리미엄. */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  eyebrow: z.string().min(1).optional(),       // 예: "INGRIDIENTS" (영문 레이블)
  title: z.string().min(1),                    // 대형 한국어 제목 (em,br)
  subtitle: z.string().min(1).optional(),      // 한 줄 서브 카피
  items: z
    .array(
      z.object({
        image: z.string().optional(),          // 원형 이미지 (url)
        label: z.string().min(1),             // 원료명 (accent 색, em 가능)
        desc: z.string().min(1).optional(),   // 원료 설명 (em,br)
      }),
    )
    .min(2)
    .max(4),
  closer: z.string().min(1).optional(),        // 그라데이션 하단 클로저 (em,br)
})
type Data = z.infer<typeof schema>

export const ingredientPillList = defineBlock<Data>({
  id: 'ingredient-pill-list',
  archetype: 'ingredient',
  styleTags: ['premium', 'light', 'template', 'pill', 'row-card'],
  imageSlots: 4,
  describe:
    '원료 소개(필/캡슐형 행 카드). 라이트 배경 + 중앙정렬 영문아이브로·대형컬러제목·서브카피 + pill 모양 테두리 카드(원형이미지 좌+라벨·설명 우) 2~4개 + 하단 accent 그라데이션 + 클로저 카피. 깔끔 라이트 프리미엄.',
  schema,
  css: `
.ipl{background:var(--bg);color:var(--ink);padding:60px 48px 0}
.ipl-hd{text-align:center;margin-bottom:36px}
.ipl-eye{display:block;font-size:13px;font-weight:700;letter-spacing:.22em;color:var(--accent);margin-bottom:12px;text-transform:uppercase}
.ipl-title{font-family:var(--font-display);font-weight:800;font-size:58px;letter-spacing:-.02em;line-height:1.1;color:var(--accent)}
.ipl-sub{margin-top:16px;font-size:17px;color:var(--ink-2);line-height:1.6}
.ipl-cards{display:flex;flex-direction:column;gap:20px;margin-bottom:0}
.ipl-card{display:flex;align-items:center;gap:28px;border:2px solid color-mix(in srgb,var(--accent) 30%,transparent);border-radius:999px;padding:18px 32px 18px 20px;background:var(--paper)}
.ipl-img{flex:0 0 110px;width:110px;height:110px;border-radius:50%;object-fit:cover}
.ipl-body{flex:1;min-width:0}
.ipl-label{font-family:var(--font-display);font-weight:800;font-size:22px;color:var(--accent);line-height:1.2;margin-bottom:8px}
.ipl-label .em{color:var(--accent-d)}
.ipl-desc{font-size:15px;color:var(--ink-2);line-height:1.65}
.ipl-desc .em{color:var(--accent);font-weight:700}
.ipl-fade{margin-top:52px;background:linear-gradient(180deg,var(--bg) 0%,color-mix(in srgb,var(--accent) 55%,#fff) 100%);padding:52px 48px 64px;text-align:center}
.ipl-closer{font-family:var(--font-display);font-weight:800;font-size:34px;color:var(--ink);line-height:1.4}
.ipl-closer .em{color:var(--accent)}
`,
  render: (d, { esc, richSafe }) => `
<section class="ipl">
  <div class="ipl-hd">
    ${d.eyebrow ? `<span class="ipl-eye">${esc(d.eyebrow)}</span>` : ''}
    <h2 class="ipl-title">${richSafe(d.title)}</h2>
    ${d.subtitle ? `<p class="ipl-sub">${esc(d.subtitle)}</p>` : ''}
  </div>
  <div class="ipl-cards">
    ${d.items
      .map(
        (it) => `
    <div class="ipl-card">
      ${media(it.image, 'ipl-img', esc(it.label))}
      <div class="ipl-body">
        <div class="ipl-label">${richSafe(it.label)}</div>
        ${it.desc ? `<div class="ipl-desc">${richSafe(it.desc)}</div>` : ''}
      </div>
    </div>`,
      )
      .join('')}
  </div>
  ${
    d.closer
      ? `<div class="ipl-fade"><p class="ipl-closer">${richSafe(d.closer)}</p></div>`
      : ''
  }
</section>`,
})
