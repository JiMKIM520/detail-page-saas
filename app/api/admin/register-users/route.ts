import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface UserInput {
  email: string
  business_number: string
  company_name: string
}

export async function POST(request: Request) {
  const userSupabase = await createClient()
  const { data: { user } } = await userSupabase.auth.getUser()
  if (user?.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { users } = (await request.json()) as { users: UserInput[] }

  if (!Array.isArray(users) || users.length === 0) {
    return NextResponse.json({ error: 'users 배열이 필요합니다.' }, { status: 400 })
  }

  const service = createServiceClient()
  const results: { email: string; success: boolean; error?: string }[] = []

  for (const { email, business_number, company_name } of users) {
    if (!email || !business_number || !company_name) {
      results.push({ email: email || '(empty)', success: false, error: '필수 필드 누락' })
      continue
    }

    // 1. Create auth user (password = business_number, 하이픈 제거)
    const normalizedBN = business_number.replace(/-/g, '')
    const { data: authData, error: authError } = await service.auth.admin.createUser({
      email,
      password: normalizedBN,
      user_metadata: { role: 'client', name: company_name },
      email_confirm: true,
    })

    if (authError) {
      results.push({ email, success: false, error: authError.message })
      continue
    }

    // 2. Create user_profile
    const { error: profileError } = await service
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        name: company_name,
        role: 'client',
        usage_limit: 1,
        usage_count: 0,
        business_number: normalizedBN,
      })

    if (profileError) {
      results.push({ email, success: false, error: `Auth 생성 성공, 프로필 생성 실패: ${profileError.message}` })
      continue
    }

    results.push({ email, success: true })
  }

  const successCount = results.filter(r => r.success).length
  return NextResponse.json(
    { total: users.length, success: successCount, failed: users.length - successCount, results },
    { status: 201 }
  )
}
