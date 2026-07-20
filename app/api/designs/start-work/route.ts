import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { transitionStatus } from '@/lib/status-machine'
import { NextResponse } from 'next/server'

/** 디자이너 작업 시작 — design_generating·revision_1·revision_2 → designer_working */
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const role = user?.user_metadata?.role as string | undefined
  if (!user || !['admin', 'designer'].includes(role ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { project_id } = (await request.json()) as { project_id?: string }
  if (!project_id) return NextResponse.json({ error: 'project_id 필요' }, { status: 400 })

  const svc = createServiceClient()
  const { data: project } = await svc
    .from('projects')
    .select('status, designer_id')
    .eq('id', project_id)
    .single()

  if (!project) return NextResponse.json({ error: '프로젝트 없음' }, { status: 404 })

  // 디자이너는 본인 배정 프로젝트만
  if (role === 'designer' && project.designer_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    await transitionStatus(svc, project_id, 'designer_working', {
      changedBy: user.id,
      note: '디자이너 작업 시작',
    })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }
}
