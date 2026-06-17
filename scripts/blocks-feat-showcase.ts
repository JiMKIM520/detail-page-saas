/**
 * 특장점 3변형(editorial/cards/dark) 쇼케이스 — 템플릿 충실도+다양성 시각검증.
 * 실행: node_modules/.bin/tsx scripts/blocks-feat-showcase.ts → /tmp/spike/feat/show.html
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
          { heading: '갓 볶은 <span class="em">신선함</span>', desc: '매일 소량 로스팅으로 향을 지킵니다' },
          { heading: '단일 농장 원두', desc: '추적 가능한 한 곳에서만 수급합니다' },
          { heading: '균일한 분쇄', desc: '향과 추출이 일정하도록 관리합니다' },
        ],
      },
    },
    {
      variantId: 'feature-cards',
      data: {
        title: '제품 특장점',
        subtitle: '부드럽고 깊은 풍미의 비결',
        cards: [
          { heading: '깊은 바디감', desc: '저온 장시간 추출로 묵직한 무게감' },
          { heading: '산미 밸런스', desc: '과하지 않은 산미로 누구나 편하게' },
          { heading: '깔끔한 끝맛', desc: '잡미 없이 떨어지는 클린 피니시' },
        ],
        closer: '한 잔에 담긴 <span class="em">정직한 차이</span>',
      },
    },
    {
      variantId: 'feature-dark',
      data: {
        intro: '우리 제품이 특별한 이유를 직접 체험해보세요',
        title: '제품 특장점',
        items: [
          { heading: '프리미엄 생두', desc: '상위 등급 스페셜티만 선별합니다' },
          { heading: '정밀 로스팅', desc: '원두별 프로파일로 최적점에서 정지' },
          { heading: '밀봉 신선포장', desc: '아로마 밸브로 향을 가둡니다' },
        ],
        closer: '매일 마셔도 <span class="em">질리지 않는 깊이</span>',
      },
    },
  ],
})

mkdirSync('/tmp/spike/feat', { recursive: true })
writeFileSync('/tmp/spike/feat/show.html', r.html)
console.log('blocks:', r.usedVariants.join(', '), 'len:', r.html.length)
