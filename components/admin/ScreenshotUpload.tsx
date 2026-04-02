'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

type Status = 'idle' | 'uploading' | 'done' | 'error'

export function ScreenshotUpload({ projectId }: { projectId: string }) {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setStatus('uploading')
    setErrorMsg('')

    try {
      const supabase = createClient()
      const uploaded: { file_type: string; storage_path: string; file_name: string; mime_type: string; file_size: number }[] = []

      const ts = Date.now()
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const ext = file.name.split('.').pop() || 'bin'
        const path = `${projectId}/admin-screenshot-${ts}-${i}.${ext}`
        const { error } = await supabase.storage.from('intake-files').upload(path, file)
        if (error) throw new Error(`업로드 실패: ${file.name} - ${error.message}`)
        uploaded.push({
          file_type: 'detail_capture',
          storage_path: path,
          file_name: file.name,
          mime_type: file.type,
          file_size: file.size,
        })
      }

      const res = await fetch(`/api/projects/${projectId}/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: uploaded }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || '파일 정보 저장 실패')
      }

      setStatus('done')
      if (inputRef.current) inputRef.current.value = ''
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : '업로드 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className="border border-border rounded-xl p-4 bg-white">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleChange}
      />

      {status === 'done' ? (
        <p className="text-sm text-emerald-700 font-medium">
          업로드 완료! 스크립트를 재생성하면 반영됩니다.
        </p>
      ) : (
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={status === 'uploading'}
            onClick={() => inputRef.current?.click()}
            className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {status === 'uploading' ? '업로드 중...' : '스크린샷 업로드'}
          </button>
          {status === 'error' && (
            <p className="text-sm text-red-600">{errorMsg}</p>
          )}
        </div>
      )}
    </div>
  )
}
