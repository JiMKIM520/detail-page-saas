# DetailAI 블록 변형 저작 규약 (Sprint 8-B)

레포: /Users/jinman/Desktop/Projects/products/detail-page-saas
참고 예시 파일(반드시 1개 이상 Read): agents/templates/blocks/variants/callout.ts (소형),
agents/templates/blocks/variants/usage-zigzag.ts (이미지+강등), agents/templates/blocks/variants/cert.ts (SVG 장식)

## 원칙
- **클론 금지**: 피그마 템플릿의 구조·위계·시각 장치를 흡수하되, 카피·이미지·브랜드 요소는 우리 슬롯으로 재구성.
- 하나의 파일 = 1~2개 defineBlock. 파일명 = 주 변형 id와 동일(케밥).
- 모든 텍스트 슬롯은 한국어 콘텐츠 전제. 이모지 금지.

## 필수 형태 토큰 (Sprint 6 Directive — 위반 시 반려)
- border-radius: `calc(var(--r-scale,1)*Npx)` — px 직접 금지 (원형 50%·필 999px은 예외로 그대로)
- 시그니처 대형 사진 프레임: `var(--shape-photo, <고유값>)` (고유값 = calc식 또는 블롭%)
- 섹션 가로 패딩: `var(--pad-x,56px)`
- 다크 배경(브랜드색·다크 사진) 위 richSafe 텍스트가 있으면: `.<스코프> .em{color:var(--em-dark,#FFF7EA)}` 필수
- 색은 전부 토큰: var(--bg|--paper|--ink|--ink-2|--muted|--accent|--accent-d|--brand|--line)
- 폰트: var(--font-display|--font-body|--font-serif|--font-hand|--font-lat)

## defineBlock 형태
```ts
import { z } from 'zod'
import { defineBlock } from '../types'
import { media } from '../shared'   // 이미지 슬롯 렌더 (url 없으면 .ph — 숨김 placeholder)

const schema = z.object({
  title: z.string().min(1),          // (em,br) 허용 필드는 렌더에서 richSafe() 사용
  desc: z.string().optional(),       // 순수 텍스트 필드는 esc() 사용
  image: z.string().optional(),      // (url)
  items: z.array(z.object({ label: z.string().min(1), text: z.string().min(1) })).min(2).max(6),
})
type Data = z.infer<typeof schema>

export const myVariant = defineBlock<Data>({
  id: 'closing-xxx',                 // <아키타입>-<특징> 케밥
  archetype: 'closing',              // 기존 아키타입만 사용 (신설 금지)
  styleTags: ['light', 'editorial'], // + 이미지 없이도 안전하게 강등 렌더하면 'noimg-safe'
  imageSlots: 1,                     // 이미지 슬롯 수 (없으면 0)
  describe: '한 줄 설명 — 카탈로그에 노출됨. 구조·용도·무드를 구체적으로.',
  schema,
  css: `...`,                        // 클래스 접두는 변형 고유 약어(전역 충돌 금지). 최상위 <section class="접두">
  render: (d, { esc, richSafe, icon }) => `...`,
})
```

## 렌더 규칙
- 최상위는 `<section class="<접두>">`
- 옵션 필드는 `${d.x ? \`...\` : ''}` 가드
- 아이콘: `${icon('check')}` — 허용 이름은 shared.ts ICON_NAMES 35종만
- 이미지: `${media(d.image, '클래스', '대체텍스트')}` — 이미지 필수 레이아웃이면 이미지 없을 때 붕괴하지 않는 강등(noimg-safe) 구현 권장
- 이미지 슬롯이 원형/누끼 전용(contain)이면 절대 사진용으로 쓰지 말고 object-fit:cover 사진 프레임으로 설계

## 산출물 (에이전트당)
1. 변형 파일: agents/templates/blocks/variants/<id>.ts (신규 — 기존 파일 수정 금지)
2. 사이드카: <스크래치패드>/fig-ingest/sidecars/<id>.json
```json
{
  "id": "closing-xxx",
  "exportName": "closingXxx",
  "archetype": "closing",
  "sourceFrame": "원본 프레임 파일명",
  "contractLine": "closing-xxx { title(em,br), desc?, image?(url), items(2~6)[label, text(em,br)] }   // 한 줄 설명",
  "sampleData": { "title": "…", "items": [ … ] },
  "darkSection": false
}
```
- contractLine 형식은 기존 DATA_CONTRACTS와 동일: `<id> { 필드(주석) }   // 설명`
- sampleData는 스키마를 통과하는 현실적 한국어 표본(렌더 스모크에 사용, 이미지 필드는 "https://picsum.photos/800/600" 사용)

## 강조 마크업 형식 (CRITICAL — wave2 결함 12건 원인)
- 강조는 반드시 `<span class="em">텍스트</span>` — `<em>` 태그 금지(richSafe가 이스케이프해 리터럴 노출됨)
- (em) 주석 필드는 렌더에서 반드시 richSafe() 사용 (esc() 금지)
- sampleData 문자열에 & 는 그대로 쓴다(&amp; 금지)
- 이미지 위 텍스트 오버레이에는 반드시 스크림(그라데이션/반투명 패널) 또는 text-shadow
