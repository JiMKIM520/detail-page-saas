import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { NextResponse } from 'next/server'
import { z } from 'zod'

/**
 * POST /api/projects/[id]/revise — 기업의 의뢰서 보완 제출.
 *
 * 사무국이 [의뢰서 보완 요청]을 보낸 건(tags.revise)만 수정할 수 있다.
 * 신규 제출과 달리 사용 횟수를 소모하지 않는다 — 같은 의뢰를 고치는 것이지 새 의뢰가 아니다.
 * 제출되면 tags.revise를 내리고 revise_done을 세워 사무국이 "보완 완료"를 알아볼 수 있게 한다.
 */

const bodySchema = z.object({
  company_name: z.string().min(1),
  product_highlights: z.string().min(10),
  contact_name: z.string().optional().nullable(),
  contact_phone: z.string().optional().nullable(),
  contact_email: z.string().email().or(z.literal('')).nullish(),
  product_name: z.string().min(1),
  product_description: z.string().min(1),
  selling_points: z.array(z.string().min(1)).min(3),
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
  category_id: z.string().uuid().optional(),
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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = bodySchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? '입력값이 올바르지 않습니다.' },
      { status: 400 },
    )
  }
  const body = parsed.data

  const service = createServiceClient()
  const { data: project } = await service
    .from('projects')
    .select('id, client_id, tags')
    .eq('id', id)
    .single()

  if (!project) return NextResponse.json({ error: '프로젝트를 찾을 수 없습니다.' }, { status: 404 })
  if (project.client_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const tags = (project.tags && typeof project.tags === 'object' && !Array.isArray(project.tags)
    ? (project.tags as Record<string, boolean | number>)
    : {}) as Record<string, boolean | number>

  if (!tags.revise) {
    return NextResponse.json(
      { error: '보완 요청된 의뢰서가 아닙니다. 사무국에 문의해 주세요.' },
      { status: 409 },
    )
  }

  const { files, ...fields } = body

  const { error: updateError } = await service
    .from('projects')
    .update({
      ...fields,
      // 보완 완료 표시 — 사무국 화면에서 "보완 완료"로 잡힌다. 차수(revise_round)는 유지한다.
      tags: { ...tags, revise: false, revise_done: true },
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // 새로 올린 파일만 추가한다 — 기존 첨부는 사무국이 이미 받아 본 자료라 지우지 않는다.
  if (files && files.length > 0) {
    const rows = files.map((f) => ({
      project_id: id,
      file_type: f.file_type,
      storage_path: f.storage_path,
      file_name: f.file_name,
      mime_type: f.mime_type ?? null,
      file_size: f.file_size ?? null,
    }))
    const { error: fileError } = await service.from('intake_files').insert(rows)
    if (fileError) {
      console.error(`[revise] intake_files 저장 실패 (project ${id}): ${fileError.message}`)
    }
  }

  return NextResponse.json({ ok: true })
}
