import { createServiceClient } from '@/lib/supabase/service'
import type { Json } from '@/lib/supabase/types'
import { generateScript } from './claude'
import { SCRIPT_SYSTEM_PROMPT, buildUserPrompt } from './prompts/script-base'
import { transitionStatus } from '@/lib/status-machine'

export async function generateScriptForProject(projectId: string) {
  const supabase = createServiceClient()

  const { data: project } = await supabase
    .from('projects')
    .select('*, platforms(name, style_guide)')
    .eq('id', projectId)
    .single()

  if (!project) throw new Error(`Project ${projectId} not found`)

  await transitionStatus(supabase, projectId, 'script_generating', { note: '스크립트 생성 시작' })

  try {
    const userPrompt = buildUserPrompt({
      company_name: project.company_name,
      homepage_url: project.homepage_url,
      detail_page_url: project.detail_page_url,
      product_highlights: project.product_highlights ?? '',
      reference_notes: project.reference_notes,
      category: project.category ?? '',
      platform_style_guide: (project.platforms as any)?.style_guide ?? '',
    })

    const rawScript = await generateScript(SCRIPT_SYSTEM_PROMPT, userPrompt)

    let scriptContent: Json
    try {
      scriptContent = JSON.parse(rawScript) as Json
    } catch {
      const retried = await generateScript(
        SCRIPT_SYSTEM_PROMPT + '\n\n반드시 순수 JSON만 응답하세요. 마크다운 없이.',
        userPrompt
      )
      scriptContent = JSON.parse(retried) as Json
    }

    await supabase.from('scripts').insert({
      project_id: projectId,
      content: scriptContent,
      ai_model: 'claude-sonnet-4-6-20250320',
      planner_status: 'pending',
    })

    await transitionStatus(supabase, projectId, 'script_review', { note: 'AI 스크립트 자동 생성 완료' })
  } catch (err) {
    await supabase.from('projects').update({ status: 'intake_submitted' }).eq('id', projectId)
    await supabase.from('project_logs').insert({
      project_id: projectId, from_status: 'script_generating',
      to_status: 'intake_submitted', note: `스크립트 생성 실패: ${String(err)}`,
    })
  }
}
