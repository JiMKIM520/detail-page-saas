import { CategoryPrompt } from './types'

export const livingPrompt: CategoryPrompt = {
  slug: 'living',
  name: '생활용품/홈리빙',
  legalRules:
    '전기용품안전관리법, 생활화학제품안전관리법. KC 안전인증 마크 눈에 띄게. 소재/재질 정확 명시. 화학제품=성분+유통기한. 전기=정격전압+소비전력. mm단위 제원표. 조립 난이도.',
  forbiddenExpressions: [
    {
      forbidden: '인체에 완벽히 무해한 천연 소독제',
      allowed: '안전기준 적합 확인 신고번호',
    },
    { forbidden: '99.9% 완벽 제거', allowed: '특정 조건 하 99% 감소 확인' },
    {
      forbidden: '최고급 천연 원목 (실제 합판)',
      allowed: 'MDF 위 인테리어 필름 마감',
    },
    { forbidden: 'KC인증 없이 판매', allowed: '(법적 처벌 대상)' },
    { forbidden: '의약품 오인 표현', allowed: '(금지)' },
  ],
  requiredSections: [
    '라이프스타일 이미지(룸셋)',
    '페인포인트 공감',
    '기능적 이점',
    '스펙 상세(3D도면/인포그래픽)',
    'KC인증+소재안전성',
    '소셜프루프',
    '관리/세척+배송/교환',
  ],
  tone: '실용적이고 신뢰감 있는 생활 밀착형 조력자 톤. 인테리어는 감성 가미.',
  shootingGuide:
    '다양한 조도 라이프스타일컷, 실제 집 유사 환경, 크기/규격 도면, 구성품 목록, 조립 과정',
}
