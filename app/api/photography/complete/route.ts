import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'
import { transitionStatus } from '@/lib/status-machine'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // 인증 + 권한 검증
  const userSupabase = await createClient()
  const { data: { user } } = await userSupabase.auth.getUser()
  const role = user?.user_metadata?.role as string | undefined
  if (!user || !['admin', 'designer'].includes(role ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { project_id } = await request.json()
  if (!project_id || typeof project_id !== 'string') {
    return NextResponse.json({ error: 'project_id is required' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // 촬영(스타일링샷) 완료 → photo_uploaded. 초안 생성은 디자이너가 초안 화면에서 명시적으로 트리거
  // (/api/designs/generate, await+maxDuration 300). fire-and-forget은 Vercel에서 중단되므로 분리함.
  await transitionStatus(supabase, project_id, 'photo_uploaded', { note: '촬영 완료' })

  return NextResponse.json({ success: true })
}
