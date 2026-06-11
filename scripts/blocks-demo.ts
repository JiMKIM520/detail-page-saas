/**
 * 블록 컴포저 데모 — Style A / Style B PageSpec을 컴포저로 렌더해 HTML 파일로 출력.
 * 검증용 스크립트 (프로덕션 코드 아님). 실행: npx tsx scripts/blocks-demo.ts
 */
import { writeFileSync } from 'node:fs'
import { renderPage, warmPlayful, modernEditorial, type PageSpec } from '../agents/templates/blocks'

const IMG = (n: string): string => `file:///tmp/spike/${n}`

const specA: PageSpec = {
  meta: { product: '소금빵', category: 'food', styleDirection: 'warm-playful' },
  tokens: warmPlayful,
  blocks: [
    {
      variantId: 'hero-centered',
      data: {
        badge: '베이커리 맛집',
        title: '겉바속촉 <span class="em">소금빵</span>',
        sub: '버터향 가득, <span class="em">겉은 바삭 속은 촉촉!</span>',
        heroImage: IMG('hero.png'),
        bubble: '갓 구운 그대로!',
        caption: '* 본 이미지는 연출컷입니다.',
        brand: '데일리 베이커리',
      },
    },
    {
      variantId: 'checkpoint-rows',
      data: {
        title: '한 눈에 보는 <span class="em">체크포인트!</span>',
        pill: 'Check Point',
        items: [
          { icon: 'wheat', text: '<span class="em">프랑스산 고메버터</span>만 사용한 진한 풍미' },
          { icon: 'drop', text: '<span class="em">매일 아침 직접 구운</span> 당일 생산' },
          { icon: 'clock', text: '<span class="em">3분 데우면</span> 갓 구운 식감 그대로' },
          { icon: 'badge', text: '<span class="em">수제 인증</span> 위생 생산 시설' },
          { icon: 'snow', text: '<span class="em">냉동 보관</span>으로 언제든 간편하게' },
        ],
        photo: IMG('overhead.png'),
      },
    },
    {
      variantId: 'point-bubble',
      data: {
        label: '포인트 1',
        title: '소금빵의 기준은 <span class="em">버터다</span>',
        image: IMG('cross.png'),
        bubbleTop: '버터가 가득!',
        bubbleBottom: '겉은 바삭!',
        lead: '진짜 버터를 아낌없이 넣어야 풍미가 살아납니다.<br><span class="em">겉은 바삭하고 속은 버터로 촉촉한</span> 소금빵을 만나보세요.',
      },
    },
    {
      variantId: 'callout-banner',
      data: {
        big: '혼자여도 부담없는 양으로<br><span class="em">여유로운 티타임</span>을 즐기세요',
        small: '착한 가격으로 매일 만나는 갓 구운 소금빵',
      },
    },
    {
      variantId: 'compare-cooking',
      data: {
        label: '포인트 2',
        title: '쉬운 조리 방법 <span class="em">간편하게 데우기</span>',
        left: {
          tag: '겉바속촉!',
          icon: 'fryer',
          name: '에어프라이어',
          steps: [{ text: '냉동 상태의 소금빵을 넣어주세요.' }, { text: '<span class="em">160℃에 4~5분</span> 데우면 겉이 바삭해져요.' }],
        },
        right: {
          tag: '노릇노릇!',
          icon: 'oven',
          name: '오븐',
          steps: [{ text: '오븐을 <span class="em">180℃로 예열</span>해 주세요.' }, { text: '소금빵을 넣고 <span class="em">8~10분</span> 구워주세요.' }],
        },
        note: '해동 없이도 <span class="em">갓 구운 풍미</span> 그대로!',
      },
    },
    {
      variantId: 'closing-mood',
      data: { bgImage: IMG('hero.png'), title: '소금빵과 <span class="em">커피 한 잔</span>', sub: '여유로운 시간을 적셔보다.' },
    },
  ],
}

const specB: PageSpec = {
  meta: { product: '소금빵', category: 'food', styleDirection: 'modern-editorial' },
  tokens: modernEditorial,
  blocks: [
    {
      variantId: 'hero-editorial',
      data: {
        kicker: 'Daily Bakery · No.07',
        title: '겉은 바삭하게,<br>속은 <span class="em">버터로 촉촉</span>하게',
        lead: '프랑스산 고메버터를 아낌없이 넣어 매일 아침 직접 구워낸 소금빵. 한 입에 퍼지는 버터의 결을 그대로 담았습니다.',
        heroImage: IMG('hero.png'),
        figNo: 'FIG. 01',
      },
    },
    { variantId: 'feature-fullbleed', data: { image: IMG('cross.png'), kicker: 'The Inside', title: '결을 가르면 흐르는 버터' } },
    {
      variantId: 'checkpoint-grid',
      data: {
        kicker: "Why It's Different",
        title: '소금빵을 고르는 네 가지 기준',
        items: [
          { no: '01', title: '프랑스산 고메버터', desc: '마가린 대신 진짜 버터만 사용해 풍미의 깊이가 다릅니다.' },
          { no: '02', title: '매일 새벽 직접 제빵', desc: '당일 반죽·당일 생산 원칙으로 가장 신선한 상태로 보냅니다.' },
          { no: '03', title: '3분이면 갓 구운 식감', desc: '에어프라이어에 잠시 데우면 겉바속촉이 그대로 살아납니다.' },
          { no: '04', title: '수제 위생 생산 시설', desc: '깨끗한 작업 환경에서 한 알 한 알 정성껏 구워냅니다.' },
        ],
      },
    },
    {
      variantId: 'statement-serif',
      data: { quote: '“ 좋은 버터와 정직한 시간만이<br><span class="em">제대로 된 소금빵</span>을 만듭니다. ”', by: 'Daily Bakery, since 2018' },
    },
    {
      variantId: 'spec-table',
      data: {
        kicker: 'Product Detail',
        title: '제품 상세 정보',
        rows: [
          { k: '구성', v: '소금빵 <span class="em">6개입</span> (개당 약 70g)' },
          { k: '주원료', v: '밀가루, <span class="em">프랑스산 고메버터</span>, 천일염, 우유' },
          { k: '보관 방법', v: '냉동 보관 (−18℃ 이하)' },
          { k: '조리 방법', v: '에어프라이어 160℃ <span class="em">4~5분</span> / 오븐 180℃ 8~10분' },
          { k: '배송', v: '냉동 택배 · 주문 후 평균 2일 이내 출고' },
        ],
      },
    },
    {
      variantId: 'closing-light',
      data: { kicker: 'Good Morning', title: '갓 구운 하루의 <span class="em">시작</span>', sub: '따뜻한 커피 한 잔과 소금빵으로 여는 오늘의 아침.', cta: '지금 만나보기' },
    },
  ],
}

const a = renderPage(specA)
const b = renderPage(specB)
writeFileSync('/tmp/spike/compose-a.html', a.html)
writeFileSync('/tmp/spike/compose-b.html', b.html)
console.log('Style A:', a.blockCount, 'blocks,', a.usedVariants.length, 'variants ->', '/tmp/spike/compose-a.html')
console.log('Style B:', b.blockCount, 'blocks,', b.usedVariants.length, 'variants ->', '/tmp/spike/compose-b.html')
