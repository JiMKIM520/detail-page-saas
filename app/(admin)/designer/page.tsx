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

  const reviewCount = projects?.filter(p => p.status === 'design_review').length ?? 0
  const generatingCount = projects?.filter(p => p.status === 'design_generating').length ?? 0

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">디자인 검수</h1>
        <p className="text-sm text-text-tertiary mt-1">생성된 상세페이지 디자인을 검수하세요</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-sm text-text-tertiary">검수 대기</p>
          <p className="text-2xl font-bold text-pink-600 mt-1">{reviewCount}</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-sm text-text-tertiary">생성 중</p>
          <p className="text-2xl font-bold text-violet-500 mt-1">{generatingCount}</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-sm text-text-tertiary">전체</p>
          <p className="text-2xl font-bold text-text-primary mt-1">{projects?.length ?? 0}</p>
        </div>
      </div>

      <div className="space-y-3">
        {projects?.map(project => (
          <Link key={project.id} href={`/designer/${project.id}`}>
            <div className="group bg-surface rounded-xl border border-border p-5 flex items-center justify-between hover:border-violet-300 hover:shadow-md transition-all">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-text-primary group-hover:text-violet-700 transition-colors">{project.company_name}</p>
                <p className="text-sm text-text-tertiary mt-0.5">
                  {(project.platforms as any)?.name} · {project.category}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={project.status as ProjectStatus} />
                <svg className="w-4 h-4 text-text-tertiary group-hover:text-violet-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
        {!projects?.length && (
          <div className="text-center py-20 bg-surface rounded-2xl border border-border border-dashed">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
              </svg>
            </div>
            <p className="text-text-tertiary">검수 대기 없음</p>
          </div>
        )}
      </div>
    </div>
  )
}
