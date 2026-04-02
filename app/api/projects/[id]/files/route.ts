import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params

  // 인증 확인
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { files } = await request.json()
  if (!Array.isArray(files) || files.length === 0) {
    return NextResponse.json({ error: 'No files provided' }, { status: 400 })
  }

  const service = createServiceClient()

  // 프로젝트 소유자 확인
  const { data: project } = await service
    .from('projects')
    .select('client_id')
    .eq('id', projectId)
    .single()

  const isAdmin = ['admin', 'planner', 'designer'].includes(user.user_metadata?.role)
  if (!project || (!isAdmin && project.client_id !== user.id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // 파일 메타데이터 저장
  const rows = files.map((f: { file_type: string; storage_path: string; file_name: string; mime_type: string; file_size: number }) => ({
    project_id: projectId,
    file_type: f.file_type,
    storage_path: f.storage_path,
    file_name: f.file_name,
    mime_type: f.mime_type,
    file_size: f.file_size,
  }))

  const { error } = await service.from('intake_files').insert(rows)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ count: rows.length }, { status: 201 })
}
