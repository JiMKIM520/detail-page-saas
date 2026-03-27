import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import type { ProjectStatus } from '@/lib/status-machine'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ProjectProgress } from '@/components/client/ProjectProgress'
import { ScriptViewer } from '@/components/planner/ScriptViewer'
import { ProtectedImage } from '@/components/client/ProtectedImage'
import { CommentSection } from '@/components/client/CommentSection'

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

  // Fetch project with platform info
  const { data: project } = await service
    .from('projects')
    .select('*, platforms(name)')
    .eq('id', id)
    .single()

  if (!project || project.client_id !== user.id) {
    notFound()
  }

  const status = project.status as ProjectStatus
  const showScript = statusIndex(status) >= statusIndex('script_review')
  const showDesign = statusIndex(status) >= statusIndex('design_review')

  // Fetch script if needed
  let script = null
  if (showScript) {
    const { data } = await service
      .from('scripts')
      .select('content')
      .eq('project_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    script = data
  }

  // Fetch design if needed
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
      {/* Back link */}
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 text-sm text-text-tertiary hover:text-text-secondary transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        프로젝트 목록
      </Link>

      {/* Project header */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-text-primary">
              {project.company_name}
            </h1>
            <p className="text-sm text-text-tertiary mt-1">
              {platformName} · {project.category}
            </p>
          </div>
          <StatusBadge status={status} />
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <h2 className="text-sm font-semibold text-text-secondary mb-4">진행 상황</h2>
        <ProjectProgress status={status} />
      </div>

      {/* Script section */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {showScript && script?.content && (
        <div>
          <h2 className="text-lg font-bold text-text-primary mb-4">스크립트</h2>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <ScriptViewer content={script.content as any} />
        </div>
      )}

      {/* Design section */}
      {showDesign && (
        <div>
          <h2 className="text-lg font-bold text-text-primary mb-4">디자인</h2>
          {design?.preview_url ? (
            <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-card">
              <ProtectedImage
                src={design.preview_url}
                alt="디자인 미리보기"
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
              <p className="text-text-tertiary text-sm">디자인 생성 중...</p>
            </div>
          )}
        </div>
      )}

      {/* Comments section */}
      <CommentSection projectId={id} />
    </div>
  )
}
