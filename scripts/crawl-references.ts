/**
 * Pinterest 섹션별 레퍼런스 대량 크롤링
 *
 * 각 섹션당 3~5개 키워드로 검색 → 키워드당 10~12장 → 섹션당 30~50장.
 * agent-browser CLI 활용 (설치 필요: npm install -g agent-browser && agent-browser install).
 *
 * 실행: npx tsx --tsconfig tsconfig.node.json scripts/crawl-references.ts
 * 옵션:
 *   --section hero      특정 섹션만 크롤링
 *   --clean             기존 파일 삭제 후 재수집
 */
import { execFileSync, spawnSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

interface SectionConfig {
  section: string
  keywords: { key: string; query: string }[]
}

const SECTIONS: SectionConfig[] = [
  {
    section: 'hero',
    keywords: [
      { key: 'editorial', query: '식품 상세페이지 히어로 에디토리얼 디자인' },
      { key: 'premium', query: 'premium product detail page hero food korea' },
      { key: 'layout', query: 'hero section design food brand ecommerce' },
      { key: 'magazine', query: 'editorial food hero magazine layout' },
    ],
  },
  {
    section: 'brand_story',
    keywords: [
      { key: 'dark', query: '브랜드 스토리 페이지 다크 감성 디자인' },
      { key: 'heritage', query: 'heritage food brand story dark theme' },
      { key: 'storytelling', query: 'brand storytelling food design korean' },
      { key: 'emotional', query: 'emotional brand narrative food layout' },
    ],
  },
  {
    section: 'key_benefit',
    keywords: [
      { key: 'cards', query: '특징 카드 디자인 상세페이지 식품' },
      { key: 'icons', query: 'benefit icons card food ecommerce' },
      { key: 'grid', query: 'feature grid layout food product page' },
      { key: 'infographic', query: '식품 특징 인포그래픽 디자인' },
    ],
  },
  {
    section: 'ingredients',
    keywords: [
      { key: 'natural', query: '원재료 성분 레이아웃 식품 상세페이지' },
      { key: 'organic', query: 'natural ingredients design layout organic' },
      { key: 'source', query: 'food ingredient source story layout' },
      { key: 'traceability', query: '식재료 원산지 디자인 레이아웃' },
    ],
  },
  {
    section: 'process',
    keywords: [
      { key: 'steps', query: '제조과정 단계별 레이아웃 식품' },
      { key: 'artisan', query: 'artisan making process design food' },
      { key: 'timeline', query: 'food process timeline layout ecommerce' },
      { key: 'craft', query: '수제 제조 공정 디자인' },
    ],
  },
  {
    section: 'sensory',
    keywords: [
      { key: 'fullbleed', query: '감각적 풀블리드 식품 상세페이지' },
      { key: 'mood', query: 'atmospheric food mood photography' },
      { key: 'closeup', query: 'close-up food macro editorial design' },
      { key: 'texture', query: 'food texture detail layout sensory' },
    ],
  },
  {
    section: 'packaging',
    keywords: [
      { key: 'design', query: '패키지 디자인 상세페이지 레이아웃' },
      { key: 'shipping', query: 'packaging shipping design food brand' },
      { key: 'unboxing', query: 'unboxing product detail design' },
      { key: 'gift', query: '선물 패키지 디자인 식품' },
    ],
  },
  {
    section: 'cta',
    keywords: [
      { key: 'purchase', query: '구매 CTA 디자인 상세페이지' },
      { key: 'button', query: 'purchase button design food product' },
      { key: 'call-to-action', query: 'call to action layout food ecommerce' },
      { key: 'urgency', query: '구매 유도 디자인 한정 특가' },
    ],
  },
]

const BASE = path.join(process.cwd(), 'docs', 'references', 'sections')

/** 안전한 외부 명령 실행 (shell injection 방지) */
function run(cmd: string, args: string[], timeoutMs = 30000): string {
  const result = spawnSync(cmd, args, {
    encoding: 'utf8',
    timeout: timeoutMs,
  })
  if (result.error) return `__ERROR__: ${result.error.message}`
  return (result.stdout ?? '') + (result.stderr ?? '')
}

function sleep(seconds: number): void {
  spawnSync('sleep', [String(seconds)])
}

function agentBrowserClose(): void {
  run('agent-browser', ['close'], 10000)
}

function crawlKeyword(section: string, keywordKey: string, query: string, startIdx: number): number {
  const outDir = path.join(BASE, section)
  fs.mkdirSync(outDir, { recursive: true })

  agentBrowserClose()

  const pinterestUrl = `https://kr.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`
  run('agent-browser', ['open', pinterestUrl], 30000)
  sleep(8)

  run('agent-browser', ['eval', 'window.scrollTo(0, 2000)'], 10000)
  sleep(3)

  const evalScript = `const imgs = document.querySelectorAll('img[src*="pinimg"]'); const urls = []; imgs.forEach(img => { const src = img.src; if (src.includes('/236x/')) urls.push(src.replace('/236x/', '/736x/')); else if (src.includes('/564x/')) urls.push(src.replace('/564x/', '/736x/')); else if (src.includes('/736x/')) urls.push(src); }); [...new Set(urls)].slice(0, 12).join('|')`

  const result = run('agent-browser', ['eval', evalScript], 15000)

  // agent-browser eval 출력 형식: "url1|url2|..."
  const match = result.match(/"([^"]+)"/)
  if (!match) {
    console.log(`    ⚠️ ${section}/${keywordKey}: URL 추출 실패`)
    return 0
  }

  const urls = match[1].split('|').filter(u => u.startsWith('http'))
  let downloaded = 0

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i]
    const fileName = `${section}_${keywordKey}_${String(startIdx + i).padStart(2, '0')}.jpg`
    const filePath = path.join(outDir, fileName)

    const curlResult = spawnSync('curl', ['-s', '-o', filePath, url], { timeout: 15000 })
    if (curlResult.status !== 0) continue

    try {
      const size = fs.statSync(filePath).size
      if (size < 5000) {
        fs.unlinkSync(filePath)
        continue
      }
      downloaded++
    } catch {
      // 파일 확인 실패 무시
    }
  }

  return downloaded
}

async function main() {
  const args = process.argv.slice(2)
  const sectionFilter = args.includes('--section') ? args[args.indexOf('--section') + 1] : null
  const clean = args.includes('--clean')

  console.log('=== Pinterest 섹션별 대량 크롤링 ===\n')

  const targetSections = sectionFilter
    ? SECTIONS.filter(s => s.section === sectionFilter)
    : SECTIONS

  for (const config of targetSections) {
    const { section, keywords } = config
    const outDir = path.join(BASE, section)

    if (clean && fs.existsSync(outDir)) {
      for (const f of fs.readdirSync(outDir)) {
        if (f.endsWith('.jpg') || f.endsWith('.png')) {
          fs.unlinkSync(path.join(outDir, f))
        }
      }
    }

    console.log(`\n── ${section} (${keywords.length}개 키워드) ──`)

    let totalDownloaded = 0
    let startIdx = 1

    for (const { key, query } of keywords) {
      const preview = query.length > 40 ? query.slice(0, 40) + '...' : query
      console.log(`  [${key}] "${preview}"`)
      const count = crawlKeyword(section, key, query, startIdx)
      console.log(`    ✓ ${count}장 수집`)
      totalDownloaded += count
      startIdx += count
    }

    console.log(`  📊 ${section} 소계: ${totalDownloaded}장`)
  }

  agentBrowserClose()

  console.log('\n=== 최종 결과 ===')
  for (const config of SECTIONS) {
    const outDir = path.join(BASE, config.section)
    if (!fs.existsSync(outDir)) {
      console.log(`  ${config.section}: 0장`)
      continue
    }
    const count = fs.readdirSync(outDir).filter(f => /\.(jpg|png)$/i.test(f)).length
    console.log(`  ${config.section}: ${count}장`)
  }
}

// execFileSync 사용되지 않음 경고 방지
void execFileSync

main().catch(err => {
  console.error('크롤링 실패:', err)
  process.exit(1)
})
