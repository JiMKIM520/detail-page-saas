/**
 * Blocks Composer 결정론적 조립/검증 테스트 (LLM 호출 없음).
 * assemblePageSpec → renderPage 경로가 유효 출력은 통과, 잘못된 출력은 throw 하는지 검증.
 * 실행: npx tsx scripts/blocks-composer-test.ts
 */
import { assemblePageSpec, type ComposerOutput } from '../agents/blocks-composer'
import { renderPage } from '../agents/templates/blocks'

let pass = 0
function assert(cond: boolean, msg: string): void {
  if (!cond) {
    console.error('  ✗ FAIL:', msg)
    throw new Error(`assertion failed: ${msg}`)
  }
  pass++
  console.log('  ✓', msg)
}

const validOut: ComposerOutput = {
  meta: { product: '소금빵', category: 'food', styleDirection: 'warm-playful' },
  presetKey: 'warm-playful',
  blocks: [
    { variantId: 'hero-centered', data: { badge: '베이커리', title: '겉바속촉 <span class="em">소금빵</span>', sub: '버터 가득', brand: '데일리 베이커리' } },
    { variantId: 'checkpoint-rows', data: { title: '<span class="em">체크포인트</span>', pill: 'Check Point', items: [{ icon: 'wheat', text: '버터' }, { icon: 'drop', text: '촉촉' }, { icon: 'clock', text: '3분' }] } },
    { variantId: 'compare-cooking', data: { title: '조리 <span class="em">간편</span>', left: { icon: 'fryer', name: '에어프라이어', steps: [{ text: '160℃' }] }, right: { icon: 'oven', name: '오븐', steps: [{ text: '180℃' }] } } },
    { variantId: 'closing-mood', data: { title: '소금빵과 <span class="em">커피</span>', sub: '여유로운 시간' } },
  ],
}

console.log('[1] 유효 출력 → 조립/렌더')
const spec = assemblePageSpec(validOut, ['#5C4A32', '#C0392B'])
const r = renderPage(spec)
assert(r.blockCount === 4, 'blockCount === 4')
assert(r.html.includes('<section'), 'HTML에 <section> 포함')
assert(r.html.includes('<!DOCTYPE html>'), '완성 문서')
assert(spec.tokens.accent.toLowerCase() === '#c0392b', '브랜드색 → accent 토큰 도출')
assert(spec.tokens.fontDisplay.includes('Black Han Sans'), 'warm-playful 프리셋 폰트')

console.log('[2] 알 수 없는 variantId → throw')
let t1 = false
try { renderPage(assemblePageSpec({ ...validOut, blocks: [{ variantId: 'does-not-exist', data: {} }] })) } catch { t1 = true }
assert(t1, '미등록 변형은 renderPage가 throw')

console.log('[3] 잘못된 슬롯 데이터(필수 누락) → throw')
let t2 = false
try { renderPage(assemblePageSpec({ ...validOut, blocks: [{ variantId: 'hero-centered', data: { brand: 'x' } }] })) } catch { t2 = true } // title 누락
assert(t2, '필수 슬롯 누락은 renderPage가 throw')

console.log('[4] 에디토리얼 프리셋 토큰')
const specB = assemblePageSpec({ ...validOut, presetKey: 'modern-editorial' })
assert(specB.tokens.fontDisplay.includes('Gowun Batang'), 'modern-editorial 프리셋 명조')

console.log(`\nALL COMPOSER ASSEMBLY TESTS PASSED (${pass} assertions)`)
