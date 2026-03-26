import { createServiceClient } from '@/lib/supabase/service'
import { transitionStatus } from '@/lib/status-machine'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { project_id, design_id, action, notes, output_url } = await request.json()
  const supabase = createServiceClient()

  if (action === 'approve') {
    await supabase.from('designs').update({
      designer_status: 'approved',
      designer_notes: notes,
      output_url,
    }).eq('id', design_id)

    await transitionStatus(supabase, project_id, 'design_approved', { note: '디자이너 승인' })
    await transitionStatus(supabase, project_id, 'delivered', { note: '납품 완료' })
  }

  return NextResponse.json({ success: true })
}
