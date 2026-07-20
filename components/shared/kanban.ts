/**
 * 칸반 공용 정렬·유틸 — S2 (2026-07-20)
 * 규칙: 태그 보유 카드(hold·revise·revision_n·rewrite)는 최상단 점유.
 *       우선순위: hold > revise > revision_n > rewrite, 이후 도착순(created_at asc).
 */

import type { ProjectStatus } from '@/lib/status-machine'

export type ProjectTags = {
  hold?: boolean
  revise?: boolean
  revision_n?: boolean
  rewrite?: boolean
  reviewing?: boolean
  [key: string]: boolean | undefined
}

/** KanbanCard 에 필요한 최소 프로젝트 형태 */
export interface KanbanProject {
  id: string
  company_name: string
  status: ProjectStatus
  designer_id: string | null
  designer_name?: string | null
  created_at: string
  due_date?: string | null
  tags?: ProjectTags | null
  product_received_at?: string | null
  platforms?: { name?: string } | null
  category?: string | null
}

/** 태그 우선순위 (높을수록 최상단) */
function tagPriority(tags: ProjectTags | null | undefined): number {
  if (!tags) return 0
  if (tags.hold) return 4
  if (tags.revise) return 3
  if (tags.revision_n) return 2
  if (tags.rewrite) return 1
  return 0
}

/** 카드 배열을 태그 우선순위 → created_at 오름차순(도착순)으로 정렬 */
export function sortKanbanCards<T extends { tags?: unknown; created_at: string }>(
  cards: T[]
): T[] {
  return [...cards].sort((a, b) => {
    const pa = tagPriority(a.tags as ProjectTags)
    const pb = tagPriority(b.tags as ProjectTags)
    if (pa !== pb) return pb - pa
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  })
}

/** 태그 → 뱃지 레이블 */
export const TAG_LABELS: Partial<Record<keyof ProjectTags, string>> = {
  hold: 'HOLD',
  revise: '보완',
  revision_n: '수정',
  rewrite: '재작성',
  reviewing: '검토중',
}

/** 태그 → 뱃지 색상 클래스 */
export const TAG_COLORS: Partial<Record<keyof ProjectTags, string>> = {
  hold: 'bg-red-100 text-red-700',
  revise: 'bg-amber-100 text-amber-700',
  revision_n: 'bg-violet-100 text-violet-700',
  rewrite: 'bg-orange-100 text-orange-700',
  reviewing: 'bg-blue-100 text-blue-700',
}

// ── D-day 헬퍼 ────────────────────────────────────────────────────────────────

/** D-day 라벨. due_date 있으면 잔여일 기준, 없으면 경과일. */
export function dDayLabel(
  project: Pick<KanbanProject, 'due_date' | 'created_at'>,
): string {
  if (project.due_date) {
    const diff = Math.ceil(
      (new Date(project.due_date).getTime() - Date.now()) / 86_400_000,
    )
    if (diff > 0) return `D-${diff}`
    if (diff === 0) return 'D-day'
    return `D+${Math.abs(diff)}`
  }
  const elapsed = Math.max(
    0,
    Math.floor((Date.now() - new Date(project.created_at).getTime()) / 86_400_000),
  )
  return `${elapsed}일`
}

/** D-day 칩 Tailwind 클래스 */
export function dDayClass(
  project: Pick<KanbanProject, 'due_date' | 'created_at'>,
): string {
  if (project.due_date) {
    const diff = Math.ceil(
      (new Date(project.due_date).getTime() - Date.now()) / 86_400_000,
    )
    if (diff <= 0) return 'text-red-600 font-bold'
    if (diff <= 3) return 'text-orange-500 font-semibold'
    return 'text-text-tertiary'
  }
  const elapsed = Math.max(
    0,
    Math.floor((Date.now() - new Date(project.created_at).getTime()) / 86_400_000),
  )
  return elapsed >= 7 ? 'text-red-500' : 'text-text-tertiary'
}

/**
 * 수령/미수령 배지가 의미 있는 초기 파이프라인 상태.
 * 스크립트 이후에는 제품 수령 여부가 노이즈가 됨.
 */
const PRODUCT_RECEIPT_STATUSES = new Set<ProjectStatus>([
  'invited',
  'intake_submitted',
  'script_generating',
  'script_review',
  'script_approved',
  'design_planning',
  'design_plan_review',
])

export function showProductBadge(status: ProjectStatus): boolean {
  return PRODUCT_RECEIPT_STATUSES.has(status)
}
