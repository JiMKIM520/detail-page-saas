/**
 * 코코댕 전 과정 E2E (P0-b/P1-E2E 검증) — 인앱 버튼이 호출하는 바로 그 파이프라인 함수들로 구동.
 *   reset→script_approved → runPlanningForProject(기획+스타일링 프롬프트)
 *   → Gemini 스타일링샷 3컷 생성·업로드(styling_real/) → photo_uploaded
 *   → runPipelineForProject(초안: 스타일링샷+브랜드색+프리셋)
 */
import { createServiceClient } from '@/lib/supabase/service'
import { runPlanningForProject, runPipelineForProject } from '@/lib/pipeline-bridge'
import { generateDesignImage } from '@/lib/ai/gemini-image'
import { buildShotPrompt } from '@/agents/styling-shots'

const KOKODANG = '55ac6701-3c16-44a6-b111-83c67137f3a5'

async function setStatus(svc: ReturnType<typeof createServiceClient>, status: string) {
  await svc.from('projects').update({ status }).eq('id', KOKODANG)
  console.log(`[e2e] status → ${status}`)
}

async function genStylingShots(svc: ReturnType<typeof createServiceClient>): Promise<number> {
  const { data } = await svc.storage
    .from('designs')
    .download(`projects/${KOKODANG}/planning/styling-final-prompts.json`)
  if (!data) { console.warn('[e2e] styling-final-prompts.json 없음'); return 0 }
  const json = JSON.parse(await data.text())
  const shots: any[] = json.shots ?? []
  const rules: string[] = json.productPreservationRules ?? []
  if (shots.length === 0) { console.warn('[e2e] shots 비어있음'); return 0 }

  // 누끼 레퍼런스 (base64)
  const { data: files } = await svc
    .from('intake_files')
    .select('storage_path')
    .eq('project_id', KOKODANG)
    .eq('file_type', 'product_photo')
    .order('created_at')
  const nukki: string[] = []
  for (const f of files ?? []) {
    const { data: blob } = await svc.storage.from('intake-files').download(f.storage_path)
    if (blob) nukki.push(Buffer.from(await blob.arrayBuffer()).toString('base64'))
  }

  const { data: project } = await svc
    .from('projects')
    .select('category, platforms(slug)')
    .eq('id', KOKODANG)
    .single()
  const meta = {
    category: (project as any)?.category ?? 'pet',
    platform: (project as any)?.platforms?.slug ?? 'smartstore',
    aspectRatio: '3:4',
  }

  let ok = 0
  for (const shot of shots.slice(0, 3)) {
    try {
      const fp: string = shot.finalPrompt && /\[OUTPUT SPECS\]/.test(shot.finalPrompt)
        ? shot.finalPrompt
        : buildShotPrompt(shot, rules, meta as any)
      console.log(`[e2e] Gemini 생성: ${shot.name ?? shot.filename}…`)
      const buf = await generateDesignImage({
        prompt: fp,
        referenceImages: nukki.slice(0, 3),
        aspectRatio: '3:4',
        model: 'pro',
      })
      const p = `projects/${KOKODANG}/styling_real/${shot.filename || shot.name + '.png'}`
      const { error } = await svc.storage.from('designs').upload(p, buf, { contentType: 'image/png', upsert: true })
      if (error) throw new Error(error.message)
      ok++
      console.log(`[e2e]   ✓ 업로드 ${p} (${Math.round(buf.length / 1024)}KB)`)
    } catch (e) {
      console.warn(`[e2e]   ✗ ${shot.name}: ${(e as Error).message?.slice(0, 160)}`)
    }
  }
  return ok
}

async function main() {
  process.env.USE_BLOCKS_COMPOSER = 'true'
  const svc = createServiceClient()

  console.log('\n=== STEP 0: reset → script_approved ===')
  await setStatus(svc, 'script_approved')

  console.log('\n=== STEP 1: 디자인 기획(runPlanningForProject) ===')
  const plan = await runPlanningForProject(KOKODANG)
  console.log('[e2e] planning:', JSON.stringify(plan))
  if (!plan.success) { console.error('기획 실패 — 중단'); process.exit(1) }

  console.log('\n=== STEP 2: Gemini 스타일링샷 생성 ===')
  const n = await genStylingShots(svc)
  console.log(`[e2e] 스타일링샷 ${n}컷 생성`)

  console.log('\n=== STEP 3: photo_uploaded 전이 ===')
  await setStatus(svc, 'prompt_ready')
  await setStatus(svc, 'photo_uploaded')

  console.log('\n=== STEP 4: 초안 생성(runPipelineForProject) ===')
  const design = await runPipelineForProject(KOKODANG)
  console.log('[e2e] design:', JSON.stringify(design))
  process.exit(design.success ? 0 : 1)
}

main().catch((e) => { console.error('[e2e] 예외:', e); process.exit(1) })
