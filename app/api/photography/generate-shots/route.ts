import { createClient } from '@/lib/supabase/server'
import { pickShotReferences } from '@/lib/photography/pick-refs'
import { createServiceClient } from '@/lib/supabase/service'
import { generateDesignImage } from '@/lib/ai/gemini-image'
import { buildShotPrompt } from '@/agents/styling-shots'
import { transitionStatus } from '@/lib/status-machine'
import { NextResponse } from 'next/server'

export const maxDuration = 300

/**
 * 스타일링샷을 AI(Gemini)로 직접 생성 — "프롬프트만 출력 후 외부 업로드"가 아니라 API 생성 방식.
 * styling-final-prompts.json 의 프롬프트 + 제품 누끼컷(intake_files)을 참조로 상위 3컷 생성 → styling_real/ 업로드.
 */
export async function POST(request: Request) {
  // 인증·역할 가드
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const role = user.user_metadata?.role as string | undefined
  if (!role || !['admin', 'designer'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { project_id } = await request.json()
  if (!project_id) return NextResponse.json({ error: 'project_id 누락' }, { status: 400 })

  const svc = createServiceClient()

  // 1) 스타일링 프롬프트 로드
  let shots: any[] = []
  let rules: string[] = []
  try {
    const { data } = await svc.storage.from('designs').download(`projects/${project_id}/planning/styling-final-prompts.json`)
    if (data) {
      const json = JSON.parse(await data.text())
      shots = json.shots ?? []
      rules = json.productPreservationRules ?? []
    }
  } catch { /* 없으면 아래에서 400 */ }
  if (shots.length === 0) {
    return NextResponse.json({ error: '스타일링 프롬프트(styling-final-prompts.json)가 없습니다. 먼저 디자인 기획을 완료하세요.' }, { status: 400 })
  }

  // 2) 제품 누끼컷(레퍼런스) 로드
  const { data: files } = await svc.from('intake_files').select('storage_path, file_name').eq('project_id', project_id).eq('file_type', 'product_photo').order('created_at')
  const nukki: string[] = []
  const photoNames: string[] = []
  for (const f of files ?? []) {
    try {
      const { data } = await svc.storage.from('intake-files').download(f.storage_path)
      if (data) { nukki.push(Buffer.from(await data.arrayBuffer()).toString('base64')); photoNames.push(String((f as { file_name?: string }).file_name ?? '')) }
    } catch { /* skip */ }
  }

  // 3) 최대 8컷 생성 + 업로드 (블록이 12~18개라 이미지가 많아야 텍스트만 남는 섹션이 안 생김 — 전 제품 품질 바닥)
  const { data: project } = await svc.from('projects').select('category, platforms(slug)').eq('id', project_id).single()
  const meta = { category: (project as any)?.category ?? 'food', platform: (project as any)?.platforms?.slug ?? 'smartstore', brandColorHex: '#A8682E', aspectRatio: '3:4' }
  const out: { name: string; url: string }[] = []
  const errors: string[] = []
  for (const shot of shots.slice(0, 12)) {
    try {
      const fp: string = shot.finalPrompt && /\[OUTPUT SPECS\]/.test(shot.finalPrompt)
        ? shot.finalPrompt
        : buildShotPrompt(shot, rules, meta as any)
      // withProduct=false(원료·소재컷)는 레퍼런스 없이 순수 생성 (Sprint 5)
      // 니즈 매칭 레퍼런스 (Sprint 9-C) — 샷 텍스트·파일명 토큰 겹침 우선, 동점 최신순
      const refIdx = pickShotReferences(String((shot as any).name ?? '') + ' ' + String((shot as any).filename ?? ''), photoNames)
      const refs = (shot as any).withProduct === false ? [] : refIdx.map((i) => nukki[i]).filter(Boolean)
      const buf = await generateDesignImage({ prompt: fp, referenceImages: refs, aspectRatio: '3:4', model: 'pro' })
      const path = `projects/${project_id}/styling_real/${shot.filename || (shot.name + '.png')}`
      const { error } = await svc.storage.from('designs').upload(path, buf, { contentType: 'image/png', upsert: true })
      if (error) throw new Error(error.message)
      const { data: pub } = svc.storage.from('designs').getPublicUrl(path)
      out.push({ name: shot.name ?? shot.filename, url: pub.publicUrl })
    } catch (e) {
      errors.push(`${shot.name}: ${(e as Error).message?.slice(0, 120)}`)
    }
  }

  if (out.length === 0) {
    return NextResponse.json({ error: '생성 실패', detail: errors }, { status: 500 })
  }

  // 재생성 성공 시 이전 기획의 컷 정리 — 파일명이 기획마다 달라 방치하면 구 컷이 새 컷과 섞여 초안에 들어간다
  try {
    const valid = new Set(shots.slice(0, 12).map((s) => s.filename || (s.name + '.png')))
    const { data: existing } = await svc.storage.from('designs').list(`projects/${project_id}/styling_real`)
    const stale = (existing ?? []).filter((f) => f.name && !valid.has(f.name)).map((f) => `projects/${project_id}/styling_real/${f.name}`)
    if (stale.length) {
      await svc.storage.from('designs').remove(stale)
      console.log(`[generate-shots] 구 스타일링샷 ${stale.length}장 정리`)
    }
  } catch (e) { console.warn('[generate-shots] 구 컷 정리 경고:', (e as Error).message) }

  // 스타일링샷이 생성되면 다음 단계(초안 제작)로 전진. prompt_ready에서만 전이(재생성 시 중복 전이 방지).
  const { data: cur } = await svc.from('projects').select('status').eq('id', project_id).single()
  if (cur?.status === 'prompt_ready') {
    try { await transitionStatus(svc, project_id, 'photo_uploaded', { note: '스타일링샷 생성 완료' }) }
    catch (e) { console.warn('[generate-shots] photo_uploaded 전이 경고:', (e as Error).message) }
  }

  return NextResponse.json({ success: true, shots: out, errors, advanced: cur?.status === 'prompt_ready' })
}
