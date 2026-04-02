import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BulkRegisterButton } from './BulkRegisterButton'

export default async function UsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user?.user_metadata?.role !== 'admin') {
    redirect('/planner')
  }

  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('id, name, usage_count, usage_limit, created_at')
    .eq('role', 'client')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">사용자 관리</h1>
          <p className="text-sm text-text-tertiary mt-1">등록된 클라이언트 사용자 목록입니다</p>
        </div>
        <BulkRegisterButton />
      </div>

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-slate-50/50">
              <th className="text-left px-5 py-3 font-medium text-text-secondary">이름</th>
              <th className="text-left px-5 py-3 font-medium text-text-secondary">사용 현황</th>
              <th className="text-left px-5 py-3 font-medium text-text-secondary">등록일</th>
            </tr>
          </thead>
          <tbody>
            {profiles?.map((profile, idx) => (
              <tr
                key={profile.id}
                className={`border-b border-border last:border-0 ${idx % 2 === 1 ? 'bg-slate-50/30' : ''}`}
              >
                <td className="px-5 py-3.5 font-medium text-text-primary">{profile.name}</td>
                <td className="px-5 py-3.5 text-text-secondary">
                  <span className={profile.usage_count >= profile.usage_limit ? 'text-red-600 font-medium' : 'text-text-secondary'}>
                    {profile.usage_count}
                  </span>
                  <span className="text-text-tertiary"> / {profile.usage_limit}</span>
                </td>
                <td className="px-5 py-3.5 text-text-tertiary">
                  {new Date(profile.created_at).toLocaleDateString('ko-KR')}
                </td>
              </tr>
            ))}
            {!profiles?.length && (
              <tr>
                <td colSpan={3} className="text-center py-16 text-text-tertiary">
                  등록된 사용자가 없습니다
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
