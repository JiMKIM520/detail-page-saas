import { createClient } from '@/lib/supabase/server'
import { ScriptViewer } from '@/components/planner/ScriptViewer'
import { ReviewPanel } from '@/components/planner/ReviewPanel'
import { notFound } from 'next/navigation'

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

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2">
        <h1 className="text-xl font-bold text-gray-900 mb-1">{project.company_name}</h1>
        <p className="text-sm text-gray-500 mb-6">
          {(project.platforms as any)?.name} · {project.category}
        </p>
        {script ? (
          <ScriptViewer content={script.content as any} />
        ) : (
          <p className="text-gray-400">스크립트 생성 중...</p>
        )}
      </div>
      <div>
        <ReviewPanel projectId={id} scriptId={script?.id} />
      </div>
    </div>
  )
}
