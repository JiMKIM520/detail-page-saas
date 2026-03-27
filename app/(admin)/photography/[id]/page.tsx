import { createClient } from '@/lib/supabase/server'
import { ShootingList } from '@/components/photography/ShootingList'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function PhotographyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('*, platforms(name)')
    .eq('id', id)
    .single()

  if (!project) notFound()

  const { data: photos } = await supabase
    .from('photos')
    .select('*')
    .eq('project_id', id)
    .order('photo_type')

  return (
    <div>
      <Link href="/photography" className="inline-flex items-center gap-1 text-sm text-text-tertiary hover:text-text-secondary mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        촬영 관리 목록
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">{project.company_name}</h1>
        <p className="text-sm text-text-tertiary mt-1">
          {(project.platforms as any)?.name} · {project.category} · 촬영 리스트 및 사진 업로드
        </p>
      </div>

      <div className="bg-surface rounded-xl border border-border p-6">
        <ShootingList projectId={id} photos={photos ?? []} />
      </div>
    </div>
  )
}
