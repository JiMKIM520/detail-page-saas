'use client'

import { useEffect, useState } from 'react'

/**
 * 의뢰서 전체 화면 보기 (관리자).
 *
 * 관리자 상세는 3열 그리드라 의뢰서가 좁은 폭에 갇혀 읽기 불편하다는 요청(2026-08-04 회의).
 * 같은 내용을 넓은 오버레이로 다시 렌더한다 — 내용은 서버에서 받은 children 그대로라
 * 원본과 어긋날 일이 없다.
 */
export function ExpandableIntake({ children }: { children: React.ReactNode }) {
  const [full, setFull] = useState(false)

  // 오버레이가 열린 동안 배경 스크롤 잠금 + ESC로 닫기
  useEffect(() => {
    if (!full) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setFull(false) }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [full])

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setFull(true)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-text-tertiary hover:text-primary-600 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
          </svg>
          전체 화면으로 보기
        </button>
      </div>

      {children}

      {full && (
        <div
          className="fixed inset-0 z-50 bg-black/50 overflow-y-auto p-4 sm:p-8"
          onClick={() => setFull(false)}
          role="dialog"
          aria-modal="true"
          aria-label="의뢰서 전체 화면"
        >
          <div className="mx-auto w-full max-w-5xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-end mb-2">
              <button
                type="button"
                onClick={() => setFull(false)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-white transition-colors"
              >
                닫기 (ESC)
              </button>
            </div>
            {children}
          </div>
        </div>
      )}
    </div>
  )
}
