/**
 * 운영팀(기획자/디자이너) 데모 계정 생성 — 할당 기능용 후보
 * 사용: npx tsx --env-file=.env.local scripts/seed-staff.ts
 *
 * user_metadata.role + user_profiles.role 둘 다 세팅 (로그인 권한 + 후보 조회).
 * 로그인: /admin → 이메일 직접 입력 + 비번 (admin-login이 이메일 형태 허용).
 * 멱등: 이미 있으면 비번/role 갱신.
 */
import { createClient } from '@supabase/supabase-js'

const PASSWORD = 'DetailAI!2026'
const STAFF = [
  { email: 'planner1@detailai.app', role: 'planner', name: '김기획' },
  { email: 'planner2@detailai.app', role: 'planner', name: '이기획' },
  { email: 'designer1@detailai.app', role: 'designer', name: '박디자인' },
  { email: 'designer2@detailai.app', role: 'designer', name: '최디자인' },
]

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) { console.error('env 누락'); process.exit(1) }
  const s = createClient(url, key, { auth: { persistSession: false } })

  const { data: list } = await s.auth.admin.listUsers()
  for (const st of STAFF) {
    let user = list?.users.find((u) => u.email === st.email)
    const meta = { role: st.role, name: st.name }
    if (user) {
      await s.auth.admin.updateUserById(user.id, { password: PASSWORD, user_metadata: meta })
    } else {
      const { data, error } = await s.auth.admin.createUser({
        email: st.email, password: PASSWORD, email_confirm: true, user_metadata: meta,
      })
      if (error || !data?.user) { console.error(`❌ ${st.email}:`, error?.message); continue }
      user = data.user
    }
    await s.from('user_profiles').upsert({ id: user.id, role: st.role, name: st.name })
    console.log(`✅ ${st.name} (${st.role}) — ${st.email}`)
  }

  console.log('\n운영팀 로그인: /admin → 이메일(예: planner1@detailai.app) / ' + PASSWORD)
}

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
