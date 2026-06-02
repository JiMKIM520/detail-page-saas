import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { transitionStatus } from '@/lib/status-machine'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // 인증 + 디자이너/관리자 권한 검증
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = user.user_metadata?.role as string | undefined
  if (!role || !['designer', 'admin'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { project_id, design_id, action, notes, output_url } = await request.json()
  if (!project_id || !design_id) {
    return NextResponse.json({ error: 'project_id and design_id are required' }, { status: 400 })
  }

  const supabase = createServiceClient()

  if (action !== 'approve') {
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  }

  await supabase.from('designs').update({
    designer_status: 'approved',
    designer_notes: notes,
    output_url,
  }).eq('id', design_id)

  await transitionStatus(supabase, project_id, 'design_approved', { note: '디자이너 승인' })
  await transitionStatus(supabase, project_id, 'delivered', { note: '납품 완료' })

  return NextResponse.json({ success: true })
}
