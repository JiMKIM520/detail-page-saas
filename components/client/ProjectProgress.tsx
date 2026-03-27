import { STATUS_LABELS, type ProjectStatus } from '@/lib/status-machine'

const ALL_STATUSES: ProjectStatus[] = [
  'intake_submitted',
  'script_generating',
  'script_review',
  'script_approved',
  'photo_scheduled',
  'photo_uploaded',
  'design_generating',
  'design_review',
  'design_approved',
  'delivered',
]

export function ProjectProgress({ status }: { status: ProjectStatus }) {
  const currentIndex = ALL_STATUSES.indexOf(status)

  return (
    <div className="w-full">
      {/* Desktop: horizontal stepper */}
      <div className="hidden sm:flex items-center gap-1">
        {ALL_STATUSES.map((s, i) => {
          const isCompleted = i < currentIndex
          const isCurrent = i === currentIndex

          return (
            <div key={s} className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col items-center flex-1 min-w-0">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                    isCompleted
                      ? 'bg-primary-600 text-white'
                      : isCurrent
                        ? 'bg-primary-100 border-2 border-primary-600 text-primary-700'
                        : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    <span className="text-[10px] font-bold">{i + 1}</span>
                  )}
                </div>
                <p
                  className={`text-[10px] mt-1 text-center leading-tight truncate w-full ${
                    isCurrent
                      ? 'font-semibold text-primary-700'
                      : isCompleted
                        ? 'text-text-secondary'
                        : 'text-text-tertiary'
                  }`}
                >
                  {STATUS_LABELS[s]}
                </p>
              </div>
              {i < ALL_STATUSES.length - 1 && (
                <div
                  className={`h-0.5 w-full mt-[-14px] ${
                    i < currentIndex ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile: compact progress bar */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-primary-700">
            {STATUS_LABELS[status]}
          </span>
          <span className="text-xs text-text-tertiary">
            {currentIndex + 1} / {ALL_STATUSES.length}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-600 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / ALL_STATUSES.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
