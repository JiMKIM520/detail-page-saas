/** 원료 소개 2변형(accent/grid) 데모 — 충실도 시각검증(sand-luxury 웜톤). */
import { mkdirSync, writeFileSync } from 'node:fs'
import { renderPage, sandLuxury } from '../agents/templates/blocks/index'

const r = renderPage({
  meta: { product: '데모', category: '식품', styleDirection: 'sand-luxury' },
  tokens: sandLuxury,
  blocks: [
    {
      variantId: 'ingredient-accent',
      data: {
        subtitle: '우리의 제품은 이런 원료를 사용합니다',
        title: '제품 원료',
        items: [
          { label: '프랑스산 고메버터', desc: '풍미가 깊은 발효버터' },
          { label: '국산 천일염', desc: '은은한 단짠의 비결' },
          { label: '우리밀 반죽', desc: '매일 새벽 직접 반죽' },
        ],
        closer: '이런 좋은 원료를 통해,<br><span class="em">좋은 제품</span>을 제공합니다.',
      },
    },
    {
      variantId: 'ingredient-grid',
      data: {
        eyebrow: 'INGREDIENTS',
        title: '제품 원료',
        subtitle: '우리의 제품은 이런 원료를 사용합니다',
        items: [
          { label: '프랑스산 고메버터', desc: '풍미가 깊은 발효버터' },
          { label: '국산 천일염', desc: '은은한 단짠의 비결' },
          { label: '우리밀 반죽', desc: '매일 새벽 직접 반죽' },
          { label: '천연 발효종', desc: '깊은 풍미와 결' },
        ],
        closer: '좋은 원료가 <span class="em">좋은 맛</span>을 만듭니다',
      },
    },
  ],
})

mkdirSync('/tmp/spike/ingr', { recursive: true })
writeFileSync('/tmp/spike/ingr/show.html', r.html)
console.log('blocks:', r.usedVariants.join(', '), 'len:', r.html.length)
