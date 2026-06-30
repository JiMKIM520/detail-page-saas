import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/** 담당자 후보 조회: designer role 계정 목록 (배정 드롭다운용). 기획자는 디자이너로 통합됨. */
export async function GET() {
  const userSupabase = await createClient()
  const { data: { user } } = await userSupabase.auth.getUser()
  const role = user?.user_metadata?.role as string | undefined
  if (!user || !['admin', 'designer'].includes(role ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = createServiceClient()
  const { data } = await supabase
    .from('user_profiles')
    .select('id, name, role')
    .eq('role', 'designer')
    .order('name', { ascending: true })

  const rows = (data ?? []) as { id: string; name: string | null; role: string }[]
  // planners는 통합되어 항상 빈 배열(하위 호환). 호출부는 designers만 사용.
  return NextResponse.json({ planners: [], designers: rows })
}
