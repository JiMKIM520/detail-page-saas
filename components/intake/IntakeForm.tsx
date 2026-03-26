'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'

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

export function IntakeForm({ platforms }: { platforms: Platform[] }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema)
  })
  const router = useRouter()

  async function onSubmit(data: FormData) {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) router.push('/projects')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">기업명 *</label>
        <input {...register('company_name')}
          className="w-full border rounded-lg px-4 py-2"
          placeholder="예: 홍길동 쇼핑몰" />
        {errors.company_name && <p className="text-red-500 text-sm mt-1">{errors.company_name.message}</p>}
      </div>
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
        <p className="text-xs text-gray-400 mt-1">※ SNS 링크 불가. 상세페이지 URL만 입력 가능합니다.</p>
        {errors.detail_page_url && <p className="text-red-500 text-sm mt-1">{errors.detail_page_url.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">강조 포인트 *</label>
        <textarea {...register('product_highlights')} rows={4}
          className="w-full border rounded-lg px-4 py-2"
          placeholder="제품의 핵심 특징, 강조하고 싶은 점, 경쟁 제품 대비 차별점 등을 구체적으로 입력하세요." />
        {errors.product_highlights && <p className="text-red-500 text-sm mt-1">{errors.product_highlights.message}</p>}
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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">기타 참고사항</label>
        <textarea {...register('reference_notes')} rows={3}
          className="w-full border rounded-lg px-4 py-2"
          placeholder="추가로 전달할 내용이 있다면 입력하세요." />
      </div>
      <button type="submit" disabled={isSubmitting}
        className="w-full bg-blue-600 text-white rounded-lg py-3 font-medium hover:bg-blue-700 disabled:opacity-50">
        {isSubmitting ? '제출 중...' : '작업 의뢰하기'}
      </button>
    </form>
  )
}
