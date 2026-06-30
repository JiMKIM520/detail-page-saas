import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/shared/StatusBadge'
import type { ProjectStatus } from '@/lib/status-machine'
import Link from 'next/link'

interface PageProps {
  searchParams: Promise<Record<string, string>>
}

export default async function PlannerDashboard({ searchParams }: PageProps) {
  const params = await searchParams
  const showAll = params.all === '1'

  const supabase = await createClient()

  // 현재 로그인 유저
  const { data: { user } } = await supabase.auth.getUser()
  const role = user?.user_metadata?.role as string | undefined
  const isAdmin = role === 'admin'

  // /planner는 관리자 전용(접수·스크립트 검수). 관리자는 전체 검수 대기 건을 본다.
  const query = supabase
    .from('projects')
    .select('id, company_name, status, category, created_at, platforms(name)')
    .in('status', ['script_review', 'script_generating', 'design_plan_review', 'design_planning'])
    .order('created_at', { ascending: true })

  const { data: projects } = await query

  const reviewCount    = projects?.filter(p => ['script_review', 'design_plan_review'].includes(p.status)).length ?? 0
  const generatingCount = projects?.filter(p => ['script_generating', 'design_planning'].includes(p.status)).length ?? 0

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">스크립트 검수</h1>
          <p className="text-sm text-text-tertiary mt-1">AI가 생성한 스크립트를 검수하고 승인하세요</p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/planner"
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                !showAll
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-text-secondary border-border hover:border-primary-300'
              }`}
            >
              내 작업
            </Link>
            <Link
              href="/planner?all=1"
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                showAll
                  ? 'bg-slate-700 text-white border-slate-700'
                  : 'bg-white text-text-secondary border-border hover:border-slate-400'
              }`}
            >
              전체 보기
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-sm text-text-tertiary">검수 대기</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">{reviewCount}</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-sm text-text-tertiary">생성 중</p>
          <p className="text-2xl font-bold text-amber-500 mt-1">{generatingCount}</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-sm text-text-tertiary">{isAdmin && showAll ? '전체' : '내 작업'}</p>
          <p className="text-2xl font-bold text-text-primary mt-1">{projects?.length ?? 0}</p>
        </div>
      </div>

      <div className="space-y-3">
        {projects?.map(project => (
          <Link key={project.id} href={`/planner/${project.id}`}>
            <div className="group bg-surface rounded-xl border border-border p-5 flex items-center justify-between hover:border-primary-300 hover:shadow-md transition-all">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-text-primary group-hover:text-primary-700 transition-colors">
                  {project.company_name}
                </p>
                <p className="text-sm text-text-tertiary mt-0.5">
                  {(project.platforms as { name?: string } | null)?.name} · {project.category} ·{' '}
                  {new Date(project.created_at).toLocaleDateString('ko-KR')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={project.status as ProjectStatus} />
                <svg className="w-4 h-4 text-text-tertiary group-hover:text-primary-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
        {!projects?.length && (
          <div className="text-center py-20 bg-surface rounded-2xl border border-border border-dashed">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
              </svg>
            </div>
            <p className="text-text-tertiary">
              {isAdmin && !showAll ? '배정된 작업이 없습니다' : '검수 대기 중인 프로젝트가 없습니다'}
            </p>
            {isAdmin && !showAll && (
              <Link href="/planner?all=1" className="text-xs text-primary-600 hover:underline mt-1 inline-block">
                전체 작업 보기 →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
