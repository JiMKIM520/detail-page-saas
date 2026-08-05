import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { NextResponse } from 'next/server'
import { z } from 'zod'

// 첨부파일 다건 저장까지 마쳐야 하므로 여유를 둔다
export const maxDuration = 300

const bodySchema = z.object({
  company_name: z.string().min(1),
  platform_id: z.string().uuid(),
  category_id: z.string().uuid(),
  product_highlights: z.string().min(10),
  // 진행 안내 수신처 — 기존 의뢰서에는 없던 값이라 optional로 둔다(구버전 클라이언트 호환)
  contact_name: z.string().optional().nullable(),
  contact_phone: z.string().optional().nullable(),
  contact_email: z.string().email().or(z.literal('')).nullish(),
  product_name: z.string().min(1),
  product_description: z.string().min(1),
  selling_points: z.array(z.string().min(1)).min(3),
  // 빈 입력은 클라이언트가 null로 보냄 → null/''/undefined 모두 허용(nullish)
  homepage_url: z.string().url().or(z.literal('')).nullish(),
  detail_page_url: z.string().url().or(z.literal('')).nullish(),
  reference_notes: z.string().nullish(),
  brand_name: z.string().optional().nullable(),
  full_ingredients: z.string().nullish(),
  shipping_info: z.string().nullish(),
  return_policy: z.string().nullish(),
  cs_info: z.string().nullish(),
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
      contact_name: body.contact_name || null,
      contact_phone: body.contact_phone || null,
      contact_email: body.contact_email || null,
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
      full_ingredients: body.full_ingredients,
      shipping_info: body.shipping_info,
      return_policy: body.return_policy,
      cs_info: body.cs_info,
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

  // 스크립트는 자동 생성하지 않는다 — 제출 후 의뢰서 수정이 있을 수 있어 사무국이
  // 관리자 화면에서 내용을 확인한 뒤 [스크립트 생성]으로 직접 시작한다(2026-08-05 요청 5번).
  return NextResponse.json(data, { status: 201 })
}
