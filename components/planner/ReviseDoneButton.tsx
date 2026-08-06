'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * 보완 완료 확인 (관리자).
 *
 * 기업이 의뢰서를 보완 제출하면 tags.revise_done이 서고 목록에 "보완 완료" 알림이 뜬다.
 * 사무국이 내용을 확인하고 이 버튼을 누르면 알림이 사라진다(회의 요청: 확인 후 알림 소멸).
 */
export function ReviseDoneButton({ projectId, round }: { projectId: string; round: number }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function confirm(): Promise<void> {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/tags', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, tags: { revise_done: false } }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        setError(body.error ?? `확인 처리 실패 (${res.status})`)
        return
      }
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : '네트워크 오류')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-amber-900">
            기업이 {round}차 보완을 제출했습니다
          </p>
          <p className="text-xs text-amber-800 mt-0.5">
            아래 의뢰서 내용을 확인한 뒤 [확인 완료]를 누르면 알림이 사라집니다.
          </p>
        </div>
        <button
          type="button"
          onClick={confirm}
          disabled={loading}
          className="shrink-0 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50 transition-colors"
        >
          {loading ? '처리 중…' : '확인 완료'}
        </button>
      </div>
      {error && <p className="text-red-600 text-xs mt-2">{error}</p>}
    </div>
  )
}
