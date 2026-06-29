import { createServiceClient } from '@/lib/supabase/service'

/**
 * GET /draft/[id] — 생성된 상세페이지 초안 HTML을 text/html로 서빙.
 *
 * 용도: 디자이너가 이 URL을 Figma html.to.design 플러그인에 붙여넣어 임포트하거나,
 *       앱에서 iframe으로 미리보기. (Supabase Storage는 HTML을 text/plain+nosniff로 강제 →
 *       렌더 불가이므로 Vercel 라우트가 직접 text/html로 내보낸다.)
 *
 * 공개 경로(proxy PUBLIC_PREFIXES '/draft') — 플러그인 서버가 인증 없이 fetch해야 하므로.
 * id(프로젝트 uuid)가 비추측 토큰 역할. (폐쇄형 200명, 초안은 민감자격증명 아님)
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // uuid 형식만 허용(경로 주입 방지)
  if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id)) {
    return new Response('Invalid id', { status: 400 })
  }

  const supabase = createServiceClient()
  const storagePath = `projects/${id}/4_final/index.html`
  const { data, error } = await supabase.storage.from('designs').download(storagePath)

  if (error || !data) {
    return new Response(
      '<!doctype html><meta charset="utf-8"><body style="font-family:sans-serif;padding:40px;color:#555">초안이 아직 없습니다. 디자인 생성을 먼저 진행하세요.</body>',
      { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    )
  }

  const html = await data.text()
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}
