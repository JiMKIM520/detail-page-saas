import { createServiceClient } from '@/lib/supabase/service'
import { transitionStatus } from '@/lib/status-machine'
import { generateDesignForProject } from '@/lib/ai/generate-design'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { project_id } = await request.json()
  const supabase = createServiceClient()

  await transitionStatus(supabase, project_id, 'photo_uploaded', {
    note: '촬영 완료',
  })

  generateDesignForProject(project_id) // fire-and-forget

  return NextResponse.json({ success: true })
}
