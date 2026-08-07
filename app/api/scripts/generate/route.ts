import { createClient } from '@/lib/supabase/server'
import { enqueueJob } from '@/lib/enqueue'
import { NextResponse } from 'next/server'

/**
 * 스크립트 생성 시작 — 실행은 Railway 워커에 위임한다(lib/enqueue.ts 참고).
 * 상태 전이(intake_submitted→script_generating→script_review)는 generateScriptForProject가 스스로 한다.
 */
export async function POST(request: Request) {
  const userSupabase = await createClient()
  const { data: { user } } = await userSupabase.auth.getUser()
  if (!user || !['admin', 'designer'].includes(user.user_metadata?.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { project_id } = await request.json()
  if (!project_id || typeof project_id !== 'string') {
    return NextResponse.json({ success: false, error: 'project_id is required' }, { status: 400 })
  }

  const result = await enqueueJob(project_id, 'script')
  if (result.error) {
    return NextResponse.json({ success: false, error: `잡 등록 실패: ${result.error}` }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    queued: result.queued,
    message: result.alreadyRunning ? '이미 생성이 진행 중입니다' : undefined,
  })
}
