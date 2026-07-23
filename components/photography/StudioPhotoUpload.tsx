'use client'

/**
 * 촬영 누끼 업로드 (포토그래퍼용) — 구글시트/드라이브 수기 연동 대체.
 * 제품 수령 후 촬영·누끼 작업본을 프로젝트에 직접 등록하면 파이프라인이
 * 사업자 업로드 원본 대신 이 컷을 레퍼런스로 사용한다(fetchProductRefFiles).
 */

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface StudioPhotoUploadProps {
  projectId: string
  existingCount: number
}

export function StudioPhotoUpload({ projectId, existingCount }: StudioPhotoUploadProps) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  async function handleFiles(fileList: FileList | null): Promise<void> {
    const files = Array.from(fileList ?? [])
    if (files.length === 0) return
    const oversize = files.find((f) => f.size > 20 * 1024 * 1024)
    if (oversize) {
      setMessage(`✗ ${oversize.name} — 20MB 초과`)
      return
    }
    setBusy(true)
    setMessage(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('로그인이 필요합니다')

      const uploadId = crypto.randomUUID()
      const rows: { file_type: string; storage_path: string; file_name: string; mime_type: string; file_size: number }[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setMessage(`업로드 중… ${i + 1}/${files.length}`)
        const ext = file.name.split('.').pop() || 'png'
        // 경로 규약: {userId}/{uploadId}/{fileType}/... — storage RLS는 첫 폴더가 본인 uid일 때만 쓰기 허용
        const path = `${user.id}/${uploadId}/studio_photo/${Date.now()}_${i}.${ext}`
        const { error } = await supabase.storage.from('intake-files').upload(path, file)
        if (error) throw new Error(`${file.name}: ${error.message}`)
        rows.push({ file_type: 'studio_photo', storage_path: path, file_name: file.name, mime_type: file.type, file_size: file.size })
      }

      const res = await fetch(`/api/projects/${projectId}/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: rows }),
      })
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(j.error ?? `HTTP ${res.status}`)
      }
      setMessage(`✓ ${rows.length}장 등록 완료`)
      router.refresh()
    } catch (err) {
      setMessage(`✗ ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="flex items-center gap-2">
      {message && (
        <span className={`text-xs ${message.startsWith('✗') ? 'text-red-600' : 'text-emerald-600'}`}>{message}</span>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className={`text-xs px-3 py-1.5 rounded-lg border font-medium whitespace-nowrap transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          existingCount > 0
            ? 'bg-white text-text-secondary border-border hover:border-emerald-400'
            : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
        }`}
      >
        {busy ? '업로드 중…' : existingCount > 0 ? `누끼 추가 (${existingCount}장 등록됨)` : '촬영 누끼 업로드'}
      </button>
    </div>
  )
}
