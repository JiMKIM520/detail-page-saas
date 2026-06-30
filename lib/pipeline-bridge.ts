/**
 * 웹앱 → agents 파이프라인 브릿지
 *
 * Supabase 프로젝트 데이터를 ProjectInput으로 변환하고,
 * agents/pm.ts 파이프라인을 실행한 뒤,
 * 결과물을 Supabase Storage에 업로드.
 */
import { createServiceClient } from '@/lib/supabase/service'
import { uploadPipelineOutput, updateDesignUrls, uploadToStorage } from '@/lib/storage'
import { transitionStatus } from '@/lib/status-machine'
import type { ProjectInput } from '@/agents/types'
import { composeProductContext } from '@/lib/ai/project-brief'
import { extractBrandColor } from '@/lib/ai/brand-color'
import { presetForCategory } from '@/agents/templates/blocks'
import type { SupabaseClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

/**
 * 브랜드 대표색 추출 — brand_logo 우선, 없으면 첫 제품사진(누끼).
 * 실패 시 빈 배열 → deriveTokens가 프리셋 기본색 사용.
 */
async function deriveBrandColors(supabase: SupabaseClient, projectId: string): Promise<string[]> {
  const { data: logos } = await supabase
    .from('intake_files')
    .select('storage_path, file_type')
    .eq('project_id', projectId)
    .in('file_type', ['brand_logo', 'product_photo'])
    .order('created_at', { ascending: true })

  // brand_logo 먼저, 그다음 product_photo
  const ordered = [...(logos ?? [])].sort((a, b) =>
    (a.file_type === 'brand_logo' ? 0 : 1) - (b.file_type === 'brand_logo' ? 0 : 1),
  )
  for (const f of ordered) {
    try {
      const { data: blob } = await supabase.storage.from('intake-files').download(f.storage_path)
      if (!blob) continue
      const hex = await extractBrandColor(Buffer.from(await blob.arrayBuffer()))
      if (hex) return [hex]
    } catch { /* 다음 파일 시도 */ }
  }
  return []
}

/**
 * 프로젝트 행(intake) → ProjectInput. 입력 데이터를 빠짐없이 반영한다.
 * (이전엔 targetAudience='일반 소비자' 하드코딩, design_preference·product_name·URL 누락 →
 *  어떤 제품이든 일반화된 빈약한 초안이 나왔음. 어느 한 제품이 아니라 전 제품 품질 바닥을 올리려면 여기가 핵심.)
 */
function buildInputFromProject(
  project: Record<string, unknown>,
  nukkiPaths: string[],
): ProjectInput {
  const ta = project.target_audience
  const targetAudience = Array.isArray(ta)
    ? ta.map((x) => String(x).trim()).filter(Boolean).join(', ')
    : typeof ta === 'string' && ta.trim()
      ? ta.trim()
      : '일반 소비자'

  const dp = project.design_preference
  const styleDirections = typeof dp === 'string'
    ? dp.split(',').map((s) => s.trim()).filter(Boolean)
    : Array.isArray(dp)
      ? dp.map((x) => String(x).trim()).filter(Boolean)
      : []

  const productName =
    (typeof project.product_name === 'string' && project.product_name.trim())
      ? project.product_name.trim()
      : String(project.company_name ?? '제품')

  return {
    productName,
    category: (project.category as string) ?? 'food',
    platform: (project.platforms as { slug?: string } | null)?.slug ?? 'smartstore',
    productHighlights: composeProductContext(project as Parameters<typeof composeProductContext>[0]),
    targetAudience,
    styleDirections,
    toneKeywords: styleDirections,
    homepageUrl: (project.homepage_url as string) ?? undefined,
    existingDetailUrl: (project.detail_page_url as string) ?? undefined,
    referenceDescription: (project.reference_notes as string) ?? undefined,
    nukkiPaths,
  }
}

/**
 * Supabase 프로젝트를 기반으로 전체 파이프라인 실행.
 * API route에서 호출.
 */
export async function runPipelineForProject(projectId: string): Promise<{
  success: boolean
  error?: string
}> {
  const supabase = createServiceClient()

  try {
    // 1. 프로젝트 데이터 로드
    const { data: project, error: projErr } = await supabase
      .from('projects')
      .select('*, platforms(name, slug)')
      .eq('id', projectId)
      .single()

    if (projErr || !project) {
      return { success: false, error: `Project not found: ${projectId}` }
    }

    // 상태 전이: → design_generating
    await transitionStatus(supabase, projectId, 'design_generating')

    // 2. 누끼컷 다운로드 → /tmp에 저장
    const { data: files } = await supabase
      .from('intake_files')
      .select('storage_path, file_name')
      .eq('project_id', projectId)
      .eq('file_type', 'product_photo')
      .order('created_at', { ascending: true })

    const tmpNukkiDir = path.join(
      process.env.VERCEL ? '/tmp' : process.cwd(),
      'tmp_nukki',
      projectId
    )
    fs.mkdirSync(tmpNukkiDir, { recursive: true })

    const nukkiPaths: string[] = []
    if (files) {
      for (const file of files) {
        const { data: blob } = await supabase.storage
          .from('intake-files')
          .download(file.storage_path)
        if (!blob) continue
        const localPath = path.join(tmpNukkiDir, file.file_name)
        fs.writeFileSync(localPath, Buffer.from(await blob.arrayBuffer()))
        nukkiPaths.push(localPath)
      }
    }

    if (nukkiPaths.length === 0) {
      await transitionStatus(supabase, projectId, 'photo_uploaded')
      return { success: false, error: 'No nukki cuts found' }
    }

    // 3. ProjectInput 구성
    const input = buildInputFromProject(project as unknown as Record<string, unknown>, nukkiPaths)

    // 4. 파이프라인 실행 — USE_BLOCKS_COMPOSER 플래그면 블록 컴포저 경로(실험·additive),
    //    아니면 기존 경로(식품=슬롯템플릿 / 그 외=제너릭). 플래그 미설정 시 동작 불변.
    const useBlocks = process.env.USE_BLOCKS_COMPOSER === 'true'
    const isFood = input.category === 'food'
    let result
    if (useBlocks) {
      // 누끼컷 → 서명URL (cutout 슬롯 + 브랜드색 추출 소스)
      const cutoutUrls: string[] = []
      if (files) {
        for (const file of files) {
          const { data: signed } = await supabase.storage
            .from('intake-files')
            .createSignedUrl(file.storage_path, 60 * 60 * 24 * 7)
          if (signed?.signedUrl) cutoutUrls.push(signed.signedUrl)
        }
      }

      // 스타일링샷(있으면 연출 이미지로 우선 사용) — designs/projects/{id}/styling_real/*
      const stylingUrls: string[] = []
      const { data: stylingList } = await supabase.storage
        .from('designs')
        .list(`projects/${projectId}/styling_real`)
      for (const obj of stylingList ?? []) {
        if (obj.name && /\.(png|jpe?g|webp)$/i.test(obj.name)) {
          const { data: pub } = supabase.storage
            .from('designs')
            .getPublicUrl(`projects/${projectId}/styling_real/${obj.name}`)
          if (pub?.publicUrl) stylingUrls.push(pub.publicUrl)
        }
      }

      // 브랜드 대표색 추출 (brand_logo 우선)
      const brandColors = await deriveBrandColors(supabase, projectId)
      const blocksInput: ProjectInput = { ...input, brandColors }

      // 연출 풀: 스타일링샷 우선, 없으면 누끼컷 폴백
      const heroPool = stylingUrls.length > 0 ? stylingUrls : cutoutUrls
      console.log(
        `[pipeline-bridge] USE_BLOCKS_COMPOSER → 스타일링샷 ${stylingUrls.length} · 누끼 ${cutoutUrls.length} · 브랜드색 ${brandColors.join(',') || '없음'} · 프리셋 ${presetForCategory(input.category)}`,
      )
      const { runBlocksPipeline } = await import('@/agents/blocks-pipeline')
      result = await runBlocksPipeline(blocksInput, {
        heroImageUrl: heroPool[0],
        imageUrls: heroPool,
        cutoutUrls,
        preferredPreset: presetForCategory(input.category),
      })
    } else if (isFood) {
      // 히어로용 첫 누끼컷 서명 URL (exporter가 즉시 PNG로 구워 영구 보존; 없으면 브랜드 그라데이션 폴백)
      let heroImageUrl: string | undefined
      if (files && files[0]) {
        const { data: signed } = await supabase.storage
          .from('intake-files')
          .createSignedUrl(files[0].storage_path, 60 * 60 * 24 * 7)
        heroImageUrl = signed?.signedUrl ?? undefined
      }
      console.log('[pipeline-bridge] 식품 → 슬롯템플릿 경로')
      const { runSlotPipeline } = await import('@/agents/slot-pipeline')
      result = await runSlotPipeline(input, { heroImageUrl })
    } else {
      const { runPipeline } = await import('@/agents/pm')
      result = await runPipeline(input)
    }

    // 5. 결과물 Storage 업로드
    const uploadResult = await uploadPipelineOutput(projectId, result.outputDir)
    console.log(`[pipeline-bridge] 업로드: ${uploadResult.uploadedFiles}/${uploadResult.totalFiles} 파일`)

    if (uploadResult.errors.length > 0) {
      console.warn('[pipeline-bridge] 업로드 에러:', uploadResult.errors.slice(0, 3))
    }

    // 6. designs 테이블 업데이트
    await updateDesignUrls(projectId, uploadResult.urls)

    // 7. 상태 전이 (실패 시 design_failed — 과거 photo_uploaded는 무효 전이로 스턱 유발)
    const nextStatus = result.success ? 'design_review' : 'design_failed'
    await transitionStatus(supabase, projectId, nextStatus, result.success ? undefined : { note: '디자인 생성 실패' })

    // 8. tmp 정리 (Vercel에서는 자동 정리되지만 명시적으로)
    try {
      fs.rmSync(tmpNukkiDir, { recursive: true, force: true })
      if (process.env.VERCEL) {
        fs.rmSync(result.outputDir, { recursive: true, force: true })
      }
    } catch { /* cleanup failure is non-fatal */ }

    return { success: result.success }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[pipeline-bridge] 파이프라인 실패:', message)

    // 상태 롤백 — design_generating에서 실패 시 design_failed로(재시도 가능). 직접 update로 안전 처리.
    try {
      await supabase.from('projects').update({ status: 'design_failed' }).eq('id', projectId)
      await supabase.from('project_logs').insert({
        project_id: projectId, from_status: 'design_generating', to_status: 'design_failed', note: `실패: ${message.slice(0, 200)}`,
      })
    } catch { /* rollback failure is non-fatal */ }

    return { success: false, error: message }
  }
}

/**
 * 기획 파이프라인 실행 — design_planning 상태에서 호출.
 *
 * runPlanningPipeline(input) 호출 후 3개 산출물 JSON을
 * 계약된 Supabase Storage 경로에 업로드하고 design_plan_review로 전이.
 *
 * 계약 경로:
 *   projects/{projectId}/planning/style-guide.json
 *   projects/{projectId}/planning/script.json
 *   projects/{projectId}/planning/styling-final-prompts.json
 */
export async function runPlanningForProject(projectId: string): Promise<{
  success: boolean
  error?: string
}> {
  const supabase = createServiceClient()

  try {
    // 1. 프로젝트 데이터 로드
    const { data: project, error: projErr } = await supabase
      .from('projects')
      .select('*, platforms(name, slug)')
      .eq('id', projectId)
      .single()

    if (projErr || !project) {
      return { success: false, error: `Project not found: ${projectId}` }
    }

    // 상태 전이: → design_planning
    await transitionStatus(supabase, projectId, 'design_planning')

    // 2. 누끼컷 다운로드 → /tmp에 저장 (기존 runPipelineForProject 패턴 동일)
    const { data: files } = await supabase
      .from('intake_files')
      .select('storage_path, file_name')
      .eq('project_id', projectId)
      .eq('file_type', 'product_photo')
      .order('created_at', { ascending: true })

    const tmpNukkiDir = path.join(
      process.env.VERCEL ? '/tmp' : process.cwd(),
      'tmp_nukki_planning',
      projectId
    )
    fs.mkdirSync(tmpNukkiDir, { recursive: true })

    const nukkiPaths: string[] = []
    if (files) {
      for (const file of files) {
        const { data: blob } = await supabase.storage
          .from('intake-files')
          .download(file.storage_path)
        if (!blob) continue
        const localPath = path.join(tmpNukkiDir, file.file_name)
        fs.writeFileSync(localPath, Buffer.from(await blob.arrayBuffer()))
        nukkiPaths.push(localPath)
      }
    }

    if (nukkiPaths.length === 0) {
      // 누끼 없이도 기획은 진행 가능 — 경고만 남기고 계속
      console.warn(`[pipeline-bridge/planning] projectId=${projectId}: 누끼컷 없음, 빈 배열로 기획 진행`)
    }

    // 3. ProjectInput 구성 (기존 패턴 동일)
    const input = buildInputFromProject(project as unknown as Record<string, unknown>, nukkiPaths)

    // 4. 기획 파이프라인 실행
    const { runPlanningPipeline } = await import('@/agents/pm')
    const result = await runPlanningPipeline(input)

    // 5. 산출물 3개 JSON을 계약 경로로 업로드
    const uploadArtifact = async (localPath: string | undefined, storagePath: string): Promise<void> => {
      if (!localPath) {
        console.warn(`[pipeline-bridge/planning] 산출물 경로 없음 — 스킵: ${storagePath}`)
        return
      }
      if (!fs.existsSync(localPath)) {
        console.warn(`[pipeline-bridge/planning] 파일 미존재 — 스킵: ${localPath}`)
        return
      }
      const buffer = fs.readFileSync(localPath)
      await uploadToStorage(storagePath, buffer, 'application/json')
      console.log(`[pipeline-bridge/planning] 업로드 완료: ${storagePath}`)
    }

    await uploadArtifact(
      result.artifacts.styleGuide,
      `projects/${projectId}/planning/style-guide.json`
    )
    await uploadArtifact(
      result.artifacts.script,
      `projects/${projectId}/planning/script.json`
    )
    await uploadArtifact(
      result.artifacts.stylingPrompts,
      `projects/${projectId}/planning/styling-final-prompts.json`
    )

    // 6. 상태 전이: → design_plan_review
    await transitionStatus(supabase, projectId, 'design_plan_review')

    // 7. tmp 정리
    try {
      fs.rmSync(tmpNukkiDir, { recursive: true, force: true })
      if (process.env.VERCEL) {
        fs.rmSync(result.outputDir, { recursive: true, force: true })
      }
    } catch { /* cleanup failure is non-fatal */ }

    return { success: result.success }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[pipeline-bridge/planning] 기획 파이프라인 실패:', message)

    // 상태 롤백 — design_planning 진입 전 상태인 script_approved로 복원
    try {
      await transitionStatus(supabase, projectId, 'script_approved')
    } catch { /* rollback failure is non-fatal */ }

    return { success: false, error: message }
  }
}
