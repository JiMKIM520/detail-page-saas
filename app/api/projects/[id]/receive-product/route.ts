import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { NextResponse } from 'next/server'

/**
 * POST /api/projects/[id]/receive-product — 제품 수령 확인 체크(관리자).
 *
 * 기획 프로세스 2단계: 제품 도착 + 의뢰서 만족 시점부터 작업 D-14 카운팅이 시작된다.
 * product_received_at을 찍는 것이 카운팅의 기준점. intake_approved_at이 비어 있으면
 * 함께 지금으로 설정한다(의뢰서 승인 겸용 단순화 — 별도 승인 UI가 생기면 분리).
 */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if ((user.user_metadata?.role as string | undefined) !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const svc = createServiceClient()
  const { data: proj } = await svc
    .from('projects')
    .select('id, product_received_at, intake_approved_at')
    .eq('id', id)
    .single()
  if (!proj) return NextResponse.json({ error: '프로젝트 없음' }, { status: 404 })
  if (proj.product_received_at) {
    return NextResponse.json({ error: '이미 수령 처리됨' }, { status: 400 })
  }

  const now = new Date()
  const patch: Record<string, string> = { product_received_at: now.toISOString() }
  if (!proj.intake_approved_at) patch.intake_approved_at = now.toISOString()
  // 작업 기한 = 수령 시점 + 14일(기획 프로세스 D-14 규칙) — 칸반 D-day 표시(dDayLabel)가
  // due_date를 기준으로 이미 동작하므로, 여기서 due_date를 설정하면 전 화면에 자동 반영된다.
  patch.due_date = new Date(now.getTime() + 14 * 86_400_000).toISOString().slice(0, 10)
  const { error } = await svc.from('projects').update(patch).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, product_received_at: patch.product_received_at, due_date: patch.due_date })
}
