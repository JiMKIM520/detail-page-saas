import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // 프로필이 없으면 생성 (최초 가입)
      const service = createServiceClient()
      const { data: profile } = await service
        .from('user_profiles')
        .select('id')
        .eq('id', data.user.id)
        .single()

      if (!profile) {
        await service.from('user_profiles').insert({
          id: data.user.id,
          name: data.user.user_metadata?.name || data.user.user_metadata?.full_name || null,
          avatar_url: data.user.user_metadata?.avatar_url || null,
          role: 'client',
          usage_count: 0,
          usage_limit: 3,
        })
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
