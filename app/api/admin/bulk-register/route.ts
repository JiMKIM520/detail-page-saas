import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const userSupabase = await createClient()
  const { data: { user } } = await userSupabase.auth.getUser()
  if (user?.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const formData = await request.formData()
  const file = formData.get('file')

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: 'CSV 파일이 필요합니다.' }, { status: 400 })
  }

  const text = await file.text()
  const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean)

  if (lines.length < 2) {
    return NextResponse.json({ error: 'CSV에 데이터 행이 없습니다.' }, { status: 400 })
  }

  // Skip header row
  const dataLines = lines.slice(1)

  const service = createServiceClient()
  const results: { email: string; success: boolean; error?: string }[] = []

  function parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
        else inQuotes = !inQuotes
      } else if (ch === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += ch
      }
    }
    result.push(current.trim())
    return result
  }

  for (const line of dataLines) {
    const cols = parseCSVLine(line)
    const email = cols[0]
    const company_name = cols[1]
    const business_number = cols[2]

    if (!email || !company_name || !business_number) {
      results.push({ email: email || '(empty)', success: false, error: '필수 필드 누락' })
      continue
    }

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
    { total: dataLines.length, success: successCount, failed: dataLines.length - successCount, results },
    { status: 201 }
  )
}
