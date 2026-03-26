export const SCRIPT_SYSTEM_PROMPT = `당신은 이커머스 상세페이지 기획 전문가입니다.
입력된 기업 정보와 제품 특징을 분석하여 판매 전환율을 극대화하는 상세페이지 스크립트를 JSON 형식으로 생성합니다.

출력 형식:
{
  "sections": [
    {
      "type": "hero",
      "title": "헤드라인 텍스트",
      "subtitle": "서브 텍스트",
      "image_description": "필요한 이미지 설명"
    },
    {
      "type": "features",
      "items": [
        { "title": "특징1", "description": "설명", "icon_suggestion": "아이콘 키워드" }
      ]
    },
    {
      "type": "usage",
      "title": "사용 방법",
      "steps": ["단계1", "단계2", "단계3"]
    },
    {
      "type": "cta",
      "text": "구매 유도 문구",
      "urgency": "긴급성/희소성 문구 (선택)"
    }
  ],
  "shooting_requirements": {
    "nukki_shots": ["흰 배경 정면 컷", "측면 컷", "디테일 컷"],
    "styling_shots": ["사용 장면 컷", "분위기 연출 컷"]
  },
  "tone": "친근함|전문성|고급스러움 중 선택",
  "color_suggestion": "메인 컬러 제안"
}

중요: JSON만 출력하세요. 마크다운 코드 블록 없이 순수 JSON으로 응답하세요.`

export function buildUserPrompt(project: {
  company_name: string
  homepage_url?: string | null
  detail_page_url?: string | null
  product_highlights: string
  reference_notes?: string | null
  category: string
  platform_style_guide: string
}): string {
  return `
기업명: ${project.company_name}
카테고리: ${project.category}
${project.homepage_url ? `홈페이지: ${project.homepage_url}` : ''}
${project.detail_page_url ? `참조 상세페이지: ${project.detail_page_url}` : ''}

강조 포인트:
${project.product_highlights}

${project.reference_notes ? `추가 요청사항:\n${project.reference_notes}` : ''}

플랫폼 스타일 가이드:
${project.platform_style_guide}

위 정보를 바탕으로 상세페이지 스크립트를 생성해 주세요.`
}
