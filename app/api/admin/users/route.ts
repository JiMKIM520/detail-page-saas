import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const userSupabase = await createClient()
  const { data: { user } } = await userSupabase.auth.getUser()
  if (user?.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { email, password, role, name } = await request.json()
  const service = createServiceClient()

  const { data, error } = await service.auth.admin.createUser({
    email,
    password,
    user_metadata: { role, name },
    email_confirm: true,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ id: data.user.id, email: data.user.email }, { status: 201 })
}
