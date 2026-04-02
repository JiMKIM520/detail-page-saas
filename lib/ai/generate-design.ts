import { createServiceClient } from '@/lib/supabase/service'
import { generateProductImage } from './imagen'
import { buildDesignHtml } from './html-template'
import { transitionStatus } from '@/lib/status-machine'

const CHROMIUM_PACK_URL =
  process.env.CHROMIUM_PACK_URL ??
  'https://github.com/Sparticuz/chromium/releases/download/v143.0.0/chromium-v143.0.0-pack.tar'

async function generatePdfFromHtml(html: string): Promise<Buffer | null> {
  try {
    const chromium = (await import('@sparticuz/chromium-min')).default
    const { chromium: playwrightChromium } = await import('playwright-core')
    const executablePath = await chromium.executablePath(CHROMIUM_PACK_URL)
    const browser = await playwrightChromium.launch({
      args: chromium.args,
      executablePath,
      headless: true,
    })
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle' })
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    })
    await browser.close()
    return Buffer.from(pdfBuffer)
  } catch (err) {
    console.warn('[generate-design] PDF generation failed (non-fatal):', err)
    return null
  }
}

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
    const ts = Date.now()
    const imageBuffer = await generateProductImage(imagePrompt)
    const storagePath = `projects/${projectId}/design_v1_${ts}.png`
    const { error: uploadError } = await supabase.storage.from('designs').upload(storagePath, imageBuffer, { contentType: 'image/png' })
    if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`)
    const { data: { publicUrl } } = supabase.storage.from('designs').getPublicUrl(storagePath)

    // PDF 생성 (실패해도 PNG는 유지)
    const heroBase64 = imageBuffer.toString('base64')
    const html = buildDesignHtml(content, project, heroBase64)
    const pdfBuffer = await generatePdfFromHtml(html)
    let previewPdfUrl: string | null = null
    if (pdfBuffer) {
      const pdfPath = `projects/${projectId}/design_v1_${ts}.pdf`
      const { error: pdfUploadError } = await supabase.storage
        .from('designs').upload(pdfPath, pdfBuffer, { contentType: 'application/pdf' })
      if (!pdfUploadError) {
        const { data: { publicUrl: pdfPublicUrl } } = supabase.storage.from('designs').getPublicUrl(pdfPath)
        previewPdfUrl = pdfPublicUrl
      }
    }

    await supabase.from('designs').insert({
      project_id: projectId,
      preview_url: publicUrl,
      preview_pdf_url: previewPdfUrl,
      designer_status: 'pending',
    })

    await transitionStatus(supabase, projectId, 'design_review', {
      note: `AI 디자인 자동 생성 완료${previewPdfUrl ? ' (PDF 포함)' : ''}`,
    })
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
