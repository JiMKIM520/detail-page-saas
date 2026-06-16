/** review 아키타입 파일럿 검증 — 두 변형을 컴포저로 렌더. 실행: npx tsx scripts/blocks-review-demo.ts */
import { writeFileSync } from 'node:fs'
import { renderPage, warmPlayful, modernEditorial, type PageSpec } from '../agents/templates/blocks'

const A: PageSpec = {
  meta: { product: '리뷰', category: 'food' },
  tokens: warmPlayful,
  blocks: [
    {
      variantId: 'review-bubbles',
      data: {
        title: '고객들의 <span class="em">극찬!</span>',
        subtitle: '실제 구매 고객 후기입니다',
        reviews: [
          { text: '겉은 바삭 속은 촉촉, 인생 소금빵이에요!', author: '김**' },
          { text: '아이들이 너무 좋아해서 바로 재구매했어요', author: '이**' },
          { text: '커피랑 같이 먹으니 카페가 따로 없네요', author: '박**' },
        ],
        stat: '우리 상품은 <span class="em">2,400명</span>의 고객이 인정했습니다.',
      },
    },
  ],
}

const B: PageSpec = {
  meta: { product: '리뷰', category: 'food' },
  tokens: modernEditorial,
  blocks: [
    {
      variantId: 'review-cards',
      data: {
        kicker: 'Real Reviews',
        title: '고객이 남긴 <span class="em">진짜 후기</span>',
        summary: { score: '4.9', count: '리뷰 2,418개', stars: 5 },
        reviews: [
          { author: '김**', rating: 5, text: '<span class="em">버터 향</span>이 진하고 식감이 완벽해요.', tag: '재구매' },
          { author: '이**', rating: 5, text: '선물했더니 다들 어디서 샀냐고 물어봐요.' },
          { author: '박**', rating: 4, text: '양도 넉넉하고 배송도 빨랐습니다.' },
        ],
      },
    },
  ],
}

const a = renderPage(A)
const b = renderPage(B)
writeFileSync('/tmp/spike/review-a.html', a.html)
writeFileSync('/tmp/spike/review-b.html', b.html)
console.log('review-bubbles:', a.usedVariants.join(','), '| review-cards:', b.usedVariants.join(','))
