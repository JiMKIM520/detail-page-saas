'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

/**
 * 디자이너 → 사업자 초안 전달 패널 (Figma 리터치본 업로드).
 * 이미지 업로드 → designs/projects/{id}/client_draft/ → /api/designs/send-draft
 *   → designs.preview_url 설정(사업자 화면 노출) + 사업자에게 확인 메일.
 */
export function SendDraftPanel({
  projectId, designId, alreadySent,
}: { projectId: string; designId?: string; alreadySent?: boolean }) {
  const [file, setFile] = useState<File | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState<{ emailed: boolean; emailError?: string } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function send() {
    if (!file) { alert('전달할 초안 이미지를 선택하세요.'); return }
    if (!designId) { alert('초안(design)이 아직 없습니다. 먼저 초안을 생성하세요.'); return }
    setLoading(true)
    try {
      const path = `projects/${projectId}/client_draft/${Date.now()}_${file.name}`
      const { error: upErr } = await supabase.storage.from('designs').upload(path, file, { upsert: true })
      if (upErr) { alert(`업로드 실패: ${upErr.message}`); return }
      const { data } = supabase.storage.from('designs').getPublicUrl(path)

      const res = await fetch('/api/designs/send-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, design_id: designId, preview_url: data.publicUrl, notes }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) { alert(`전달 실패: ${json?.error ?? res.statusText}`); return }
      setDone({ emailed: json?.emailed ?? false, emailError: json?.emailError })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
      <div>
        <h3 className="font-semibold text-text-primary">사업자에게 초안 전달</h3>
        <p className="text-xs text-text-tertiary mt-0.5">
          Figma 리터치본(이미지)을 올리면 사업자 화면에 노출되고 확인 메일이 발송됩니다.
        </p>
      </div>

      {alreadySent && !done && (
        <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          이미 사업자에게 전달된 초안이 있습니다. 새 파일을 올리면 <b>수정본(다음 회차)</b>으로 전달됩니다.
        </p>
      )}

      <label className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 transition-all">
        <svg className="w-5 h-5 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        <span className="text-sm text-text-tertiary">{file ? file.name : '초안 이미지 선택 (PNG/JPG)'}</span>
        <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] ?? null)} className="hidden" />
      </label>

      <textarea value={notes} onChange={e => setNotes(e.target.value)}
        placeholder="사업자에게 전할 메모(선택)…" rows={2}
        className="w-full border border-border rounded-xl px-3 py-2 text-sm resize-none bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-text-tertiary" />

      <button onClick={send} disabled={loading}
        className="w-full bg-primary-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
        {loading ? '전달 중…' : '사업자에게 전달 + 메일'}
      </button>

      {done && (
        <p className={`text-xs rounded-lg px-3 py-2 ${done.emailed ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-amber-700 bg-amber-50 border border-amber-200'}`}>
          {done.emailed
            ? '✓ 사업자에게 전달 + 확인 메일 발송 완료'
            : `✓ 사업자 화면에 노출됨 · 메일 미발송(${done.emailError ?? 'RESEND_API_KEY 미설정'})`}
        </p>
      )}
    </div>
  )
}
