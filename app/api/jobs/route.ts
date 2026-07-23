import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { NextResponse } from 'next/server'

/**
 * 파이프라인 잡 큐 API — 진동벨 구조의 접수 창구.
 *
 * POST { project_id, kind: 'planning'|'shots'|'draft' } → 잡 등록(즉시 응답).
 *   같은 프로젝트·kind의 pending/running 잡이 있으면 그것을 반환(중복 등록 방지).
 * GET ?project_id=... → 해당 프로젝트 최근 잡 목록(콘솔 폴링용).
 *
 * 실행은 외부 워커(scripts/worker.ts, Railway 상주)가 수행 — Vercel 800초 한도 무관.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const role = user.user_metadata?.role as string | undefined
  if (!role || !['admin', 'designer'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { project_id, kind } = (await request.json().catch(() => ({}))) as { project_id?: string; kind?: string }
  if (!project_id || !kind || !['planning', 'shots', 'draft'].includes(kind)) {
    return NextResponse.json({ error: 'project_id와 kind(planning|shots|draft)가 필요합니다' }, { status: 400 })
  }

  const svc = createServiceClient()
  const { data: proj } = await svc.from('projects').select('id').eq('id', project_id).single()
  if (!proj) return NextResponse.json({ error: '프로젝트 없음' }, { status: 404 })

  // 중복 방지 — 이미 대기/실행 중이면 그 잡을 반환
  const { data: existing } = await svc
    .from('jobs')
    .select('id, status, created_at')
    .eq('project_id', project_id)
    .eq('kind', kind)
    .in('status', ['pending', 'running'])
    .limit(1)
  if (existing?.[0]) {
    return NextResponse.json({ success: true, job: existing[0], deduped: true })
  }

  const { data: job, error } = await svc
    .from('jobs')
    .insert({ project_id, kind })
    .select('id, status, created_at')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, job })
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const role = user.user_metadata?.role as string | undefined
  if (!role || !['admin', 'designer'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const project_id = new URL(request.url).searchParams.get('project_id')
  if (!project_id) return NextResponse.json({ error: 'project_id 누락' }, { status: 400 })

  const svc = createServiceClient()
  const { data: jobs } = await svc
    .from('jobs')
    .select('id, kind, status, note, error, created_at, started_at, finished_at')
    .eq('project_id', project_id)
    .order('created_at', { ascending: false })
    .limit(10)
  return NextResponse.json({ success: true, jobs: jobs ?? [] })
}
