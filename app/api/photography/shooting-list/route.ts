import { createServiceClient } from '@/lib/supabase/service'
import { transitionStatus } from '@/lib/status-machine'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createServiceClient()
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
  } | undefined

  if (!shootingReqs?.nukki_shots || !shootingReqs?.styling_shots) {
    return NextResponse.json({ error: 'Missing shooting requirements in script' }, { status: 400 })
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

  const { error: insertError } = await supabase.from('photos').insert(photoItems)
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  await transitionStatus(supabase, project_id, 'photo_scheduled', {
    note: '촬영 리스트 생성',
  })

  return NextResponse.json({ success: true })
}
