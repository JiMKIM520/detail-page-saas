import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { canRequestRevision, transitionStatus, type ProjectStatus } from '@/lib/status-machine'
import { NextResponse } from 'next/server'

/**
 * 기업 수정요청 제출
 * - revision_count 검사: 최대 2회
 * - 성공 시: status → revision_1 or revision_2, tags.revision_n = true, 코멘트 저장
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { project_id, content } = (await request.json()) as {
    project_id?: string
    content?: string
  }
  if (!project_id) return NextResponse.json({ error: 'project_id 필요' }, { status: 400 })

  const service = createServiceClient()
  const { data: project } = await service
    .from('projects')
    .select('id, client_id, status, revision_count, tags')
    .eq('id', project_id)
    .single()

  if (!project) return NextResponse.json({ error: '프로젝트 없음' }, { status: 404 })

  // 클라이언트 본인 프로젝트만
  if (project.client_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // 수정 횟수 검사
  const revisionCount = project.revision_count as number | null
  if (!canRequestRevision({ revision_count: revisionCount ?? 0 })) {
    return NextResponse.json(
      {
        error: '수정 요청은 최대 2회까지 가능합니다. 이미 2회를 모두 사용하셨습니다.',
        limitReached: true,
      },
      { status: 422 }
    )
  }

  const newCount = (revisionCount ?? 0) + 1
  const toStatus: ProjectStatus = newCount === 1 ? 'revision_1' : 'revision_2'

  // 기존 태그 유지 + revision_n 추가
  const existingTags = (project.tags as Record<string, boolean> | null) ?? {}
  const updatedTags = { ...existingTags, revision_n: true }

  try {
    await transitionStatus(service, project_id, toStatus, {
      changedBy: user.id,
      note: `기업 수정요청 ${newCount}차`,
    })

    // 카운트 증가 실패를 삼키면 canRequestRevision이 계속 true — 3회째 요청이 통과된다
    const { error: updateErr } = await service
      .from('projects')
      .update({ revision_count: newCount, tags: updatedTags })
      .eq('id', project_id)
    if (updateErr) {
      return NextResponse.json(
        { error: `수정요청 기록 실패: ${updateErr.message}` },
        { status: 500 },
      )
    }

    // 코멘트 저장
    if (content?.trim()) {
      await service.from('comments').insert({
        project_id,
        user_id: user.id,
        content: `[${newCount}차 수정요청] ${content.trim()}`,
        role: 'client',
      })
    }

    return NextResponse.json({ success: true, status: toStatus, revisionCount: newCount })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }
}
