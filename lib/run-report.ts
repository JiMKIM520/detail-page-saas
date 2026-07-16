/**
 * 런 리포트 수집기 — 파이프라인 1회 실행의 게이트 발동·QA·평가·이미지 활용·시각 감사를
 * 구조화해 projects/{id}/run-report.json으로 남긴다.
 * 200사 운영 원칙: 운영자는 전 건을 열어보지 않는다 — 리포트에 경고가 있는 건만 확인한다.
 * projectId 키로 버퍼를 격리해 동시 실행(서버 환경)에도 섞이지 않는다. 컴포저처럼 projectId를
 * 모르는 계층은 activeProject(파이프라인 진입 시 지정)로 기록한다 — 로컬 러너는 단일 실행이라 안전.
 */

export interface ReportEntry {
  at: string
  kind: string
  data: Record<string, unknown>
}

const buffers = new Map<string, ReportEntry[]>()
let activeProject: string | null = null

export function reportStart(projectId: string): void {
  activeProject = projectId
  buffers.set(projectId, [])
}

export function reportAdd(kind: string, data: Record<string, unknown>, projectId?: string): void {
  const pid = projectId ?? activeProject
  if (!pid) return
  buffers.get(pid)?.push({ at: new Date().toISOString(), kind, data })
}

/** 경고성 항목 여부 — 운영자 확인이 필요한 신호의 단일 정의 */
function isWarning(e: ReportEntry): boolean {
  if (e.kind === 'visual-audit' || e.kind === 'visual-audit-rework')
    return e.data.ran === false || e.data.pass === false
  if (e.kind === 'image-usage') return Boolean(e.data.belowMinimum)
  if (e.kind === 'evaluator') return e.data.pass === false
  if (e.kind === 'rule-check') return Boolean((e.data as any)?.violations?.length)
  return false
}

export interface RunReport {
  projectId: string
  finishedAt: string
  warnings: string[]
  entries: ReportEntry[]
}

export function reportFinish(projectId: string): RunReport {
  const entries = buffers.get(projectId) ?? []
  buffers.delete(projectId)
  if (activeProject === projectId) activeProject = null
  const warnings = entries.filter(isWarning).map((e) => `${e.kind}: ${JSON.stringify(e.data).slice(0, 220)}`)
  return { projectId, finishedAt: new Date().toISOString(), warnings, entries }
}
