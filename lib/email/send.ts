/**
 * 메일 발송 모듈
 *
 * 사업자에게 2개 분기점에만 메일 발송 (2026-05 회의 결정):
 *   1. design_review 도달 시 → sendDraftReadyEmail (초안 확인 요청)
 *   2. delivered 도달 시     → sendDeliveredEmail  (최종 결과물)
 *
 * 프로바이더 우선순위(먼저 설정된 것을 쓴다):
 *   1. Gmail SMTP  — GMAIL_USER + GMAIL_APP_PASSWORD (nodemailer)
 *   2. Resend      — RESEND_API_KEY (REST fetch)
 *   3. stub        — 둘 다 없으면 console.log (개발/미준비). prod에서는 명시적 실패.
 *
 * 주의: 발송 실패가 호출측 파이프라인을 막지 않도록
 *       함수는 throw하지 않고 { sent: boolean; error?: string } 반환.
 */

// ── 타입 정의 ────────────────────────────────────────────────────────────

export interface EmailResult {
  sent: boolean
  error?: string
}

interface ResendEmailPayload {
  from: string
  to: string[]
  subject: string
  text: string
}

interface ResendSuccessResponse {
  id: string
}

interface ResendErrorResponse {
  name: string
  message: string
  statusCode: number
}

// ── 상수 ─────────────────────────────────────────────────────────────────

/** 발신자 주소 — 환경변수로 오버라이드 가능 */
const FROM_ADDRESS =
  process.env.EMAIL_FROM_ADDRESS ?? 'DetailAI <noreply@detailai.kr>'

/** Resend API 엔드포인트 */
const RESEND_API_URL = 'https://api.resend.com/emails'

// ── 내부 유틸 ─────────────────────────────────────────────────────────────

/**
 * Resend REST API로 실제 메일 발송
 * @throws 발송 실패 시 Error를 throw (호출측에서 catch해 EmailResult로 변환)
 */
async function sendViaResend(
  apiKey: string,
  payload: ResendEmailPayload
): Promise<void> {
  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    // Resend 오류 응답 파싱 시도
    let detail = `HTTP ${response.status}`
    try {
      const body: unknown = await response.json()
      if (
        body !== null &&
        typeof body === 'object' &&
        'message' in body &&
        typeof (body as ResendErrorResponse).message === 'string'
      ) {
        detail = (body as ResendErrorResponse).message
      }
    } catch {
      // JSON 파싱 실패 시 HTTP 상태 코드만 사용
    }
    throw new Error(`Resend API 오류: ${detail}`)
  }

  // 응답 검증 (id 있으면 성공으로 간주)
  const data: unknown = await response.json()
  if (
    data === null ||
    typeof data !== 'object' ||
    !('id' in data) ||
    typeof (data as ResendSuccessResponse).id !== 'string'
  ) {
    throw new Error('Resend API: 예상치 못한 응답 형식')
  }
}

/**
 * Gmail SMTP로 실제 발송 (nodemailer). 발신 주소는 Gmail 계정으로 고정한다 —
 * Gmail은 인증 계정과 다른 from을 거부하므로 EMAIL_FROM_ADDRESS를 무시하고 GMAIL_USER를 쓴다.
 * @throws 발송 실패 시 Error (호출측 dispatch가 catch)
 */
async function sendViaGmail(
  user: string,
  pass: string,
  payload: ResendEmailPayload,
): Promise<void> {
  const nodemailer = await import('nodemailer')
  const transport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user, pass },
  })
  await transport.sendMail({
    from: `DetailAI <${user}>`,
    to: payload.to.join(', '),
    subject: payload.subject,
    text: payload.text,
  })
}

/**
 * 개발 환경 stub — 실제 발송 없이 콘솔에 메일 내용 출력
 */
function logStub(payload: ResendEmailPayload): void {
  // TODO: 운영 환경에서는 RESEND_API_KEY 환경변수를 반드시 설정할 것
  console.log('[EmailStub] 메일 발송 (stub) ─────────────────────────')
  console.log(`  수신자: ${payload.to.join(', ')}`)
  console.log(`  발신자: ${payload.from}`)
  console.log(`  제목:   ${payload.subject}`)
  console.log(`  본문:\n${payload.text}`)
  console.log('──────────────────────────────────────────────────────')
}

/**
 * 공통 발송 처리 — API 키 유무에 따라 실제/stub 분기
 */
async function dispatch(payload: ResendEmailPayload): Promise<EmailResult> {
  const gmailUser = process.env.GMAIL_USER
  const gmailPass = process.env.GMAIL_APP_PASSWORD
  const apiKey = process.env.RESEND_API_KEY

  // 1순위: Gmail SMTP
  if (gmailUser && gmailPass) {
    try {
      await sendViaGmail(gmailUser, gmailPass, payload)
      return { sent: true }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      console.error(`[Email] Gmail 발송 실패 — ${payload.subject}: ${message}`)
      return { sent: false, error: message }
    }
  }

  // 2순위: Resend
  if (apiKey) {
    try {
      await sendViaResend(apiKey, payload)
      return { sent: true }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      console.error(`[Email] Resend 발송 실패 — ${payload.subject}: ${message}`)
      return { sent: false, error: message }
    }
  }

  // 3순위: 프로바이더 없음 — prod는 명시적 실패(메일 누락=납품 지연), dev는 stub
  if (process.env.NODE_ENV === 'production') {
    const msg = '메일 프로바이더(GMAIL_* 또는 RESEND_API_KEY) 미설정 — 메일 미발송'
    console.error(`[Email] ${msg}`)
    return { sent: false, error: msg }
  }
  logStub(payload)
  return { sent: true }
}

// ── 공개 API ──────────────────────────────────────────────────────────────

/**
 * 초안 확인 요청 메일 — design_review 상태 도달 시 호출
 *
 * @param to          수신자 이메일 주소
 * @param projectName 프로젝트(상품) 이름
 * @param reviewLink  웹앱 검수 링크 (이미지 첨부 절대 X, 링크만 포함)
 * @returns           { sent: boolean; error?: string }
 */
export async function sendDraftReadyEmail(
  to: string,
  projectName: string,
  reviewLink: string
): Promise<EmailResult> {
  const subject = `[DetailAI] "${projectName}" 상세페이지 초안이 준비되었습니다`

  const text = [
    `안녕하세요,`,
    ``,
    `"${projectName}" 상세페이지 초안 작업이 완료되었습니다.`,
    `아래 링크에서 초안을 확인하고 검수 의견을 남겨 주세요.`,
    ``,
    `▶ 초안 확인하기: ${reviewLink}`,
    ``,
    `검수 의견은 웹앱 내 코멘트 기능을 통해 남겨 주시면 됩니다.`,
    `의견을 반영하여 최종 결과물을 납품해 드리겠습니다.`,
    ``,
    `감사합니다.`,
    `DetailAI 팀 드림`,
  ].join('\n')

  return dispatch({ from: FROM_ADDRESS, to: [to], subject, text })
}

/**
 * 의뢰서 미작성 재촉 메일 — 크론에서 호출. 전화번호가 없는 사업자에게도 재촉이 닿게 한다.
 */
export async function sendIntakeReminderEmail(
  to: string,
  projectName: string,
  intakeLink: string,
): Promise<EmailResult> {
  const subject = `[DetailAI] "${projectName}" 상세페이지 의뢰서 작성을 기다리고 있습니다`
  const text = [
    `안녕하세요,`,
    ``,
    `"${projectName}" 상세페이지 제작을 위한 의뢰서가 아직 작성되지 않았습니다.`,
    `아래 링크에서 의뢰서를 작성해 주시면 제작을 시작하겠습니다.`,
    ``,
    `▶ 의뢰서 작성하기: ${intakeLink}`,
    ``,
    `감사합니다.`,
    `DetailAI 팀 드림`,
  ].join('\n')
  return dispatch({ from: FROM_ADDRESS, to: [to], subject, text })
}

/**
 * 초안 무회신 재촉 메일 — 크론에서 호출.
 */
export async function sendReviewReminderEmail(
  to: string,
  projectName: string,
  reviewLink: string,
): Promise<EmailResult> {
  const subject = `[DetailAI] "${projectName}" 상세페이지 초안 확인을 기다리고 있습니다`
  const text = [
    `안녕하세요,`,
    ``,
    `"${projectName}" 상세페이지 초안 확인이 지연되고 있습니다.`,
    `아래 링크에서 초안을 확인하고 검수 의견을 남겨 주세요.`,
    ``,
    `▶ 초안 확인하기: ${reviewLink}`,
    ``,
    `감사합니다.`,
    `DetailAI 팀 드림`,
  ].join('\n')
  return dispatch({ from: FROM_ADDRESS, to: [to], subject, text })
}

/**
 * 최종 결과물 납품 메일 — delivered 상태 도달 시 호출
 *
 * @param to          수신자 이메일 주소
 * @param projectName 프로젝트(상품) 이름
 * @param downloadUrl 만료 signed URL (다운로드 링크)
 * @returns           { sent: boolean; error?: string }
 */
export async function sendDeliveredEmail(
  to: string,
  projectName: string,
  downloadUrl: string
): Promise<EmailResult> {
  const subject = `[DetailAI] "${projectName}" 최종 결과물이 납품되었습니다`

  const text = [
    `안녕하세요,`,
    ``,
    `"${projectName}" 상세페이지 최종 결과물이 준비되었습니다.`,
    `아래 링크에서 파일을 다운로드해 주세요.`,
    ``,
    `▶ 결과물 다운로드: ${downloadUrl}`,
    ``,
    `※ 위 링크는 보안을 위해 일정 기간 후 만료됩니다.`,
    `   만료 전에 파일을 저장해 두시기 바랍니다.`,
    ``,
    `이용해 주셔서 감사합니다.`,
    `DetailAI 팀 드림`,
  ].join('\n')

  return dispatch({ from: FROM_ADDRESS, to: [to], subject, text })
}
