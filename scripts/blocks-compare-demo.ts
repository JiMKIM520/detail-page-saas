/** compare-beforeafter 데모 — 충실도 시각검증(sand-luxury). */
import { mkdirSync, writeFileSync } from 'node:fs'
import { renderPage, sandLuxury } from '../agents/templates/blocks/index'

const r = renderPage({
  meta: { product: '데모', category: '식품', styleDirection: 'sand-luxury' },
  tokens: sandLuxury,
  blocks: [
    {
      variantId: 'compare-beforeafter',
      data: {
        title: '왜 특별할까요?',
        subtitle: '비교 혹은 비포&애프터 효과를 써주세요',
        rows: [
          { before: '일반 빵은 시간이 지나면 퍽퍽해집니다', after: '갓 구운 <span class="em">결과 향</span>이 살아있습니다' },
          { before: '버터 향이 약하고 느끼합니다', after: '고메버터의 <span class="em">깊은 풍미</span>' },
          { before: '단맛이 과해 물립니다', after: '천일염으로 <span class="em">은은한 단짠</span>' },
        ],
        closer: '우리 제품이 특별한 이유는 <span class="em">‘이것’</span> 때문!',
      },
    },
  ],
})

mkdirSync('/tmp/spike/cmp', { recursive: true })
writeFileSync('/tmp/spike/cmp/show.html', r.html)
console.log('blocks:', r.usedVariants.join(', '), 'len:', r.html.length)
