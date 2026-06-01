export type ProjectStatus =
  | 'intake_submitted'
  | 'script_generating'
  | 'script_review'
  | 'script_approved'
  | 'design_planning'      // v6: 디자인 기획(style-guide) 생성 중
  | 'design_plan_review'   // v6: 디자인 기획 검수 대기
  | 'prompt_ready'         // v6: 스타일링샷 프롬프트 준비 — 운영자 이미지 추출 대기
  | 'photo_scheduled'
  | 'photo_uploaded'
  | 'design_generating'
  | 'design_review'
  | 'design_approved'
  | 'delivered'

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  intake_submitted:   '접수 완료',
  script_generating:  '스크립트 생성 중',
  script_review:      '스크립트 검수 대기',
  script_approved:    '스크립트 승인',
  design_planning:    '디자인 기획 생성 중',
  design_plan_review: '디자인 기획 검수 대기',
  prompt_ready:       '스타일링샷 프롬프트 준비',
  photo_scheduled:    '촬영 예정',
  photo_uploaded:     '사진 업로드 완료',
  design_generating:  '디자인 생성 중',
  design_review:      '디자인 검수 대기',
  design_approved:    '디자인 승인',
  delivered:          '납품 완료',
}

// 클라이언트(기업)에게 보여지는 라벨 — AI/자동화 노출 없이 사람이 작업하는 것처럼 표현
export const CLIENT_STATUS_LABELS: Record<ProjectStatus, string> = {
  intake_submitted:   '접수 완료',
  script_generating:  '담당자 검토 중',
  script_review:      '담당자 검토 중',
  script_approved:    '제작 준비 완료',
  design_planning:    '제작 준비 중',
  design_plan_review: '제작 준비 중',
  prompt_ready:       '제작 중',
  photo_scheduled:    '촬영 예정',
  photo_uploaded:     '사진 접수 완료',
  design_generating:  '제작 중',
  design_review:      '초안 확인 요청',
  design_approved:    '최종 확인 완료',
  delivered:          '납품 완료',
}

// v6 워크플로 전이 (2026-05): 스크립트 → 디자인기획 → 프롬프트 → 이미지추출 → 템플릿결합 → 검수전달
const TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  intake_submitted:  ['script_generating'],
  script_generating: ['script_review'],
  script_review:     ['script_approved', 'script_generating'],
  script_approved:   ['design_planning'],                       // v6: 스크립트 승인 → 디자인 기획
  design_planning:   ['design_plan_review', 'script_approved'], // v6: 기획 완료 → 검수 / 실패 시 롤백
  design_plan_review:['prompt_ready', 'design_planning'],       // v6: 기획 승인 → 프롬프트 / 반려 → 재생성
  prompt_ready:      ['photo_uploaded'],                        // v6: 프롬프트 준비 → 운영자 이미지 추출·업로드
  photo_scheduled:   ['photo_uploaded'],                        // 레거시 호환 유지
  photo_uploaded:    ['design_generating'],
  design_generating: ['design_review'],
  design_review:     ['design_approved', 'design_generating'],
  design_approved:   ['delivered'],
  delivered:         [],
}

export function canTransition(from: ProjectStatus, to: ProjectStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false
}

export function nextStatus(current: ProjectStatus): ProjectStatus | null {
  return TRANSITIONS[current]?.[0] ?? null
}

export async function transitionStatus(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  projectId: string,
  toStatus: ProjectStatus,
  options?: { changedBy?: string; note?: string }
) {
  const { data: project } = await supabase
    .from('projects').select('status').eq('id', projectId).single()
  if (!project) throw new Error(`Project ${projectId} not found`)

  const from = (project as { status: string }).status as ProjectStatus
  if (!canTransition(from, toStatus)) {
    throw new Error(`Invalid transition: ${from} → ${toStatus}`)
  }

  await supabase.from('projects').update({ status: toStatus }).eq('id', projectId)
  await supabase.from('project_logs').insert({
    project_id: projectId,
    from_status: from,
    to_status: toStatus,
    changed_by: options?.changedBy ?? null,
    note: options?.note ?? null,
  })
}
