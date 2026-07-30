import { createHmac, timingSafeEqual } from 'crypto'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import {
  receiveProduct,
  assignDesigner,
  requestIntakeRevision,
  listDesigners,
} from '@/lib/actions/admin-actions'

/**
 * 하나파워온 통합 관리자(hanapoweron.kr)에서 호출하는 서버 간 조치 엔드포인트.
 *
 * 브라우저가 아니라 통합 관리자의 서버가 부른다. 로그인 세션 대신 공유 시크릿(SSO_SECRET)
 * 서명으로 신원을 확인하고, 실제 처리는 화면과 똑같은 lib/actions/admin-actions를 쓴다
 * — 규칙이 두 곳에 생기지 않게 하기 위해서다.
 *
 * 허용 조치는 아래 화이트리스트뿐이다. 검수·승인처럼 화면을 봐야 하는 작업은 여기서 하지 않는다.
 */

const WINDOW_MS = 60_000

type Action = 'receive-product' | 'assign' | 'request-revision-intake' | 'list-designers'

interface Body {
  action?: Action
  projectId?: string
  designerId?: string | null
  note?: string
  ts?: number
  token?: string
}

/** 서명 검증 — `apd-action:{ts}:{action}:{projectId}` */
function verify(body: Body): boolean {
  const secret = process.env.SSO_SECRET
  if (!secret || !body.ts || !body.token || !body.action) return false
  if (!Number.isFinite(body.ts) || Math.abs(Date.now() - body.ts) > WINDOW_MS) return false

  const expected = createHmac('sha256', secret)
    .update(`apd-action:${body.ts}:${body.action}:${body.projectId ?? ''}`)
    .digest('hex')
  const a = Buffer.from(expected)
  const b = Buffer.from(body.token)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function POST(request: Request) {
  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ success: false, error: 'bad_request' }, { status: 400 })
  }

  if (!verify(body)) {
    return NextResponse.json({ success: false, error: 'unauthorized' }, { status: 401 })
  }

  const svc = createServiceClient()

  if (body.action === 'list-designers') {
    return NextResponse.json({ success: true, designers: await listDesigners(svc) })
  }

  const projectId = (body.projectId ?? '').trim()
  if (!projectId) {
    return NextResponse.json({ success: false, error: '대상이 지정되지 않았습니다.' }, { status: 400 })
  }

  switch (body.action) {
    case 'receive-product': {
      const r = await receiveProduct(svc, projectId)
      return NextResponse.json(r, { status: r.success ? 200 : 400 })
    }
    case 'assign': {
      const r = await assignDesigner(svc, projectId, body.designerId ?? null)
      return NextResponse.json(r, { status: r.success ? 200 : 400 })
    }
    case 'request-revision-intake': {
      const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://detail.hanapoweron.kr'
      const r = await requestIntakeRevision(svc, projectId, body.note, `${site}/intake`)
      return NextResponse.json(r, { status: r.success ? 200 : 400 })
    }
    default:
      return NextResponse.json({ success: false, error: '허용되지 않은 조치입니다.' }, { status: 400 })
  }
}
