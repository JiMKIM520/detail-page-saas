'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [businessNumber, setBusinessNumber] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const normalizedBN = businessNumber.replace(/-/g, '')
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: normalizedBN,
    })
    setLoading(false)

    if (error) {
      setError(error.message === 'Invalid login credentials'
        ? '이메일 또는 사업자등록번호가 올바르지 않습니다.'
        : error.message)
      return
    }

    const role = data.user?.user_metadata?.role ?? 'client'
    router.push(role === 'client' ? '/projects' : '/planner')
  }

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
          <p className="text-sm text-text-tertiary mt-1">AI 상세페이지 자동화 서비스</p>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-8 shadow-card space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">로그인</h2>
            <p className="text-sm text-text-tertiary mt-0.5">사전 안내받은 이메일과 사업자등록번호로 로그인하세요</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">이메일</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="email@example.com" required
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-text-tertiary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">사업자등록번호</label>
              <input
                type="text" value={businessNumber} onChange={e => setBusinessNumber(e.target.value)}
                placeholder="000-00-00000" required
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-text-tertiary"
              />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-primary-600 text-white rounded-xl py-2.5 font-semibold hover:bg-primary-700 disabled:opacity-50 shadow-sm transition-all">
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
