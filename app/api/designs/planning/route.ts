import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { transitionStatus } from '@/lib/status-machine'
import { NextResponse } from 'next/server'

/**
 * 디자인 기획 시작 — 실행은 Railway 워커에 위임한다.
 *
 * 이전에는 이 라우트가 runPlanningForProject를 직접 await 했다. 기획 실측이 273~358초라
 * Vercel 함수 상한(800초)에 이론상 들어가지만, 실제로는 산출물 3종을 다 만들고도
 * 마지막 상태 전이 직전에 함수가 끊겨 프로젝트가 design_planning에 갇혔다(2026-08-07 실측).
 * 워커는 Railway 상시 프로세스라 시간 제한이 없고, 이미 kind='planning' 잡을 처리한다.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = user.user_metadata?.role as string | undefined
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { project_id } = await request.json()
  if (!project_id || typeof project_id !== 'string') {
    return NextResponse.json({ success: false, error: 'project_id is required' }, { status: 400 })
  }

  const svc = createServiceClient()

  const { data: project } = await svc
    .from('projects').select('status').eq('id', project_id).single()
  if (!project) {
    return NextResponse.json({ success: false, error: '프로젝트를 찾을 수 없습니다' }, { status: 404 })
  }

  // 이미 대기·실행 중인 기획 잡이 있으면 중복 투입하지 않는다(버튼 연타 방지)
  const { data: running } = await svc
    .from('jobs').select('id')
    .eq('project_id', project_id).eq('kind', 'planning')
    .in('status', ['pending', 'running']).limit(1)
  if (running && running.length > 0) {
    return NextResponse.json({ success: true, queued: false, message: '이미 기획이 진행 중입니다' })
  }

  const { error: jobError } = await svc
    .from('jobs').insert({ project_id, kind: 'planning', status: 'pending' })
  if (jobError) {
    return NextResponse.json({ success: false, error: `잡 등록 실패: ${jobError.message}` }, { status: 500 })
  }

  // 화면이 즉시 '생성 중'을 보여주도록 선반영. 워커는 어떤 상태든 script_approved로 정렬한 뒤
  // 실행하므로(worker.ts) 여기서 앞서 전이해도 파이프라인에 영향이 없다.
  if (project.status === 'script_approved') {
    await transitionStatus(svc, project_id, 'design_planning', { note: '기획 잡 등록' })
  }

  return NextResponse.json({ success: true, queued: true })
}
