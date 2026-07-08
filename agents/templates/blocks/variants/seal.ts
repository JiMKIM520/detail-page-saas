/** FEATURE 아키타입(변형): feature-seal (사진 + 빨간 도장 씰). */
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'

const schema = z.object({
  image: z.string().optional(),
  sealMain: z.string().optional(),
  sealSub: z.string().optional(),
})
type Data = z.infer<typeof schema>

export const featureSeal = defineBlock<Data>({
  id: 'feature-seal',
  archetype: 'feature',
  styleTags: ['warm', 'food', 'bold'],
  imageSlots: 1,
  describe: '강조 사진 우하단에 빨간 원형 도장 씰(품질/수제 인증 느낌). 신뢰감 부여.',
  schema,
  css: `
.fs{position:relative;padding:24px var(--pad-x,56px) 60px;background:var(--bg);text-align:center}
.fs-fig{position:relative;width:480px;margin:0 auto}
.fs-media{width:100%;height:360px;object-fit:cover;border-radius:var(--shape-photo, calc(var(--r-scale,1)*24px));box-shadow:0 20px 40px -20px rgba(42,33,24,.4)}
.fs-stamp{position:absolute;right:-22px;bottom:-22px;width:120px;height:120px;transform:rotate(-12deg)}
`,
  render: (d, { esc }) => {
    // 같은 페이지에 2회 이상 등장해도 textPath가 엉뚱한 path를 추적하지 않도록 렌더별 고유 id.
    const arcId = `bk-sealarc-${Math.random().toString(36).slice(2, 7)}`
    return `
<section class="fs">
  <figure class="fs-fig">
    ${media(d.image, 'fs-media', '강조 컷')}
    <svg class="fs-stamp" viewBox="0 0 120 120">
      <g fill="none" stroke="#C0392B" stroke-width="2.4"><circle cx="60" cy="60" r="54"/><circle cx="60" cy="60" r="44"/></g>
      <path id="${arcId}" d="M60 22 a38 38 0 1 1 -0.1 0" fill="none"/>
      <text font-family="'Black Han Sans', sans-serif" font-size="11.5" fill="#C0392B" letter-spacing="3"><textPath href="#${arcId}" startOffset="2%">★ PREMIUM QUALITY ★ HANDMADE</textPath></text>
      <text x="60" y="58" text-anchor="middle" font-family="'Black Han Sans', sans-serif" font-size="22" fill="#C0392B">${esc(d.sealMain ?? '수제')}</text>
      <text x="60" y="76" text-anchor="middle" font-family="'Pretendard', sans-serif" font-weight="800" font-size="10" fill="#C0392B" letter-spacing="2">${esc(d.sealSub ?? 'SINCE 2018')}</text>
    </svg>
  </figure>
</section>`
  },
})
