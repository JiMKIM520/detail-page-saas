import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { transitionStatus } from '@/lib/status-machine'
import { sendDeliveredEmail } from '@/lib/email/send'
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

  // 사업자에게 최종 납품 메일 (Resend; 키 없으면 dev stub / prod 실패 기록 — 납품 자체는 막지 않음)
  let emailed = false
  try {
    const { data: proj } = await supabase
      .from('projects')
      .select('company_name, client_id')
      .eq('id', project_id)
      .single()
    if (proj?.client_id && output_url) {
      const { data: u } = await supabase.auth.admin.getUserById(proj.client_id)
      const to = u?.user?.email
      if (to) {
        const r = await sendDeliveredEmail(to, proj.company_name ?? '상세페이지', output_url)
        emailed = r.sent
      }
    }
  } catch { /* 메일 실패는 납품을 막지 않음 */ }

  return NextResponse.json({ success: true, emailed })
}
