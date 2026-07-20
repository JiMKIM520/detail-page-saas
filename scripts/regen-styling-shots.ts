/**
 * 스타일링샷만 재생성 — 저장된 기획(styling-final-prompts.json)으로 컷을 다시 만든다.
 *
 * 왜 필요한가: 기획(플래너+샷 프롬프터)은 20분 넘게 걸리는데, 이미지 생성은 네트워크가 흔들리면
 * 통째로 실패한다(2026-07-20 실사례: fetch failed로 12컷 중 1컷만 생성). 기획을 다시 돌리지 않고
 * 컷만 복구하는 경로가 없으면 매번 전체 재실행이라 비용·시간이 낭비된다.
 *
 * 사용: npx tsx --env-file=.env.local scripts/regen-styling-shots.ts <회사명 부분일치> [--only=need_hero_main]
 */
import { createServiceClient } from '@/lib/supabase/service'
import { generateDesignImage } from '@/lib/ai/gemini-image'
import { buildShotPrompt, ensureHeroFraming } from '@/agents/styling-shots'
import { pickShotReferences } from '@/lib/photography/pick-refs'

const ARG = process.argv[2]
const ONLY = process.argv.find((a) => a.startsWith('--only='))?.split('=')[1]
if (!ARG) {
  console.error('사용: regen-styling-shots.ts <회사명> [--only=<파일명 일부>]')
  process.exit(1)
}

/** 네트워크 실패는 재시도로 흡수 — 지수 백오프 3회 */
async function withRetry<T>(label: string, fn: () => Promise<T>): Promise<T | null> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await fn()
    } catch (e) {
      const msg = (e as Error).message?.slice(0, 120) ?? 'unknown'
      if (attempt === 3) {
        console.warn(`  ✗ ${label}: ${msg}`)
        return null
      }
      const wait = attempt * 5000
      console.warn(`  … ${label} 실패(${attempt}/3) — ${wait / 1000}초 후 재시도: ${msg}`)
      await new Promise((r) => setTimeout(r, wait))
    }
  }
  return null
}

async function main(): Promise<void> {
  const svc = createServiceClient()
  const { data: projs } = await svc.from('projects').select('id, company_name, category, platforms(slug)').order('created_at')
  const p = (projs ?? []).find((x) =>
    String(x.company_name).replace(/\s+/g, '').includes(ARG.replace(/\s+/g, '')),
  )
  if (!p) {
    console.error(`프로젝트 못 찾음: ${ARG}`)
    process.exit(1)
  }
  const pid = p.id as string
  console.log(`\n══ 스타일링샷 재생성: ${p.company_name} (${pid.slice(0, 8)}) ══`)

  const { data: blob } = await svc.storage.from('designs').download(`projects/${pid}/planning/styling-final-prompts.json`)
  if (!blob) {
    console.error('styling-final-prompts.json 없음 — 기획을 먼저 실행하세요')
    process.exit(1)
  }
  const json = JSON.parse(await blob.text()) as {
    shots?: Array<Record<string, unknown>>
    productPreservationRules?: string[]
  }
  const shots = (json.shots ?? []).filter((s) => !ONLY || String(s.filename ?? '').includes(ONLY))
  const rules = json.productPreservationRules ?? []
  console.log(`대상 ${shots.length}컷${ONLY ? ` (필터: ${ONLY})` : ''}`)

  // 레퍼런스(업로드 원본) 로드
  const { data: files } = await svc
    .from('intake_files')
    .select('storage_path, file_name')
    .eq('project_id', pid)
    .eq('file_type', 'product_photo')
    .order('created_at')
  const nukki: string[] = []
  const photoNames: string[] = []
  for (const f of files ?? []) {
    const { data: b } = await svc.storage.from('intake-files').download(f.storage_path)
    if (b) {
      nukki.push(Buffer.from(await b.arrayBuffer()).toString('base64'))
      photoNames.push(String((f as { file_name?: string }).file_name ?? ''))
    }
  }
  const meta = {
    category: (p as { category?: string }).category ?? 'food',
    platform: (p as { platforms?: { slug?: string } }).platforms?.slug ?? 'smartstore',
    aspectRatio: '3:4' as const,
  }

  let ok = 0
  for (const shot of shots) {
    const name = String(shot.name ?? shot.filename ?? '?')
    const filename = String(shot.filename ?? `${name}.png`)
    const base =
      shot.finalPrompt && /\[OUTPUT SPECS\]/.test(String(shot.finalPrompt))
        ? String(shot.finalPrompt)
        : buildShotPrompt(shot as never, rules, meta as never)
    // 히어로 프레이밍 규칙 보장 (룰 7-11) — 샷 프롬프터 산출물은 이 규칙을 담지 않는다
    const prompt = ensureHeroFraming(base, { name, filename })
    const refIdx = pickShotReferences(`${name} ${filename}`, photoNames)
    const refs = shot.withProduct === false ? [] : refIdx.map((i) => nukki[i]).filter(Boolean)
    console.log(`[regen] ${name}…`)
    const buf = await withRetry(name, () =>
      generateDesignImage({
        prompt,
        referenceImages: refs,
        aspectRatio: '3:4',
        model: shot.prominence === 'support' ? 'nb2' : 'pro',
      }),
    )
    if (!buf) continue
    const path = `projects/${pid}/styling_real/${filename}`
    const { error } = await svc.storage.from('designs').upload(path, buf, { contentType: 'image/png', upsert: true })
    if (error) {
      console.warn(`  ✗ 업로드 실패 ${filename}: ${error.message}`)
      continue
    }
    ok++
  }

  // 이번 기획에 속하지 않는 구 컷 정리 — 니즈-샷 체계 불일치 예방(--only 실행 시에는 건너뛴다)
  if (ok > 0 && !ONLY) {
    const valid = new Set((json.shots ?? []).map((s) => String(s.filename ?? `${s.name}.png`)))
    const { data: existing } = await svc.storage.from('designs').list(`projects/${pid}/styling_real`)
    const stale = (existing ?? [])
      .filter((f) => f.name && !valid.has(f.name))
      .map((f) => `projects/${pid}/styling_real/${f.name}`)
    if (stale.length) {
      await svc.storage.from('designs').remove(stale)
      console.log(`[regen] 구 컷 ${stale.length}장 정리`)
    }
  }

  console.log(`\n[regen] 완료 — ${ok}/${shots.length}컷`)
  process.exit(ok === shots.length ? 0 : 1)
}

main().catch((e) => {
  console.error('[regen] 예외:', e)
  process.exit(1)
})
