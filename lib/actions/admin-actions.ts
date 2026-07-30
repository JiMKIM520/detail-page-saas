/**
 * 관리자 조치 로직 — 화면(세션 인증)과 통합 관리자(서버 간 호출)가 함께 쓴다.
 *
 * 왜 여기로 뺐나: 하나파워온 통합 관리자(hanapoweron.kr)에서도 같은 조치를 실행할 수 있어야 하는데,
 * 로직을 복제하면 두 곳이 어긋난다. 규칙은 이 파일 하나에만 두고 호출 지점만 둘로 둔다.
 * 인증은 호출측(각 라우트)의 책임이다 — 이 함수들은 이미 인증된 요청이라고 가정한다.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { notifyIntakeRevision } from '@/lib/notify/dispatch'

type Svc = SupabaseClient<Database>

export interface ActionResult {
  success: boolean
  error?: string
  /** 호출측이 그대로 응답에 실어 보낼 부가 정보 */
  data?: Record<string, unknown>
}

/** 작업 기한 규칙 — 제품 수령 시점 + 14일 */
const DUE_DAYS = 14

/**
 * 제품 수령 확인. 기획 프로세스 2단계의 기준점으로, 여기서부터 D-14 카운팅이 시작된다.
 * intake_approved_at이 비어 있으면 함께 찍는다(의뢰서 승인 겸용).
 */
export async function receiveProduct(svc: Svc, projectId: string): Promise<ActionResult> {
  const { data: proj } = await svc
    .from('projects')
    .select('id, product_received_at, intake_approved_at')
    .eq('id', projectId)
    .single()
  if (!proj) return { success: false, error: '프로젝트 없음' }
  if (proj.product_received_at) return { success: false, error: '이미 수령 처리됨' }

  const now = new Date()
  const patch: Record<string, string> = { product_received_at: now.toISOString() }
  if (!proj.intake_approved_at) patch.intake_approved_at = now.toISOString()
  // due_date를 세우면 칸반 D-day(dDayLabel)가 전 화면에서 자동으로 따라온다
  patch.due_date = new Date(now.getTime() + DUE_DAYS * 86_400_000).toISOString().slice(0, 10)

  const { error } = await svc.from('projects').update(patch).eq('id', projectId)
  if (error) return { success: false, error: error.message }

  return {
    success: true,
    data: { product_received_at: patch.product_received_at, due_date: patch.due_date },
  }
}

/**
 * 담당 디자이너 배정·해제. 기획자 역할은 디자이너로 통합됐다(planner_id는 레거시).
 */
export async function assignDesigner(
  svc: Svc,
  projectId: string,
  designerId: string | null,
): Promise<ActionResult> {
  const { error } = await svc
    .from('projects')
    .update({ designer_id: designerId || null })
    .eq('id', projectId)
  if (error) return { success: false, error: error.message }
  return { success: true }
}

/**
 * 의뢰서 보완 요청. 상태머신 상태를 늘리지 않고 tags.revise로 표기해
 * 칸반의 최상단 점유 정렬·뱃지가 기존 체계 그대로 작동하게 한다.
 * 사업자 알림은 비치명 — 실패해도 태그는 남는다.
 */
export async function requestIntakeRevision(
  svc: Svc,
  projectId: string,
  note: string | undefined,
  intakeLink: string,
): Promise<ActionResult> {
  const { data: proj } = await svc
    .from('projects')
    .select('id, company_name, client_id, tags')
    .eq('id', projectId)
    .single()
  if (!proj) return { success: false, error: '프로젝트 없음' }

  const tags = (proj.tags && typeof proj.tags === 'object' && !Array.isArray(proj.tags)
    ? (proj.tags as Record<string, boolean>)
    : {}) as Record<string, boolean>
  if (!tags.revise) {
    const { error } = await svc
      .from('projects')
      .update({ tags: { ...tags, revise: true } })
      .eq('id', projectId)
    if (error) return { success: false, error: error.message }
  }

  let emailed = false
  let texted = false
  if (proj.client_id) {
    try {
      const { data: u } = await svc.auth.admin.getUserById(proj.client_id)
      const email = u?.user?.email
      const phone = u?.user?.phone
      if (email || phone) {
        const outcome = await notifyIntakeRevision(
          svc,
          {
            projectId,
            projectName: proj.company_name ?? '상세페이지',
            email,
            phone,
            link: intakeLink,
          },
          note?.trim() || undefined,
        )
        emailed = outcome.emailed
        texted = outcome.texted
      }
    } catch (e) {
      console.warn('[requestIntakeRevision] 알림 발송 경고:', (e as Error).message?.slice(0, 120))
    }
  }

  return { success: true, data: { emailed, texted } }
}

/** 배정 드롭다운용 담당자 후보 */
export async function listDesigners(
  svc: Svc,
): Promise<{ id: string; name: string | null }[]> {
  const { data } = await svc
    .from('user_profiles')
    .select('id, name')
    .eq('role', 'designer')
    .order('name', { ascending: true })
  return (data ?? []) as { id: string; name: string | null }[]
}
