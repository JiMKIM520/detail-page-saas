import { createClient } from '@supabase/supabase-js'

const service = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const SEED_USERS = [
  { email: 'admin@kompa.kr',    password: 'Change_me_1!', role: 'admin',    name: '어드민' },
  { email: 'planner@kompa.kr',  password: 'Change_me_1!', role: 'planner',  name: '기획자' },
  { email: 'designer@kompa.kr', password: 'Change_me_1!', role: 'designer', name: '디자이너' },
]

async function seed() {
  for (const u of SEED_USERS) {
    const { data, error } = await service.auth.admin.createUser({
      email: u.email, password: u.password,
      user_metadata: { role: u.role, name: u.name },
      email_confirm: true,
    })
    if (error) console.error(`Failed ${u.email}:`, error.message)
    else console.log(`Created: ${u.email} (${u.role})`)
  }
}

seed()
