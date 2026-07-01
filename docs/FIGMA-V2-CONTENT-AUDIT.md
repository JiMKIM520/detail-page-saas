# Figma V2 내용전개 10종 감사 결과 종합

> 감사 일시: 2026-07-01
> 대상 프레임: content_1 ~ content_10 (총 10종)
> 감사 목적: DetailAI 블록 라이브러리 흡수를 위한 재구성 대상 식별 및 우선순위 수립

---

## 1. Distinct=True 재구성 대상 목록 (전체 10종 모두 신규)

| # | frameId | suggestedVariantId | 한 줄 요약 | complexity | isSingleBlock |
|---|---------|-------------------|-----------|------------|---------------|
| 1 | content_3 | story-vertical-repeat | 다크 배경 + 빨간 액센트 헤드라인 → 중앙텍스트/풀폭이미지 교번 N회 반복 | low | true |
| 2 | content_6 | story-stacked-image-narrative | Pill badge 헤더 + 캡션 간헐 배치 전폭 이미지 수직 스택 | low | true |
| 3 | content_9 | detail-spec-illustration-callout | 제품 일러스트 위에 수치(스펙) 타이포 오버레이 + 상하 chevron 전환 커넥터 | medium | true |
| 4 | content_1 | story-rotating-highlight | 볼드 텍스트 블록 내 하이라이트 마커 줄 위치가 블록마다 순환(1→2→3번째) | low | false |
| 5 | content_2 | detail-image-caption-stack | 원형 아이콘 인트로 + 전폭이미지→텍스트 수직 반복 스택 | low | false |
| 6 | content_4 | story-gallery-narrative | 브랜드 헤더바 → 대형 인트로 → 전폭이미지+캡션 N회 반복 단일 컬럼 갤러리 서사 | low | false |
| 7 | content_5 | story-labeled-image-stack | 수직 디바이더 라인 인트로 + 좌측 앵커 틸 칩 태그 + 풀폭이미지 수직 반복 | low | false |
| 8 | content_7 | detail-point-scroll-stack | POINT 혼합굵기 넘버 라벨 + 풀블리드 이미지 반복 수직 스크롤 서사 | low | false |
| 9 | content_8 | feature-numbered-callout-scroll | 말풍선 배지 번호 + 중앙정렬 특장점 블록 N회 반복, 1열/2열 이미지 변형 포함 | low | false |
| 10 | content_10 | detail-numbered-point-stack | 아치형 배지 + 대형 순번 + 풀폭이미지-캡션 반복 스택, teal 단색 팔레트 | low | false |

---

## 2. 기존 변형과 겹치는(distinct=false) 프레임

감사 대상 10종 모두 `isDistinct: true`로 판정됨.

**중복 제외 항목 없음.**

각 프레임의 감사 노트에서 기존 변형과의 차이가 명시적으로 서술되었으며, 표면적 유사성이 있는 기존 변형 목록은 다음과 같다.

| frameId | 표면적 유사 기존 변형 | 실질 차이점 |
|---------|---------------------|------------|
| content_1 | story-highlight-box, story-text-first | 하이라이트 줄 위치 순환(rotating) + 이미지-캡션 샌드위치 구조가 상이 |
| content_2 | detail-points, feature-zigzag-circle, story-photo-header | 텍스트 오버레이 없음, 좌우 교차 없음, 단일 사진+본문 아님 |
| content_3 | feature-zigzag-circle, story-centered-secondary-image, detail-showcase | 좌우 교차 없음, 단일 보조이미지 아님, 카드/그리드 아님 |
| content_4 | story-photo-header, detail-points, feature-captionbar | 사진 1회 배치 아님, 다크 오버레이 아님, 수평 밴드형 아님 |
| content_5 | story-text-first | 수직 디바이더+센터 헤더 구조 일부 공유하나 좌측 앵커 칩 태그+이미지 반복이 없음 |
| content_6 | story-text-first, feature-zigzag-circle, feature-split-panels, detail-showcase, detail-points | 좌우 교차 없음, 다크 오버레이/설명 밴드 없음, pill badge가 EN 라벨/HR 대체 |
| content_7 | detail-points, story-text-first, feature-editorial, story-photo-header | 이미지 오버레이 없음, HR+수직강조선 없음, 대형 장식 숫자 밴드 아님 |
| content_8 | feature-editorial, detail-points, story-text-first | 대형 장식 숫자+풀폭 밴드 아님, 다크 배경+오버레이 아님, 말풍선 배지가 고유 |
| content_9 | detail-showcase, detail-points, feature-editorial | 일러스트+수치 오버레이 없음, 다크 배경+흰 밴드 아님, 대형 장식 숫자+풀폭 밴드 아님 |
| content_10 | detail-points, feature-editorial, story-centered-secondary-image | 다크 오버레이 아님, 가로 배치 아님, 단일 이미지 아님, 아치 배지+순번 패턴이 고유 |

---

## 3. isSingleBlock=false 분할 필요 프레임 — 서브블록 구성

### content_1 — story-rotating-highlight

| 서브블록 ID | 구성 요소 | 반복 여부 |
|------------|---------|---------|
| hero-headline | 혼합굵기 중앙정렬 제목, accent 컬러 첫 어절 | 1회 |
| image-caption-band | 풀폭 이미지 + 하단 캡션 텍스트 | 상단/하단 각 1회 |
| rotating-highlight-text | 3줄 볼드 + 1줄 yellow 마커 밴드 + 바디 소형 텍스트. `highlightLine` prop(0\|1\|2)으로 순환 | N회 반복 |

조합 순서: `hero-headline → image-caption-band → rotating-highlight-text × N → image-caption-band`

---

### content_2 — detail-image-caption-stack

| 서브블록 ID | 구성 요소 | 반복 여부 |
|------------|---------|---------|
| intro-icon-heading | 원형 테두리 아이콘 배지 + 대제목 | 1회 |
| image-caption-unit | 전폭 이미지 + 볼드 소제목 + 본문 3줄 | 2~4회 가변 반복 |

조합 순서: `intro-icon-heading → image-caption-unit × N`

---

### content_4 — story-gallery-narrative

| 서브블록 ID | 구성 요소 | 반복 여부 |
|------------|---------|---------|
| header-intro-block | 브랜드 헤더바(브랜드명/수평선/부제) + 대형 혼합굵기 헤드라인 + 인트로 텍스트 | 1회 |
| image-caption-unit | 전폭 이미지 + 볼드 캡션 + 본문 1줄 | N회 반복 |
| closing-text-unit | 선택적 마무리 텍스트 블록 | 0~1회 |

조합 순서: `header-intro-block → image-caption-unit × N → (closing-text-unit)`

---

### content_5 — story-labeled-image-stack

| 서브블록 ID | 구성 요소 | 반복 여부 |
|------------|---------|---------|
| story-labeled-image-stack--header | 아이브로우 + 브랜드명 + 수직 디바이더(80px) + 설명 텍스트 쌍 + 메인 헤드라인 + 설명 텍스트 쌍 | 1회 |
| story-labeled-image-stack--item | 좌측 앵커 틸 칩 태그(position:absolute) + 풀폭 이미지 (aspect-ratio 4:3) | N회 반복 |

조합 순서: `--header → --item × N`

---

### content_7 — detail-point-scroll-stack

| 서브블록 ID | 구성 요소 | 반복 여부 |
|------------|---------|---------|
| point-text-header | "POINT {N}" 혼합굵기 라벨 + 서브텍스트 + 대형 볼드 제목 3줄 + 본문 2줄 | POINT 수만큼 반복 |
| point-fullbleed-image | 좌우 여백 0 풀블리드 이미지 + 우하단 캡션(position:absolute) | POINT 수만큼 반복 |

조합 순서: `(point-text-header → point-fullbleed-image) × N` — 각 POINT 유닛은 A→B 쌍

---

### content_8 — feature-numbered-callout-scroll

| 서브블록 ID | 구성 요소 | 반복 여부 |
|------------|---------|---------|
| NumberedCalloutItem--single | 말풍선 배지 + 프리헤드라인 + 대형 헤드라인 + 본문 + 단일 풀폭 이미지 + 캡션 | N회 반복 |
| NumberedCalloutItem--dual | 말풍선 배지 + 프리헤드라인 + 대형 헤드라인 + 본문 + 2열 디테일 이미지 그리드 + 캡션 | N회 반복 |

조합 순서: `Item--single 또는 Item--dual × N (혼합 가능)`
핵심 CSS: 배지 하단 삼각 꼬리는 `::after` 또는 clip-path로 구현 (SVG 인라인 대안 가능)

---

### content_10 — detail-numbered-point-stack

| 서브블록 ID | 구성 요소 | 반복 여부 |
|------------|---------|---------|
| numbered-point-header | 아치형 배지("PRODUCT POINT", SVG textPath) + 대형 순번(01…) + HR + 헤드라인 + 본문 | 1회 |
| numbered-point-image-unit | 풀폭(edge-to-edge) 이미지 + 하단 2줄 캡션(중앙 정렬) | N회 반복 |

조합 순서: `numbered-point-header → numbered-point-image-unit × N`

---

## 4. 재구성 우선순위 (고가치·저복잡도·단일블록 우선)

| 순위 | frameId | suggestedVariantId | 근거 |
|------|---------|-------------------|------|
| 1 | content_3 | story-vertical-repeat | low + isSingleBlock=true. items 배열 단일 파라미터로 완전 제어 가능. 즉시 착수. |
| 2 | content_6 | story-stacked-image-narrative | low + isSingleBlock=true. header + items[] boolean 토글 구조로 단순. |
| 3 | content_1 | story-rotating-highlight | low + 서브블록 3종으로 명확히 분리됨. highlightLine prop 단순. rotating 모티프가 고유 가치. |
| 4 | content_2 | detail-image-caption-stack | low + 서브블록 2종, 이미지-텍스트 단순 반복. 조합 규칙 명확. |
| 5 | content_4 | story-gallery-narrative | low + 서브블록 3종. 웜 팔레트 단독 사용으로 다른 다크 변형과 차별화. |
| 6 | content_5 | story-labeled-image-stack | low + 서브블록 2종. 틸 accent 칩 태그가 라이브러리 내 유일 패턴. |
| 7 | content_10 | detail-numbered-point-stack | low + 서브블록 2종. SVG textPath 아치 배지가 유일 패턴이지만 구현 난이도 낮음. |
| 8 | content_7 | detail-point-scroll-stack | low + 서브블록 2종. 풀블리드 음수 마진 처리 필요하나 패턴 단순. |
| 9 | content_8 | feature-numbered-callout-scroll | low + 서브블록 2변형. 말풍선 배지 CSS(::after 삼각) 구현이 핵심. |
| 10 | content_9 | detail-spec-illustration-callout | medium + isSingleBlock=true. chevron 클립패스 + 일러스트 오버레이로 복잡도 높음. 마지막 착수. |

---

## 5. 순 추가 변형 수 추정

| 구분 | 수량 |
|------|------|
| 신규 최상위 변형(suggestedVariantId) | **10개** |
| 분할 서브블록 (재사용 단위 컴포넌트) | **약 18개** |
| 이미지 레이아웃 서브변형 (content_8 1열/2열) | **2개** |
| **순 추가 최상위 변형** | **10개** |
| **순 추가 서브블록 컴포넌트** | **약 18개** |

> 기존 라이브러리 변형과 중복되는 항목이 없으므로 10개 전량 신규 추가.
> 서브블록은 cross-variant 재사용(예: image-caption-unit이 content_2와 content_4에서 공유 가능)을 감안하면 실제 구현 파일 수는 18개보다 감소할 수 있음.

---

## 6. 착수 순서 요약

```
Phase 1 (단일 블록, 즉시 착수)
  └─ story-vertical-repeat     (content_3)
  └─ story-stacked-image-narrative  (content_6)

Phase 2 (저복잡도 분할 블록, 서브블록 2~3종)
  └─ story-rotating-highlight  (content_1)
  └─ detail-image-caption-stack (content_2)
  └─ story-gallery-narrative   (content_4)
  └─ story-labeled-image-stack (content_5)
  └─ detail-numbered-point-stack (content_10)

Phase 3 (풀블리드/특수 CSS 처리 필요)
  └─ detail-point-scroll-stack (content_7)
  └─ feature-numbered-callout-scroll (content_8)

Phase 4 (medium 복잡도, 일러스트 오버레이+chevron)
  └─ detail-spec-illustration-callout (content_9)
```

---

*작성: DetailAI 블록 라이브러리 흡수 계획 — 자동 생성 감사 보고서*
