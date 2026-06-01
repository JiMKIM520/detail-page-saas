import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import * as fs from 'fs'
import * as path from 'path'
import { EDITOR_BRIDGE_SCRIPT } from '@/lib/editor/editorBridgeScript'

/**
 * GET /api/designs/[id]/html
 * 인증 + 소유권 검증 후 생성된 HTML을 bridge 스크립트 주입해 반환.
 * 이미지는 base64 인라인 대신 /api/designs/[id]/image 프록시 URL로 치환.
 */
export async function GET(
  _request: Request,
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

  // 로컬 output 디렉토리에서 HTML 탐색
  const htmlPaths = [
    path.join(process.cwd(), 'output', projectId, '4_final', 'index.html'),
    path.join(process.cwd(), 'output', projectId, '5_export', 'designer', 'index.html'),
  ]

  let htmlContent: string | null = null
  for (const p of htmlPaths) {
    if (fs.existsSync(p)) {
      htmlContent = fs.readFileSync(p, 'utf8')
      break
    }
  }

  if (!htmlContent) {
    return NextResponse.json({ error: 'HTML not found' }, { status: 404 })
  }

  // 상대 경로 이미지 → 프록시 API URL로 치환 (크기 제한 없음)
  htmlContent = htmlContent.replace(
    /src="(\.\.\/[^"]+)"/g,
    (_match, relPath: string) => {
      const cleanPath = relPath.replace(/^\.\.\//, '')
      return `src="/api/designs/${projectId}/image?file=${encodeURIComponent(cleanPath)}"`
    }
  )

  // bridge 스크립트 주입
  htmlContent = htmlContent.replace('</body>', `${EDITOR_BRIDGE_SCRIPT}\n</body>`)

  return new Response(htmlContent, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  })
}
