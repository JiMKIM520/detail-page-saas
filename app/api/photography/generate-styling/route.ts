import { createClient } from '@/lib/supabase/server'
import { generateStylingShots } from '@/lib/ai/generate-styling'
import { NextResponse } from 'next/server'

export const maxDuration = 60

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !['planner', 'designer', 'admin'].includes(user.user_metadata?.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { project_id } = await request.json()
  if (!project_id) {
    return NextResponse.json({ error: 'project_id is required' }, { status: 400 })
  }

  try {
    const result = await generateStylingShots(project_id)
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
