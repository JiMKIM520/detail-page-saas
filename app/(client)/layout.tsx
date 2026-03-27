import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const service = createServiceClient()
  const { data: profile } = await service
    .from('user_profiles')
    .select('name, usage_count, usage_limit')
    .eq('id', user.id)
    .single()

  const displayName = profile?.name || user.user_metadata?.name || user.email?.split('@')[0] || ''
  const usageCount = profile?.usage_count ?? 0
  const usageLimit = profile?.usage_limit ?? 1
  const usageExhausted = usageCount >= usageLimit

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-30 bg-surface border-b border-border backdrop-blur-sm bg-white/80">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/projects" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-bold text-text-primary text-lg tracking-tight">DetailAI</span>
          </Link>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2.5">
              {usageExhausted ? (
                <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
                  1건 사용 완료
                </span>
              ) : (
                <>
                  <div className="text-right">
                    <p className="text-xs text-text-tertiary leading-none mb-0.5">사용량</p>
                    <p className="text-sm font-semibold text-text-primary">{usageCount}/{usageLimit}</p>
                  </div>
                  <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all bg-primary-500" style={{ width: `${Math.min((usageCount / usageLimit) * 100, 100)}%` }} />
                  </div>
                </>
              )}
            </div>

            <div className="h-5 w-px bg-border" />

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary-700">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-text-primary leading-none">{displayName}</p>
                <p className="text-xs text-text-tertiary">{user.email}</p>
              </div>
            </div>

            <form action="/api/auth/signout" method="post">
              <button type="submit" className="text-xs text-text-tertiary hover:text-text-secondary">
                로그아웃
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
