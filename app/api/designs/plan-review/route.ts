import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'
import { transitionStatus } from '@/lib/status-machine'
import { NextResponse } from 'next/server'

/** 디자인 기획 검수 승인: design_plan_review → prompt_ready (스타일링샷 제작 단계) */
export async function POST(request: Request) {
  const userSupabase = await createClient()
  const { data: { user } } = await userSupabase.auth.getUser()
  const role = user?.user_metadata?.role as string | undefined
  if (!user || !['admin', 'planner'].includes(role ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { project_id } = (await request.json()) as { project_id?: string }
  if (!project_id) {
    return NextResponse.json({ error: 'project_id is required' }, { status: 400 })
  }

  const supabase = createServiceClient()
  try {
    await transitionStatus(supabase, project_id, 'prompt_ready', {
      note: '디자인 기획 승인 — 스타일링샷 프롬프트 준비',
    })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    )
  }
}
