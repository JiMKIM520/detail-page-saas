import { PlatformPrompt } from './types'

export const musinsaPrompt: PlatformPrompt = {
  slug: 'musinsa',
  name: '무신사',
  imageSpecs: {
    width: 1500,
    maxFileSize: '제한 없음 (고해상도 권장)',
    formats: 'JPG/PNG',
  },
  targetAudience:
    '10~20대 중심(71%). 남성 54%. MAU 730만. 트렌드 민감, 브랜드 아이덴티티 중시.',
  layoutRules:
    '트렌디하고 쿨한 패션 감성. 대표이미지 텍스트 삽입 불가(등록 불가). 바닥컷·마네킹컷·고스트컷 혼합 활용. 다양한 체형의 모델 착용 사진(키/체중 명시). 코디 연출 필수.',
  conversionTips:
    '코디 탭 연계 스타일링 제안. 자체 실측 사이즈 기준 상세 가이드 필수. 스태프 착용 사진 포함(체형 정보 병기). 브랜드 룩북 스타일 레이아웃.',
  commonMistakes:
    '대표이미지에 텍스트 삽입 → 등록 불가. 사이즈 정보 부실 → 반품률 증가. 트렌드 무관한 스튜디오 배경 → 플랫폼 감성 미스매치.',
}
