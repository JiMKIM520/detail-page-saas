/**
 * Design Researcher — 멀티소스 병렬 스크래핑
 * Naver 이미지 + Pinterest(비로그인) + 노트폴리오 + 와디즈
 * playwright-core + 시스템 Chrome (인증 불필요)
 *
 * 검색 쿼리: 브랜드명 금지 — 카테고리 + 스타일 키워드 기반
 */

import { chromium } from 'playwright-core'
import type { Browser } from 'playwright-core'
import * as fs from 'fs'
import * as path from 'path'

// ── 카테고리별 검색 쿼리 ──────────────────────────────────────────

const NAVER_QUERIES: Record<string, string> = {
  food:           '프리미엄 식품 상세페이지 디자인',
  beauty:         '뷰티 화장품 상세페이지 디자인',
  fashion:        '패션 쇼핑몰 상세페이지 디자인',
  'health-food':  '건강기능식품 상세페이지 디자인',
  living:         '인테리어 홈리빙 상세페이지 디자인',
  furniture:      '인테리어 홈리빙 상세페이지 디자인',
  pet:            '반려동물 쇼핑몰 상세페이지 디자인',
  sports:         '스포츠 브랜드 상세페이지 디자인',
}

const PINTEREST_QUERIES: Record<string, string> = {
  food:           '식품 상세페이지 쇼핑몰 디자인',
  beauty:         '화장품 상세페이지 뷰티 디자인',
  fashion:        '패션 상세페이지 의류 쇼핑몰',
  'health-food':  '건강식품 상세페이지 디자인',
  living:         '홈리빙 상세페이지 인테리어',
  furniture:      '홈리빙 상세페이지 인테리어',
  pet:            '반려동물 상세페이지 디자인',
  sports:         '스포츠 상세페이지 브랜드',
}

// 와디즈 카테고리 ID (open 상태 캠페인)
const WADIZ_CATEGORY: Record<string, number> = {
  food: 1,
  beauty: 5,
  fashion: 2,
  living: 7,
  furniture: 7,
  sports: 9,
}

// ── 개별 소스 스크래퍼 ────────────────────────────────────────────

async function scrapeNaver(browser: Browser, query: string, count: number): Promise<string[]> {
  const page = await browser.newPage()
  try {
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'ko-KR,ko;q=0.9' })
    await page.goto(
      `https://search.naver.com/search.naver?where=image&query=${encodeURIComponent(query)}`,
      { waitUntil: 'domcontentloaded', timeout: 20000 }
    )
    await page.waitForTimeout(2500)
    return await page.evaluate((n) => {
      return Array.from(
        document.querySelectorAll('.img_grid .thumb_area img, .image_list img, div[class*="grid"] img')
      )
        .map((img) => {
          const el = img as HTMLImageElement
          return el.getAttribute('data-source') || el.getAttribute('data-lazy-src') || el.src || ''
        })
        .filter((s) => s.startsWith('http') && !s.includes('data:'))
        .slice(0, n)
    }, count)
  } finally {
    await page.close()
  }
}

async function scrapePinterest(browser: Browser, query: string, count: number): Promise<string[]> {
  const page = await browser.newPage()
  try {
    // Pinterest는 비로그인 상태에서도 초기 핀 이미지가 일부 노출됨
    await page.goto(
      `https://www.pinterest.co.kr/search/pins/?q=${encodeURIComponent(query)}`,
      { waitUntil: 'domcontentloaded', timeout: 20000 }
    )
    await page.waitForTimeout(3000)
    const urls = await page.evaluate((n) => {
      return Array.from(document.querySelectorAll('img[src*="pinimg.com"]'))
        .map((img) => {
          // 더 큰 사이즈 URL로 교체 (236x → 736x)
          return (img as HTMLImageElement).src.replace('/236x/', '/736x/').replace('/474x/', '/736x/')
        })
        .filter((s) => s.includes('pinimg.com'))
        .slice(0, n)
    }, count)
    return urls
  } catch {
    return []
  } finally {
    await page.close()
  }
}

async function scrapeNotefolio(browser: Browser, category: string, count: number): Promise<string[]> {
  const page = await browser.newPage()
  try {
    const keyword = NAVER_QUERIES[category]?.split(' ').slice(0, 2).join(' ') ?? '상세페이지'
    const query = `${keyword} 상세페이지`
    await page.goto(
      `https://notefolio.net/search?q=${encodeURIComponent(query)}&type=work`,
      { waitUntil: 'networkidle', timeout: 25000 }
    )
    await page.waitForTimeout(3000)
    return await page.evaluate((n) => {
      // notefolio.net React SPA — 다양한 selector 시도
      const imgs = Array.from(
        document.querySelectorAll(
          'img[src*="notefolio"], img[src*="cdn"], .work img, .portfolio img, ' +
          '[class*="work"] img, [class*="card"] img, [class*="thumb"] img, ' +
          'article img, figure img, .item img'
        )
      ) as HTMLImageElement[]
      return imgs
        .map((img) => img.src || img.getAttribute('data-src') || '')
        .filter((s) => s.startsWith('http') && !s.includes('profile') && !s.includes('avatar'))
        .slice(0, n)
    }, count)
  } catch {
    return []
  } finally {
    await page.close()
  }
}

async function scrapeWadiz(browser: Browser, category: string, count: number): Promise<string[]> {
  const catId = WADIZ_CATEGORY[category]
  if (!catId) return []
  const page = await browser.newPage()
  try {
    await page.goto(
      `https://www.wadiz.kr/web/campaign/list?sfund_category_id=${catId}&status=open`,
      { waitUntil: 'domcontentloaded', timeout: 20000 }
    )
    await page.waitForTimeout(2500)
    return await page.evaluate((n) => {
      return Array.from(
        document.querySelectorAll('.campaign-img img, .card-img img, .thumb img, .thumbnail img')
      )
        .map((img) => (img as HTMLImageElement).src)
        .filter((s) => s.startsWith('http'))
        .slice(0, n)
    }, count)
  } catch {
    return []
  } finally {
    await page.close()
  }
}

// ── 이미지 다운로드 ───────────────────────────────────────────────

async function downloadImages(
  urls: string[],
  refDir: string,
  prefix: string
): Promise<string[]> {
  const saved: string[] = []
  for (let i = 0; i < urls.length; i++) {
    try {
      const res = await fetch(urls[i], {
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
        signal: AbortSignal.timeout(8000),
      })
      if (!res.ok) continue
      const contentType = res.headers.get('content-type') ?? ''
      if (!contentType.startsWith('image/')) continue
      const buf = Buffer.from(await res.arrayBuffer())
      if (buf.length < 5000) continue   // 너무 작은 이미지 스킵 (아이콘 등)
      const ext = contentType.includes('png') ? 'png' : 'jpg'
      const fp = path.join(refDir, `${prefix}_${i}.${ext}`)
      fs.writeFileSync(fp, buf)
      saved.push(fp)
    } catch {
      /* skip failed downloads */
    }
  }
  return saved
}

// ── 파일 시스템 레퍼런스 로더 (큐레이션 + 카테고리 필터) ──────────

/** 카테고리 폴더 검증 — 디자인 레퍼런스인지 상품 mockup인지 */
const KNOWN_BAD_CATEGORY_FOLDERS = new Set([
  // 현재 docs/references/식품/ 등은 스마트스토어 상품 사진 (디자인 ref 아님)
  // 검증 후 다시 활성화
  '식품', '뷰티', '패션', '건강-영양제', '가구-인테리어', '반려동물', '스포츠',
])

const V5_SECTIONS = ['hero', 'brand_story', 'key_benefit', 'ingredients', 'process', 'sensory', 'packaging', 'cta']

/** 섹션별 레퍼런스 로드 (Pinterest 큐레이션 결과). */
function loadSectionRefsFromFs(perSection = 3): { section: string; paths: string[] }[] {
  const sectionsDir = path.join(process.cwd(), 'docs', 'references', 'sections')
  return V5_SECTIONS.map(section => {
    const dir = path.join(sectionsDir, section)
    if (!fs.existsSync(dir)) return { section, paths: [] }
    return {
      section,
      paths: fs.readdirSync(dir)
        .filter(f => /\.(png|jpg|jpeg)$/i.test(f))
        .sort(() => Math.random() - 0.5)
        .slice(0, perSection)
        .map(f => path.join(dir, f)),
    }
  })
}

/** 카테고리 통합 ref — 큐레이션 통과한 폴더만 (현재는 모두 스킵 — 검증 후 재활성). */
function loadCategoryRefsFromFs(category: string, count = 5): string[] {
  // 한글 카테고리 디렉토리 매핑
  const map: Record<string, string> = {
    food: '식품', beauty: '뷰티', fashion: '패션',
    'health-food': '건강-영양제', living: '가구-인테리어',
    furniture: '가구-인테리어', pet: '반려동물', sports: '스포츠',
  }
  const dir = map[category]
  if (!dir || KNOWN_BAD_CATEGORY_FOLDERS.has(dir)) {
    console.log(`  [DR] 카테고리 폴더 "${dir ?? category}" 스킵 — 디자인 ref 아님 (상품 mockup)`)
    return []
  }
  const refDir = path.join(process.cwd(), 'docs', 'references', dir)
  if (!fs.existsSync(refDir)) return []
  return fs.readdirSync(refDir)
    .filter(f => /\.(png|jpg|jpeg)$/i.test(f))
    .sort()
    .slice(0, count)
    .map(f => path.join(refDir, f))
}

// ── 메인 함수 ─────────────────────────────────────────────────────

export interface DesignReferences {
  /** 카테고리 통합 ref (큐레이션 통과한 것만 — 현재는 빈 배열) */
  categoryRefs: string[]
  /** 웹 스크래핑 결과 (Naver/Pinterest/Notefolio/Wadiz) */
  webRefs: string[]
  /** 섹션별 레퍼런스 (Pinterest 큐레이션) */
  sectionRefs: { section: string; paths: string[] }[]
}

/**
 * 통합 레퍼런스 수집 — 파일 + 웹 스크래핑.
 * AD에 전달 시: webRefs + categoryRefs는 referenceImagePaths로, sectionRefs는 별도 파라미터.
 */
export async function collectReferences(
  category: string,
  toneKeywords: string[],
  outputDir: string,
  options: { perSectionRefs?: number; countPerWebSource?: number; webScrape?: boolean } = {}
): Promise<DesignReferences> {
  const { perSectionRefs = 3, countPerWebSource = 4, webScrape = true } = options
  console.log(`[Design Researcher] 통합 레퍼런스 수집 (카테고리: ${category})`)

  // 1) 파일 시스템: 섹션별 ref + 카테고리 통합 ref
  const sectionRefs = loadSectionRefsFromFs(perSectionRefs)
  const categoryRefs = loadCategoryRefsFromFs(category, 5)
  console.log(`  파일: 섹션 ref ${sectionRefs.reduce((n, s) => n + s.paths.length, 0)}장 + 카테고리 ref ${categoryRefs.length}장`)

  // 2) 웹 스크래핑 (실패해도 무시)
  let webRefs: string[] = []
  if (webScrape) {
    try {
      webRefs = await runDesignResearcherWebOnly(category, toneKeywords, outputDir, countPerWebSource)
    } catch (err: unknown) {
      console.warn('  웹 스크래핑 실패 — 스킵:', err instanceof Error ? err.message.substring(0, 80) : String(err))
    }
  }

  return { categoryRefs, webRefs, sectionRefs }
}

/** 기존 웹 스크래핑만 분리 (호환용 + 내부 사용). */
async function runDesignResearcherWebOnly(
  category: string,
  toneKeywords: string[],
  outputDir: string,
  countPerSource = 4
): Promise<string[]> {
  console.log(`[Design Researcher] 멀티소스 스크래핑 시작 (카테고리: ${category})`)

  const refDir = path.join(outputDir, 'design-refs')
  if (!fs.existsSync(refDir)) fs.mkdirSync(refDir, { recursive: true })

  const browser = await chromium.launch({ channel: 'chrome', headless: true }).catch(async () => {
    // 시스템 Chrome 없으면 Chromium 실행 시도
    return chromium.launch({ headless: true })
  })

  try {
    const naverQuery = NAVER_QUERIES[category] ?? `${category} 상세페이지 디자인`
    const pinterestQuery = PINTEREST_QUERIES[category] ?? `${category} 상세페이지`

    // 모든 소스 병렬 실행 (실패해도 나머지 계속)
    const [naverUrls, pinterestUrls, notofolioUrls, wadizUrls] = await Promise.all([
      scrapeNaver(browser, naverQuery, countPerSource).catch(() => [] as string[]),
      scrapePinterest(browser, pinterestQuery, countPerSource).catch(() => [] as string[]),
      scrapeNotefolio(browser, category, countPerSource).catch(() => [] as string[]),
      scrapeWadiz(browser, category, countPerSource).catch(() => [] as string[]),
    ])

    console.log(
      `[Design Researcher] 수집: Naver ${naverUrls.length}장 + Pinterest ${pinterestUrls.length}장` +
      ` + 노트폴리오 ${notofolioUrls.length}장 + 와디즈 ${wadizUrls.length}장`  // notefolio.net
    )

    // 각 소스별로 분리 저장 (디버깅 편의)
    const [s1, s2, s3, s4] = await Promise.all([
      downloadImages(naverUrls, refDir, 'naver'),
      downloadImages(pinterestUrls, refDir, 'pinterest'),
      downloadImages(notofolioUrls, refDir, 'notofolio'),
      downloadImages(wadizUrls, refDir, 'wadiz'),
    ])

    const allSaved = [...s1, ...s2, ...s3, ...s4]
    console.log(`[Design Researcher] ${allSaved.length}장 최종 저장 → design-refs/`)
    return allSaved
  } finally {
    await browser.close()
  }
}

/** 호환용 — 기존 PM 코드가 string[] 기대. 신규 코드는 collectReferences 사용 권장. */
export async function runDesignResearcher(
  category: string,
  toneKeywords: string[],
  outputDir: string,
  countPerSource = 4
): Promise<string[]> {
  return runDesignResearcherWebOnly(category, toneKeywords, outputDir, countPerSource)
}
