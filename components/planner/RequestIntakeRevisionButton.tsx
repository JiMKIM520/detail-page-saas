'use client'

/**
 * 의뢰서 보완 요청 버튼(관리자) — 기획 프로세스 2단계(입력정보확인).
 * 의뢰서가 불충분할 때 보완 내용을 적어 요청 — 사업자에게 메일+문자 자동 발송,
 * 프로젝트에 '보완' 태그가 붙어 칸반 최상단에 노출된다.
 * intake_submitted 상태에서만 렌더(호출부에서 제어).
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function RequestIntakeRevisionButton({ projectId }: { projectId: string }) {
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleRequest(): Promise<void> {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/projects/${projectId}/request-revision-intake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        setError(body.error ?? `요청 실패 (${res.status})`)
        return
      }
      setDone(true)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : '네트워크 오류')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-surface rounded-xl border border-amber-200 p-4 space-y-2">
      <p className="text-sm font-semibold text-text-primary">의뢰서 보완 요청</p>
      <p className="text-xs text-text-tertiary">입력 정보가 부족하면 보완을 요청하세요 — 사업자에게 메일·문자가 발송됩니다.</p>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="예: 제품 상세 규격과 원산지 정보를 추가해 주세요. 제품 사진을 밝은 배경에서 다시 촬영해 주세요."
        rows={3}
        className="w-full border border-border rounded-lg px-3 py-2 text-sm resize-none bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-text-tertiary"
      />
      <button
        onClick={handleRequest}
        disabled={loading || done}
        className="w-full bg-amber-500 text-white rounded-lg py-2 text-sm font-semibold hover:bg-amber-600 disabled:opacity-50 transition-all"
      >
        {done ? '✓ 보완 요청 발송됨' : loading ? '발송 중...' : '보완 요청 보내기'}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
