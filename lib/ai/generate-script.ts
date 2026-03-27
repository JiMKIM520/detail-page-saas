import { createServiceClient } from '@/lib/supabase/service'
import type { Json } from '@/lib/supabase/types'
import { generateScript, generateScriptWithImages, type ImageInput } from './claude'
import { SCRIPT_SYSTEM_PROMPT, buildUserPrompt } from './prompts/script-base'
import { transitionStatus } from '@/lib/status-machine'

const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])

const FILE_TYPE_LABELS: Record<string, string> = {
  product_photo: '제품 사진',
  brochure: '제품 소개서/카탈로그',
  detail_capture: '기존 상세페이지 캡처',
}

async function fetchIntakeImages(supabase: ReturnType<typeof createServiceClient>, projectId: string): Promise<ImageInput[]> {
  const { data: files } = await supabase
    .from('intake_files')
    .select('*')
    .eq('project_id', projectId)
    .order('file_type')
    .order('created_at')

  if (!files || files.length === 0) return []

  const images: ImageInput[] = []

  for (const file of files) {
    // PDF는 스킵 (이미지만 Vision에 전달)
    if (!file.mime_type || !IMAGE_MIME_TYPES.has(file.mime_type)) continue

    const { data } = await supabase.storage
      .from('intake-files')
      .download(file.storage_path)

    if (!data) continue

    const buffer = Buffer.from(await data.arrayBuffer())
    const base64 = buffer.toString('base64')

    images.push({
      type: 'base64',
      media_type: file.mime_type as ImageInput['media_type'],
      data: base64,
      label: `${FILE_TYPE_LABELS[file.file_type] || file.file_type} - ${file.file_name}`,
    })
  }

  return images
}

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

    // 업로드된 이미지 가져오기
    const images = await fetchIntakeImages(supabase, projectId)

    let rawScript: string
    if (images.length > 0) {
      // 이미지가 있으면 Vision으로 분석하며 스크립트 생성
      rawScript = await generateScriptWithImages(SCRIPT_SYSTEM_PROMPT, userPrompt, images)
    } else {
      // 이미지 없으면 텍스트만으로 생성
      rawScript = await generateScript(SCRIPT_SYSTEM_PROMPT, userPrompt)
    }

    let scriptContent: Json
    try {
      scriptContent = JSON.parse(rawScript) as Json
    } catch {
      // JSON 파싱 실패 시 재시도
      const retryPrompt = SCRIPT_SYSTEM_PROMPT + '\n\n반드시 순수 JSON만 응답하세요. 마크다운 없이.'
      const retried = images.length > 0
        ? await generateScriptWithImages(retryPrompt, userPrompt, images)
        : await generateScript(retryPrompt, userPrompt)
      scriptContent = JSON.parse(retried) as Json
    }

    await supabase.from('scripts').insert({
      project_id: projectId,
      content: scriptContent,
      ai_model: 'claude-sonnet-4-20250514',
      planner_status: 'pending',
    })

    await transitionStatus(supabase, projectId, 'script_review', {
      note: `AI 스크립트 생성 완료 (이미지 ${images.length}장 분석)`,
    })
  } catch (err) {
    await supabase.from('projects').update({ status: 'intake_submitted' }).eq('id', projectId)
    await supabase.from('project_logs').insert({
      project_id: projectId, from_status: 'script_generating',
      to_status: 'intake_submitted', note: `스크립트 생성 실패: ${String(err)}`,
    })
  }
}
