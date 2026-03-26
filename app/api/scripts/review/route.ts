import { createServiceClient } from '@/lib/supabase/service'
import { transitionStatus } from '@/lib/status-machine'
import { generateScriptForProject } from '@/lib/ai/generate-script'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { project_id, script_id, action, notes } = await request.json()
  const supabase = createServiceClient()

  if (action === 'approve') {
    await supabase.from('scripts').update({ planner_status: 'approved', planner_notes: notes })
      .eq('id', script_id)
    await transitionStatus(supabase, project_id, 'script_approved', { note: '기획자 승인' })
    // shooting list will be created in Task 8
  } else if (action === 'regenerate') {
    await supabase.from('scripts').update({ planner_notes: notes }).eq('id', script_id)
    generateScriptForProject(project_id) // fire-and-forget, uses service role internally
  }

  return NextResponse.json({ success: true })
}
