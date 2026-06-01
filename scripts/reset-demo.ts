/**
 * 데모 데이터 리셋 — 기존 전체 삭제 후 깨끗이 재구성
 * 사용: npx tsx --env-file=.env.local scripts/reset-demo.ts
 *
 * 1) 모든 프로젝트 + 관련(comments/photos/designs/scripts/intake_files/project_logs) 삭제
 * 2) 데모 사업자 계정 1명 (이메일 + 사업자등록번호 = 로그인 비번)
 * 3) 누끼컷 3종 프로젝트를 단계별 status로 생성 (사업자 소유)
 *
 * 주의: 파괴적. 사용자 승인("깨끗이 새로 구성") 하에 실행.
 */
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const DEMO_EMAIL = 'demo@detailai.app'
const DEMO_BIZ_NO = '123-45-67890' // 표시용 사업자등록번호
const DEMO_PASSWORD = DEMO_BIZ_NO.replace(/-/g, '') // 실제 로그인 비번 (login이 하이픈 제거 후 signInWithPassword)
const DEMO_COMPANY = '데모상점'
const IMPOSSIBLE_ID = '00000000-0000-0000-0000-000000000000'

const PRODUCTS = [
  { name: '돈덕 순대', dir: 'docs/test/돈덕(순대)', status: 'script_review', highlights: '국내산 돼지부속 100%\n전통 방식 수제 순대\n쫄깃한 식감과 깊은 풍미' },
  { name: '쌀과밀 소금빵', dir: 'docs/test/쌀과밀(소금빵)', status: 'script_approved', highlights: '프랑스산 고메버터 사용\n겉바속촉 소금빵\n매일 아침 갓 구운 신선함' },
  { name: '황태이야기', dir: 'docs/test/황태이야기', status: 'script_approved', highlights: '대관령 황태덕장 직송\n3개월 자연 건조\n진하고 깊은 황태국 맛' },
]

function dummyScript(name: string): unknown {
  return {
    sections: [
      { type: 'hero', title: name, subtitle: '테스트 상세페이지', text: `${name} 데모용 스크립트입니다.` },
      { type: 'brand_story', title: '브랜드 스토리', text: '정성과 전통으로 만든 제품 이야기.' },
      { type: 'key_benefit', title: '핵심 강점', items: [{ title: '강점1', description: '설명1' }, { title: '강점2', description: '설명2' }] },
      { type: 'how_to_use', title: '맛있게 즐기는 법', text: '간단한 조리로 완성하는 한 끼.' },
      { type: 'cta', title: '지금 구매하세요', text: '한정 수량' },
    ],
    tone: 'warm',
    color_suggestion: 'natural',
    key_insights: '데모 인사이트',
    shooting_requirements: { nukki_shots: [], styling_shots: [], additional_notes: '' },
  }
}

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) { console.error('env 누락'); process.exit(1) }
  const s = createClient(url, key, { auth: { persistSession: false } })

  // ── 1. 기존 데이터 전체 삭제 (FK 자식부터) ──
  console.log('=== 1. 기존 데이터 삭제 ===')
  for (const t of ['comments', 'photos', 'designs', 'scripts', 'intake_files', 'project_logs']) {
    const { error } = await s.from(t).delete().neq('id', IMPOSSIBLE_ID)
    console.log(`  ${t}: ${error ? 'ERR ' + error.message : '삭제'}`)
  }
  const { error: pErr } = await s.from('projects').delete().neq('id', IMPOSSIBLE_ID)
  console.log(`  projects: ${pErr ? 'ERR ' + pErr.message : '삭제'}`)

  // ── 2. 데모 사업자 계정 ──
  console.log('\n=== 2. 데모 사업자 계정 ===')
  const { data: list } = await s.auth.admin.listUsers()
  let demo = list?.users.find((u) => u.email === DEMO_EMAIL)
  const meta = { role: 'client', business_number: DEMO_BIZ_NO, company_name: DEMO_COMPANY }
  if (demo) {
    await s.auth.admin.updateUserById(demo.id, { password: DEMO_PASSWORD, user_metadata: meta })
    console.log(`  기존 계정 갱신: ${DEMO_EMAIL}`)
  } else {
    const { data: created, error } = await s.auth.admin.createUser({
      email: DEMO_EMAIL, password: DEMO_PASSWORD, email_confirm: true, user_metadata: meta,
    })
    if (error || !created?.user) { console.error('  계정 생성 실패:', error?.message); process.exit(1) }
    demo = created.user
    console.log(`  신규 계정 생성: ${DEMO_EMAIL}`)
  }
  const CLIENT_ID = demo.id
  console.log(`  로그인 → 이메일: ${DEMO_EMAIL} / 사업자번호: ${DEMO_BIZ_NO}`)

  // platform (첫 row)
  const { data: platform } = await s.from('platforms').select('id, name').limit(1).maybeSingle()

  // ── 3. 데모 프로젝트 3종 ──
  console.log('\n=== 3. 데모 프로젝트 생성 ===')
  for (const p of PRODUCTS) {
    const { data: project, error: prjErr } = await s.from('projects').insert({
      client_id: CLIENT_ID, company_name: p.name, category: 'food',
      platform_id: platform?.id ?? null, status: p.status, product_highlights: p.highlights,
    }).select('id').single()
    if (prjErr || !project) { console.error(`  ❌ ${p.name}:`, prjErr?.message); continue }

    // 누끼컷 업로드
    const dir = path.join(process.cwd(), p.dir)
    const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /\.(png|jpe?g|webp)$/i.test(f)).sort() : []
    let uploaded = 0
    for (let i = 0; i < files.length; i++) {
      const buf = fs.readFileSync(path.join(dir, files[i]))
      const ext = path.extname(files[i]).toLowerCase()
      const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg'
      const storagePath = `projects/${project.id}/nukki/nukki_${i + 1}${ext}`
      const { error: upErr } = await s.storage.from('intake-files').upload(storagePath, buf, { contentType: mime, upsert: true })
      if (upErr) { console.warn(`    ⚠️ ${files[i]}: ${upErr.message}`); continue }
      await s.from('intake_files').insert({
        project_id: project.id, file_type: 'product_photo', storage_path: storagePath,
        file_name: files[i], mime_type: mime, file_size: buf.length,
      })
      uploaded++
    }

    // 스크립트 (단계에 맞는 planner_status)
    await s.from('scripts').insert({
      project_id: project.id, content: dummyScript(p.name), ai_model: 'demo',
      planner_status: p.status === 'script_approved' ? 'approved' : 'pending', version: 1,
    })

    console.log(`  ✅ ${p.name} (${p.status}) — projectId=${project.id.slice(0, 8)}, 누끼 ${uploaded}/${files.length}장`)
  }

  console.log('\n=== 완료 ===')
  console.log(`운영자: admin@detailai.app (아이디 admin) / DetailAI!2026`)
  console.log(`사업자: ${DEMO_EMAIL} / ${DEMO_BIZ_NO}`)
}

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
