import Link from 'next/link'
import type { ProjectStatus } from '@/lib/status-machine'

/**
 * 디자이너 작업 단계 내비게이션 — 전 과정(스크립트→기획→스타일링샷→초안→납품)을
 * 한 줄로 보여주고 현재 단계를 강조 + 각 단계 화면으로 링크한다.
 * 디자이너 작업이 3개 화면(planner/photography/designer)에 나뉘어 있어 길잡이로 쓴다.
 */
interface Phase {
  key: string
  label: string
  href: (id: string) => string
  statuses: ProjectStatus[]
}

const PHASES: Phase[] = [
  { key: 'script', label: '스크립트 검수', href: (id) => `/planner/${id}`, statuses: ['script_review', 'script_approved'] },
  { key: 'plan', label: '디자인 기획', href: (id) => `/planner/${id}`, statuses: ['design_planning', 'design_plan_review'] },
  { key: 'styling', label: '스타일링샷 제작', href: (id) => `/photography/${id}`, statuses: ['prompt_ready', 'photo_scheduled', 'photo_uploaded'] },
  { key: 'draft', label: '초안 제작', href: (id) => `/designer/${id}`, statuses: ['design_generating', 'design_review', 'design_failed'] },
  { key: 'deliver', label: '납품', href: (id) => `/designer/${id}`, statuses: ['design_approved', 'delivered'] },
]

const ORDER: ProjectStatus[] = [
  'intake_submitted', 'script_generating', 'script_review', 'script_approved',
  'design_planning', 'design_plan_review', 'prompt_ready',
  'photo_scheduled', 'photo_uploaded', 'design_generating', 'design_failed',
  'design_review', 'design_approved', 'delivered',
]

function phaseIndexOf(status: ProjectStatus): number {
  const idx = PHASES.findIndex((p) => p.statuses.includes(status))
  if (idx >= 0) return idx
  // 매핑 없는 초기 상태(intake/script_generating)는 0단계 직전
  return ORDER.indexOf(status) < ORDER.indexOf('script_review') ? -1 : PHASES.length - 1
}

export function WorkflowSteps({ projectId, status }: { projectId: string; status: ProjectStatus }) {
  const current = phaseIndexOf(status)
  return (
    <nav className="flex items-center gap-1.5 overflow-x-auto pb-1" aria-label="작업 단계">
      {PHASES.map((p, i) => {
        const state = i < current ? 'done' : i === current ? 'current' : 'todo'
        return (
          <div key={p.key} className="flex items-center gap-1.5 shrink-0">
            <Link
              href={p.href(projectId)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                state === 'current'
                  ? 'bg-primary-600 text-white'
                  : state === 'done'
                    ? 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                    : 'bg-surface-active text-text-tertiary hover:bg-gray-200'
              }`}
            >
              <span className={`w-4 h-4 rounded-full grid place-items-center text-[10px] ${
                state === 'current' ? 'bg-white/25' : state === 'done' ? 'bg-primary-200 text-primary-800' : 'bg-gray-200 text-gray-500'
              }`}>
                {state === 'done' ? '✓' : i + 1}
              </span>
              {p.label}
            </Link>
            {i < PHASES.length - 1 && <span className="text-text-tertiary text-xs">›</span>}
          </div>
        )
      })}
    </nav>
  )
}
