import { PlatformPrompt } from './types'

export const ohousePrompt: PlatformPrompt = {
  slug: 'ohouse',
  name: '오늘의집',
  imageSpecs: {
    width: 1440,
    maxHeight: 10000,
    maxFileSize: '10MB (6MB 초과 시 자동 축소)',
    formats: 'JPG/PNG (GIF 지양)',
  },
  targetAudience:
    '인테리어/리빙 고관여 20~30대(비율 70%). 1인가구 비중 높음. 공간 완성에 관심 있는 라이프스타일 소비자.',
  layoutRules:
    '룸셋 스타일링 연출 필수. 대표/서브 이미지에 텍스트·광고 문구 삽입 불가. 누끼컷(흰 배경) 단독 사용 지양. 실제 공간 연출 사진 중심. 매거진 톤의 고퀄리티 이미지.',
  conversionTips:
    '3D 인테리어 배치 시각화 활용. 집들이 UGC 연동 및 실제 사용 후기 매거진 형식. 비포/애프터 인테리어 변화 연출. 동일 공간 내 함께 쓰는 제품 코디 추천.',
  commonMistakes:
    '이미지에 텍스트/가격 삽입(정책 위반). 공간 연출샷 없이 누끼컷만 사용. 해상도 6MB 초과 방치 → 자동 축소로 화질 저하.',
}
