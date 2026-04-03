import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import type { ProjectStatus } from '@/lib/status-machine'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ProjectProgress } from '@/components/client/ProjectProgress'
import { ProtectedImage } from '@/components/client/ProtectedImage'
import { CommentSection } from '@/components/client/CommentSection'
import { RevisionGuide } from '@/components/client/RevisionGuide'

const STATUS_ORDER: ProjectStatus[] = [
  'intake_submitted',
  'script_generating',
  'script_review',
  'script_approved',
  'photo_scheduled',
  'photo_uploaded',
  'design_generating',
  'design_review',
  'design_approved',
  'delivered',
]

function statusIndex(status: ProjectStatus): number {
  return STATUS_ORDER.indexOf(status)
}

export default async function ClientProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const service = createServiceClient()

  const { data: project } = await service
    .from('projects')
    .select('*, platforms(name)')
    .eq('id', id)
    .single()

  if (!project || project.client_id !== user.id) {
    notFound()
  }

  const status = project.status as ProjectStatus
  const showDesign = statusIndex(status) >= statusIndex('design_review')

  let design = null
  if (showDesign) {
    const { data } = await service
      .from('designs')
      .select('id, preview_url, output_url')
      .eq('project_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    design = data
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const platformName = (project.platforms as any)?.name ?? '-'

  return (
    <div className="space-y-8">
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 text-sm text-text-tertiary hover:text-text-secondary transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        프로젝트 목록
      </Link>

      {/* 프로젝트 헤더 */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-text-primary">{project.company_name}</h1>
            <p className="text-sm text-text-tertiary mt-1">
              {platformName} · {project.category}
            </p>
          </div>
          <StatusBadge status={status} clientFacing />
        </div>
      </div>

      {/* 진행 상황 */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <h2 className="text-sm font-semibold text-text-secondary mb-4">진행 상황</h2>
        <ProjectProgress status={status} />
      </div>

      {/* 상세페이지 초안 */}
      {showDesign && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-text-primary">상세페이지 초안</h2>
          <RevisionGuide />
          {design?.preview_url ? (
            <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-card">
              <ProtectedImage
                src={design.preview_url}
                alt="상세페이지 초안 미리보기"
                className="w-full"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-surface rounded-xl border border-border border-dashed">
              <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-violet-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                </svg>
              </div>
              <p className="text-text-tertiary text-sm">담당자가 제작 중입니다. 잠시만 기다려주세요.</p>
            </div>
          )}
        </div>
      )}

      {/* 코멘트 */}
      <CommentSection projectId={id} />
    </div>
  )
}
