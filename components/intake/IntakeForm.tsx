'use client'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useState, useRef, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getCompatibility, getCompatibilityLabel, isBlocked, isWarning } from '@/lib/ai/prompts/compatibility'

const schema = z.object({
  // Step 1 — 기업 & 브랜드 정보
  company_name: z.string().min(1, '기업명을 입력하세요'),
  product_highlights: z.string().min(10, '사업 소개를 10자 이상 입력하세요'),
  brand_name: z.string().optional(),
  // Step 2 — 상품 정보
  platform_id: z.string().uuid('플랫폼을 선택하세요'),
  category_id: z.string().uuid('카테고리를 선택하세요'),
  // Step 3 — 디자인 선호도
  design_preference: z.string().optional(),
  homepage_url: z.string().url('올바른 URL을 입력하세요').optional().or(z.literal('')),
  detail_page_url: z.string().url('올바른 URL을 입력하세요').optional().or(z.literal('')),
  reference_notes: z.string().optional(),
  consent: z.literal(true, { error: '동의가 필요합니다' }),
})

type FormData = z.infer<typeof schema>

interface Platform { id: string; name: string; slug: string }
interface Category { id: string; name: string; slug: string }

const AGE_OPTIONS = ['20대', '30대', '40대', '50대', '60대 이상']
const GENDER_OPTIONS = ['남성', '여성', '무관']

const STEP_LABELS = ['기업 & 브랜드 정보', '상품 정보', '디자인 선호도']

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEP_LABELS.map((label, i) => {
        const step = i + 1
        const done = step < current
        const active = step === current
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                done ? 'bg-primary-600 text-white' : active ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {done ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : step}
              </div>
              <span className={`text-xs mt-1.5 font-medium whitespace-nowrap hidden sm:inline ${active ? 'text-primary-700' : 'text-text-tertiary'}`}>
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-2 mb-5 transition-colors ${done ? 'bg-primary-600' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function FileUploadArea({
  label, description, accept, required, multiple = true, maxFiles,
  files, onAdd, onRemove,
}: {
  label: string; description: string; accept: string; required?: boolean; multiple?: boolean; maxFiles?: number
  files: File[]; onAdd: (files: File[]) => void; onRemove: (index: number) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const atMax = maxFiles !== undefined && files.length >= maxFiles

  function formatSize(bytes: number) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  return (
    <div className="border border-border rounded-xl p-4 bg-white">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold text-text-primary">
          {label} {required && <span className="text-red-500">*</span>}
          {maxFiles && <span className="text-xs text-text-tertiary ml-1">(최대 {maxFiles}개)</span>}
        </label>
        {!atMax && (
          <button type="button" onClick={() => inputRef.current?.click()}
            className="text-sm text-primary-600 hover:text-primary-700 font-semibold min-h-[44px]">
            + 파일 추가
          </button>
        )}
      </div>
      <p className="text-xs text-text-tertiary mb-3">{description}</p>
      <input ref={inputRef} type="file" multiple={multiple} accept={accept} className="hidden"
        onChange={e => { onAdd(Array.from(e.target.files || [])); e.target.value = '' }} />

      {files.length === 0 ? (
        <div onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 transition-all">
          <svg className="w-7 h-7 text-text-tertiary mx-auto mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <p className="text-sm text-text-tertiary">클릭하여 파일을 선택하세요</p>
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file, i) => (
            <div key={i} className="flex items-center justify-between bg-surface-active rounded-lg px-3 py-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs bg-primary-100 text-primary-700 font-medium rounded px-1.5 py-0.5 flex-shrink-0">
                  {file.type.startsWith('image') ? 'IMG' : 'PDF'}
                </span>
                <span className="text-sm text-text-primary truncate">{file.name}</span>
                <span className="text-xs text-text-tertiary flex-shrink-0">{formatSize(file.size)}</span>
              </div>
              <button type="button" onClick={() => onRemove(i)}
                className="text-text-tertiary hover:text-red-500 flex-shrink-0 ml-2 p-1 rounded hover:bg-red-50 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          {!atMax && (
            <button type="button" onClick={() => inputRef.current?.click()}
              className="w-full text-sm text-text-tertiary hover:text-primary-600 py-2 rounded-lg border border-dashed border-border hover:border-primary-300 transition-colors">
              + 추가
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export function IntakeForm({ platforms, categories }: { platforms: Platform[]; categories: Category[] }) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, control, trigger, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { consent: undefined as unknown as true },
  })
  const router = useRouter()
  const supabase = createClient()

  const [currentStep, setCurrentStep] = useState(1)
  const [hasBrand, setHasBrand] = useState<boolean | null>(null)
  const [targetAudience, setTargetAudience] = useState<string[]>([])

  const [fileGroups, setFileGroups] = useState<Record<string, File[]>>({
    product_photo: [],
    brochure: [],
    detail_capture: [],
    brand_logo: [],
    reference_design: [],
  })

  const [fileError, setFileError] = useState('')
  const [uploadProgress, setUploadProgress] = useState('')
  const [apiError, setApiError] = useState('')

  function addFiles(type: string, newFiles: File[]) {
    setFileGroups(prev => ({ ...prev, [type]: [...prev[type], ...newFiles] }))
    setFileError('')
  }
  function removeFile(type: string, index: number) {
    setFileGroups(prev => ({ ...prev, [type]: prev[type].filter((_, i) => i !== index) }))
  }

  function toggleAudience(val: string) {
    setTargetAudience(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val])
  }

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

  const STEP_FIELDS: Record<number, (keyof FormData)[]> = {
    1: ['company_name', 'product_highlights'],
    2: ['platform_id', 'category_id'],
    3: ['consent', 'homepage_url', 'detail_page_url'],
  }

  async function goNext() {
    const valid = await trigger(STEP_FIELDS[currentStep])
    if (currentStep === 2) {
      if (fileGroups.product_photo.length === 0) {
        setFileError('제품 사진을 최소 1장 업로드해주세요.')
        return
      }
      if (compatibility?.blocked) {
        return
      }
    }
    if (valid) {
      setFileError('')
      setCurrentStep(s => s + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  async function uploadFiles(projectId: string) {
    const results: { file_type: string; storage_path: string; file_name: string; mime_type: string; file_size: number }[] = []
    for (const [fileType, files] of Object.entries(fileGroups)) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const ext = file.name.split('.').pop() || 'bin'
        const path = `${projectId}/${fileType}/${Date.now()}_${i}.${ext}`
        setUploadProgress(`파일 업로드 중... (${fileType})`)
        const { error } = await supabase.storage.from('intake-files').upload(path, file)
        if (error) throw new Error(`파일 업로드 실패: ${file.name} - ${error.message}`)
        results.push({ file_type: fileType, storage_path: path, file_name: file.name, mime_type: file.type, file_size: file.size })
      }
    }
    return results
  }

  async function onSubmit(data: FormData) {
    if (compatibility?.blocked) {
      setApiError('선택한 카테고리와 플랫폼 조합은 지원되지 않습니다.')
      return
    }
    setApiError('')

    // target_audience를 reference_notes에 append
    const audienceNote = targetAudience.length > 0 ? `[타겟 고객층: ${targetAudience.join(', ')}]` : ''
    const finalNotes = [audienceNote, data.reference_notes].filter(Boolean).join('\n')

    const payload = {
      company_name: data.company_name,
      product_highlights: data.product_highlights,
      brand_name: data.brand_name || null,
      platform_id: data.platform_id,
      category_id: data.category_id,
      design_preference: data.design_preference || null,
      homepage_url: data.homepage_url || null,
      detail_page_url: data.detail_page_url || null,
      reference_notes: finalNotes || null,
      target_audience: targetAudience.length > 0 ? targetAudience : null,
    }

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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

  const inputCls = "w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-text-tertiary"
  const textareaCls = `${inputCls} resize-none`

  return (
    <div>
      <StepIndicator current={currentStep} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {apiError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-red-600 text-sm">{apiError}</p>
          </div>
        )}

        {/* ── Step 1: 기업 & 브랜드 정보 ── */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">기업명 *</label>
              <input {...register('company_name')} className={inputCls} placeholder="예: 홍길동 쇼핑몰" />
              {errors.company_name && <p className="text-red-500 text-sm mt-1.5">{errors.company_name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">사업 소개 *</label>
              <textarea {...register('product_highlights')} rows={4} className={textareaCls}
                placeholder="어떤 사업을 하시나요? 주력 제품, 핵심 강점, 고객에게 전달하고 싶은 가치를 입력하세요." />
              {errors.product_highlights && <p className="text-red-500 text-sm mt-1.5">{errors.product_highlights.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">브랜드 유무 *</label>
              <div className="flex gap-3">
                {[{ val: true, label: '브랜드 있음' }, { val: false, label: '브랜드 없음 (상호명 사용)' }].map(opt => (
                  <button key={String(opt.val)} type="button"
                    onClick={() => setHasBrand(opt.val)}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      hasBrand === opt.val
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-text-secondary border-border hover:border-primary-300'
                    }`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {hasBrand === true && (
              <div className="space-y-4 pl-4 border-l-2 border-primary-200">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">브랜드명</label>
                  <input {...register('brand_name')} className={inputCls} placeholder="예: KOMPA" />
                </div>
                <FileUploadArea
                  label="브랜드 로고" description="로고 이미지 파일 (PNG, SVG 권장)"
                  accept="image/*" required={false}
                  files={fileGroups.brand_logo}
                  onAdd={f => addFiles('brand_logo', f)}
                  onRemove={i => removeFile('brand_logo', i)}
                />
              </div>
            )}

            <FileUploadArea
              label="기업 소개서 / 카탈로그" description="PDF 또는 이미지 (제품 스펙, USP 등 포함)"
              accept="image/*,.pdf" required={false}
              files={fileGroups.brochure}
              onAdd={f => addFiles('brochure', f)}
              onRemove={i => removeFile('brochure', i)}
            />
          </div>
        )}

        {/* ── Step 2: 상품 정보 ── */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">판매 플랫폼 *</label>
                <select {...register('platform_id')} className={inputCls}>
                  <option value="">선택하세요</option>
                  {platforms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                {errors.platform_id && <p className="text-red-500 text-sm mt-1.5">{errors.platform_id.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">카테고리 *</label>
                <select {...register('category_id')} className={inputCls}>
                  <option value="">선택하세요</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">타겟 고객층</label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {AGE_OPTIONS.map(age => (
                    <button key={age} type="button" onClick={() => toggleAudience(age)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                        targetAudience.includes(age)
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-text-secondary border-border hover:border-primary-300'
                      }`}>
                      {age}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {GENDER_OPTIONS.map(g => (
                    <button key={g} type="button" onClick={() => toggleAudience(g)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                        targetAudience.includes(g)
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-text-secondary border-border hover:border-primary-300'
                      }`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <FileUploadArea
              label="제품 사진" description="제품 정면, 측면, 디테일 등 3~5장 권장"
              accept="image/*" required
              files={fileGroups.product_photo}
              onAdd={f => addFiles('product_photo', f)}
              onRemove={i => removeFile('product_photo', i)}
            />
            {fileError && <p className="text-red-500 text-sm -mt-2">{fileError}</p>}

            <FileUploadArea
              label="기존 상세페이지 캡처" description="현재 사용 중인 상세페이지 스크린샷 (선택)"
              accept="image/*" required={false}
              files={fileGroups.detail_capture}
              onAdd={f => addFiles('detail_capture', f)}
              onRemove={i => removeFile('detail_capture', i)}
            />
          </div>
        )}

        {/* ── Step 3: 디자인 선호도 ── */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">선호 색상 / 디자인 느낌</label>
              <textarea {...register('design_preference')} rows={3} className={textareaCls}
                placeholder="예: 깔끔하고 모던한 느낌, 민트+화이트 계열, 고급스러운 분위기" />
            </div>

            <FileUploadArea
              label="레퍼런스 디자인 이미지" description="참고하고 싶은 상세페이지 이미지를 업로드해주세요 (최대 3개)"
              accept="image/*" required={false} maxFiles={3}
              files={fileGroups.reference_design}
              onAdd={f => {
                const remain = 3 - fileGroups.reference_design.length
                addFiles('reference_design', f.slice(0, remain))
              }}
              onRemove={i => removeFile('reference_design', i)}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">홈페이지 URL</label>
                <input {...register('homepage_url')} className={inputCls} placeholder="https://example.com" />
                {errors.homepage_url && <p className="text-red-500 text-sm mt-1.5">{errors.homepage_url.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">참조 상세페이지 URL</label>
                <input {...register('detail_page_url')} className={inputCls} placeholder="https://smartstore.naver.com/..." />
                {errors.detail_page_url && <p className="text-red-500 text-sm mt-1.5">{errors.detail_page_url.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">추가 요청사항</label>
              <textarea {...register('reference_notes')} rows={3} className={textareaCls}
                placeholder="그 외 전달할 내용이 있다면 입력하세요." />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <p className="text-amber-800 text-sm font-medium mb-1">제출 전 확인사항</p>
              <ul className="text-amber-700 text-sm space-y-0.5 list-disc list-inside">
                <li>기업당 1건의 상세페이지 제작이 제공됩니다</li>
                <li>초안 확인 후 수정 요청은 최대 2회 가능합니다</li>
                <li>레이아웃 전면 수정은 불가하며 문구/색상 조정 수준으로 진행됩니다</li>
              </ul>
            </div>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input type="checkbox" {...register('consent')}
                className="mt-0.5 w-4 h-4 rounded border-border text-primary-600 focus:ring-primary-500 cursor-pointer flex-shrink-0" />
              <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                입력한 정보가 상세페이지 제작 목적으로 사용되는 것에 동의합니다. <span className="text-red-500">*</span>
              </span>
            </label>
            {errors.consent && <p className="text-red-500 text-sm -mt-3">{errors.consent.message}</p>}
          </div>
        )}

        {/* 네비게이션 버튼 */}
        <div className={`flex gap-3 pt-2 ${currentStep > 1 ? 'justify-between' : 'justify-end'}`}>
          {currentStep > 1 && (
            <button type="button" onClick={() => { setCurrentStep(s => s - 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              className="px-6 py-3 rounded-xl border border-border text-sm font-semibold text-text-secondary hover:bg-surface-active transition-all min-h-[44px]">
              ← 이전
            </button>
          )}
          {currentStep < 3 ? (
            <button type="button" onClick={goNext}
              className="flex-1 sm:flex-none sm:px-8 bg-primary-600 text-white rounded-xl py-3 font-semibold hover:bg-primary-700 shadow-sm transition-all text-sm min-h-[44px]">
              다음 →
            </button>
          ) : (
            <button type="submit" disabled={isSubmitting || !!uploadProgress}
              className="flex-1 bg-primary-600 text-white rounded-xl py-3.5 font-semibold hover:bg-primary-700 disabled:opacity-50 shadow-sm hover:shadow-md transition-all text-base min-h-[44px]">
              {uploadProgress || (isSubmitting ? '제출 중...' : '작업 의뢰하기')}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
