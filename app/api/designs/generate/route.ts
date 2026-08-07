import { createClient } from '@/lib/supabase/server'
import { enqueueJob } from '@/lib/enqueue'
import { NextResponse } from 'next/server'

/**
 * 초안 조립 시작 — 실행은 Railway 워커에 위임한다(lib/enqueue.ts 참고).
 * 조립은 실측 10~20분으로 Vercel 함수에서 완주할 수 없다.
 * 상태 전이는 runPipelineForProject가 처리한다(worker.ts kind='draft').
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = user.user_metadata?.role as string | undefined
  if (!role || !['admin', 'designer'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { project_id } = await request.json()
  if (!project_id || typeof project_id !== 'string') {
    return NextResponse.json({ success: false, error: 'project_id is required' }, { status: 400 })
  }

  const result = await enqueueJob(project_id, 'draft')
  if (result.error) {
    return NextResponse.json({ success: false, error: `잡 등록 실패: ${result.error}` }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    queued: result.queued,
    message: result.alreadyRunning ? '이미 조립이 진행 중입니다' : undefined,
  })
}
