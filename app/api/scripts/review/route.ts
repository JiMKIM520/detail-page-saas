import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'
import { transitionStatus } from '@/lib/status-machine'
import { generateScriptForProject } from '@/lib/ai/generate-script'
import { NextResponse } from 'next/server'

export const maxDuration = 60

export async function POST(request: Request) {
  const userSupabase = await createClient()
  const { data: { user } } = await userSupabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { project_id, script_id, action, notes } = await request.json()
  const supabase = createServiceClient()

  if (action === 'approve') {
    // 재승인 가드: 스크립트 승인은 script_review 상태에서만 가능.
    // 이미 진행된 프로젝트에서 호출하면 transitionStatus가 'Invalid transition'으로 throw해 500이 났음 → 409로 우아하게 처리.
    const { data: proj } = await supabase.from('projects').select('status').eq('id', project_id).single()
    if (!proj || proj.status !== 'script_review') {
      return NextResponse.json(
        { success: false, error: `승인 불가: 현재 상태(${proj?.status ?? 'unknown'})에서는 스크립트를 승인할 수 없습니다` },
        { status: 409 },
      )
    }
    // v6: 승인 → script_approved 까지만. 디자인 기획은 별도 단계('디자인 기획 시작' 버튼)에서 진행.
    // (v5의 촬영 리스트 자동 생성 + photo_scheduled 전이는 제거 — script_approved→design_planning 흐름과 충돌해 전이가 실패했음)
    await supabase.from('scripts').update({ planner_status: 'approved', planner_notes: notes })
      .eq('id', script_id)
    await transitionStatus(supabase, project_id, 'script_approved', { note: '기획자 승인' })
  } else if (action === 'regenerate') {
    await supabase.from('scripts').update({ planner_notes: notes }).eq('id', script_id)

    const { data: clientComments } = await supabase
      .from('comments')
      .select('content')
      .eq('project_id', project_id)
      .eq('role', 'client')
      .order('created_at', { ascending: false })
      .limit(3)

    const clientFeedback = clientComments?.map(c => c.content).join('\n---\n') || undefined
    // await 필수: fire-and-forget 시 Vercel 서버리스가 응답 후 함수를 종료해 재생성이 중단됨
    await generateScriptForProject(project_id, clientFeedback)
  } else if (action === 'edit') {
    // 기획자 직접 편집
    await supabase.from('scripts').update({
      content: notes.content,
      planner_notes: notes.memo || null,
      planner_status: 'edited',
    }).eq('id', script_id)
  }

  return NextResponse.json({ success: true })
}
