import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { notifyIntakeRevision } from '@/lib/notify/dispatch'
import { NextResponse } from 'next/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://detail-page-saas.vercel.app'

/**
 * POST /api/projects/[id]/request-revision-intake — 의뢰서 보완 요청(관리자).
 *
 * 기획 프로세스 2단계(입력정보확인): 의뢰서가 불충분하면 관리자가 보완을 요청한다.
 * 상태머신 상태를 추가하지 않고 tags('보완')로 표기 — 칸반에서 최상단 점유 정렬에 사용.
 * 사업자에게 메일+문자 자동 발송(notifications 로그 기록).
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if ((user.user_metadata?.role as string | undefined) !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { note } = (await req.json().catch(() => ({}))) as { note?: string }

  const svc = createServiceClient()
  const { data: proj } = await svc
    .from('projects')
    .select('id, company_name, client_id, tags')
    .eq('id', id)
    .single()
  if (!proj) return NextResponse.json({ error: '프로젝트 없음' }, { status: 404 })

  // 'revise'(보완) 태그 부여 — 칸반 태그 체계(객체 형식, kanban.ts TAG_LABELS)와 정합.
  // 최상단 점유 정렬(sortKanbanCards)·뱃지 표시가 기존 체계로 자동 작동한다.
  const tags = (proj.tags && typeof proj.tags === 'object' && !Array.isArray(proj.tags)
    ? (proj.tags as Record<string, boolean>)
    : {}) as Record<string, boolean>
  if (!tags.revise) {
    const { error } = await svc.from('projects').update({ tags: { ...tags, revise: true } }).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // 사업자 알림 — 실패는 비치명(로그만). 수신처는 auth 유저의 email/phone.
  let emailed = false
  let texted = false
  if (proj.client_id) {
    try {
      const { data: u } = await svc.auth.admin.getUserById(proj.client_id)
      const email = u?.user?.email
      const phone = u?.user?.phone
      if (email || phone) {
        const outcome = await notifyIntakeRevision(
          svc,
          {
            projectId: id,
            projectName: proj.company_name ?? '상세페이지',
            email,
            phone,
            link: `${SITE_URL}/intake`,
          },
          note?.trim() || undefined,
        )
        emailed = outcome.emailed
        texted = outcome.texted
      }
    } catch (e) {
      console.warn('[request-revision-intake] 알림 발송 경고:', (e as Error).message?.slice(0, 120))
    }
  }

  return NextResponse.json({ success: true, emailed, texted })
}
