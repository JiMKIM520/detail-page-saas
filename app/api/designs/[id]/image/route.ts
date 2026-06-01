import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import * as fs from 'fs'
import * as path from 'path'

const MIME_MAP: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
}

/**
 * GET /api/designs/[id]/image?file={relativePath}
 * 인증 + 소유권 검증 후 프로젝트 output 디렉토리의 이미지 파일을 스트리밍.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // 인증
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: rawId } = await params
  const projectId = path.basename(rawId)
  if (projectId !== rawId || projectId.includes('..')) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  // 소유권 검증
  const service = createServiceClient()
  const { data: project } = await service.from('projects').select('client_id').eq('id', projectId).single()
  const role = user.user_metadata?.role as string | undefined
  const isAdmin = role === 'admin'
  if (!project || (project.client_id !== user.id && !isAdmin)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // file 쿼리 파라미터 읽기 + 경로 탐색 방어
  const url = new URL(request.url)
  const fileParam = url.searchParams.get('file')
  if (!fileParam) return NextResponse.json({ error: 'Missing file param' }, { status: 400 })

  // output/{projectId}/ 경계 내부인지 확인
  const outputRoot = path.resolve(process.cwd(), 'output')
  const projectRoot = path.resolve(outputRoot, projectId)
  const absPath = path.resolve(projectRoot, fileParam)

  if (!absPath.startsWith(projectRoot + path.sep)) {
    return NextResponse.json({ error: 'Path traversal denied' }, { status: 400 })
  }

  if (!fs.existsSync(absPath)) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }

  // 파일 읽어 스트리밍
  const ext = path.extname(absPath).toLowerCase()
  const mime = MIME_MAP[ext] ?? 'application/octet-stream'
  const buffer = fs.readFileSync(absPath)

  return new Response(buffer as unknown as BodyInit, {
    headers: {
      'Content-Type': mime,
      'Cache-Control': 'private, max-age=3600',
      'Content-Length': buffer.length.toString(),
    },
  })
}
