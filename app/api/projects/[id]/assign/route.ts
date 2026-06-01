import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/** 프로젝트 담당자 배정: planner_id / designer_id 업데이트 (admin·planner 허용) */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const userSupabase = await createClient()
  const { data: { user } } = await userSupabase.auth.getUser()
  const role = user?.user_metadata?.role as string | undefined
  if (!user || !['admin', 'planner'].includes(role ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = (await request.json()) as { planner_id?: string | null; designer_id?: string | null }
  const update: Record<string, string | null> = {}
  if ('planner_id' in body) update.planner_id = body.planner_id || null
  if ('designer_id' in body) update.designer_id = body.designer_id || null
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: '변경할 담당자 정보가 없습니다' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { error } = await supabase.from('projects').update(update).eq('id', id)
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
