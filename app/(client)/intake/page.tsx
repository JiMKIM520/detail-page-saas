import { createClient } from '@/lib/supabase/server'
import { IntakeForm } from '@/components/intake/IntakeForm'
import Link from 'next/link'

export default async function IntakePage() {
  const supabase = await createClient()
  const [{ data: platforms }, { data: categories }] = await Promise.all([
    supabase.from('platforms').select('id, name, slug'),
    supabase.from('categories').select('id, name, slug'),
  ])

  return (
    <div>
      <div className="mb-8">
        <Link href="/projects" className="inline-flex items-center gap-1 text-sm text-text-tertiary hover:text-text-secondary mb-4">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          프로젝트 목록
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">작업 의뢰하기</h1>
        <p className="text-sm text-text-tertiary mt-1">
          제품 정보와 자료를 입력하면 AI가 상세페이지 스크립트를 자동 생성합니다.
        </p>
      </div>
      <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-card">
        <IntakeForm platforms={platforms ?? []} categories={categories ?? []} />
      </div>
    </div>
  )
}
