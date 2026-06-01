/**
 * 테스트 프로젝트 3종 생성 (docs/test 누끼컷 활용) — 운영 UI 테스트용
 * 사용: npx tsx --env-file=.env.local scripts/create-test-projects.ts
 *
 * 각 제품: projects(status=script_approved) + 누끼컷 Storage 업로드 + intake_files + 더미 script
 * → planner 화면에서 "디자인 기획 시작" 버튼부터 전체 흐름 테스트 가능
 * 주의: 테스트 전용. 배포 후 정리.
 */
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const ADMIN_ID = 'aa05a40f-5724-4203-9571-5332773a4a7d' // admin@detailai.app

const PRODUCTS = [
  { name: '돈덕 순대', dir: 'docs/test/돈덕(순대)', highlights: '국내산 돼지부속 100%\n전통 방식 수제 순대\n쫄깃한 식감과 깊은 풍미' },
  { name: '쌀과밀 소금빵', dir: 'docs/test/쌀과밀(소금빵)', highlights: '프랑스산 고메버터 사용\n겉바속촉 소금빵\n매일 아침 갓 구운 신선함' },
  { name: '황태이야기', dir: 'docs/test/황태이야기', highlights: '대관령 황태덕장 직송\n3개월 자연 건조\n진하고 깊은 황태국 맛' },
]

function dummyScript(name: string): unknown {
  return {
    sections: [
      { type: 'hero', title: name, subtitle: '테스트 상세페이지', text: `${name} 테스트용 더미 스크립트` },
      { type: 'brand_story', title: '브랜드 스토리', text: '테스트 브랜드 스토리 본문입니다.' },
      { type: 'key_benefit', title: '핵심 강점', items: [{ title: '강점1', description: '설명1' }] },
      { type: 'cta', title: '지금 구매하세요', text: '한정 수량' },
    ],
    tone: 'warm',
    color_suggestion: 'natural',
    key_insights: '테스트 인사이트',
    shooting_requirements: { nukki_shots: [], styling_shots: [], additional_notes: '' },
  }
}

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('env 누락 — --env-file=.env.local 필요')
    process.exit(1)
  }
  const supabase = createClient(url, key, { auth: { persistSession: false } })

  // platform (첫 row, 없으면 null)
  const { data: platform } = await supabase.from('platforms').select('id, name').limit(1).maybeSingle()
  console.log(`platform: ${platform?.name ?? '(없음 — null로 진행)'}\n`)

  for (const p of PRODUCTS) {
    // 1. 프로젝트
    const { data: project, error: pErr } = await supabase
      .from('projects')
      .insert({
        client_id: ADMIN_ID,
        company_name: p.name,
        category: 'food',
        platform_id: platform?.id ?? null,
        status: 'script_approved',
        product_highlights: p.highlights,
      })
      .select('id')
      .single()
    if (pErr || !project) {
      console.error(`❌ ${p.name} 프로젝트 생성 실패:`, pErr?.message)
      continue
    }

    // 2. 누끼컷 업로드 + intake_files (storage path는 영문 인덱스로 안전하게)
    const dir = path.join(process.cwd(), p.dir)
    const files = fs.existsSync(dir)
      ? fs.readdirSync(dir).filter((f) => /\.(png|jpe?g|webp)$/i.test(f)).sort()
      : []
    let uploaded = 0
    for (let i = 0; i < files.length; i++) {
      const f = files[i]
      const buf = fs.readFileSync(path.join(dir, f))
      const ext = path.extname(f).toLowerCase()
      const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg'
      const storagePath = `projects/${project.id}/nukki/nukki_${i + 1}${ext}`
      const { error: upErr } = await supabase.storage
        .from('intake-files')
        .upload(storagePath, buf, { contentType: mime, upsert: true })
      if (upErr) {
        console.warn(`  ⚠️ 업로드 실패 ${f}:`, upErr.message)
        continue
      }
      await supabase.from('intake_files').insert({
        project_id: project.id,
        file_type: 'product_photo',
        storage_path: storagePath,
        file_name: f,
        mime_type: mime,
        file_size: buf.length,
      })
      uploaded++
    }

    // 3. 더미 script (script_approved 상태에 맞춤)
    await supabase.from('scripts').insert({
      project_id: project.id,
      content: dummyScript(p.name),
      ai_model: 'test-dummy',
      planner_status: 'approved',
      version: 1,
    })

    console.log(`✅ ${p.name} — projectId=${project.id}, 누끼 ${uploaded}/${files.length}장, script 생성`)
  }

  console.log('\n=== 완료 — planner에서 "디자인 기획 시작" 버튼으로 테스트하세요 ===')
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
