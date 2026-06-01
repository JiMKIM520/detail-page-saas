/**
 * 특정 프로젝트의 현재 status + 최신 script + 최근 로그를 조회 (검증용, 읽기 전용)
 * 사용: npx tsx --env-file=.env.local scripts/check-project-state.ts <projectId>
 */
import { createClient } from '@supabase/supabase-js'

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) { console.error('env 누락'); process.exit(1) }
  const projectId = process.argv[2] || '5d2f266f-4f34-4562-9223-6d3050b518b2'
  const s = createClient(url, key, { auth: { persistSession: false } })

  const { data: project } = await s.from('projects').select('company_name, status, updated_at').eq('id', projectId).single()
  console.log('=== 프로젝트 ===')
  console.log(`${project?.company_name}  status=${project?.status}  updated=${project?.updated_at}`)

  const { data: scripts } = await s.from('scripts').select('id, ai_model, created_at, content').eq('project_id', projectId).order('created_at', { ascending: false }).limit(2)
  console.log(`\n=== scripts (${scripts?.length ?? 0}건, 최신순) ===`)
  for (const sc of scripts ?? []) {
    const content = sc.content as { sections?: unknown[]; tone?: string } | null
    const secs = Array.isArray(content?.sections) ? content!.sections!.length : 'N/A'
    const flat = JSON.stringify(content)
    const isDummy = /더미|테스트용|데모용 스크립트|설명1|강점1/.test(flat)
    const hasReal = /순대|돼지|국내산|수제/.test(flat)
    console.log(`- ${sc.created_at} | model=${sc.ai_model} | sections=${secs} | 더미흔적=${isDummy ? 'YES' : 'no'} | 제품정보=${hasReal ? 'YES' : 'no'}`)
  }

  const { data: logs } = await s.from('project_logs').select('created_at, from_status, to_status, note').eq('project_id', projectId).order('created_at', { ascending: false }).limit(6)
  console.log(`\n=== 최근 project_logs ===`)
  for (const l of logs ?? []) {
    console.log(`- ${l.created_at} ${l.from_status}→${l.to_status}: ${(l.note ?? '').slice(0, 120)}`)
  }
}
main()
