/**
 * 파이프라인 워커 — Railway(또는 임의 상주 환경)에서 실행.
 *
 * 왜: 기획(③) 5~7분·조립(⑤) 10~20분이 Vercel 함수 한도(800초)를 초과해 웹 실행이
 * 침묵 실패하던 실측 문제(2026-07-22 E2E). 웹 API는 jobs에 등록만 하고 즉시 응답,
 * 이 워커가 폴링해 시간 제한 없이 실행한다(진동벨 구조).
 *
 * 실행: npx tsx scripts/worker.ts  (env: SUPABASE_URL/SERVICE_ROLE, ANTHROPIC/GEMINI 키)
 * 종료: SIGTERM/SIGINT — 진행 중 잡을 마친 뒤 종료(그레이스풀).
 */
process.env.USE_BLOCKS_COMPOSER = process.env.USE_BLOCKS_COMPOSER ?? 'true'

import { createServiceClient } from '@/lib/supabase/service'
import { runPlanningForProject, runPipelineForProject } from '@/lib/pipeline-bridge'

const POLL_MS = 10_000
const STALE_RUNNING_MIN = 45 // 워커 크래시로 남은 running 잡 복구 기준

type Job = {
  id: string
  project_id: string
  kind: 'planning' | 'shots' | 'draft'
  status: string
}

let shuttingDown = false
process.on('SIGTERM', () => { shuttingDown = true; console.log('[worker] SIGTERM — 현재 잡 완료 후 종료') })
process.on('SIGINT', () => { shuttingDown = true; console.log('[worker] SIGINT — 현재 잡 완료 후 종료') })

const svc = createServiceClient()

/** 워커 시작 시: 크래시로 고아가 된 running 잡을 pending으로 복구 */
async function recoverStale(): Promise<void> {
  const cutoff = new Date(Date.now() - STALE_RUNNING_MIN * 60_000).toISOString()
  const { data } = await svc
    .from('jobs')
    .update({ status: 'pending', note: '워커 재시작 — 재대기' })
    .eq('status', 'running')
    .lt('started_at', cutoff)
    .select('id')
  if (data?.length) console.log(`[worker] stale running ${data.length}건 → pending 복구`)
}

/** pending 잡 하나를 원자적으로 집는다(status 조건부 update — 다중 워커에도 안전) */
async function claimNext(): Promise<Job | null> {
  const { data: candidates } = await svc
    .from('jobs')
    .select('id, project_id, kind, status')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(1)
  const job = candidates?.[0] as Job | undefined
  if (!job) return null
  const { data: claimed } = await svc
    .from('jobs')
    .update({ status: 'running', started_at: new Date().toISOString(), note: null })
    .eq('id', job.id)
    .eq('status', 'pending') // 다른 워커가 먼저 집었으면 0행
    .select('id, project_id, kind, status')
  return (claimed?.[0] as Job) ?? null
}

/** kind=shots — 컷 프롬프트 기준으로 미생성 컷만 이어 생성(멱등) */
async function runShots(projectId: string): Promise<string> {
  const { generateDesignImage } = await import('@/lib/ai/gemini-image')
  const { buildShotPrompt, ensureHeroFraming } = await import('@/agents/styling-shots')
  const { pickShotReferences } = await import('@/lib/photography/pick-refs')
  const { transitionStatus } = await import('@/lib/status-machine')

  const { data: pj } = await svc.storage.from('designs').download(`projects/${projectId}/planning/styling-final-prompts.json`)
  if (!pj) throw new Error('컷 프롬프트(styling-final-prompts.json) 없음 — 기획을 먼저 실행하세요')
  const json = JSON.parse(await pj.text())
  const shots = (json.shots ?? []).slice(0, 28)
  const rules = json.productPreservationRules ?? []
  const { data: ex } = await svc.storage.from('designs').list(`projects/${projectId}/styling_real`, { limit: 100 })
  const have = new Set((ex ?? []).map((f) => f.name))
  const todo = shots.filter((s: { filename?: string; name?: string }) => !have.has(s.filename || `${s.name}.png`))

  const { data: proj } = await svc.from('projects').select('category, status, platforms(slug)').eq('id', projectId).single()
  const { data: files } = await svc.from('intake_files').select('storage_path, file_name').eq('project_id', projectId).eq('file_type', 'product_photo').order('created_at')
  const nukki: string[] = []
  const names: string[] = []
  for (const f of files ?? []) {
    const { data } = await svc.storage.from('intake-files').download(f.storage_path)
    if (data) { nukki.push(Buffer.from(await data.arrayBuffer()).toString('base64')); names.push(String((f as { file_name?: string }).file_name ?? '')) }
  }
  const meta = { category: (proj as { category?: string } | null)?.category ?? 'food', platform: 'smartstore', aspectRatio: '3:4' }

  let ok = 0, fail = 0
  for (const shot of todo) {
    try {
      const fp: string = shot.finalPrompt && /\[OUTPUT SPECS\]/.test(shot.finalPrompt) ? shot.finalPrompt : buildShotPrompt(shot, rules, meta as never)
      const refIdx = pickShotReferences(String(shot.name ?? '') + ' ' + String(shot.filename ?? ''), names)
      const refs = shot.withProduct === false ? [] : refIdx.map((i: number) => nukki[i]).filter(Boolean)
      const buf = await generateDesignImage({ prompt: ensureHeroFraming(fp, shot), referenceImages: refs, aspectRatio: shot.frameRatio ?? '3:4', model: shot.prominence === 'support' ? 'nb2' : 'pro' })
      const path = `projects/${projectId}/styling_real/${shot.filename || `${shot.name}.png`}`
      const { error } = await svc.storage.from('designs').upload(path, buf, { contentType: 'image/png', upsert: true })
      if (error) throw new Error(error.message)
      ok++
    } catch (e) {
      fail++
      console.warn(`[worker/shots] ✗ ${shot.filename}:`, String(e).slice(0, 100))
    }
  }
  // 절반 이상 확보 시 상태 전진(콘솔 advance와 동일 기준)
  const { data: after } = await svc.storage.from('designs').list(`projects/${projectId}/styling_real`, { limit: 100 })
  const generated = (after ?? []).filter((f) => f.name?.endsWith('.png')).length
  if (generated >= Math.ceil(Math.min(shots.length, 28) / 2)) {
    const cur = (proj as { status?: string } | null)?.status
    try {
      if (cur === 'design_plan_review') await transitionStatus(svc, projectId, 'prompt_ready', { note: '워커 샷 생성' })
      const { data: p2 } = await svc.from('projects').select('status').eq('id', projectId).single()
      if (p2?.status === 'prompt_ready') await transitionStatus(svc, projectId, 'photo_uploaded', { note: '워커 샷 생성 완료' })
    } catch { /* 전이 실패 비치명 */ }
  }
  return `신규 ${ok}건 생성(실패 ${fail}) · 누적 ${generated}/${shots.length}`
}

async function runJob(job: Job): Promise<string> {
  if (job.kind === 'planning') {
    // 기획은 script_approved에서 출발해야 함 — 재실행/정렬 케이스 보정.
    // 허용 목록 방식은 design_review 등 후속 상태 재기획을 놓쳐 "Invalid transition" 실패
    // (2026-07-23 동원 실측). 콘솔 ③은 ①②가 끝난 뒤에만 호출되므로 무조건 정렬이 견고.
    const { data: p } = await svc.from('projects').select('status').eq('id', job.project_id).single()
    if (p && String(p.status) !== 'script_approved') {
      await svc.from('projects').update({ status: 'script_approved' }).eq('id', job.project_id)
    }
    const r = await runPlanningForProject(job.project_id)
    if (!(r as { success?: boolean }).success) throw new Error(String((r as { error?: string }).error ?? '기획 실패'))
    return '기획 완료(청사진·컷 프롬프트 생성)'
  }
  if (job.kind === 'shots') return runShots(job.project_id)
  if (job.kind === 'draft') {
    const { data: p } = await svc.from('projects').select('status').eq('id', job.project_id).single()
    if (p && String(p.status) === 'design_generating') {
      await svc.from('projects').update({ status: 'photo_uploaded' }).eq('id', job.project_id)
    }
    const r = await runPipelineForProject(job.project_id)
    if (!(r as { success?: boolean }).success) throw new Error(String((r as { error?: string }).error ?? '조립 실패'))
    return '초안 조립 완료(design_review)'
  }
  throw new Error(`알 수 없는 kind: ${job.kind}`)
}

async function main(): Promise<void> {
  console.log('[worker] 시작 — 폴링', POLL_MS / 1000, '초 간격')
  await recoverStale()
  for (;;) {
    if (shuttingDown) { console.log('[worker] 종료'); process.exit(0) }
    let job: Job | null = null
    try {
      job = await claimNext()
    } catch (e) {
      console.warn('[worker] 폴링 오류:', String(e).slice(0, 120))
    }
    if (!job) {
      await new Promise((r) => setTimeout(r, POLL_MS))
      continue
    }
    console.log(`[worker] 잡 시작 — ${job.kind} · project ${job.project_id.slice(0, 8)}`)
    try {
      const note = await runJob(job)
      await svc.from('jobs').update({ status: 'done', finished_at: new Date().toISOString(), note }).eq('id', job.id)
      console.log(`[worker] 잡 완료 — ${job.kind}: ${note}`)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      await svc.from('jobs').update({ status: 'failed', finished_at: new Date().toISOString(), error: msg.slice(0, 500) }).eq('id', job.id)
      console.error(`[worker] 잡 실패 — ${job.kind}:`, msg.slice(0, 200))
    }
  }
}

main().catch((e) => { console.error('[worker] 치명 오류:', e); process.exit(1) })
