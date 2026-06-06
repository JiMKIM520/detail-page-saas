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
import * as fs from 'fs'
import * as path from 'path'

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
    const input: ProjectInput = {
      productName: project.company_name,
      category: project.category ?? 'food',
      platform: (project.platforms as { slug?: string })?.slug ?? 'smartstore',
      productHighlights: project.product_highlights ?? '',
      targetAudience: '일반 소비자',
      nukkiPaths,
    }

    // 4. 파이프라인 실행 — 식품은 슬롯템플릿 경로, 그 외는 기존 제너릭 경로
    const isFood = input.category === 'food'
    let result
    if (isFood) {
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

    // 7. 상태 전이
    const nextStatus = result.success ? 'design_review' : 'photo_uploaded'
    await transitionStatus(supabase, projectId, nextStatus)

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

    // 상태 롤백
    try {
      await transitionStatus(supabase, projectId, 'photo_uploaded')
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
    const input: ProjectInput = {
      productName: project.company_name,
      category: project.category ?? 'food',
      platform: (project.platforms as { slug?: string })?.slug ?? 'smartstore',
      productHighlights: project.product_highlights ?? '',
      targetAudience: '일반 소비자',
      nukkiPaths,
    }

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
