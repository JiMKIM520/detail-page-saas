import { createServiceClient } from '@/lib/supabase/service'

/**
 * 파이프라인 작업을 워커 큐에 등록한다.
 *
 * 웹 API가 무거운 실행을 직접 await 하면 Vercel 함수가 중간에 끊겨 산출물은 남고
 * 상태 전이만 누락되는 반쪽 실패가 난다(2026-08-07 기획 실측). 워커(Railway 상주)는
 * 시간 제한이 없으므로 웹은 등록만 하고 즉시 응답한다 — worker.ts 헤더의 설계 의도.
 */
export type JobKind = 'planning' | 'shots' | 'draft' | 'script'

export interface EnqueueResult {
  queued: boolean
  /** 이미 같은 종류의 잡이 대기·실행 중이면 중복 등록하지 않는다(버튼 연타 방지) */
  alreadyRunning: boolean
  error?: string
}

export async function enqueueJob(projectId: string, kind: JobKind): Promise<EnqueueResult> {
  const svc = createServiceClient()

  const { data: running } = await svc
    .from('jobs')
    .select('id')
    .eq('project_id', projectId)
    .eq('kind', kind)
    .in('status', ['pending', 'running'])
    .limit(1)

  if (running && running.length > 0) {
    return { queued: false, alreadyRunning: true }
  }

  const { error } = await svc.from('jobs').insert({ project_id: projectId, kind, status: 'pending' })
  if (error) {
    return { queued: false, alreadyRunning: false, error: error.message }
  }

  return { queued: true, alreadyRunning: false }
}
