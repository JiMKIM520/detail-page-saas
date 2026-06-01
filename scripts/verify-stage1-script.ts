/**
 * 파이프라인 1단계 검증: Claude 스크립트 생성 (DB 미접촉)
 * 실제 차별화 프롬프트(category×platform)로 진짜 제품 입력을 Claude에 보내
 * 유효한 스크립트 JSON이 생성되는지만 검증한다. Supabase 쓰기 없음.
 *
 * 사용: npx tsx --env-file=.env.local scripts/verify-stage1-script.ts
 */
import { generateScript } from '../lib/ai/claude'
import { buildDifferentiatedSystemPrompt, buildEnhancedUserPrompt } from '../lib/ai/prompts/builder'

const CATEGORY_SLUG = 'food'
const PLATFORM_SLUG = '11st'

const REAL_INPUT = {
  company_name: '황태이야기',
  brand_name: '황태이야기',
  product_highlights: '대관령 황태덕장 직송\n3개월 자연 건조\n진하고 깊은 황태국 맛\n국내 가공, 무방부제',
  category_name: '식품',
  platform_name: '11번가',
  platform_style_guide: '',
  homepage_url: null,
  detail_page_url: null,
  reference_notes: null,
  target_audience: ['40-60대 주부', '건강식 관심 소비자'],
  design_preference: null,
}

function preview(v: unknown, n = 600): string {
  const s = typeof v === 'string' ? v : JSON.stringify(v, null, 2)
  return s.length > n ? s.slice(0, n) + ` …(+${s.length - n} chars)` : s
}

async function main(): Promise<void> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('FAIL: ANTHROPIC_API_KEY 없음 (--env-file=.env.local 필요)')
    process.exit(1)
  }

  const systemPrompt = buildDifferentiatedSystemPrompt(CATEGORY_SLUG, PLATFORM_SLUG)
  const userPrompt = buildEnhancedUserPrompt(REAL_INPUT)

  console.log('=== 1단계 검증: Claude 스크립트 생성 ===')
  console.log(`category=${CATEGORY_SLUG}  platform=${PLATFORM_SLUG}  company=${REAL_INPUT.company_name}`)
  console.log(`systemPrompt 길이: ${systemPrompt.length}자 / userPrompt 길이: ${userPrompt.length}자`)
  console.log('Claude 호출 중...\n')

  const t0 = Date.now()
  let raw: string
  try {
    raw = await generateScript(systemPrompt, userPrompt)
  } catch (err) {
    console.error('FAIL: Claude 호출 자체 실패')
    console.error('  status:', (err as { status?: number }).status)
    console.error('  name  :', (err as Error).name)
    console.error('  msg   :', (err as Error).message?.slice(0, 400))
    process.exit(2)
  }
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1)

  console.log(`Claude 응답 수신 (${elapsed}s, ${raw.length}자)`)

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch (e) {
    console.error('\nFAIL: 응답이 유효한 JSON이 아님 (앱은 이 경우 1회 재시도 후 실패 처리)')
    console.error('  parse error:', (e as Error).message)
    console.error('  raw 앞부분:\n' + preview(raw, 800))
    process.exit(3)
  }

  // 구조 검증
  const obj = parsed as Record<string, unknown>
  const sections = obj.sections as unknown[] | undefined
  const issues: string[] = []
  if (!Array.isArray(sections)) issues.push('sections 배열 없음')
  else if (sections.length === 0) issues.push('sections 비어 있음')
  if (!obj.tone) issues.push('tone 없음')

  // 더미 여부 휴리스틱: 진짜 제품 키워드(황태/대관령/덕장)가 본문에 등장하는지
  const flat = JSON.stringify(parsed)
  const hasRealContent = /황태|대관령|덕장|자연\s*건조/.test(flat)

  console.log('\n--- 검증 결과 ---')
  console.log(`sections 개수 : ${Array.isArray(sections) ? sections.length : 'N/A'}`)
  console.log(`tone          : ${String(obj.tone ?? 'N/A')}`)
  console.log(`실제 제품정보 반영(황태/대관령 등): ${hasRealContent ? 'YES ✅' : 'NO ⚠️ (더미일 가능성)'}`)
  console.log(`구조 이슈      : ${issues.length === 0 ? '없음 ✅' : issues.join(', ') + ' ⚠️'}`)
  console.log('\n--- 생성 스크립트 미리보기 ---')
  console.log(preview(parsed, 1200))

  if (issues.length === 0 && hasRealContent) {
    console.log('\nPASS ✅ — 1단계(Claude 스크립트 생성) 실제 동작 확인. 진짜 제품 정보가 반영된 유효 JSON 생성됨.')
    process.exit(0)
  } else {
    console.log('\nPARTIAL ⚠️ — 호출/파싱은 됐으나 구조/내용 점검 필요 (위 이슈 참고).')
    process.exit(0)
  }
}

main()
