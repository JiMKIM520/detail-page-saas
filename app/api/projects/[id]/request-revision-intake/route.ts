import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { requestIntakeRevision } from '@/lib/actions/admin-actions'
import { NextResponse } from 'next/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://detail-page-saas.vercel.app'

/**
 * POST /api/projects/[id]/request-revision-intake — 의뢰서 보완 요청(관리자).
 * 규칙은 lib/actions/admin-actions.ts에 있다(통합 관리자와 공유).
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
  const r = await requestIntakeRevision(createServiceClient(), id, note, `${SITE_URL}/intake`)
  if (!r.success) {
    return NextResponse.json({ error: r.error }, { status: r.error === '프로젝트 없음' ? 404 : 500 })
  }
  return NextResponse.json({ success: true, ...r.data })
}
