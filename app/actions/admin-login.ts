'use server'

import { createClient } from '@/lib/supabase/server'

const ADMIN_ID_MAP: Record<string, string> = {
  // 아이디 'admin' → ADMIN_EMAIL 환경변수, 없으면 기본 계정.
  // 다른 이메일을 쓰려면 Vercel/로컬 env에 ADMIN_EMAIL 설정.
  admin: process.env.ADMIN_EMAIL ?? 'admin@detailai.app',
}

export async function adminLogin(adminId: string, password: string): Promise<{
  success?: boolean
  error?: string
  redirectTo?: string
}> {
  // 'admin' 아이디는 매핑으로, 그 외 이메일 형태면 직접 사용 (기획자/디자이너 등 운영팀 계정).
  const mapped = ADMIN_ID_MAP[adminId.trim().toLowerCase()]
  const email = mapped ?? (adminId.includes('@') ? adminId.trim().toLowerCase() : undefined)
  if (!email) {
    return { error: '등록되지 않은 관리자 ID입니다.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: '아이디 또는 비밀번호가 올바르지 않습니다.' }
  }

  const role = data.user?.user_metadata?.role ?? 'client'
  if (role === 'client') {
    await supabase.auth.signOut()
    return { error: '관리자 계정이 아닙니다.' }
  }

  const dest = role === 'designer' ? '/designer' : '/dashboard' // admin
  return { success: true, redirectTo: dest }
}
