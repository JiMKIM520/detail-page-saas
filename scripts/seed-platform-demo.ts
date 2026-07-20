/**
 * 플랫폼 워크플로 데모 시드 — 칸반 3종(관리자 현황판·시안 보드·디자이너 보드)이
 * 실제 운영 화면처럼 보이도록 각 단계·태그·D-day·담당자를 갖춘 프로젝트를 만든다.
 *
 * 원칙: 기존 프로젝트(실제 파이프라인 산출물 보유)는 status를 건드리지 않는다.
 *       담당자·D-day만 보강하고, 비어 있는 단계는 데모 프로젝트를 추가로 만든다.
 *
 * 사용: npx tsx --env-file=.env.local scripts/seed-platform-demo.ts [--reset]
 *       --reset: 이전에 만든 데모 프로젝트(회사명 prefix '[데모]')를 지우고 다시 만든다.
 */
import { createClient } from '@supabase/supabase-js'

const DEMO_PREFIX = '[데모]'

/** D-day 기준 — 오늘로부터 n일 후 */
function dueIn(days: number): string {
  return new Date(Date.now() + days * 86400_000).toISOString()
}

interface DemoSpec {
  company: string
  status: string
  designer?: 'park' | 'choi'
  dueDays?: number
  tags?: Record<string, unknown>
  revisionCount?: number
  productReceived?: boolean
}

/** PDF 작업 흐름의 각 칸을 최소 1장씩 채우는 구성 */
const DEMO_SPECS: DemoSpec[] = [
  // 관리자 현황판 — 메일전송
  { company: '초록마을식품', status: 'invited', dueDays: 21 },
  { company: '바다원수산', status: 'invited', dueDays: 20 },
  // 관리자 현황판 — 작업의뢰서(보완 태그 포함)
  { company: '온담김치', status: 'intake_submitted', dueDays: 18, productReceived: true },
  { company: '청담뷰티랩', status: 'intake_submitted', dueDays: 17, tags: { revise: true } },
  // 관리자 현황판 — 스크립트·스타일링
  { company: '한울제과', status: 'script_review', designer: 'park', dueDays: 14, productReceived: true },
  // 관리자 현황판 — AI초안
  { company: '더진한커피', status: 'design_generating', designer: 'choi', dueDays: 12, productReceived: true },
  // 디자이너 보드 — 작업중
  { company: '숲으로가구', status: 'designer_working', designer: 'park', dueDays: 10, productReceived: true },
  // 시안 보드 — 1차시안(검토중)
  { company: '나린화장품', status: 'draft_submitted', designer: 'choi', dueDays: 8, tags: { reviewing: true }, productReceived: true },
  // 시안 보드 — 1차시안(관리자 보완 요청)
  { company: '들녘농산', status: 'draft_submitted', designer: 'park', dueDays: 7, tags: { revise: true }, productReceived: true },
  // 시안 보드 — 기업 수정요청
  { company: '미소반찬', status: 'revision_1', designer: 'choi', dueDays: 5, tags: { revision_n: 1 }, revisionCount: 1, productReceived: true },
  // 시안 보드 — 완료
  { company: 'golden올리브', status: 'delivered', designer: 'park', dueDays: 3, productReceived: true },
]

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env 누락')
  const s = createClient(url, key, { auth: { persistSession: false } })
  const reset = process.argv.includes('--reset')

  // 참조 데이터
  const { data: clients } = await s.from('user_profiles').select('id, name').eq('role', 'client')
  const { data: staff } = await s.from('user_profiles').select('id, name').eq('role', 'designer')
  const { data: platforms } = await s.from('platforms').select('id, slug')
  if (!clients?.length || !staff?.length || !platforms?.length) throw new Error('참조 데이터 부족(client/designer/platform)')

  const park = staff.find((x) => x.name === '박디자인')?.id ?? staff[0].id
  const choi = staff.find((x) => x.name === '최디자인')?.id ?? staff[staff.length - 1].id
  const smartstore = platforms.find((p) => p.slug === 'smartstore')?.id ?? platforms[0].id
  const coupang = platforms.find((p) => p.slug === 'coupang')?.id ?? platforms[0].id

  if (reset) {
    const { data: old } = await s.from('projects').select('id').like('company_name', `${DEMO_PREFIX}%`)
    if (old?.length) {
      await s.from('projects').delete().in('id', old.map((o) => o.id))
      console.log(`[seed] 기존 데모 프로젝트 ${old.length}건 삭제`)
    }
  }

  // 1) 데모 프로젝트 생성 — 각 단계를 채운다
  let created = 0
  for (const [i, spec] of DEMO_SPECS.entries()) {
    const company = `${DEMO_PREFIX} ${spec.company}`
    const { data: exists } = await s.from('projects').select('id').eq('company_name', company).maybeSingle()
    if (exists) continue
    const designerId = spec.designer === 'park' ? park : spec.designer === 'choi' ? choi : null
    const { error } = await s.from('projects').insert({
      client_id: clients[i % clients.length].id,
      designer_id: designerId,
      status: spec.status,
      company_name: company,
      product_name: `${spec.company} 대표상품`,
      category: i % 3 === 0 ? 'beauty' : 'food',
      platform_id: i % 2 === 0 ? smartstore : coupang,
      product_highlights: '데모용 프로젝트 — 플랫폼 워크플로 시연 데이터',
      due_date: spec.dueDays ? dueIn(spec.dueDays) : null,
      product_received_at: spec.productReceived ? new Date().toISOString() : null,
      intake_approved_at: spec.productReceived ? new Date().toISOString() : null,
      tags: spec.tags ?? {},
      revision_count: spec.revisionCount ?? 0,
    })
    if (error) {
      console.warn(`[seed] ${company} 생성 실패: ${error.message}`)
      continue
    }
    created++
  }
  console.log(`[seed] 데모 프로젝트 ${created}건 생성`)

  // 2) 기존 실제 프로젝트 보강 — status는 불변, 담당자·D-day만 채워 카드가 살아 보이게
  const { data: real } = await s
    .from('projects')
    .select('id, company_name, designer_id, due_date')
    .not('company_name', 'like', `${DEMO_PREFIX}%`)
  let patched = 0
  for (const [i, p] of (real ?? []).entries()) {
    const patch: Record<string, unknown> = {}
    if (!p.designer_id) patch.designer_id = i % 2 === 0 ? park : choi
    if (!p.due_date) patch.due_date = dueIn(14 - i)
    if (!Object.keys(patch).length) continue
    const { error } = await s.from('projects').update(patch).eq('id', p.id)
    if (!error) patched++
  }
  console.log(`[seed] 기존 프로젝트 ${patched}건 보강(담당자·D-day)`)

  // 3) 결과 확인
  const { data: all } = await s.from('projects').select('status').order('status')
  const dist: Record<string, number> = {}
  for (const r of all ?? []) dist[r.status] = (dist[r.status] ?? 0) + 1
  console.log('[seed] 상태 분포:', JSON.stringify(dist, null, 1))
}

main().catch((e) => {
  console.error('[seed] 실패:', e)
  process.exit(1)
})
