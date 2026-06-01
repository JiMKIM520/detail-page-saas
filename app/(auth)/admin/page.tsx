'use client'
import { useState } from 'react'
import { adminLogin } from '@/app/actions/admin-login'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [adminId, setAdminId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await adminLogin(adminId, password)
    setLoading(false)

    if (result.error) {
      setError(result.error)
      return
    }

    if (result.redirectTo) {
      router.push(result.redirectTo)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">DetailAI</h1>
          <p className="text-sm text-text-tertiary mt-1">관리자 전용</p>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-8 shadow-card space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">관리자 로그인</h2>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">아이디</label>
              <input
                type="text" value={adminId} onChange={e => setAdminId(e.target.value)}
                placeholder="아이디 입력" required
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-text-tertiary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">비밀번호</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="비밀번호 입력" required
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-text-tertiary"
              />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-gray-900 text-white rounded-xl py-2.5 font-semibold hover:bg-gray-800 disabled:opacity-50 shadow-sm transition-all">
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
