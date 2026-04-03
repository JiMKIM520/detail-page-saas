import { STATUS_LABELS, CLIENT_STATUS_LABELS, type ProjectStatus } from '@/lib/status-machine'

const STATUS_STYLES: Record<ProjectStatus, { bg: string; text: string; dot: string }> = {
  intake_submitted:  { bg: 'bg-gray-50',    text: 'text-gray-600',    dot: 'bg-gray-400' },
  script_generating: { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400' },
  script_review:     { bg: 'bg-orange-50',  text: 'text-orange-700',  dot: 'bg-orange-400' },
  script_approved:   { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  photo_scheduled:   { bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-400' },
  photo_uploaded:    { bg: 'bg-indigo-50',  text: 'text-indigo-700',  dot: 'bg-indigo-400' },
  design_generating: { bg: 'bg-violet-50',  text: 'text-violet-700',  dot: 'bg-violet-400' },
  design_review:     { bg: 'bg-pink-50',    text: 'text-pink-700',    dot: 'bg-pink-400' },
  design_approved:   { bg: 'bg-teal-50',    text: 'text-teal-700',    dot: 'bg-teal-400' },
  delivered:         { bg: 'bg-slate-100',  text: 'text-slate-600',   dot: 'bg-slate-400' },
}

export function StatusBadge({ status, clientFacing = false }: { status: ProjectStatus; clientFacing?: boolean }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.intake_submitted
  const labels = clientFacing ? CLIENT_STATUS_LABELS : STATUS_LABELS
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {labels[status]}
    </span>
  )
}
