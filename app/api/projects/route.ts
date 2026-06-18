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
  product_name: z.string().min(1),
  product_description: z.string().min(1),
  selling_points: z.array(z.string().min(1)).min(3),
  homepage_url: z.string().url().optional().or(z.literal('')),
  detail_page_url: z.string().url().optional().or(z.literal('')),
  reference_notes: z.string().optional(),
  brand_name: z.string().optional().nullable(),
  target_audience: z.array(z.string()).optional().nullable(),
  design_preference: z.string().optional().nullable(),
  // 클라이언트가 먼저 스토리지에 업로드한 첨부파일의 메타데이터(있으면 프로젝트에 연결)
  files: z
    .array(
      z.object({
        file_type: z.string().min(1),
        storage_path: z.string().min(1),
        file_name: z.string().min(1),
        mime_type: z.string().optional(),
        file_size: z.number().optional(),
      }),
    )
    .optional(),
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
      product_name: body.product_name,
      product_description: body.product_description,
      selling_points: body.selling_points,
      reference_notes: body.reference_notes || null,
      platform_id: body.platform_id,
      category_id: body.category_id,
      category: categoryName,
      brand_name: body.brand_name || null,
      target_audience: body.target_audience || null,
      design_preference: body.design_preference || null,
    })
    .select()
    .single()

  if (error) {
    // 보상: 프로젝트 생성 실패 시 위에서 증가시킨 사용 횟수를 롤백(quota 소모 방지)
    await service.rpc('decrement_usage', { uid: user.id })
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // 첨부파일 메타데이터 연결 (파일은 클라이언트가 이미 스토리지에 업로드함)
  // 메타 저장 실패는 비치명: 프로젝트/사용량은 유효하고 파일은 스토리지에 존재(추후 복구 가능).
  if (body.files && body.files.length > 0) {
    const rows = body.files.map((f) => ({
      project_id: data.id,
      file_type: f.file_type,
      storage_path: f.storage_path,
      file_name: f.file_name,
      mime_type: f.mime_type ?? null,
      file_size: f.file_size ?? null,
    }))
    const { error: fErr } = await service.from('intake_files').insert(rows)
    if (fErr) console.error(`[projects] intake_files 저장 실패 (project ${data.id}): ${fErr.message}`)
  }

  // fire-and-forget async script generation
  generateScriptForProject(data.id)

  return NextResponse.json(data, { status: 201 })
}
