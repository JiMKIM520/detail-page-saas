import { createClient } from '@/lib/supabase/server'
import { DesignPreview } from '@/components/designer/DesignPreview'
import { DeliveryPanel } from '@/components/designer/DeliveryPanel'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function DesignerReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: project } = await supabase.from('projects').select('*, platforms(name)').eq('id', id).single()
  if (!project) notFound()

  const { data: design } = await supabase
    .from('designs').select('*').eq('project_id', id)
    .order('version', { ascending: false }).limit(1).single()

  return (
    <div>
      <Link href="/designer" className="inline-flex items-center gap-1 text-sm text-text-tertiary hover:text-text-secondary mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        디자인 검수 목록
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">{project.company_name}</h1>
        <p className="text-sm text-text-tertiary mt-1">
          {(project.platforms as any)?.name} · {project.category}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DesignPreview design={design} />
        </div>
        <div>
          <DeliveryPanel projectId={id} designId={design?.id} previewPdfUrl={design?.preview_pdf_url ?? null} />
        </div>
      </div>
    </div>
  )
}
