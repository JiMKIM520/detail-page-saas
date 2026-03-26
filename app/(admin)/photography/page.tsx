import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/shared/StatusBadge'
import type { ProjectStatus } from '@/lib/status-machine'
import Link from 'next/link'

export default async function PhotographyListPage() {
  const supabase = await createClient()
  const { data: projects } = await supabase
    .from('projects')
    .select('*, platforms(name)')
    .in('status', ['script_approved', 'photo_scheduled'])
    .order('created_at', { ascending: true })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">촬영 대기 목록</h1>
      <div className="space-y-3">
        {projects?.map((project) => (
          <Link key={project.id} href={`/photography/${project.id}`}>
            <div className="bg-white rounded-xl border p-5 flex items-center justify-between hover:border-blue-300 transition-colors">
              <div>
                <p className="font-medium text-gray-900">
                  {project.company_name}
                </p>
                <p className="text-sm text-gray-500">
                  {(project.platforms as { name?: string } | null)?.name} ·{' '}
                  {project.category}
                </p>
              </div>
              <StatusBadge status={project.status as ProjectStatus} />
            </div>
          </Link>
        ))}
        {!projects?.length && (
          <p className="text-gray-400 text-center py-12">촬영 대기 없음</p>
        )}
      </div>
    </div>
  )
}
