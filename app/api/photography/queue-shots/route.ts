import { createClient } from '@/lib/supabase/server'
import { enqueueJob } from '@/lib/enqueue'
import { NextResponse } from 'next/server'

/**
 * 스타일링샷 전체 생성을 워커에 위임한다.
 *
 * generate-shots(POST)는 from/count로 2~3컷씩 쪼개 부르는 배치 전용이다. 관리자 콘솔은
 * 그렇게 쓰지만 기획자 화면 버튼은 파라미터 없이 불러 28컷을 한 번에 돌렸고,
 * maxDuration 300초를 넘겨 무응답으로 끝났다(2026-08-07 로모노소프 실측).
 * 워커의 kind='shots'는 이미 생성된 컷을 건너뛰는 멱등 처리라 재실행도 안전하다.
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
    return NextResponse.json({ error: 'project_id 누락' }, { status: 400 })
  }

  const result = await enqueueJob(project_id, 'shots')
  if (result.error) {
    return NextResponse.json({ error: `잡 등록 실패: ${result.error}` }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    queued: result.queued,
    message: result.alreadyRunning ? '이미 생성이 진행 중입니다' : '생성을 시작했습니다',
  })
}
