import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/** 담당자 후보 조회: planner/designer role 계정 목록 (배정 드롭다운용) */
export async function GET() {
  const userSupabase = await createClient()
  const { data: { user } } = await userSupabase.auth.getUser()
  const role = user?.user_metadata?.role as string | undefined
  if (!user || !['admin', 'planner', 'designer'].includes(role ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = createServiceClient()
  const { data } = await supabase
    .from('user_profiles')
    .select('id, name, role')
    .in('role', ['planner', 'designer'])
    .order('name', { ascending: true })

  const rows = (data ?? []) as { id: string; name: string | null; role: string }[]
  return NextResponse.json({
    planners: rows.filter((u) => u.role === 'planner'),
    designers: rows.filter((u) => u.role === 'designer'),
  })
}
