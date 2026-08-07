import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { ProjectCard } from '@/components/shared/ProjectCard'
import { IntakeEntry } from '@/components/client/IntakeEntry'
import type { ProjectStatus } from '@/lib/status-machine'
import { redirect } from 'next/navigation'

/**
 * 기업 첫 화면.
 *
 * 예전에는 제출한 프로젝트를 카드로 한 번 더 거쳐야 내용을 볼 수 있었다. 카드를 없애고
 * 상태에 따라 바로 해당 화면을 보여준다(2026-08-07 요청):
 *   제출 완료 → 제출한 의뢰서 화면으로 바로 이동
 *   작성 중   → 이어쓰기 안내 (임시저장은 localStorage에 있어 IntakeEntry가 확인)
 *   시작 전   → '디자인 의뢰 시작하기'만
 */
export default async function ClientProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('client_id', user!.id)
    .order('created_at', { ascending: false })

  // invited는 관리자가 계정만 열어둔 상태로, 프로젝트 행은 있어도 의뢰서는 아직 없다.
  // 행 개수로 판단하면 의뢰서를 쓰지도 않은 기업이 빈 상세 화면으로 끌려가 시작 버튼을 잃는다.
  const projectList = (projects ?? []).filter(p => p.status !== 'invited')

  // 제출한 의뢰서가 하나면 그 화면이 곧 첫 화면이다 — 카드를 거치지 않는다
  if (projectList.length === 1) {
    redirect(`/projects/${projectList[0].id}`)
  }

  const service = createServiceClient()
  const { data: profile } = await service
    .from('user_profiles')
    .select('usage_count, usage_limit')
    .eq('id', user!.id)
    .single()

  const usageCount = profile?.usage_count ?? 0
  const usageLimit = profile?.usage_limit ?? 1

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">내 상세페이지</h1>
        <p className="text-sm text-text-tertiary mt-1">
          사용량 {usageCount} / {usageLimit}건
        </p>
      </div>

      {projectList.length === 0 && (
        <IntakeEntry usageExhausted={usageCount >= usageLimit} />
      )}

      {/* 의뢰서가 둘 이상인 비정상 케이스 — 목록으로 폴백 */}
      {projectList.length > 1 && (
        <div className="grid gap-3">
          {projectList.map(project => (
            <ProjectCard
              key={project.id}
              id={project.id}
              company_name={project.company_name ?? ''}
              status={project.status as ProjectStatus}
              created_at={project.created_at}
              clientFacing
            />
          ))}
        </div>
      )}
    </div>
  )
}
