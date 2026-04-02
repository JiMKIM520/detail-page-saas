'use client'

import { useState, useRef } from 'react'

interface BulkRegisterResult {
  email: string
  success: boolean
  error?: string
}

interface BulkRegisterResponse {
  total: number
  success: number
  failed: number
  results: BulkRegisterResult[]
}

interface BulkRegisterModalProps {
  isOpen: boolean
  onClose: () => void
}

export function BulkRegisterModal({ isOpen, onClose }: BulkRegisterModalProps) {
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<BulkRegisterResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
    if (!file) {
      setError('CSV 파일을 선택해주세요.')
      return
    }

    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/admin/bulk-register', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || '요청 처리 중 오류가 발생했습니다.')
      } else {
        setResponse(data as BulkRegisterResponse)
      }
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setResponse(null)
    setError(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  function handleClose() {
    handleReset()
    onClose()
  }

  const failedResults = response?.results.filter(r => !r.success) ?? []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-surface border border-border rounded-xl w-full max-w-lg mx-4 shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-text-primary">일괄 사용자 등록</h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-text-tertiary hover:text-text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5">
          {!response ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <p className="text-sm text-text-secondary mb-3">
                  CSV 파일을 업로드하면 사용자를 일괄 등록합니다.<br />
                  <span className="text-text-tertiary">헤더: email, company_name, business_number</span>
                </p>
                <label className="block">
                  <span className="text-sm font-medium text-text-secondary block mb-1.5">CSV 파일</span>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".csv"
                    className="block w-full text-sm text-text-secondary
                      file:mr-3 file:py-2 file:px-3
                      file:rounded-lg file:border file:border-border
                      file:text-sm file:font-medium
                      file:bg-surface file:text-text-primary
                      hover:file:bg-surface-active
                      cursor-pointer"
                  />
                </label>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-text-secondary border border-border rounded-lg hover:bg-surface-active transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? '처리 중...' : '등록 시작'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-surface rounded-xl border border-border p-3 text-center">
                  <p className="text-xs text-text-tertiary">전체</p>
                  <p className="text-xl font-bold text-text-primary mt-0.5">{response.total}</p>
                </div>
                <div className="bg-surface rounded-xl border border-border p-3 text-center">
                  <p className="text-xs text-text-tertiary">성공</p>
                  <p className="text-xl font-bold text-emerald-600 mt-0.5">{response.success}</p>
                </div>
                <div className="bg-surface rounded-xl border border-border p-3 text-center">
                  <p className="text-xs text-text-tertiary">실패</p>
                  <p className="text-xl font-bold text-red-600 mt-0.5">{response.failed}</p>
                </div>
              </div>

              {failedResults.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-text-secondary mb-2">실패 목록</p>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {failedResults.map((r, i) => (
                      <div key={i} className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                        <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-red-700 truncate">{r.email}</p>
                          <p className="text-xs text-red-600">{r.error}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 text-sm font-medium text-text-secondary border border-border rounded-lg hover:bg-surface-active transition-colors"
                >
                  다시 등록
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
