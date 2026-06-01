'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

/** 디자인 기획 검수 승인 → prompt_ready (스타일링샷 제작 단계로 이동) */
export function ApprovePlanButton({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function approve() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/designs/plan-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId }),
      })
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(d.error || `요청 실패 (${res.status})`)
      }
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : '처리 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-surface rounded-xl border border-border p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md uppercase tracking-wide">
          기획 검수
        </span>
        <span className="text-xs text-text-tertiary">디자인 기획안을 확인하고 승인하면 스타일링샷 제작 단계로 넘어갑니다</span>
      </div>
      {error && (
        <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700 mb-3">
          {error}
        </div>
      )}
      <button
        onClick={approve}
        disabled={loading}
        className="w-full bg-violet-600 text-white rounded-xl py-3 font-semibold hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm transition-all flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
        {loading ? '승인 처리 중...' : '기획 승인 — 스타일링샷 제작으로'}
      </button>
    </div>
  )
}
