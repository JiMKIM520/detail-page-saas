import { CategoryPrompt } from './types'

export const electronicsPrompt: CategoryPrompt = {
  slug: 'electronics',
  name: '전자제품',
  legalRules:
    '전기용품안전관리법. KC인증·정격스펙·소비전력·에너지효율등급·A/S 필수. 과장 성능 금지.',
  forbiddenExpressions: [
    { forbidden: '업계 최고 성능 (근거 없이)', allowed: '구체적 벤치마크 수치' },
    { forbidden: '절대 고장 나지 않는', allowed: 'OO시간 내구성 테스트 통과' },
    {
      forbidden: '경쟁사 대비 2배 (근거 없이)',
      allowed: '공인 테스트 결과 기반 비교',
    },
    { forbidden: 'KC 미인증', allowed: '(법적 처벌 대상)' },
  ],
  requiredSections: [
    '핵심 스펙 히어로(1-2가지 USP)',
    '기술 혁신 설명(인포그래픽)',
    '사용 시나리오(다양한 환경)',
    '스펙 비교표',
    '구성품+설치 가이드',
    'KC인증+A/S+보증',
    '고객리뷰+배송',
  ],
  tone: '기술적이고 정밀한. 스펙 중심 객관적 서술 + 사용 시나리오로 체험적 가치 전달.',
  shootingGuide:
    '제품 45도 앵글컷, UI/화면 모킹, 사용 장면, 내부 구조/기술 다이어그램, 구성품 플랫레이, 크기 비교',
}
