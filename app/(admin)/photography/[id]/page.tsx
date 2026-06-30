import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { StylingShotGenerator } from '@/components/photography/StylingShotGenerator'
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

  // 역할 가드 — 스태프(관리자/디자이너)만. 사업자 URL 직접 접근 차단.
  const { data: { user } } = await supabase.auth.getUser()
  const role = user?.user_metadata?.role as string | undefined
  if (!user || !['admin', 'designer'].includes(role ?? '')) notFound()

  const { data: project } = await supabase
    .from('projects')
    .select('*, platforms(name)')
    .eq('id', id)
    .single()

  if (!project) notFound()

  // 스타일링샷 프롬프트 JSON 로드 — 없으면 null (try/catch로 안전 처리)
  let stylingPrompts: StylingPromptsOutput | null = null
  try {
    const buffer = await downloadFromStorage(`projects/${id}/planning/styling-final-prompts.json`)
    stylingPrompts = JSON.parse(buffer.toString('utf8')) as StylingPromptsOutput
  } catch {
    // 파일 미존재 or 다운로드 실패 시 null 유지
  }

  // AI로 생성된 스타일링샷(styling_real/) 로드
  const svc = createServiceClient()
  const PUB = process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1/object/public/designs'
  const { data: realFiles } = await svc.storage.from('designs').list(`projects/${id}/styling_real`, { limit: 20, sortBy: { column: 'name', order: 'asc' } })
  const generatedShots = (realFiles ?? [])
    .filter(f => /\.(png|jpe?g)$/i.test(f.name))
    .map(f => ({ name: f.name.replace(/\.[a-z]+$/i, ''), url: `${PUB}/projects/${id}/styling_real/${f.name}` }))

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
          {(project.platforms as any)?.name} · {project.category} · AI 스타일링샷 생성
        </p>
      </div>

      {/* AI 스타일링샷 생성·확인 (Gemini API 직접 생성) */}
      <div className="mb-6">
        <StylingShotGenerator projectId={id} initialShots={generatedShots} hasPrompts={!!stylingPrompts} />
      </div>

      {/* 참고: 생성에 사용된 스타일링 프롬프트 */}
      <details className="bg-surface rounded-xl border border-border p-6">
        <summary className="text-sm font-semibold text-text-secondary cursor-pointer">생성에 사용된 프롬프트 보기 (참고)</summary>
        <div className="mt-4">
          <StylingPromptPanel data={stylingPrompts} />
        </div>
      </details>
    </div>
  )
}
