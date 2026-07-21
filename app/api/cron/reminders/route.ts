/**
 * 크론: 재촉 알림 — 매일 09시 KST(UTC 0시) 1회.
 *
 * 두 가지 지연을 잡는다:
 *   1) 의뢰서 미작성 — invited 상태로 N일 이상 머문 프로젝트 → 사업자에게 의뢰서 작성 재촉.
 *   2) 초안 무회신   — design_review 상태로 N일 이상 머문 프로젝트 → 사업자에게 확인 재촉.
 *
 * 설계 원칙:
 *   - 자동 상태 전이(승인 간주)는 하지 않는다. 되돌릴 수 없는 승인을 무회신만으로 처리하면
 *     사업자 의사에 반하는 납품이 될 수 있다. 재촉만 하고 승인은 사람이 누른다.
 *   - hasRecentNotification으로 24h 중복 발송을 막는다(매일 도는 크론이 같은 건을 반복 발송하지 않게).
 *   - Vercel 크론은 Authorization: Bearer $CRON_SECRET 를 자동 첨부한다 — 미검증 시 공개 엔드포인트가 된다.
 */
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { notifyIntakeReminder, notifyReviewReminder } from '@/lib/notify/dispatch'
import { hasRecentNotification } from '@/lib/notify/log'

export const maxDuration = 60

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://detail-page-saas.vercel.app'

/** 재촉 기준(일) — 이 기간 이상 같은 상태에 머물면 재촉 */
const INTAKE_STALE_DAYS = 3
const REVIEW_STALE_DAYS = 3
/** 같은 프로젝트·템플릿 재발송 최소 간격(시간) */
const DEDUP_HOURS = 24

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  // 시크릿 미설정 시 프로덕션에서는 차단(공개 노출 방지), 개발에서는 허용
  if (!secret) return process.env.NODE_ENV !== 'production'
  return request.headers.get('authorization') === `Bearer ${secret}`
}

interface ReminderStat {
  intakeSent: number
  reviewSent: number
  skipped: number
  errors: string[]
}

export async function GET(request: Request): Promise<NextResponse> {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const svc = createServiceClient()
  const stat: ReminderStat = { intakeSent: 0, reviewSent: 0, skipped: 0, errors: [] }
  const now = Date.now()

  // 대상 프로젝트를 한 번에 조회 — 두 상태만
  const { data: projects, error } = await svc
    .from('projects')
    .select('id, company_name, client_id, status, created_at, updated_at')
    .in('status', ['invited', 'design_review'])
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  for (const p of projects ?? []) {
    try {
      const isIntake = p.status === 'invited'
      const staleDays = isIntake ? INTAKE_STALE_DAYS : REVIEW_STALE_DAYS
      // invited는 created_at, design_review는 상태 진입 시각 근사치로 updated_at 사용
      const anchor = new Date(isIntake ? p.created_at : p.updated_at).getTime()
      if (now - anchor < staleDays * 86_400_000) {
        stat.skipped++
        continue
      }

      const template = isIntake ? 'intake_reminder' : 'review_reminder'
      if (await hasRecentNotification(svc, p.id, template, DEDUP_HOURS)) {
        stat.skipped++
        continue
      }

      if (!p.client_id) {
        stat.skipped++
        continue
      }
      const { data: u } = await svc.auth.admin.getUserById(p.client_id)
      const email = u?.user?.email
      const phone = u?.user?.phone
      if (!email && !phone) {
        stat.skipped++
        continue
      }

      const link = isIntake ? `${SITE_URL}/intake` : `${SITE_URL}/projects/${p.id}`
      const target = {
        projectId: p.id,
        projectName: p.company_name ?? '상세페이지',
        email,
        phone,
        link,
      }
      const outcome = isIntake
        ? await notifyIntakeReminder(svc, target)
        : await notifyReviewReminder(svc, target)

      if (outcome.texted || outcome.emailed) {
        if (isIntake) stat.intakeSent++
        else stat.reviewSent++
      } else {
        stat.skipped++
      }
    } catch (err: unknown) {
      stat.errors.push(`${p.id}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  console.log(
    `[cron/reminders] 의뢰서 재촉 ${stat.intakeSent} · 초안 재촉 ${stat.reviewSent} · 스킵 ${stat.skipped} · 오류 ${stat.errors.length}`,
  )
  return NextResponse.json({ ok: true, ...stat })
}
