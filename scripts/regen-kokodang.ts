/**
 * 코코댕 초안 재생성 (P0 검증용) — runPipelineForProject를 그대로 호출.
 * USE_BLOCKS_COMPOSER=true 강제 + 브랜드색/프리셋/스타일링샷 적용 경로 검증.
 */
import { runPipelineForProject } from '@/lib/pipeline-bridge'

const KOKODANG = '55ac6701-3c16-44a6-b111-83c67137f3a5'

async function main() {
  process.env.USE_BLOCKS_COMPOSER = 'true'
  console.log('[regen] 코코댕 초안 재생성 시작…')
  const res = await runPipelineForProject(KOKODANG)
  console.log('[regen] 결과:', JSON.stringify(res))
  process.exit(res.success ? 0 : 1)
}

main().catch((e) => {
  console.error('[regen] 예외:', e)
  process.exit(1)
})
