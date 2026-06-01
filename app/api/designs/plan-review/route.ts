import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'
import { downloadFromStorage } from '@/lib/storage'
import { transitionStatus } from '@/lib/status-machine'
import { NextResponse } from 'next/server'

/** prompt_ready 진입 시 styling-final-prompts.json의 shots 기준으로 업로드 슬롯(photos rows) 생성.
 *  슬롯이 없으면 /photography에서 디자이너가 스타일링샷을 업로드할 대상이 없다 (watchdog #1). */
async function ensureStylingUploadSlots(
  supabase: ReturnType<typeof createServiceClient>,
  projectId: string,
): Promise<number> {
  const { data: existing } = await supabase
    .from('photos').select('id').eq('project_id', projectId).eq('photo_type', 'styling')
  if (existing && existing.length > 0) return existing.length

  let shots: Array<{ name?: string; filename?: string }> = []
  try {
    const buf = await downloadFromStorage(`projects/${projectId}/planning/styling-final-prompts.json`)
    const parsed = JSON.parse(buf.toString('utf8')) as { shots?: Array<{ name?: string; filename?: string }> }
    shots = parsed.shots ?? []
  } catch {
    return 0 // 프롬프트 산출물 없으면 슬롯 생성 스킵 (업로드 UI에서 추가 가능하도록 추후 개선)
  }
  if (shots.length === 0) return 0

  const rows = shots.map((sh) => ({
    project_id: projectId,
    photo_type: 'styling',
    storage_path: '',
    shooting_list_item: sh.name ?? sh.filename ?? '스타일링샷',
  }))
  const { error } = await supabase.from('photos').insert(rows)
  if (error) {
    console.warn('[plan-review] 스타일링샷 슬롯 생성 실패:', error.message)
    return 0
  }
  return rows.length
}

/** 디자인 기획 검수 승인: design_plan_review → prompt_ready (스타일링샷 제작 단계) */
export async function POST(request: Request) {
  const userSupabase = await createClient()
  const { data: { user } } = await userSupabase.auth.getUser()
  const role = user?.user_metadata?.role as string | undefined
  if (!user || !['admin', 'planner'].includes(role ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { project_id } = (await request.json()) as { project_id?: string }
  if (!project_id) {
    return NextResponse.json({ error: 'project_id is required' }, { status: 400 })
  }

  const supabase = createServiceClient()
  try {
    await transitionStatus(supabase, project_id, 'prompt_ready', {
      note: '디자인 기획 승인 — 스타일링샷 프롬프트 준비',
    })
    const slots = await ensureStylingUploadSlots(supabase, project_id)
    return NextResponse.json({ success: true, stylingSlots: slots })
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    )
  }
}
