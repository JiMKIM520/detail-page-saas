import { createServiceClient } from '@/lib/supabase/service'
import { generateProductImage } from './imagen'
import { transitionStatus } from '@/lib/status-machine'

export async function generateDesignForProject(projectId: string) {
  const supabase = createServiceClient()

  const { data: project } = await supabase
    .from('projects').select('*, platforms(name)').eq('id', projectId).single()
  const { data: script } = await supabase
    .from('scripts').select('content')
    .eq('project_id', projectId).eq('planner_status', 'approved').single()

  if (!project || !script) throw new Error('Missing project or approved script')

  await transitionStatus(supabase, projectId, 'design_generating', { note: '디자인 생성 시작' })

  const content = script.content as any
  if (!content.sections || !Array.isArray(content.sections)) {
    throw new Error('Invalid script content: missing sections')
  }
  const heroSection = content.sections.find((s: any) => s.type === 'hero')
  const imagePrompt = `E-commerce product detail page hero banner for ${project.company_name}.
${heroSection?.image_description ?? project.product_highlights}.
Style: ${content.tone}, Color: ${content.color_suggestion}.
Professional product photography, white background, high quality.`

  try {
    const imageBuffer = await generateProductImage(imagePrompt)
    const storagePath = `projects/${projectId}/design_v1_${Date.now()}.png`
    const { error: uploadError } = await supabase.storage.from('designs').upload(storagePath, imageBuffer, { contentType: 'image/png' })
    if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`)
    const { data: { publicUrl } } = supabase.storage.from('designs').getPublicUrl(storagePath)

    await supabase.from('designs').insert({
      project_id: projectId,
      preview_url: publicUrl,
      designer_status: 'pending',
    })

    await transitionStatus(supabase, projectId, 'design_review', { note: 'AI 디자인 자동 생성 완료' })
  } catch (err) {
    await supabase.from('projects').update({ status: 'photo_uploaded' }).eq('id', projectId)
    await supabase.from('project_logs').insert({
      project_id: projectId,
      from_status: 'design_generating',
      to_status: 'photo_uploaded',
      note: `디자인 생성 실패: ${String(err)}`,
    })
  }
}
