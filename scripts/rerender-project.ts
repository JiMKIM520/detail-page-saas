/**
 * 저장된 산출물 재렌더 — 렌더 계층 코드 수정(히어로 세로화·저대비 등)을 이미 생성된 산출물에 반영한다.
 *
 * 왜 필요한가: renderPage 코드를 고쳐도 이미 생성돼 저장된 4_final/index.html은 옛 렌더 그대로다.
 * 새로 파이프라인을 돌리지 않고 page-spec만 다시 렌더해 산출물을 갱신한다(이미지·카피 불변, 렌더만).
 *
 * 사용: npx tsx --env-file=.env.local scripts/rerender-project.ts <output디렉토리> [supabase프로젝트id]
 */
import fs from 'node:fs'
import path from 'node:path'
import { renderPage } from '@/agents/templates/blocks'
import { createServiceClient } from '@/lib/supabase/service'

async function main(): Promise<void> {
  const dir = process.argv[2]
  const projectId = process.argv[3]
  if (!dir) {
    console.error('사용: rerender-project.ts <output디렉토리> [supabase프로젝트id]')
    process.exit(1)
  }
  const spec = JSON.parse(fs.readFileSync(path.join(dir, 'page-spec.json'), 'utf8'))
  const html = renderPage(spec).html
  const local = path.join(dir, '4_final', 'index.html')
  fs.writeFileSync(local, html)
  console.log(`로컬 교체: ${local} (${Math.round(html.length / 1024)}KB)`)
  if (projectId) {
    const svc = createServiceClient()
    const key = `projects/${projectId}/4_final/index.html`
    const { error } = await svc.storage
      .from('designs')
      .upload(key, new Blob([html], { type: 'text/html' }), { upsert: true, cacheControl: '0' })
    if (error) {
      console.error('Supabase 실패:', error.message)
      process.exit(1)
    }
    console.log(`Supabase 교체: ${key}`)
  }
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
