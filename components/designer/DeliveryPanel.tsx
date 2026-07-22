'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * 최종 단계 패널 (역할 분리).
 * - mode='designer': 최종본 업로드 → 관리자 검수요청(action finalize). + AI 초안 재생성.
 * - mode='admin':    디자이너 제출 최종본 확인 → 사업자에게 최종 발송(action approve, delivered+메일).
 */
export function DeliveryPanel({
  projectId, designId, mode, finalUrl, finalSubmitted,
}: {
  projectId: string
  designId?: string
  mode: 'designer' | 'admin'
  finalUrl?: string | null
  finalSubmitted?: boolean
}) {
  const [notes, setNotes] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState<string | null>(null)
  const router = useRouter()

  async function submit(action: 'finalize' | 'approve') {
    if (action === 'finalize' && !file) { alert('최종본 파일을 선택하세요.'); return }
    if (action === 'approve' && !file && !finalUrl) { alert('발송할 최종본이 없습니다. 디자이너 제출본을 확인하세요.'); return }
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('project_id', projectId)
      if (designId) fd.append('design_id', designId)
      fd.append('action', action)
      fd.append('notes', notes)
      if (file) fd.append('file', file)
      const res = await fetch('/api/designs/review', { method: 'POST', body: fd })
      const body = await res.json().catch(() => null)
      if (!res.ok) { alert(`처리 실패: ${body?.error ?? res.statusText}`); return }
      if (action === 'finalize') { setDone('✓ 최종본 제출 완료 — 관리자 검수 대기'); router.refresh() }
      else { router.push('/designer') }
    } finally {
      setLoading(false)
    }
  }

  async function regenerate() {
    setLoading(true)
    const res = await fetch('/api/designs/generate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: projectId }),
    })
    if (!res.ok) { const b = await res.json().catch(() => null); alert(`재생성 실패: ${b?.error ?? res.statusText}`) }
    setLoading(false); router.refresh()
  }

  // ── 관리자: 최종 검수·발송 ──
  if (mode === 'admin') {
    return (
      <div className="bg-surface rounded-xl border border-border p-5 sticky top-24 space-y-5">
        <div>
          <h3 className="font-semibold text-text-primary">최종 검수 · 발송</h3>
          <p className="text-xs text-text-tertiary mt-0.5">디자이너 최종본을 확인하고 사업자에게 발송합니다</p>
        </div>

        {finalSubmitted && finalUrl ? (
          // /draft 라우트로 봐야 정상 렌더 — output_url(스토리지 직접)은 Supabase가 text/plain으로
          // 강제 서빙해 HTML 소스가 날것으로 노출된다(관리자가 '이상하다'고 본 원인)
          <a href={`/draft/${projectId}`} target="_blank" rel="noreferrer"
            className="block text-center text-sm border border-emerald-300 text-emerald-700 bg-emerald-50 rounded-lg py-2 hover:bg-emerald-100 transition-all">
            🔍 디자이너 최종본 확인
          </a>
        ) : (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            아직 디자이너가 최종본을 제출하지 않았습니다. (직접 파일을 올려 발송할 수도 있습니다)
          </p>
        )}

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">최종본 교체(선택)</label>
          <label className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl p-3 cursor-pointer hover:border-primary-400 transition-all">
            <span className="text-sm text-text-tertiary">{file ? file.name : '파일 선택 (PNG/JPG/ZIP/PDF)'}</span>
            <input type="file" onChange={e => setFile(e.target.files?.[0] ?? null)} className="hidden" />
          </label>
        </div>

        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="관리자 메모(선택)…" rows={2}
          className="w-full border border-border rounded-xl px-3 py-2 text-sm resize-none bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-text-tertiary" />

        <button onClick={() => submit('approve')} disabled={loading}
          className="w-full bg-emerald-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 shadow-sm transition-all">
          {loading ? '발송 중…' : '사업자에게 최종 발송 + 메일'}
        </button>
      </div>
    )
  }

  // ── 디자이너: 최종본 제출(관리자 검수요청) ──
  return (
    <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
      <div>
        <h3 className="font-semibold text-text-primary">최종본 제출</h3>
        <p className="text-xs text-text-tertiary mt-0.5">사업자 확인이 끝난 최종본을 올려 관리자에게 검수 요청합니다</p>
      </div>

      {finalSubmitted && (
        <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          최종본이 제출되어 관리자 검수 대기 중입니다. 새 파일을 올리면 교체됩니다.
        </p>
      )}

      <label className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 transition-all">
        <svg className="w-5 h-5 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        <span className="text-sm text-text-tertiary">{file ? file.name : '최종본 파일 선택 (PNG/JPG/ZIP/PDF)'}</span>
        <input type="file" onChange={e => setFile(e.target.files?.[0] ?? null)} className="hidden" />
      </label>

      <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="관리자에게 전할 메모(선택)…" rows={2}
        className="w-full border border-border rounded-xl px-3 py-2 text-sm resize-none bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-text-tertiary" />

      <div className="space-y-2.5">
        <button onClick={() => submit('finalize')} disabled={loading}
          className="w-full bg-emerald-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 shadow-sm transition-all">
          {loading ? '제출 중…' : '최종본 제출 → 관리자 검수요청'}
        </button>
        <button onClick={regenerate} disabled={loading}
          className="w-full bg-surface-active text-text-secondary rounded-xl py-2.5 text-sm font-semibold hover:bg-gray-200 disabled:opacity-50 transition-all">
          AI 초안 재생성
        </button>
      </div>

      {done && <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">{done}</p>}
    </div>
  )
}
