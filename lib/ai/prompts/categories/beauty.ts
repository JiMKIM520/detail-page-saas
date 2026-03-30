import { CategoryPrompt } from './types'

export const beautyPrompt: CategoryPrompt = {
  slug: 'beauty',
  name: '뷰티/화장품',
  legalRules:
    '화장품법 제13조. 전성분·사용기한·내용량 필수. 기능성 화장품은 심사/보고 효능만. 피부 자극 테스트 성적서. Before&After 동일 조건 명시.',
  forbiddenExpressions: [
    { forbidden: '여드름 박멸/아토피 완치', allowed: '민감한 피부를 위한 저자극 설계' },
    { forbidden: '피부 세포 재생', allowed: '피부 컨디셔닝에 도움' },
    { forbidden: '주름 완전 제거', allowed: '주름 개선에 도움(기능성 인증 시)' },
    { forbidden: '영구적 미백', allowed: '피부 톤 케어' },
    { forbidden: '독소 배출', allowed: '(금지)' },
    { forbidden: '절대 부작용 없는 100% 무독성', allowed: '저자극 테스트 완료' },
    { forbidden: '천연/오가닉 (인증 없이)', allowed: '인증 시에만 표기' },
    { forbidden: '피부과전용/약국전용', allowed: '(금지)' },
  ],
  requiredSections: [
    '시각적 후킹(모델+패키지)',
    '임상 데이터',
    '텍스처 체험(GIF)',
    '성분 안전성',
    '사용법(루틴)',
    '전성분+주의사항',
    '고객리뷰+배송',
  ],
  tone: '세련되고 감각적 + 전문적. 더마=연구원톤, 색조=스타일리시톤.',
  shootingGuide:
    '초접사 질감, 피부 광채컷, 성분 원물, 제품 단독, 스와치, 모델+라이프스타일, 패키지 후면',
}
