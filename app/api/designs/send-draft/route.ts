import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { transitionStatus } from '@/lib/status-machine'
import { sendDraftReadyEmail } from '@/lib/email/send'
import { NextResponse } from 'next/server'

export const maxDuration = 60

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://detail-page-saas.vercel.app'

/**
 * POST /api/designs/send-draft (multipart/form-data) — 디자이너가 Figma 리터치본을 사업자에게 전달.
 * 파일은 서버(서비스 클라이언트)로 업로드 → designs 버킷 RLS 우회. 클라이언트 직접 업로드는 정책 충돌로 불가.
 *   - designs/projects/{id}/client_draft/ 업로드 → designs.preview_url = 공개 URL (사업자 화면 노출 트리거)
 *   - 첫 전달이면 version 유지(초안), 재전달이면 version +1(N차 수정본)
 *   - 사업자에게 초안 확인 메일(Resend; 키 없으면 dev stub / prod 실패 기록)
 */
export async function POST(request: Request) {
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const role = user.user_metadata?.role as string | undefined
  if (!role || !['designer', 'admin'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const form = await request.formData()
  const project_id = form.get('project_id') as string | null
  const design_id = form.get('design_id') as string | null
  const notes = (form.get('notes') as string | null) ?? null
  const file = form.get('file') as File | null
  if (!project_id || !design_id || !file) {
    return NextResponse.json({ error: 'project_id, design_id, file 필요' }, { status: 400 })
  }

  const svc = createServiceClient()

  // 파일 업로드 (서비스 클라이언트 → RLS 우회)
  const ext = (file.name.split('.').pop() || 'png').toLowerCase()
  const path = `projects/${project_id}/client_draft/${Date.now()}.${ext}`
  const buf = Buffer.from(await file.arrayBuffer())
  const { error: upErr } = await svc.storage
    .from('designs')
    .upload(path, buf, { contentType: file.type || 'image/png', upsert: true })
  if (upErr) return NextResponse.json({ error: `업로드 실패: ${upErr.message}` }, { status: 500 })
  const { data: pub } = svc.storage.from('designs').getPublicUrl(path)
  const preview_url = pub.publicUrl

  // 재전달 여부 → 버전 증가
  const { data: cur } = await svc
    .from('designs')
    .select('preview_url, version')
    .eq('id', design_id)
    .single()
  const isResend = !!cur?.preview_url
  const newVersion = isResend ? (cur?.version ?? 1) + 1 : (cur?.version ?? 1)

  const { error: updErr } = await svc
    .from('designs')
    .update({ preview_url, version: newVersion, designer_status: 'sent_to_client', designer_notes: notes })
    .eq('id', design_id)
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 })

  // 사업자 노출 단계 유지(design_review)
  const { data: proj } = await svc
    .from('projects')
    .select('status, company_name, client_id')
    .eq('id', project_id)
    .single()
  if (proj && proj.status !== 'design_review') {
    try { await transitionStatus(svc, project_id, 'design_review', { note: '초안 사업자 전달' }) } catch { /* 비치명 */ }
  }

  // 사업자 메일
  let emailed = false
  let emailError: string | undefined
  if (proj?.client_id) {
    const { data: u } = await svc.auth.admin.getUserById(proj.client_id)
    const to = u?.user?.email
    if (to) {
      const r = await sendDraftReadyEmail(to, proj.company_name ?? '상세페이지', `${SITE_URL}/projects/${project_id}`)
      emailed = r.sent
      emailError = r.error
    } else {
      emailError = '사업자 이메일을 찾을 수 없음'
    }
  }

  return NextResponse.json({ success: true, version: newVersion, isResend, emailed, emailError })
}
