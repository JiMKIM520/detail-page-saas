import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'
import { assignDesigner } from '@/lib/actions/admin-actions'
import { NextResponse } from 'next/server'

/** 프로젝트 담당자 배정: designer_id 업데이트 (admin·designer 허용).
 *  기획자 역할은 디자이너로 통합됐다 — planner_id는 더 이상 쓰지 않는다(레거시 컬럼).
 *  규칙은 lib/actions/admin-actions.ts에 있다(통합 관리자와 공유). */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const userSupabase = await createClient()
  const { data: { user } } = await userSupabase.auth.getUser()
  const role = user?.user_metadata?.role as string | undefined
  if (!user || !['admin', 'designer'].includes(role ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = (await request.json()) as { designer_id?: string | null }
  if (!('designer_id' in body)) {
    return NextResponse.json({ error: '변경할 담당자 정보가 없습니다' }, { status: 400 })
  }

  const r = await assignDesigner(createServiceClient(), id, body.designer_id ?? null)
  if (!r.success) return NextResponse.json({ success: false, error: r.error }, { status: 500 })
  return NextResponse.json({ success: true })
}
