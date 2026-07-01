# FIGMA V2 리뷰·추천 감사 종합 보고서

> 감사 대상: 피그마 끝판왕 리뷰·추천 24종 프레임  
> 기존 라이브러리: review-* 10종 + recommend-* 2종 = **12종**  
> 작성일: 2026-07-01

---

## 1. 기존 라이브러리 (12종 현황)

| variantId | 설명 |
|---|---|
| review (reviewBubbles, reviewCards) | 기본 카드+별점 / 버블 |
| review-list | 텍스트 리스트 |
| review-divider-list | 구분선 텍스트 행 |
| review-text-rows | 텍스트 전용 행 반복 |
| review-alternating-rows | 이미지+텍스트 좌우 교차 행 |
| review-image-grid | 이미지 그리드 |
| review-thumbnail-cards | 소형 썸네일+텍스트 카드 |
| review-chat-bubbles | 채팅 말풍선 |
| review-stacked-pairs | 쌍(pair) 레이아웃 |
| review-collage | 콜라주 |
| recommend (recommendDark) | 기본 추천 / 다크 |
| recommend-persona-grid | 페르소나 그리드 |
| recommend-painpoint-bubbles | 페인포인트 말풍선 행 |

---

## 2. 감사 결과 요약

### 2-A. 중복 제외 (distinct=false) — 7종

| frameId | 제목 | 흡수되는 기존 변형 | 이유 |
|---|---|---|---|
| review_2 | 끝판왕 리뷰 #2 | **review-thumbnail-cards** | 좌측 대형 정사각 이미지+별점+헤드라인+본문+닉네임 수직 스택 카드 구조 동일. 상단 KPI 배너는 별도 proof-stats 블록 검토 필요하나 review 계열 신규 변형을 정당화하지 않음 |
| review_5 | 고객 후기 2×2 카드 그리드 | **review-cards** | 2×2 그리드 배열, 별점+헤드라인+본문 구조 동일. columns=2 prop 조정으로 흡수 가능 |
| review_8 | 끝판왕 리뷰 #8 | **review-cards** | 다크 카드+텍스처 배경은 CSS 토큰 레벨 변경. 원형 아바타+별점 인라인 구조는 review-cards 기존 패턴과 동일 |
| review_18 | comment review — 별점+텍스트 단일 중앙 정렬 카드 수직 스택 | **review-cards** | 별점 중앙+텍스트 한 줄만 있는 초미니멀 카드. showAvatar=false, showMeta=false, centerAlign=true 토큰 추가로 흡수 가능. 신규 블록 불필요 |
| review_22 | 끝판왕 리뷰 #22 | **recommend-painpoint-bubbles** | 3D 카툰 아바타+말풍선 페인포인트 목소리 구조 동일. 배경색(녹색)·아바타 스타일만 다른 토큰 변형 |
| review_23 | 끝판왕 리뷰 #23 — 제품 썸네일 행 리스트 | **review-thumbnail-rows** (신규, 아래 참조) | 제목 별점+텍스트 naked row이나 review_14(review-thumbnail-rows)와 구조가 동일 → review_14 대표 채택, review_23 흡수 |
| review_23-dup | *(review_14와 쌍 중복)* | **review-thumbnail-rows** | review_12(review-image-rows)와도 구조 상당 부분 공유 — 아래 통합 참조 |

> **참고:** review_23은 review_14(review-thumbnail-rows)와 구조(좌측 제품 썸네일+별점+텍스트 naked row 반복)가 동일하므로 review_14를 대표 채택, review_23 중복 제외.

---

### 2-B. 재구성 대상 (distinct=true) — 14종 → 유사 프레임 통합 후 **13종**

아래 표에서 **통합** 항목은 2개 프레임을 1개 variantId로 병합한 것.

| 우선순위 | variantId | 원본 frameId | complexity | isSingleBlock | 핵심 모티프 |
|---|---|---|---|---|---|
| P1 | **review-photo-bubble-staggered** | review_1 | medium | true | 다크 배경, 대형 세로 포토+오렌지 버블 2열 스태거드, 집계 평점 pill 헤더 |
| P2 | **review-efficacy-bar-chart** | review_6 | medium | true | 수평 진행 바+퍼센트 수치 테이블형 데이터 시각화, 모노크롬 |
| P3 | **review-aggregate-score-cards** | review_7 | low | true | 좌우 분할 집계 평점 헤더(대형 숫자+별)+수평 구분선+풀폭 흰 카드 스택+우정렬 닉네임, 민트 배경 |
| P4 | **recommend-persona-list-annotated** | review_4 | medium | true | 오렌지 손그림 SVG 어노테이션+핼프톤 아바타 실루엣 세로 리스트 |
| P5 | **review-satisfaction-stats** | review_10 | medium | true | 원형 점선 퍼센트 뱃지+별점 나란히+속성별 만족도 다크그린 행 테이블 |
| P6 | **review-divider-image-rows** | review_3 | low | true | 별점+닉네임 헤더→텍스트+이미지 쌍 2열, hr 구분선 행 반복 |
| P7 | **review-image-story-stack** | review_9 | medium | true | 풀와이드 이미지 히어로+하단 플로팅 텍스트카드 세로 반복 스택 |
| P8 | **review-thumbnail-rows** | review_14 *(review_23 통합)* | low | true | 좌측 제품 썸네일+인라인 별점+텍스트, open row, 구분선 없음 |
| P9 | **review-image-rows** | review_12 | low | true | 텍스트 좌+썸네일 우 고정 행, 수평 구분선 반복, 카드 박스 없음 |
| P10 | **review-divider-image-right** | review_11 | low | true | 구분선-행 골격+텍스트 60%+이미지 40% 우측 고정, 하이라이트 색상 인용 한 줄 |
| P11 | **review-satisfaction-pill-bars** | review_13 | low | true | pill-shape 그라데이션 바+퍼센트 수치 5행, 핑크 블러시 배경 |
| P12 | **review-aggregate-score-stack** | review_21 | low | true | 다크 헤더+대형 집계 점수 히어로+별점+텍스트+CTA 스택 카드 반복 |
| P13 | **review-stat-header-card** | review_17 | low | true | 이중 KPI 통계 바(버티컬 구분선)+오버랩 pill 배지 단일 리뷰 카드, 웜 베이지 |
| P14 | **review-hero-avatar-list** | review_16 | low | true | 풀폭 상품 이미지 배너+풀쿼트 헤드라인+아바타-좌측 후기 행 4개 반복 |
| P15 | **review-photo-bg-dashed-cards** | review_15 | medium | true | 풀블리드 배경 사진+점선 테두리 반투명 카드 오버레이 3장 스택 |
| P16 | **review-numbered-thumbnail-rows** | review_24 | medium | true | 번호(01~N)+이유 텍스트+우측 고정 제품 썸네일 행 반복, 크림 배경 |
| P17 | **review-icon-alternating-rows** | review_20 | low | true | 주제형 3D 오브젝트 아이콘 좌우 교차+옐로 풀블리드 배경, 리뷰어 신원 없음 |
| P18 | **review-instagram-dm-mockup** | review_19 | medium | true | 폰 디바이스 목업 안 인스타그램 DM 스레드 시뮬레이션, 섹션 헤더+해시태그 pill |

> P8(review-thumbnail-rows)은 review_14와 review_23을 통합. 24개 프레임 → 13종 신규 + 5종 중복 제외 + review_23 통합 = 실제 재구성 대상 **13종** (P1~P7, P9~P18 중 통합 포함).

---

## 3. 수치 요약

| 항목 | 수 |
|---|---|
| 감사 총 프레임 | 24 |
| distinct=false (중복 제외) | 6 |
| 유사 프레임 통합 (review_14+review_23 → 1종) | 1쌍 |
| **순 추가 변형 수** | **13** |
| 기존 라이브러리 (감사 전) | 12 |
| 감사 후 총 변형 수 (예상) | **25** |

---

## 4. 착수 순서 (권장)

### 1라운드 — 즉시 착수 (low complexity, 구조 명확)

1. **review-aggregate-score-cards** (P3) — 민트+집계점수+풀폭 카드 스택. 토큰 수 적고 기존 review-cards 참조 가능
2. **review-divider-image-rows** (P6) — hr 행 반복 패턴, 기존 review-divider-list 골격 재활용
3. **review-divider-image-right** (P10) — 구분선 행+우측 고정 이미지, review_11 reconstructionNotes 완비
4. **review-thumbnail-rows** (P8) — naked row 패턴, review_14+review_23 통합 대표
5. **review-image-rows** (P9) — 텍스트 좌+썸네일 우 구분선 행, review_12 reconstructionNotes 완비
6. **review-satisfaction-pill-bars** (P11) — pill gradient bar, 구조 단순
7. **review-aggregate-score-stack** (P12) — 다크 헤더+스택 카드, 토큰 매핑 완비
8. **review-stat-header-card** (P13) — 이중 KPI+단일 카드, low complexity
9. **review-hero-avatar-list** (P16) — 히어로 배너+아바타 행, low complexity
10. **review-icon-alternating-rows** (P17) — 3D 아이콘 교차, low complexity

### 2라운드 — 중간 복잡도 (medium complexity)

11. **review-photo-bubble-staggered** (P1) — 2열 스태거드+집계 평점 pill, 다크 섹션 레이아웃
12. **review-efficacy-bar-chart** (P2) — 수평 바 차트 데이터 시각화
13. **recommend-persona-list-annotated** (P4) — 손그림 SVG 어노테이션 구현 필요
14. **review-satisfaction-stats** (P5) — 원형 점선 뱃지 CSS/SVG 구현
15. **review-image-story-stack** (P7) — 플로팅 카드 overlap 구현
16. **review-photo-bg-dashed-cards** (P15) — 풀블리드 포토 배경+점선 카드 오버레이
17. **review-numbered-thumbnail-rows** (P16) — 번호형 행+크림 배경 accent
18. **review-instagram-dm-mockup** (P18) — 폰 목업 CSS 프레임+DM 스레드 시뮬레이션

---

## 5. 기존 변형 토큰 확장 권고 (신규 블록 없이 처리)

| 기존 변형 | 추가 prop | 대상 프레임 |
|---|---|---|
| review-cards | `columns: 1\|2`, `showAvatar`, `showMeta`, `centerAlign`, `darkCard` | review_5, review_8, review_18 |
| recommend-painpoint-bubbles | `bgColor` 토큰 | review_22 |
| review-thumbnail-cards | `statBanner?: {label, value}[]` (선택적 상단 KPI) | review_2 |

---

## 6. 구현 시 공통 주의사항

- **픽셀 클론 금지**: 모든 변형은 레이아웃 패턴·토큰 매핑만 구현. Figma 원본 치수 그대로 복제 금지.
- **이미지 클론 금지**: 핼프톤 아바타, 3D 아이콘, 배경 사진은 자체 제작 또는 퍼블릭 도메인 에셋 사용.
- **손그림 어노테이션**: recommend-persona-list-annotated의 오렌지 stroke SVG는 CSS `position:absolute` 오버레이로 구현, Figma 경로 복제 금지.
- **점선 원형 뱃지**: CSS `border-style:dashed` 또는 SVG `stroke-dasharray`로 독립 구현.
- **폰 목업 프레임**: CSS `border-radius ~40px + box-shadow`로 구현, 외부 목업 이미지 의존 금지.
