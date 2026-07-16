/**
 * 페이지 스펙 재렌더 유틸 — page-spec.json → HTML 파일.
 *
 * 사용법:
 *   npx tsx scripts/rerender-spec.ts <page-spec.json 경로> <출력 html 경로>
 *
 * 예:
 *   npx tsx scripts/rerender-spec.ts output/6a1f1370/page-spec.json /tmp/out.html
 */

import { readFileSync, writeFileSync } from 'fs'

// 블록 시스템 초기화 (registerBlocks 사이드이펙트 포함)
import { renderPage } from '../agents/templates/blocks/index'
import type { PageSpec } from '../agents/templates/blocks/types'

const [, , specPath, outPath] = process.argv

if (!specPath || !outPath) {
  console.error('Usage: npx tsx scripts/rerender-spec.ts <page-spec.json> <output.html>')
  process.exit(1)
}

let spec: PageSpec
try {
  spec = JSON.parse(readFileSync(specPath, 'utf-8')) as PageSpec
} catch (err) {
  console.error(`[rerender-spec] 스펙 파일 읽기 실패: ${specPath}`)
  console.error(err)
  process.exit(1)
}

const { html, blockCount, usedVariants } = renderPage(spec)

writeFileSync(outPath, html, 'utf-8')

// 장식 주입 확인
const dLCount = (html.match(/class="dL"/g) ?? []).length

console.log(`렌더 완료: ${blockCount}블록 / ${usedVariants.length}변형 → ${outPath}`)
console.log(`.dL 주입 수: ${dLCount}`)
