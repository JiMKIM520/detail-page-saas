import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { transitionStatus } from '@/lib/status-machine'
import { sendDraftReadyEmail } from '@/lib/email/send'
import { NextResponse } from 'next/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://detail-page-saas.vercel.app'

/**
 * POST /api/designs/send-draft — 디자이너가 Figma에서 리터치한 초안 이미지를 사업자에게 전달.
 *   - designs.preview_url = 전달 이미지(사업자 화면이 이 값으로 초안 노출)
 *   - 첫 전달이면 version 유지(초안), 재전달이면 version +1(N차 수정본)
 *   - 사업자에게 초안 확인 메일 발송(Resend; 키 없으면 dev는 stub, prod는 실패 기록)
 *
 * 사업자는 preview_url이 있을 때만 초안을 본다 → AI 1차 초안(미전달)은 사업자에게 노출되지 않음.
 */
export async function POST(request: Request) {
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const role = user.user_metadata?.role as string | undefined
  if (!role || !['designer', 'admin'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { project_id, design_id, preview_url, notes } = await request.json()
  if (!project_id || !design_id || !preview_url) {
    return NextResponse.json({ error: 'project_id, design_id, preview_url 필요' }, { status: 400 })
  }

  const svc = createServiceClient()

  // 현재 design 행 — 재전달 여부 판단(버전 증가)
  const { data: cur } = await svc
    .from('designs')
    .select('preview_url, version')
    .eq('id', design_id)
    .single()
  const isResend = !!cur?.preview_url
  const newVersion = isResend ? (cur?.version ?? 1) + 1 : (cur?.version ?? 1)

  const { error: upErr } = await svc
    .from('designs')
    .update({ preview_url, version: newVersion, designer_status: 'sent_to_client', designer_notes: notes ?? null })
    .eq('id', design_id)
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })

  // 사업자에게 노출되는 단계 유지(design_review). 다른 상태면 design_review로 정렬.
  const { data: proj } = await svc
    .from('projects')
    .select('status, company_name, client_id')
    .eq('id', project_id)
    .single()
  if (proj && proj.status !== 'design_review') {
    try { await transitionStatus(svc, project_id, 'design_review', { note: '초안 사업자 전달' }) } catch { /* 비치명 */ }
  }

  // 사업자 이메일 조회 + 발송
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
