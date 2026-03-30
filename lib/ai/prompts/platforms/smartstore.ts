import { PlatformPrompt } from './types'

export const smartstorePrompt: PlatformPrompt = {
  slug: 'smartstore',
  name: '스마트스토어',
  imageSpecs: {
    width: 860,
    maxHeight: 5000,
    maxFileSize: '20MB',
    thumbnailSize: '1300px 1:1',
    formats: 'JPG/PNG/GIF',
  },
  targetAudience:
    '전 연령대, 30~50대 핵심. 검색 기반 유입. 네이버 검색→상품 상세 진입 패턴.',
  layoutRules:
    '블로그형 스토리텔링, 높은 텍스트 가독성. 상단 2-3컷에 핵심 셀링포인트 배치. 모바일 퍼스트 설계. 이미지:텍스트 비율 7:3. 폰트 Noto Sans KR/Pretendard, PC 대비 1.5배 크게. 이미지당 최대 5000px, 분할 시 1100px 기준.',
  conversionTips:
    'SEO 최적화(상품명 키워드 포함). 네이버 톡톡 상담 연동 유도. 리뷰/평점 연동 섹션 강조. 찜/공유 유도 문구 포함.',
  commonMistakes:
    '통이미지 업로드 → 모바일 로딩 지연 + SEO 불이익. 과다 키워드 삽입으로 스팸 판정. 이미지 내 텍스트 과다(크롤링 불가).',
}
