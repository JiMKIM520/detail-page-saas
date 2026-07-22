import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/shared/StatusBadge'
import type { ProjectStatus } from '@/lib/status-machine'
import Link from 'next/link'

interface PageProps {
  searchParams: Promise<Record<string, string>>
}

export default async function DesignerDashboard({ searchParams }: PageProps) {
  const params = await searchParams
  const showAll = params.all === '1'

  const supabase = await createClient()

  // 현재 로그인 유저
  const { data: { user } } = await supabase.auth.getUser()
  const role = user?.user_metadata?.role as string | undefined
  const isAdmin = role === 'admin'
  const userId = user?.id ?? ''

  // 관리자는 전체 초안을 검수, 디자이너는 본인 배정(designer_id)만
  let query = supabase
    .from('projects')
    .select('id, company_name, status, category, designer_id, created_at, platforms(name)')
    // design_failed(생성 실패 — 재시도 대상)·designer_working(수작업 인계)·revision_1/2(수정요청)도
    // 디자이너 작업 대상 — 누락 시 해당 프로젝트가 목록에서 사라져 방치되던 실사례
    .in('status', ['design_review', 'design_generating', 'design_failed', 'designer_working', 'revision_1', 'revision_2'])
    .order('created_at', { ascending: true })

  if (!isAdmin) {
    query = query.eq('designer_id', userId)
  }

  const { data: projects } = await query

  // 최종본 제출(final_submitted) 프로젝트 집합 — 별도 쿼리(중첩 조인 관계 미인식 회피)
  const { data: finalRows } = await supabase
    .from('designs').select('project_id').eq('designer_status', 'final_submitted')
  const finalSet = new Set((finalRows ?? []).map((r) => r.project_id as string))
  const isFinal = (p: { id: string }) => finalSet.has(p.id)
  const reviewCount    = projects?.filter(p => p.status === 'design_review').length ?? 0
  const generatingCount = projects?.filter(p => p.status === 'design_generating').length ?? 0
  const finalCount     = projects?.filter(isFinal).length ?? 0

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">디자인 검수</h1>
          <p className="text-sm text-text-tertiary mt-1">생성된 상세페이지 디자인을 검수하세요</p>
        </div>

        {/* admin 전용: 내 작업 ↔ 전체 토글 */}
        {isAdmin && (
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/designer"
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                !showAll
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-text-secondary border-border hover:border-primary-300'
              }`}
            >
              내 작업
            </Link>
            <Link
              href="/designer?all=1"
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
          <p className="text-2xl font-bold text-pink-600 mt-1">{reviewCount}</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-sm text-text-tertiary">생성 중</p>
          <p className="text-2xl font-bold text-violet-500 mt-1">{generatingCount}</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-sm text-text-tertiary">최종 검수 대기</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{finalCount}</p>
        </div>
      </div>

      <div className="space-y-3">
        {projects?.map(project => (
          <Link key={project.id} href={`/designer/${project.id}`}>
            <div className="group bg-surface rounded-xl border border-border p-5 flex items-center justify-between hover:border-violet-300 hover:shadow-md transition-all">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-text-primary group-hover:text-violet-700 transition-colors">
                  {project.company_name}
                </p>
                <p className="text-sm text-text-tertiary mt-0.5">
                  {(project.platforms as { name?: string } | null)?.name} · {project.category}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {isFinal(project) && (
                  <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">최종 검수 대기</span>
                )}
                <StatusBadge status={project.status as ProjectStatus} />
                <svg className="w-4 h-4 text-text-tertiary group-hover:text-violet-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
              </svg>
            </div>
            <p className="text-text-tertiary">
              {isAdmin && !showAll ? '배정된 작업이 없습니다' : '검수 대기 없음'}
            </p>
            {isAdmin && !showAll && (
              <Link href="/designer?all=1" className="text-xs text-primary-600 hover:underline mt-1 inline-block">
                전체 작업 보기 →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
