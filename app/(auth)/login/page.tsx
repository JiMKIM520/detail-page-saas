'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">DetailAI</h1>
          <p className="text-sm text-text-tertiary mt-1">전문 팀의 상세페이지 제작 서비스</p>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-8 shadow-card space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">로그인</h2>
          </div>

          <BusinessLoginForm router={router} />
        </div>
      </div>
    </div>
  )
}

/* ─── 기업 로그인 (사업자명 + 사업자번호 뒷 5자리) ─────────────────── */
function BusinessLoginForm({ router }: { router: ReturnType<typeof useRouter> }) {
  const [companyName, setCompanyName] = useState('')
  const [bizLast5, setBizLast5] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // 1. 서버에서 이메일·패스워드 조회
    const res = await fetch('/api/auth/client-lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyName, bizLast5 }),
    })

    if (!res.ok) {
      const data = (await res.json()) as { error?: string }
      setError(data.error ?? '사업자명 또는 사업자번호가 올바르지 않습니다.')
      setLoading(false)
      return
    }

    const { email, password } = (await res.json()) as { email: string; password: string }

    // 2. Supabase 로그인
    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (authError) {
      setError('로그인에 실패했습니다. 관리자에게 문의해주세요.')
      return
    }

    const role = data.user?.user_metadata?.role ?? 'client'
    router.push(role === 'admin' ? '/dashboard' : role === 'designer' ? '/designer' : '/projects')
  }

  return (
    <>
      <p className="text-sm text-text-tertiary -mt-2">
        사전 안내받은 사업자명과 사업자번호 뒷 5자리로 로그인하세요
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">사업자명</label>
          <input
            type="text"
            value={companyName}
            onChange={e => setCompanyName(e.target.value)}
            placeholder="홍길동 식품"
            required
            className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-text-tertiary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">사업자번호 뒷 5자리</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={5}
            value={bizLast5}
            onChange={e => setBizLast5(e.target.value.replace(/\D/g, '').slice(0, 5))}
            placeholder="00000"
            required
            className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-text-tertiary tracking-widest"
          />
          <p className="text-xs text-text-tertiary mt-1.5">사업자등록번호 10자리 중 마지막 5자리</p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 text-white rounded-xl py-2.5 font-semibold hover:bg-primary-700 disabled:opacity-50 shadow-sm transition-all"
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>
    </>
  )
}
