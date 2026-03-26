import { createClient } from '@/lib/supabase/server'
import { ProjectCard } from '@/components/shared/ProjectCard'
import type { ProjectStatus } from '@/lib/status-machine'
import Link from 'next/link'

export default async function ClientProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: projects } = await supabase
    .from('projects')
    .select('*, platforms(name)')
    .eq('client_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">내 프로젝트</h1>
        <Link href="/intake"
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700">
          + 새 의뢰
        </Link>
      </div>
      <div className="space-y-3">
        {projects?.map(project => (
          <ProjectCard
            key={project.id}
            id={project.id}
            company_name={project.company_name ?? ''}
            category={project.category ?? ''}
            platform_name={(project.platforms as any)?.name ?? '-'}
            status={project.status as ProjectStatus}
            created_at={project.created_at}
          />
        ))}
        {!projects?.length && (
          <div className="text-center py-16">
            <p className="text-gray-400 mb-4">아직 의뢰한 프로젝트가 없습니다.</p>
            <Link href="/intake" className="text-blue-600 hover:underline">첫 번째 의뢰 시작하기</Link>
          </div>
        )}
      </div>
    </div>
  )
}
