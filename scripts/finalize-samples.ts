/**
 * 최종 샘플 자동 완성: 쌀과밀·황태이야기를 실제 스크립트 생성 → 승인 → Gemini 초안까지.
 * 더미 스크립트를 실제 AI 생성물로 교체하고 이미지형 상세페이지(섹션 PNG + PDF) 산출.
 * 사용: npx tsx --env-file=.env.local scripts/finalize-samples.ts
 * (tsx가 tsconfig-paths로 @/ 별칭 해석. dev 서버/인증 불필요.)
 */
import { createServiceClient } from '@/lib/supabase/service'
import { generateScriptForProject } from '@/lib/ai/generate-script'
import { generateDesignForProject } from '@/lib/ai/generate-design'

const TARGETS = [
  { id: 'c0ff7994-4c13-4bbf-9ddd-d621bcfd5096', name: '쌀과밀 소금빵', keywords: /소금빵|버터|크러스트|갓 구운|베이커리/ },
  { id: '5b919f67-b9b7-4c43-a33a-108bb05dd5d7', name: '황태이야기', keywords: /황태|대관령|덕장|자연\s*건조|국물/ },
]

function log(msg: string) {
  console.log(`[finalize ${new Date().toISOString().slice(11, 19)}] ${msg}`)
}

async function processProject(pid: string, name: string, keywords: RegExp): Promise<string> {
  const s = createServiceClient()
  log(`▶ ${name} 시작`)

  // 1. intake_submitted로 리셋 (실제 스크립트 재생성 위해)
  await s.from('projects').update({ status: 'intake_submitted' }).eq('id', pid)

  // 2. 누끼 확인 (없으면 돈덕 누끼 재사용)
  const { data: nukki } = await s.from('intake_files').select('id').eq('project_id', pid).eq('file_type', 'product_photo')
  if (!nukki || nukki.length === 0) {
    const { data: donduk } = await s.from('intake_files').select('file_type,storage_path,file_name,mime_type')
      .eq('project_id', '5d2f266f-4f34-4562-9223-6d3050b518b2').eq('file_type', 'product_photo')
    for (const f of donduk ?? []) await s.from('intake_files').insert({ project_id: pid, ...f })
    log(`  누끼 없음 → 돈덕 누끼 ${donduk?.length}장 연결`)
  } else {
    log(`  누끼 ${nukki.length}장 확인`)
  }

  // 3. 실제 스크립트 생성 (Claude Vision)
  log('  스크립트 생성 중...')
  await generateScriptForProject(pid)
  const { data: proj1 } = await s.from('projects').select('status').eq('id', pid).single()
  const { data: sc } = await s.from('scripts').select('id,content,ai_model').eq('project_id', pid)
    .order('created_at', { ascending: false }).limit(1).single()
  const content = sc?.content as { sections?: unknown[] } | null
  const real = keywords.test(JSON.stringify(content)) && sc?.ai_model?.includes('claude')
  log(`  스크립트: status=${proj1?.status} model=${sc?.ai_model} sections=${content?.sections?.length} 제품정보반영=${real ? 'YES' : 'NO'}`)
  if (proj1?.status !== 'script_review' || !sc) return `${name}: ❌ 스크립트 생성 실패`

  // 4. 승인 (planner_status=approved) + photo_uploaded 상태로 (이미지 생성 진입)
  await s.from('scripts').update({ planner_status: 'approved' }).eq('id', sc.id)
  await s.from('projects').update({ status: 'photo_uploaded' }).eq('id', pid)
  log('  승인 완료 → 초안 생성 진입(photo_uploaded)')

  // 5. Gemini 초안 생성 (섹션 이미지 + PDF)
  log('  초안 생성 중(Gemini, 수 분)...')
  await generateDesignForProject(pid)
  const { data: proj2 } = await s.from('projects').select('status').eq('id', pid).single()
  const { data: d } = await s.from('designs').select('id,preview_url,preview_pdf_url,section_images')
    .eq('project_id', pid).order('created_at', { ascending: false }).limit(1).single()
  const si = (d?.section_images as unknown[]) ?? []
  log(`  초안: status=${proj2?.status} 섹션이미지=${si.length}장 PDF=${d?.preview_pdf_url ? 'O' : 'X'}`)

  if (proj2?.status === 'design_review' && si.length > 0) {
    return `${name}: ✅ 완료 (status=design_review, 섹션 ${si.length}장${d?.preview_pdf_url ? '+PDF' : ''})`
  }
  return `${name}: ⚠️ 초안 미완 (status=${proj2?.status}, 섹션 ${si.length})`
}

async function main(): Promise<void> {
  log('=== 최종 샘플 자동 완성 시작 (쌀과밀, 황태) ===')
  const results: string[] = []
  for (const t of TARGETS) {
    try {
      results.push(await processProject(t.id, t.name, t.keywords))
    } catch (err) {
      results.push(`${t.name}: ❌ 예외 — ${(err as Error).message?.slice(0, 200)}`)
    }
  }
  log('=== 결과 요약 ===')
  results.forEach((r) => log(r))
  log('=== DONE ===')
}

main()
