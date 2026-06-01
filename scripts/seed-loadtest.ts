// 200개 동시 진행 스케일 검증용 더미 프로젝트. company_name "[LOADTEST]" 접두. 검증 후 삭제.
import { createClient } from '@supabase/supabase-js'
const ADMIN = 'aa05a40f-5724-4203-9571-5332773a4a7d'
const PLANNERS = ['8331518e-18fe-42a0-a3b3-7302434e5d8d', 'efffc4f8-0f8a-4467-b191-f460a6d04de9', null]
const DESIGNERS = ['d41ba001-0847-49a2-a2f5-e947e9130183', 'de64f7fe-6dff-4051-947b-8aaa0c9a397d', null]
const STATUSES = ['intake_submitted','script_generating','script_review','script_approved','design_planning','design_plan_review','prompt_ready','photo_uploaded','design_generating','design_review','design_approved','delivered']
const NAMES = ['김상점','이상회','박마트','최식품','정푸드','강상사','조마켓','윤유통','장상점','임식품']
;(async () => {
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth:{persistSession:false} })
  const { data: platform } = await s.from('platforms').select('id').limit(1).maybeSingle()
  const rows = Array.from({ length: 200 }, (_, i) => {
    const daysAgo = i % 25 // 0~24일 전 (지연 테스트)
    const created = new Date(Date.now() - daysAgo * 86400000).toISOString()
    return {
      client_id: ADMIN,
      company_name: `[LOADTEST] ${NAMES[i % NAMES.length]}${i}`,
      category: 'food',
      platform_id: platform?.id ?? null,
      status: STATUSES[i % STATUSES.length],
      planner_id: PLANNERS[i % PLANNERS.length],
      designer_id: DESIGNERS[i % DESIGNERS.length],
      product_highlights: '로드테스트 더미',
      created_at: created,
    }
  })
  // 배치 삽입 (100개씩)
  let inserted = 0
  for (let i = 0; i < rows.length; i += 100) {
    const { error, count } = await s.from('projects').insert(rows.slice(i, i+100)).select('id', { count: 'exact' })
    if (error) { console.error('insert err:', error.message); }
    else inserted += (count ?? 100)
  }
  const { count } = await s.from('projects').select('id', { count:'exact', head:true }).ilike('company_name', '[LOADTEST]%')
  console.log(`삽입 완료. [LOADTEST] 총 ${count}개 (이번 ${inserted})`)
})()
