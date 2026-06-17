/** Figma 신규 아키타입 배치 검증 — faq/shipping/stats/gallery/banner 컴포저 렌더.
 *  실행: npx tsx scripts/blocks-figma-batch-demo.ts */
import { writeFileSync } from 'node:fs'
import { renderPage, warmPlayful, type PageSpec } from '../agents/templates/blocks'

const IMG = (n: string): string => `file:///tmp/spike/${n}`

const spec: PageSpec = {
  meta: { product: 'Figma 신규 아키타입', category: 'food' },
  tokens: warmPlayful,
  blocks: [
    { variantId: 'banner-event', data: { eyebrow: 'SPRING EVENT', title: '봄맞이 <span class="em">이벤트</span>', subtitle: '4.1(화) ~ 4.15(화)' } },
    {
      variantId: 'stats-highlight',
      data: {
        label: '누적 판매량',
        headline: '10,000<span class="em">건!</span>',
        items: [
          { icon: 'star', label: '만족도 평점', value: '<span class="em">4.9 / 5.0</span>' },
          { icon: 'badge', label: '누적 리뷰수', value: '<span class="em">2,418개</span>' },
          { icon: 'check', label: '재구매율', value: '<span class="em">68%</span>' },
        ],
      },
    },
    {
      variantId: 'shipping-info',
      data: {
        label: '배송 안내',
        rows: [
          { title: '산지 직속', desc: '경북 상주 스마트팜에서 <span class="em">수확한 당일</span> 바로 포장되어 배송됩니다.' },
          { title: '택배사', desc: 'CJ대한통운 · 지역에 따라 1~2일 소요' },
        ],
        schedule: [
          { when: '평일 14시 이전 결제', detail: '<span class="em">당일 발송</span>' },
          { when: '14시 이후·주말 결제', detail: '다음 영업일 발송' },
        ],
        note: '※ 신선도를 위해 주말·공휴일에는 출고되지 않습니다.\n※ 농산물 특성상 크기·모양 편차가 있을 수 있습니다.',
      },
    },
    {
      variantId: 'faq-chat',
      data: {
        items: [
          { q: '유통기한이 어떻게 되나요?', a: '제조일로부터 <span class="em">14일</span>이며, 냉장 보관해 주세요.' },
          { q: '배송은 얼마나 걸리나요?', a: '결제 후 평균 1~2일 내 도착합니다.' },
          { q: '교환·환불 되나요?', a: '단순 변심은 수령 후 7일 이내 가능합니다.' },
        ],
      },
    },
    {
      variantId: 'gallery-options',
      data: {
        items: [
          { label: 'OPTION 01', caption: '기본 구성 (6개입)', image: IMG('plated.png') },
          { label: 'OPTION 02', caption: '선물 세트 (12개입)', image: IMG('overhead.png') },
        ],
      },
    },
  ],
}

const r = renderPage(spec)
writeFileSync('/tmp/spike/fig-batch.html', r.html)
console.log('blocks:', r.blockCount, '| variants:', r.usedVariants.join(', '))
