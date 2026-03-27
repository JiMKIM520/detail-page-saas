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

  const approvedCount = projects?.filter(p => p.status === 'script_approved').length ?? 0
  const scheduledCount = projects?.filter(p => p.status === 'photo_scheduled').length ?? 0

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">촬영 관리</h1>
        <p className="text-sm text-text-tertiary mt-1">승인된 스크립트의 촬영 일정을 관리하세요</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-sm text-text-tertiary">촬영 대기</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{approvedCount}</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-sm text-text-tertiary">촬영 예정</p>
          <p className="text-2xl font-bold text-blue-500 mt-1">{scheduledCount}</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-sm text-text-tertiary">전체</p>
          <p className="text-2xl font-bold text-text-primary mt-1">{projects?.length ?? 0}</p>
        </div>
      </div>

      <div className="space-y-3">
        {projects?.map((project) => (
          <Link key={project.id} href={`/photography/${project.id}`}>
            <div className="group bg-surface rounded-xl border border-border p-5 flex items-center justify-between hover:border-emerald-300 hover:shadow-md transition-all">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-text-primary group-hover:text-emerald-700 transition-colors">
                  {project.company_name}
                </p>
                <p className="text-sm text-text-tertiary mt-0.5">
                  {(project.platforms as { name?: string } | null)?.name} · {project.category}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={project.status as ProjectStatus} />
                <svg className="w-4 h-4 text-text-tertiary group-hover:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
            </div>
            <p className="text-text-tertiary">촬영 대기 없음</p>
          </div>
        )}
      </div>
    </div>
  )
}
