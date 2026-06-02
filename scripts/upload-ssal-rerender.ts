/**
 * 재렌더된 소금빵 템플릿 산출물을 Supabase Storage에 업로드 + designs DB 갱신.
 * - 4_final/index.html + 5_export/** 를 projects/{PID}/ 동일 경로에 덮어쓰기(upsert)
 * - preview_url ← 5_export/mobile/detail_page.png (웹앱 미리보기 = 수정된 템플릿)
 * - output_url  ← {html, mobile_zip, pc_zip, designer_zip} (디자이너 다운로드)
 * 사용: env -u ANTHROPIC_API_KEY node_modules/.bin/tsx --env-file=.env.local scripts/upload-ssal-rerender.ts
 */
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

const PID = 'c0ff7994-4c13-4bbf-9ddd-d621bcfd5096'
const OUT = '/tmp/ssal-rerender'
const BUCKET = 'designs'
const PREFIX = `projects/${PID}`
const PUBBASE = `https://uddyemjqoxqttzpminwa.supabase.co/storage/v1/object/public/${BUCKET}/${PREFIX}`

function contentType(f: string): string {
  if (f.endsWith('.html')) return 'text/html'
  if (f.endsWith('.png')) return 'image/png'
  if (f.endsWith('.json')) return 'application/json'
  if (f.endsWith('.zip')) return 'application/zip'
  if (f.endsWith('.svg')) return 'image/svg+xml'
  if (f.endsWith('.ttf')) return 'font/ttf'
  if (f.endsWith('.md')) return 'text/markdown'
  return 'application/octet-stream'
}

function walkFiles(dir: string, base: string, acc: string[] = []): string[] {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name)
    if (fs.statSync(full).isDirectory()) walkFiles(full, base, acc)
    else acc.push(path.relative(base, full))
  }
  return acc
}

async function main(): Promise<void> {
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })

  // 업로드 대상: 4_final/index.html + 5_export/** (assets/ 제외)
  const targets: string[] = []
  if (fs.existsSync(path.join(OUT, '4_final/index.html'))) targets.push('4_final/index.html')
  for (const rel of walkFiles(path.join(OUT, '5_export'), OUT)) targets.push(rel)

  let ok = 0, fail = 0
  for (const rel of targets) {
    const local = path.join(OUT, rel)
    const remote = `${PREFIX}/${rel}`
    const buf = fs.readFileSync(local)
    const { error } = await s.storage.from(BUCKET).upload(remote, buf, { upsert: true, contentType: contentType(rel) })
    if (error) { console.log('  ❌', rel, error.message); fail++ }
    else ok++
  }
  console.log(`업로드 완료: ${ok}개 성공, ${fail}개 실패 (총 ${targets.length})`)

  // DB 갱신
  const outputUrl = JSON.stringify({
    html: `${PUBBASE}/4_final/index.html`,
    mobile_zip: `${PUBBASE}/5_export/mobile.zip`,
    pc_zip: `${PUBBASE}/5_export/pc.zip`,
    designer_zip: `${PUBBASE}/5_export/designer.zip`,
  })
  const previewUrl = `${PUBBASE}/5_export/mobile/detail_page.png`

  const { data: design } = await s.from('designs').select('id').eq('project_id', PID).order('created_at', { ascending: false }).limit(1).maybeSingle()
  if (!design) { console.log('❌ designs row 없음'); return }
  const { error: upErr } = await (s.from('designs') as any).update({ preview_url: previewUrl, output_url: outputUrl }).eq('id', (design as any).id)
  if (upErr) { console.log('❌ DB 갱신 실패:', upErr.message); return }
  console.log('✅ DB 갱신: preview_url=mobile/detail_page.png, output_url=4종 링크')
  console.log('   preview:', previewUrl)
}
main().catch(e => { console.error('FATAL', e.message); process.exit(1) })
