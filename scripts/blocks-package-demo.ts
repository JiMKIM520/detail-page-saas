/** package-list 데모 — 충실도 시각검증(sand-luxury). */
import { mkdirSync, writeFileSync } from 'node:fs'
import { renderPage, sandLuxury } from '../agents/templates/blocks/index'

const r = renderPage({
  meta: { product: '데모', category: '식품', styleDirection: 'sand-luxury' },
  tokens: sandLuxury,
  blocks: [
    {
      variantId: 'package-list',
      data: {
        title: "WHAT'S FOR YOU?",
        subtitle: '여러분을 위한 상품 패키지입니다',
        packages: [
          { name: '소금빵 4입', desc: '갓 구운 소금빵 4개 구성', priceOriginal: '16,000원', price: '12,900원', best: true },
          { name: '소금빵 8입', desc: '온 가족이 즐기는 8개 구성', priceOriginal: '32,000원', price: '23,900원' },
          { name: '선물 세트', desc: '소금빵 8입 + 잼 + 포장', priceOriginal: '42,000원', price: '34,900원' },
        ],
      },
    },
  ],
})

mkdirSync('/tmp/spike/pkg', { recursive: true })
writeFileSync('/tmp/spike/pkg/show.html', r.html)
console.log('blocks:', r.usedVariants.join(', '), 'len:', r.html.length)
