'use server'

import { createClient } from '@/lib/supabase/server'
import { staffPassword } from '@/lib/auth/client-credentials'

/** 운영팀 아이디 → 실제 계정 이메일. 사용자는 이메일을 몰라도 되고 admin·designer1~4만 기억한다. */
const ADMIN_ID_MAP: Record<string, string> = {
  admin: process.env.ADMIN_EMAIL ?? 'admin@kompa.kr',
  designer1: 'designer1@detailai.app',
  designer2: 'designer2@detailai.app',
  designer3: 'designer3@detailai.app',
  designer4: 'designer4@detailai.app',
}

export async function adminLogin(adminId: string, password: string): Promise<{
  success?: boolean
  error?: string
  redirectTo?: string
}> {
  // 등록된 아이디(admin·designer1~4)는 매핑으로, 이메일을 직접 넣어도 허용(운영 전환 대비).
  const mapped = ADMIN_ID_MAP[adminId.trim().toLowerCase()]
  const email = mapped ?? (adminId.includes('@') ? adminId.trim().toLowerCase() : undefined)
  if (!email) {
    return { error: '등록되지 않은 아이디입니다.' }
  }

  const supabase = await createClient()
  // 입력 비밀번호(1234)는 Supabase 최소 6자 제약 때문에 저장값으로 변환해 조회한다
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: staffPassword(password),
  })

  if (error) {
    return { error: '아이디 또는 비밀번호가 올바르지 않습니다.' }
  }

  const role = data.user?.user_metadata?.role ?? 'client'
  if (role === 'client') {
    await supabase.auth.signOut()
    return { error: '관리자 계정이 아닙니다.' }
  }

  // 디자이너는 단계별 통합 보드(내 작업)로 — 구 목록 화면(/designer)은 상세 진입용으로만 남긴다
  const dest = role === 'designer' ? '/my-work' : '/dashboard' // admin
  return { success: true, redirectTo: dest }
}
