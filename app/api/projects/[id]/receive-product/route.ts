import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { receiveProduct } from '@/lib/actions/admin-actions'
import { NextResponse } from 'next/server'

/**
 * POST /api/projects/[id]/receive-product — 제품 수령 확인(관리자).
 * 규칙은 lib/actions/admin-actions.ts에 있다(통합 관리자와 공유).
 */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if ((user.user_metadata?.role as string | undefined) !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const r = await receiveProduct(createServiceClient(), id)
  if (!r.success) {
    const status = r.error === '프로젝트 없음' ? 404 : r.error === '이미 수령 처리됨' ? 400 : 500
    return NextResponse.json({ error: r.error }, { status })
  }
  return NextResponse.json({ success: true, ...r.data })
}
