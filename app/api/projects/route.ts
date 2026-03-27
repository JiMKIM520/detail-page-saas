import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { generateScriptForProject } from '@/lib/ai/generate-script'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // 사용 횟수 제한 체크
  const service = createServiceClient()
  const { data: profile } = await service
    .from('user_profiles')
    .select('usage_count, usage_limit')
    .eq('id', user.id)
    .single()

  if (profile && profile.usage_count >= profile.usage_limit) {
    return NextResponse.json(
      { error: '사용 횟수를 초과했습니다. 관리자에게 문의하세요.' },
      { status: 403 }
    )
  }

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

  // 사용 횟수 증가
  if (profile) {
    await service
      .from('user_profiles')
      .update({ usage_count: profile.usage_count + 1 })
      .eq('id', user.id)
  }

  // fire-and-forget async script generation
  generateScriptForProject(data.id)

  return NextResponse.json(data, { status: 201 })
}
