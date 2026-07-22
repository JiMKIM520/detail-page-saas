import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { transitionStatus, type ProjectStatus } from '@/lib/status-machine'
import { NextResponse } from 'next/server'

export const maxDuration = 30

/** 관리자 파이프라인 콘솔 전용 상태 정렬 — e2e 러너가 밟던 전이(script_review 되돌림·
 *  script_approved·prompt_ready·photo_uploaded)를 웹에서 재현한다.
 *  이미 지난 상태거나 동일 상태면 409 대신 { success: true, skipped: true }로 우아하게 통과. */
const ALLOWED_TARGETS: ProjectStatus[] = ['script_review', 'script_approved', 'prompt_ready', 'photo_uploaded']

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if ((user.user_metadata?.role as string | undefined) !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { project_id, to } = (await request.json()) as { project_id?: string; to?: ProjectStatus }
  if (!project_id || !to) return NextResponse.json({ error: 'project_id, to가 필요합니다' }, { status: 400 })
  if (!ALLOWED_TARGETS.includes(to)) {
    return NextResponse.json({ error: `허용되지 않은 대상 상태: ${to}` }, { status: 400 })
  }

  const svc = createServiceClient()
  const { data: proj } = await svc.from('projects').select('status').eq('id', project_id).single()
  if (!proj) return NextResponse.json({ error: '프로젝트 없음' }, { status: 404 })
  if (proj.status === to) return NextResponse.json({ success: true, skipped: true, status: to })

  // 아티팩트 사전조건 — 강제 정렬이 산출물 존재와 무관하게 상태만 앞세우던 구멍 차단(Codex 리뷰).
  // prompt_ready: 컷 프롬프트 산출물 필수 / photo_uploaded: 생성 컷이 프롬프트 수의 절반 이상
  // (부분 성공 배치가 조용히 전진해 빈 이미지 페이지로 이어지는 것 방지).
  if (to === 'prompt_ready' || to === 'photo_uploaded') {
    let shotCount = 0
    try {
      const { data: pj } = await svc.storage.from('designs').download(`projects/${project_id}/planning/styling-final-prompts.json`)
      if (pj) shotCount = (JSON.parse(await pj.text()).shots ?? []).length
    } catch { /* 없음 → 0 */ }
    if (shotCount === 0) {
      return NextResponse.json({ error: '전이 불가: 컷 프롬프트(styling-final-prompts.json)가 없습니다. 디자인 기획(③)을 먼저 완료하세요.' }, { status: 409 })
    }
    if (to === 'photo_uploaded') {
      const { data: files } = await svc.storage.from('designs').list(`projects/${project_id}/styling_real`)
      const generated = (files ?? []).filter((f) => f.name?.endsWith('.png')).length
      if (generated < Math.ceil(Math.min(shotCount, 28) / 2)) {
        return NextResponse.json({ error: `전이 불가: 생성 컷 ${generated}/${Math.min(shotCount, 28)}장 — 스타일링샷(④)을 마저 실행하세요.` }, { status: 409 })
      }
    }
  }

  try {
    await transitionStatus(svc, project_id, to, { note: `관리자 콘솔 상태 정렬 → ${to}` })
    return NextResponse.json({ success: true, status: to })
  } catch {
    // 상태 머신상 불가 전이(예: 이미 지난 단계) — 콘솔 정렬 목적이므로 직접 세팅으로 폴백.
    // 대상은 ALLOWED_TARGETS 화이트리스트로 제한돼 있어 임의 상태 점프는 불가.
    const { error } = await svc.from('projects').update({ status: to }).eq('id', project_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    await svc.from('project_logs').insert({
      project_id,
      from_status: proj.status,
      to_status: to,
      changed_by: null,
      note: `관리자 콘솔 상태 강제 정렬: ${proj.status} → ${to}`,
    })
    return NextResponse.json({ success: true, forced: true, status: to })
  }
}
