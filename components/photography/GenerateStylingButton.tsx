'use client'

import { useState } from 'react'

export function GenerateStylingButton({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ succeeded: number; failed: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/photography/generate-styling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? '생성 실패')
      } else {
        setResult(data)
      }
    } catch {
      setError('네트워크 오류')
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return (
      <p className="text-sm text-text-secondary">
        AI 스타일링컷 {result.succeeded}장 생성 완료
        {result.failed > 0 && ` (${result.failed}장 실패)`}
      </p>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors"
      >
        {loading ? (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        )}
        AI 스타일링컷 생성
      </button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
