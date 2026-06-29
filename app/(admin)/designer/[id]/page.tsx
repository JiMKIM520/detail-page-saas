import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { DesignPreview } from '@/components/designer/DesignPreview'
import { DeliveryPanel } from '@/components/designer/DeliveryPanel'
import { SendDraftPanel } from '@/components/designer/SendDraftPanel'
import { StylingShotDownloads } from '@/components/designer/StylingShotDownloads'
import { WorkflowSteps } from '@/components/shared/WorkflowSteps'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { ProjectStatus } from '@/lib/status-machine'

export default async function DesignerReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: project } = await supabase.from('projects').select('*, platforms(name)').eq('id', id).single()
  if (!project) notFound()

  const { data: design } = await supabase
    .from('designs').select('*').eq('project_id', id)
    .order('version', { ascending: false }).limit(1).single()

  // AI 스타일링샷(styling_real/) — 디자이너 다운로드용
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
      <Link href="/designer" className="inline-flex items-center gap-1 text-sm text-text-tertiary hover:text-text-secondary mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        초안 제작 목록
      </Link>

      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">{project.company_name}</h1>
          <p className="text-sm text-text-tertiary mt-1">
            {(project.platforms as { name?: string })?.name} · {project.category}
          </p>
        </div>
        <StatusBadge status={project.status as ProjectStatus} />
      </div>

      <div className="mb-6">
        <WorkflowSteps projectId={id} status={project.status as ProjectStatus} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DesignPreview design={design} projectId={id} />

          {/* 스타일링샷 다운로드 (Figma 리터치에 활용) */}
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-text-primary">스타일링샷 (Figma 작업용)</h3>
              <Link href={`/photography/${id}`} className="text-xs font-medium text-primary-600 hover:text-primary-700">
                생성·재생성 →
              </Link>
            </div>
            <StylingShotDownloads shots={stylingShots} />
          </div>
        </div>
        <div className="space-y-6">
          <SendDraftPanel projectId={id} designId={design?.id} alreadySent={!!design?.preview_url} />
          <DeliveryPanel projectId={id} designId={design?.id} />
        </div>
      </div>
    </div>
  )
}
