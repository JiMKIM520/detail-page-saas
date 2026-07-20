import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { STATUS_LABELS, type ProjectStatus } from '@/lib/status-machine'
import {
  sortKanbanCards,
  dDayLabel,
  dDayClass,
  TAG_LABELS,
  TAG_COLORS,
  type KanbanProject,
  type ProjectTags,
} from '@/components/shared/kanban'
import { StartWorkButton } from './StartWorkButton'

interface MyWorkColumn {
  key: string
  label: string
  accent: string
  statuses: ProjectStatus[]
  showStartWork: boolean
  showDraftLink: boolean
}

const MY_WORK_COLUMNS: MyWorkColumn[] = [
  {
    key: 'assigned',
    label: '작업배정',
    accent: 'border-t-amber-400',
    statuses: ['design_generating', 'revision_1', 'revision_2'],
    showStartWork: true,
    showDraftLink: false,
  },
  {
    key: 'working',
    label: '작업중',
    accent: 'border-t-blue-400',
    statuses: ['designer_working'],
    showStartWork: false,
    showDraftLink: true,
  },
  {
    key: 'draft',
    label: '1차시안',
    accent: 'border-t-violet-400',
    statuses: ['draft_submitted'],
    showStartWork: false,
    showDraftLink: false,
  },
  {
    key: 'done',
    label: '완료',
    accent: 'border-t-emerald-400',
    statuses: ['design_approved', 'delivered'],
    showStartWork: false,
    showDraftLink: false,
  },
]

function TagBadges({ tags }: { tags: ProjectTags | null | undefined }) {
  if (!tags) return null
  const active = (Object.keys(TAG_LABELS) as (keyof ProjectTags)[]).filter((k) => tags[k])
  if (active.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1 mt-1.5">
      {active.map((k) => (
        <span
          key={k as string}
          className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
            TAG_COLORS[k] ?? 'bg-gray-100 text-gray-600'
          }`}
        >
          {TAG_LABELS[k]}
        </span>
      ))}
    </div>
  )
}

export default async function MyWorkPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const userId = user.id
  const allStatuses = MY_WORK_COLUMNS.flatMap((c) => c.statuses)

  const { data } = await supabase
    .from('projects')
    .select('id, company_name, status, category, designer_id, created_at, due_date, tags, platforms(name)')
    .in('status', allStatuses)
    .eq('designer_id', userId)
    .order('created_at', { ascending: true })

  const projects = (data ?? []) as unknown as KanbanProject[]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">내 작업</h1>
        <p className="text-sm text-text-tertiary mt-1">배정된 프로젝트를 단계별로 확인하세요</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {MY_WORK_COLUMNS.map((col) => {
          const items = sortKanbanCards(
            projects.filter((p) => col.statuses.includes(p.status))
          )

          return (
            <div
              key={col.key}
              className={`bg-surface rounded-xl border border-border border-t-4 ${col.accent} flex flex-col`}
              style={{ minHeight: 0 }}
            >
              <div className="flex items-center justify-between px-3 pt-3 pb-2">
                <h2 className="text-sm font-semibold text-text-primary">{col.label}</h2>
                <span className="text-xs font-medium text-text-tertiary bg-surface-active rounded-full px-2 py-0.5">
                  {items.length}
                </span>
              </div>

              <div className="overflow-y-auto px-3 pb-3 space-y-2" style={{ maxHeight: '72vh' }}>
                {items.map((p) => {
                  const ddayStr = dDayLabel(p)
                  const ddayCls = dDayClass(p)
                  const platformName = p.platforms?.name ?? '-'

                  return (
                    <div
                      key={p.id}
                      className="bg-white rounded-lg border border-border p-3 hover:border-primary-300 hover:shadow-sm transition-all"
                    >
                      <Link href={`/designer/${p.id}`} className="block">
                        <p className="text-sm font-semibold text-text-primary truncate">
                          {p.company_name}
                        </p>
                        <p className="text-xs text-text-tertiary mt-0.5 truncate">
                          {platformName} · {p.category ?? '-'}
                        </p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[11px] text-text-secondary">
                            {STATUS_LABELS[p.status]}
                          </span>
                          <span className={`text-[11px] ${ddayCls}`}>{ddayStr}</span>
                        </div>
                        <TagBadges tags={p.tags} />
                      </Link>

                      {col.showStartWork && (
                        <StartWorkButton projectId={p.id} />
                      )}

                      {col.showDraftLink && (
                        <Link
                          href={`/designer/${p.id}`}
                          className="block w-full mt-2 text-xs py-1.5 px-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-medium text-center"
                        >
                          1차시안 제출
                        </Link>
                      )}
                    </div>
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
