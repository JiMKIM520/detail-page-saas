import { createClient } from '@/lib/supabase/server'
import { STATUS_LABELS, type ProjectStatus } from '@/lib/status-machine'
import Link from 'next/link'

interface StageGroup {
  key: string
  label: string
  statuses: ProjectStatus[]
  accent: string
  href: (id: string) => string
}

// status 13단계 → 운영 작업 5그룹 (칸반 컬럼)
const STAGE_GROUPS: StageGroup[] = [
  { key: 'script', label: '접수 · 스크립트', accent: 'border-t-slate-400', href: (id) => `/planner/${id}`,
    statuses: ['intake_submitted', 'script_generating', 'script_review', 'script_approved'] },
  { key: 'plan', label: '디자인 기획', accent: 'border-t-violet-400', href: (id) => `/planner/${id}`,
    statuses: ['design_planning', 'design_plan_review'] },
  { key: 'styling', label: '스타일링샷 제작', accent: 'border-t-emerald-400', href: (id) => `/photography/${id}`,
    statuses: ['prompt_ready', 'photo_scheduled', 'photo_uploaded'] },
  { key: 'draft', label: '초안 제작', accent: 'border-t-indigo-400', href: (id) => `/designer/${id}`,
    statuses: ['design_generating', 'design_review'] },
  { key: 'done', label: '완료', accent: 'border-t-blue-400', href: (id) => `/designer/${id}`,
    statuses: ['design_approved', 'delivered'] },
]

interface ProjectRow {
  id: string
  company_name: string
  status: ProjectStatus
  category: string | null
  planner_id: string | null
  designer_id: string | null
  created_at: string
  platforms: { name?: string } | null
}

function daysSince(iso: string): number {
  // 서버에서 한 번만 계산 (Date 사용은 서버 컴포넌트라 안전)
  const ms = Date.now() - new Date(iso).getTime()
  return Math.max(0, Math.floor(ms / 86_400_000))
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('projects')
    .select('id, company_name, status, category, planner_id, designer_id, created_at, platforms(name)')
    .order('created_at', { ascending: true })

  const projects = (data ?? []) as unknown as ProjectRow[]

  // 담당자 이름 매핑 (user_profiles — RLS상 admin/planner/designer 읽기 가능)
  const { data: staffData } = await supabase.from('user_profiles').select('id, name').in('role', ['planner', 'designer'])
  const nameOf = new Map((staffData ?? []).map((s) => [s.id as string, (s.name as string | null) ?? '']))

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">진행 대시보드</h1>
        <p className="text-sm text-text-tertiary mt-1">전체 프로젝트를 단계별로 확인하고 담당자를 배정하세요</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {STAGE_GROUPS.map((group) => {
          const items = projects.filter((p) => group.statuses.includes(p.status))
          return (
            <div key={group.key} className={`bg-surface rounded-xl border border-border border-t-4 ${group.accent} p-3`}>
              <div className="flex items-center justify-between px-1 mb-3">
                <h2 className="text-sm font-semibold text-text-primary">{group.label}</h2>
                <span className="text-xs font-medium text-text-tertiary bg-surface-active rounded-full px-2 py-0.5">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map((p) => {
                  const assigned = p.planner_id || p.designer_id
                  const days = daysSince(p.created_at)
                  return (
                    <Link key={p.id} href={group.href(p.id)}
                      className="block bg-white rounded-lg border border-border p-3 hover:border-primary-300 hover:shadow-sm transition-all">
                      <p className="text-sm font-semibold text-text-primary truncate">{p.company_name}</p>
                      <p className="text-xs text-text-tertiary mt-0.5 truncate">
                        {p.platforms?.name ?? '-'} · {p.category ?? '-'}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[11px] text-text-secondary">{STATUS_LABELS[p.status]}</span>
                        <span className={`text-[11px] ${days >= 7 ? 'text-red-500 font-medium' : 'text-text-tertiary'}`}>{days}일</span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {p.planner_id && <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-50 text-violet-700">기획 {nameOf.get(p.planner_id) || '?'}</span>}
                        {p.designer_id && <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">디자인 {nameOf.get(p.designer_id) || '?'}</span>}
                        {!assigned && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700">미배정</span>}
                      </div>
                    </Link>
                  )
                })}
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
