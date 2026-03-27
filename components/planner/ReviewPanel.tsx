'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function ReviewPanel({ projectId, scriptId }: { projectId: string; scriptId?: string }) {
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleAction(action: 'approve' | 'regenerate') {
    setLoading(true)
    await fetch('/api/scripts/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: projectId, script_id: scriptId, action, notes }),
    })
    setLoading(false)
    router.push('/planner')
  }

  return (
    <div className="bg-surface rounded-xl border border-border p-5 sticky top-24 space-y-5">
      <div>
        <h3 className="font-semibold text-text-primary">검수 패널</h3>
        <p className="text-xs text-text-tertiary mt-0.5">스크립트를 검토하고 승인 또는 재생성하세요</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">수정 요청 사항</label>
        <textarea
          value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="재생성 요청 시 수정 방향을 입력하세요 (선택)..."
          rows={4}
          className="w-full border border-border rounded-xl px-3 py-2.5 text-sm resize-none bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-text-tertiary"
        />
      </div>
      <div className="space-y-2.5">
        <button onClick={() => handleAction('approve')} disabled={loading}
          className="w-full bg-emerald-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 shadow-sm transition-all flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          승인 — 촬영 단계로 이동
        </button>
        <button onClick={() => handleAction('regenerate')} disabled={loading}
          className="w-full bg-surface-active text-text-secondary rounded-xl py-2.5 text-sm font-semibold hover:bg-gray-200 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
          </svg>
          AI 재생성 (메모 반영)
        </button>
      </div>
    </div>
  )
}
