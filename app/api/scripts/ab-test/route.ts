import { createClient } from '@/lib/supabase/server'
import { generateAbVariant } from '@/lib/ai/generate-script'
import { NextResponse } from 'next/server'

export const maxDuration = 60

export async function POST(request: Request) {
  const userSupabase = await createClient()
  const { data: { user } } = await userSupabase.auth.getUser()
  if (!user || !['planner', 'designer', 'admin'].includes(user.user_metadata?.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { project_id, script_id } = await request.json()
  if (!project_id || !script_id) {
    return NextResponse.json({ error: 'project_id and script_id required' }, { status: 400 })
  }

  generateAbVariant(project_id, script_id) // fire-and-forget
  return NextResponse.json({ success: true })
}
