import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const role = user.user_metadata?.role
  if (!['planner', 'designer', 'admin'].includes(role)) redirect('/projects')

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex items-center gap-6">
        <span className="font-bold text-gray-900">상세페이지 AI — 관리자</span>
        <Link href="/planner" className="text-sm text-gray-600 hover:text-gray-900">기획 검수</Link>
        <Link href="/photography" className="text-sm text-gray-600 hover:text-gray-900">촬영 관리</Link>
        <Link href="/designer" className="text-sm text-gray-600 hover:text-gray-900">디자인 검수</Link>
        <span className="ml-auto text-sm text-gray-400">{user.email} ({role})</span>
      </nav>
      <main className="max-w-6xl mx-auto p-6">{children}</main>
    </div>
  )
}
