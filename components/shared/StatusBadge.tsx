import { STATUS_LABELS, type ProjectStatus } from '@/lib/status-machine'
import clsx from 'clsx'

const STATUS_COLORS: Record<ProjectStatus, string> = {
  intake_submitted:  'bg-gray-100 text-gray-700',
  script_generating: 'bg-yellow-100 text-yellow-700',
  script_review:     'bg-orange-100 text-orange-700',
  script_approved:   'bg-green-100 text-green-700',
  photo_scheduled:   'bg-blue-100 text-blue-700',
  photo_uploaded:    'bg-indigo-100 text-indigo-700',
  design_generating: 'bg-purple-100 text-purple-700',
  design_review:     'bg-pink-100 text-pink-700',
  design_approved:   'bg-emerald-100 text-emerald-700',
  delivered:         'bg-slate-100 text-slate-700',
}

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span className={clsx('px-2 py-1 rounded-full text-xs font-medium', STATUS_COLORS[status])}>
      {STATUS_LABELS[status]}
    </span>
  )
}
