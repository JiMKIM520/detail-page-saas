'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Photo {
  id: string
  photo_type: string
  shooting_list_item: string | null
  storage_path: string
  is_retouched: boolean | null
}

export function ShootingList({
  projectId,
  photos,
}: {
  projectId: string
  photos: Photo[]
}) {
  const [uploading, setUploading] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function uploadPhoto(photoId: string, file: File) {
    setUploading(photoId)
    const path = `projects/${projectId}/${photoId}_${file.name}`
    const { error } = await supabase.storage.from('photos').upload(path, file)
    if (error) {
      alert(`업로드 실패: ${error.message}`)
      setUploading(null)
      return
    }
    await supabase
      .from('photos')
      .update({ storage_path: path })
      .eq('id', photoId)
    setUploading(null)
    router.refresh()
  }

  async function markAllUploaded() {
    const res = await fetch('/api/photography/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: projectId }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      alert(`촬영 완료 처리 실패: ${body?.error ?? res.statusText}`)
      return
    }
    router.push('/planner')
  }

  const nukki = photos.filter((p) => p.photo_type === 'nukki')
  const styling = photos.filter((p) => p.photo_type === 'styling')
  const allUploaded = photos.length > 0 && photos.every((p) => p.storage_path)

  return (
    <div className="space-y-8">
      {[
        { label: '누끼 컷', items: nukki, color: 'blue' },
        { label: '스타일링 컷', items: styling, color: 'violet' },
      ].map(({ label, items, color }) => (
        <div key={label}>
          <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full bg-${color}-500`} />
            {label}
            <span className="text-xs font-normal text-text-tertiary">{items.length}장</span>
          </h3>
          <div className="space-y-2">
            {items.map((photo) => (
              <div
                key={photo.id}
                className="flex items-center gap-4 bg-surface border border-border rounded-xl p-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {photo.shooting_list_item}
                  </p>
                  <p className="text-xs text-text-tertiary mt-0.5">
                    {photo.storage_path ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        업로드 완료
                      </span>
                    ) : (
                      <span className="text-amber-500">미업로드</span>
                    )}
                  </p>
                </div>
                {!photo.storage_path && (
                  <label className="cursor-pointer bg-primary-50 text-primary-600 border border-primary-200 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-primary-100 transition-colors flex-shrink-0">
                    {uploading === photo.id ? '업로드 중...' : '파일 선택'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        e.target.files?.[0] &&
                        uploadPhoto(photo.id, e.target.files[0])
                      }
                    />
                  </label>
                )}
              </div>
            ))}
            {items.length === 0 && (
              <p className="text-sm text-text-tertiary py-4 text-center">항목 없음</p>
            )}
          </div>
        </div>
      ))}

      {allUploaded && (
        <button
          onClick={markAllUploaded}
          className="w-full bg-primary-600 text-white rounded-xl py-3 font-semibold hover:bg-primary-700 shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          촬영 완료 — 디자인 생성 시작
        </button>
      )}
    </div>
  )
}
