/**
 * 클라이언트 시연용 테스트 데이터 주입
 *
 * output/ 3개 결과물(소금빵/순대/황태)을 실제 Supabase에 주입:
 * 1. 기업 계정 3개 생성 (client role)
 * 2. projects 3개 생성 (status=design_review)
 * 3. Storage 업로드 (mobile.zip, pc.zip, designer.zip, preview, sections)
 * 4. designs 테이블 URL 저장
 *
 * 실행: npx tsx --tsconfig tsconfig.node.json scripts/seed-demo-data.ts
 */
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// .env.local 로드
const envContent = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8')
const env: Record<string, string> = {}
for (const line of envContent.split('\n')) {
  const t = line.trim()
  if (!t || t.startsWith('#')) continue
  const i = t.indexOf('=')
  if (i === -1) continue
  env[t.slice(0, i)] = t.slice(i + 1).trim()
}

const service = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

// ── 시연용 기업 데이터 ────────────────────────────────────────

interface DemoProject {
  projectId: string         // output 디렉토리명
  outputDir: string
  companyName: string
  email: string
  businessNumber: string    // 로그인 비밀번호로 사용
  category: string
  productHighlights: string
}

const DEMO_PROJECTS: DemoProject[] = [
  {
    projectId: '512266a3',
    outputDir: 'output/512266a3',
    companyName: '고메코나베이커리',
    email: 'gomecona@demo.kr',
    businessNumber: '1234567890',
    category: 'food',
    productHighlights: '60년 전통 강릉 소금빵. 천연발효종 24시간 저온 숙성.',
  },
  {
    projectId: '06c2a947',
    outputDir: 'output/06c2a947',
    companyName: '원주 고구마순대',
    email: 'sundae@demo.kr',
    businessNumber: '2345678901',
    category: 'food',
    productHighlights: '60년 전통맛 원주 고구마순대. 해발 700m 청정 제조장.',
  },
  {
    projectId: 'a027f627',
    outputDir: 'output/a027f627',
    companyName: '황태이야기',
    email: 'hwangtae@demo.kr',
    businessNumber: '3456789012',
    category: 'food',
    productHighlights: '강원도 황태 본연의 깊은 맛. 자연 건조 방식.',
  },
]

const DESIGNS_BUCKET = 'designs'
const INTAKE_BUCKET = 'intake-files'

// ── 헬퍼 함수 ─────────────────────────────────────────────────

function mimeFromExt(ext: string): string {
  const map: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.pdf': 'application/pdf',
    '.zip': 'application/zip',
    '.html': 'text/html',
    '.json': 'application/json',
  }
  return map[ext.toLowerCase()] ?? 'application/octet-stream'
}

async function uploadFile(bucket: string, storagePath: string, filePath: string): Promise<string> {
  const buffer = fs.readFileSync(filePath)
  const contentType = mimeFromExt(path.extname(filePath))
  const { error } = await service.storage.from(bucket).upload(storagePath, buffer, { contentType, upsert: true })
  if (error) throw new Error(`Upload failed ${storagePath}: ${error.message}`)
  return service.storage.from(bucket).getPublicUrl(storagePath).data.publicUrl
}

async function getOrCreateClient(email: string, password: string, name: string, businessNumber: string): Promise<string> {
  // 기존 사용자 조회
  const { data: existing } = await service.auth.admin.listUsers()
  const found = existing?.users.find(u => u.email === email)
  if (found) {
    console.log(`  📝 기존 계정 사용: ${email}`)
    return found.id
  }

  // 신규 생성
  const { data, error } = await service.auth.admin.createUser({
    email,
    password,
    user_metadata: { role: 'client', name },
    email_confirm: true,
  })
  if (error || !data.user) throw new Error(`User create failed ${email}: ${error?.message}`)

  // user_profiles 생성 (upsert로 안전하게)
  await service.from('user_profiles').upsert({
    id: data.user.id,
    name,
    role: 'client',
    usage_count: 1,   // 이미 1회 사용 완료 상태
    usage_limit: 1,
  })

  console.log(`  ✅ 신규 계정 생성: ${email}`)
  return data.user.id
}

async function getSmartstorePlatformId(): Promise<string> {
  const { data } = await service.from('platforms').select('id').eq('slug', 'smartstore').single()
  if (!data) throw new Error('Platform "smartstore" not found — run migration 003')
  return data.id
}

// ── 메인 시드 로직 ────────────────────────────────────────────

async function seedProject(proj: DemoProject, platformId: string): Promise<void> {
  console.log(`\n── ${proj.companyName} (${proj.projectId}) ──`)

  const outputBase = path.join(process.cwd(), proj.outputDir)
  if (!fs.existsSync(outputBase)) {
    console.log(`  ⚠️  output 디렉토리 없음, 건너뜀`)
    return
  }

  // 1. 기업 계정 생성
  const clientId = await getOrCreateClient(proj.email, proj.businessNumber, proj.companyName, proj.businessNumber)

  // 2. 프로젝트 생성 (또는 기존 조회)
  const { data: existingProj } = await service
    .from('projects')
    .select('id')
    .eq('client_id', clientId)
    .eq('company_name', proj.companyName)
    .limit(1)
    .single()

  let projectId: string
  if (existingProj) {
    projectId = existingProj.id
    await service.from('projects').update({
      status: 'design_review',
      category: proj.category,
      platform_id: platformId,
      product_highlights: proj.productHighlights,
    }).eq('id', projectId)
    console.log(`  📝 기존 프로젝트 사용: ${projectId}`)
  } else {
    const { data: newProj, error } = await service.from('projects').insert({
      client_id: clientId,
      company_name: proj.companyName,
      category: proj.category,
      platform_id: platformId,
      product_highlights: proj.productHighlights,
      status: 'design_review',
    }).select('id').single()
    if (error || !newProj) throw new Error(`Project create failed: ${error?.message}`)
    projectId = newProj.id
    console.log(`  ✅ 프로젝트 생성: ${projectId}`)
  }

  // 3. Storage 업로드
  const storagePrefix = `projects/${projectId}`
  const urls: Record<string, string> = {}

  // 3a. ZIP 파일 (크기 초과 시 스킵, delivery.zip은 작으므로 우선)
  const exportDir = path.join(outputBase, '5_export')
  const zipFiles = [
    { local: 'delivery.zip', key: 'delivery_zip' },
    { local: 'mobile.zip', key: 'mobile_zip' },
    { local: 'pc.zip', key: 'pc_zip' },
    { local: 'designer.zip', key: 'designer_zip' },
  ]
  let zipUploaded = 0
  for (const { local, key } of zipFiles) {
    const fp = path.join(exportDir, local)
    if (!fs.existsSync(fp)) continue
    try {
      urls[key] = await uploadFile(DESIGNS_BUCKET, `${storagePrefix}/${local}`, fp)
      zipUploaded++
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      const sizeMb = (fs.statSync(fp).size / 1024 / 1024).toFixed(0)
      console.log(`  ⚠️  ${local} (${sizeMb}MB) 업로드 실패 — ${msg.slice(0, 60)}`)
    }
  }
  console.log(`  📦 ZIP ${zipUploaded}/${zipFiles.length}개 업로드`)

  // 3b. 미리보기 PNG (모바일 전체)
  const mobilePreview = path.join(exportDir, 'mobile', 'detail_page.png')
  if (fs.existsSync(mobilePreview)) {
    urls.preview_url = await uploadFile(DESIGNS_BUCKET, `${storagePrefix}/preview.png`, mobilePreview)
  }

  // 3c. PDF
  const mobilePdf = path.join(exportDir, 'mobile', 'detail_page.pdf')
  if (fs.existsSync(mobilePdf)) {
    urls.preview_pdf_url = await uploadFile(DESIGNS_BUCKET, `${storagePrefix}/preview.pdf`, mobilePdf)
  }
  console.log(`  🖼  미리보기 PNG+PDF 업로드`)

  // 3d. 섹션별 PNG
  const sectionsDir = path.join(exportDir, 'mobile', 'sections')
  const sectionImages: { type: string; url: string }[] = []
  if (fs.existsSync(sectionsDir)) {
    const files = fs.readdirSync(sectionsDir).filter(f => f.endsWith('.png')).sort()
    for (const f of files) {
      const url = await uploadFile(DESIGNS_BUCKET, `${storagePrefix}/sections/${f}`, path.join(sectionsDir, f))
      sectionImages.push({ type: path.basename(f, '.png'), url })
    }
    console.log(`  🎞  섹션 ${sectionImages.length}장 업로드`)
  }

  // 4. designs 테이블 upsert
  const outputUrl = JSON.stringify({
    mobile_zip: urls.mobile_zip,
    pc_zip: urls.pc_zip,
    designer_zip: urls.designer_zip,
  })

  const { data: existingDesign } = await service
    .from('designs')
    .select('id')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const designData = {
    project_id: projectId,
    preview_url: urls.preview_url ?? null,
    preview_pdf_url: urls.preview_pdf_url ?? null,
    output_url: outputUrl,
    section_images: sectionImages,
    designer_status: 'pending',
  }

  if (existingDesign) {
    await service.from('designs').update(designData).eq('id', existingDesign.id)
    console.log(`  📝 디자인 업데이트: ${existingDesign.id}`)
  } else {
    const { error } = await service.from('designs').insert(designData)
    if (error) throw new Error(`Design insert failed: ${error.message}`)
    console.log(`  ✅ 디자인 생성`)
  }
}

// ── 실행 ──────────────────────────────────────────────────────

async function main() {
  console.log('=== DetailAI 데모 데이터 시드 ===\n')
  console.log(`Supabase: ${env.NEXT_PUBLIC_SUPABASE_URL}`)

  // platforms 확인
  const platformId = await getSmartstorePlatformId()
  console.log(`Platform: smartstore (${platformId})`)

  // 각 프로젝트 시드
  for (const proj of DEMO_PROJECTS) {
    try {
      await seedProject(proj, platformId)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`  ❌ 실패: ${msg}`)
    }
  }

  // 결과 요약
  console.log('\n=== 시드 완료 ===')
  console.log('\n📌 기업 로그인 정보:')
  for (const p of DEMO_PROJECTS) {
    console.log(`  ${p.companyName}`)
    console.log(`    이메일: ${p.email}`)
    console.log(`    사업자번호: ${p.businessNumber}`)
  }
  console.log('\n📌 관리자 확인 경로:')
  console.log('  /designer — 디자인 검수 3건 (design_review 상태)')
  console.log('  /planner — 스크립트 검수 없음 (이미 design_review)')
  console.log('  /users — 사용자 3명 (client)')
}

main().catch(err => {
  console.error('\n❌ 시드 실패:', err)
  process.exit(1)
})
