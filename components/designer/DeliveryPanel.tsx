'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function DeliveryPanel({ projectId, designId }: { projectId: string; designId?: string }) {
  const [notes, setNotes] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleApprove() {
    setLoading(true)
    let outputUrl = null

    if (file) {
      const path = `projects/${projectId}/final_${file.name}`
      const { error } = await supabase.storage.from('designs').upload(path, file)
      if (error) {
        alert(`파일 업로드 실패: ${error.message}`)
        setLoading(false)
        return
      }
      const { data } = supabase.storage.from('designs').getPublicUrl(path)
      outputUrl = data.publicUrl
    }

    const res = await fetch('/api/designs/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: projectId,
        design_id: designId,
        action: 'approve',
        notes,
        output_url: outputUrl,
      }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      alert(`승인 처리 실패: ${body?.error ?? res.statusText}`)
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
    <div className="bg-white rounded-xl border p-5 sticky top-6 space-y-4">
      <h3 className="font-semibold text-gray-900">디자이너 검수</h3>
      <div>
        <label className="text-sm text-gray-600 mb-1 block">최종 납품 파일 업로드</label>
        <input type="file" onChange={e => setFile(e.target.files?.[0] ?? null)}
          className="w-full text-sm" />
      </div>
      <textarea value={notes} onChange={e => setNotes(e.target.value)}
        placeholder="디자이너 메모..." rows={3}
        className="w-full border rounded-lg px-3 py-2 text-sm resize-none" />
      <div className="space-y-2">
        <button onClick={handleApprove} disabled={loading}
          className="w-full bg-emerald-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-emerald-700 disabled:opacity-50">
          승인 + 납품 완료
        </button>
        <button onClick={handleRegenerate} disabled={loading}
          className="w-full bg-gray-200 text-gray-700 rounded-lg py-2 text-sm font-medium hover:bg-gray-300 disabled:opacity-50">
          디자인 재생성
        </button>
      </div>
    </div>
  )
}
