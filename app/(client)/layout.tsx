import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-gray-900">상세페이지 AI</span>
        <span className="text-sm text-gray-500">{user.email}</span>
      </nav>
      <main className="max-w-3xl mx-auto p-6">{children}</main>
    </div>
  )
}
