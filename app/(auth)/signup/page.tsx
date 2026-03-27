'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: 'client', name },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      return
    }

    setSuccess(true)
  }

  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
        queryParams: { prompt: 'select_account' },
      },
    })
    if (error) setError(error.message)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="bg-surface rounded-2xl border border-border p-8 shadow-card w-full max-w-sm text-center space-y-4">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto">
            <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-text-primary">이메일을 확인해주세요</h2>
          <p className="text-sm text-text-tertiary leading-relaxed">
            <span className="font-medium text-text-secondary">{email}</span>로 인증 링크를 보냈습니다.
            <br />이메일을 확인하여 가입을 완료하세요.
          </p>
          <Link href="/login" className="inline-block text-sm text-primary-600 hover:text-primary-700 font-semibold mt-2">
            로그인 페이지로 돌아가기
          </Link>
        </div>
      </div>
    )
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
            <h2 className="text-lg font-semibold text-text-primary">회원가입</h2>
            <p className="text-sm text-text-tertiary mt-0.5">무료로 3건까지 이용 가능합니다</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 border border-border rounded-xl py-2.5 font-medium text-text-primary hover:bg-surface-hover hover:border-border-hover transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google로 시작하기
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-surface px-3 text-text-tertiary">또는 이메일로 가입</span>
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">이름</label>
              <input
                type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="홍길동" required
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-text-tertiary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">이메일</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="email@example.com" required
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-text-tertiary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">비밀번호</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="6자 이상" required minLength={6}
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-text-tertiary"
              />
            </div>
            <button type="submit"
              className="w-full bg-primary-600 text-white rounded-xl py-2.5 font-semibold hover:bg-primary-700 shadow-sm transition-all">
              가입하기
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-text-tertiary mt-6">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="text-primary-600 hover:text-primary-700 font-semibold">로그인</Link>
        </p>
      </div>
    </div>
  )
}
