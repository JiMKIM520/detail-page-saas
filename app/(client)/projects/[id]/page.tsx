import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import type { ProjectStatus } from '@/lib/status-machine'
import { CLIENT_STATUS_LABELS, canRequestRevision } from '@/lib/status-machine'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ProtectedImage } from '@/components/client/ProtectedImage'
import { CommentSection } from '@/components/client/CommentSection'
import { RevisionGuide } from '@/components/client/RevisionGuide'
import { SubmittedIntake, type IntakeFileView } from '@/components/client/SubmittedIntake'

// 기업에게 노출되는 3구간 진행 단계
type ClientStage = 'preparing' | 'review' | 'delivered'

const STAGE_LABELS: Record<ClientStage, string> = {
  preparing: '제작 중',
  review:    '초안 확인 요청',
  delivered: '납품 완료',
}

const STAGE_DESCRIPTIONS: Record<ClientStage, string> = {
  preparing: '담당자가 상세페이지를 제작하고 있습니다.',
  review:    '초안이 완성되었습니다. 아래 내용을 확인하고 수정 의견을 남겨주세요.',
  delivered: '상세페이지가 완성되었습니다. 담당자가 이메일로 최종 파일을 발송했습니다.',
}

function statusIndex(status: ProjectStatus): number {
  const ORDER: ProjectStatus[] = [
    'intake_submitted', 'script_generating', 'script_review', 'script_approved',
    'design_planning', 'design_plan_review', 'prompt_ready',
    'photo_scheduled', 'photo_uploaded', 'design_generating',
    'design_review', 'design_approved', 'delivered',
  ]
  return ORDER.indexOf(status)
}

export default async function ClientProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const service = createServiceClient()

  const { data: project } = await service
    .from('projects')
    .select('*, platforms(name)')
    .eq('id', id)
    .single()

  if (!project || project.client_id !== user.id) {
    notFound()
  }

  const status = project.status as ProjectStatus

  // 디자인 행은 design_review 단계부터 로드 — preview_url로 '디자이너가 사업자에게 초안을 전달했는지' 판단
  let design: { id: string; preview_url: string | null; output_url: string | null; version: number | null } | null = null
  if (statusIndex(status) >= statusIndex('design_review')) {
    const { data } = await service
      .from('designs')
      .select('id, preview_url, output_url, version')
      .eq('project_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    design = data
  }

  // AI 1차 초안(design_review)은 디자이너 내부 검수용 — 사업자에겐 preview_url(전달본)이 있을 때만 노출
  const draftSent = !!design?.preview_url
  const clientStage: ClientStage =
    status === 'delivered' || status === 'design_approved'
      ? 'delivered'
      : status === 'design_review' && draftSent
        ? 'review'
        : 'preparing'
  const showDesign = draftSent || statusIndex(status) >= statusIndex('design_approved')

  // 수정 회차: design version 1 = 초안, 2 = 1차 수정본, 3 = 2차 수정본 (최대 2회)
  const revisionUsed = Math.min(Math.max((design?.version ?? 1) - 1, 0), 2)
  const reviewLabel = revisionUsed === 0 ? '초안 확인 요청' : `${revisionUsed}차 수정본 확인`
  // 수정요청 CTA 표시 여부: 기업이 초안을 보고 있고 수정 횟수가 남아 있을 때
  const projectRevisionCount = (project as unknown as { revision_count?: number | null }).revision_count ?? 0
  const canRevise = clientStage === 'review' && canRequestRevision({ revision_count: projectRevisionCount })

  // output_url JSON 파싱 (mobile_zip, pc_zip, designer_zip)
  let downloadUrls: { mobile_zip?: string; pc_zip?: string; designer_zip?: string } = {}
  if (design?.output_url) {
    try { downloadUrls = JSON.parse(design.output_url) } catch { /* not JSON, legacy URL */ }
  }
  const hasDownloads = statusIndex(status) >= statusIndex('design_approved') && Object.keys(downloadUrls).length > 0

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const platformName = (project.platforms as any)?.name ?? '-'

  // 사업자가 제출한 첨부파일 — 이미지엔 1시간 signed URL 부여 (intake-files 버킷 RLS 보호)
  const { data: intakeFiles } = await service
    .from('intake_files')
    .select('id, file_type, storage_path, file_name, mime_type')
    .eq('project_id', id)
    .order('created_at', { ascending: true })

  const submittedFiles: IntakeFileView[] = await Promise.all(
    (intakeFiles ?? []).map(async (f) => {
      const isImage = (f.mime_type ?? '').startsWith('image/')
      let url: string | null = null
      if (isImage) {
        const { data: signed } = await service.storage
          .from('intake-files')
          .createSignedUrl(f.storage_path, 60 * 60)
        url = signed?.signedUrl ?? null
      }
      return { id: f.id, file_type: f.file_type, file_name: f.file_name, isImage, url }
    })
  )

  return (
    <div className="space-y-8">
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 text-sm text-text-tertiary hover:text-text-secondary transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        프로젝트 목록
      </Link>

      {/* 프로젝트 헤더 */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-text-primary">{project.company_name}</h1>
            <p className="text-sm text-text-tertiary mt-1">
              {platformName} · {project.category}
            </p>
          </div>
          <StatusBadge status={status} clientFacing />
        </div>
      </div>

      {/* 진행 상황 — 기업에게는 3구간 요약만 노출 */}
      <div className="bg-surface rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-medium text-text-tertiary">진행 상황</p>
          {clientStage === 'review' && (
            <span className="text-xs font-medium text-primary-700 bg-primary-50 rounded-full px-2.5 py-0.5">
              수정 {revisionUsed}/2회 사용
            </span>
          )}
        </div>

        {/* 3단계 스텝 바 (라인 트랙 위에 원형 노드) */}
        <div className="relative pt-2 pb-8">
          {/* 배경 라인 */}
          <div className="absolute left-[16.66%] right-[16.66%] top-[22px] h-0.5 bg-gray-200" />
          {/* 진행 라인 */}
          <div
            className="absolute left-[16.66%] top-[22px] h-0.5 bg-primary-600 transition-all"
            style={{ width: clientStage === 'delivered' ? '66.66%' : clientStage === 'review' ? '33.33%' : '0%' }}
          />
          <div className="relative flex">
            {(['preparing', 'review', 'delivered'] as ClientStage[]).map((stage, i) => {
              const isCompleted = (
                (stage === 'preparing' && (clientStage === 'review' || clientStage === 'delivered')) ||
                (stage === 'review' && clientStage === 'delivered')
              )
              const isCurrent = stage === clientStage
              const label = stage === 'review' ? reviewLabel : STAGE_LABELS[stage]
              return (
                <div key={stage} className="flex flex-col items-center" style={{ width: '33.33%' }}>
                  <div className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    isCompleted ? 'bg-primary-600 text-white'
                    : isCurrent ? 'bg-primary-100 border-2 border-primary-600 text-primary-700'
                    : 'bg-gray-100 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    ) : (
                      <span>{i + 1}</span>
                    )}
                  </div>
                  <p className={`absolute top-9 whitespace-nowrap text-[11px] font-medium ${
                    isCurrent ? 'text-primary-700' : isCompleted ? 'text-text-secondary' : 'text-text-tertiary'
                  }`}>
                    {label}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* 현재 단계 설명 */}
        <p className="text-sm text-text-secondary leading-relaxed">
          {clientStage === 'review' && revisionUsed > 0
            ? `${revisionUsed}차 수정본이 완성되었습니다. 확인 후 의견을 남겨주세요.${revisionUsed >= 2 ? ' (수정 2회를 모두 사용하셨습니다.)' : ''}`
            : STAGE_DESCRIPTIONS[clientStage]}
          {clientStage === 'preparing' && (
            <span className="ml-1 text-text-tertiary text-xs">
              (현재: {CLIENT_STATUS_LABELS[status]})
            </span>
          )}
        </p>
      </div>

      {/* 내가 제출한 내용 — 제출 후에도 항상 확인 가능 */}
      <SubmittedIntake
        companyName={project.company_name}
        brandName={project.brand_name ?? null}
        category={project.category ?? null}
        platformName={platformName}
        productHighlights={project.product_highlights ?? null}
        productName={project.product_name ?? null}
        productDescription={project.product_description ?? null}
        sellingPoints={(project.selling_points as string[] | string | null) ?? null}
        designPreference={project.design_preference ?? null}
        targetAudience={(project.target_audience as string[] | string | null) ?? null}
        homepageUrl={project.homepage_url ?? null}
        detailPageUrl={project.detail_page_url ?? null}
        referenceNotes={project.reference_notes ?? null}
        files={submittedFiles}
        createdAt={project.created_at}
      />

      {/* 상세페이지 초안 */}
      {showDesign && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-text-primary">상세페이지 초안</h2>
          <RevisionGuide used={revisionUsed} />
          {design?.preview_url ? (
            <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-card">
              <ProtectedImage
                src={design.preview_url}
                alt="상세페이지 초안 미리보기"
                className="w-full"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-surface rounded-xl border border-border border-dashed">
              <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-violet-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                </svg>
              </div>
              <p className="text-text-tertiary text-sm">담당자가 제작 중입니다. 잠시만 기다려주세요.</p>
            </div>
          )}
        </div>
      )}

      {/* 다운로드 */}
      {hasDownloads && (
        <div className="bg-surface rounded-xl border border-border p-6">
          <h2 className="text-sm font-semibold text-text-secondary mb-4">결과물 다운로드</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {downloadUrls.mobile_zip && (
              <a href={downloadUrls.mobile_zip} download
                className="flex items-center gap-3 px-4 py-3 bg-primary-50 border border-primary-200 rounded-xl hover:bg-primary-100 transition-colors">
                <span className="text-xl">📱</span>
                <div>
                  <div className="text-sm font-semibold text-text-primary">모바일용</div>
                  <div className="text-xs text-text-tertiary">PNG + PDF (mobile.zip)</div>
                </div>
              </a>
            )}
            {downloadUrls.pc_zip && (
              <a href={downloadUrls.pc_zip} download
                className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors">
                <span className="text-xl">🖥</span>
                <div>
                  <div className="text-sm font-semibold text-text-primary">PC용</div>
                  <div className="text-xs text-text-tertiary">PNG + PDF (pc.zip)</div>
                </div>
              </a>
            )}
            {downloadUrls.designer_zip && (
              <a href={downloadUrls.designer_zip} download
                className="flex items-center gap-3 px-4 py-3 bg-violet-50 border border-violet-200 rounded-xl hover:bg-violet-100 transition-colors">
                <span className="text-xl">🎨</span>
                <div>
                  <div className="text-sm font-semibold text-text-primary">수정용</div>
                  <div className="text-xs text-text-tertiary">HTML + 폰트 (designer.zip)</div>
                </div>
              </a>
            )}
          </div>
        </div>
      )}

      {/* 코멘트 + 수정요청 CTA */}
      <CommentSection projectId={id} canRevise={canRevise} />
    </div>
  )
}
