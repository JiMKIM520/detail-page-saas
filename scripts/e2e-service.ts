/**
 * 실서비스 파이프라인 E2E (범용) — 인앱 버튼이 호출하는 바로 그 함수들로 전 과정 구동.
 *   사용: tsx --env-file=.env.local scripts/e2e-service.ts <회사명 부분일치> [--from-pipeline]
 *   흐름: script_approved → runPlanningForProject → 스타일링샷 8컷(styling_real/)
 *         → runPipelineForProject(USE_BLOCKS_COMPOSER) → 산출물 회수
 *   --from-pipeline: 기획·스타일링샷 산출물이 이미 있을 때 초안 단계부터 재개(서비스 재시도와 동일 동작)
 *   주의: art-director sectionImageBriefs(장식 텍스처, 제품 없음)는 블록 콘텐츠 풀에 넣지 않는다.
 *         성분/사용 이미지는 스타일링샷 8컷 커버리지 규칙(INGREDIENT·USAGE 필수)이 담당.
 */
import fs from 'node:fs'
import { pickShotReferences } from '@/lib/photography/pick-refs'
import path from 'node:path'
import { createServiceClient } from '@/lib/supabase/service'
import { runPlanningForProject, runPipelineForProject } from '@/lib/pipeline-bridge'
import { generateDesignImage } from '@/lib/ai/gemini-image'
import { buildShotPrompt } from '@/agents/styling-shots'

const ARG = process.argv[2]
const FROM_PIPELINE = process.argv.includes('--from-pipeline')
if (!ARG) { console.error('사용: e2e-service.ts <회사명> [--from-pipeline]'); process.exit(1) }
const OUT_BASE = '/private/tmp/claude-501/-Users-jinman-Desktop-Projects/c6fe271b-61a6-44b4-8ca3-5fe55a4882cd/scratchpad/service-e2e'

type Svc = ReturnType<typeof createServiceClient>

async function dlJson(svc: Svc, p: string): Promise<any | null> {
  const { data } = await svc.storage.from('designs').download(p)
  return data ? JSON.parse(await data.text()) : null
}

async function genStylingShots(svc: Svc, pid: string): Promise<number> {
  const json = await dlJson(svc, `projects/${pid}/planning/styling-final-prompts.json`)
  if (!json) { console.warn('[e2e] styling-final-prompts.json 없음'); return 0 }
  const shots: any[] = json.shots ?? []
  const rules: string[] = json.productPreservationRules ?? []
  const { data: files } = await svc.from('intake_files').select('storage_path, file_name').eq('project_id', pid).eq('file_type', 'product_photo').order('created_at')
  const nukki: string[] = []
  const photoNames: string[] = []
  for (const f of files ?? []) {
    const { data: blob } = await svc.storage.from('intake-files').download(f.storage_path)
    if (blob) { nukki.push(Buffer.from(await blob.arrayBuffer()).toString('base64')); photoNames.push(String((f as { file_name?: string }).file_name ?? '')) }
  }
  const { data: project } = await svc.from('projects').select('category, platforms(slug)').eq('id', pid).single()
  const meta = { category: (project as any)?.category ?? 'food', platform: (project as any)?.platforms?.slug ?? 'smartstore', aspectRatio: '3:4' }
  let ok = 0
  for (const shot of shots.slice(0, 18)) {
    try {
      const fp: string = shot.finalPrompt && /\[OUTPUT SPECS\]/.test(shot.finalPrompt) ? shot.finalPrompt : buildShotPrompt(shot, rules, meta as any)
      console.log(`[e2e] 스타일링샷 생성: ${shot.name ?? shot.filename}…`)
      // withProduct=false(원료·소재컷)는 레퍼런스 없이 순수 생성 — 라벨 재현 위험 0 (Sprint 5)
      // 니즈 매칭 레퍼런스 (Sprint 9-C) — 샷 텍스트·파일명 토큰 겹침 우선, 동점 최신순
      const refIdx = pickShotReferences(String((shot as any).name ?? '') + ' ' + String((shot as any).filename ?? ''), photoNames)
      const refs = (shot as any).withProduct === false ? [] : refIdx.map((i) => nukki[i]).filter(Boolean)
      const buf = await generateDesignImage({ prompt: fp, referenceImages: refs, aspectRatio: '3:4', model: (shot as any).prominence === 'support' ? 'nb2' : 'pro' })
      const p = `projects/${pid}/styling_real/${shot.filename || shot.name + '.png'}`
      const { error } = await svc.storage.from('designs').upload(p, buf, { contentType: 'image/png', upsert: true })
      if (error) throw new Error(error.message)
      ok++
    } catch (e) { console.warn(`[e2e]   ✗ ${shot.name}: ${(e as Error).message?.slice(0, 140)}`) }
  }
  // 재생성 성공 시 이전 기획의 컷 정리 (서비스 generate-shots 라우트와 동일 동작)
  if (ok > 0) {
    const valid = new Set(shots.slice(0, 18).map((s: any) => s.filename || (s.name + '.png')))
    const { data: existing } = await svc.storage.from('designs').list(`projects/${pid}/styling_real`)
    const stale = (existing ?? []).filter((f) => f.name && !valid.has(f.name)).map((f) => `projects/${pid}/styling_real/${f.name}`)
    if (stale.length) {
      await svc.storage.from('designs').remove(stale)
      console.log(`[e2e] 구 스타일링샷 ${stale.length}장 정리`)
    }
  }
  return ok
}

async function fetchOutputs(svc: Svc, pid: string, slug: string): Promise<void> {
  const dest = path.join(OUT_BASE, 'results'); fs.mkdirSync(dest, { recursive: true })
  for (const rel of ['4_final/index.html']) {
    const { data } = await svc.storage.from('designs').download(`projects/${pid}/${rel}`)
    if (data) fs.writeFileSync(path.join(dest, `${slug}.html`), Buffer.from(await data.arrayBuffer()))
  }
  // PNG(모바일) 탐색
  const { data: mob } = await svc.storage.from('designs').list(`projects/${pid}/4_final/mobile`)
  const png = (mob ?? []).find((f) => f.name.endsWith('.png'))
  if (png) {
    const { data } = await svc.storage.from('designs').download(`projects/${pid}/4_final/mobile/${png.name}`)
    if (data) fs.writeFileSync(path.join(dest, `${slug}.png`), Buffer.from(await data.arrayBuffer()))
  }
  console.log(`[e2e] 산출물 회수 → ${dest}/${slug}.*`)
}

async function main() {
  process.env.USE_BLOCKS_COMPOSER = 'true'
  const svc = createServiceClient()
  const { data: projs, error: projErr } = await svc.from('projects').select('id, company_name').order('created_at')
  if (projErr) { console.error(`프로젝트 조회 실패(네트워크/DB): ${projErr.message}`); process.exit(1) }
  const p = (projs ?? []).find((x) => String(x.company_name).replace(/\s+/g, '').includes(ARG.replace(/\s+/g, '')))
  if (!p) { console.error(`프로젝트 못 찾음: ${ARG} (조회 ${projs?.length ?? 0}건)`); process.exit(1) }
  const pid = p.id as string
  const slug = String(p.company_name).replace(/[^가-힣a-zA-Z0-9]/g, '').slice(0, 12)
  console.log(`\n══════ 실서비스 E2E: ${p.company_name} (${pid.slice(0, 8)})${FROM_PIPELINE ? ' [초안 단계부터 재개]' : ''} ══════`)

  if (!FROM_PIPELINE) {
    await svc.from('projects').update({ status: 'script_approved' }).eq('id', pid)

    console.log('\n=== STEP 1: 디자인 기획(runPlanningForProject) ===')
    const plan = await runPlanningForProject(pid)
    if (!plan.success) { console.error('기획 실패 — 중단:', JSON.stringify(plan)); process.exit(1) }

    console.log('\n=== STEP 2: 스타일링샷 생성(최대 8컷 → styling_real/) ===')
    const n1 = await genStylingShots(svc, pid)
    console.log(`[e2e] 스타일링샷 ${n1}컷`)
  }

  console.log('\n=== STEP 3: photo_uploaded 전이 ===')
  await svc.from('projects').update({ status: 'prompt_ready' }).eq('id', pid)
  await svc.from('projects').update({ status: 'photo_uploaded' }).eq('id', pid)

  console.log('\n=== STEP 4: 초안 생성(runPipelineForProject / USE_BLOCKS_COMPOSER) ===')
  const design = await runPipelineForProject(pid)
  console.log('[e2e] design:', JSON.stringify(design))

  console.log('\n=== STEP 5: 산출물 회수 ===')
  await fetchOutputs(svc, pid, slug)

  // ── STEP 6: 시각 감사 — 파이프라인 내장 감사(render-audit)와 동일 모듈 재사용.
  // 파이프라인이 이미 폐루프(반려 재조립 1회)를 돌므로 여기서는 최종 상태 리포트만.
  const htmlPath = path.join(OUT_BASE, 'results', `${slug}.html`)
  if (design.success && fs.existsSync(htmlPath)) {
    console.log('\n=== STEP 6: 시각 감사(최종 확인) ===')
    try {
      const { auditRenderedHtml } = await import('@/lib/render-audit')
      const audit = await auditRenderedHtml(fs.readFileSync(htmlPath, 'utf8'))
      if (!audit.ran) console.warn(`[e2e] 시각 감사 미실행: ${audit.reason}`)
      else if (!audit.pass)
        console.error(`[e2e] ⚠⚠ 시각 감사 결함 — 납품 전 확인 필요:\n${audit.issues.map((x) => '  - ' + x).join('\n')}`)
    } catch (e) {
      console.warn('[e2e] 시각 감사 스킵:', (e as Error).message?.slice(0, 120))
    }
  }

  process.exit(design.success ? 0 : 1)
}

main().catch((e) => { console.error('[e2e] 예외:', e); process.exit(1) })
