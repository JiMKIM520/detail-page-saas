'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { STATUS_LABELS, type ProjectStatus } from '@/lib/status-machine'

/**
 * 진행 리스트 — 전 단계를 한 화면에서 단계별 그룹으로 본다.
 *
 * 기존 대시보드(4열 칸반)+시안보드(3열 칸반)를 하나로 합쳤다. 200개 작성대기가 들어와도
 * 그룹을 접으면 스크롤이 짧다. 검수 단계 행에는 만족/불만족 인라인 버튼을 그대로 얹었다
 * (기존 /api/admin/review/action 재사용 — 새 로직 없음). 판단이 필요한 실제 콘텐츠는
 * 행을 눌러 각 단계 페이지에서 본다.
 */

export interface ListProject {
  id: string
  company_name: string
  status: ProjectStatus
  category: string | null
  platform_name: string | null
  designer_id: string | null
  designer_name: string | null
  due_date: string | null
  created_at: string
  tags: Record<string, boolean> | null
}

interface Group {
  key: string
  label: string
  statuses: ProjectStatus[]
  /** 기본 접힘 (작성대기 200개) */
  collapsed?: boolean
}

const GROUPS: Group[] = [
  { key: 'wait', label: '작성대기', statuses: ['invited'], collapsed: true },
  { key: 'intake', label: '접수', statuses: ['intake_submitted'] },
  {
    key: 'script',
    label: '스크립트·스타일링',
    statuses: [
      'script_generating', 'script_review', 'script_approved',
      'design_planning', 'design_plan_review', 'prompt_ready',
      'photo_scheduled', 'photo_uploaded',
    ],
  },
  { key: 'make', label: '제작', statuses: ['design_generating', 'design_failed', 'designer_working'] },
  { key: 'review', label: '1차시안·검수', statuses: ['draft_submitted', 'design_review'] },
  { key: 'revision', label: '기업 수정요청', statuses: ['revision_1', 'revision_2'] },
  { key: 'done', label: '완료', statuses: ['design_approved', 'delivered'] },
]

/** 단계별로 어느 작업 페이지를 여는지 */
function hrefFor(p: ListProject): string {
  const planner: ProjectStatus[] = [
    'invited', 'intake_submitted', 'script_generating', 'script_review', 'script_approved',
    'design_planning', 'design_plan_review', 'prompt_ready', 'photo_scheduled', 'photo_uploaded',
  ]
  return planner.includes(p.status) ? `/planner/${p.id}` : `/pipeline/${p.id}`
}

/**
 * D-day(마감 기준) 또는 접수 후 경과일.
 *
 * 같은 열에 'D-9'(남은 일수)와 '31일'(지난 일수)이 섞여 정반대로 읽히던 문제가 있었다
 * (2026-08-07 검토). 경과일에는 '접수'를 붙여 무엇을 세는 숫자인지 드러낸다.
 */
function timeLabel(p: ListProject): { text: string; tone: 'tight' | 'normal' | 'muted' } {
  if (p.due_date) {
    const diff = Math.ceil((new Date(p.due_date).getTime() - Date.now()) / 86_400_000)
    return { text: diff >= 0 ? `D-${diff}` : `D+${-diff}`, tone: diff <= 3 ? 'tight' : 'normal' }
  }
  const days = Math.floor((Date.now() - new Date(p.created_at).getTime()) / 86_400_000)
  return { text: days > 0 ? `접수 ${days}일째` : '접수 오늘', tone: 'muted' }
}

function tagChips(tags: Record<string, boolean> | null): string[] {
  if (!tags) return []
  const label: Record<string, string> = { revise: '보완', revision: '수정', hold: 'Hold', delay: '지연' }
  return Object.entries(tags).filter(([, v]) => v).map(([k]) => label[k] ?? k)
}

export default function DashboardList({
  projects,
  staff,
}: {
  projects: ListProject[]
  staff: { id: string; name: string }[]
}) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [assignee, setAssignee] = useState('')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(
    Object.fromEntries(GROUPS.filter((g) => g.collapsed).map((g) => [g.key, true])),
  )
  const [busy, setBusy] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return projects.filter((p) => {
      if (q && !p.company_name.toLowerCase().includes(q)) return false
      if (assignee === '__none__' && p.designer_id) return false
      if (assignee && assignee !== '__none__' && p.designer_id !== assignee) return false
      return true
    })
  }, [projects, query, assignee])

  async function reviewAction(id: string, action: 'approve' | 'reject') {
    setBusy(id + action)
    try {
      await fetch('/api/admin/review/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: id, action }),
      })
      router.refresh()
    } finally {
      setBusy(null)
    }
  }

  return (
    <div>
      {/* 필터 바 */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-3 mb-5 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="회사명 검색…"
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8fd0c0]"
          />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {[{ id: '', name: '전체' }, { id: '__none__', name: '미배정' }, ...staff].map((s) => {
            const active = assignee === s.id
            return (
              <button
                key={s.id || '_all_'}
                type="button"
                onClick={() => setAssignee(s.id)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-colors whitespace-nowrap ${
                  active ? 'bg-[#008d70] text-white border-[#008d70]' : 'bg-white text-gray-600 border-[#e2e8f0] hover:border-[#8fd0c0]'
                }`}
              >
                {s.name}
              </button>
            )
          })}
        </div>
        <span className="ml-auto text-xs text-gray-400 whitespace-nowrap">{filtered.length}건</span>
      </div>

      {/* 단계별 그룹 리스트 */}
      <div className="space-y-3">
        {GROUPS.map((g) => {
          const rows = filtered.filter((p) => g.statuses.includes(p.status))
          const isCollapsed = collapsed[g.key] ?? false
          const isReview = g.key === 'review' || g.key === 'revision'
          return (
            <section key={g.key} className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setCollapsed((s) => ({ ...s, [g.key]: !isCollapsed }))}
                className="w-full flex items-center gap-2 px-4 py-3 hover:bg-[#f6faf9] transition-colors"
              >
                <span className={`text-[#008d70] transition-transform ${isCollapsed ? '' : 'rotate-90'}`}>▶</span>
                <h2 className="text-sm font-bold text-gray-800">{g.label}</h2>
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">{rows.length}</span>
              </button>

              {!isCollapsed && (
                rows.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-5">해당 단계 없음</p>
                ) : (
                  <div className="divide-y divide-[#eef2f1]">
                    {rows.map((p) => {
                      const t = timeLabel(p)
                      const chips = tagChips(p.tags)
                      return (
                        <div key={p.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#f6faf9] transition-colors">
                          <Link href={hrefFor(p)} className="flex-1 min-w-0 flex items-center gap-2">
                            <span className="font-semibold text-gray-800 text-sm truncate">{p.company_name}</span>
                            {chips.map((c) => (
                              <span key={c} className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">{c}</span>
                            ))}
                          </Link>
                          <span className="hidden sm:block text-xs text-gray-400 w-28 truncate">
                            {(p.platform_name ?? '-')} · {(p.category ?? '-')}
                          </span>
                          <span className="text-xs text-gray-500 w-24 truncate">{STATUS_LABELS[p.status]}</span>
                          <span className={`text-xs w-12 text-right tabular-nums ${
                            t.tone === 'tight' ? 'text-red-600 font-semibold' : t.tone === 'muted' ? 'text-gray-400' : 'text-gray-600'
                          }`}>{t.text}</span>
                          <span className="text-xs w-16 truncate text-right">
                            {p.designer_name
                              ? <span className="text-[#0d7a61] font-medium">{p.designer_name}</span>
                              : <span className="text-gray-300">미배정</span>}
                          </span>
                          {isReview && (
                            <span className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={busy === p.id + 'approve'}
                                onClick={() => reviewAction(p.id, 'approve')}
                                className="text-xs px-2 py-1 rounded-md bg-[#e2f3ee] text-[#00745c] font-semibold hover:bg-[#cdeae2] disabled:opacity-50"
                              >
                                {busy === p.id + 'approve' ? '…' : '만족'}
                              </button>
                              <button
                                type="button"
                                disabled={busy === p.id + 'reject'}
                                onClick={() => reviewAction(p.id, 'reject')}
                                className="text-xs px-2 py-1 rounded-md bg-amber-50 text-amber-700 font-semibold hover:bg-amber-100 disabled:opacity-50"
                              >
                                {busy === p.id + 'reject' ? '…' : '불만족'}
                              </button>
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
