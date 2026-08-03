import { redirect } from 'next/navigation'

/**
 * 시안 보드는 진행 대시보드(단일 리스트)에 통합됐다.
 * 1차시안·검수/기업 수정요청/완료 그룹이 대시보드 안에 있고 만족/불만족도 그 행에서 처리한다.
 * 기존 링크·북마크 호환을 위해 대시보드로 넘긴다.
 */
export default function ReviewRedirect() {
  redirect('/dashboard')
}
