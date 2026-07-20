import { createClient } from '@/lib/supabase/server'
import { type ProjectStatus } from '@/lib/status-machine'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { KanbanCard } from '@/components/shared/KanbanCard'
import { sortKanbanCards, type KanbanProject } from '@/components/shared/kanban'

interface ReviewGroup {
  key: string
  label: string
  statuses: ProjectStatus[]
  accent: string
  /** 상세/작업 화면 링크 */
  href: (id: string) => string
  /** true 이면 만족/불만족 액션 버튼 표시 */
  showActions: boolean
}

// PDF 화면2 기준 3열: 1차시안 / 기업 수정요청 / 완료
const REVIEW_GROUPS: ReviewGroup[] = [
  {
    key: 'draft',
    label: '1차시안',
    accent: 'border-t-orange-400',
    href: (id) => `/designer/${id}`,
    statuses: ['draft_submitted', 'design_review'],
    showActions: true,
  },
  {
    key: 'revision',
    label: '기업 수정요청',
    accent: 'border-t-rose-400',
    href: (id) => `/designer/${id}`,
    statuses: ['revision_1', 'revision_2'],
    showActions: true,
  },
  {
    key: 'done',
    label: '완료',
    accent: 'border-t-teal-400',
    href: (id) => `/designer/${id}`,
    statuses: ['design_approved', 'delivered'],
    showActions: false,
  },
]

const REVIEW_STATUSES: ProjectStatus[] = REVIEW_GROUPS.flatMap((g) => g.statuses)

interface ProjectRow extends KanbanProject {
  platforms: { name?: string } | null
}

interface StaffRow {
  id: string
  name: string | null
}

export default async function ReviewBoardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.user_metadata?.role !== 'admin') redirect('/designer')

  // 디자이너 이름 맵
  const { data: staffData } = await supabase
    .from('user_profiles')
    .select('id, name')
    .eq('role', 'designer')
    .order('name')
  const staffList = (staffData ?? []) as StaffRow[]
  const nameOf = new Map(staffList.map((s) => [s.id, s.name ?? '']))

  // 시안 보드 대상 프로젝트 조회
  const { data } = await supabase
    .from('projects')
    .select(
      'id, company_name, status, category, designer_id, created_at, due_date, tags, product_received_at, platforms(name)',
    )
    .in('status', REVIEW_STATUSES)
    .order('created_at', { ascending: true })

  const rawProjects = (data ?? []) as unknown as ProjectRow[]

  // 디자이너 이름 첨부
  const projects: ProjectRow[] = rawProjects.map((p) => ({
    ...p,
    designer_name: p.designer_id ? (nameOf.get(p.designer_id) ?? null) : null,
  }))

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">시안 보드</h1>
          <p className="text-sm text-text-tertiary mt-1">
            1차시안부터 완료까지 — 만족/불만족으로 다음 단계를 제어하세요
          </p>
        </div>
        <Link
          href="/dashboard"
          className="text-sm font-medium px-4 py-2 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:border-primary-300 transition-colors"
        >
          ← 진행 대시보드
        </Link>
      </div>

      {/* 3열 칸반 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {REVIEW_GROUPS.map((group) => {
          const raw = projects.filter((p) => group.statuses.includes(p.status))
          // 태그 최상단 점유 정렬 적용
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
                <span className="text-xs font-medium text-text-tertiary bg-surface-active rounded-full px-2 py-0.5">
                  {items.length}
                </span>
              </div>

              {/* 카드 스크롤 영역 */}
              <div className="overflow-y-auto px-3 pb-3 space-y-2" style={{ maxHeight: '75vh' }}>
                {items.map((p) => (
                  <KanbanCard
                    key={p.id}
                    project={p}
                    href={group.href(p.id)}
                    showActions={group.showActions}
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
