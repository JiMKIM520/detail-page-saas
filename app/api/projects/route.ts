import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { generateScriptForProject } from '@/lib/ai/generate-script'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const bodySchema = z.object({
  company_name: z.string().min(1),
  platform_id: z.string().uuid(),
  category_id: z.string().uuid(),
  product_highlights: z.string().min(10),
  homepage_url: z.string().url().optional().or(z.literal('')),
  detail_page_url: z.string().url().optional().or(z.literal('')),
  reference_notes: z.string().optional(),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // 서버 측 입력 검증
  const raw = await request.json()
  const parsed = bodySchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? '입력값이 올바르지 않습니다.' }, { status: 400 })
  }
  const body = parsed.data

  // 원자적 사용 횟수 체크 + 증가 (레이스 컨디션 방지)
  const service = createServiceClient()
  const { data: usageOk, error: usageError } = await service.rpc('increment_usage', { uid: user.id })

  if (usageError || usageOk === false) {
    return NextResponse.json(
      { error: '사용 횟수를 초과했습니다. 관리자에게 문의하세요.' },
      { status: 403 }
    )
  }

  // category_id로 카테고리명 조회 (하위 호환: category 텍스트 컬럼도 채움)
  let categoryName: string | null = null
  if (body.category_id) {
    const { data: cat } = await service
      .from('categories')
      .select('name')
      .eq('id', body.category_id)
      .single()
    categoryName = cat?.name ?? null
  }

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
      category_id: body.category_id,
      category: categoryName,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // fire-and-forget async script generation
  generateScriptForProject(data.id)

  return NextResponse.json(data, { status: 201 })
}
