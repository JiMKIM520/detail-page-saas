import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { ProjectCard } from '@/components/shared/ProjectCard'
import type { ProjectStatus } from '@/lib/status-machine'
import Link from 'next/link'

export default async function ClientProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: projects } = await supabase
    .from('projects')
    .select('*, platforms(name)')
    .eq('client_id', user!.id)
    .order('created_at', { ascending: false })

  const service = createServiceClient()
  const { data: profile } = await service
    .from('user_profiles')
    .select('usage_count, usage_limit')
    .eq('id', user!.id)
    .single()

  const usageCount = profile?.usage_count ?? 0
  const usageLimit = profile?.usage_limit ?? 1
  const usageExhausted = usageCount >= usageLimit

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">내 프로젝트</h1>
          <p className="text-sm text-text-tertiary mt-1">의뢰한 상세페이지 프로젝트를 확인하세요</p>
        </div>
        {usageExhausted ? (
          <span className="inline-flex items-center gap-2 bg-gray-100 text-text-tertiary rounded-xl px-5 py-2.5 text-sm font-semibold cursor-not-allowed">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            1건 사용 완료
          </span>
        ) : (
          <Link href="/intake"
            className="inline-flex items-center gap-2 bg-primary-600 text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-primary-700 shadow-sm hover:shadow-md transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            새 의뢰
          </Link>
        )}
      </div>

      {usageExhausted && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
          <p className="text-sm text-amber-800 font-medium">기업당 1건의 상세페이지 제작이 제공됩니다. 이미 사용이 완료되었습니다.</p>
        </div>
      )}

      {projects && projects.length > 0 ? (
        <div className="grid gap-4">
          {projects.map(project => (
            <ProjectCard
              key={project.id}
              id={project.id}
              company_name={project.company_name ?? ''}
              category={project.category ?? ''}
              platform_name={(project.platforms as any)?.name ?? '-'}
              status={project.status as ProjectStatus}
              created_at={project.created_at}
              clientFacing
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-surface rounded-2xl border border-border border-dashed">
          <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-1">아직 프로젝트가 없습니다</h3>
          <p className="text-sm text-text-tertiary mb-6">첫 번째 상세페이지 제작을 의뢰해보세요</p>
          {!usageExhausted && (
            <Link href="/intake"
              className="inline-flex items-center gap-2 bg-primary-600 text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-primary-700 shadow-sm transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              첫 의뢰 시작하기
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
