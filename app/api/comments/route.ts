import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const projectId = request.nextUrl.searchParams.get('project_id')
  if (!projectId) {
    return NextResponse.json({ error: 'project_id is required' }, { status: 400 })
  }

  const service = createServiceClient()

  // Verify user is project owner or admin role
  const { data: project } = await service
    .from('projects')
    .select('client_id')
    .eq('id', projectId)
    .single()

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  const role = user.user_metadata?.role as string | undefined
  const isAdmin = role === 'designer' || role === 'admin'

  if (project.client_id !== user.id && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // 사무국·디자이너가 남긴 코멘트는 내부 소통용이라 기업에게 보이면 안 된다.
  // 기업 화면에는 기업 자신이 쓴 수정요구만 돌려준다.
  let query = service
    .from('comments')
    .select('id, content, created_at, user_id, role')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })

  // 기업에게는 본인이 쓴 수정요구 + 사무국이 보낸 보완 요청 사유만 보인다.
  if (!isAdmin) query = query.in('role', ['client', 'revision_notice'])

  const { data: comments, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Fetch user names for comments
  const userIds = [...new Set((comments ?? []).map((c) => c.user_id))]
  const { data: profiles } = userIds.length > 0
    ? await service.from('user_profiles').select('id, name').in('id', userIds)
    : { data: [] }

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p.name]))

  const enriched = (comments ?? []).map((c) => ({
    ...c,
    user_profiles: { name: profileMap.get(c.user_id) ?? null },
  }))

  return NextResponse.json(enriched)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { project_id, content } = await request.json()
  if (!project_id || !content?.trim()) {
    return NextResponse.json({ error: 'project_id and content are required' }, { status: 400 })
  }

  const service = createServiceClient()

  // Verify user is project owner or admin role
  const { data: project } = await service
    .from('projects')
    .select('client_id')
    .eq('id', project_id)
    .single()

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  const role = user.user_metadata?.role as string | undefined
  const isAdmin = role === 'designer' || role === 'admin'

  if (project.client_id !== user.id && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: comment, error } = await service
    .from('comments')
    .insert({
      project_id: project_id,
      user_id: user.id,
      content: content.trim(),
      role: role ?? 'client',
    })
    .select('id, content, created_at, user_id, role')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Fetch user name
  const { data: profile } = await service
    .from('user_profiles')
    .select('name')
    .eq('id', user.id)
    .single()

  return NextResponse.json(
    { ...comment, user_profiles: { name: profile?.name ?? null } },
    { status: 201 }
  )
}
