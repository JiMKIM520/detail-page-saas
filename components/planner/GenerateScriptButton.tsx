'use client'

/**
 * 스크립트 생성 버튼
 * intake_submitted 상태에서 운영자가 클릭 → POST /api/scripts/generate 호출.
 * generateScriptForProject가 상태 전이(intake_submitted→script_generating→script_review)를
 * 모두 처리하므로 여기서는 호출만 한다. 생성은 AI라 2~4분 소요.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface GenerateScriptButtonProps {
  projectId: string
}

export function GenerateScriptButton({ projectId }: GenerateScriptButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleGenerate(): Promise<void> {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/scripts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId }),
      })
      if (!res.ok) {
        const body: unknown = await res.json().catch(() => null)
        const message =
          body && typeof body === 'object' && 'error' in body && typeof (body as Record<string, unknown>).error === 'string'
            ? (body as Record<string, string>).error
            : res.statusText
        setError(`스크립트 생성 실패: ${message}`)
        return
      }
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '알 수 없는 오류'
      setError(`네트워크 오류: ${message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 bg-surface rounded-xl border border-border border-dashed gap-4">
      <div className="text-center">
        <p className="text-sm font-medium text-text-secondary mb-1">아직 스크립트가 생성되지 않았습니다</p>
        <p className="text-xs text-text-tertiary">의뢰서를 바탕으로 판매 스크립트를 생성합니다 (2~4분 소요)</p>
      </div>
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="bg-primary-600 text-white rounded-xl px-6 py-2.5 text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 shadow-sm transition-all flex items-center gap-2"
      >
        <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
        {loading ? '스크립트 생성 중... (2~4분)' : '① 스크립트 생성'}
      </button>
      {error && (
        <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700 max-w-sm text-center">
          {error}
        </div>
      )}
    </div>
  )
}
