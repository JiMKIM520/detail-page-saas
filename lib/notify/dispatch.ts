/**
 * 통합 알림 발송 — 메일·문자를 함께 보내고 발송 로그를 남긴다.
 *
 * 왜 통합하는가: 지금까지 발송 지점(send-draft·review)이 메일만 직접 호출하고 로그를 남기지
 * 않았다. 채널이 둘(메일·문자)이 되고 크론이 중복 발송을 피해야 하므로, 발송+로그를 한 곳에 모은다.
 *
 * 채널 정책: 메일과 문자를 모두 시도하되 서로의 실패에 영향받지 않는다(각각 로그).
 * 수신처가 없으면 그 채널은 건너뛴다.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import {
  sendDraftReadyEmail,
  sendDeliveredEmail,
  sendIntakeReminderEmail,
  sendReviewReminderEmail,
  sendIntakeRevisionEmail,
} from '@/lib/email/send'
import {
  sendSms,
  draftReadySms,
  deliveredSms,
  intakeReminderSms,
  reviewReminderSms,
  intakeRevisionSms,
} from '@/lib/sms/send'
import { logNotification, type NotifyTemplate } from './log'

type Svc = SupabaseClient<Database>

export interface NotifyTarget {
  projectId: string
  projectName: string
  /** 수신자 이메일 — 없으면 메일 건너뜀 */
  email?: string | null
  /** 수신자 전화 — 없으면 문자 건너뜀 */
  phone?: string | null
  /** 링크(검수·다운로드·의뢰서 등) */
  link: string
}

export interface NotifyOutcome {
  emailed: boolean
  texted: boolean
  emailError?: string
  smsError?: string
}

interface Channels {
  emailSubjectFn?: (t: NotifyTarget) => Promise<{ sent: boolean; error?: string }>
  smsText?: string
}

/** 메일+문자 공통 발송·로그 처리 */
async function dispatch(
  svc: Svc,
  target: NotifyTarget,
  template: NotifyTemplate,
  channels: Channels,
): Promise<NotifyOutcome> {
  const out: NotifyOutcome = { emailed: false, texted: false }

  // 메일
  if (channels.emailSubjectFn && target.email) {
    const r = await channels.emailSubjectFn(target)
    out.emailed = r.sent
    out.emailError = r.error
    await logNotification(svc, {
      projectId: target.projectId,
      channel: 'email',
      template,
      recipient: target.email,
      status: r.sent ? 'sent' : 'failed',
      meta: { error: r.error },
    })
  }

  // 문자
  if (channels.smsText && target.phone) {
    const r = await sendSms(target.phone, channels.smsText)
    out.texted = r.sent
    out.smsError = r.error
    await logNotification(svc, {
      projectId: target.projectId,
      channel: 'sms',
      template,
      recipient: target.phone,
      status: r.sent ? (r.stub ? 'stub' : 'sent') : 'failed',
      meta: { error: r.error },
    })
  }

  return out
}

/** 초안 확인 요청 — design_review 도달 시 */
export function notifyDraftReady(svc: Svc, target: NotifyTarget): Promise<NotifyOutcome> {
  return dispatch(svc, target, 'draft_ready', {
    emailSubjectFn: (t) => sendDraftReadyEmail(t.email!, t.projectName, t.link),
    smsText: draftReadySms(target.projectName, target.link),
  })
}

/** 최종 납품 — delivered 도달 시 */
export function notifyDelivered(svc: Svc, target: NotifyTarget): Promise<NotifyOutcome> {
  return dispatch(svc, target, 'delivered', {
    emailSubjectFn: (t) => sendDeliveredEmail(t.email!, t.projectName, t.link),
    smsText: deliveredSms(target.projectName, target.link),
  })
}

/** 의뢰서 미작성 재촉 — 크론. 메일·문자 모두 시도(전화번호 없는 사업자도 메일로 닿게) */
export function notifyIntakeReminder(svc: Svc, target: NotifyTarget): Promise<NotifyOutcome> {
  return dispatch(svc, target, 'intake_reminder', {
    emailSubjectFn: (t) => sendIntakeReminderEmail(t.email!, t.projectName, t.link),
    smsText: intakeReminderSms(target.projectName, target.link),
  })
}

/** 초안 무회신 재촉 — 크론 */
export function notifyReviewReminder(svc: Svc, target: NotifyTarget): Promise<NotifyOutcome> {
  return dispatch(svc, target, 'review_reminder', {
    emailSubjectFn: (t) => sendReviewReminderEmail(t.email!, t.projectName, t.link),
    smsText: reviewReminderSms(target.projectName, target.link),
  })
}

/** 의뢰서 보완 요청 — 관리자 수동(입력정보확인 단계). note는 보완 요청 상세 내용 */
export function notifyIntakeRevision(svc: Svc, target: NotifyTarget, note?: string): Promise<NotifyOutcome> {
  return dispatch(svc, target, 'intake_revision', {
    emailSubjectFn: (t) => sendIntakeRevisionEmail(t.email!, t.projectName, t.link, note),
    smsText: intakeRevisionSms(target.projectName, target.link),
  })
}
