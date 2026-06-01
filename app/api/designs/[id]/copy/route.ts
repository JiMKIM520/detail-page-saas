import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import * as fs from 'fs'
import * as path from 'path'

/**
 * GET /api/designs/[id]/copy
 * 인증 필수. 프로젝트의 RefinedCopy + StyleGuide 반환.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: rawId } = await params
  const projectId = path.basename(rawId)
  if (projectId !== rawId) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  // 소유권 검증
  const { createServiceClient } = await import('@/lib/supabase/service')
  const service = createServiceClient()
  const { data: project } = await service.from('projects').select('client_id').eq('id', projectId).single()
  const role = user.user_metadata?.role as string | undefined
  const isAdmin = ['admin'].includes(role ?? '')
  if (!project || (project.client_id !== user.id && !isAdmin)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const projectDir = path.join(process.cwd(), 'output', projectId)

  try {
    const copy = JSON.parse(fs.readFileSync(path.join(projectDir, 'refined-copy.json'), 'utf8'))
    const styleGuide = JSON.parse(fs.readFileSync(path.join(projectDir, 'style-guide.json'), 'utf8'))
    const script = JSON.parse(fs.readFileSync(path.join(projectDir, '1_script', 'script.json'), 'utf8'))
    const iconMapping = JSON.parse(fs.readFileSync(path.join(projectDir, 'icons', 'icon-mapping.json'), 'utf8'))

    return NextResponse.json({
      success: true,
      data: { copy, styleGuide, script, iconMapping },
    })
  } catch {
    return NextResponse.json({ success: false, error: 'Project data not found' }, { status: 404 })
  }
}

/**
 * PATCH /api/designs/[id]/copy
 * 편집된 RefinedCopy + StyleGuide 저장.
 * regenerateHtml=true 시 HTML 재생성.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: rawId } = await params
  const projectId = path.basename(rawId)
  if (projectId !== rawId) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  // 소유권 검증
  const { createServiceClient } = await import('@/lib/supabase/service')
  const svc = createServiceClient()
  const { data: proj } = await svc.from('projects').select('client_id').eq('id', projectId).single()
  const patchRole = user.user_metadata?.role as string | undefined
  const patchIsAdmin = ['admin'].includes(patchRole ?? '')
  if (!proj || (proj.client_id !== user.id && !patchIsAdmin)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const projectDir = path.join(process.cwd(), 'output', projectId)
  const body = await request.json()
  const { copy, styleGuide, regenerateHtml } = body

  try {
    // 편집된 데이터 저장
    if (copy) {
      fs.writeFileSync(path.join(projectDir, 'refined-copy.json'), JSON.stringify(copy, null, 2))
    }
    if (styleGuide) {
      fs.writeFileSync(path.join(projectDir, 'style-guide.json'), JSON.stringify(styleGuide, null, 2))
    }

    // HTML 재생성
    if (regenerateHtml) {
      const { buildHTML } = await import('@/agents/html-builder')
      const rc = JSON.parse(fs.readFileSync(path.join(projectDir, 'refined-copy.json'), 'utf8'))
      const sg = JSON.parse(fs.readFileSync(path.join(projectDir, 'style-guide.json'), 'utf8'))
      const sc = JSON.parse(fs.readFileSync(path.join(projectDir, '1_script', 'script.json'), 'utf8'))
      const ic = JSON.parse(fs.readFileSync(path.join(projectDir, 'icons', 'icon-mapping.json'), 'utf8'))

      // 이미지 경로 매핑 빌드
      const finalDir = path.join(projectDir, '4_final')
      const imgMap: Record<string, string> = {}
      const ssDir = path.join(projectDir, '2_styling_shots')
      const liDir = path.join(projectDir, '3_layer_images')

      if (fs.existsSync(ssDir)) {
        fs.readdirSync(ssDir)
          .filter(f => /\.(jpg|png|jpeg)$/i.test(f))
          .sort()
          .forEach((f, i) => { imgMap[`shot${i}`] = path.relative(finalDir, path.join(ssDir, f)) })
      }
      if (fs.existsSync(liDir)) {
        for (const f of fs.readdirSync(liDir).filter(f => /\.(jpg|png|jpeg)$/i.test(f))) {
          const rel = path.relative(finalDir, path.join(liDir, f))
          if (f.includes('hero_bg') || f.includes('heroBg')) imgMap['heroBg'] = rel
          if (f.includes('typo')) imgMap['heroWithTypo'] = rel
          if (f.includes('break')) imgMap['breakImage'] = rel
          if (f.includes('concept') || f.includes('section_')) {
            imgMap[f.replace(/\.(jpg|png|jpeg)$/i, '')] = rel
          }
        }
      }

      const html = buildHTML(sg, rc, sc, ic, imgMap)
      fs.writeFileSync(path.join(finalDir, 'index.html'), html)

      const designerHtml = path.join(projectDir, '5_export', 'designer', 'index.html')
      if (fs.existsSync(path.dirname(designerHtml))) {
        fs.writeFileSync(designerHtml, html)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
