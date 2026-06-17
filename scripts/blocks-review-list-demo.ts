/** review-list 데모 — 충실도 시각검증(sand-luxury). */
import { mkdirSync, writeFileSync } from 'node:fs'
import { renderPage, sandLuxury } from '../agents/templates/blocks/index'

const r = renderPage({
  meta: { product: '데모', category: '식품', styleDirection: 'sand-luxury' },
  tokens: sandLuxury,
  blocks: [
    {
      variantId: 'review-list',
      data: {
        title: '고객들의 극찬!',
        subtitle: '실제 구매 후기를 만나보세요',
        reviews: [
          { text: '아침마다 갓 구운 빵을 받는 기분이에요. <span class="em">버터 향</span>이 진짜 달라요.', author: '김O영', rating: 5 },
          { text: '겉바속촉이 이런 거구나 싶었어요. 단짠 밸런스가 최고.', author: '이O준', rating: 5 },
          { text: '선물했더니 다들 어디서 샀냐고 물어봐요.', author: '박O서', rating: 5 },
        ],
        closer: '이미 <span class="em">2,400명</span>의 고객이 인정했습니다',
      },
    },
  ],
})

mkdirSync('/tmp/spike/rev', { recursive: true })
writeFileSync('/tmp/spike/rev/show.html', r.html)
console.log('blocks:', r.usedVariants.join(', '), 'len:', r.html.length)
