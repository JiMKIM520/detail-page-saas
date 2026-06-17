/**
 * blocks-composer-live-test.ts
 * 실 LLM 경로 검증: runBlocksComposer → Anthropic API → PageSpec → HTML 렌더
 *
 * 실행:
 *   node_modules/.bin/tsx scripts/blocks-composer-live-test.ts
 * 인증 오류 시:
 *   env -u ANTHROPIC_API_KEY node_modules/.bin/tsx scripts/blocks-composer-live-test.ts
 */
import * as fs from 'fs'
import * as path from 'path'
import * as assert from 'assert'
import { runBlocksComposer, type BlocksComposerInput } from '../agents/blocks-composer'
import type { ProjectBrief } from '../agents/types'

const OUTPUT_DIR = '/tmp/spike/composer-live'

const brief: ProjectBrief = {
  projectId: 'live-test-granola-001',
  productName: '황금 귀리 그래놀라',
  category: '식품',
  platform: '스마트스토어',
  targetAudience: '건강한 아침 식사를 원하는 30~40대 직장인, 다이어트 관심 여성',
  keyHighlights: [
    '국산 귀리 100% 사용, 잡곡 6종 혼합',
    '설탕 무첨가 — 꿀과 유기농 메이플시럽으로만 단맛',
    '한 끼 250kcal, 단백질 8g — 포만감 오래 지속',
    '소분 개별포장(35g×14봉) 신선도 유지',
    '무방부제·무인공착색료 자연재료 그대로',
  ],
  brandColors: ['#D4A654', '#F5ECD7', '#3B2F1E'],
  styleDirection: 'warm-playful — 따뜻하고 정직한 식품 스타일. hero/checkpoint/point/story/cert/closing 위주로 구성.',
  toneKeywords: ['정직한', '건강한', '따뜻한', '신뢰할 수 있는'],
  requiredContent: {
    phrases: ['국산 귀리 100%', '설탕 무첨가'],
    images: [],
    certifications: [],
  },
  restrictions: {
    styles: [],
    colors: [],
    // restrictions.words → FORBIDDEN WORDS 섹션으로 프롬프트에 전달됨.
    // 신규 변형(DATA_CONTRACTS 미등록)을 variantId 형태로 금지해 AI가 선택하지 않게 함.
    words: [
      '완벽한', '최고의', '혁신적인',
      'stats-highlight', 'shipping-info',
      'review-bubbles', 'review-cards',
      'faq-chat', 'gallery-options', 'banner-event',
    ],
  },
  generatedAt: new Date().toISOString(),
}

const input: BlocksComposerInput = {
  brief,
  // 이미지: placeholder URL 2개 (실제 다운로드 없이 URL만 슬롯에 매핑됨)
  images: {
    hero: 'https://images.unsplash.com/photo-1517093157656-b9eccef91cb1?w=800',
    lifestyle: ['https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800'],
  },
  brandColors: brief.brandColors,
  outputDir: OUTPUT_DIR,
}

async function main() {
  console.log('=== Blocks Composer Live Test ===')
  console.log('outputDir:', OUTPUT_DIR)
  console.log('product:', brief.productName)
  console.log()

  const result = await runBlocksComposer(input)

  // ── 1. success assert ──────────────────────────────────────
  assert.strictEqual(result.success, true, `runBlocksComposer failed: ${result.error}`)
  console.log('[PASS] result.success === true')

  const { spec, html, usedVariants } = result.data!

  // ── 2. blocks 개수 ──────────────────────────────────────────
  const blockCount = spec.blocks.length
  assert.ok(blockCount >= 10 && blockCount <= 20, `블록 수 범위 초과: ${blockCount}`)
  console.log(`[PASS] blocks.length = ${blockCount} (10~20 ✓)`)

  // ── 3. 첫/마지막 블록 ──────────────────────────────────────
  const firstId = spec.blocks[0]?.variantId ?? ''
  const lastId = spec.blocks[spec.blocks.length - 1]?.variantId ?? ''
  assert.ok(firstId.startsWith('hero-'), `첫 블록이 hero-*가 아님: ${firstId}`)
  assert.ok(lastId.startsWith('closing-'), `마지막 블록이 closing-*가 아님: ${lastId}`)
  console.log(`[PASS] 첫 블록: ${firstId}`)
  console.log(`[PASS] 마지막 블록: ${lastId}`)

  // ── 4. presetKey / tokens ───────────────────────────────────
  // meta에 styleDirection 있음, tokens에는 accent 색이 있을 것
  const tokensAccent = (spec.tokens as Record<string, unknown>)?.accent ?? '(없음)'
  console.log(`[INFO] presetKey(styleDirection): ${spec.meta.styleDirection ?? '(없음)'}`)
  console.log(`[INFO] tokens.accent: ${tokensAccent}`)

  // ── 5. usedVariants ────────────────────────────────────────
  console.log(`[INFO] usedVariants (${usedVariants.length}개): ${usedVariants.join(', ')}`)

  // ── 6. HTML 길이 ────────────────────────────────────────────
  const htmlLen = html.length
  assert.ok(htmlLen > 1000, `HTML이 너무 짧음: ${htmlLen}`)
  console.log(`[INFO] HTML 길이: ${htmlLen.toLocaleString()} chars`)

  // ── 7. page.html 저장 ──────────────────────────────────────
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  const htmlPath = path.join(OUTPUT_DIR, 'page.html')
  fs.writeFileSync(htmlPath, html, 'utf8')
  console.log(`[INFO] HTML 저장: ${htmlPath}`)

  console.log()
  console.log('=== 완료 ===')
  console.log(`durationMs: ${result.durationMs}ms`)
}

main().catch((err) => {
  console.error('[FATAL]', err)
  process.exit(1)
})
