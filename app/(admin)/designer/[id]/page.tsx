import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { DesignPreview } from '@/components/designer/DesignPreview'
import { DeliveryPanel } from '@/components/designer/DeliveryPanel'
import { SendDraftPanel } from '@/components/designer/SendDraftPanel'
import { GenerateDraftButton } from '@/components/designer/GenerateDraftButton'
import { StylingShotDownloads } from '@/components/designer/StylingShotDownloads'
import { WorkflowSteps } from '@/components/shared/WorkflowSteps'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { ProjectStatus } from '@/lib/status-machine'

export default async function DesignerReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAdmin = user?.user_metadata?.role === 'admin'

  const { data: project } = await supabase.from('projects').select('*, platforms(name)').eq('id', id).single()
  if (!project) notFound()

  const { data: design } = await supabase
    .from('designs').select('*').eq('project_id', id)
    .order('version', { ascending: false }).limit(1).single()

  const designerStatus = (design as { designer_status?: string } | null)?.designer_status
  const finalSubmitted = designerStatus === 'final_submitted'
  const status = project.status as ProjectStatus
  const hasDraft = !!design

  // 사업자 코멘트(수정요구) — 디자이너는 반영용, 관리자는 초안 체크용 (읽기 전용)
  const { data: clientComments } = await supabase
    .from('comments').select('id, content, created_at')
    .eq('project_id', id).eq('role', 'client')
    .order('created_at', { ascending: false }).limit(10)

  // AI 스타일링샷(styling_real/) — 디자이너 Figma 작업용
  const svc = createServiceClient()
  const PUB = process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1/object/public/designs'
  const { data: shotFiles } = await svc.storage
    .from('designs')
    .list(`projects/${id}/styling_real`, { limit: 20, sortBy: { column: 'name', order: 'asc' } })
  const stylingShots = (shotFiles ?? [])
    .filter((f) => /\.(png|jpe?g|webp)$/i.test(f.name))
    .map((f) => ({ name: f.name.replace(/\.[a-z]+$/i, ''), url: `${PUB}/projects/${id}/styling_real/${f.name}` }))

  return (
    <div>
      <Link href={isAdmin ? '/designer' : '/designer'} className="inline-flex items-center gap-1 text-sm text-text-tertiary hover:text-text-secondary mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        {isAdmin ? '초안 검수 목록' : '초안 작업 목록'}
      </Link>

      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">{project.company_name}</h1>
          <p className="text-sm text-text-tertiary mt-1">
            {(project.platforms as { name?: string })?.name} · {project.category}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {finalSubmitted && (
            <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">최종 검수 대기</span>
          )}
          <StatusBadge status={status} />
        </div>
      </div>

      <div className="mb-6">
        <WorkflowSteps projectId={id} status={status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DesignPreview design={design} projectId={id} />

          {/* 사업자 수정요구/코멘트 (읽기 전용) */}
          {clientComments && clientComments.length > 0 && (
            <div className="rounded-xl border border-border bg-surface p-5">
              <h3 className="text-sm font-semibold text-text-primary mb-3">
                사업자 코멘트 {isAdmin ? '(초안 체크용)' : '(수정요구 반영)'}
              </h3>
              <ul className="space-y-3">
                {clientComments.map((c) => (
                  <li key={c.id} className="text-sm border-l-2 border-primary-200 pl-3">
                    <p className="text-text-secondary whitespace-pre-wrap">{c.content}</p>
                    <p className="text-xs text-text-tertiary mt-1">{new Date(c.created_at).toLocaleString('ko-KR')}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 스타일링샷 다운로드 — 디자이너 Figma 작업용 */}
          {!isAdmin && (
            <div className="rounded-xl border border-border bg-surface p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-text-primary">스타일링샷 (Figma 작업용)</h3>
                <Link href={`/photography/${id}`} className="text-xs font-medium text-primary-600 hover:text-primary-700">
                  생성·재생성 →
                </Link>
              </div>
              <StylingShotDownloads shots={stylingShots} />
            </div>
          )}
        </div>

        <div className="space-y-6">
          {isAdmin ? (
            /* 관리자: 초안 체크 + 최종 발송 */
            <DeliveryPanel
              projectId={id}
              designId={design?.id}
              mode="admin"
              finalUrl={(design as { output_url?: string | null } | null)?.output_url ?? null}
              finalSubmitted={finalSubmitted}
            />
          ) : !hasDraft || status === 'design_failed' ? (
            /* 디자이너: 초안 미생성 → AI 초안 생성 / design_failed → 재시도(이전 초안이 있어도 복구 경로 노출) */
            <GenerateDraftButton projectId={id} status={status} />
          ) : (
            /* 디자이너: 사업자 초안 전달 + 최종본 제출(관리자 검수요청) */
            <>
              <SendDraftPanel projectId={id} designId={design?.id} alreadySent={!!design?.preview_url} />
              <DeliveryPanel projectId={id} designId={design?.id} mode="designer" finalSubmitted={finalSubmitted} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
