'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * AI 초안 생성 — 스타일링샷 완료(photo_uploaded) 후 디자이너가 초안을 생성한다.
 * /api/designs/generate(서버 await, maxDuration 300)를 호출 → design_review + 초안 생성.
 */
export function GenerateDraftButton({ projectId, status }: { projectId: string; status: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const generating = status === 'design_generating'

  async function generate() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/designs/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId }),
      })
      const body = await res.json().catch(() => null)
      if (!res.ok) { setError(body?.error || `생성 실패 (${res.status})`); return }
      router.refresh()
    } catch (e) {
      setError('네트워크 오류: ' + String(e).slice(0, 120))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-surface rounded-xl border border-border p-5 space-y-3">
      <div>
        <h3 className="font-semibold text-text-primary">AI 초안 생성</h3>
        <p className="text-xs text-text-tertiary mt-0.5">
          스타일링샷·브랜드 색을 반영해 상세페이지 HTML 초안을 생성합니다. 이후 Figma로 가져가 리터치하세요.
        </p>
      </div>
      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}
      <button
        onClick={generate}
        disabled={loading || generating}
        className="w-full bg-primary-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
      >
        {loading || generating ? (
          <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />생성 중… (최대 5분)</>
        ) : status === 'design_failed' ? '초안 생성 재시도' : 'AI 초안 생성'}
      </button>
    </div>
  )
}
