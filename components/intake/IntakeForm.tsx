'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useState, useId, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const schema = z.object({
  // Step 1 — 기업 & 브랜드 정보
  company_name: z.string().min(1, '기업명을 입력하세요'),
  product_highlights: z.string().min(10, '사업 소개를 10자 이상 입력하세요'),
  brand_name: z.string().optional(),
  // Step 2 — 상품 정보
  platform_id: z.string().optional(),
  category_id: z.string().uuid('카테고리를 선택하세요'),
  // Step 3 — 디자인 선호도 (칩 선택 → join 후 저장)
  design_preference: z.string().optional(),
  homepage_url: z.string().url('올바른 URL을 입력하세요').optional().or(z.literal('')),
  detail_page_url: z.string().url('올바른 URL을 입력하세요').optional().or(z.literal('')),
  reference_notes: z.string().optional(),
  // Step 4 — 동의 (리뷰 단계에서 수집)
  consent: z.literal(true, { error: '동의가 필요합니다' }),
})

type FormData = z.infer<typeof schema>

interface Platform { id: string; name: string; slug: string }
interface Category { id: string; name: string; slug: string }

const AGE_OPTIONS = ['20대', '30대', '40대', '50대', '60대 이상']
const GENDER_OPTIONS = ['남성', '여성', '무관']

const DESIGN_STYLE_OPTIONS = [
  '심플한', '고급스러운', '감성적인', '자연스러운', '친환경적인',
  '친근한', '트렌디한', '깔끔한', '시원시원한', '가독성이 좋은',
  '차분한', '활기찬', '아기자기한', '화려한', '강렬한',
  '비비드한', '파스텔톤', '뉴트럴', '모노톤', '컬러풀한', '아날로그',
]

const DRAFT_KEY = 'detailai_intake_draft'

const STEP_LABELS = ['기업 & 브랜드 정보', '상품 정보', '디자인 선호도', '입력 내용 확인']

const TOTAL_STEPS = 4

// ── localStorage draft 타입 ──
interface DraftData {
  company_name?: string
  product_highlights?: string
  brand_name?: string
  hasBrand?: boolean | null
  category_id?: string
  designStyles?: string[]
  targetAudience?: string[]
  homepage_url?: string
  detail_page_url?: string
  reference_notes?: string
}

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
  const inputId = useId()
  const atMax = maxFiles !== undefined && files.length >= maxFiles

  function formatSize(bytes: number) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  return (
    <div className="border border-border rounded-xl p-4 bg-white">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-text-primary">
          {label} {required && <span className="text-red-500">*</span>}
          {maxFiles && <span className="text-xs text-text-tertiary ml-1">(최대 {maxFiles}개)</span>}
        </span>
        {!atMax && (
          <label htmlFor={inputId}
            className="text-sm text-primary-600 hover:text-primary-700 font-semibold min-h-[44px] flex items-center cursor-pointer">
            + 파일 추가
          </label>
        )}
      </div>
      <p className="text-xs text-text-tertiary mb-3">{description}</p>
      {/* 네이티브 파일 선택 — label[htmlFor]로 열어 모든 브라우저(Safari 포함)에서 동작 */}
      <input id={inputId} type="file" multiple={multiple} accept={accept} className="sr-only"
        onChange={e => { onAdd(Array.from(e.target.files || [])); e.target.value = '' }} />

      {files.length === 0 ? (
        <label htmlFor={inputId}
          className="block border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 transition-all">
          <svg className="w-7 h-7 text-text-tertiary mx-auto mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <p className="text-sm text-text-tertiary">클릭하여 파일을 선택하세요</p>
        </label>
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
            <label htmlFor={inputId}
              className="block text-center w-full text-sm text-text-tertiary hover:text-primary-600 py-2 rounded-lg border border-dashed border-border hover:border-primary-300 transition-colors cursor-pointer">
              + 추가
            </label>
          )}
        </div>
      )}
    </div>
  )
}

// ── 리뷰 단계용 항목 표시 컴포넌트 ──
function ReviewRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 border-b border-border last:border-0">
      <span className="text-sm font-medium text-text-tertiary sm:w-36 flex-shrink-0">{label}</span>
      <span className="text-sm text-text-primary flex-1">{value || <span className="text-text-tertiary italic">미입력</span>}</span>
    </div>
  )
}

export function IntakeForm({ platforms, categories }: { platforms: Platform[]; categories: Category[] }) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, trigger, getValues, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { consent: undefined as unknown as true },
  })
  const router = useRouter()
  const supabase = createClient()

  const [currentStep, setCurrentStep] = useState(1)
  const [hasBrand, setHasBrand] = useState<boolean | null>(null)
  const [targetAudience, setTargetAudience] = useState<string[]>([])
  const [designStyles, setDesignStyles] = useState<string[]>([])

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

  // ── 임시저장 상태 ──
  const [draftBanner, setDraftBanner] = useState<'idle' | 'present' | 'dismissed'>('idle')
  const [saveMsg, setSaveMsg] = useState('')

  // 마운트 시 draft 확인
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (raw) setDraftBanner('present')
    } catch {
      // localStorage 접근 불가 환경 무시
    }
  }, [])

  function loadDraft() {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (!raw) return
      const draft: DraftData = JSON.parse(raw)
      if (draft.company_name) setValue('company_name', draft.company_name)
      if (draft.product_highlights) setValue('product_highlights', draft.product_highlights)
      if (draft.brand_name) setValue('brand_name', draft.brand_name)
      if (draft.hasBrand !== undefined) setHasBrand(draft.hasBrand ?? null)
      if (draft.category_id) setValue('category_id', draft.category_id)
      if (draft.designStyles) setDesignStyles(draft.designStyles)
      if (draft.targetAudience) setTargetAudience(draft.targetAudience)
      if (draft.homepage_url) setValue('homepage_url', draft.homepage_url)
      if (draft.detail_page_url) setValue('detail_page_url', draft.detail_page_url)
      if (draft.reference_notes) setValue('reference_notes', draft.reference_notes)
      setDraftBanner('dismissed')
    } catch {
      setDraftBanner('dismissed')
    }
  }

  function discardDraft() {
    try { localStorage.removeItem(DRAFT_KEY) } catch { /* ignore */ }
    setDraftBanner('dismissed')
  }

  function saveDraft() {
    try {
      const vals = getValues()
      const draft: DraftData = {
        company_name: vals.company_name,
        product_highlights: vals.product_highlights,
        brand_name: vals.brand_name,
        hasBrand,
        category_id: vals.category_id,
        designStyles,
        targetAudience,
        homepage_url: vals.homepage_url,
        detail_page_url: vals.detail_page_url,
        reference_notes: vals.reference_notes,
      }
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
      setSaveMsg('임시저장되었습니다')
      setTimeout(() => setSaveMsg(''), 2500)
    } catch {
      setSaveMsg('저장에 실패했습니다')
      setTimeout(() => setSaveMsg(''), 2500)
    }
  }

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

  function toggleDesignStyle(val: string) {
    setDesignStyles(prev => {
      if (prev.includes(val)) return prev.filter(v => v !== val)
      if (prev.length >= 3) return prev // 3개 초과 선택 불가
      return [...prev, val]
    })
  }

  // 판매 플랫폼은 의뢰 단계에서 받지 않고 11번가로 고정 (2026-06-02 회의 결정). 없으면 첫 플랫폼.
  const defaultPlatformId =
    platforms.find(p => (p as { slug?: string }).slug === '11st')?.id ?? platforms[0]?.id ?? ''

  const STEP_FIELDS: Record<number, (keyof FormData)[]> = {
    1: ['company_name', 'product_highlights'],
    2: ['category_id'],
    3: ['homepage_url', 'detail_page_url'],
    4: ['consent'],
  }

  async function goNext() {
    const valid = await trigger(STEP_FIELDS[currentStep])
    if (currentStep === 2) {
      if (!valid) {
        setFileError('카테고리를 선택해주세요.')
        return
      }
      if (fileGroups.product_photo.length === 0) {
        setFileError('제품 사진을 최소 1장 업로드해주세요. (필수)')
        return
      }
    }
    if (valid) {
      setFileError('')
      setCurrentStep(s => s + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      setFileError('입력하지 않은 필수 항목이 있습니다. 표시된 항목을 확인해주세요.')
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
    setApiError('')

    // target_audience를 reference_notes에 append
    const audienceNote = targetAudience.length > 0 ? `[타겟 고객층: ${targetAudience.join(', ')}]` : ''
    const finalNotes = [audienceNote, data.reference_notes].filter(Boolean).join('\n')

    const payload = {
      company_name: data.company_name,
      product_highlights: data.product_highlights,
      brand_name: data.brand_name || null,
      platform_id: data.platform_id || defaultPlatformId,
      category_id: data.category_id,
      design_preference: designStyles.length > 0 ? designStyles.join(', ') : null,
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

      // 최종 제출 성공 시 draft 삭제
      try { localStorage.removeItem(DRAFT_KEY) } catch { /* ignore */ }

      setUploadProgress('')
      router.push('/projects')
    } catch (err) {
      setUploadProgress('')
      setApiError(err instanceof Error ? err.message : '제출 중 오류가 발생했습니다.')
    }
  }

  const inputCls = "w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-text-tertiary"
  const textareaCls = `${inputCls} resize-none`

  // 리뷰 단계용 — 선택된 카테고리명 조회
  const selectedCategory = categories.find(c => c.id === getValues('category_id'))

  // 파일 업로드 요약 (타입별 개수)
  const fileSummary = Object.entries(fileGroups)
    .filter(([, files]) => files.length > 0)
    .map(([type, files]) => {
      const typeLabel: Record<string, string> = {
        product_photo: '제품사진',
        brochure: '소개서',
        detail_capture: '상세페이지캡처',
        brand_logo: '브랜드로고',
        reference_design: '레퍼런스',
      }
      return `${typeLabel[type] ?? type} ${files.length}개`
    })
    .join(', ')

  return (
    <div>
      <StepIndicator current={currentStep} />

      {/* ── 임시저장 배너 ── */}
      {draftBanner === 'present' && (
        <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <p className="text-amber-800 text-sm flex-1">임시저장된 내용이 있습니다.</p>
          <div className="flex gap-2">
            <button type="button" onClick={loadDraft}
              className="text-sm font-semibold text-primary-700 hover:text-primary-800 px-3 py-1.5 rounded-lg border border-primary-200 hover:bg-primary-50 transition-all">
              불러오기
            </button>
            <button type="button" onClick={discardDraft}
              className="text-sm font-semibold text-text-tertiary hover:text-text-secondary px-3 py-1.5 rounded-lg border border-border hover:bg-surface-active transition-all">
              새로 작성
            </button>
          </div>
        </div>
      )}

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
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">카테고리 *</label>
              <select {...register('category_id')} className={inputCls}>
                <option value="">선택하세요</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.category_id && <p className="text-red-500 text-sm mt-1.5">{errors.category_id.message}</p>}
            </div>

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
            {fileError && currentStep === 2 && <p className="text-red-500 text-sm -mt-2">{fileError}</p>}

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
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-text-secondary">디자인 스타일 선택</label>
                <span className="text-xs text-text-tertiary font-medium">
                  {designStyles.length}/3 선택
                </span>
              </div>
              <p className="text-xs text-text-tertiary mb-3">원하는 느낌을 최대 3개 선택해주세요.</p>
              <div className="flex flex-wrap gap-2">
                {DESIGN_STYLE_OPTIONS.map(style => {
                  const selected = designStyles.includes(style)
                  const disabled = !selected && designStyles.length >= 3
                  return (
                    <button
                      key={style}
                      type="button"
                      onClick={() => toggleDesignStyle(style)}
                      disabled={disabled}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                        selected
                          ? 'bg-primary-600 text-white border-primary-600'
                          : disabled
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                            : 'bg-white text-text-secondary border-border hover:border-primary-300'
                      }`}>
                      {style}
                    </button>
                  )
                })}
              </div>
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
          </div>
        )}

        {/* ── Step 4: 입력 내용 확인 ── */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-semibold text-text-primary mb-1">입력하신 내용을 확인해주세요</h2>
              <p className="text-xs text-text-tertiary mb-4">내용을 수정하려면 ← 이전 버튼으로 해당 단계로 돌아가세요.</p>

              <div className="bg-white border border-border rounded-xl px-5 divide-y divide-border">
                <ReviewRow label="기업명" value={getValues('company_name')} />
                <ReviewRow label="사업 소개" value={getValues('product_highlights')} />
                <ReviewRow
                  label="브랜드"
                  value={
                    hasBrand === null
                      ? undefined
                      : hasBrand
                        ? `있음${getValues('brand_name') ? ` (${getValues('brand_name')})` : ''}`
                        : '없음 (상호명 사용)'
                  }
                />
                <ReviewRow label="카테고리" value={selectedCategory?.name} />
                <ReviewRow
                  label="타겟 고객층"
                  value={targetAudience.length > 0 ? targetAudience.join(', ') : undefined}
                />
                <ReviewRow
                  label="디자인 스타일"
                  value={designStyles.length > 0 ? designStyles.join(', ') : undefined}
                />
                <ReviewRow
                  label="업로드 파일"
                  value={fileSummary || undefined}
                />
                <ReviewRow label="홈페이지 URL" value={getValues('homepage_url')} />
                <ReviewRow label="참조 URL" value={getValues('detail_page_url')} />
                <ReviewRow label="추가 요청사항" value={getValues('reference_notes')} />
              </div>
            </div>

            {/* 이미지 임시저장 안내 */}
            <p className="text-xs text-text-tertiary">
              * 이미지 파일은 임시저장되지 않습니다. 제출 전 창을 닫으면 이미지는 다시 업로드해야 합니다.
            </p>

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

        {/* 진행 차단 안내 (다음 버튼 바로 위에 표시) */}
        {fileError && currentStep !== 2 && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">{fileError}</p>
        )}

        {/* 네비게이션 버튼 */}
        <div className="pt-2 space-y-3">
          {/* 임시저장 버튼 + 피드백 메시지 */}
          <div className="flex items-center justify-end gap-3">
            {saveMsg && (
              <span className="text-xs text-primary-700 font-medium">{saveMsg}</span>
            )}
            <button
              type="button"
              onClick={saveDraft}
              className="text-sm text-text-tertiary hover:text-text-secondary font-medium px-3 py-1.5 rounded-lg border border-border hover:bg-surface-active transition-all">
              임시저장
            </button>
          </div>

          <div className={`flex gap-3 ${currentStep > 1 ? 'justify-between' : 'justify-end'}`}>
            {currentStep > 1 && (
              <button type="button" onClick={() => { setCurrentStep(s => s - 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                className="px-6 py-3 rounded-xl border border-border text-sm font-semibold text-text-secondary hover:bg-surface-active transition-all min-h-[44px]">
                ← 이전
              </button>
            )}
            {currentStep < TOTAL_STEPS ? (
              <button type="button" onClick={goNext}
                className="flex-1 sm:flex-none sm:px-8 bg-primary-600 text-white rounded-xl py-3 font-semibold hover:bg-primary-700 shadow-sm transition-all text-sm min-h-[44px]">
                다음 →
              </button>
            ) : (
              <button type="submit" disabled={isSubmitting || !!uploadProgress}
                className="flex-1 bg-primary-600 text-white rounded-xl py-3.5 font-semibold hover:bg-primary-700 disabled:opacity-50 shadow-sm hover:shadow-md transition-all text-base min-h-[44px]">
                {uploadProgress || (isSubmitting ? '제출 중...' : '최종 제출')}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
