'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ReviewPanelProps {
  projectId: string
  scriptId?: string
  scriptContent?: any
}

export function ReviewPanel({ projectId, scriptId, scriptContent }: ReviewPanelProps) {
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeAction, setActiveAction] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editJson, setEditJson] = useState('')
  const [editError, setEditError] = useState('')
  const router = useRouter()

  async function handleAction(action: 'approve' | 'regenerate') {
    setLoading(true)
    setActiveAction(action)
    await fetch('/api/scripts/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: projectId, script_id: scriptId, action, notes }),
    })
    setLoading(false)
    setActiveAction(null)
    router.push('/planner')
  }

  function openEdit() {
    setEditJson(JSON.stringify(scriptContent, null, 2))
    setEditMode(true)
    setEditError('')
  }

  async function handleSaveEdit() {
    try {
      const parsed = JSON.parse(editJson)
      setEditError('')
      setLoading(true)
      await fetch('/api/scripts/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          script_id: scriptId,
          action: 'edit',
          notes: { content: parsed, memo: notes },
        }),
      })
      setLoading(false)
      setEditMode(false)
      router.refresh()
    } catch {
      setEditError('JSON 형식이 올바르지 않습니다')
    }
  }

  if (editMode) {
    return (
      <div className="bg-surface rounded-xl border border-border p-5 sticky top-24 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-text-primary">스크립트 편집</h3>
          <button onClick={() => setEditMode(false)} className="text-xs text-text-tertiary hover:text-text-secondary">
            취소
          </button>
        </div>
        <textarea
          value={editJson}
          onChange={e => setEditJson(e.target.value)}
          rows={20}
          className="w-full border border-border rounded-xl px-3 py-2.5 text-xs font-mono resize-none bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          spellCheck={false}
        />
        {editError && <p className="text-red-500 text-xs">{editError}</p>}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">수정 메모</label>
          <input
            value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="수정 사유 (선택)"
            className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-text-tertiary"
          />
        </div>
        <button onClick={handleSaveEdit} disabled={loading}
          className="w-full bg-primary-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 shadow-sm transition-all">
          {loading ? '저장 중...' : '수정사항 저장'}
        </button>
      </div>
    )
  }

  return (
    <div className="bg-surface rounded-xl border border-border p-5 sticky top-24 space-y-5">
      <div>
        <h3 className="font-semibold text-text-primary">검수 패널</h3>
        <p className="text-xs text-text-tertiary mt-0.5">스크립트를 검토하고 승인 또는 수정하세요</p>
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
          {activeAction === 'approve' ? '승인 처리 중...' : '승인 — 촬영 단계로 이동'}
        </button>
        <button onClick={() => handleAction('regenerate')} disabled={loading}
          className="w-full bg-surface-active text-text-secondary rounded-xl py-2.5 text-sm font-semibold hover:bg-gray-200 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
          </svg>
          {activeAction === 'regenerate' ? 'AI 재생성 중... (최대 60초)' : 'AI 재생성 (메모 반영)'}
        </button>
        <button onClick={openEdit} disabled={loading || !scriptContent}
          className="w-full border border-border text-text-secondary rounded-xl py-2.5 text-sm font-semibold hover:bg-surface-hover disabled:opacity-50 transition-all flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
          직접 편집
        </button>
      </div>
    </div>
  )
}
