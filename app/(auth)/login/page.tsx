'use client'
import { useEffect, useRef, useState } from 'react'
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

/** 사업자등록번호 표기 — 3-2-5 하이픈 */
function formatBizNo(digits: string): string {
  const d = digits.slice(0, 10)
  if (d.length <= 3) return d
  if (d.length <= 5) return `${d.slice(0, 3)}-${d.slice(3)}`
  return `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}`
}

/* ─── 기업 로그인 (사업자등록번호 10자리) ─────────────────── */
function BusinessLoginForm({ router }: { router: ReturnType<typeof useRouter> }) {
  const [bizNo, setBizNo] = useState('')
  const [foundName, setFoundName] = useState<string | null>(null)
  const [looking, setLooking] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const lookupRef = useRef(0)

  // 번호 10자리를 채우면 기업명을 자동으로 확인해 보여준다
  useEffect(() => {
    setFoundName(null)
    if (bizNo.length !== 10) {
      setLooking(false)
      return
    }
    const seq = ++lookupRef.current
    setLooking(true)
    setError('')
    const t = setTimeout(async () => {
      try {
        const res = await fetch('/api/auth/company-name', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bizNo }),
        })
        if (seq !== lookupRef.current) return
        if (res.ok) {
          const d = (await res.json()) as { companyName?: string }
          setFoundName(d.companyName ?? null)
        } else {
          setError('등록되지 않은 사업자등록번호입니다.')
        }
      } catch {
        if (seq === lookupRef.current) setError('조회 중 오류가 발생했습니다. 다시 시도해주세요.')
      } finally {
        if (seq === lookupRef.current) setLooking(false)
      }
    }, 350)
    return () => clearTimeout(t)
  }, [bizNo])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (bizNo.length !== 10) {
      setError('사업자등록번호 10자리를 입력해주세요.')
      return
    }
    setLoading(true)
    setError('')

    // 1. 서버에서 이메일·패스워드 조회
    const res = await fetch('/api/auth/client-lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bizNo }),
    })

    if (!res.ok) {
      const data = (await res.json()) as { error?: string }
      setError(data.error ?? '등록되지 않은 사업자등록번호입니다.')
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
          inputMode="numeric"
          value={formatBizNo(bizNo)}
          onChange={e => setBizNo(e.target.value.replace(/\D/g, '').slice(0, 10))}
          placeholder="사업자등록번호 10자리"
          autoComplete="off"
          autoFocus
          required
        />
        {looking ? (
          <p className="hlogin-found looking">기업 정보를 확인하는 중…</p>
        ) : foundName ? (
          <p className="hlogin-found">
            <strong>{foundName}</strong>
            <span>확인되었습니다</span>
          </p>
        ) : (
          <p className="hlogin-help">‘-’ 없이 숫자만 입력해도 됩니다</p>
        )}
      </div>

      <button type="submit" className="hlogin-submit" disabled={loading}>
        {loading ? '로그인 중...' : '로그인'}
      </button>
    </form>
  )
}
