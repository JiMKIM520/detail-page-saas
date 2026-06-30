import { redirect } from 'next/navigation'

// 폐쇄형 시스템 — 공개 가입 없음. 서버에서 즉시 로그인으로 보냄.
export default function SignupPage() {
  redirect('/login')
}
