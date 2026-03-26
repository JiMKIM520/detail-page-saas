import { createClient } from '@/lib/supabase/server'
import { generateScriptForProject } from '@/lib/ai/generate-script'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { data, error } = await supabase
    .from('projects')
    .insert({
      client_id: user.id,
      status: 'intake_submitted',
      company_name: body.company_name,
      homepage_url: body.homepage_url || null,
      detail_page_url: body.detail_page_url || null,
      product_highlights: body.product_highlights,
      reference_notes: body.reference_notes || null,
      platform_id: body.platform_id,
      category: body.category,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // fire-and-forget async script generation
  generateScriptForProject(data.id)

  return NextResponse.json(data, { status: 201 })
}
