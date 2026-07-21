/**
 * 문자(SMS/LMS) 발송 모듈 — 솔라피(Solapi) v4 REST API.
 *
 * 메일 모듈(lib/email/send.ts)과 같은 계약:
 *   - SOLAPI_API_KEY + SOLAPI_API_SECRET + SOLAPI_SENDER 있으면 실제 발송.
 *   - 하나라도 없으면 console.log stub 후 { sent:true, stub:true } (개발/미준비 환경).
 *   - 프로덕션에서 키 누락은 명시적 실패 반환(silent failure 금지).
 *   - throw하지 않고 { sent, error?, stub? } 반환 — 발송 실패가 파이프라인을 막지 않는다.
 *
 * 준비물(사용자): 솔라피 가입 → 발신번호 등록 → API 키 발급. 키만 env에 넣으면 실동작.
 * 알림톡(카카오)은 템플릿 심사(1~2주) 후 별도 채널로 승격 예정 — 그전까지 SMS로 발송한다.
 */
import crypto from 'node:crypto'

export interface SmsResult {
  sent: boolean
  error?: string
  /** 키 미설정으로 실제 발송 없이 스텁 처리된 경우 true */
  stub?: boolean
}

const SOLAPI_SEND_URL = 'https://api.solapi.com/messages/v4/send'

/** 솔라피 HMAC-SHA256 인증 헤더 생성 */
function buildAuthHeader(apiKey: string, apiSecret: string): string {
  // salt는 12~64자 임의 문자열. date는 ISO8601.
  const date = new Date().toISOString()
  const salt = crypto.randomBytes(32).toString('hex')
  const signature = crypto
    .createHmac('sha256', apiSecret)
    .update(date + salt)
    .digest('hex')
  return `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`
}

/** E.164/하이픈 혼용을 솔라피가 받는 숫자만 형태로 정규화 */
function normalizePhone(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, '')
  // +82 10 ... → 010 ...
  if (digits.startsWith('82')) return `0${digits.slice(2)}`
  return digits
}

function logStub(to: string, text: string): void {
  console.log('[SmsStub] 문자 발송 (stub) ─────────────────────────')
  console.log(`  수신자: ${to}`)
  console.log(`  본문:\n${text}`)
  console.log('──────────────────────────────────────────────────────')
}

/**
 * 문자 한 건 발송. 90바이트(EUC-KR 기준 45자) 초과는 솔라피가 자동으로 LMS 승격하므로
 * 본문 길이를 여기서 자르지 않는다 — 잘리면 정보가 사라져 재촉 문자의 목적을 해친다.
 */
export async function sendSms(to: string, text: string): Promise<SmsResult> {
  const apiKey = process.env.SOLAPI_API_KEY
  const apiSecret = process.env.SOLAPI_API_SECRET
  const from = process.env.SOLAPI_SENDER

  if (!apiKey || !apiSecret || !from) {
    if (process.env.NODE_ENV === 'production') {
      const msg = '솔라피 환경변수(SOLAPI_API_KEY/SECRET/SENDER) 미설정 — 문자 미발송'
      console.error(`[SMS] ${msg}`)
      return { sent: false, error: msg }
    }
    logStub(to, text)
    return { sent: true, stub: true }
  }

  try {
    const res = await fetch(SOLAPI_SEND_URL, {
      method: 'POST',
      headers: {
        Authorization: buildAuthHeader(apiKey, apiSecret),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: { to: normalizePhone(to), from: normalizePhone(from), text },
      }),
    })
    if (!res.ok) {
      let detail = `HTTP ${res.status}`
      try {
        const body: unknown = await res.json()
        if (body && typeof body === 'object' && 'errorMessage' in body) {
          detail = String((body as { errorMessage: unknown }).errorMessage)
        }
      } catch {
        /* JSON 파싱 실패 시 상태코드만 */
      }
      throw new Error(`솔라피 오류: ${detail}`)
    }
    return { sent: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[SMS] 발송 실패: ${message}`)
    return { sent: false, error: message }
  }
}

// ── 템플릿 ─────────────────────────────────────────────────────────────────

/** 초안 확인 요청 문자 — design_review 도달 시 메일과 병행 */
export function draftReadySms(projectName: string, link: string): string {
  return `[DetailAI] "${projectName}" 상세페이지 초안이 준비되었습니다. 확인 후 검수 의견을 남겨 주세요.\n▶ ${link}`
}

/** 최종 납품 문자 — delivered 도달 시 */
export function deliveredSms(projectName: string, link: string): string {
  return `[DetailAI] "${projectName}" 최종 결과물이 납품되었습니다. 아래 링크에서 다운로드해 주세요(만료 주의).\n▶ ${link}`
}

/** 의뢰서 미작성 재촉 문자 — 크론 */
export function intakeReminderSms(projectName: string, link: string): string {
  return `[DetailAI] "${projectName}" 상세페이지 제작을 위한 의뢰서가 아직 작성되지 않았습니다. 아래에서 작성해 주세요.\n▶ ${link}`
}

/** 초안 무회신 재촉 문자 — 크론 */
export function reviewReminderSms(projectName: string, link: string): string {
  return `[DetailAI] "${projectName}" 상세페이지 초안 확인이 지연되고 있습니다. 확인 후 의견을 남겨 주세요.\n▶ ${link}`
}
