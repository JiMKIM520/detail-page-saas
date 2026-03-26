import { createServiceClient } from '@/lib/supabase/service'
import { transitionStatus } from '@/lib/status-machine'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { project_id } = await request.json()
  const supabase = createServiceClient()

  await transitionStatus(supabase, project_id, 'photo_uploaded', {
    note: '촬영 완료',
  })

  // NOTE: generateDesignForProject will be added in Task 9 — do NOT import it yet

  return NextResponse.json({ success: true })
}
