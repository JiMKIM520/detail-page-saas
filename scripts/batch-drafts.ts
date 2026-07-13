/**
 * 배치 초안 러너 — 200사 운영의 실행 뼈대.
 *   사용: env -u ANTHROPIC_API_KEY tsx --env-file=.env.local scripts/batch-drafts.ts 회사1 회사2 … [--from-pipeline]
 * 순차 실행(동시 실행은 출력 토큰 한도 경합 실사례) + 실패 자동 재시도 1회 + 종료 요약표.
 * 요약은 각 프로젝트의 run-report.json(warnings)을 함께 읽는다 — 운영자는 경고 건만 열어본다.
 */
import { spawnSync } from 'node:child_process'
import { createServiceClient } from '@/lib/supabase/service'

const args = process.argv.slice(2)
const FROM_PIPELINE = args.includes('--from-pipeline')
const companies = args.filter((a) => !a.startsWith('--'))
if (companies.length === 0) {
  console.error('사용: batch-drafts.ts <회사명…> [--from-pipeline]')
  process.exit(1)
}

interface RowResult {
  company: string
  ok: boolean
  retried: boolean
  minutes: number
  warnings: string[]
}

function runOne(company: string): { ok: boolean; minutes: number } {
  const t0 = Date.now()
  const cmd = ['--env-file=.env.local', 'scripts/e2e-service.ts', company, ...(FROM_PIPELINE ? ['--from-pipeline'] : [])]
  const r = spawnSync('node_modules/.bin/tsx', cmd, {
    stdio: 'inherit',
    env: { ...process.env, ANTHROPIC_API_KEY: undefined } as NodeJS.ProcessEnv,
  })
  return { ok: r.status === 0, minutes: Math.round((Date.now() - t0) / 6000) / 10 }
}

async function warningsOf(company: string): Promise<string[]> {
  try {
    const svc = createServiceClient()
    const { data: projs } = await svc.from('projects').select('id, company_name').order('created_at')
    const p = (projs ?? []).find((x) => String(x.company_name).replace(/\s+/g, '').includes(company.replace(/\s+/g, '')))
    if (!p) return ['프로젝트 미발견']
    const { data: blob } = await svc.storage.from('designs').download(`projects/${p.id}/run-report.json`)
    if (!blob) return ['런 리포트 없음']
    const report = JSON.parse(await blob.text()) as { warnings?: string[] }
    return report.warnings ?? []
  } catch (e) {
    return [`리포트 조회 실패: ${(e as Error).message?.slice(0, 60)}`]
  }
}

async function main(): Promise<void> {
  const rows: RowResult[] = []
  for (const company of companies) {
    console.log(`\n${'#'.repeat(10)} [${company}] 시작 (${rows.length + 1}/${companies.length}) ${'#'.repeat(10)}`)
    let { ok, minutes } = runOne(company)
    let retried = false
    if (!ok) {
      console.warn(`[batch] ${company} 실패 → 자동 재시도 1회 (--from-pipeline로 산출물 재사용)`)
      retried = true
      const retry = spawnSync(
        'node_modules/.bin/tsx',
        ['--env-file=.env.local', 'scripts/e2e-service.ts', company, '--from-pipeline'],
        { stdio: 'inherit', env: { ...process.env, ANTHROPIC_API_KEY: undefined } as NodeJS.ProcessEnv },
      )
      ok = retry.status === 0
    }
    rows.push({ company, ok, retried, minutes, warnings: await warningsOf(company) })
  }

  console.log(`\n${'='.repeat(64)}\n배치 요약 — ${rows.length}건\n${'='.repeat(64)}`)
  for (const r of rows) {
    const flag = !r.ok ? '❌ 실패' : r.warnings.length ? `⚠ 경고 ${r.warnings.length}` : '✅ 통과'
    console.log(`${flag} | ${r.company} | ${r.minutes}분${r.retried ? ' (재시도)' : ''}`)
    for (const w of r.warnings) console.log(`    - ${w.slice(0, 160)}`)
  }
  const bad = rows.filter((r) => !r.ok).length
  const warn = rows.filter((r) => r.ok && r.warnings.length).length
  console.log(`\n운영자 확인 필요: 실패 ${bad}건 · 경고 ${warn}건 / 무확인 통과 ${rows.length - bad - warn}건`)
  process.exit(bad > 0 ? 1 : 0)
}

main()
