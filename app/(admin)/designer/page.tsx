import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/shared/StatusBadge'
import type { ProjectStatus } from '@/lib/status-machine'
import Link from 'next/link'

export default async function DesignerDashboard() {
  const supabase = await createClient()
  const { data: projects } = await supabase
    .from('projects')
    .select('*, platforms(name)')
    .in('status', ['design_review', 'design_generating'])
    .order('created_at', { ascending: true })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">디자인 검수 대기</h1>
      <div className="space-y-3">
        {projects?.map(project => (
          <Link key={project.id} href={`/designer/${project.id}`}>
            <div className="bg-white rounded-xl border p-5 flex items-center justify-between hover:border-purple-300 transition-colors">
              <div>
                <p className="font-medium text-gray-900">{project.company_name}</p>
                <p className="text-sm text-gray-500">
                  {(project.platforms as any)?.name} · {project.category}
                </p>
              </div>
              <StatusBadge status={project.status as ProjectStatus} />
            </div>
          </Link>
        ))}
        {!projects?.length && <p className="text-gray-400 text-center py-12">검수 대기 없음</p>}
      </div>
    </div>
  )
}
