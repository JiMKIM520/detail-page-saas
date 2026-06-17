/** usage-steps 데모 — 충실도 시각검증(sand-luxury). */
import { mkdirSync, writeFileSync } from 'node:fs'
import { renderPage, sandLuxury } from '../agents/templates/blocks/index'

const r = renderPage({
  meta: { product: '데모', category: '식품', styleDirection: 'sand-luxury' },
  tokens: sandLuxury,
  blocks: [
    {
      variantId: 'usage-steps',
      data: {
        title: 'HOW TO USE',
        subtitle: '가장 맛있게 즐기는 방법',
        steps: [
          { icon: 'clock', text: '실온에 <span class="em">10분</span> 두어 결을 살립니다' },
          { icon: 'fire', text: '에어프라이어 <span class="em">160도 3분</span> 데웁니다' },
          { icon: 'drop', text: '버터를 살짝 올려 풍미를 더합니다' },
          { icon: 'heart', text: '따뜻할 때 바로 즐기세요' },
        ],
        closer: '이렇게 스텝 바이 스텝으로 <span class="em">손쉽게 끝!</span>',
      },
    },
  ],
})

mkdirSync('/tmp/spike/use', { recursive: true })
writeFileSync('/tmp/spike/use/show.html', r.html)
console.log('blocks:', r.usedVariants.join(', '), 'len:', r.html.length)
