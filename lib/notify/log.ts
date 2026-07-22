/**
 * 발송 로그 — notifications 테이블에 모든 알림(메일·문자) 발송 기록을 남긴다.
 *
 * 목적 두 가지:
 *   1) 감사 추적 — 누구에게 무엇을 언제 보냈는가(200사 무인 운영의 근거).
 *   2) 중복 발송 방지 — 크론이 재발송을 시도할 때 이미 보낸 건을 건너뛴다.
 *
 * 발송 실패가 파이프라인을 막지 않도록 로그 실패는 삼키고 콘솔에만 남긴다.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

type Svc = SupabaseClient<Database>

/** 알림 채널 — notifications.channel */
export type NotifyChannel = 'email' | 'sms' | 'kakao'

/** 알림 템플릿 키 — notifications.template. 중복 판정·집계의 기준이므로 안정적으로 유지한다. */
export type NotifyTemplate =
  | 'draft_ready' // 초안 확인 요청 (design_review 도달)
  | 'delivered' // 최종 납품 (delivered 도달)
  | 'intake_reminder' // 의뢰서 미작성 재촉 (크론)
  | 'review_reminder' // 초안 무회신 재촉 (크론)
  | 'intake_revision' // 의뢰서 보완 요청 (관리자 수동)

export interface NotifyLogInput {
  projectId: string | null
  channel: NotifyChannel
  template: NotifyTemplate
  recipient: string
  /** 'sent' | 'failed' | 'stub' */
  status: string
  meta?: Record<string, unknown>
}

/** 발송 결과 한 건을 기록한다. 실패해도 throw하지 않는다. */
export async function logNotification(svc: Svc, input: NotifyLogInput): Promise<void> {
  try {
    await svc.from('notifications').insert({
      project_id: input.projectId,
      channel: input.channel,
      template: input.template,
      recipient: input.recipient,
      status: input.status,
      sent_at: input.status === 'failed' ? null : new Date().toISOString(),
      meta: (input.meta ?? {}) as never,
    })
  } catch (err: unknown) {
    // 로그 실패는 비치명 — 발송 자체는 이미 끝났다
    console.error('[notify/log] 기록 실패:', err instanceof Error ? err.message : String(err))
  }
}

/**
 * 최근 N시간 안에 같은 (프로젝트·템플릿) 조합으로 성공 발송한 이력이 있는지.
 * 크론 재발송의 중복 가드 — status가 'failed'인 건은 다시 보낼 수 있어야 하므로 성공 건만 센다.
 */
export async function hasRecentNotification(
  svc: Svc,
  projectId: string,
  template: NotifyTemplate,
  withinHours: number,
): Promise<boolean> {
  const since = new Date(Date.now() - withinHours * 3600_000).toISOString()
  try {
    const { data, error } = await svc
      .from('notifications')
      .select('id')
      .eq('project_id', projectId)
      .eq('template', template)
      .neq('status', 'failed')
      .gte('created_at', since)
      .limit(1)
    if (error) throw error
    return (data?.length ?? 0) > 0
  } catch (err: unknown) {
    // 조회 실패 시 "보낸 적 있음"으로 보수 판정 — 중복 발송보다 미발송이 안전(크론은 다음 주기에 재시도)
    console.error('[notify/log] 중복 조회 실패(보수적으로 발송 보류):', err instanceof Error ? err.message : String(err))
    return true
  }
}
