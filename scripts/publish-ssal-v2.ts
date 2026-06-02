/**
 * 새 고품질 소금빵 상세페이지(v2)를 스토리지 업로드 + designs DB 반영.
 * - detail.html(절대URL, Figma/html.to.design용) + detail.png(웹앱 미리보기) 업로드
 * - preview_url ← v2 detail.png, output_url.html ← v2 detail.html
 * 사용: env -u ANTHROPIC_API_KEY node_modules/.bin/tsx --env-file=.env.local scripts/publish-ssal-v2.ts
 */
import fs from 'fs'
import { createClient } from '@supabase/supabase-js'

const PID = 'c0ff7994-4c13-4bbf-9ddd-d621bcfd5096'
const SRC = '/tmp/ssal-v2'
const BUCKET = 'designs'
const PREFIX = `projects/${PID}/v2`
const PUB = `https://uddyemjqoxqttzpminwa.supabase.co/storage/v1/object/public/${BUCKET}/${PREFIX}`

async function main(): Promise<void> {
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })

  const uploads: [string, string, string][] = [
    [`${SRC}/detail.html`, `${PREFIX}/detail.html`, 'text/html'],
    [`${SRC}/detail.png`, `${PREFIX}/detail.png`, 'image/png'],
  ]
  for (const [local, remote, ct] of uploads) {
    if (!fs.existsSync(local)) { console.log('❌ 없음', local); continue }
    const { error } = await s.storage.from(BUCKET).upload(remote, fs.readFileSync(local), { upsert: true, contentType: ct })
    console.log(error ? `❌ ${remote}: ${error.message}` : `✅ ${remote} (${Math.round(fs.statSync(local).size/1024)}KB)`)
  }

  // designs 갱신: preview = v2 png, output_url.html = v2 html (zip 3종은 기존 유지)
  const { data: design } = await (s.from('designs') as any).select('id, output_url').eq('project_id', PID).order('created_at', { ascending: false }).limit(1).maybeSingle()
  if (!design) { console.log('❌ designs row 없음'); return }
  let out: Record<string, string> = {}
  try { out = JSON.parse((design as any).output_url || '{}') } catch {}
  out.html = `${PUB}/detail.html`
  const { error } = await (s.from('designs') as any).update({
    preview_url: `${PUB}/detail.png`,
    output_url: JSON.stringify(out),
  }).eq('id', (design as any).id)
  console.log(error ? `❌ DB: ${error.message}` : `✅ DB 갱신: preview=v2/detail.png, output_url.html=v2/detail.html`)
  console.log('preview:', `${PUB}/detail.png`)
}
main().catch(e => { console.error('FATAL', e.message); process.exit(1) })
