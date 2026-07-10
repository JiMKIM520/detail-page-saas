import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { PipelineConsole } from '@/components/admin/PipelineConsole'
import { STATUS_LABELS } from '@/lib/status-machine'
import type { ProjectStatus } from '@/lib/status-machine'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

/** 관리자 파이프라인 콘솔 (Sprint 11) — 로컬 러너 없이 웹에서 전 단계 실행 */
export default async function PipelinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || (user.user_metadata?.role as string | undefined) !== 'admin') redirect('/login')

  const svc = createServiceClient()
  const { data: project } = await svc
    .from('projects')
    .select('id, company_name, product_name, category, status, platforms(name)')
    .eq('id', id)
    .single()
  if (!project) notFound()

  const { data: logs } = await svc
    .from('project_logs')
    .select('note, to_status, created_at')
    .eq('project_id', id)
    .order('created_at', { ascending: false })
    .limit(8)

  const status = project.status as ProjectStatus

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-text-tertiary mb-1">
            <Link href="/dashboard" className="hover:underline">대시보드</Link>
            <span>/</span>
            <span>파이프라인 콘솔</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">{project.company_name}</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {project.product_name} · {project.category}
          </p>
        </div>
        <span className="text-xs bg-slate-100 text-slate-600 rounded-lg px-3 py-1.5 font-medium whitespace-nowrap">
          {STATUS_LABELS[status] ?? status}
        </span>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6 shadow-card">
        <PipelineConsole projectId={project.id} status={status} />
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6 shadow-card">
        <h2 className="text-sm font-semibold text-text-primary mb-3">최근 이력</h2>
        <ul className="space-y-1.5">
          {(logs ?? []).map((l, i) => (
            <li key={i} className="text-xs text-text-secondary flex gap-2">
              <span className="text-text-tertiary font-mono whitespace-nowrap">
                {new Date(l.created_at as string).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="truncate">{l.note ?? l.to_status}</span>
            </li>
          ))}
          {(logs ?? []).length === 0 && <li className="text-xs text-text-tertiary">이력 없음</li>}
        </ul>
        <div className="mt-4 flex gap-2">
          <Link href={`/planner/${project.id}`} className="text-xs border border-border rounded-lg px-3 py-1.5 hover:border-slate-500 transition-colors">스크립트/기획 검토</Link>
          <Link href={`/designer/${project.id}`} className="text-xs border border-border rounded-lg px-3 py-1.5 hover:border-slate-500 transition-colors">산출물(디자이너)</Link>
        </div>
      </div>
    </div>
  )
}
