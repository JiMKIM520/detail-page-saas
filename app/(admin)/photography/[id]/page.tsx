import { createClient } from '@/lib/supabase/server'
import { ShootingList } from '@/components/photography/ShootingList'
import { StylingPromptPanel } from '@/components/photography/StylingPromptPanel'
import { downloadFromStorage } from '@/lib/storage'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { StylingPromptsOutput } from '@/agents/styling-shots'

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

  // 스타일링샷 프롬프트 JSON 로드 — 없으면 null (try/catch로 안전 처리)
  let stylingPrompts: StylingPromptsOutput | null = null
  try {
    const buffer = await downloadFromStorage(`projects/${id}/planning/styling-final-prompts.json`)
    stylingPrompts = JSON.parse(buffer.toString('utf8')) as StylingPromptsOutput
  } catch {
    // 파일 미존재 or 다운로드 실패 시 null 유지 — 패널이 "준비 중" 안내 표시
  }

  return (
    <div>
      <Link href="/photography" className="inline-flex items-center gap-1 text-sm text-text-tertiary hover:text-text-secondary mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        스타일링샷 제작 목록
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">{project.company_name}</h1>
        <p className="text-sm text-text-tertiary mt-1">
          {(project.platforms as any)?.name} · {project.category} · 스타일링샷 프롬프트 · 이미지 업로드
        </p>
      </div>

      {/* 스타일링샷 프롬프트 패널 (운영자가 외부 모델에 복사) */}
      <div className="mb-6">
        <StylingPromptPanel data={stylingPrompts} />
      </div>

      <div className="bg-surface rounded-xl border border-border p-6">
        <ShootingList projectId={id} photos={photos ?? []} />
      </div>
    </div>
  )
}
