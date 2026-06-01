'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ReviewPanelProps {
  projectId: string
  scriptId?: string
}

export function ReviewPanel({ projectId, scriptId }: ReviewPanelProps) {
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeAction, setActiveAction] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleAction(action: 'approve' | 'regenerate') {
    setLoading(true)
    setActiveAction(action)
    setError(null)
    try {
      const res = await fetch('/api/scripts/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, script_id: scriptId, action, notes }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error || `요청 실패 (${res.status})`)
      }
      // 승인 시 같은 화면에 '디자인 기획 시작' 버튼이 나타나도록 새로고침 (목록 이동 X)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : '처리 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
      setActiveAction(null)
    }
  }

  async function handleAbTest() {
    if (!scriptId) return
    setLoading(true)
    setActiveAction('ab_test')
    setError(null)
    try {
      const res = await fetch('/api/scripts/ab-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, script_id: scriptId }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error || `요청 실패 (${res.status})`)
      }
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : '처리 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
      setActiveAction(null)
    }
  }

  return (
    <div className="bg-surface rounded-xl border border-border p-5 sticky top-24 space-y-5">
      <div>
        <h3 className="font-semibold text-text-primary">검수 패널</h3>
        <p className="text-xs text-text-tertiary mt-0.5">스크립트를 검토하고 승인 또는 수정하세요</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">AI 재생성 지시</label>
        <textarea
          value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="예: '헤드라인을 더 감성적으로 변경', '타겟을 30대 여성으로', '성분/효과 정보 강조', '경쟁사 대비 차별점 부각'"
          rows={4}
          className="w-full border border-border rounded-xl px-3 py-2.5 text-sm resize-none bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-text-tertiary"
        />
      </div>
      {error && (
        <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}
      <div className="space-y-2.5">
        <button onClick={() => handleAction('approve')} disabled={loading}
          className="w-full bg-emerald-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 shadow-sm transition-all flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          {activeAction === 'approve' ? '승인 처리 중...' : '승인 — 디자인 기획으로'}
        </button>
        <button onClick={() => handleAction('regenerate')} disabled={loading}
          className="w-full bg-surface-active text-text-secondary rounded-xl py-2.5 text-sm font-semibold hover:bg-gray-200 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
          </svg>
          {activeAction === 'regenerate' ? 'AI 재생성 중... (최대 60초)' : 'AI 재생성 (메모 반영)'}
        </button>
        <button onClick={handleAbTest} disabled={loading || !scriptId}
          className="w-full border border-purple-300 text-purple-700 rounded-xl py-2 text-xs font-medium hover:bg-purple-50 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
          </svg>
          {activeAction === 'ab_test' ? 'A/B 생성 중...' : 'A/B 비교 생성 (디자인 가이드 제외)'}
        </button>
      </div>
    </div>
  )
}
