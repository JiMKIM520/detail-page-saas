import { createServiceClient } from '@/lib/supabase/service'
import { generateDesignForProject } from '@/lib/ai/generate-design'
;(async () => {
  const s = createServiceClient()
  const pid = 'c0ff7994-4c13-4bbf-9ddd-d621bcfd5096'
  await s.from('projects').update({ status: 'photo_uploaded' }).eq('id', pid)
  console.log('[reroll] 쌀과밀 초안 재생성 시작', new Date().toISOString())
  await generateDesignForProject(pid)
  const { data: p } = await s.from('projects').select('status').eq('id', pid).single()
  console.log('[reroll] 완료 status=', p?.status)
})()
