import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { transitionStatus } from '@/lib/status-machine'
import { sendDeliveredEmail } from '@/lib/email/send'
import { NextResponse } from 'next/server'

export const maxDuration = 60

/**
 * POST /api/designs/review (multipart/form-data) — 디자이너 최종 승인 + 납품.
 * 최종 파일은 서버(서비스 클라이언트)로 업로드 → designs 버킷 RLS 우회.
 *   - designs/projects/{id}/final/ 업로드 → designs.output_url
 *   - design_approved → delivered 전이 + 사업자에게 납품 메일(다운로드 링크)
 */
export async function POST(request: Request) {
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const role = user.user_metadata?.role as string | undefined
  if (!role || !['designer', 'admin', 'planner'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const form = await request.formData()
  const project_id = form.get('project_id') as string | null
  const design_id = form.get('design_id') as string | null
  const action = form.get('action') as string | null
  const notes = (form.get('notes') as string | null) ?? null
  const file = form.get('file') as File | null
  if (!project_id || !design_id) {
    return NextResponse.json({ error: 'project_id and design_id are required' }, { status: 400 })
  }
  if (action !== 'approve') {
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // 최종 파일 업로드 (서비스 클라이언트 → RLS 우회)
  let output_url: string | null = null
  if (file) {
    const ext = (file.name.split('.').pop() || 'zip').toLowerCase()
    const path = `projects/${project_id}/final/${Date.now()}.${ext}`
    const buf = Buffer.from(await file.arrayBuffer())
    const { error: upErr } = await supabase.storage
      .from('designs')
      .upload(path, buf, { contentType: file.type || 'application/octet-stream', upsert: true })
    if (upErr) return NextResponse.json({ error: `업로드 실패: ${upErr.message}` }, { status: 500 })
    const { data: pub } = supabase.storage.from('designs').getPublicUrl(path)
    output_url = pub.publicUrl
  }

  await supabase.from('designs').update({
    designer_status: 'approved',
    designer_notes: notes,
    ...(output_url ? { output_url } : {}),
  }).eq('id', design_id)

  await transitionStatus(supabase, project_id, 'design_approved', { note: '디자이너 승인' })
  await transitionStatus(supabase, project_id, 'delivered', { note: '납품 완료' })

  // 사업자에게 최종 납품 메일 (Resend; 미설정 시 dev stub / prod 실패 기록 — 납품은 막지 않음)
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
