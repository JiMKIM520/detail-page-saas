import { createClient } from '@/lib/supabase/server'
import { runPlanningForProject } from '@/lib/pipeline-bridge'
import { NextResponse } from 'next/server'

export const maxDuration = 300

export async function POST(request: Request) {
  // 인증 + 관리자 권한 검증 (generate route 패턴 동일)
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

  const result = await runPlanningForProject(project_id)

  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
