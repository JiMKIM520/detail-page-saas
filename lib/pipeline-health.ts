import { createServiceClient } from '@/lib/supabase/service'

/**
 * 파이프라인 이상 징후 조회.
 *
 * 오늘 드러난 결함 셋은 모두 "겉보기엔 정상"이었다 — 샷이 절반만 만들어져도 완료로 넘어갔고,
 * 실패한 잡은 DB에만 남아 화면 어디에도 뜨지 않았으며, 함수가 끊긴 프로젝트는 생성 중인 채
 * 방치됐다. 200개 기업을 무인으로 돌리려면 이런 것들이 먼저 눈에 띄어야 한다.
 */

/** 이 상태로 오래 머물면 멈춘 것으로 본다 — 실측 소요는 기획 6분·조립 5~20분 */
const WORKING_STATUSES = ['script_generating', 'design_planning', 'design_generating'] as const
const STUCK_MINUTES = 45

export interface HealthIssue {
  kind: 'failed' | 'stuck'
  projectId: string
  companyName: string
  /** 실패한 작업 종류 또는 멈춘 상태 */
  detail: string
  /** 실패 사유(있을 때) */
  reason?: string
  /** 얼마나 지났는지(분) */
  minutesAgo: number
}

const KIND_LABEL: Record<string, string> = {
  script: '스크립트 생성',
  planning: '디자인 기획',
  shots: '스타일링샷',
  draft: '초안 조립',
}

const STATUS_LABEL: Record<string, string> = {
  script_generating: '스크립트 생성 중',
  design_planning: '디자인 기획 중',
  design_generating: '초안 조립 중',
}

function minutesSince(iso: string | null): number {
  if (!iso) return 0
  return Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
}

export async function fetchPipelineHealth(): Promise<HealthIssue[]> {
  const svc = createServiceClient()
  const issues: HealthIssue[] = []

  // ── 실패한 작업 ────────────────────────────────────────────────
  const { data: failed } = await svc
    .from('jobs')
    .select('project_id, kind, error, finished_at, projects(company_name)')
    .eq('status', 'failed')
    .order('finished_at', { ascending: false })
    .limit(20)

  for (const j of failed ?? []) {
    const row = j as unknown as {
      project_id: string; kind: string; error: string | null; finished_at: string | null
      projects: { company_name: string } | null
    }
    issues.push({
      kind: 'failed',
      projectId: row.project_id,
      companyName: row.projects?.company_name ?? '(이름없음)',
      detail: KIND_LABEL[row.kind] ?? row.kind,
      reason: row.error?.slice(0, 120) ?? undefined,
      minutesAgo: minutesSince(row.finished_at),
    })
  }

  // ── 생성 중인 채로 멈춘 프로젝트 ───────────────────────────────
  const cutoff = new Date(Date.now() - STUCK_MINUTES * 60_000).toISOString()
  const { data: stuck } = await svc
    .from('projects')
    .select('id, company_name, status, updated_at')
    .in('status', WORKING_STATUSES as unknown as string[])
    .lt('updated_at', cutoff)

  for (const p of stuck ?? []) {
    const row = p as { id: string; company_name: string; status: string; updated_at: string }
    issues.push({
      kind: 'stuck',
      projectId: row.id,
      companyName: row.company_name,
      detail: STATUS_LABEL[row.status] ?? row.status,
      minutesAgo: minutesSince(row.updated_at),
    })
  }

  // 오래된 것일수록 방치된 것이므로 위로 올린다
  return issues.sort((a, b) => b.minutesAgo - a.minutesAgo)
}
