import { CategoryPrompt } from './types'

export const petPrompt: CategoryPrompt = {
  slug: 'pet',
  name: '반려동물용품',
  legalRules:
    '사료관리법(2025.9 개정). 성분등록번호, 등록성분량 7가지, 원료목록(공식명칭), 급여대상/급여량, 유통기한. 용품=KC인증. 체중/생애주기별 급여량표, 키블 크기 비교. 전문가 단순 추천 원천 차단, R&D 참여만 허용.',
  forbiddenExpressions: [
    {
      forbidden: '강아지 관절염 완치',
      allowed: '관절 건강 유지에 도움을 줄 수 있는 영양소 함유',
    },
    {
      forbidden: '수의사 보증 최고급 사료',
      allowed: '수의사 OOO가 R&D에 직접 참여',
    },
    { forbidden: '주문 쇄도로 특수 제법 연장', allowed: '(금지)' },
    { forbidden: '처방식', allowed: '(금지)' },
    { forbidden: 'AAFCO 미충족 시 "완전영양"', allowed: '(금지)' },
  ],
  requiredSections: [
    '감성 후킹(보호자+반려동물)',
    '원료 안전성',
    '영양학적 가치',
    '기호성 증명(먹방GIF/ASMR)',
    '급여량 가이드(체중별표)',
    '성분표+주의사항+배송',
  ],
  tone: '따뜻한 공감의 펫 페어런츠 파트너 톤 + 수의학 이성적 전문성.',
  shootingGuide:
    '사료 알갱이 극접사, 건강한 반려동물컷, 키블 동전 비교, 보호자+반려동물 교감, 패키지 전/후면',
}
