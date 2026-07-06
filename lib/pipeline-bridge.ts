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

      // 스타일링샷 의도 매핑 — 파일명만으로는 컷의 역할(성분/사용/무드)을 알 수 없어
      // 기획 산출물(styling-final-prompts.json)의 shot name을 imageNotes로 전달한다
      const shotNameByFile = new Map<string, string>()
      try {
        const { data: promptsBlob } = await supabase.storage
          .from('designs')
          .download(`projects/${projectId}/planning/styling-final-prompts.json`)
        if (promptsBlob) {
          const promptsJson = JSON.parse(await promptsBlob.text()) as {
            shots?: Array<{ name?: string; filename?: string }>
          }
          for (const s of promptsJson.shots ?? []) {
            if (s.filename && s.name) shotNameByFile.set(s.filename, s.name)
          }
        }
      } catch {
        /* 기획 산출물 없으면 파일명 폴백 */
      }

      // 스타일링샷(있으면 연출 이미지로 우선 사용) — designs/projects/{id}/styling_real/*
      const stylingUrls: string[] = []
      const imageNotes: Record<string, string> = {}
      const { data: stylingList } = await supabase.storage
        .from('designs')
        .list(`projects/${projectId}/styling_real`)
      for (const obj of stylingList ?? []) {
        if (obj.name && /\.(png|jpe?g|webp)$/i.test(obj.name)) {
          const { data: pub } = supabase.storage
            .from('designs')
            .getPublicUrl(`projects/${projectId}/styling_real/${obj.name}`)
          if (pub?.publicUrl) {
            stylingUrls.push(pub.publicUrl)
            const intent = shotNameByFile.get(obj.name) ?? obj.name.replace(/\.[a-z]+$/i, '').replace(/[-_]/g, ' ')
            imageNotes[pub.publicUrl] = `연출 스타일링샷: ${intent}`
          }
        }
      }

      // 섹션 보조 이미지(관리자 수동 업로드 등) — projects/{id}/section_images/*
      // 주의: art-director sectionImageBriefs 산출물(장식 텍스처, 제품 없음)은 여기에 올리지 말 것 — 콘텐츠 슬롯 오염
      const sectionUrls: string[] = []
      const { data: sectionList } = await supabase.storage
        .from('designs')
        .list(`projects/${projectId}/section_images`)
      for (const obj of sectionList ?? []) {
        if (obj.name && /\.(png|jpe?g|webp)$/i.test(obj.name)) {
          const { data: pub } = supabase.storage
            .from('designs')
            .getPublicUrl(`projects/${projectId}/section_images/${obj.name}`)
          if (pub?.publicUrl) {
            sectionUrls.push(pub.publicUrl)
            imageNotes[pub.publicUrl] = `섹션 보조 이미지: ${obj.name.replace(/^section_/, '').replace(/\.[a-z]+$/i, '').replace(/[-_]/g, ' ')}`
          }
        }
      }

      // 이미지 태거 — 컴포저는 이미지를 못 보므로(블라인드 배치), 비전 모델이 각 컷의 실물을
      // 검수해 노트를 실물 기반으로 교체하고 훼손 컷(라벨 변조 등)은 풀에서 제외한다.
      // 원본 누끼를 정답 레퍼런스로 대조(브랜드명·용량 변조 검출). 실패 시 기존 노트 유지.
      for (const u of cutoutUrls) imageNotes[u] = '제품 누끼/단독 컷 (업로드 원본)'
      let rejectedUrls = new Set<string>()
      try {
        const { runImageTagger } = await import('@/agents/image-tagger')
        const taggerInputs = [
          ...stylingUrls.map((u) => ({ url: u, kind: 'styling' as const, intendedNote: imageNotes[u] })),
          ...sectionUrls.map((u) => ({ url: u, kind: 'section' as const, intendedNote: imageNotes[u] })),
          ...cutoutUrls.map((u) => ({ url: u, kind: 'cutout' as const })),
        ]
        const tagged = await runImageTagger(taggerInputs, cutoutUrls[0])
        if (tagged.success && tagged.data) {
          for (const [u, t] of Object.entries(tagged.data)) {
            if (t.quality === 'reject') {
              rejectedUrls.add(u)
              continue
            }
            const marks = [t.orientation === 'portrait' ? '세로' : t.orientation === 'landscape' ? '가로' : '정방']
            if (t.quality === 'degraded') marks.push('차선 — 소형 슬롯에만')
            const prefix = cutoutUrls.includes(u) ? '제품 누끼(원본)' : '실물 확인'
            imageNotes[u] = `${prefix}[${marks.join('·')}]: ${t.desc}`
          }
          if (rejectedUrls.size)
            console.warn(
              `[pipeline-bridge] 태거 reject ${rejectedUrls.size}장 제외 — ${[...rejectedUrls].map((u) => u.split('/').pop()).join(', ')}`,
            )
        }
      } catch (e) {
        console.warn('[pipeline-bridge] 이미지 태거 실패(파일명 노트 유지):', (e as Error).message?.slice(0, 120))
      }
      const okStyling = stylingUrls.filter((u) => !rejectedUrls.has(u))
      const okSection = sectionUrls.filter((u) => !rejectedUrls.has(u))

      // 승인 스크립트 로드 — scripts 테이블 최신본 우선, 없으면 기획 산출물 script.json 폴백 (재설계 Sprint 1a)
      let approvedScript: { tone?: string; sections: Array<Record<string, unknown>> } | undefined
      const { data: scriptRow } = await supabase
        .from('scripts')
        .select('content')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      const rowContent = (scriptRow?.content ?? null) as { tone?: string; sections?: unknown[] } | null
      if (Array.isArray(rowContent?.sections) && rowContent.sections.length) {
        approvedScript = rowContent as { tone?: string; sections: Array<Record<string, unknown>> }
      } else {
        try {
          const { data: blob } = await supabase.storage
            .from('designs')
            .download(`projects/${projectId}/planning/script.json`)
          if (blob) {
            const js = JSON.parse(await blob.text()) as { sections?: unknown[] }
            if (Array.isArray(js?.sections) && js.sections.length)
              approvedScript = js as { tone?: string; sections: Array<Record<string, unknown>> }
          }
        } catch {
          /* 스크립트 없음 — 청사진 없이 기존 경로 */
        }
      }
      console.log(`[pipeline-bridge] 승인 스크립트: ${approvedScript ? `${approvedScript.sections.length}섹션` : '없음(청사진 생략)'}`)

      // 브랜드 로고 — 색 추출 외에 이미지 자체를 브랜드 라벨 소형 슬롯 후보로 편입 (재설계 Sprint 1c)
      let logoUrls: string[] = []
      const { data: logoFiles } = await supabase
        .from('intake_files')
        .select('storage_path')
        .eq('project_id', projectId)
        .eq('file_type', 'brand_logo')
        .limit(1)
      if (logoFiles?.[0]) {
        const { data: signedLogo } = await supabase.storage
          .from('intake-files')
          .createSignedUrl(logoFiles[0].storage_path, 60 * 60 * 24 * 7)
        if (signedLogo?.signedUrl) {
          logoUrls = [signedLogo.signedUrl]
          imageNotes[signedLogo.signedUrl] = '브랜드 로고 원본 — 히어로/클로징 브랜드 라벨 소형 슬롯 전용'
        }
      }

      // 브랜드 대표색 추출 (brand_logo 우선)
      const brandColors = await deriveBrandColors(supabase, projectId)
      const blocksInput: ProjectInput = { ...input, brandColors }

      // 연출 풀: 스타일링샷 우선, 없으면 누끼컷 폴백
      const heroPool = okStyling.length > 0 ? okStyling : cutoutUrls
      console.log(
        `[pipeline-bridge] USE_BLOCKS_COMPOSER → 스타일링샷 ${okStyling.length}(제외 ${stylingUrls.length - okStyling.length}) · 섹션이미지 ${okSection.length} · 누끼 ${cutoutUrls.length} · 브랜드색 ${brandColors.join(',') || '없음'} · 프리셋 ${presetForCategory(input.category)}`,
      )
      const { runBlocksPipeline } = await import('@/agents/blocks-pipeline')
      result = await runBlocksPipeline(blocksInput, {
        heroImageUrl: heroPool[0],
        imageUrls: heroPool,
        cutoutUrls,
        sectionImageUrls: [...okSection, ...logoUrls],
        imageNotes,
        preferredPreset: presetForCategory(input.category),
        script: approvedScript,
        logoUrls,
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

    // 2.5. 고객 업로드 레퍼런스 디자인(≤3장) — 아트디렉터 스타일 참조 재연결 (Sprint 1c)
    const { data: refFiles } = await supabase
      .from('intake_files')
      .select('storage_path, file_name')
      .eq('project_id', projectId)
      .eq('file_type', 'reference_design')
      .limit(3)
    const referenceImagePaths: string[] = []
    for (const file of refFiles ?? []) {
      const { data: blob } = await supabase.storage.from('intake-files').download(file.storage_path)
      if (!blob) continue
      const localPath = path.join(tmpNukkiDir, `ref_${file.file_name}`)
      fs.writeFileSync(localPath, Buffer.from(await blob.arrayBuffer()))
      referenceImagePaths.push(localPath)
    }

    // 3. ProjectInput 구성 (기존 패턴 동일)
    const input = buildInputFromProject(project as unknown as Record<string, unknown>, nukkiPaths)
    input.referenceImagePaths = referenceImagePaths

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
