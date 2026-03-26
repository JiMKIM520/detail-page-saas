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
    <div className="bg-white rounded-xl border p-5 sticky top-6 space-y-4">
      <h3 className="font-semibold text-gray-900">검수 패널</h3>
      <textarea
        value={notes} onChange={e => setNotes(e.target.value)}
        placeholder="재생성 요청 시 수정 방향을 입력하세요 (선택)..."
        rows={4} className="w-full border rounded-lg px-3 py-2 text-sm resize-none" />
      <div className="space-y-2">
        <button onClick={() => handleAction('approve')} disabled={loading}
          className="w-full bg-green-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-50">
          ✓ 승인 → 촬영 단계
        </button>
        <button onClick={() => handleAction('regenerate')} disabled={loading}
          className="w-full bg-gray-200 text-gray-700 rounded-lg py-2 text-sm font-medium hover:bg-gray-300 disabled:opacity-50">
          ↻ AI 재생성 (메모 반영)
        </button>
      </div>
    </div>
  )
}
