import { createClient } from '@/lib/supabase/server'
import { DesignPreview } from '@/components/designer/DesignPreview'
import { DeliveryPanel } from '@/components/designer/DeliveryPanel'
import { notFound } from 'next/navigation'

export default async function DesignerReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: project } = await supabase.from('projects').select('*').eq('id', id).single()
  if (!project) notFound()

  const { data: design } = await supabase
    .from('designs').select('*').eq('project_id', id)
    .order('version', { ascending: false }).limit(1).single()

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2">
        <h1 className="text-xl font-bold mb-4">{project.company_name}</h1>
        <DesignPreview design={design} />
      </div>
      <div>
        <DeliveryPanel projectId={id} designId={design?.id} />
      </div>
    </div>
  )
}
