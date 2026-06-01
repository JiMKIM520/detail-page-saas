'use client'

/**
 * 디자인 기획 시작 버튼
 * script_approved 상태에서 운영자가 클릭 → POST /api/designs/planning 호출
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface StartPlanningButtonProps {
  projectId: string
}

export function StartPlanningButton({ projectId }: StartPlanningButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleStart(): Promise<void> {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/designs/planning', {
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
        setError(`디자인 기획 시작 실패: ${message}`)
        return
      }

      // 성공 시 페이지 새로고침으로 status 반영
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '알 수 없는 오류'
      setError(`네트워크 오류: ${message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleStart}
        disabled={loading}
        className="w-full bg-violet-600 text-white rounded-xl py-3 font-semibold hover:bg-violet-700 shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            {/* 로딩 스피너 */}
            <svg
              className="w-4 h-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            디자인 기획 생성 중...
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z"
              />
            </svg>
            디자인 기획 시작
          </>
        )}
      </button>

      {/* 에러 메시지 */}
      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
          <svg
            className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}
    </div>
  )
}
