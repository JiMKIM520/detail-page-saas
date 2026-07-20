import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { NextResponse } from 'next/server'
import type { ProjectTags } from '@/components/shared/kanban'

/**
 * PATCH /api/admin/tags
 * Body: { project_id: string; tags: Partial<ProjectTags> }
 *
 * Merges supplied tags into projects.tags — does NOT replace unrelated keys.
 * Admin only.
 */
export async function PATCH(request: Request) {
  const userSupabase = await createClient()
  const { data: { user } } = await userSupabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = (await request.json()) as {
    project_id?: string
    tags?: Partial<ProjectTags>
  }

  if (!body.project_id || !body.tags) {
    return NextResponse.json(
      { error: 'project_id와 tags가 필요합니다' },
      { status: 400 },
    )
  }

  const svc = createServiceClient()

  const { data: project } = await svc
    .from('projects')
    .select('tags')
    .eq('id', body.project_id)
    .single()

  if (!project) {
    return NextResponse.json({ error: '프로젝트를 찾을 수 없습니다' }, { status: 404 })
  }

  // Merge: keep existing tag keys, overlay new values
  const merged: ProjectTags = {
    ...((project.tags as ProjectTags | null) ?? {}),
    ...body.tags,
  }

  const { error } = await svc
    .from('projects')
    .update({ tags: merged })
    .eq('id', body.project_id)

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, tags: merged })
}
