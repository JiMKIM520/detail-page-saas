/**
 * Codex Watchdog hourly check.
 *
 * Read-only checks against git + Supabase, then writes markdown summaries to:
 * - docs/CODEX-WATCHDOG.md between AUTO-CHECK markers
 * - docs/CODEX-WATCHDOG-RUNS.md append-only history
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/codex-watchdog.ts
 */
import { createClient } from '@supabase/supabase-js'
import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

const ROOT = process.cwd()
const WATCHDOG = path.join(ROOT, 'docs/CODEX-WATCHDOG.md')
const RUNS = path.join(ROOT, 'docs/CODEX-WATCHDOG-RUNS.md')

const PROJECTS = [
  { id: '5d2f266f-4f34-4562-9223-6d3050b518b2', name: '돈덕 순대' },
  { id: 'c0ff7994-4c13-4bbf-9ddd-d621bcfd5096', name: '쌀과밀 소금빵' },
  { id: '5b919f67-b9b7-4c43-a33a-108bb05dd5d7', name: '황태이야기' },
  { id: '6eee52ac-696b-4e54-b170-66a68a42d870', name: '청정원 흑마늘진액' },
]

type ProjectRow = {
  id: string
  company_name: string
  status: string
  updated_at: string
}

type ScriptRow = {
  id: string
  ai_model: string | null
  planner_status: string | null
  content: { sections?: unknown[] } | null
  created_at: string
}

type DesignRow = {
  id: string
  preview_url: string | null
  preview_pdf_url: string | null
  output_url: string | null
  designer_status: string | null
  section_images: unknown[] | null
  created_at: string
}

type PhotoRow = {
  id: string
  photo_type: string
  storage_path: string
}

function sh(command: string): string {
  return execSync(command, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
}

function parseOutputUrl(value: string | null): Record<string, string> {
  if (!value) return {}
  try {
    const parsed = JSON.parse(value)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return { legacy: value }
  }
}

function isImageUrl(value: string | null): boolean {
  return !!value && /\.(png|jpe?g|webp|gif)(\?|$)/i.test(value)
}

function line(value: unknown): string {
  return String(value ?? '-').replace(/\n/g, ' ')
}

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY 누락')
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } })
  const now = new Date().toISOString()
  const commit = sh('git log --oneline -n 1')
  const status = sh('git status --short') || '(clean)'

  const projectBlocks: string[] = []
  const findings: string[] = []

  for (const target of PROJECTS) {
    const { data: project } = await supabase
      .from('projects')
      .select('id,company_name,status,updated_at')
      .eq('id', target.id)
      .single<ProjectRow>()

    const { data: scripts } = await supabase
      .from('scripts')
      .select('id,ai_model,planner_status,content,created_at')
      .eq('project_id', target.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .returns<ScriptRow[]>()

    const { data: designs } = await supabase
      .from('designs')
      .select('id,preview_url,preview_pdf_url,output_url,designer_status,section_images,created_at')
      .eq('project_id', target.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .returns<DesignRow[]>()

    const { data: photos } = await supabase
      .from('photos')
      .select('id,photo_type,storage_path')
      .eq('project_id', target.id)
      .returns<PhotoRow[]>()

    const script = scripts?.[0] ?? null
    const design = designs?.[0] ?? null
    const allPhotos = photos ?? []
    const uploaded = allPhotos.filter((p) => p.storage_path).length
    const output = parseOutputUrl(design?.output_url ?? null)
    const sections = Array.isArray(design?.section_images) ? design.section_images.length : 0
    const scriptSections = Array.isArray(script?.content?.sections) ? script.content.sections.length : 0
    const scriptFlat = JSON.stringify(script?.content ?? {})
    const dummy = /더미|테스트용|데모용 스크립트|설명1|강점1/.test(scriptFlat)

    const localIssues: string[] = []
    if (!project) localIssues.push('project row 없음')
    if (!script) localIssues.push('script row 없음')
    if (script && !script.ai_model?.includes('claude')) localIssues.push(`script model이 Claude 아님: ${script.ai_model}`)
    if (dummy) localIssues.push('script에 더미 흔적 있음')
    if (!design) localIssues.push('design row 없음')
    if (design?.preview_url && !isImageUrl(design.preview_url)) localIssues.push(`preview_url이 이미지가 아님: ${design.preview_url}`)
    if (design && sections === 0) localIssues.push('section_images 없음')
    if (project?.status === 'delivered' && Object.keys(output).length === 0) {
      localIssues.push('delivered인데 output_url 다운로드 링크 없음')
    }
    if (project?.status === 'design_review' && Object.keys(output).length > 0) {
      localIssues.push('output_url은 있으나 design_review라 사업자 다운로드 UI에서 숨겨질 수 있음')
    }
    if ((project?.status === 'prompt_ready' || project?.status === 'design_review') && allPhotos.length > 0 && uploaded < allPhotos.length) {
      localIssues.push(`photos 슬롯 ${allPhotos.length}개 중 업로드 ${uploaded}개`)
    }
    if (allPhotos.length === 0 && design) {
      localIssues.push('photos=0 상태에서 design 존재: 업로드 스타일링샷 검증 증거로 보기 어려움')
    }

    findings.push(...localIssues.map((issue) => `- ${target.name}: ${issue}`))

    projectBlocks.push([
      `| ${target.name} | ${line(project?.status)} | ${line(script?.ai_model)} / ${scriptSections}섹션 | ${isImageUrl(design?.preview_url ?? null) ? 'image' : line(design?.preview_url ? 'non-image' : 'none')} | ${sections} | ${Object.keys(output).join(', ') || '-'} | ${uploaded}/${allPhotos.length} | ${localIssues.length ? localIssues.join('<br>') : 'OK'} |`,
    ].join('\n'))
  }

  const summary = [
    '<!-- CODEX-WATCHDOG:AUTO-CHECK:START -->',
    '## 최근 자동 점검 요약',
    '',
    `- 점검 시각: ${now}`,
    `- HEAD: \`${commit}\``,
    `- worktree: \`${status}\``,
    `- 발견 이슈: ${findings.length}건`,
    '',
    '| 프로젝트 | status | script | preview | section_images | output_url keys | photos | 판정 |',
    '|---|---|---|---|---:|---|---:|---|',
    ...projectBlocks,
    '',
    findings.length ? '### 발견 이슈' : '### 발견 이슈 없음',
    ...(findings.length ? findings : ['- 현재 자동 기준에서는 새 이슈 없음']),
    '<!-- CODEX-WATCHDOG:AUTO-CHECK:END -->',
    '',
  ].join('\n')

  const runBlock = [
    `## ${now}`,
    '',
    `- HEAD: \`${commit}\``,
    `- worktree: \`${status}\``,
    `- 발견 이슈: ${findings.length}건`,
    '',
    '| 프로젝트 | status | script | preview | section_images | output_url keys | photos | 판정 |',
    '|---|---|---|---|---:|---|---:|---|',
    ...projectBlocks,
    '',
    ...(findings.length ? ['### 발견 이슈', ...findings] : ['### 발견 이슈 없음', '- 현재 자동 기준에서는 새 이슈 없음']),
    '',
  ].join('\n')

  const current = fs.readFileSync(WATCHDOG, 'utf8')
  const markerPattern = /<!-- CODEX-WATCHDOG:AUTO-CHECK:START -->[\s\S]*?<!-- CODEX-WATCHDOG:AUTO-CHECK:END -->\n?/m
  const next = markerPattern.test(current)
    ? current.replace(markerPattern, summary)
    : current.replace('## 2026-06-01 반복 문제', `${summary}## 2026-06-01 반복 문제`)
  fs.writeFileSync(WATCHDOG, next)

  if (!fs.existsSync(RUNS)) {
    fs.writeFileSync(RUNS, '# Codex Watchdog Runs\n\n')
  }
  fs.appendFileSync(RUNS, runBlock)

  console.log(summary)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
