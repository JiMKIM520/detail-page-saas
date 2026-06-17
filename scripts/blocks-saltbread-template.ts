/**
 * 소금빵 풀페이지 재생성 — 진짜 스타일링샷 + 템플릿 룩(cobalt-premium) + 신규 충실 블록.
 * 사전: 이미지가 http://localhost:8799/sb2/ 로 서빙되어야 함(스크린샷 시).
 * 실행: node_modules/.bin/tsx scripts/blocks-saltbread-template.ts → /tmp/spike/sb2/page.html
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { runBlocksComposer } from '../agents/blocks-composer'
import { renderPage, cobaltPremium } from '../agents/templates/blocks/index'
import type { ProjectBrief } from '../agents/types'

const BASE = 'http://localhost:8799/sb2'

const brief: ProjectBrief = {
  projectId: 'sb-tmpl',
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
  styleDirection: '프리미엄 에디토리얼(코발트/네이비) 템플릿 톤 — 거대 숫자·풀폭 밴드·다크 섹션 등 다양한 룩을 적극 활용',
  toneKeywords: ['프리미엄', '에디토리얼', '정직한', '갓구운'],
  requiredContent: { phrases: [], images: [], certifications: [] },
  restrictions: { styles: [], colors: [], words: [] },
  generatedAt: '2026-06-17T00:00:00.000Z',
}

async function main(): Promise<void> {
  mkdirSync('/tmp/spike/sb2', { recursive: true })
  console.log('[sb-template] 컴포저 호출 (진짜 스타일링샷 + 템플릿 룩)')
  const res = await runBlocksComposer({
    brief,
    images: {
      hero: `${BASE}/plated.png`,
      lifestyle: [`${BASE}/overhead.png`, `${BASE}/butter.png`, `${BASE}/cross.png`],
      cutout: `${BASE}/cutout-02.webp`,
      section: [`${BASE}/hero.png`],
    },
    brandColors: [],
    outputDir: '/tmp/spike/sb2',
  })
  if (!res.success || !res.data) {
    console.error('[sb-template] 실패:', res.error)
    process.exit(1)
  }
  // 템플릿 룩 강제: AI가 고른 presetKey와 무관하게 cobalt-premium 토큰으로 재렌더
  const spec = { ...res.data.spec, tokens: cobaltPremium }
  const out = renderPage(spec)
  writeFileSync('/tmp/spike/sb2/page.html', out.html)
  console.log('[sb-template] blocks:', out.usedVariants.length)
  console.log('  variants:', out.usedVariants.join(', '))
  console.log('  HTML:', out.html.length, 'chars → /tmp/spike/sb2/page.html')
}

main().catch((e) => {
  console.error('예기치 않은 오류:', e)
  process.exit(1)
})
