import { createServiceClient } from '@/lib/supabase/service'
import { generateDesignImage } from './gemini-image'
import { buildStylingPrompt, buildSectionDesignPrompt } from './design-prompt-builder'
import { buildImageStackHtml } from './html-template'
import { transitionStatus } from '@/lib/status-machine'

const CHROMIUM_PACK_URL =
  process.env.CHROMIUM_PACK_URL ??
  'https://github.com/Sparticuz/chromium/releases/download/v143.0.0/chromium-v143.0.0-pack.tar'

const DELAY_MS = 5000 // API 호출 간 딜레이

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function generatePdfFromHtml(html: string): Promise<Buffer | null> {
  try {
    const { chromium: playwrightChromium } = await import('playwright-core')
    let browser
    if (process.env.VERCEL) {
      const chromium = (await import('@sparticuz/chromium-min')).default
      const executablePath = await chromium.executablePath(CHROMIUM_PACK_URL)
      browser = await playwrightChromium.launch({
        args: chromium.args,
        executablePath,
        headless: true,
      })
    } else {
      browser = await playwrightChromium.launch({ headless: true })
    }
    const page = await browser.newPage()
    await page.setViewportSize({ width: 860, height: 1200 })
    await page.setContent(html, { waitUntil: 'networkidle' })
    const pdfBuffer = await page.pdf({
      width: '860px',
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

// intake_files에서 product_photo 타입 누끼컷을 다운로드해 base64 배열로 반환
async function fetchNukiCuts(supabase: ReturnType<typeof createServiceClient>, projectId: string): Promise<string[]> {
  const { data: files } = await supabase
    .from('intake_files')
    .select('storage_path')
    .eq('project_id', projectId)
    .eq('file_type', 'product_photo')
    .order('created_at', { ascending: true })

  if (!files || files.length === 0) return []

  const results: string[] = []
  for (const file of files) {
    try {
      const { data } = await supabase.storage.from('intake-files').download(file.storage_path)
      if (!data) continue
      const buffer = Buffer.from(await data.arrayBuffer())
      results.push(buffer.toString('base64'))
    } catch (err) {
      console.warn('[generate-design] Failed to download nuki cut:', file.storage_path, err)
    }
  }
  return results
}

function extractColorHex(colorSuggestion: string | undefined): string {
  return colorSuggestion?.match(/#[0-9a-fA-F]{6}/)?.[0] ?? '#4f46e5'
}

// ─── Phase A: 스타일링샷 생성 (Pro 모델) ───

async function generateStylingShots(
  content: any,
  project: any,
  nukiCuts: string[],
): Promise<Buffer[]> {
  const shots: string[] = content.shooting_requirements?.styling_shots ?? []
  if (shots.length === 0) {
    console.warn('[generate-design] 스타일링샷 목록 없음, 건너뜀')
    return []
  }

  const colorHex = extractColorHex(content.color_suggestion)
  const results: Buffer[] = []

  for (const description of shots.slice(0, 4)) {
    try {
      const prompt = buildStylingPrompt({
        stylingDescription: description,
        category: project.category ?? 'food',
        platform: project.platforms?.slug ?? 'smartstore',
        companyName: project.company_name,
        productHighlights: project.product_highlights ?? '',
        colorHex,
        tone: content.tone ?? '',
      })

      const buffer = await generateDesignImage({
        prompt,
        referenceImages: nukiCuts.slice(0, 3),
        aspectRatio: '3:4',
        model: 'pro',
      })
      results.push(buffer)
      console.warn(`[generate-design] 스타일링샷 ${results.length}/${Math.min(shots.length, 4)} 생성 완료`)
    } catch (err) {
      console.warn('[generate-design] 스타일링샷 생성 실패:', String(err).slice(0, 200))
    }
    await delay(DELAY_MS)
  }

  return results
}

// ─── Phase B: 섹션별 상세페이지 이미지 생성 (NB2 모델) ───

async function generateSectionImages(
  content: any,
  project: any,
  nukiCuts: string[],
  stylingShots: Buffer[],
): Promise<Array<{ type: string; buffer: Buffer }>> {
  const sections: any[] = content.sections ?? []
  const results: Array<{ type: string; buffer: Buffer }> = []

  // 참조 이미지 풀: 누끼컷 + 스타일링샷
  const refPool = [
    ...nukiCuts.slice(0, 2),
    ...stylingShots.slice(0, 2).map(b => b.toString('base64')),
  ]

  for (const section of sections) {
    try {
      const prompt = buildSectionDesignPrompt({
        section,
        category: project.category ?? 'food',
        platform: project.platforms?.slug ?? 'smartstore',
        companyName: project.company_name,
        tone: content.tone ?? '',
        colorSuggestion: content.color_suggestion ?? '',
      })

      // 이전 섹션 이미지를 참조로 추가 (톤 일관성)
      const refs = [...refPool]
      if (results.length > 0) {
        refs.push(results[results.length - 1].buffer.toString('base64'))
      }

      const buffer = await generateDesignImage({
        prompt,
        referenceImages: refs.slice(0, 6), // NB2는 14장까지 가능하지만 6장으로 제한 (메모리)
        aspectRatio: section.type === 'hero' ? '9:16' : '3:4',
        model: 'nb2',
      })
      results.push({ type: section.type, buffer })
      console.warn(`[generate-design] 섹션 ${section.type} 이미지 생성 완료 (${results.length}/${sections.length})`)
    } catch (err) {
      console.warn(`[generate-design] 섹션 ${section.type} 생성 실패:`, String(err).slice(0, 200))
    }
    await delay(DELAY_MS)
  }

  return results
}

// ─── Phase C: 이미지 합성 + PDF + 저장 ───

// ─── 메인 파이프라인 ───

export async function generateDesignForProject(projectId: string) {
  const supabase = createServiceClient()

  // 1. 데이터 로드
  const { data: project } = await supabase
    .from('projects').select('*, platforms(name, slug)').eq('id', projectId).single()
  const { data: script } = await supabase
    .from('scripts').select('content')
    .eq('project_id', projectId).eq('planner_status', 'approved').single()

  if (!project || !script) throw new Error('Missing project or approved script')

  await transitionStatus(supabase, projectId, 'design_generating', { note: '디자인 생성 시작 (Gemini 파이프라인)' })

  const content = script.content as any
  if (!content.sections || !Array.isArray(content.sections)) {
    throw new Error('Invalid script content: missing sections')
  }

  try {
    const ts = Date.now()

    // 누끼컷 로드
    const nukiCuts = await fetchNukiCuts(supabase, projectId)
    console.warn(`[generate-design] 누끼컷 ${nukiCuts.length}장 로드됨`)

    // Phase A: 스타일링샷 생성 (Pro 모델)
    console.warn('[generate-design] Phase A: 스타일링샷 생성 시작')
    const stylingShots = await generateStylingShots(content, project, nukiCuts)
    console.warn(`[generate-design] Phase A 완료: 스타일링샷 ${stylingShots.length}장`)

    // Phase B: 섹션별 이미지 생성 (NB2 모델)
    console.warn('[generate-design] Phase B: 섹션별 이미지 생성 시작')
    const sectionImages = await generateSectionImages(content, project, nukiCuts, stylingShots)
    console.warn(`[generate-design] Phase B 완료: 섹션 이미지 ${sectionImages.length}장`)

    if (sectionImages.length === 0) {
      throw new Error('섹션 이미지가 하나도 생성되지 않았습니다')
    }

    // Phase C: 저장 + PDF
    console.warn('[generate-design] Phase C: 저장 + PDF 생성')

    // 섹션별 PNG 업로드
    const sectionRecords: Array<{ type: string; url: string }> = []
    for (const { type, buffer } of sectionImages) {
      const path = `projects/${projectId}/design_v1_${type}_${ts}.png`
      const { error } = await supabase.storage.from('designs').upload(path, buffer, { contentType: 'image/png' })
      if (!error) {
        const { data: { publicUrl } } = supabase.storage.from('designs').getPublicUrl(path)
        sectionRecords.push({ type, url: publicUrl })
      }
    }

    // PDF 생성
    const stackHtml = buildImageStackHtml(
      sectionImages.map(s => ({ type: s.type, base64: s.buffer.toString('base64') }))
    )
    const pdfBuffer = await generatePdfFromHtml(stackHtml)
    let pdfUrl: string | null = null
    if (pdfBuffer) {
      const pdfPath = `projects/${projectId}/design_v1_${ts}.pdf`
      const { error: pdfErr } = await supabase.storage
        .from('designs').upload(pdfPath, pdfBuffer, { contentType: 'application/pdf' })
      if (!pdfErr) {
        pdfUrl = supabase.storage.from('designs').getPublicUrl(pdfPath).data.publicUrl
      }
    }

    // DB insert
    const heroRecord = sectionRecords.find(r => r.type === 'hero')
    await supabase.from('designs').insert({
      project_id: projectId,
      preview_url: heroRecord?.url ?? sectionRecords[0]?.url ?? null,
      preview_pdf_url: pdfUrl,
      section_images: sectionRecords,
      designer_status: 'pending',
    })

    const note = `AI 상세페이지 생성 완료 (Gemini Pro+NB2, 스타일링 ${stylingShots.length}장 + 섹션 ${sectionImages.length}장${pdfUrl ? ', PDF 포함' : ''})`
    await transitionStatus(supabase, projectId, 'design_review', { note })
    console.warn(`[generate-design] 완료: ${note}`)
  } catch (err) {
    console.error('[generate-design] 파이프라인 실패:', err)
    await transitionStatus(supabase, projectId, 'photo_uploaded', {
      note: `디자인 생성 실패: ${String(err).slice(0, 500)}`,
    })
  }
}
