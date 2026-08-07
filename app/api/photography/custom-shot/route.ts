import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { generateScript } from '@/lib/ai/claude'
import { generateDesignImage } from '@/lib/ai/gemini-image'
import { buildShotPrompt } from '@/agents/styling-shots'
import { fetchProductRefFiles } from '@/lib/pipeline-bridge'
import { pickShotReferences } from '@/lib/photography/pick-refs'
import type { StylingShot } from '@/agents/types'
import { NextResponse } from 'next/server'

export const maxDuration = 300

/**
 * 작업 중 추가 스타일링샷 한 장 생성.
 *
 * 디자이너가 "제품을 손으로 들고 있는 컷" 같은 자유 문장을 넣으면, 기존 기획의 톤
 * (style-guide 색·무드 + 이미 만든 샷들의 표현 방식)에 맞춰 샷 규격으로 옮긴 뒤 생성한다.
 * 톤을 맞추는 핵심은 기존 샷 몇 개를 예시로 함께 넘기는 것 — 규칙으로 설명하는 것보다 정확하다.
 *
 * 한 장이라 30초 안팎으로 끝나므로 워커에 넘기지 않고 여기서 바로 만든다(즉시 확인이 목적).
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const role = user.user_metadata?.role as string | undefined
  if (!role || !['admin', 'designer'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { project_id, request: userRequest } = await request.json()
  if (!project_id || typeof project_id !== 'string') {
    return NextResponse.json({ error: 'project_id 누락' }, { status: 400 })
  }
  const wanted = typeof userRequest === 'string' ? userRequest.trim() : ''
  if (!wanted) return NextResponse.json({ error: '어떤 컷이 필요한지 입력해 주세요' }, { status: 400 })
  if (wanted.length > 500) {
    return NextResponse.json({ error: '요청은 500자 이내로 입력해 주세요' }, { status: 400 })
  }

  const svc = createServiceClient()

  // ── 기존 기획의 톤 재료 ────────────────────────────────────────────
  let existingShots: StylingShot[] = []
  let rules: string[] = []
  try {
    const { data } = await svc.storage.from('designs')
      .download(`projects/${project_id}/planning/styling-final-prompts.json`)
    if (data) {
      const json = JSON.parse(await data.text())
      existingShots = (json.shots ?? []).slice(0, 5)
      rules = json.productPreservationRules ?? []
    }
  } catch { /* 기획 전이면 아래에서 막는다 */ }

  if (existingShots.length === 0) {
    return NextResponse.json(
      { error: '기존 스타일링 기획이 없습니다. 디자인 기획을 먼저 완료해 주세요.' },
      { status: 400 },
    )
  }

  let styleGuide: Record<string, unknown> = {}
  try {
    const { data } = await svc.storage.from('designs')
      .download(`projects/${project_id}/planning/style-guide.json`)
    if (data) styleGuide = JSON.parse(await data.text())
  } catch { /* 없으면 색 힌트 없이 진행 */ }

  const { data: project } = await svc
    .from('projects').select('category, product_name, platforms(slug)').eq('id', project_id).single()

  // ── 자유 문장 → 샷 규격 (기존 샷을 예시로 줘서 톤을 맞춘다) ────────
  const brand = (styleGuide.brand ?? {}) as { moodKeywords?: string[]; targetEmotion?: string }
  const colors = (styleGuide.colors ?? {}) as Record<string, string>

  const system = `너는 한국 이커머스 상세페이지 스타일링샷을 기획하는 아트디렉터다.
디자이너가 요청한 추가 컷 한 장을, 이미 확정된 이 프로젝트의 톤에 맞춰 촬영 규격으로 옮겨라.

[반드시 지킬 것]
- 아래 기존 샷들과 같은 세계관·조명·소품 결을 유지하라. 새 스타일을 만들지 마라.
- 디자이너의 요청 내용은 composition에 충실히 반영하라. 요청을 바꾸거나 확장하지 마라.
- JSON 하나만 출력하라. 코드펜스·설명 금지.

[출력 스키마]
{"name":"영문 소문자 스네이크 짧은 이름","filename":"위 이름.png","composition":"구도와 피사체 배치를 영어로 구체적으로","surface":"바닥·표면 재질 영어로","props":["소품 영어로"],"lighting":"조명 영어로","camera":"카메라 앵글·렌즈 영어로","mood":"무드 영어로"}`

  const userPrompt = `[제품] ${project?.product_name ?? '-'} (카테고리: ${project?.category ?? '-'})
[브랜드 무드] ${(brand.moodKeywords ?? []).join(', ') || '-'} / ${brand.targetEmotion ?? '-'}
[브랜드 색] primary ${colors.primary ?? '-'}, accent ${colors.accent ?? '-'}

[이미 확정된 기존 샷들 — 이 톤을 그대로 따를 것]
${JSON.stringify(existingShots, null, 1)}

[디자이너가 요청한 추가 컷]
${wanted}`

  let shot: StylingShot
  try {
    const raw = await generateScript(system, userPrompt)
    const json = raw.trim().replace(/^```(?:json)?\s*|\s*```$/g, '')
    const parsed = JSON.parse(json) as Partial<StylingShot>
    if (!parsed.composition) throw new Error('composition 없음')
    // 파일명은 서버가 정한다 — 모델이 준 이름을 그대로 쓰면 기존 컷을 덮어쓸 수 있다
    const stamp = Date.now().toString(36)
    const safe = (parsed.name ?? 'custom').replace(/[^a-z0-9_-]/gi, '').slice(0, 40) || 'custom'
    shot = {
      name: `${safe}_${stamp}`,
      filename: `custom_${safe}_${stamp}.png`,
      composition: parsed.composition,
      surface: parsed.surface ?? '',
      props: Array.isArray(parsed.props) ? parsed.props : [],
      lighting: parsed.lighting ?? '',
      camera: parsed.camera ?? '',
      mood: parsed.mood ?? '',
    }
  } catch (e) {
    return NextResponse.json(
      { error: `요청을 촬영 규격으로 옮기지 못했습니다: ${(e as Error).message.slice(0, 120)}` },
      { status: 500 },
    )
  }

  // ── 제품 레퍼런스(누끼 우선) ───────────────────────────────────────
  const files = await fetchProductRefFiles(svc, project_id)
  const refs: string[] = []
  const names: string[] = []
  for (const f of files ?? []) {
    try {
      const { data } = await svc.storage.from('intake-files').download(f.storage_path)
      if (data) {
        refs.push(Buffer.from(await data.arrayBuffer()).toString('base64'))
        names.push(String((f as { file_name?: string }).file_name ?? ''))
      }
    } catch { /* 개별 실패는 건너뛴다 */ }
  }
  const picked = pickShotReferences(`${shot.name} ${shot.composition}`, names)
    .map((i) => refs[i]).filter(Boolean)

  // ── 생성 ──────────────────────────────────────────────────────────
  try {
    const meta = {
      category: project?.category ?? 'food',
      platform: (project as { platforms?: { slug?: string } } | null)?.platforms?.slug ?? 'smartstore',
      aspectRatio: '3:4',
      brandColorHex: colors.primary,
    }
    const buf = await generateDesignImage({
      prompt: buildShotPrompt(shot, rules, meta),
      referenceImages: picked.length > 0 ? picked : refs.slice(0, 3),
      aspectRatio: '3:4',
      model: 'pro',
    })
    const path = `projects/${project_id}/styling_real/${shot.filename}`
    const { error } = await svc.storage.from('designs')
      .upload(path, buf, { contentType: 'image/png', upsert: true })
    if (error) throw new Error(error.message)
    const { data: pub } = svc.storage.from('designs').getPublicUrl(path)
    return NextResponse.json({ success: true, name: shot.name, url: pub.publicUrl, composition: shot.composition })
  } catch (e) {
    return NextResponse.json(
      { error: `이미지 생성 실패: ${(e as Error).message.slice(0, 160)}` },
      { status: 500 },
    )
  }
}
