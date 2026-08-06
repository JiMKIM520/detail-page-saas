import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { IntakeForm } from '@/components/intake/IntakeForm'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

/**
 * 의뢰서 보완 화면 — 사무국이 보완을 요청한 건만 열린다.
 * 제출본을 그대로 불러와 고치는 방식이라 사용 횟수를 소모하지 않는다.
 */
export default async function RevisePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const service = createServiceClient()
  const { data: project } = await service
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (!project || project.client_id !== user.id) notFound()

  const tags = (project.tags && typeof project.tags === 'object' && !Array.isArray(project.tags)
    ? (project.tags as Record<string, boolean | number>)
    : {}) as Record<string, boolean | number>

  // 보완 요청이 없는 건은 수정 대상이 아니다 — 진행 화면으로 되돌린다
  if (!tags.revise) redirect(`/projects/${id}`)

  const [{ data: platforms }, { data: categories }] = await Promise.all([
    supabase.from('platforms').select('id, name, slug'),
    supabase.from('categories').select('id, name, slug'),
  ])

  // 사무국이 남긴 보완 사유 (최근 것부터)
  const { data: notices } = await service
    .from('comments')
    .select('id, content, created_at')
    .eq('project_id', id)
    .eq('role', 'revision_notice')
    .order('created_at', { ascending: false })
    .limit(5)

  // 이미 낸 제품 사진이 있으면 보완 때 다시 올리라고 요구하지 않는다
  const { count: productPhotoCount } = await service
    .from('intake_files')
    .select('id', { count: 'exact', head: true })
    .eq('project_id', id)
    .eq('file_type', 'product_photo')

  const toArray = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
      : typeof v === 'string' && v.trim() ? v.split(/[\n,]/).map(s => s.trim()).filter(Boolean)
        : []

  const round = typeof tags.revise_round === 'number' ? tags.revise_round : 1

  return (
    <div>
      <div className="mb-8">
        <Link href={`/projects/${id}`} className="inline-flex items-center gap-1 text-sm text-text-tertiary hover:text-text-secondary mb-4">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          진행 상황으로
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">의뢰서 보완하기</h1>
        <p className="text-sm text-text-tertiary mt-1">
          {round}차 보완 요청입니다. 아래 요청 사항을 반영해 수정한 뒤 다시 제출해 주세요.
          이 제출은 <span className="font-medium">추가 제작 횟수를 사용하지 않습니다.</span>
        </p>
      </div>

      {notices && notices.length > 0 && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-semibold text-amber-900 mb-2">사무국 보완 요청 사항</p>
          <ul className="space-y-2">
            {notices.map(n => (
              <li key={n.id} className="text-sm text-amber-800">
                <p className="whitespace-pre-wrap">{n.content}</p>
                <p className="text-xs text-amber-700/70 mt-0.5">
                  {new Date(n.created_at).toLocaleString('ko-KR')}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-card">
        <IntakeForm
          platforms={platforms ?? []}
          categories={categories ?? []}
          revise={{
            projectId: id,
            hasProductPhoto: (productPhotoCount ?? 0) > 0,
            initial: {
              company_name: project.company_name ?? '',
              brand_name: project.brand_name ?? '',
              product_highlights: project.product_highlights ?? '',
              contact_name: project.contact_name ?? '',
              contact_phone: project.contact_phone ?? '',
              contact_email: project.contact_email ?? '',
              product_name: project.product_name ?? '',
              product_description: project.product_description ?? '',
              category_id: project.category_id ?? '',
              homepage_url: project.homepage_url ?? '',
              detail_page_url: project.detail_page_url ?? '',
              reference_notes: project.reference_notes ?? '',
              full_ingredients: project.full_ingredients ?? '',
              shipping_info: project.shipping_info ?? '',
              return_policy: project.return_policy ?? '',
              cs_info: project.cs_info ?? '',
              sellingPoints: toArray(project.selling_points),
              targetAudience: toArray(project.target_audience),
              designStyles: toArray(project.design_preference),
              hasBrand: !!project.brand_name,
            },
          }}
        />
      </div>
    </div>
  )
}
