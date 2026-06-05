/**
 * 식품 슬롯 템플릿 품질 검증용 — 소금빵(스타일링샷 5장 보유) 샘플 데이터로 렌더.
 * 사용: env -u ANTHROPIC_API_KEY node_modules/.bin/tsx scripts/render-food-sample.ts
 * 출력: /tmp/food-proof/sogeumppang.html (render-html.ts로 PNG화)
 */
import fs from 'fs'
import { renderFoodDetail, type FoodDetailData } from './food-template'

const B = 'https://uddyemjqoxqttzpminwa.supabase.co/storage/v1/object/public/designs/projects/c0ff7994-4c13-4bbf-9ddd-d621bcfd5096/styling_real'

const data: FoodDetailData = {
  brand: '쌀과밀',
  product: '겉바속촉 소금빵',
  usp: '프랑스산 고메버터를 켜켜이 접어 넣고 천일염을 올려 구운 진짜 소금빵. 갓 구운 그 온도를 그대로 식탁 위에.',
  badge: '11번가 단독',
  heroEyebrow: 'Daily Baked · Salt Bread',
  pills: ['프랑스산 고메버터', '겉바속촉 이중식감', '천일염 토핑', '매일 당일생산'],
  intro: { headline: '겉은 <span class="em">바삭</span>, 속은 <span class="em">촉촉</span>.<br>매일 아침의 작은 호사.', body: '컨베이어 벨트가 아닌 베이커의 두 손에서 만들어집니다. 새벽 4시, 반죽을 접고 또 접어 켜켜이 버터를 넣고, 충분히 발효시켜 오븐에서 꺼낸 단 하나의 소금빵.' },
  ingredientsTitle: '정직하게, 좋은 것만',
  ingredients: [
    { name: '프랑스산 고메버터', desc: '발효버터 15%' },
    { name: '국산 쌀가루', desc: '쌀가루 40%' },
    { name: '우리밀', desc: '밀가루 30%' },
    { name: '게랑드 천일염', desc: '천일염 토핑' },
    { name: '천연 발효종', desc: '저온 장시간 발효' },
    { name: '무첨가', desc: '방부제·색소 무첨가' },
  ],
  ingredientsNote: '※ 밀·우유 함유. 메밀·대두·견과류 사용 시설에서 제조',
  checkpoints: [
    { title: '프랑스산 고메버터를 아낌없이', desc: '일반 가공버터가 아닌 발효버터만 켜켜이 접어 넣어 진한 풍미와 고소함을 완성했습니다.' },
    { title: '겉바속촉, 그 완벽한 이중 식감', desc: '겉은 얇고 바삭하게, 속은 공기층을 머금어 촉촉하게. 식어도 결이 살아있습니다.' },
    { title: '오늘 구운 빵은 오늘 발송', desc: '냉동 재고가 아닌, 주문에 맞춰 매일 아침 직접 구워 당일 발송합니다.' },
    { title: '천일염이 만드는 단짠 균형', desc: '표면에 올린 게랑드 천일염이 단맛과 짠맛의 완벽한 균형을 완성합니다.' },
  ],
  howToEat: [
    { title: '에어프라이어 3분 (추천)', desc: '170℃에서 3분 데우면 갓 구운 바삭함이 그대로 살아납니다. 겉은 더 바삭, 속은 더 촉촉하게.' },
    { title: '실온 그대로', desc: '버터 풍미를 가장 진하게 느끼고 싶다면 실온 30분 후 그대로. 커피 한 잔과 완벽한 아침.' },
  ],
  whenToEat: [
    { title: '바쁜 아침의 한 끼', desc: '간편하게 챙기는 든든하고 고소한 아침 식사' },
    { title: '오후의 커피 타임', desc: '진한 커피와 곁들이는 달콤·고소한 티타임 간식' },
    { title: '사무실 깔끔한 점심', desc: '부담 없이 한 끼를 해결하고 싶은 날' },
  ],
  spec: [
    { k: '상품명', v: '쌀과밀 겉바속촉 소금빵' },
    { k: '중량 · 크기', v: '개당 약 70g · 길이 약 14cm' },
    { k: '원재료', v: '쌀가루 40%, 밀가루 30%, 프랑스산 고메버터 15%, 천일염 2%, 그 외 13%' },
    { k: '보관 방법', v: '실온 2일 / 냉동 30일 (냉동 후 에어프라이어 데움 권장)' },
    { k: '알레르기', v: '밀, 우유 함유' },
    { k: '제조', v: '주문 후 매일 당일 생산 / 자가품질검사 완료' },
  ],
  trust: {
    score: '4.9',
    count: '누적 구매평 1,240+ · 재구매율 38%',
    certs: ['HACCP 인증 시설', '당일 생산', '무방부제'],
    reviews: [
      { who: '김O경', stars: '★★★★★', text: '에어프라이어에 3분 돌렸더니 진짜 갓 구운 빵이에요. 버터 향이 가득해서 매일 아침 먹습니다.', tag: '에어프라이어 추천' },
      { who: '이O희', stars: '★★★★★', text: '소금빵 좋아해서 여기저기 사봤는데 버터 풍미가 확실히 다르네요. 재구매합니다.', tag: '재구매' },
      { who: '박O수', stars: '★★★★☆', text: '당일 생산이라 확실히 신선해요. 선물용으로도 포장이 깔끔해서 좋았습니다.', tag: '선물용' },
    ],
  },
  lineup: [
    { name: '쌀과밀 통밀 소금빵', tag: 'NEW' },
    { name: '쌀과밀 흑임자 소금빵', tag: 'BEST' },
    { name: '쌀과밀 플레인 베이글', tag: '' },
    { name: '쌀과밀 버터 스콘', tag: '' },
  ],
  cta: { eyebrow: 'Freshly Baked Today', headline: '오늘 구운 소금빵,<br>지금 만나보세요.', sub: '매일 아침의 작은 호사를, 당신의 식탁으로.', button: '지금 구매하기', note: '· 오늘 생산분 한정 · 당일 발송' },
  images: {
    hero: `${B}/hero_dark_closeup.png`,
    sensory: `${B}/cross_section.png`,
    ingredient: `${B}/overhead_minimal.png`,
    howToEat: [`${B}/plated_morning.png`, `${B}/butter_pairing.png`],
    whenToEat: `${B}/plated_morning.png`,
    lineup: [`${B}/overhead_minimal.png`, `${B}/butter_pairing.png`, `${B}/plated_morning.png`, `${B}/cross_section.png`],
  },
  tokens: { primary: '#5C4A32', accent: '#C0392B', cream: '#F8F3EC', ink: '#211C19' },
}

fs.mkdirSync('/tmp/food-proof', { recursive: true })
fs.writeFileSync('/tmp/food-proof/sogeumppang.html', renderFoodDetail(data))
console.log('✅ /tmp/food-proof/sogeumppang.html 생성')
