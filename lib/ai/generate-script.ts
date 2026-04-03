import { createServiceClient } from '@/lib/supabase/service'
import type { Json } from '@/lib/supabase/types'
import { generateScript, generateScriptWithImages, type ImageInput } from './claude'
import { SCRIPT_SYSTEM_PROMPT, buildUserPrompt } from './prompts/script-base'
import { buildDifferentiatedSystemPrompt, buildEnhancedUserPrompt } from './prompts/builder'
import { transitionStatus } from '@/lib/status-machine'

async function fetchUrlContent(url: string): Promise<string | null> {
  try {
    const res = await fetch(`https://r.jina.ai/${encodeURIComponent(url)}`, {
      headers: { 'Accept': 'text/plain', 'X-No-Cache': 'true' },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return null
    const text = await res.text()
    return text.trim().slice(0, 3000) || null
  } catch {
    return null
  }
}

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

export async function generateScriptForProject(projectId: string, clientFeedback?: string) {
  const supabase = createServiceClient()

  const { data: project } = await supabase
    .from('projects')
    .select('*, platforms(name, slug, style_guide), categories(name, slug)')
    .eq('id', projectId)
    .single()

  if (!project) throw new Error(`Project ${projectId} not found`)

  await transitionStatus(supabase, projectId, 'script_generating', { note: '스크립트 생성 시작' })

  try {
    const joinedCategory = project.categories as { name: string; slug: string } | null
    const joinedPlatform = project.platforms as { name: string; slug: string; style_guide: string | null } | null
    const categorySlug = joinedCategory?.slug
    const platformSlug = joinedPlatform?.slug
    const categoryName = joinedCategory?.name ?? project.category ?? ''
    const platformName = joinedPlatform?.name ?? ''
    const platformStyleGuide = joinedPlatform?.style_guide ?? ''

    // 카테고리×플랫폼 분화 프롬프트 사용 (slug 존재 시), 없으면 기본 프롬프트 폴백
    const systemPrompt = categorySlug && platformSlug
      ? buildDifferentiatedSystemPrompt(categorySlug, platformSlug)
      : SCRIPT_SYSTEM_PROMPT

    // 업로드된 이미지 가져오기
    const images = await fetchIntakeImages(supabase, projectId)

    // URL 컨텐츠 추출 (Jina AI Reader)
    const urlContents: string[] = []
    const urlsToFetch = [project.homepage_url ?? '', project.detail_page_url ?? '']
    let urlFetchFailed = false
    for (const url of urlsToFetch) {
      if (!url) continue
      const content = await fetchUrlContent(url)
      if (content) {
        urlContents.push(content)
      } else {
        urlFetchFailed = true
      }
    }

    if (urlFetchFailed && images.length === 0) {
      await supabase.from('project_logs').insert({
        project_id: projectId,
        from_status: 'script_generating',
        to_status: 'script_generating',
        note: 'URL 컨텐츠 추출 실패 — 관리자 스크린샷 업로드 권장',
      })
    }

    const urlContext = urlContents.length > 0 ? urlContents.join('\n\n---\n\n') : null

    const baseUserPrompt = categorySlug && platformSlug
      ? buildEnhancedUserPrompt({
          company_name: project.company_name,
          homepage_url: project.homepage_url,
          detail_page_url: project.detail_page_url,
          product_highlights: project.product_highlights ?? '',
          reference_notes: project.reference_notes,
          category_name: categoryName,
          platform_name: platformName,
          platform_style_guide: platformStyleGuide,
          brand_name: project.brand_name,
          target_audience: Array.isArray(project.target_audience) ? project.target_audience as string[] : null,
          design_preference: project.design_preference,
        })
      : buildUserPrompt({
          company_name: project.company_name,
          homepage_url: project.homepage_url,
          detail_page_url: project.detail_page_url,
          product_highlights: project.product_highlights ?? '',
          reference_notes: project.reference_notes,
          category: project.category ?? '',
          platform_style_guide: platformStyleGuide,
        })

    let userPrompt = baseUserPrompt + (urlContext ? `\n\n## 참조 URL에서 추출한 컨텐츠\n${urlContext}` : '')
    if (clientFeedback) {
      userPrompt += `\n\n## 클라이언트 수정 요청\n다음 피드백을 반영하여 스크립트를 수정하세요:\n${clientFeedback}`
    }

    let rawScript: string
    if (images.length > 0) {
      rawScript = await generateScriptWithImages(systemPrompt, userPrompt, images)
    } else {
      rawScript = await generateScript(systemPrompt, userPrompt)
    }

    let scriptContent: Json
    try {
      scriptContent = JSON.parse(rawScript) as Json
    } catch (firstErr) {
      console.warn(`[generate-script] Initial JSON parse failed for project ${projectId}:`, firstErr, `Raw output length: ${rawScript.length}`)
      const retryPrompt = systemPrompt + '\n\n반드시 순수 JSON만 응답하세요. 마크다운 없이.'
      try {
        const retried = images.length > 0
          ? await generateScriptWithImages(retryPrompt, userPrompt, images)
          : await generateScript(retryPrompt, userPrompt)
        scriptContent = JSON.parse(retried) as Json
      } catch (retryErr) {
        throw new Error(`Script JSON parse failed after retry. Initial output (first 200 chars): ${rawScript.substring(0, 200)}`)
      }
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

export async function generateAbVariant(projectId: string, scriptId: string) {
  const supabase = createServiceClient()

  const { data: project } = await supabase
    .from('projects')
    .select('*, platforms(name, slug, style_guide), categories(name, slug)')
    .eq('id', projectId)
    .single()

  if (!project) throw new Error(`Project ${projectId} not found`)

  const joinedCategory = project.categories as { name: string; slug: string } | null
  const joinedPlatform = project.platforms as { name: string; slug: string; style_guide: string | null } | null
  const categorySlug = joinedCategory?.slug
  const platformSlug = joinedPlatform?.slug
  const categoryName = joinedCategory?.name ?? project.category ?? ''
  const platformName = joinedPlatform?.name ?? ''
  const platformStyleGuide = joinedPlatform?.style_guide ?? ''

  // 디자인 가이드 없는 버전으로 시스템 프롬프트 생성
  const systemPrompt = categorySlug && platformSlug
    ? buildDifferentiatedSystemPrompt(categorySlug, platformSlug, { includeDesignGuide: false })
    : SCRIPT_SYSTEM_PROMPT

  const images = await fetchIntakeImages(supabase, projectId)

  const userPrompt = categorySlug && platformSlug
    ? buildEnhancedUserPrompt({
        company_name: project.company_name,
        homepage_url: project.homepage_url,
        detail_page_url: project.detail_page_url,
        product_highlights: project.product_highlights ?? '',
        reference_notes: project.reference_notes,
        category_name: categoryName,
        platform_name: platformName,
        platform_style_guide: platformStyleGuide,
        brand_name: project.brand_name,
        target_audience: Array.isArray(project.target_audience) ? project.target_audience as string[] : null,
        design_preference: project.design_preference,
      })
    : buildUserPrompt({
        company_name: project.company_name,
        homepage_url: project.homepage_url,
        detail_page_url: project.detail_page_url,
        product_highlights: project.product_highlights ?? '',
        reference_notes: project.reference_notes,
        category: project.category ?? '',
        platform_style_guide: platformStyleGuide,
      })

  const rawScript = images.length > 0
    ? await generateScriptWithImages(systemPrompt, userPrompt, images)
    : await generateScript(systemPrompt, userPrompt)

  let abContent: Json
  try {
    abContent = JSON.parse(rawScript) as Json
  } catch {
    const retried = images.length > 0
      ? await generateScriptWithImages(systemPrompt + '\n\n반드시 순수 JSON만 응답하세요.', userPrompt, images)
      : await generateScript(systemPrompt + '\n\n반드시 순수 JSON만 응답하세요.', userPrompt)
    abContent = JSON.parse(retried) as Json
  }

  await supabase.from('scripts').update({ ab_content: abContent }).eq('id', scriptId)
}
