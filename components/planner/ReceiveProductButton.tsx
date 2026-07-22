'use client'

/**
 * 제품 수령 확인 버튼(관리자) — 기획 프로세스 2단계.
 * 수령 시점(product_received_at)부터 작업 D-14 카운팅이 시작된다.
 * 이미 수령됐으면 날짜 뱃지만 표시.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function ReceiveProductButton({
  projectId,
  receivedAt,
}: {
  projectId: string
  receivedAt: string | null
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  if (receivedAt) {
    const d = new Date(receivedAt)
    return (
      <div className="bg-surface rounded-xl border border-border p-4 flex items-center gap-2">
        <span className="text-emerald-600 text-sm font-semibold">✓ 제품 수령됨</span>
        <span className="text-xs text-text-tertiary">
          {d.getFullYear()}.{String(d.getMonth() + 1).padStart(2, '0')}.{String(d.getDate()).padStart(2, '0')} — D-14 카운팅 중
        </span>
      </div>
    )
  }

  async function handleReceive(): Promise<void> {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/projects/${projectId}/receive-product`, { method: 'POST' })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        setError(body.error ?? `요청 실패 (${res.status})`)
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
    <div className="bg-surface rounded-xl border border-border p-4 space-y-2">
      <p className="text-xs text-text-tertiary">실물 제품이 도착하면 체크하세요 — 이 시점부터 작업 기한(D-14)이 계산됩니다.</p>
      <button
        onClick={handleReceive}
        disabled={loading}
        className="w-full bg-primary-600 text-white rounded-lg py-2 text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 transition-all"
      >
        {loading ? '처리 중...' : '📦 제품 수령 확인'}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
