/**
 * feature-editorial(템플릿 충실 재현) 단독 렌더 — feat_08 원본과 대조용.
 * 실행: node_modules/.bin/tsx scripts/blocks-feature-editorial-demo.ts → /tmp/spike/fe/page.html
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { renderPage, cobaltPremium } from '../agents/templates/blocks/index'

const r = renderPage({
  meta: { product: '데모', category: '식품', styleDirection: 'cobalt-premium' },
  tokens: cobaltPremium,
  blocks: [
    {
      variantId: 'feature-editorial',
      data: {
        title: '제품 특장점',
        subtitle: '우리 제품이 특별한 이유를 직접 체험해보세요',
        items: [
          { heading: 'Subtitle을 입력해주세요', desc: '제품의 특장점을 입력해주세요' },
          { heading: 'Subtitle을 입력해주세요', desc: '제품의 특장점을 입력해주세요' },
          { heading: 'Subtitle을 입력해주세요', desc: '제품의 특장점을 입력해주세요' },
        ],
      },
    },
  ],
})

mkdirSync('/tmp/spike/fe', { recursive: true })
writeFileSync('/tmp/spike/fe/page.html', r.html)
console.log('blocks:', r.usedVariants, 'len:', r.html.length, '→ /tmp/spike/fe/page.html')
