/**
 * 조합형 블록 시스템 회귀 스모크 테스트
 *
 * 등록된 모든 블록 변형이 최소 유효 데이터로 renderPage() 호출 시
 * throw 없이 <section>과 <!DOCTYPE을 포함한 HTML을 반환하는지 검증한다.
 *
 * 실행: node_modules/.bin/tsx scripts/blocks-smoke-test.ts
 */

// 블록 시스템 초기화 (registerBlocks 사이드이펙트 포함)
import { renderPage, catalog, warmPlayful } from '../agents/templates/blocks/index'

// ── assert 헬퍼 ───────────────────────────────────────────────────────────────

interface TestResult {
  id: string
  pass: boolean
  error?: string
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`ASSERT: ${message}`)
}

// ── 변형별 최소 유효 data 매핑 ────────────────────────────────────────────────
// 각 스키마의 required 필드만 채우고, optional은 생략한다.
// 아이콘은 ICON_NAMES 중 하나('check'·'wheat'·'drop' 등)를 사용.
// 배열은 .min(N)을 정확히 충족한다.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const VARIANT_DATA: Record<string, any> = {
  // ── hero ──────────────────────────────────────────────────────────────────
  'hero-centered': {
    title: '맛있는 한 끼',
    brand: '브랜드명',
  },
  'hero-editorial': {
    title: '프리미엄 제품',
  },
  'hero-points': {
    brand: '브랜드명',
    title: '제품명을 써주세요',
    points: [
      { icon: 'badge', label: 'Point 01', desc: '차별화 포인트' },
      { icon: 'star', label: 'Point 02', desc: '차별화 포인트' },
      { icon: 'check', label: 'Point 03', desc: '차별화 포인트' },
    ],
  },
  'hero-arch': {
    brand: '브랜드명',
    title: '제품명을 써주세요',
    points: [
      { icon: 'badge', label: 'Point 01', desc: '차별화 포인트' },
      { icon: 'star', label: 'Point 02', desc: '차별화 포인트' },
    ],
  },

  // ── checkpoint ────────────────────────────────────────────────────────────
  'checkpoint-rows': {
    title: '핵심 포인트',
    items: [
      { icon: 'check', text: '첫 번째 항목' },
      { icon: 'wheat', text: '두 번째 항목' },
      { icon: 'drop', text: '세 번째 항목' },
    ],
  },
  'checkpoint-grid': {
    title: '핵심 요약',
    items: [
      { no: '01', title: '첫 번째', desc: '설명입니다' },
      { no: '02', title: '두 번째', desc: '설명입니다' },
    ],
  },

  // ── point / feature ───────────────────────────────────────────────────────
  'point-bubble': {
    title: '포인트 제목',
  },
  'feature-fullbleed': {
    title: '강조 제목',
  },

  // ── callout ───────────────────────────────────────────────────────────────
  'callout-banner': {
    big: '핵심 메시지를 여기에',
  },
  'statement-serif': {
    quote: '브랜드 철학을 담은 인용문',
  },

  // ── compare ───────────────────────────────────────────────────────────────
  'compare-cooking': {
    title: '비교 제목',
    left: {
      icon: 'fryer',
      name: '에어프라이어',
      steps: [{ text: '180°C 예열' }],
    },
    right: {
      icon: 'oven',
      name: '오븐',
      steps: [{ text: '200°C 예열' }],
    },
  },

  // ── spec ──────────────────────────────────────────────────────────────────
  'spec-table': {
    title: '제품 상세 정보',
    rows: [
      { k: '원산지', v: '국내산' },
      { k: '용량', v: '500g' },
    ],
  },

  // ── closing ───────────────────────────────────────────────────────────────
  'closing-mood': {
    title: '마무리 제목',
  },
  'closing-light': {
    title: '마무리 헤드라인',
  },

  // ── recommend ─────────────────────────────────────────────────────────────
  'recommend-dark': {
    title: '추천 제목',
  },

  // ── checklist ─────────────────────────────────────────────────────────────
  'checklist-checks': {
    title: '체크리스트 제목',
    items: [
      { text: '첫 번째 항목' },
      { text: '두 번째 항목' },
    ],
  },

  // ── strip ─────────────────────────────────────────────────────────────────
  'strip-band': {
    text: '브랜드명',
  },

  // ── reason ────────────────────────────────────────────────────────────────
  'reason-question': {
    question: '왜 우리 제품을 선택해야 할까요?',
  },

  // ── feature (seal) ────────────────────────────────────────────────────────
  'feature-seal': {
    // 모든 필드가 optional
  },

  // ── equation ──────────────────────────────────────────────────────────────
  'equation-visual': {
    a: { label: '재료 A' },
    b: { label: '재료 B' },
    c: { label: '결과 C' },
  },

  // ── story ─────────────────────────────────────────────────────────────────
  'story-pair': {
    title: '브랜드 스토리',
    images: [''],  // min(1) 충족, 빈 문자열이면 placeholder로 렌더됨
  },

  // ── cert ──────────────────────────────────────────────────────────────────
  'cert-rosette': {
    title: '인증 제목',
  },

  // ── review ────────────────────────────────────────────────────────────────
  'review-bubbles': {
    title: '고객 리뷰',
    reviews: [
      { text: '정말 맛있어요!', author: '구매자A' },
      { text: '재구매 의사 있어요', author: '구매자B' },
    ],
  },
  'review-cards': {
    title: '고객 후기',
    reviews: [
      { author: '홍길동', text: '품질이 좋습니다' },
      { author: '김철수', text: '배송도 빠르고 좋아요' },
    ],
  },

  // ── faq ───────────────────────────────────────────────────────────────────
  'faq-chat': {
    items: [
      { q: '배송 기간은 얼마나 걸리나요?', a: '2-3일 내 발송됩니다' },
      { q: '교환/환불이 가능한가요?', a: '구매 후 7일 이내 가능합니다' },
    ],
  },

  // ── shipping ──────────────────────────────────────────────────────────────
  'shipping-info': {
    rows: [
      { title: '배송 방법', desc: '택배 배송' },
    ],
  },

  // ── stats ─────────────────────────────────────────────────────────────────
  'stats-highlight': {
    headline: '10,000건 돌파!',
    items: [
      { icon: 'star', label: '누적 리뷰', value: '4.9점' },
      { icon: 'badge', label: '재구매율', value: '87%' },
    ],
  },

  // ── gallery ───────────────────────────────────────────────────────────────
  'gallery-options': {
    items: [
      { label: '기본 옵션' },
    ],
  },

  // ── banner ────────────────────────────────────────────────────────────────
  'banner-event': {
    title: '이벤트 제목',
  },

  // ── feature-editorial / cards / dark (템플릿 충실 재현) ──────────────────────
  'feature-editorial': {
    title: '제품 특장점',
    items: [
      { heading: '첫 번째 특장점', desc: '설명입니다' },
      { heading: '두 번째 특장점', desc: '설명입니다' },
    ],
  },
  'feature-cards': {
    title: '제품 특장점',
    cards: [
      { heading: '첫 번째 특장점', desc: '설명입니다' },
      { heading: '두 번째 특장점', desc: '설명입니다' },
    ],
  },
  'feature-dark': {
    title: '제품 특장점',
    items: [
      { heading: '첫 번째 특장점', desc: '설명입니다' },
      { heading: '두 번째 특장점', desc: '설명입니다' },
    ],
  },

  // ── ingredient-accent / grid (템플릿 충실 재현) ──────────────────────────────
  'ingredient-accent': {
    title: '제품 원료',
    items: [
      { label: '첫 번째 원료', desc: '설명입니다' },
      { label: '두 번째 원료', desc: '설명입니다' },
    ],
  },
  'ingredient-grid': {
    title: '제품 원료',
    items: [
      { label: '첫 번째 원료', desc: '설명입니다' },
      { label: '두 번째 원료', desc: '설명입니다' },
    ],
  },

  // ── compare-beforeafter (템플릿 충실 재현) ───────────────────────────────────
  'compare-beforeafter': {
    title: '왜 특별할까요?',
    rows: [
      { before: '사용 전 설명', after: '사용 후 효과' },
      { before: '사용 전 설명', after: '사용 후 효과' },
    ],
  },

  // ── review-list (템플릿 충실 재현) ───────────────────────────────────────────
  'review-list': {
    title: '고객들의 극찬!',
    reviews: [
      { text: '정말 만족스러워요', author: '구매자A' },
      { text: '재구매 의사 있어요', author: '구매자B' },
    ],
  },

  // ── usage-steps (템플릿 충실 재현) ───────────────────────────────────────────
  'usage-steps': {
    steps: [
      { icon: 'clock', text: '첫 번째 단계 설명' },
      { icon: 'check', text: '두 번째 단계 설명' },
    ],
  },

  // ── package-list (템플릿 충실 재현) ──────────────────────────────────────────
  'package-list': {
    packages: [
      { name: '기본 패키지', desc: '구성 설명', price: '19,000원' },
      { name: '선물 패키지', desc: '구성 설명', price: '29,000원' },
    ],
  },
}

// ── 공통 PageSpec meta / tokens ───────────────────────────────────────────────

const META = {
  product: '테스트 상품',
  category: '식품',
  styleDirection: 'warm-playful',
}

// ── 테스트 실행 ───────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const entries = catalog()
  const results: TestResult[] = []
  const missing: string[] = []

  console.log(`\n블록 스모크 테스트 시작 — 등록 변형 수: ${entries.length}\n`)
  console.log('─'.repeat(60))

  for (const entry of entries) {
    const { id } = entry

    // 매핑 누락 검사
    if (!(id in VARIANT_DATA)) {
      missing.push(id)
      results.push({ id, pass: false, error: 'VARIANT_DATA 매핑 없음 (테스트 data 추가 필요)' })
      console.log(`  ✗ [MISSING] ${id}`)
      continue
    }

    try {
      const result = renderPage({
        meta: META,
        tokens: warmPlayful,
        blocks: [{ variantId: id, data: VARIANT_DATA[id] }],
      })

      const html = result.html

      // 핵심 검증
      assert(html.includes('<!DOCTYPE'), '<!DOCTYPE 미포함')
      assert(html.includes('<section'), '<section 미포함')
      assert(result.usedVariants.includes(id), 'usedVariants에 variantId 미포함')
      assert(result.blockCount === 1, 'blockCount !== 1')

      results.push({ id, pass: true })
      console.log(`  ✓ ${id}`)
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err)
      results.push({ id, pass: false, error })
      console.log(`  ✗ ${id}`)
      console.log(`      └─ ${error}`)
    }
  }

  // ── 결과 집계 ─────────────────────────────────────────────────────────────
  const passed = results.filter((r) => r.pass).length
  const failed = results.filter((r) => !r.pass).length

  console.log('\n' + '─'.repeat(60))
  console.log(`\n결과: ${passed} 통과 / ${failed} 실패 / ${entries.length} 전체\n`)

  if (missing.length > 0) {
    console.log('⚠  VARIANT_DATA 매핑 누락:')
    for (const id of missing) console.log(`   - ${id}`)
    console.log()
  }

  if (failed > 0) {
    console.log('실패 목록:')
    for (const r of results.filter((r) => !r.pass)) {
      console.log(`  ✗ ${r.id}: ${r.error}`)
    }
    console.log()
    process.exit(1)
  } else {
    console.log('모든 변형 통과 ✓\n')
    process.exit(0)
  }
}

main().catch((err) => {
  console.error('예기치 않은 오류:', err)
  process.exit(1)
})
