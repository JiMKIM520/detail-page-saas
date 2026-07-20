/**
 * 변형 메타(톤·높이) 자동 생성기
 * 사양: docs/plans/page-rules.md §7 + docs/plans/density-grammar.md
 *
 * 실행: node_modules/.bin/tsx scripts/gen-variant-meta.ts
 *
 * 출력: agents/templates/blocks/variant-meta.json
 *   { _generated, _measured, _total, [variantId]: { tone, height, archetype } }
 *
 * 톤 판정: CSS + render.toString()에서 background:var(--brand|--ink) 또는 dark hex(#0~#3 시작 6자리) 탐색.
 * 높이 실측: VARIANT_DATA 있는 변형만 단독 renderPage → Playwright 872px offsetHeight.
 * 데이터 없는 변형은 height:null.
 */

// 블록 시스템 초기화 (registerBlocks 사이드이펙트)
import '../agents/templates/blocks/index'
import { listVariants } from '../agents/templates/blocks/registry'
import { renderPage, warmPlayful } from '../agents/templates/blocks/index'
import { chromiumShellPath } from '../lib/render-audit'
import fs from 'node:fs'
import path from 'node:path'

// ── 출력 경로 ──────────────────────────────────────────────────────────────────
const OUT_PATH = path.join(process.cwd(), 'agents/templates/blocks/variant-meta.json')

// ── 공통 렌더 메타 ─────────────────────────────────────────────────────────────
const PAGE_META = { product: '테스트 상품', category: '식품', styleDirection: 'warm-playful' }

// ── 변형별 최소 유효 data (blocks-smoke-test.ts VARIANT_DATA와 동일 소스) ───────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const VARIANT_DATA: Record<string, any> = {
  // ── hero ─────────────────────────────────────────────────────────────────────
  'hero-centered': { title: '맛있는 한 끼', brand: '브랜드명' },
  'hero-editorial': { title: '프리미엄 제품' },
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
  // ── checkpoint ────────────────────────────────────────────────────────────────
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
  // ── point / feature ───────────────────────────────────────────────────────────
  'point-bubble': { title: '포인트 제목' },
  'feature-fullbleed': { title: '강조 제목' },
  // ── callout ───────────────────────────────────────────────────────────────────
  'callout-banner': { big: '핵심 메시지를 여기에' },
  'statement-serif': { quote: '브랜드 철학을 담은 인용문' },
  // ── compare ───────────────────────────────────────────────────────────────────
  'compare-cooking': {
    title: '비교 제목',
    left: { icon: 'fryer', name: '에어프라이어', steps: [{ text: '180°C 예열' }] },
    right: { icon: 'oven', name: '오븐', steps: [{ text: '200°C 예열' }] },
  },
  // ── spec ─────────────────────────────────────────────────────────────────────
  'spec-table': {
    title: '제품 상세 정보',
    rows: [{ k: '원산지', v: '국내산' }, { k: '용량', v: '500g' }],
  },
  // ── closing ───────────────────────────────────────────────────────────────────
  'closing-mood': { title: '마무리 제목' },
  'closing-light': { title: '마무리 헤드라인' },
  // ── recommend ─────────────────────────────────────────────────────────────────
  'recommend-dark': { title: '추천 제목' },
  // ── checklist ─────────────────────────────────────────────────────────────────
  'checklist-checks': {
    title: '체크리스트 제목',
    items: [{ text: '첫 번째 항목' }, { text: '두 번째 항목' }],
  },
  // ── strip ─────────────────────────────────────────────────────────────────────
  'strip-band': { text: '브랜드명' },
  // ── reason ────────────────────────────────────────────────────────────────────
  'reason-question': { question: '왜 우리 제품을 선택해야 할까요?' },
  // ── feature (seal) ────────────────────────────────────────────────────────────
  'feature-seal': {},
  // ── equation ──────────────────────────────────────────────────────────────────
  'equation-visual': { a: { label: '재료 A' }, b: { label: '재료 B' }, c: { label: '결과 C' } },
  // ── story ─────────────────────────────────────────────────────────────────────
  'story-pair': { title: '브랜드 스토리', images: [''] },
  // ── cert ─────────────────────────────────────────────────────────────────────
  'cert-rosette': { title: '인증 제목' },
  // ── review ────────────────────────────────────────────────────────────────────
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
  // ── faq ───────────────────────────────────────────────────────────────────────
  'faq-chat': {
    items: [
      { q: '배송 기간은 얼마나 걸리나요?', a: '2-3일 내 발송됩니다' },
      { q: '교환/환불이 가능한가요?', a: '구매 후 7일 이내 가능합니다' },
    ],
  },
  // ── shipping ──────────────────────────────────────────────────────────────────
  'shipping-info': { rows: [{ title: '배송 방법', desc: '택배 배송' }] },
  // ── stats ─────────────────────────────────────────────────────────────────────
  'stats-highlight': {
    headline: '10,000건 돌파!',
    items: [
      { icon: 'star', label: '누적 리뷰', value: '4.9점' },
      { icon: 'badge', label: '재구매율', value: '87%' },
    ],
  },
  // ── gallery ───────────────────────────────────────────────────────────────────
  'gallery-options': { items: [{ label: '기본 옵션' }] },
  // ── banner ────────────────────────────────────────────────────────────────────
  'banner-event': { title: '이벤트 제목' },
  // ── feature-editorial / cards / dark ─────────────────────────────────────────
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
  // ── ingredient ────────────────────────────────────────────────────────────────
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
  // ── compare-beforeafter ───────────────────────────────────────────────────────
  'compare-beforeafter': {
    title: '왜 특별할까요?',
    rows: [
      { before: '사용 전 설명', after: '사용 후 효과' },
      { before: '사용 전 설명', after: '사용 후 효과' },
    ],
  },
  // ── review-list ───────────────────────────────────────────────────────────────
  'review-list': {
    title: '고객들의 극찬!',
    reviews: [
      { text: '정말 만족스러워요', author: '구매자A' },
      { text: '재구매 의사 있어요', author: '구매자B' },
    ],
  },
  // ── usage-steps ───────────────────────────────────────────────────────────────
  'usage-steps': {
    steps: [
      { icon: 'clock', text: '첫 번째 단계 설명' },
      { icon: 'check', text: '두 번째 단계 설명' },
    ],
  },
  // ── package-list ──────────────────────────────────────────────────────────────
  'package-list': {
    packages: [
      { name: '기본 패키지', desc: '구성 설명', price: '19,000원' },
      { name: '선물 패키지', desc: '구성 설명', price: '29,000원' },
    ],
  },
  // ── cert-frame ────────────────────────────────────────────────────────────────
  'cert-frame': { certs: [{ label: '적합성 테스트 완료', caption: '시험기관 및 내용' }] },
  // ── gallery-grid ──────────────────────────────────────────────────────────────
  'gallery-grid': {
    title: 'DETAIL SHOT',
    shots: [{ label: '01 전체 컷' }, { label: '02 클로즈업' }],
  },
  // ── event-promo ───────────────────────────────────────────────────────────────
  'event-promo': {
    title: 'REVIEW EVENT',
    benefit: '5,000원 쿠폰 증정!',
    points: [{ text: '텍스트 리뷰만 작성해도 OK!' }, { text: '작성 즉시 쿠폰 자동 지급' }],
  },
  // ── discount-deal ─────────────────────────────────────────────────────────────
  'discount-deal': {
    headline: '지금만 반값!',
    discountRate: '50%',
    ctaText: '지금 신청하면 100% 할인',
  },
  // ── detail-showcase ───────────────────────────────────────────────────────────
  'detail-showcase': {
    title: '제품 상세 설명',
    specs: [
      { label: '소재', value: '프리미엄 알루미늄' },
      { label: '무게', value: '258g' },
    ],
    scenes: [{ caption: '일상에서 사용할 때' }, { caption: '외출 시 휴대할 때' }],
  },
  // ── story-brand ───────────────────────────────────────────────────────────────
  'story-brand': {
    label: 'OUR BRAND STORY',
    titleBold: '브랜드 스토리',
    paragraphs: ['우리 브랜드의 이야기를 담아주세요.'],
  },
  // ── banner-seasonal ───────────────────────────────────────────────────────────
  'banner-seasonal': {
    eyebrow: 'SPRING EVENT',
    titleLine1: '봄맞이',
    titleLine2: '이벤트',
    period: '4.1일(화) - 4.15일(화)',
  },
  // ── intro-cover ───────────────────────────────────────────────────────────────
  'intro-cover': {
    brand: 'VITALAB',
    title: '제품명을 써주세요',
    points: [
      { icon: 'bolt', label: 'Point 01', desc: '차별화 포인트를 써주세요' },
      { icon: 'heart', label: 'Point 02', desc: '차별화 포인트를 써주세요' },
    ],
  },
  // ── stats-figures ─────────────────────────────────────────────────────────────
  'stats-figures': {
    headline: '10,000건!',
    rows: [{ label: '누적 판매량', value: '10,000건' }],
  },
  // ── faq-list ──────────────────────────────────────────────────────────────────
  'faq-list': {
    items: [
      { q: '배송은 얼마나 걸리나요?', a: '주문 확인 후 1~2 영업일 내 출고됩니다.' },
      { q: '교환 및 환불은 어떻게 하나요?', a: '수령 후 7일 이내 고객센터로 연락 주시면 처리해 드립니다.' },
    ],
  },
  // ── hero-photo ────────────────────────────────────────────────────────────────
  'hero-photo': {
    brand: 'LUMIÈRE',
    productName: 'PEAU VELOURS',
    story: '최고급 원료만을 엄선해 만든 바디 세럼.',
  },
  // ── shipping-notice ───────────────────────────────────────────────────────────
  'shipping-notice': { rows: [{ text: '영업일 기준 약 10~15일 소요됩니다.' }] },
  // ── point-glass-grid ──────────────────────────────────────────────────────────
  'point-glass-grid': {
    title: '제품 핵심 포인트',
    points: [
      { label: 'point 01.', keyword: '신선함', text: '산지 직송으로 신선도가 다릅니다' },
      { label: 'point 02.', keyword: '정성', text: '엄선된 원료만 사용합니다' },
    ],
  },
  // ── point-dark-grid-resolve ───────────────────────────────────────────────────
  'point-dark-grid-resolve': {
    title: '왜 기존 제품은\n실패할까요?',
    cards: [
      { sub: '금방 식어버리는', keyword: '보온력 부족' },
      { sub: '흘러넘치는', keyword: '밀봉 불량' },
    ],
    checks: ['뜨거운 음료도 4시간 보온 유지', '완벽 밀봉 — 가방 안에서 새지 않음'],
    resolveLabel: '기존 제품이 가진 불편함',
    resolveBox: '이제는 달라질 때입니다',
  },
  // ── 트랙 B 변형 보강 5종 ──────────────────────────────────────────────────────
  'usage-steps-photo': {
    steps: [
      { icon: 'check', text: '첫 번째 사용 단계' },
      { icon: 'drop', text: '두 번째 사용 단계' },
      { icon: 'star', text: '세 번째 사용 단계' },
    ],
  },
  'feeding-guide-blocks': {
    blocks: [
      { range: '소형견 1~5kg', value: '30g', icon: 'star' },
      { range: '중형견 5~10kg', value: '50g', icon: 'badge' },
    ],
  },
  'callout-icon-box': {
    title: '이것만은 꼭 확인하세요',
    body: '사용 전 반드시 확인이 필요한 핵심 정보입니다.',
  },
}

// ── 톤 판정 ────────────────────────────────────────────────────────────────────
// CSS 문자열 + render.toString()에서 다크 배경 마커를 정적 탐색.
// 마커: background:var(--brand|--ink) 또는 background:#[0-3]XXXXX(6자리 dark hex).
function detectTone(css: string, renderSrc: string): 'dark' | 'light' {
  const src = css + renderSrc
  if (/background\s*:\s*var\(--(?:brand|ink)\)/.test(src)) return 'dark'
  if (/background\s*:\s*#[0-3][0-9a-fA-F]{5}/i.test(src)) return 'dark'
  return 'light'
}

// ── 오프팔레트 판정 ─────────────────────────────────────────────────────────────
// CSS + render 소스에서 팔레트 외 유채색 하드코딩을 정적 탐색.
// 무채색 판별: R≈G≈B 허용 오차 12, hsl s<12%.
// 제외: var() 참조, rgba/hsla a<0.35(그림자 등 투명 장식).
// 유채색 하드코딩 고유값 ≥3이면 offPalette:true.

function isRGBChromatic(r: number, g: number, b: number): boolean {
  return Math.max(r, g, b) - Math.min(r, g, b) > 12
}

function detectOffPalette(css: string, renderSrc: string): { offPalette: boolean; count: number } {
  // var() 참조 제거 — CSS 커스텀 프로퍼티는 팔레트 준수
  const stripped = (css + renderSrc).replace(/var\s*\([^)]+\)/g, '')
  const chromatic = new Set<string>()

  // 1. 6자리 hex (#RRGGBB)
  const hex6Re = /(?<![0-9a-fA-F])#([0-9a-fA-F]{6})(?![0-9a-fA-F])/gi
  let m: RegExpExecArray | null
  while ((m = hex6Re.exec(stripped)) !== null) {
    const h = m[1].toLowerCase()
    const r = parseInt(h.slice(0, 2), 16)
    const g = parseInt(h.slice(2, 4), 16)
    const b = parseInt(h.slice(4, 6), 16)
    if (isRGBChromatic(r, g, b)) chromatic.add(`#${h}`)
  }

  // 2. rgb() / rgba()
  const rgbRe = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/g
  while ((m = rgbRe.exec(stripped)) !== null) {
    const a = m[4] !== undefined ? parseFloat(m[4]) : 1
    if (a < 0.35) continue // 투명 장식 제외
    const r = parseInt(m[1], 10), g = parseInt(m[2], 10), b = parseInt(m[3], 10)
    if (isRGBChromatic(r, g, b)) chromatic.add(`rgb(${r},${g},${b})`)
  }

  // 3. hsl() / hsla()
  const hslRe = /hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%(?:\s*,\s*([\d.]+))?\s*\)/g
  while ((m = hslRe.exec(stripped)) !== null) {
    const a = m[4] !== undefined ? parseFloat(m[4]) : 1
    if (a < 0.35) continue
    const s = parseFloat(m[2])
    if (s >= 12) chromatic.add(`hsl(${m[1]},${m[2]}%)`)
  }

  return { offPalette: chromatic.size >= 3, count: chromatic.size }
}

// ── Playwright 높이 실측 ────────────────────────────────────────────────────────
// 브라우저 1회 기동 후 변형별 page를 순차 생성·측정·닫는다.
async function measureHeights(
  items: Array<{ id: string; html: string }>,
): Promise<Map<string, number>> {
  const heights = new Map<string, number>()
  const shell = chromiumShellPath()
  if (!shell) {
    console.warn('⚠ chromium 없음 — 높이 실측 생략')
    return heights
  }
  const { chromium } = await import('playwright-core')
  const browser = await chromium.launch({ executablePath: shell })
  try {
    for (const { id, html } of items) {
      const page = await browser.newPage({ viewport: { width: 872, height: 1200 } })
      try {
        await page.setContent(html, { waitUntil: 'networkidle', timeout: 60000 })
        const h = await page.evaluate(
          // .dpg는 폭 고정된 콘텐츠 래퍼 — 없으면 body 높이로 폴백
          (): number =>
            (document.querySelector('.dpg') as HTMLElement | null)?.scrollHeight ??
            document.body.scrollHeight,
        )
        heights.set(id, h)
        process.stdout.write(`  ✓ ${id}: ${h}px\n`)
      } catch (err) {
        process.stdout.write(`  ✗ ${id}: ${(err as Error).message?.slice(0, 80)}\n`)
      } finally {
        await page.close()
      }
    }
  } finally {
    await browser.close()
  }
  return heights
}

// ── 메인 ───────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  const variants = listVariants()
  console.log(`\n변형 메타 생성 시작 — 총 변형 수: ${variants.length}\n`)

  // 렌더 아이템 준비 (VARIANT_DATA 있는 변형만)
  const renderItems: Array<{ id: string; html: string }> = []
  for (const v of variants) {
    const data: unknown = VARIANT_DATA[v.id]
    if (data === undefined) continue
    try {
      const { html } = renderPage({
        meta: PAGE_META,
        tokens: warmPlayful,
        blocks: [{ variantId: v.id, data }],
      })
      renderItems.push({ id: v.id, html })
    } catch (err) {
      process.stdout.write(`  렌더 실패 ${v.id}: ${(err as Error).message?.slice(0, 80)}\n`)
    }
  }
  console.log(`렌더 성공: ${renderItems.length} / ${Object.keys(VARIANT_DATA).length}`)

  // Playwright 높이 실측
  console.log('\n높이 실측 중...')
  const measuredHeights = await measureHeights(renderItems)
  console.log(`\n실측 완료: ${measuredHeights.size}건`)

  // 결과 조립
  let offPaletteCount = 0
  const entries: Record<string, unknown> = {}
  for (const v of variants) {
    const { offPalette: rawOffPalette } = detectOffPalette(v.css, String(v.render))
    // award 아키타입은 골드·은색이 커머스 권위 신호색으로 하드코딩 허용 — offPalette 판정 면제
    const offPalette = rawOffPalette && v.archetype !== 'award'
    if (offPalette) offPaletteCount++
    entries[v.id] = {
      tone: detectTone(v.css, String(v.render)),
      height: measuredHeights.get(v.id) ?? null,
      archetype: v.archetype,
      ...(offPalette ? { offPalette: true } : {}),
    }
  }

  const result: Record<string, unknown> = {
    _generated: new Date().toISOString(),
    _measured: measuredHeights.size,
    _total: variants.length,
    _offPalette: offPaletteCount,
    ...entries,
  }

  fs.writeFileSync(OUT_PATH, JSON.stringify(result, null, 2) + '\n', 'utf8')
  console.log(`\n✅ 저장 완료: ${OUT_PATH}`)
  console.log(`   총 ${variants.length}개 / 실측 ${measuredHeights.size}건 / light+dark 분류 완료`)
  console.log(`   오프팔레트 변형: ${offPaletteCount}개`)
}

main().catch((err) => {
  console.error('오류:', err)
  process.exit(1)
})
