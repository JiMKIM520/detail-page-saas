import { createServiceClient } from '@/lib/supabase/service'
import { runPipelineForProject } from '@/lib/pipeline-bridge'
;(async () => {
  const s = createServiceClient()
  const pid = 'c0ff7994-4c13-4bbf-9ddd-d621bcfd5096' // 쌀과밀
  console.log('[tmpl] 소금빵 템플릿 경로(runPipelineForProject) 시작', new Date().toISOString())
  const r = await runPipelineForProject(pid)
  console.log('[tmpl] runPipeline 결과:', JSON.stringify(r))
  const { data: p } = await s.from('projects').select('status').eq('id', pid).single()
  console.log('[tmpl] status:', p?.status)
})()
