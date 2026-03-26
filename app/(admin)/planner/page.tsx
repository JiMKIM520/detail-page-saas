import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/shared/StatusBadge'
import type { ProjectStatus } from '@/lib/status-machine'
import Link from 'next/link'

export default async function PlannerDashboard() {
  const supabase = await createClient()
  const { data: projects } = await supabase
    .from('projects')
    .select('*, platforms(name)')
    .in('status', ['script_review', 'script_generating'])
    .order('created_at', { ascending: true })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">스크립트 검수 대기</h1>
      <div className="space-y-3">
        {projects?.map(project => (
          <Link key={project.id} href={`/planner/${project.id}`}>
            <div className="bg-white rounded-xl border p-5 flex items-center justify-between hover:border-blue-300 transition-colors">
              <div>
                <p className="font-medium text-gray-900">{project.company_name}</p>
                <p className="text-sm text-gray-500">
                  {(project.platforms as any)?.name} · {project.category} ·{' '}
                  {new Date(project.created_at).toLocaleDateString('ko-KR')}
                </p>
              </div>
              <StatusBadge status={project.status as ProjectStatus} />
            </div>
          </Link>
        ))}
        {!projects?.length && (
          <p className="text-gray-400 text-center py-12">검수 대기 중인 프로젝트가 없습니다.</p>
        )}
      </div>
    </div>
  )
}
