/**
 * 데모 검증용 클린 데이터 시드.
 * - 대시보드 5컬럼(접수·스크립트/디자인기획/스타일링샷/초안제작/완료) 모두 채움
 * - 기획자/디자이너/스타일링/사업자 화면이 모두 의미있게 보이도록 배치 (각 사업자당 1프로젝트, D-022)
 * 사용: env -u ANTHROPIC_API_KEY node_modules/.bin/tsx --env-file=.env.local scripts/seed-demo-clean.ts
 */
import { createClient } from '@supabase/supabase-js'

const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })
const PLATFORM = 'd6c3a3e3-f4ec-414f-b205-f6384e2c3fa7'
const SOGEUM = 'c0ff7994-4c13-4bbf-9ddd-d621bcfd5096'
const DONDUK = '5d2f266f-4f34-4562-9223-6d3050b518b2'
const HWANGTAE = '5b919f67-b9b7-4c43-a33a-108bb05dd5d7'
const HEUKMANEUL = '6eee52ac-696b-4e54-b170-66a68a42d870'

async function main(): Promise<void> {
  const { data: au } = await s.auth.admin.listUsers()
  const id = (email: string) => au?.users?.find(u => u.email === email)?.id ?? null
  const planner1 = id('planner1@detailai.app'), designer1 = id('designer1@detailai.app')
  const demo = id('demo@detailai.app'), hwangtae = id('hwangtae@demo.kr'), sundae = id('sundae@demo.kr')
  const gomecona = id('gomecona@demo.kr'), jejuorange = id('jejuorange@demo.kr')

  const updates = [
    { id: SOGEUM, label: '쌀과밀 소금빵 → design_review (초안제작·디자이너검수·쇼케이스)', patch: { status: 'design_review', planner_id: planner1, designer_id: designer1, client_id: demo } },
    { id: DONDUK, label: '돈덕 순대 → delivered (완료)', patch: { status: 'delivered', planner_id: planner1, designer_id: designer1, client_id: sundae } },
    { id: HWANGTAE, label: '황태이야기 → script_review (접수·스크립트·기획자검수)', patch: { status: 'script_review', planner_id: planner1, designer_id: designer1, client_id: hwangtae } },
    { id: HEUKMANEUL, label: '청정원 흑마늘진액 → design_plan_review (디자인기획·기획자검수)', patch: { status: 'design_plan_review', planner_id: planner1, designer_id: designer1, client_id: gomecona } },
  ]
  for (const u of updates) {
    const { error } = await s.from('projects').update(u.patch).eq('id', u.id)
    console.log(error ? `❌ ${u.label}: ${error.message}` : `✅ ${u.label}`)
  }

  const { data: existNew } = await s.from('projects').select('id').eq('company_name', '제주 햇감귤청').maybeSingle()
  if (!existNew) {
    const { error } = await s.from('projects').insert({
      company_name: '제주 햇감귤청', status: 'prompt_ready', category: 'food', platform_id: PLATFORM,
      client_id: jejuorange, planner_id: planner1, designer_id: designer1,
      product_highlights: '제주산 노지 감귤 100%\n무방부제·무색소\n저온 숙성 청',
    })
    console.log(error ? `❌ 제주 햇감귤청 생성: ${error.message}` : `✅ 제주 햇감귤청 → prompt_ready (스타일링샷·photography)`)
  } else {
    await s.from('projects').update({ status: 'prompt_ready', planner_id: planner1, designer_id: designer1, client_id: jejuorange }).eq('id', existNew.id)
    console.log('✅ 제주 햇감귤청(기존) → prompt_ready')
  }

  const { data: ps } = await s.from('projects').select('company_name,status').order('created_at')
  const STAGE: Record<string, string> = {
    intake_submitted:'접수·스크립트', script_generating:'접수·스크립트', script_review:'접수·스크립트', script_approved:'접수·스크립트',
    design_planning:'디자인기획', design_plan_review:'디자인기획',
    prompt_ready:'스타일링샷', photo_scheduled:'스타일링샷', photo_uploaded:'스타일링샷',
    design_generating:'초안제작', design_review:'초안제작', design_approved:'완료', delivered:'완료',
  }
  console.log('\n=== 대시보드 분포 ===')
  const byCol: Record<string,string[]> = {}
  for (const p of ps ?? []) { const c = STAGE[p.status]||p.status; (byCol[c]=byCol[c]||[]).push(`${p.company_name}(${p.status})`) }
  for (const [c, list] of Object.entries(byCol)) console.log(`  [${c}] ${list.join(', ')}`)
}
main().catch(e => { console.error('FATAL', e.message); process.exit(1) })
