import Link from 'next/link'
import type { HealthIssue } from '@/lib/pipeline-health'

/**
 * 대시보드 상단 이상 징후 배너.
 * 아무 문제가 없으면 아무것도 그리지 않는다 — 평소에 조용해야 뜰 때 눈에 띈다.
 */
export function PipelineHealth({ issues }: { issues: HealthIssue[] }) {
  if (issues.length === 0) return null

  const failed = issues.filter(i => i.kind === 'failed')
  const stuck = issues.filter(i => i.kind === 'stuck')

  return (
    <section className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-5">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <h2 className="text-sm font-bold text-amber-900">
          확인이 필요한 작업 {issues.length}건
          {failed.length > 0 && <span className="font-medium"> · 실패 {failed.length}</span>}
          {stuck.length > 0 && <span className="font-medium"> · 멈춤 {stuck.length}</span>}
        </h2>
      </div>

      <ul className="space-y-2">
        {issues.slice(0, 8).map((i, idx) => (
          <li key={`${i.projectId}-${idx}`}>
            <Link
              href={`/planner/${i.projectId}`}
              className="flex items-start gap-3 rounded-lg bg-white/70 px-3 py-2.5 hover:bg-white transition-colors"
            >
              <span className={`mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                i.kind === 'failed' ? 'bg-red-100 text-red-700' : 'bg-amber-200 text-amber-800'
              }`}>
                {i.kind === 'failed' ? '실패' : '멈춤'}
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-sm font-semibold text-text-primary">{i.companyName}</span>
                <span className="text-sm text-text-secondary"> — {i.detail}</span>
                {i.reason && (
                  <span className="block text-xs text-text-tertiary mt-0.5 truncate">{i.reason}</span>
                )}
              </span>
              <span className="text-xs text-text-tertiary flex-shrink-0 tabular-nums">
                {i.minutesAgo >= 60 ? `${Math.floor(i.minutesAgo / 60)}시간 전` : `${i.minutesAgo}분 전`}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {issues.length > 8 && (
        <p className="text-xs text-amber-800 mt-2.5">그 외 {issues.length - 8}건</p>
      )}
    </section>
  )
}
