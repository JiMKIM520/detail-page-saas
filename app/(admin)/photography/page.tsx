import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/shared/StatusBadge'
import type { ProjectStatus } from '@/lib/status-machine'
import Link from 'next/link'

interface PageProps {
  searchParams: Promise<Record<string, string>>
}

export default async function StylingListPage({ searchParams }: PageProps) {
  const params = await searchParams
  const showAll = params.all === '1'

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const role = user?.user_metadata?.role as string | undefined
  const isAdmin = role === 'admin'
  const userId = user?.id ?? ''

  // 디자이너는 배정받은(designer_id) 작업만, 관리자는 전체(또는 내 작업) 표시
  let query = supabase
    .from('projects')
    .select('id, company_name, status, category, designer_id, created_at, platforms(name)')
    .in('status', ['prompt_ready', 'photo_uploaded'])
    .order('created_at', { ascending: true })

  if (!isAdmin || !showAll) {
    query = query.eq('designer_id', userId)
  }

  const { data: projects } = await query

  const readyCount    = projects?.filter(p => p.status === 'prompt_ready').length ?? 0
  const uploadedCount = projects?.filter(p => p.status === 'photo_uploaded').length ?? 0

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">스타일링샷 제작</h1>
          <p className="text-sm text-text-tertiary mt-1">
            배정받은 제품의 스타일링샷을 AI(Gemini)로 생성·검토하세요
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/photography"
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                !showAll
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-text-secondary border-border hover:border-primary-300'
              }`}
            >
              내 작업
            </Link>
            <Link
              href="/photography?all=1"
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
          <p className="text-sm text-text-tertiary">프롬프트 준비</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{readyCount}</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-sm text-text-tertiary">이미지 업로드 완료</p>
          <p className="text-2xl font-bold text-blue-500 mt-1">{uploadedCount}</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-sm text-text-tertiary">{isAdmin && showAll ? '전체' : '내 작업'}</p>
          <p className="text-2xl font-bold text-text-primary mt-1">{projects?.length ?? 0}</p>
        </div>
      </div>

      <div className="space-y-3">
        {projects?.map((project) => (
          <Link key={project.id} href={`/photography/${project.id}`}>
            <div className="group bg-surface rounded-xl border border-border p-5 flex items-center justify-between hover:border-emerald-300 hover:shadow-md transition-all">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-text-primary group-hover:text-emerald-700 transition-colors">
                  {project.company_name}
                </p>
                <p className="text-sm text-text-tertiary mt-0.5">
                  {(project.platforms as { name?: string } | null)?.name} · {project.category}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={project.status as ProjectStatus} />
                <svg className="w-4 h-4 text-text-tertiary group-hover:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <p className="text-text-tertiary">
              {isAdmin && !showAll ? '배정된 작업이 없습니다' : '스타일링샷 제작 대기 없음'}
            </p>
            {isAdmin && !showAll && (
              <Link href="/photography?all=1" className="text-xs text-primary-600 hover:underline mt-1 inline-block">
                전체 작업 보기 →
              </Link>
            )}
            {!(isAdmin && !showAll) && (
              <p className="text-xs text-text-tertiary mt-1">디자인 기획이 승인되면 여기에 표시됩니다</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
