'use client'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useState, useRef, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getCompatibility, getCompatibilityLabel, isBlocked, isWarning } from '@/lib/ai/prompts/compatibility'

const schema = z.object({
  company_name: z.string().min(1, '기업명을 입력하세요'),
  homepage_url: z.string().url('올바른 URL을 입력하세요').optional().or(z.literal('')),
  detail_page_url: z.string().url('올바른 URL을 입력하세요').optional().or(z.literal('')),
  product_highlights: z.string().min(10, '강조 포인트를 10자 이상 입력하세요'),
  reference_notes: z.string().optional(),
  platform_id: z.string().uuid('플랫폼을 선택하세요'),
  category_id: z.string().uuid('카테고리를 선택하세요'),
})

type FormData = z.infer<typeof schema>

interface Platform { id: string; name: string; slug: string }
interface Category { id: string; name: string; slug: string }

interface FileGroup {
  file_type: 'product_photo' | 'brochure' | 'detail_capture'
  files: File[]
}

const FILE_GROUPS: { type: FileGroup['file_type']; label: string; description: string; accept: string; required: boolean; icon: string }[] = [
  {
    type: 'product_photo',
    label: '제품 사진',
    description: '제품 정면, 측면, 디테일 등 3~5장 권장',
    accept: 'image/*',
    required: true,
    icon: 'photo',
  },
  {
    type: 'brochure',
    label: '제품 소개서 / 카탈로그',
    description: 'PDF 또는 이미지 (제품 스펙, USP 등)',
    accept: 'image/*,.pdf',
    required: false,
    icon: 'document',
  },
  {
    type: 'detail_capture',
    label: '기존 상세페이지 캡처',
    description: '현재 사용 중인 상세페이지 스크린샷',
    accept: 'image/*',
    required: false,
    icon: 'capture',
  },
]

function FileIcon({ type }: { type: string }) {
  if (type === 'photo') return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
    </svg>
  )
  if (type === 'document') return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  )
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
    </svg>
  )
}

export function IntakeForm({ platforms, categories }: { platforms: Platform[]; categories: Category[] }) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, control } = useForm<FormData>({
    resolver: zodResolver(schema)
  })
  const router = useRouter()
  const supabase = createClient()

  const selectedCategoryId = useWatch({ control, name: 'category_id' })
  const selectedPlatformId = useWatch({ control, name: 'platform_id' })

  const compatibility = useMemo(() => {
    const cat = categories.find(c => c.id === selectedCategoryId)
    const plat = platforms.find(p => p.id === selectedPlatformId)
    if (!cat || !plat) return null
    const compat = getCompatibility(cat.slug, plat.slug)
    const label = getCompatibilityLabel(compat)
    const blocked = isBlocked(cat.slug, plat.slug)
    const warning = isWarning(cat.slug, plat.slug)
    return { compat, label, blocked, warning }
  }, [selectedCategoryId, selectedPlatformId, categories, platforms])

  const [fileGroups, setFileGroups] = useState<Record<string, File[]>>({
    product_photo: [],
    brochure: [],
    detail_capture: [],
  })
  const [fileError, setFileError] = useState('')
  const [uploadProgress, setUploadProgress] = useState('')
  const [apiError, setApiError] = useState('')
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

  async function uploadFiles(projectId: string) {
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

    // 조합 검증: blocked 조합 차단
    if (compatibility?.blocked) {
      setApiError('선택한 카테고리와 플랫폼 조합은 지원되지 않습니다. 다른 조합을 선택해주세요.')
      return
    }

    setApiError('')

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || '프로젝트 생성 실패')
      }
      const project = await res.json()

      setUploadProgress('파일 업로드 중...')
      const uploadedFiles = await uploadFiles(project.id)

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
      setApiError(err instanceof Error ? err.message : '제출 중 오류가 발생했습니다.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
      {apiError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-red-600 text-sm">{apiError}</p>
        </div>
      )}

      {/* Step 1: 기본 정보 */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-xs font-bold text-white">1</span>
          </div>
          <h2 className="text-lg font-semibold text-text-primary">기본 정보</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">기업명 *</label>
            <input {...register('company_name')}
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-text-tertiary"
              placeholder="예: 홍길동 쇼핑몰" />
            {errors.company_name && <p className="text-red-500 text-sm mt-1.5">{errors.company_name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">판매 플랫폼 *</label>
              <select {...register('platform_id')}
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                <option value="">선택하세요</option>
                {platforms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              {errors.platform_id && <p className="text-red-500 text-sm mt-1.5">{errors.platform_id.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">카테고리 *</label>
              <select {...register('category_id')}
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                <option value="">선택하세요</option>
                {categories.map(c =>
                  <option key={c.id} value={c.id}>{c.name}</option>
                )}
              </select>
              {errors.category_id && <p className="text-red-500 text-sm mt-1.5">{errors.category_id.message}</p>}
            </div>
          </div>

          {compatibility && (
            <div className={`rounded-xl px-4 py-3 text-sm ${
              compatibility.blocked
                ? 'bg-red-50 border border-red-200 text-red-700'
                : compatibility.warning
                  ? 'bg-amber-50 border border-amber-200 text-amber-700'
                  : 'bg-green-50 border border-green-200 text-green-700'
            }`}>
              <span className="font-semibold">{compatibility.label.emoji} {compatibility.label.label}</span>
              <span className="ml-2">{compatibility.label.description}</span>
              {compatibility.blocked && (
                <p className="mt-1 font-medium">이 조합으로는 의뢰할 수 없습니다. 다른 플랫폼을 선택해주세요.</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Step 2: 파일 업로드 */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-xs font-bold text-white">2</span>
          </div>
          <h2 className="text-lg font-semibold text-text-primary">제품 자료 업로드</h2>
        </div>
        <div className="space-y-5">
          {FILE_GROUPS.map(group => (
            <div key={group.type} className="border border-border rounded-xl p-5 bg-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="text-text-tertiary">
                    <FileIcon type={group.icon} />
                  </div>
                  <label className="text-sm font-semibold text-text-primary">
                    {group.label} {group.required && <span className="text-red-500">*</span>}
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRefs.current[group.type]?.click()}
                  className="text-sm text-primary-600 hover:text-primary-700 font-semibold"
                >
                  + 파일 추가
                </button>
              </div>
              <p className="text-xs text-text-tertiary mb-3">{group.description}</p>
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
                  className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 transition-all"
                >
                  <svg className="w-8 h-8 text-text-tertiary mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <p className="text-sm text-text-tertiary">클릭하여 파일을 선택하세요</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {fileGroups[group.type].map((file, i) => (
                    <div key={i} className="flex items-center justify-between bg-surface-active rounded-lg px-3 py-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs bg-primary-100 text-primary-700 font-medium rounded px-1.5 py-0.5 flex-shrink-0">
                          {file.type.startsWith('image') ? 'IMG' : 'PDF'}
                        </span>
                        <span className="text-sm text-text-primary truncate">{file.name}</span>
                        <span className="text-xs text-text-tertiary flex-shrink-0">{formatSize(file.size)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(group.type, i)}
                        className="text-text-tertiary hover:text-red-500 flex-shrink-0 ml-2 p-1 rounded hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
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

      {/* Step 3: 추가 정보 */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-xs font-bold text-white">3</span>
          </div>
          <h2 className="text-lg font-semibold text-text-primary">추가 정보</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">강조 포인트 *</label>
            <textarea {...register('product_highlights')} rows={4}
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-text-tertiary resize-none"
              placeholder="제품의 핵심 특징, 강조하고 싶은 점, 경쟁 제품 대비 차별점 등을 구체적으로 입력하세요." />
            {errors.product_highlights && <p className="text-red-500 text-sm mt-1.5">{errors.product_highlights.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">홈페이지 URL</label>
              <input {...register('homepage_url')}
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-text-tertiary"
                placeholder="https://example.com" />
              {errors.homepage_url && <p className="text-red-500 text-sm mt-1.5">{errors.homepage_url.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">참조 상세페이지 URL</label>
              <input {...register('detail_page_url')}
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-text-tertiary"
                placeholder="https://smartstore.naver.com/..." />
              {errors.detail_page_url && <p className="text-red-500 text-sm mt-1.5">{errors.detail_page_url.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">기타 참고사항</label>
            <textarea {...register('reference_notes')} rows={3}
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-text-tertiary resize-none"
              placeholder="추가로 전달할 내용이 있다면 입력하세요." />
          </div>
        </div>
      </section>

      {/* 제출 */}
      <div className="pt-2">
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-4">
          <p className="text-blue-700 text-sm font-medium">기업당 1건의 상세페이지 제작이 제공됩니다. 신중하게 입력해주세요.</p>
        </div>
        <button type="submit" disabled={isSubmitting || !!uploadProgress}
          className="w-full bg-primary-600 text-white rounded-xl py-3.5 font-semibold hover:bg-primary-700 disabled:opacity-50 shadow-sm hover:shadow-md transition-all text-base">
          {uploadProgress || (isSubmitting ? '제출 중...' : '작업 의뢰하기')}
        </button>
        <p className="text-xs text-text-tertiary text-center mt-3">
          제출 후 AI가 자동으로 스크립트를 생성합니다
        </p>
      </div>
    </form>
  )
}
