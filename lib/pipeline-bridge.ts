/**
 * 웹앱 → agents 파이프라인 브릿지
 *
 * Supabase 프로젝트 데이터를 ProjectInput으로 변환하고,
 * agents/pm.ts 파이프라인을 실행한 뒤,
 * 결과물을 Supabase Storage에 업로드.
 */
import { createServiceClient } from '@/lib/supabase/service'
import { getVariant } from '@/agents/templates/blocks/registry'
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
    .select('storage_path, file_type, file_name')
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
      const intakePhotoName = new Map<string, string>() // url → 파일명 (원본 직배치 매칭용, Sprint 9-C)
      if (files) {
        for (const file of files) {
          const { data: signed } = await supabase.storage
            .from('intake-files')
            .createSignedUrl(file.storage_path, 60 * 60 * 24 * 7)
          if (signed?.signedUrl) {
            cutoutUrls.push(signed.signedUrl)
            intakePhotoName.set(signed.signedUrl, String((file as { file_name?: string }).file_name ?? ''))
          }
        }
      }

      // 스타일링샷 의도 매핑 — 기획 산출물(styling-final-prompts.json)의 shot 메타를 승격 보관
      // (name→imageNotes, finalPrompt/withProduct→재생성 루프·태거 kind 판정에 사용)
      type ShotMeta = { name?: string; filename?: string; finalPrompt?: string; withProduct?: boolean }
      const shotByFile = new Map<string, ShotMeta>()
      try {
        const { data: promptsBlob } = await supabase.storage
          .from('designs')
          .download(`projects/${projectId}/planning/styling-final-prompts.json`)
        if (promptsBlob) {
          const promptsJson = JSON.parse(await promptsBlob.text()) as { shots?: ShotMeta[] }
          for (const s of promptsJson.shots ?? []) {
            if (s.filename) shotByFile.set(s.filename, s)
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
            const meta = shotByFile.get(obj.name) ?? shotByFile.get(obj.name.replace(/^regen_/, ''))
            const intent = meta?.name ?? obj.name.replace(/\.[a-z]+$/i, '').replace(/[-_]/g, ' ')
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
      const defectsByUrl = new Map<string, string>()
      try {
        const { runImageTagger } = await import('@/agents/image-tagger')
        const kindOf = (u: string): 'styling' | 'asset' => {
          const base = (u.split('/').pop() ?? '').split('?')[0].replace(/^regen_/, '')
          return shotByFile.get(base)?.withProduct === false ? 'asset' : 'styling'
        }
        const taggerInputs = [
          ...stylingUrls.map((u) => ({ url: u, kind: kindOf(u), intendedNote: imageNotes[u] })),
          ...sectionUrls.map((u) => ({ url: u, kind: 'section' as const, intendedNote: imageNotes[u] })),
          ...cutoutUrls.map((u) => ({ url: u, kind: 'cutout' as const })),
        ]
        const tagged = await runImageTagger(taggerInputs, cutoutUrls[0])
        if (tagged.success && tagged.data) {
          for (const [u, t] of Object.entries(tagged.data)) {
            if (t.quality === 'reject') {
              rejectedUrls.add(u)
              defectsByUrl.set(u, t.defects ?? t.desc)
              continue
            }
            const marks = [t.orientation === 'portrait' ? '세로' : t.orientation === 'landscape' ? '가로' : '정방']
            if (t.quality === 'degraded') marks.push('차선 — 배경·원경·소형 슬롯용')
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

      // 컷 재생성 루프 (Sprint 5) — reject 사유를 역주입해 1회 재생성, 재검수 통과분만 풀 복귀.
      // 버리는 컷을 회수해 페이지 야윔(이미지 감쇠 체인)을 막는다. 상한 4건.
      if (rejectedUrls.size > 0 && shotByFile.size > 0) {
        try {
          const { generateDesignImage } = await import('@/lib/ai/gemini-image')
          const { runImageTagger } = await import('@/agents/image-tagger')
          const nukkiB64: string[] = []
          for (const file of (files ?? []).slice(0, 3)) {
            const { data: blob } = await supabase.storage.from('intake-files').download(file.storage_path)
            if (blob) nukkiB64.push(Buffer.from(await blob.arrayBuffer()).toString('base64'))
          }
          const targets = [...rejectedUrls]
            .map((u) => ({ url: u, base: (u.split('/').pop() ?? '').split('?')[0] }))
            .filter((t) => !t.base.startsWith('regen_'))
            .map((t) => ({ ...t, meta: shotByFile.get(t.base) }))
            .filter((t) => Boolean(t.meta?.finalPrompt))
            .slice(0, 4)
          const regenerated: Array<{ url: string; kind: 'styling' | 'asset' }> = []
          for (const t of targets) {
            const defect = defectsByUrl.get(t.url) ?? '라벨/피사체 훼손'
            const noProduct = t.meta!.withProduct === false
            const prompt = `${t.meta!.finalPrompt}\n\n[QA FEEDBACK — MUST FIX] ${defect}. ${noProduct ? 'No product, no packaging, no text anywhere in frame.' : 'Product label text MUST match the reference photos EXACTLY, character by character.'}`
            try {
              const buf = await generateDesignImage({ prompt, referenceImages: noProduct ? [] : nukkiB64, aspectRatio: '3:4', model: 'pro' })
              const newName = `regen_${t.base}`
              const { error: upErr } = await supabase.storage
                .from('designs')
                .upload(`projects/${projectId}/styling_real/${newName}`, buf, { contentType: 'image/png', upsert: true })
              if (upErr) throw new Error(upErr.message)
              const { data: pub } = supabase.storage.from('designs').getPublicUrl(`projects/${projectId}/styling_real/${newName}`)
              if (pub?.publicUrl) regenerated.push({ url: pub.publicUrl, kind: noProduct ? 'asset' : 'styling' })
            } catch (ge) {
              console.warn(`[pipeline-bridge] 재생성 실패 ${t.base}:`, (ge as Error).message?.slice(0, 100))
            }
          }
          if (regenerated.length) {
            const retag = await runImageTagger(
              regenerated.map((r) => ({ url: r.url, kind: r.kind })),
              cutoutUrls[0],
            )
            let revived = 0
            if (retag.success && retag.data) {
              for (const [u, t2] of Object.entries(retag.data)) {
                if (t2.quality === 'reject') continue
                stylingUrls.push(u)
                const marks = [t2.orientation === 'portrait' ? '세로' : t2.orientation === 'landscape' ? '가로' : '정방']
                if (t2.quality === 'degraded') marks.push('차선 — 배경·원경·소형 슬롯용')
                imageNotes[u] = `실물 확인[재생성·${marks.join('·')}]: ${t2.desc}`
                revived++
              }
            }
            console.log(`[pipeline-bridge] 컷 재생성 루프 — ${targets.length}건 재생성 · ${revived}건 복귀`)
          }
        } catch (e) {
          console.warn('[pipeline-bridge] 재생성 루프 스킵:', (e as Error).message?.slice(0, 120))
        }
      }

      const okStyling = stylingUrls.filter((u) => !rejectedUrls.has(u))
      const okSection = sectionUrls.filter((u) => !rejectedUrls.has(u))

      // 저장된 청사진(기획 단계 산출, Sprint 5) — 조립 시 플래너 재실행 생략 + 니즈 id→컷 URL 매핑
      let storedBlueprint: import('@/agents/page-planner').PageBlueprint | undefined
      try {
        const { data: bpBlob } = await supabase.storage
          .from('designs')
          .download(`projects/${projectId}/planning/blueprint.json`)
        if (bpBlob) storedBlueprint = JSON.parse(await bpBlob.text()) as import('@/agents/page-planner').PageBlueprint
      } catch {
        /* 청사진 없음 — 조립 단계 플래너(레거시 경로) */
      }
      // 생성된 "브랜드 로고" 계열 컷 — 업로드 로고와 동일하게 배치 화이트리스트(hero/closing/cs)
      // 적용 대상으로 승격. 스토리 배경 등에 로고컷이 깔려 헤드라인과 겹친 실사례(아로마티카 stf) 봉쇄.
      const needLogoUrls: string[] = []
      const usedOriginalUrls = new Set<string>()
      if (storedBlueprint?.sections?.length) {
        const byBase = new Map<string, string>()
        for (const u of okStyling) byBase.set((u.split('/').pop() ?? '').split('?')[0], u)
        // 원본 직배치 매칭 (Sprint 9-C) — 니즈 subject/id 토큰 ↔ 업로드 파일명 토큰
        const tokensOf = (t: string): string[] =>
          (t ?? '').toLowerCase().split(/[^a-z0-9가-힣]+/).filter((w) => w.length >= 2)
        const pickOriginal = (n: { id: string; subject?: string }): string | undefined => {
          let best: string | undefined
          let bestScore = 0
          const needTok = new Set(tokensOf(`${n.id} ${n.subject ?? ''}`))
          for (const [url, name] of intakePhotoName) {
            if (usedOriginalUrls.has(url)) continue
            const score = tokensOf(name).filter((w) => needTok.has(w)).length
            if (score > bestScore) { bestScore = score; best = url }
          }
          // 토큰 매칭 실패 시 미사용 원본 중 첫 번째(그래도 생성 실패보다 실물이 낫다)
          return best ?? [...intakePhotoName.keys()].find((u) => !usedOriginalUrls.has(u))
        }
        let mapped = 0
        let missing = 0
        let originals = 0
        for (const s of storedBlueprint.sections) {
          const urls: string[] = []
          for (const n of s.imageNeeds ?? []) {
            if (n.useOriginal) {
              const ou = pickOriginal(n)
              if (ou) {
                urls.push(ou)
                usedOriginalUrls.add(ou)
                imageNotes[ou] = `업로드 원본 실사(${intakePhotoName.get(ou) || '제품 사진'}) — 실물·라벨 정확, 지정 섹션 전용`
                mapped++
                originals++
                continue
              }
            }
            const u = byBase.get(`${n.id}.png`) ?? byBase.get(`regen_${n.id}.png`)
            if (u) {
              urls.push(u)
              mapped++
              if (/logo|로고/i.test(`${n.id} ${n.subject ?? ''}`)) needLogoUrls.push(u)
            } else missing++
          }
          if (urls.length) {
            // 캡은 변형의 실제 슬롯 수 기준 (Sprint 9-D — 고정 2가 다슬롯 섹션 결손 유발했던 2차 방벽)
            const slots = getVariant(s.variantId)?.imageSlots ?? 2
            s.imageUrls = urls.slice(0, Math.max(1, slots))
          }
        }
        if (originals) console.log(`[pipeline-bridge] 원본 직배치 ${originals}건 (생성 대체)`)
        console.log(
          `[pipeline-bridge] 저장 청사진 사용 — ${storedBlueprint.sections.length}블록 · 니즈 매핑 ${mapped}건 · 미충족 ${missing}건${needLogoUrls.length ? ` · 로고컷 ${needLogoUrls.length}건(배치 화이트리스트)` : ''}`,
        )
      }

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
      // 니즈 기반 생성 로고컷도 로고 취급 — 배치 가드가 hero/closing/cs 밖 배치를 수술한다
      for (const u of needLogoUrls) {
        if (!logoUrls.includes(u)) logoUrls.push(u)
        imageNotes[u] ??= '브랜드 로고 연출컷 — 히어로/클로징 브랜드 슬롯 전용 (본문 배경 금지)'
      }

      // 아트디렉터 스타일가이드 — 팔레트·폰트를 블록 토큰에 반영 (Sprint 4-D. 없으면 프리셋 유지)
      let styleGuideTokens: import('@/agents/templates/blocks/tokens').StyleGuideTokenInput | undefined
      try {
        const { data: sgBlob } = await supabase.storage
          .from('designs')
          .download(`projects/${projectId}/planning/style-guide.json`)
        if (sgBlob) {
          const sg = JSON.parse(await sgBlob.text()) as {
            colors?: Record<string, string>
            typography?: Record<string, unknown>
            shapeLanguage?: string
            brand?: { moodKeywords?: string[] }
          }
          styleGuideTokens = {
            colors: sg.colors,
            typography: sg.typography as import('@/agents/templates/blocks/tokens').StyleGuideTokenInput['typography'],
            // 형태 언어 (Sprint 6) — 아트디렉터 명시값 우선, 무드 키워드는 폴백 결정용
            shapeLanguage: sg.shapeLanguage,
            moodKeywords: sg.brand?.moodKeywords,
          }
          console.log('[pipeline-bridge] 스타일가이드 로드 — 토큰 오버라이드 적용 예정')
        }
      } catch {
        /* 스타일가이드 없음 — 프리셋 토큰 유지 */
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
        cutoutUrls: cutoutUrls.filter((u) => !usedOriginalUrls.has(u)),
        // 직배치 원본은 누끼 가드 대상에서 빼되, 새니타이즈 허용 집합(섹션 풀)에는 반드시 포함
        // — cutoutUrls에서만 빼면 "지어낸 URL"로 오인 제거되는 실사례(럽앤 직배치 0장) 봉쇄
        sectionImageUrls: [...okSection, ...logoUrls, ...usedOriginalUrls],
        imageNotes,
        preferredPreset: presetForCategory(input.category),
        script: approvedScript,
        logoUrls,
        styleGuide: styleGuideTokens,
        blueprint: storedBlueprint,
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

    // 5.5. 수요 기반 이미지 계획 (Sprint 5) — 승인 스크립트로 청사진(블록+이미지 니즈)을 먼저 만들고,
    // 컷 목록(shots)을 니즈 기반으로 교체한다. 실패 시 아트디렉터의 8컷 공식 유지(무중단).
    try {
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
      } else if (result.artifacts.script && fs.existsSync(result.artifacts.script)) {
        const js = JSON.parse(fs.readFileSync(result.artifacts.script, 'utf8')) as { sections?: unknown[] }
        if (Array.isArray(js?.sections) && js.sections.length)
          approvedScript = js as { tone?: string; sections: Array<Record<string, unknown>> }
      }
      if (approvedScript) {
        const { runPagePlanner } = await import('@/agents/page-planner')
        const { runShotPrompter } = await import('@/agents/shot-prompter')
        const { buildProjectBrief } = await import('@/agents/pm')
        const brief = buildProjectBrief(input, projectId)
        // 무드 키워드(아트디렉터) — 히어로 아형 내 변형 선택의 보조 신호
        let moodKeywords: string[] | undefined
        try {
          if (result.artifacts.styleGuide) {
            const sgm = JSON.parse(fs.readFileSync(result.artifacts.styleGuide, 'utf8')) as {
              brand?: { moodKeywords?: string[] }
            }
            moodKeywords = sgm.brand?.moodKeywords
          }
        } catch { /* 무드 없이 진행 */ }
        // 업로드 원본 사진 파일명 — useOriginal 판단 근거 (Sprint 9-C)
        let uploadedPhotos: string[] | undefined
        try {
          const { data: photoRows } = await supabase
            .from('intake_files')
            .select('file_name')
            .eq('project_id', projectId)
            .eq('file_type', 'product_photo')
            .order('created_at', { ascending: true })
          uploadedPhotos = (photoRows ?? []).map((r) => String(r.file_name ?? '')).filter(Boolean)
        } catch { /* 파일명 없이 진행 */ }
        const planned = await runPagePlanner({ brief, script: approvedScript, imageNotes: {}, moodKeywords, uploadedPhotos })
        if (planned.success && planned.data) {
          const allNeeds = planned.data.sections.flatMap((s) => s.imageNeeds ?? [])
          const originalNeeds = allNeeds.filter((n) => n.useOriginal)
          const needs = allNeeds.filter((n) => !n.useOriginal)
          if (originalNeeds.length)
            console.log(`[pipeline-bridge/planning] 원본 직배치 니즈 ${originalNeeds.length}건 — 생성 제외: ${originalNeeds.map((n) => n.id).join(', ')}`)
          let sg: unknown
          try {
            if (result.artifacts.styleGuide) sg = JSON.parse(fs.readFileSync(result.artifacts.styleGuide, 'utf8'))
          } catch { /* 스타일가이드 없이 진행 */ }
          const prompted = await runShotPrompter({
            needs,
            styleGuide: sg as never,
            productName: input.productName,
            category: input.category,
          })
          if (prompted.success && prompted.data && prompted.data.length >= Math.min(4, needs.length)) {
            let existing: Record<string, unknown> = {}
            try {
              if (result.artifacts.stylingPrompts)
                existing = JSON.parse(fs.readFileSync(result.artifacts.stylingPrompts, 'utf8'))
            } catch { /* 기존 파일 없으면 새로 구성 */ }
            const merged = { ...existing, shots: prompted.data, shotsSource: 'blueprint-needs' }
            await uploadToStorage(
              `projects/${projectId}/planning/styling-final-prompts.json`,
              Buffer.from(JSON.stringify(merged, null, 2)),
              'application/json',
            )
            await uploadToStorage(
              `projects/${projectId}/planning/blueprint.json`,
              Buffer.from(JSON.stringify(planned.data, null, 2)),
              'application/json',
            )
            console.log(
              `[pipeline-bridge/planning] 수요 기반 이미지 계획 — 청사진 ${planned.data.sections.length}블록 · 니즈 컷 ${prompted.data.length}건(제품 미포함 ${prompted.data.filter((s) => !s.withProduct).length}건)`,
            )
          } else {
            console.warn('[pipeline-bridge/planning] 샷 프롬프터 미달 — 아트디렉터 8컷 공식 유지')
          }
        } else {
          console.warn('[pipeline-bridge/planning] 청사진 실패 — 아트디렉터 8컷 공식 유지')
        }
      } else {
        console.warn('[pipeline-bridge/planning] 승인 스크립트 없음 — 수요 기반 계획 생략')
      }
    } catch (e) {
      console.warn('[pipeline-bridge/planning] 수요 기반 계획 스킵:', (e as Error).message?.slice(0, 140))
    }

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
