import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'
import { transitionStatus } from '@/lib/status-machine'
import { generateScriptForProject } from '@/lib/ai/generate-script'
import { NextResponse } from 'next/server'

export const maxDuration = 60

export async function POST(request: Request) {
  const userSupabase = await createClient()
  const { data: { user } } = await userSupabase.auth.getUser()
  if (!user || !['planner', 'designer', 'admin'].includes(user.user_metadata?.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { project_id, script_id, action, notes } = await request.json()
  const supabase = createServiceClient()

  if (action === 'approve') {
    await supabase.from('scripts').update({ planner_status: 'approved', planner_notes: notes })
      .eq('id', script_id)
    await transitionStatus(supabase, project_id, 'script_approved', { note: '기획자 승인' })

    // 촬영 리스트 자동 생성
    const { data: script } = await supabase
      .from('scripts').select('content')
      .eq('id', script_id).single()

    if (script) {
      const content = script.content as any
      const reqs = content.shooting_requirements
      if (reqs?.nukki_shots && reqs?.styling_shots) {
        const photoItems = [
          ...reqs.nukki_shots.map((shot: string) => ({
            project_id, photo_type: 'nukki', shooting_list_item: shot, storage_path: '',
          })),
          ...reqs.styling_shots.map((shot: string) => ({
            project_id, photo_type: 'styling', shooting_list_item: shot, storage_path: '',
          })),
        ]
        await supabase.from('photos').insert(photoItems)
        await transitionStatus(supabase, project_id, 'photo_scheduled', { note: '촬영 리스트 자동 생성' })
      }
    }
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
    generateScriptForProject(project_id, clientFeedback)
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
