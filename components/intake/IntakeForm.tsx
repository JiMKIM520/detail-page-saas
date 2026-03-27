'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

const schema = z.object({
  company_name: z.string().min(1, '기업명을 입력하세요'),
  homepage_url: z.string().url('올바른 URL을 입력하세요').optional().or(z.literal('')),
  detail_page_url: z.string().url('올바른 URL을 입력하세요').optional().or(z.literal('')),
  product_highlights: z.string().min(10, '강조 포인트를 10자 이상 입력하세요'),
  reference_notes: z.string().optional(),
  platform_id: z.string().uuid('플랫폼을 선택하세요'),
  category: z.string().min(1, '카테고리를 선택하세요'),
})

type FormData = z.infer<typeof schema>

interface Platform { id: string; name: string }

interface FileGroup {
  file_type: 'product_photo' | 'brochure' | 'detail_capture'
  files: File[]
}

const FILE_GROUPS: { type: FileGroup['file_type']; label: string; description: string; accept: string; required: boolean }[] = [
  {
    type: 'product_photo',
    label: '제품 사진',
    description: '제품 정면, 측면, 디테일 등 3~5장 권장',
    accept: 'image/*',
    required: true,
  },
  {
    type: 'brochure',
    label: '제품 소개서 / 카탈로그',
    description: 'PDF 또는 이미지 (제품 스펙, USP 등)',
    accept: 'image/*,.pdf',
    required: false,
  },
  {
    type: 'detail_capture',
    label: '기존 상세페이지 캡처',
    description: '현재 사용 중인 상세페이지 스크린샷',
    accept: 'image/*',
    required: false,
  },
]

export function IntakeForm({ platforms }: { platforms: Platform[] }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema)
  })
  const router = useRouter()
  const supabase = createClient()

  const [fileGroups, setFileGroups] = useState<Record<string, File[]>>({
    product_photo: [],
    brochure: [],
    detail_capture: [],
  })
  const [fileError, setFileError] = useState('')
  const [uploadProgress, setUploadProgress] = useState('')
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  function handleFileChange(type: string, e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || [])
    setFileGroups(prev => ({ ...prev, [type]: [...prev[type], ...selected] }))
    setFileError('')
  }

  function removeFile(type: string, index: number) {
    setFileGroups(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }))
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  async function uploadFiles(projectId: string): Promise<{ file_type: string; storage_path: string; file_name: string; mime_type: string; file_size: number }[]> {
    const results: { file_type: string; storage_path: string; file_name: string; mime_type: string; file_size: number }[] = []

    for (const [fileType, files] of Object.entries(fileGroups)) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const ext = file.name.split('.').pop() || 'bin'
        const path = `${projectId}/${fileType}/${Date.now()}_${i}.${ext}`

        setUploadProgress(`${fileType} 업로드 중... (${i + 1}/${files.length})`)

        const { error } = await supabase.storage
          .from('intake-files')
          .upload(path, file)

        if (error) throw new Error(`파일 업로드 실패: ${file.name} - ${error.message}`)

        results.push({
          file_type: fileType,
          storage_path: path,
          file_name: file.name,
          mime_type: file.type,
          file_size: file.size,
        })
      }
    }

    return results
  }

  async function onSubmit(data: FormData) {
    if (fileGroups.product_photo.length === 0) {
      setFileError('제품 사진을 최소 1장 업로드해주세요.')
      return
    }

    try {
      // 1. 프로젝트 생성
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('프로젝트 생성 실패')
      const project = await res.json()

      // 2. 파일 업로드
      setUploadProgress('파일 업로드 중...')
      const uploadedFiles = await uploadFiles(project.id)

      // 3. 파일 메타데이터 저장
      if (uploadedFiles.length > 0) {
        const fileRes = await fetch(`/api/projects/${project.id}/files`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ files: uploadedFiles }),
        })
        if (!fileRes.ok) throw new Error('파일 정보 저장 실패')
      }

      setUploadProgress('')
      router.push('/projects')
    } catch (err) {
      setUploadProgress('')
      setFileError(err instanceof Error ? err.message : '제출 중 오류가 발생했습니다.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* 기본 정보 */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">기업명 *</label>
            <input {...register('company_name')}
              className="w-full border rounded-lg px-4 py-2"
              placeholder="예: 홍길동 쇼핑몰" />
            {errors.company_name && <p className="text-red-500 text-sm mt-1">{errors.company_name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">판매 플랫폼 *</label>
              <select {...register('platform_id')} className="w-full border rounded-lg px-4 py-2">
                <option value="">선택하세요</option>
                {platforms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              {errors.platform_id && <p className="text-red-500 text-sm mt-1">{errors.platform_id.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">카테고리 *</label>
              <select {...register('category')} className="w-full border rounded-lg px-4 py-2">
                <option value="">선택하세요</option>
                {['식품', '패션', '뷰티', '생활용품', '전자제품', '기타'].map(c =>
                  <option key={c} value={c}>{c}</option>
                )}
              </select>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
            </div>
          </div>
        </div>
      </section>

      {/* 파일 업로드 */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">제품 자료 업로드</h2>
        <div className="space-y-6">
          {FILE_GROUPS.map(group => (
            <div key={group.type} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  {group.label} {group.required && <span className="text-red-500">*</span>}
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRefs.current[group.type]?.click()}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  + 파일 추가
                </button>
              </div>
              <p className="text-xs text-gray-400 mb-3">{group.description}</p>
              <input
                ref={el => { fileInputRefs.current[group.type] = el }}
                type="file"
                multiple
                accept={group.accept}
                onChange={e => handleFileChange(group.type, e)}
                className="hidden"
              />

              {fileGroups[group.type].length === 0 ? (
                <div
                  onClick={() => fileInputRefs.current[group.type]?.click()}
                  className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  <p className="text-sm text-gray-400">클릭하여 파일을 선택하세요</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {fileGroups[group.type].map((file, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs bg-gray-200 rounded px-1.5 py-0.5 flex-shrink-0">
                          {file.type.startsWith('image') ? 'IMG' : 'PDF'}
                        </span>
                        <span className="text-sm text-gray-700 truncate">{file.name}</span>
                        <span className="text-xs text-gray-400 flex-shrink-0">{formatSize(file.size)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(group.type, i)}
                        className="text-red-400 hover:text-red-600 text-sm flex-shrink-0 ml-2"
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        {fileError && <p className="text-red-500 text-sm mt-2">{fileError}</p>}
      </section>

      {/* 텍스트 정보 */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">추가 정보</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">강조 포인트 *</label>
            <textarea {...register('product_highlights')} rows={4}
              className="w-full border rounded-lg px-4 py-2"
              placeholder="제품의 핵심 특징, 강조하고 싶은 점, 경쟁 제품 대비 차별점 등을 구체적으로 입력하세요." />
            {errors.product_highlights && <p className="text-red-500 text-sm mt-1">{errors.product_highlights.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">홈페이지 URL</label>
              <input {...register('homepage_url')} className="w-full border rounded-lg px-4 py-2"
                placeholder="https://example.com" />
              {errors.homepage_url && <p className="text-red-500 text-sm mt-1">{errors.homepage_url.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">참조 상세페이지 URL</label>
              <input {...register('detail_page_url')} className="w-full border rounded-lg px-4 py-2"
                placeholder="https://smartstore.naver.com/..." />
              {errors.detail_page_url && <p className="text-red-500 text-sm mt-1">{errors.detail_page_url.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">기타 참고사항</label>
            <textarea {...register('reference_notes')} rows={3}
              className="w-full border rounded-lg px-4 py-2"
              placeholder="추가로 전달할 내용이 있다면 입력하세요." />
          </div>
        </div>
      </section>

      {/* 제출 */}
      <button type="submit" disabled={isSubmitting || !!uploadProgress}
        className="w-full bg-blue-600 text-white rounded-lg py-3 font-medium hover:bg-blue-700 disabled:opacity-50">
        {uploadProgress || (isSubmitting ? '제출 중...' : '작업 의뢰하기')}
      </button>
    </form>
  )
}
