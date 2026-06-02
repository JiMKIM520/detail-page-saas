import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { IntakeForm } from '@/components/intake/IntakeForm'
import Link from 'next/link'

export default async function IntakePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // D-022: 기업당 1회 제한 — 사용량 소진 시 폼 대신 안내 (제출 자체는 increment_usage RPC가 서버단 차단)
  const service = createServiceClient()
  const { data: profile } = await service
    .from('user_profiles')
    .select('usage_count, usage_limit')
    .eq('id', user?.id ?? '')
    .maybeSingle()
  const usageExhausted = (profile?.usage_count ?? 0) >= (profile?.usage_limit ?? 1)

  if (usageExhausted) {
    return (
      <div className="max-w-lg mx-auto text-center py-24">
        <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">이미 의뢰를 진행 중입니다</h1>
        <p className="text-sm text-text-tertiary mb-8">
          계정당 1건의 상세페이지 제작이 제공됩니다. 진행 중인 프로젝트를 확인해주세요.
        </p>
        <Link href="/projects"
          className="inline-flex items-center gap-2 bg-primary-600 text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-primary-700 shadow-sm transition-all">
          내 상세페이지 보기
        </Link>
      </div>
    )
  }

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
          제품 정보와 자료를 입력해주시면 담당 팀이 검토 후 상세페이지 제작을 진행합니다.
        </p>
      </div>
      <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-card">
        <IntakeForm platforms={platforms ?? []} categories={categories ?? []} />
      </div>
    </div>
  )
}
