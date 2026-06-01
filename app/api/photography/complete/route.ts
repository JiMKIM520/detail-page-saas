import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'
import { transitionStatus } from '@/lib/status-machine'
import { generateDesignForProject } from '@/lib/ai/generate-design'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // 인증 + 권한 검증 (형제 라우트 patterns 동일) — 누구나 비싼 생성 트리거 가능하던 결함 수정
  const userSupabase = await createClient()
  const { data: { user } } = await userSupabase.auth.getUser()
  const role = user?.user_metadata?.role as string | undefined
  if (!user || !['admin', 'planner', 'designer'].includes(role ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { project_id } = await request.json()
  if (!project_id || typeof project_id !== 'string') {
    return NextResponse.json({ error: 'project_id is required' }, { status: 400 })
  }

  const supabase = createServiceClient()

  await transitionStatus(supabase, project_id, 'photo_uploaded', {
    note: '촬영 완료',
  })

  // NOTE: 초안 생성은 수 분이 걸려 Vercel 함수 한도(300s)를 초과할 수 있다.
  // fire-and-forget은 서버리스에서 응답 후 중단되므로, 프로덕션에서는 비동기 잡(큐/cron)으로
  // 분리해야 한다. 로컬/장수명 런타임에서는 그대로 완료된다.
  generateDesignForProject(project_id).catch(console.error)

  return NextResponse.json({ success: true })
}
