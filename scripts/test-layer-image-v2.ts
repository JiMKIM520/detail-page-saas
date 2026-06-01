/**
 * 레이어 이미지 v4 (섹션별 전용 프롬프트 + StyleGuide 전체 활용 + 레퍼런스 5장)
 * 소금빵 1개 프로젝트만 실행
 */
import { runLayerImage } from '../agents/layer-image'
import * as fs from 'fs'
import * as path from 'path'
import { execFileSync } from 'child_process'

const projectDir = path.join(process.cwd(), 'output/512266a3')

const sg = JSON.parse(fs.readFileSync(path.join(projectDir, 'style-guide.json'), 'utf8'))
const sc = JSON.parse(fs.readFileSync(path.join(projectDir, '1_script/script.json'), 'utf8'))

const ssDir = path.join(projectDir, '2_styling_shots')
const shots = fs.readdirSync(ssDir).filter(f => /\.(jpg|png)$/i.test(f)).sort().map(f => path.join(ssDir, f))

const nukkiPaths = shots.slice(0, 1)

const ssp = JSON.parse(fs.readFileSync(path.join(projectDir, 'styling-shots-prompts.json'), 'utf8'))
const conceptShots = ssp.conceptShots || []

const outDir = path.join(projectDir, '3_layer_images_v4')
fs.mkdirSync(outDir, { recursive: true })

async function main() {
  console.log('=== 레이어 이미지 v4 테스트 (섹션 전용 + StyleGuide 전체 + 레퍼런스 5장) ===')
  console.log(`프로젝트: 소금빵 (512266a3)`)
  console.log(`스타일링샷: ${shots.length}장`)
  console.log(`컨셉샷: ${conceptShots.length}장`)
  console.log(`출력: ${outDir}\n`)

  const result = await runLayerImage(sc, sg, shots, nukkiPaths, outDir, conceptShots)

  console.log('\n=== 결과 ===')
  console.log(`성공: ${result.success}`)

  if (result.data) {
    for (const [key, filePath] of Object.entries(result.data)) {
      const size = (fs.statSync(filePath as string).size / 1024 / 1024).toFixed(1)
      console.log(`  ${key}: ${size}MB`)
    }
    const files = Object.values(result.data) as string[]
    if (files.length > 0) execFileSync('open', files)
  }
}

main().catch(err => console.error('에러:', err.message))
