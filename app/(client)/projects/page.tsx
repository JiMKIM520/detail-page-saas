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
  const projectList = projects ?? []
  const singleProject = projectList.length === 1 ? projectList[0] : null

  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">내 상세페이지</h1>
          <p className="text-sm text-text-tertiary mt-1">
            사용량 {usageCount} / {usageLimit}건
          </p>
        </div>
        {!usageExhausted && (
          <Link href="/intake"
            className="inline-flex items-center gap-2 bg-primary-600 text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-primary-700 shadow-sm hover:shadow-md transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            의뢰 시작하기
          </Link>
        )}
      </div>

      {/* 프로젝트가 없는 경우 */}
      {projectList.length === 0 && (
        <div className="text-center py-24 bg-surface rounded-2xl border border-border border-dashed">
          <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-1">아직 의뢰가 없습니다</h3>
          <p className="text-sm text-text-tertiary mb-6">상세페이지 제작을 의뢰해보세요</p>
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

      {/* 단일 프로젝트 — 바로 상세 카드로 강조 */}
      {singleProject && (
        <Link href={`/projects/${singleProject.id}`} className="block group">
          <div className="bg-surface rounded-2xl border border-primary-200 hover:border-primary-400 hover:shadow-lg transition-all p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-xs font-medium text-primary-600 mb-1">진행 중인 상세페이지</p>
                <h2 className="text-xl font-bold text-text-primary group-hover:text-primary-700 transition-colors">
                  {singleProject.company_name}
                </h2>
                <p className="text-sm text-text-tertiary mt-1">
                  {(singleProject.platforms as { name?: string } | null)?.name ?? '-'} · {singleProject.category}
                </p>
              </div>
              <svg className="w-5 h-5 text-primary-400 group-hover:text-primary-600 transition-colors flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>
            <div className="pt-4 border-t border-border/50 flex items-center justify-between">
              <p className="text-xs text-text-tertiary">
                의뢰일 {new Date(singleProject.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <span className="text-xs font-semibold text-primary-600">자세히 보기 →</span>
            </div>
          </div>
        </Link>
      )}

      {/* 다중 프로젝트 — 최소 리스트 (비정상 케이스, 폴백) */}
      {projectList.length > 1 && (
        <div className="grid gap-3">
          {projectList.map(project => (
            <ProjectCard
              key={project.id}
              id={project.id}
              company_name={project.company_name ?? ''}
              category={project.category ?? ''}
              platform_name={(project.platforms as { name?: string } | null)?.name ?? '-'}
              status={project.status as ProjectStatus}
              created_at={project.created_at}
              clientFacing
            />
          ))}
        </div>
      )}
    </div>
  )
}
