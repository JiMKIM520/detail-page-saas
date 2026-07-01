/** 블록 변형을 standalone HTML로 렌더(시각 검증용). 사용: tsx scripts/preview-block.ts */
import { writeFileSync } from 'node:fs'
import { renderPage, deriveTokens } from '../agents/templates/blocks'

const OUT = '/private/tmp/claude-501/-Users-jinman-Desktop-Projects/c6721d8e-b5e9-4289-9352-1b38f8ca898e/scratchpad'
const IMG = 'http://localhost:8899/heroimg.png'
const tokens = deriveTokens('cobalt-premium', undefined, { tintBackground: false })

function one(variantId: string, data: unknown, file: string): void {
  const { html } = renderPage({
    meta: { product: '코코댕 순순스틱', category: '반려동물', styleDirection: 'premium' },
    tokens,
    blocks: [{ variantId, data }],
  })
  writeFileSync(`${OUT}/${file}.html`, html)
}

one('stats-zigzag', {
  eyebrow: '누적 판매량',
  headline: '<em>10,000</em>건!',
  symbolImage: IMG,
  rows: [
    { label: '만족도 평점', value: '<em>4.9</em>점 / 5점', image: IMG },
    { label: '누적 리뷰수', value: '<em>2,300</em>건+', image: IMG },
    { label: '재구매율', value: '<em>87</em>%', image: IMG },
  ],
}, 'preview-stats-zigzag')

console.log('written: preview-stats-zigzag.html')
