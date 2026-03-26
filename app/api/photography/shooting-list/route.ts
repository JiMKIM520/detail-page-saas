import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { project_id } = await request.json()

  // 최신 승인된 스크립트에서 촬영 요구사항 추출
  const { data: script } = await supabase
    .from('scripts')
    .select('content')
    .eq('project_id', project_id)
    .eq('planner_status', 'approved')
    .single()

  if (!script) {
    return NextResponse.json({ error: 'No approved script' }, { status: 404 })
  }

  const content = script.content as Record<string, unknown>
  const shootingReqs = content.shooting_requirements as {
    nukki_shots: string[]
    styling_shots: string[]
  }

  // 촬영 항목을 photos 테이블에 초기 레코드로 생성
  const photoItems = [
    ...shootingReqs.nukki_shots.map((shot: string) => ({
      project_id,
      photo_type: 'nukki',
      shooting_list_item: shot,
      storage_path: '',
    })),
    ...shootingReqs.styling_shots.map((shot: string) => ({
      project_id,
      photo_type: 'styling',
      shooting_list_item: shot,
      storage_path: '',
    })),
  ]

  await supabase.from('photos').insert(photoItems)
  await supabase
    .from('projects')
    .update({ status: 'photo_scheduled' })
    .eq('id', project_id)

  return NextResponse.json({ success: true })
}
