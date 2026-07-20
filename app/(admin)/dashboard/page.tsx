import { createClient } from '@/lib/supabase/server'
import { type ProjectStatus } from '@/lib/status-machine'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { KanbanCard } from '@/components/shared/KanbanCard'
import { sortKanbanCards, type KanbanProject } from '@/components/shared/kanban'

interface StageGroup {
  key: string
  label: string
  statuses: ProjectStatus[]
  accent: string
  href: (id: string) => string
}

// PDF 화면1 기준 4열: 메일전송 / 작업의뢰서 / 스크립트·스타일링 / AI초안
const STAGE_GROUPS: StageGroup[] = [
  {
    key: 'invited',
    label: '메일전송',
    accent: 'border-t-sky-400',
    href: (id) => `/planner/${id}`,
    statuses: ['invited'],
  },
  {
    key: 'intake',
    label: '작업의뢰서',
    accent: 'border-t-amber-400',
    href: (id) => `/planner/${id}`,
    statuses: ['intake_submitted'],
  },
  {
    key: 'script',
    label: '스크립트·스타일링',
    accent: 'border-t-emerald-400',
    href: (id) => `/planner/${id}`,
    statuses: [
      'script_generating',
      'script_review',
      'script_approved',
      'design_planning',
      'design_plan_review',
      'prompt_ready',
      'photo_scheduled',
      'photo_uploaded',
    ],
  },
  {
    key: 'draft',
    label: 'AI초안',
    accent: 'border-t-violet-400',
    href: (id) => `/designer/${id}`,
    statuses: ['design_generating', 'designer_working', 'design_failed'],
  },
]

// 이 대시보드가 담당하는 전체 상태 목록
const DASHBOARD_STATUSES: ProjectStatus[] = STAGE_GROUPS.flatMap((g) => g.statuses)

interface ProjectRow extends KanbanProject {
  platforms: { name?: string } | null
}

interface StaffRow {
  id: string
  name: string | null
  role: string
}

/** URL을 유지하면서 특정 파라미터만 교체한 href 생성 */
function buildHref(base: Record<string, string>, overrides: Record<string, string>): string {
  const merged = { ...base, ...overrides }
  const qs = Object.entries(merged)
    .filter(([, v]) => v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&')
  return `/dashboard${qs ? `?${qs}` : ''}`
}

interface PageProps {
  searchParams: Promise<Record<string, string>>
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = await searchParams
  const q       = (params.q       ?? '').trim()
  const assignee = params.assignee ?? ''
  const stage    = params.stage    ?? ''
  const aging    = Number(params.aging ?? 0)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.user_metadata?.role !== 'admin') redirect('/designer')

  // 담당자 목록 (필터 드롭다운 + 이름 맵)
  const { data: staffData } = await supabase
    .from('user_profiles')
    .select('id, name, role')
    .eq('role', 'designer')
    .order('name')
  const staffList = (staffData ?? []) as StaffRow[]
  const nameOf = new Map(staffList.map((s) => [s.id, s.name ?? '']))

  // 전체 카운트 (필터 미적용)
  const { data: allForCount } = await supabase
    .from('projects')
    .select('id, status, designer_id, created_at')
    .in('status', DASHBOARD_STATUSES)
  const allProjects = (allForCount ?? []) as Pick<
    ProjectRow, 'id' | 'status' | 'designer_id' | 'created_at'
  >[]

  // 메인 쿼리 (필터 적용 + S1 신규 컬럼 포함)
  type QueryBuilder = ReturnType<typeof supabase.from>
  let query: ReturnType<QueryBuilder['select']> = supabase
    .from('projects')
    .select(
      'id, company_name, status, category, designer_id, created_at, due_date, tags, product_received_at, platforms(name)',
    )
    .in('status', DASHBOARD_STATUSES)

  if (q) query = query.ilike('company_name', `%${q}%`)

  if (assignee === '미배정') {
    query = query.is('designer_id', null)
  } else if (assignee) {
    query = query.eq('designer_id', assignee)
  }

  if (stage) {
    const group = STAGE_GROUPS.find((g) => g.key === stage)
    if (group) query = query.in('status', group.statuses)
  }

  if (aging > 0) {
    const cutoff = new Date(Date.now() - aging * 86_400_000).toISOString()
    query = query.lte('created_at', cutoff)
  }

  query = query.order('created_at', { ascending: true })

  const { data } = await query
  const rawProjects = (data ?? []) as unknown as ProjectRow[]

  // 디자이너 이름 첨부
  const projects: ProjectRow[] = rawProjects.map((p) => ({
    ...p,
    designer_name: p.designer_id ? (nameOf.get(p.designer_id) ?? null) : null,
  }))

  const currentParams: Record<string, string> = {}
  if (q)         currentParams.q       = q
  if (assignee)  currentParams.assignee = assignee
  if (stage)     currentParams.stage    = stage
  if (aging > 0) currentParams.aging   = String(aging)

  const activeFilterCount = [q, assignee, stage, aging > 0].filter(Boolean).length

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">진행 대시보드</h1>
          <p className="text-sm text-text-tertiary mt-1">
            전체 프로젝트를 단계별로 확인하고 담당자를 배정하세요
          </p>
        </div>
        <Link
          href="/dashboard/review"
          className="text-sm font-medium px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
        >
          시안 보드 →
        </Link>
      </div>

      {/* 필터 바 */}
      <div className="bg-surface border border-border rounded-xl p-3 mb-5 flex flex-wrap items-center gap-2">
        {/* 회사명 검색 */}
        <form method="GET" action="/dashboard" className="flex-1 min-w-[180px]">
          {assignee && <input type="hidden" name="assignee" defaultValue={assignee} />}
          {stage    && <input type="hidden" name="stage"    defaultValue={stage} />}
          {aging > 0 && <input type="hidden" name="aging"  defaultValue={aging} />}
          <div className="relative">
            <svg
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              name="q"
              defaultValue={q}
              placeholder="회사명 검색…"
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>
        </form>

        {/* 담당자 필터 */}
        <div className="flex items-center gap-1 flex-wrap">
          {[
            { label: '전체', value: '' },
            { label: '미배정', value: '미배정' },
            ...staffList.map((s) => ({ label: s.name ?? s.id.slice(0, 6), value: s.id })),
          ].map(({ label, value }) => {
            const active = assignee === value
            return (
              <Link
                key={value || '_all_'}
                href={buildHref(currentParams, { assignee: value })}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-text-secondary border-border hover:border-primary-300'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </div>

        {/* 단계 필터 */}
        <div className="flex items-center gap-1 flex-wrap">
          {[
            { label: '전 단계', value: '' },
            ...STAGE_GROUPS.map((g) => ({ label: g.label, value: g.key })),
          ].map(({ label, value }) => {
            const active = stage === value
            return (
              <Link
                key={value || '_all_stage_'}
                href={buildHref(currentParams, { stage: value })}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-slate-700 text-white border-slate-700'
                    : 'bg-white text-text-secondary border-border hover:border-slate-400'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </div>

        {/* 지연 필터 */}
        <div className="flex items-center gap-1">
          {[
            { label: '지연 전체', value: 0 },
            { label: '7일↑',  value: 7 },
            { label: '14일↑', value: 14 },
            { label: '30일↑', value: 30 },
          ].map(({ label, value }) => {
            const active = aging === value
            return (
              <Link
                key={value}
                href={buildHref(currentParams, { aging: value > 0 ? String(value) : '' })}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-white text-text-secondary border-border hover:border-red-300'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </div>

        {/* 필터 초기화 */}
        {activeFilterCount > 0 && (
          <Link
            href="/dashboard"
            className="text-xs px-2.5 py-1 rounded-lg border border-dashed border-text-tertiary text-text-tertiary hover:text-text-secondary transition-colors"
          >
            초기화 ×
          </Link>
        )}

        <span className="ml-auto text-xs text-text-tertiary whitespace-nowrap">
          {projects.length}건 표시
        </span>
      </div>

      {/* 칸반 컬럼 (4열) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {STAGE_GROUPS.map((group) => {
          const totalCount = allProjects.filter((p) =>
            group.statuses.includes(p.status as ProjectStatus),
          ).length
          const raw = projects.filter((p) => group.statuses.includes(p.status))
          const items = sortKanbanCards(raw)

          return (
            <div
              key={group.key}
              className={`bg-surface rounded-xl border border-border border-t-4 ${group.accent} flex flex-col`}
              style={{ minHeight: 0 }}
            >
              {/* 컬럼 헤더 */}
              <div className="flex items-center justify-between px-3 pt-3 pb-2">
                <h2 className="text-sm font-semibold text-text-primary">{group.label}</h2>
                <div className="flex items-center gap-1">
                  {items.length !== totalCount && (
                    <span className="text-[10px] font-medium text-primary-600 bg-primary-50 rounded-full px-1.5 py-0.5">
                      {items.length}
                    </span>
                  )}
                  <span className="text-xs font-medium text-text-tertiary bg-surface-active rounded-full px-2 py-0.5">
                    {totalCount}
                  </span>
                </div>
              </div>

              {/* 카드 스크롤 영역 */}
              <div className="overflow-y-auto px-3 pb-3 space-y-2" style={{ maxHeight: '70vh' }}>
                {items.map((p) => (
                  <KanbanCard
                    key={p.id}
                    project={p}
                    href={group.href(p.id)}
                    pipelineHref={`/pipeline/${p.id}`}
                  />
                ))}
                {items.length === 0 && (
                  <p className="text-xs text-text-tertiary text-center py-6">없음</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
