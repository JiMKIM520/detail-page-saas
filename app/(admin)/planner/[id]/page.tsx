import { createClient } from '@/lib/supabase/server'
import { ScriptViewer } from '@/components/planner/ScriptViewer'
import { ReviewPanel } from '@/components/planner/ReviewPanel'
import { ScreenshotUpload } from '@/components/admin/ScreenshotUpload'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function PlannerReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('*, platforms(name, style_guide)')
    .eq('id', id)
    .single()

  if (!project) notFound()

  const { data: script } = await supabase
    .from('scripts')
    .select('*')
    .eq('project_id', id)
    .order('version', { ascending: false })
    .limit(1)
    .single()

  const { data: logs } = await supabase
    .from('project_logs')
    .select('note')
    .eq('project_id', id)
    .order('created_at', { ascending: false })
    .limit(20)

  const { data: clientComments } = await supabase
    .from('comments')
    .select('id, content, created_at')
    .eq('project_id', id)
    .eq('role', 'client')
    .order('created_at', { ascending: false })
    .limit(5)

  const hasUrlFetchFailed = logs?.some(l => l.note?.includes('URL 컨텐츠 추출 실패'))

  return (
    <div>
      <Link href="/planner" className="inline-flex items-center gap-1 text-sm text-text-tertiary hover:text-text-secondary mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        스크립트 검수 목록
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">{project.company_name}</h1>
        <p className="text-sm text-text-tertiary mt-1">
          {(project.platforms as any)?.name} · {project.category}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {hasUrlFetchFailed && (
            <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-amber-800 mb-1">URL 컨텐츠 자동 추출 실패</p>
              <p className="text-sm text-amber-700 mb-3">
                제품 링크에서 정보를 가져오지 못했습니다. 스크린샷을 직접 업로드하면 AI 결과물이 개선됩니다.
              </p>
              <ScreenshotUpload projectId={id} />
            </div>
          )}
          {script ? (
            <ScriptViewer content={script.content as any} projectId={id} scriptId={script.id} />
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-surface rounded-xl border border-border border-dashed">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-amber-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                </svg>
              </div>
              <p className="text-text-tertiary text-sm">스크립트 생성 중...</p>
            </div>
          )}
        </div>
        <div className="space-y-4">
          <ReviewPanel projectId={id} scriptId={script?.id} />

          {clientComments && clientComments.length > 0 && (
            <div className="bg-surface rounded-xl border border-border p-5">
              <h3 className="text-sm font-semibold text-text-primary mb-3">클라이언트 코멘트</h3>
              <ul className="space-y-3">
                {clientComments.map(c => (
                  <li key={c.id} className="text-sm">
                    <p className="text-text-secondary whitespace-pre-wrap">{c.content}</p>
                    <p className="text-xs text-text-tertiary mt-1">
                      {new Date(c.created_at).toLocaleDateString('ko-KR')}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
