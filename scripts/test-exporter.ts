/**
 * Exporter 에이전트 단독 테스트
 * 기존 파이프라인 결과물 3개에 대해 export 실행
 */

import { runExporter } from '../agents/exporter'
import * as path from 'path'

const BASE = '/Users/jinman/Desktop/Projects/Product-Detail-Page-Automation/output'

const projects = [
  { id: '512266a3', name: '천연발효종 강릉 고메코나 소금빵' },
  { id: '06c2a947', name: '60년고구마잡채순대' },
  { id: 'a027f627', name: '청국콩을 먹은 황태과립' },
]

;(async () => {
  console.log('=== Exporter 테스트 ===\n')

  for (const { id, name } of projects) {
    console.log(`\n── ${name} (${id}) ──`)
    const htmlPath = path.join(BASE, id, '4_final', 'index.html')
    const outputDir = path.join(BASE, id)

    const result = await runExporter(htmlPath, outputDir)

    console.log(`\n결과:`)
    console.log(`  성공: ${result.success ? '✅' : '❌'}`)
    console.log(`  Mobile: 섹션 ${result.mobileSectionCount}장 | ${result.mobileZip ? '✅ mobile.zip' : '❌'}`)
    console.log(`  PC:     섹션 ${result.pcSectionCount}장 | ${result.pcZip ? '✅ pc.zip' : '❌'}`)
    console.log(`  Designer: ${result.designerZip ? '✅ designer.zip' : '❌'}`)
    console.log(`  출력: ${result.exportDir}`)
  }

  console.log('\n=== 완료 ===')
})()
