/**
 * 블록 컴포저 전체 검증 — 식품 라이브러리 전 아키타입(14블록) 1페이지 조립.
 * 검증용(프로덕션 아님). 실행: npx tsx scripts/blocks-full-demo.ts
 */
import { writeFileSync } from 'node:fs'
import { renderPage, warmPlayful, type PageSpec } from '../agents/templates/blocks'

const IMG = (n: string): string => `file:///tmp/spike/${n}`

const spec: PageSpec = {
  meta: { product: '소금빵', category: 'food', styleDirection: 'warm-playful' },
  tokens: warmPlayful,
  blocks: [
    { variantId: 'hero-centered', data: { badge: '베이커리 맛집', title: '겉바속촉 <span class="em">소금빵</span>', sub: '버터향 가득, <span class="em">겉은 바삭 속은 촉촉!</span>', heroImage: IMG('hero.png'), bubble: '갓 구운 그대로!', caption: '* 본 이미지는 연출컷입니다.', brand: '데일리 베이커리' } },
    { variantId: 'recommend-dark', data: { floatImage: IMG('plated.png'), title: '이런 분께 <span class="em">추천</span>드려요!', en: 'We recommend it to you', image: IMG('overhead.png'), ribbon: 'BEST' } },
    { variantId: 'checklist-checks', data: { title: '이런 분께 <span class="em">딱이에요</span>', items: [ { text: '집에서 <span class="em">카페 분위기</span> 내고 싶은 분' }, { text: '아이 <span class="em">간식</span>으로 든든한 빵 찾으시는 분' }, { text: '<span class="em">선물용</span> 베이커리 박스 필요하신 분' }, { text: '아침마다 <span class="em">갓 구운 빵</span> 즐기고 싶은 분', star: true } ] } },
    { variantId: 'strip-band', data: { text: 'DAILY BAKERY' } },
    { variantId: 'checkpoint-rows', data: { title: '한 눈에 보는 <span class="em">체크포인트!</span>', pill: 'Check Point', items: [ { icon: 'wheat', text: '<span class="em">프랑스산 고메버터</span>만 사용한 진한 풍미' }, { icon: 'drop', text: '<span class="em">매일 아침 직접 구운</span> 당일 생산' }, { icon: 'clock', text: '<span class="em">3분 데우면</span> 갓 구운 식감 그대로' }, { icon: 'badge', text: '<span class="em">수제 인증</span> 위생 생산 시설' }, { icon: 'snow', text: '<span class="em">냉동 보관</span>으로 언제든 간편하게' } ], photo: IMG('overhead.png') } },
    { variantId: 'point-bubble', data: { label: '포인트 1', title: '소금빵의 기준은 <span class="em">버터다</span>', image: IMG('cross.png'), bubbleTop: '버터가 가득!', bubbleBottom: '겉은 바삭!', lead: '진짜 버터를 아낌없이 넣어야 풍미가 살아납니다.<br><span class="em">겉은 바삭하고 속은 버터로 촉촉한</span> 소금빵을 만나보세요.' } },
    { variantId: 'feature-seal', data: { image: IMG('plated.png'), sealMain: '수제', sealSub: 'SINCE 2018' } },
    { variantId: 'reason-question', data: { question: '소금빵이 <span class="em">커피와 찰떡궁합</span>인<br>이유는 무엇일까요?' } },
    { variantId: 'equation-visual', data: { a: { image: IMG('butter.png'), label: '따뜻한 커피' }, b: { image: IMG('plated.png'), label: '소금빵' }, c: { image: IMG('hero.png'), label: '완벽한 한 끼' }, quote: '“ <span class="em">단짠의 황금밸런스</span>, 한 입이면 끝! ”' } },
    { variantId: 'callout-banner', data: { big: '혼자여도 부담없는 양으로<br><span class="em">여유로운 티타임</span>을 즐기세요', small: '착한 가격으로 매일 만나는 갓 구운 소금빵' } },
    { variantId: 'story-pair', data: { label: '포인트 2', title: '반죽부터 굽기까지 <span class="em">직접</span>', images: [IMG('overhead.png'), IMG('hero.png'), IMG('cross.png')], lead: '데일리 베이커리는 <span class="em">매일 새벽 직접 반죽하고 구워</span><br>믿고 먹을 수 있는 빵을 만들어갑니다.' } },
    { variantId: 'cert-rosette', data: { title: '정성껏 구운 <span class="em">수제 소금빵</span>', desc: '위생적인 작업 환경을 <span class="em">최우선</span>으로 생각하며<br>깨끗한 시설에서 <span class="em">수제로 정성스레</span> 만들었습니다.', rosetteLine1: 'HAND', rosetteLine2: 'MADE', rosetteSub: '수제 베이커리', image: IMG('plated.png') } },
    { variantId: 'compare-cooking', data: { label: '포인트 3', title: '쉬운 조리 방법 <span class="em">간편하게 데우기</span>', left: { tag: '겉바속촉!', icon: 'fryer', name: '에어프라이어', steps: [{ text: '냉동 상태의 소금빵을 넣어주세요.' }, { text: '<span class="em">160℃에 4~5분</span> 데우면 겉이 바삭해져요.' }] }, right: { tag: '노릇노릇!', icon: 'oven', name: '오븐', steps: [{ text: '오븐을 <span class="em">180℃로 예열</span>해 주세요.' }, { text: '소금빵을 넣고 <span class="em">8~10분</span> 구워주세요.' }] }, note: '해동 없이도 <span class="em">갓 구운 풍미</span> 그대로!' } },
    { variantId: 'closing-mood', data: { bgImage: IMG('hero.png'), title: '소금빵과 <span class="em">커피 한 잔</span>', sub: '여유로운 시간을 적셔보다.' } },
  ],
}

const r = renderPage(spec)
writeFileSync('/tmp/spike/full15.html', r.html)
console.log('full page:', r.blockCount, 'blocks,', r.usedVariants.length, 'variants ->', '/tmp/spike/full15.html')
console.log('variants:', r.usedVariants.join(', '))
