/**
 * 실제 스타일링샷(public/salt-bread)으로 블록 컴포저 상세페이지 생성 데모.
 * 사전: 이미지가 http://localhost:8799/sb/ 로 서빙되고 있어야 함(스크린샷 시).
 * 실행: node_modules/.bin/tsx scripts/blocks-saltbread-demo.ts → /tmp/spike/sb/page.html
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { runBlocksComposer } from '../agents/blocks-composer'
import type { ProjectBrief } from '../agents/types'

const BASE = 'http://localhost:8799/sb'

const brief: ProjectBrief = {
  projectId: 'sb-demo',
  productName: '쌀과밀 소금빵',
  category: 'food',
  platform: 'smartstore',
  targetAudience: '갓 구운 빵을 좋아하는 2030 직장인·홈카페족',
  keyHighlights: [
    '프랑스산 고메버터를 듬뿍 넣어 풍미가 깊다',
    '겉은 바삭 속은 촉촉한 결 — 매일 새벽 직접 반죽',
    '매일 아침 갓 구워 당일 발송',
    '천일염으로 마무리한 은은한 단짠 밸런스',
  ],
  brandColors: [],
  styleDirection: '따뜻하고 먹음직스러운 감성 편집형',
  toneKeywords: ['따뜻한', '고소한', '정직한', '갓구운'],
  requiredContent: { phrases: [], images: [], certifications: [] },
  restrictions: { styles: [], colors: [], words: [] },
  generatedAt: '2026-06-17T00:00:00.000Z',
}

async function main(): Promise<void> {
  mkdirSync('/tmp/spike/sb', { recursive: true })
  console.log('[saltbread-demo] 컴포저 호출 — 제품:', brief.productName)
  const res = await runBlocksComposer({
    brief,
    images: {
      hero: `${BASE}/saltbread-01.webp`,
      lifestyle: [`${BASE}/saltbread-02.webp`, `${BASE}/saltbread-03.webp`, `${BASE}/saltbread-04.webp`],
      cutout: `${BASE}/cutout-02.webp`,
      section: [`${BASE}/product-02.webp`, `${BASE}/product-03.webp`],
    },
    brandColors: [],
    outputDir: '/tmp/spike/sb',
  })

  if (!res.success || !res.data) {
    console.error('[saltbread-demo] 실패:', res.error)
    process.exit(1)
  }

  writeFileSync('/tmp/spike/sb/page.html', res.data.html)
  const spec = res.data.spec
  console.log('[saltbread-demo] success — blocks:', res.data.usedVariants.length)
  console.log('  presetKey/styleDir:', spec.meta.styleDirection)
  console.log('  tokens.accent:', spec.tokens.accent, '/ bg:', spec.tokens.bg)
  console.log('  variants:', res.data.usedVariants.join(', '))
  console.log('  HTML:', res.data.html.length, 'chars → /tmp/spike/sb/page.html')
}

main().catch((e) => {
  console.error('예기치 않은 오류:', e)
  process.exit(1)
})
