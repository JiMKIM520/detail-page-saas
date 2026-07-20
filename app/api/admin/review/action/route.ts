import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { transitionStatus, type ProjectStatus } from '@/lib/status-machine'
import { NextResponse } from 'next/server'
import type { ProjectTags } from '@/components/shared/kanban'

/**
 * POST /api/admin/review/action
 * Body: { project_id: string; action: 'approve' | 'reject' }
 *
 * approve → status 전이: 상태 머신 transitionStatus 준수
 *   draft_submitted  → design_review   (1차시안 → 기업 확인 전달)
 *   design_review    → design_approved (기업 확인 → 승인)
 *   revision_1/2     → designer_working (수정요청 → 디자이너 재작업)
 *   design_approved  → delivered        (승인 → 납품 완료)
 *
 * reject → revise 태그 부여 (상태 불변, 카드는 정렬 규칙에 의해 자동 최상단)
 *
 * Admin only.
 */

const APPROVE_TARGETS: Partial<Record<ProjectStatus, ProjectStatus>> = {
  draft_submitted: 'design_review',
  design_review:   'design_approved',
  revision_1:      'designer_working',
  revision_2:      'designer_working',
  design_approved: 'delivered',
}

export async function POST(request: Request) {
  const userSupabase = await createClient()
  const { data: { user } } = await userSupabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = (await request.json()) as {
    project_id?: string
    action?: 'approve' | 'reject'
  }

  if (!body.project_id || !body.action) {
    return NextResponse.json(
      { error: 'project_id와 action이 필요합니다' },
      { status: 400 },
    )
  }

  const svc = createServiceClient()

  const { data: project } = await svc
    .from('projects')
    .select('status, tags')
    .eq('id', body.project_id)
    .single()

  if (!project) {
    return NextResponse.json({ error: '프로젝트를 찾을 수 없습니다' }, { status: 404 })
  }

  const currentStatus = project.status as ProjectStatus

  // ── 만족: 상태 전이 ──────────────────────────────────────────────────────────
  if (body.action === 'approve') {
    const toStatus = APPROVE_TARGETS[currentStatus]
    if (!toStatus) {
      return NextResponse.json(
        { error: `상태 ${currentStatus}에서는 승인 전이를 지원하지 않습니다` },
        { status: 400 },
      )
    }

    try {
      await transitionStatus(svc, body.project_id, toStatus, {
        changedBy: user.id,
        note: `관리자 시안 보드 만족(승인) → ${toStatus}`,
      })
      return NextResponse.json({ success: true, toStatus })
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : '전이 실패' },
        { status: 422 },
      )
    }
  }

  // ── 불만족: revise 태그 부여 (상태 불변) ─────────────────────────────────────
  const currentTags: ProjectTags = (project.tags as ProjectTags | null) ?? {}
  const updatedTags: ProjectTags = { ...currentTags, revise: true }

  const { error } = await svc
    .from('projects')
    .update({ tags: updatedTags })
    .eq('id', body.project_id)

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, tags: updatedTags })
}
