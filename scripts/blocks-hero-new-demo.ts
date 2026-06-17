/**
 * 신규 히어로 변형(hero-points, hero-arch) + 신규 프리셋(cobalt-premium, sand-luxury) 시각 검증용 데모.
 * 실행: node_modules/.bin/tsx scripts/blocks-hero-new-demo.ts → /tmp/spike/hero-new.html
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { renderPage, cobaltPremium, sandLuxury } from '../agents/templates/blocks/index'

const points = [
  { icon: 'badge' as const, label: 'Point 01', desc: '엄선한 원재료로<br>차별화된 품질' },
  { icon: 'star' as const, label: 'Point 02', desc: '검증된 후기와<br>높은 재구매율' },
  { icon: 'check' as const, label: 'Point 03', desc: '꼼꼼한 검수로<br>믿을 수 있는' },
]

const cobalt = renderPage({
  meta: { product: '데모', category: '전자제품', styleDirection: 'cobalt-premium' },
  tokens: cobaltPremium,
  blocks: [
    {
      variantId: 'hero-points',
      data: {
        brand: 'BRAND LOGO',
        sub: '제품 설명을 한 줄로 써주세요',
        title: '제품명을 <span class="em">써주세요</span>',
        points,
      },
    },
  ],
})

const sand = renderPage({
  meta: { product: '데모', category: '뷰티', styleDirection: 'sand-luxury' },
  tokens: sandLuxury,
  blocks: [
    {
      variantId: 'hero-arch',
      data: {
        brand: 'BRAND LOGO',
        title: '제품명을 <span class="em">써주세요</span>',
        sub: '제품 설명을 한 줄로 써주세요',
        en: 'PRODUCT NAME',
        points: points.slice(0, 3),
      },
    },
  ],
})

mkdirSync('/tmp/spike', { recursive: true })
writeFileSync('/tmp/spike/hero-points-cobalt.html', cobalt.html)
writeFileSync('/tmp/spike/hero-arch-sand.html', sand.html)
console.log('cobalt usedVariants:', cobalt.usedVariants, 'blockCount:', cobalt.blockCount)
console.log('sand usedVariants:', sand.usedVariants, 'blockCount:', sand.blockCount)
console.log('→ /tmp/spike/hero-points-cobalt.html , /tmp/spike/hero-arch-sand.html')
