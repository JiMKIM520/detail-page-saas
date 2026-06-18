/** cert-frame 데모 — 충실도 시각검증(sand-luxury). */
import { mkdirSync, writeFileSync } from 'node:fs'
import { renderPage, sandLuxury } from '../agents/templates/blocks/index'

const r = renderPage({
  meta: { product: '데모', category: '식품', styleDirection: 'sand-luxury' },
  tokens: sandLuxury,
  blocks: [
    {
      variantId: 'cert-frame',
      data: {
        title: 'Certificate',
        subtitle: '우리 제품은 이런 인증을 받았습니다',
        certs: [
          { label: 'HACCP 인증 완료', caption: '식품안전관리인증기준 적합 판정' },
          { label: '자가품질검사 적합', caption: '공인 시험기관 검사 결과 적합' },
        ],
      },
    },
  ],
})

mkdirSync('/tmp/spike/cert', { recursive: true })
writeFileSync('/tmp/spike/cert/show.html', r.html)
console.log('blocks:', r.usedVariants.join(', '), 'len:', r.html.length)
