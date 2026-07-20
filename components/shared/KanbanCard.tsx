'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { STATUS_LABELS } from '@/lib/status-machine'
import {
  dDayLabel,
  dDayClass,
  showProductBadge,
  TAG_LABELS,
  TAG_COLORS,
  type KanbanProject,
  type ProjectTags,
} from './kanban'

interface KanbanCardProps {
  project: KanbanProject
  /** 상세/작업 화면 링크 */
  href: string
  /** 파이프라인 콘솔 링크 (없으면 ▶ 버튼 숨김) */
  pipelineHref?: string
  /** true 이면 만족/불만족 액션 버튼 표시 (시안 보드 전용) */
  showActions?: boolean
}

// 렌더할 태그 키 순서 (우선순위 순)
const TAG_ORDER: (keyof ProjectTags)[] = [
  'hold',
  'revise',
  'revision_n',
  'rewrite',
  'reviewing',
]

export function KanbanCard({
  project,
  href,
  pipelineHref,
  showActions = false,
}: KanbanCardProps) {
  const router = useRouter()
  const [actionLoading, setActionLoading] = useState<'approve' | 'reject' | null>(null)
  const [actionResult, setActionResult] = useState<string | null>(null)

  const ddayStr = dDayLabel(project)
  const ddayCls = dDayClass(project)

  const revisionLabel =
    project.status === 'revision_1'
      ? '수정1'
      : project.status === 'revision_2'
        ? '수정2'
        : null

  const received = !!project.product_received_at

  async function handleAction(action: 'approve' | 'reject') {
    setActionLoading(action)
    setActionResult(null)
    try {
      const res = await fetch('/api/admin/review/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: project.id, action }),
      })
      const json = (await res.json()) as { success?: boolean; error?: string }
      if (!res.ok) throw new Error(json.error ?? `오류 ${res.status}`)
      setActionResult(action === 'approve' ? '승인됨 ✓' : '보완 요청됨')
      router.refresh()
    } catch (e) {
      setActionResult(e instanceof Error ? e.message : '오류 발생')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="relative">
      {/* 파이프라인 콘솔 바로가기 */}
      {pipelineHref && (
        <Link
          href={pipelineHref}
          title="파이프라인 콘솔"
          onClick={(e) => e.stopPropagation()}
          className="absolute top-2 right-2 z-10 text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 hover:bg-slate-700 hover:text-white transition-colors"
        >
          ▶
        </Link>
      )}

      {/* 카드 본문 */}
      <Link
        href={href}
        className="block bg-white rounded-lg border border-border p-3 hover:border-primary-300 hover:shadow-sm transition-all"
      >
        <p className="text-sm font-semibold text-text-primary truncate pr-7">
          {project.company_name}
        </p>
        <p className="text-xs text-text-tertiary mt-0.5 truncate">
          {project.platforms?.name ?? '-'} · {project.category ?? '-'}
        </p>

        {/* 상태 + D-day */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-[11px] text-text-secondary">
            {STATUS_LABELS[project.status]}
          </span>
          <span className={`text-[11px] ${ddayCls}`}>{ddayStr}</span>
        </div>

        {/* 배지 행 */}
        <div className="mt-1.5 flex flex-wrap gap-1">
          {/* 담당 디자이너 배지 */}
          {project.designer_name ? (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">
              담당 {project.designer_name}
            </span>
          ) : project.designer_id ? (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">
              담당 ?
            </span>
          ) : (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700">
              미배정
            </span>
          )}

          {/* 수정 회차 배지 (상태 기반) */}
          {revisionLabel && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 ring-1 ring-orange-200">
              {revisionLabel}
            </span>
          )}

          {/* 태그 배지 (우선순위 순 렌더) */}
          {TAG_ORDER.map((key) =>
            project.tags?.[key] ? (
              <span
                key={key}
                className={`text-[10px] px-1.5 py-0.5 rounded ${TAG_COLORS[key] ?? 'bg-slate-100 text-slate-600'}`}
              >
                {TAG_LABELS[key] ?? key}
              </span>
            ) : null,
          )}

          {/* 수령/미수령 배지 (초기 파이프라인 단계만) */}
          {showProductBadge(project.status) && (
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded ${
                received
                  ? 'bg-green-50 text-green-700'
                  : 'bg-slate-50 text-slate-500 ring-1 ring-slate-200'
              }`}
            >
              {received ? '수령' : '미수령'}
            </span>
          )}
        </div>
      </Link>

      {/* 만족/불만족 액션 버튼 (시안 보드 전용) */}
      {showActions && (
        <div className="mt-1">
          {actionResult ? (
            <p className="text-center text-[11px] text-text-secondary py-1 select-none">
              {actionResult}
            </p>
          ) : (
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => handleAction('approve')}
                disabled={!!actionLoading}
                className="flex-1 text-[11px] py-1 rounded-md bg-primary-50 text-primary-700 hover:bg-primary-100 ring-1 ring-primary-200 transition-colors disabled:opacity-50"
              >
                {actionLoading === 'approve' ? '처리 중…' : '만족 ✓'}
              </button>
              <button
                type="button"
                onClick={() => handleAction('reject')}
                disabled={!!actionLoading}
                className="flex-1 text-[11px] py-1 rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100 ring-1 ring-amber-200 transition-colors disabled:opacity-50"
              >
                {actionLoading === 'reject' ? '처리 중…' : '불만족'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
