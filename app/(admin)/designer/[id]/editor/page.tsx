import { redirect } from 'next/navigation'
import * as fs from 'fs'
import * as path from 'path'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import EditorLayout from '@/components/editor/EditorLayout'

interface EditorPageProps {
  params: Promise<{ id: string }>
}

export default async function EditorPage({ params }: EditorPageProps) {
  const { id: rawId } = await params

  // 경로 탐색 방어
  const projectId = path.basename(rawId)
  if (projectId !== rawId) {
    redirect('/designer')
  }

  // 인증 + 관리자 권한 검증
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin')
  const role = user.user_metadata?.role as string | undefined
  if (role !== 'admin') redirect('/projects')

  // 프로젝트 존재 확인 (보안)
  const service = createServiceClient()
  const { data: project } = await service.from('projects').select('id').eq('id', projectId).single()

  // 로컬 output 디렉토리에서 직접 데이터 로드
  const projectDir = path.join(process.cwd(), 'output', projectId)

  const notFound = !project || !fs.existsSync(projectDir)
  if (notFound) {
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-950 text-neutral-400">
        <div className="text-center">
          <h1 className="text-lg font-semibold mb-2">프로젝트를 찾을 수 없습니다</h1>
          <p className="text-sm font-mono text-neutral-600">{projectId}</p>
          <a href="/designer" className="mt-4 inline-block text-indigo-400 text-sm hover:underline">&larr; 목록으로</a>
        </div>
      </div>
    )
  }

  try {
    const copy = JSON.parse(fs.readFileSync(path.join(projectDir, 'refined-copy.json'), 'utf8'))
    const styleGuide = JSON.parse(fs.readFileSync(path.join(projectDir, 'style-guide.json'), 'utf8'))
    const script = JSON.parse(fs.readFileSync(path.join(projectDir, '1_script', 'script.json'), 'utf8'))
    const iconMapping = JSON.parse(fs.readFileSync(path.join(projectDir, 'icons', 'icon-mapping.json'), 'utf8'))

    return (
      <EditorLayout
        projectId={projectId}
        initialCopy={copy}
        initialStyleGuide={styleGuide}
        script={script}
        iconMapping={iconMapping}
      />
    )
  } catch (err) {
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-950 text-neutral-400">
        <div className="text-center">
          <h1 className="text-lg font-semibold mb-2">프로젝트 데이터 로드 실패</h1>
          <p className="text-sm font-mono text-neutral-600">{err instanceof Error ? err.message : String(err)}</p>
          <a href="/designer" className="mt-4 inline-block text-indigo-400 text-sm hover:underline">&larr; 목록으로</a>
        </div>
      </div>
    )
  }
}
