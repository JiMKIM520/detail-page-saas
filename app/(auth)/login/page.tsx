'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import './login.css'

/* 하나파워온스토어 공통 로그인 디자인 — AI 패키지 디자인(package.hanapoweron.kr)과 동일 */
export default function LoginPage() {
  const router = useRouter()

  return (
    <div className="hlogin-page">
      <div className="hlogin-shell">
        <img className="hlogin-mascot left" src="/hana-mascot-left.png" alt="" />
        <img className="hlogin-mascot right" src="/hana-mascot-right.png" alt="" />
        <div className="hlogin-card">
          <div className="hlogin-logo">
            <span className="l-hana">Hana</span>
            <span className="l-power">Power On</span>
            <span className="l-store">Store</span>
          </div>
          <h1 className="hlogin-title">
            소상공인 온라인 판로 지원
            <br />
            하나 <span className="red">파워 온</span> 스토어
          </h1>
          <p className="hlogin-subhead">
            레벨업 컨설팅
            <br />
            상세페이지 디자인 작업의뢰서
          </p>

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
    <form onSubmit={handleLogin}>
      {error && <div className="hlogin-error">{error}</div>}

      <div className="hlogin-field">
        <input
          className="hlogin-input"
          type="text"
          value={companyName}
          onChange={e => setCompanyName(e.target.value)}
          placeholder="사업자명"
          autoComplete="organization"
          required
        />
      </div>
      <div className="hlogin-field">
        <input
          className="hlogin-input"
          type="text"
          inputMode="numeric"
          maxLength={5}
          value={bizLast5}
          onChange={e => setBizLast5(e.target.value.replace(/\D/g, '').slice(0, 5))}
          placeholder="사업자번호 뒷 5자리"
          required
        />
        <p className="hlogin-help">사업자등록번호 10자리 중 마지막 5자리</p>
      </div>

      <button type="submit" className="hlogin-submit" disabled={loading}>
        {loading ? '로그인 중...' : '로그인'}
      </button>
    </form>
  )
}
