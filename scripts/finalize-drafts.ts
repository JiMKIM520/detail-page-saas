/**
 * 초안 전용 재실행: 이미 실제 승인 스크립트 + photo_uploaded인 프로젝트에 generateDesignForProject 실행.
 * (.single() 중복 승인 버그 수정 후 재시도용)
 * 사용: npx tsx --env-file=.env.local scripts/finalize-drafts.ts
 */
import { createServiceClient } from '@/lib/supabase/service'
import { generateDesignForProject } from '@/lib/ai/generate-design'

const TARGETS = [
  { id: 'c0ff7994-4c13-4bbf-9ddd-d621bcfd5096', name: '쌀과밀 소금빵' },
  { id: '5b919f67-b9b7-4c43-a33a-108bb05dd5d7', name: '황태이야기' },
]
function log(m: string) { console.log(`[drafts ${new Date().toISOString().slice(11, 19)}] ${m}`) }

async function main(): Promise<void> {
  const s = createServiceClient()
  const results: string[] = []
  for (const t of TARGETS) {
    try {
      log(`▶ ${t.name} 초안 생성`)
      // design_generating은 photo_uploaded에서만 유효 → 보장
      await s.from('projects').update({ status: 'photo_uploaded' }).eq('id', t.id)
      log('  초안 생성 중(Gemini, 수 분)...')
      await generateDesignForProject(t.id)
      const { data: p } = await s.from('projects').select('status').eq('id', t.id).single()
      const { data: d } = await (s.from('designs') as any).select('preview_url,preview_pdf_url,section_images')
        .eq('project_id', t.id).order('created_at', { ascending: false }).limit(1).single()
      const si = ((d as any)?.section_images as unknown[]) ?? []
      const r = p?.status === 'design_review' && si.length > 0
        ? `${t.name}: ✅ design_review, 섹션 ${si.length}장${d?.preview_pdf_url ? '+PDF' : ''}`
        : `${t.name}: ⚠️ status=${p?.status}, 섹션 ${si.length}`
      log(`  ${r}`)
      results.push(r)
    } catch (err) {
      results.push(`${t.name}: ❌ ${(err as Error).message?.slice(0, 200)}`)
    }
  }
  log('=== 결과 ===')
  results.forEach((r) => log(r))
  log('=== DONE ===')
}
main()
