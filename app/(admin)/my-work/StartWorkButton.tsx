'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function StartWorkButton({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleClick() {
    setLoading(true)
    try {
      const res = await fetch('/api/designs/start-work', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId }),
      })
      if (!res.ok) {
        const b = await res.json().catch(() => null)
        alert(`오류: ${b?.error ?? res.statusText}`)
        return
      }
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="w-full mt-2 text-xs py-1.5 px-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors font-medium"
    >
      {loading ? '처리 중…' : '작업 시작'}
    </button>
  )
}
