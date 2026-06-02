import { generateScriptForProject } from '@/lib/ai/generate-script'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const maxDuration = 60

export async function POST(request: Request) {
  const userSupabase = await createClient()
  const { data: { user } } = await userSupabase.auth.getUser()
  if (!user || !['admin', 'planner'].includes(user.user_metadata?.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { project_id } = await request.json()
  await generateScriptForProject(project_id)
  return NextResponse.json({ success: true })
}
