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
