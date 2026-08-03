import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'
import DashboardList, { type ListProject } from '@/components/admin/DashboardList'
import type { ProjectStatus } from '@/lib/status-machine'

/**
 * 진행 대시보드 — 전 단계를 한 화면에서 단계별 리스트로.
 *
 * 기존 4열 칸반 + 별도 시안보드(3열)를 하나의 리스트로 합쳤다. 작성대기(초대) 200개가
 * 들어와도 그룹을 접으면 스크롤이 짧다. 실제 판단·작업은 행을 눌러 각 단계 페이지에서 한다.
 */

interface RawRow {
  id: string
  company_name: string
  status: ProjectStatus
  category: string | null
  designer_id: string | null
  due_date: string | null
  created_at: string
  tags: Record<string, boolean> | null
  platforms: { name?: string } | null
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.user_metadata?.role !== 'admin') redirect('/designer')

  const svc = createServiceClient()

  const { data: staffData } = await svc
    .from('user_profiles')
    .select('id, name')
    .eq('role', 'designer')
    .order('name')
  const staff = (staffData ?? []).map((s) => ({ id: s.id as string, name: (s.name as string) ?? '이름없음' }))
  const nameOf = new Map(staff.map((s) => [s.id, s.name]))

  // 전 상태 조회 — 필터/그룹은 클라이언트에서 (200개는 즉시 처리)
  const { data } = await svc
    .from('projects')
    .select('id, company_name, status, category, designer_id, due_date, created_at, tags, platforms(name)')
    .order('created_at', { ascending: true })

  const rows = (data ?? []) as unknown as RawRow[]
  const projects: ListProject[] = rows.map((p) => ({
    id: p.id,
    company_name: p.company_name,
    status: p.status,
    category: p.category,
    platform_name: p.platforms?.name ?? null,
    designer_id: p.designer_id,
    designer_name: p.designer_id ? (nameOf.get(p.designer_id) ?? null) : null,
    due_date: p.due_date,
    created_at: p.created_at,
    tags: p.tags,
  }))

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">진행 대시보드</h1>
        <p className="text-sm text-gray-400 mt-1">
          전체 {projects.length}건 · 단계별로 확인하고 행을 눌러 작업 페이지로 이동하세요
        </p>
      </div>

      <DashboardList projects={projects} staff={staff} />
    </div>
  )
}
