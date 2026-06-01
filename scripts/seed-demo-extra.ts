/**
 * 추가 데모 데이터 — 기획검수(planner) + 촬영관리(photography) 단계 시연용
 *
 * 2개 프로젝트 추가:
 * 1. 프리미엄 한우선물세트 — status=script_review (기획검수에 노출)
 * 2. 제주 감귤청 — status=photo_scheduled (촬영관리에 노출)
 */
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

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

interface ExtraProject {
  companyName: string
  email: string
  businessNumber: string
  category: string
  productHighlights: string
  status: 'script_review' | 'photo_scheduled'
  homepage: string
  referenceNotes: string
}

const EXTRA_PROJECTS: ExtraProject[] = [
  {
    companyName: '프리미엄 한우선물세트',
    email: 'hanwoo@demo.kr',
    businessNumber: '4567890123',
    category: 'food',
    productHighlights: '1++ 등급 한우 정육 선물세트. 명절 선물용. 진공포장 당일 배송.',
    status: 'script_review',
    homepage: 'https://hanwoo.example.kr',
    referenceNotes: '고급스러운 느낌, 검정/금색 톤. 명절 분위기.',
  },
  {
    companyName: '제주 감귤청',
    email: 'jejuorange@demo.kr',
    businessNumber: '5678901234',
    category: 'food',
    productHighlights: '제주 감귤 100% 수제 청. 설탕 최소화. 따뜻한 물에 타 드세요.',
    status: 'photo_scheduled',
    homepage: 'https://jejuorange.example.kr',
    referenceNotes: '제주 감성, 파란색/주황색 조합. 자연스러운 라이프스타일 샷 원함.',
  },
]

async function getOrCreateClient(email: string, password: string, name: string): Promise<string> {
  const { data: existing } = await service.auth.admin.listUsers()
  const found = existing?.users.find(u => u.email === email)
  if (found) {
    console.log(`  📝 기존 계정: ${email}`)
    return found.id
  }
  const { data, error } = await service.auth.admin.createUser({
    email,
    password,
    user_metadata: { role: 'client', name },
    email_confirm: true,
  })
  if (error || !data.user) throw new Error(`Create user failed: ${error?.message}`)
  await service.from('user_profiles').upsert({
    id: data.user.id, name, role: 'client', usage_count: 1, usage_limit: 1,
  })
  console.log(`  ✅ 신규 계정: ${email}`)
  return data.user.id
}

async function getPlatformId(): Promise<string> {
  const { data } = await service.from('platforms').select('id').eq('slug', 'smartstore').single()
  if (!data) throw new Error('Platform not found')
  return data.id
}

function buildSampleScript(proj: ExtraProject) {
  return {
    sections: [
      { type: 'hero', title: proj.companyName, subtitle: '고품질 프리미엄 라인업', text: proj.productHighlights.split('.')[0] + '.' },
      { type: 'brand_story', title: '브랜드 이야기', text: '오랜 전통과 장인정신으로 만들어진 제품입니다. 정성껏 손질한 재료만 사용합니다.' },
      { type: 'key_benefit', title: '핵심 특징', items: [
        { title: '엄선된 원료', description: '최고급 등급만 선별하여 사용', icon_suggestion: 'star' },
        { title: '당일 배송', description: '신선도 유지를 위해 주문 즉시 발송', icon_suggestion: 'truck' },
        { title: '품질 보증', description: '불만족 시 100% 환불', icon_suggestion: 'shield' },
      ]},
      { type: 'sensory', title: '맛의 깊이', text: '한 입 베어무는 순간 느껴지는 풍부한 맛.' },
      { type: 'packaging', title: '프리미엄 패키지', text: '선물용으로도 손색없는 고급스러운 패키지.' },
      { type: 'delivery', title: '안전 배송', text: '냉장/냉동 배송으로 신선하게 도착합니다.' },
      { type: 'cta', title: '지금 주문하세요', subtitle: '한정 수량 특가', text: '오늘 주문 시 내일 받아보실 수 있습니다.' },
    ],
    tone: '프리미엄, 신뢰감',
    color_suggestion: '#1a1a1a, #d4af37',
    key_insights: '프리미엄 포지셔닝. 선물용 강조.',
    shooting_requirements: {
      nukki_shots: ['제품 정면', '제품 측면', '포장 디테일'],
      styling_shots: ['고급 테이블 세팅', '선물 포장 연출', '재료 클로즈업', '라이프스타일 샷'],
      additional_notes: proj.referenceNotes,
    },
  }
}

async function seedExtra(proj: ExtraProject, platformId: string): Promise<void> {
  console.log(`\n── ${proj.companyName} (${proj.status}) ──`)

  const clientId = await getOrCreateClient(proj.email, proj.businessNumber, proj.companyName)

  // 프로젝트 생성/업데이트
  const { data: existing } = await service.from('projects')
    .select('id').eq('client_id', clientId).eq('company_name', proj.companyName)
    .limit(1).single()

  let projectId: string
  const projData = {
    client_id: clientId,
    company_name: proj.companyName,
    category: proj.category,
    platform_id: platformId,
    product_highlights: proj.productHighlights,
    homepage_url: proj.homepage,
    reference_notes: proj.referenceNotes,
    status: proj.status,
  }

  if (existing) {
    projectId = existing.id
    await service.from('projects').update(projData).eq('id', projectId)
    console.log(`  📝 기존 프로젝트 업데이트: ${projectId}`)
  } else {
    const { data: newProj, error } = await service.from('projects').insert(projData).select('id').single()
    if (error || !newProj) throw new Error(`Project insert failed: ${error?.message}`)
    projectId = newProj.id
    console.log(`  ✅ 프로젝트 생성: ${projectId}`)
  }

  // scripts 테이블: script_review 상태라면 스크립트 내용 삽입
  if (proj.status === 'script_review') {
    const content = buildSampleScript(proj)
    const { data: existingScript } = await service.from('scripts')
      .select('id').eq('project_id', projectId).limit(1).single()

    if (existingScript) {
      await service.from('scripts').update({
        content, ai_model: 'claude-sonnet', planner_status: 'pending',
      }).eq('id', existingScript.id)
      console.log(`  📝 스크립트 업데이트`)
    } else {
      await service.from('scripts').insert({
        project_id: projectId, content, ai_model: 'claude-sonnet', planner_status: 'pending', version: 1,
      })
      console.log(`  ✅ 스크립트 생성 (7섹션)`)
    }
  }

  // photo_scheduled 상태: 촬영 관리 페이지에 표시됨 (sample intake_files는 별도 추가 불필요)
  if (proj.status === 'photo_scheduled') {
    // 스크립트도 미리 승인된 상태로 삽입 (촬영 기준 자료)
    const content = buildSampleScript(proj)
    const { data: existingScript } = await service.from('scripts')
      .select('id').eq('project_id', projectId).limit(1).single()

    if (existingScript) {
      await service.from('scripts').update({
        content, ai_model: 'claude-sonnet', planner_status: 'approved',
      }).eq('id', existingScript.id)
    } else {
      await service.from('scripts').insert({
        project_id: projectId, content, ai_model: 'claude-sonnet', planner_status: 'approved', version: 1,
      })
    }
    console.log(`  ✅ 스크립트 (승인됨) + 촬영 예정 상태`)
  }
}

async function main() {
  console.log('=== 추가 데모 데이터 시드 (planner + photography) ===')
  const platformId = await getPlatformId()

  for (const proj of EXTRA_PROJECTS) {
    try { await seedExtra(proj, platformId) } catch (err) {
      console.error(`  ❌ ${proj.companyName} 실패:`, err instanceof Error ? err.message : err)
    }
  }

  console.log('\n=== 완료 ===')
  console.log('\n📌 추가 로그인 정보:')
  for (const p of EXTRA_PROJECTS) {
    console.log(`  ${p.companyName} (${p.status})`)
    console.log(`    이메일: ${p.email}  /  비번: ${p.businessNumber}`)
  }
  console.log('\n📌 관리자 확인:')
  console.log('  /planner — 프리미엄 한우선물세트 (script_review)')
  console.log('  /photography — 제주 감귤청 (photo_scheduled)')
  console.log('  /designer — 소금빵/순대/황태 3건 (design_review)')
}

main().catch(err => { console.error(err); process.exit(1) })
