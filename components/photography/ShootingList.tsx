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
    <div className="space-y-6">
      {[
        { label: '누끼 컷', items: nukki },
        { label: '스타일링 컷', items: styling },
      ].map(({ label, items }) => (
        <div key={label}>
          <h3 className="font-semibold text-gray-900 mb-3">{label}</h3>
          <div className="space-y-2">
            {items.map((photo) => (
              <div
                key={photo.id}
                className="flex items-center gap-4 bg-white border rounded-lg p-4"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    {photo.shooting_list_item}
                  </p>
                  <p className="text-xs text-gray-400">
                    {photo.storage_path ? '업로드 완료' : '미업로드'}
                  </p>
                </div>
                {!photo.storage_path && (
                  <label className="cursor-pointer bg-blue-50 text-blue-600 border border-blue-200 rounded-lg px-3 py-1 text-sm hover:bg-blue-100">
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
          </div>
        </div>
      ))}

      {allUploaded && (
        <button
          onClick={markAllUploaded}
          className="w-full bg-indigo-600 text-white rounded-lg py-3 font-medium hover:bg-indigo-700"
        >
          촬영 완료 → 디자인 생성 시작
        </button>
      )}
    </div>
  )
}
