import { createServiceClient } from '@/lib/supabase/service'
import { generateProductImage } from './imagen'

export async function generateStylingShots(projectId: string) {
  const supabase = createServiceClient()

  const { data: script } = await supabase
    .from('scripts')
    .select('content')
    .eq('project_id', projectId)
    .eq('planner_status', 'approved')
    .single()

  if (!script) throw new Error('승인된 스크립트가 없습니다')

  const { data: project } = await supabase
    .from('projects')
    .select('company_name, product_highlights')
    .eq('id', projectId)
    .single()

  if (!project) throw new Error('프로젝트를 찾을 수 없습니다')

  const content = script.content as any
  const stylingShots: string[] = content.shooting_requirements?.styling_shots ?? []
  const toGenerate = stylingShots.slice(0, 3)

  if (toGenerate.length === 0) throw new Error('스크립트에 스타일링 촬영 목록이 없습니다')

  const results = await Promise.allSettled(
    toGenerate.map(async (description, i) => {
      const prompt = `Product styling photo for ${project.company_name}. ${project.product_highlights ?? ''}. Scene: ${description}. E-commerce product shot, clean background, professional lighting, high quality.`
      const imageBuffer = await generateProductImage(prompt)
      const ts = Date.now() + i
      const storagePath = `projects/${projectId}/styling_${i}_${ts}.png`

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(storagePath, imageBuffer, { contentType: 'image/png' })
      if (uploadError) throw new Error(`업로드 실패: ${uploadError.message}`)

      await supabase.from('photos').insert({
        project_id: projectId,
        storage_path: storagePath,
        photo_type: 'ai_styling',
        shooting_list_item: description,
      })
    })
  )

  const succeeded = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length
  return { succeeded, failed }
}
