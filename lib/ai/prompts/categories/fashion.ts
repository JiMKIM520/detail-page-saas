import { CategoryPrompt } from './types'

export const fashionPrompt: CategoryPrompt = {
  slug: 'fashion',
  name: '패션/의류/잡화',
  legalRules:
    '섬유제품품질표시규정. 섬유 조성/혼용률(오차2%이내), cm단위 치수, 세탁방법+기호, 제조국, 피팅모델 신체사이즈, 핏가이드, 원단특성 인포그래픽(비침/두께/신축/안감 5단계).',
  forbiddenExpressions: [
    { forbidden: '100% 최고급 캐시미어 (실제 아크릴혼방)', allowed: '투명 혼용률 표기' },
    { forbidden: '유명 백화점 브랜드 동일원단', allowed: '(금지)' },
    { forbidden: 'OO 브랜드 감성/완벽 재현', allowed: '(금지)' },
    { forbidden: '의도적 색상보정', allowed: '실측치수 안내' },
    { forbidden: '최저가/업계1위 (근거 없이)', allowed: '수치 대체' },
    { forbidden: '완벽 방수 (인증 없이)', allowed: '인증 시에만 표기' },
  ],
  requiredSections: [
    '시즌 무드/룩북',
    '스타일링 제안(코디)',
    '디테일 뷰(넥라인/단추/스티치)',
    '컬러 바리에이션',
    '스펙(실측 사이즈표/소재/세탁)',
    '고객리뷰(체형별)+교환/반품',
  ],
  tone: '트렌디하고 감각적. 스펙은 친절하고 명료. 고급=절제, 캐주얼=활기.',
  shootingGuide:
    '색상왜곡 통제 필수, 워킹컷, 모델 피팅(정면/측면/후면+키/체중), 디테일(원단/로고/단추), 플랫레이, 색상별, 코디, 활동컷',
}
