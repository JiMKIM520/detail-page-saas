'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * 디자이너 최종 납품 패널 (Figma 플로우).
 * - 디자인 재생성(AI 초안 다시 뽑기)
 * - 최종 파일 업로드 + 승인 → 납품 완료(사업자에게 최종 메일은 designs/review에서 발송)
 *
 * 레거시(인앱 HTML 에디터·자동 PDF 굽기)는 Figma 리터치 플로우로 대체되어 제거됨.
 */
export function DeliveryPanel({ projectId, designId }: { projectId: string; designId?: string }) {
  const [notes, setNotes] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleApprove() {
    if (!file) {
      alert('최종 납품 파일을 먼저 선택하세요.')
      return
    }
    setLoading(true)

    const fd = new FormData()
    fd.append('project_id', projectId)
    if (designId) fd.append('design_id', designId)
    fd.append('action', 'approve')
    fd.append('notes', notes)
    fd.append('file', file)

    const res = await fetch('/api/designs/review', { method: 'POST', body: fd })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      alert(`납품 처리 실패: ${body?.error ?? res.statusText}`)
      setLoading(false)
      return
    }
    setLoading(false)
    router.push('/designer')
  }

  async function handleRegenerate() {
    setLoading(true)
    const res = await fetch('/api/designs/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: projectId }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      alert(`재생성 실패: ${body?.error ?? res.statusText}`)
    }
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="bg-surface rounded-xl border border-border p-5 sticky top-24 space-y-5">
      <div>
        <h3 className="font-semibold text-text-primary">최종 납품</h3>
        <p className="text-xs text-text-tertiary mt-0.5">Figma에서 완성한 최종 파일을 업로드하고 납품을 완료하세요</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">최종 납품 파일</label>
        <label className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 transition-all">
          <svg className="w-5 h-5 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <span className="text-sm text-text-tertiary">
            {file ? file.name : '파일을 선택하세요 (PNG/JPG/ZIP/PDF)'}
          </span>
          <input type="file" onChange={e => setFile(e.target.files?.[0] ?? null)} className="hidden" />
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">디자이너 메모</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="수정사항이나 특이사항을 기록하세요..."
          rows={3}
          className="w-full border border-border rounded-xl px-3 py-2.5 text-sm resize-none bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-text-tertiary"
        />
      </div>

      <div className="space-y-2.5">
        <button onClick={handleApprove} disabled={loading}
          className="w-full bg-emerald-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 shadow-sm transition-all flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          {loading ? '처리 중…' : '최종 승인 + 납품 완료'}
        </button>
        <button onClick={handleRegenerate} disabled={loading}
          className="w-full bg-surface-active text-text-secondary rounded-xl py-2.5 text-sm font-semibold hover:bg-gray-200 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
          </svg>
          AI 초안 재생성
        </button>
      </div>
    </div>
  )
}
