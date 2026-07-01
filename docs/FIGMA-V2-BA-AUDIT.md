# 피그마 V2 추천·B&A 섹션 감사 보고서

> 루트: `/products/detail-page-saas` · 감사 대상: 24개 프레임 (ba_1~ba_24, 16, 19, 22)
> 기준일: 2026-07-01

---

## 1. 재구성 대상 (distinct=true, 중복 정리 후)

총 22개 프레임 중 `isDistinct=true` 판정 21개, `isDistinct=false` 1개(ba_10).
유사 구조를 통합하면 **순 신규 변형 18개** 확정.

### 1-A. 통합 처리 (유사 프레임 → 대표 1개)

| 통합 그룹 | 프레임 | 대표 variantId | 처리 |
|---|---|---|---|
| 다크 배경 USP 피처 그리드 | ba_18, ba_19, ba_20 | `feature-bento-photo-grid` | ba_18(feature-dark-grid)은 텍스트 전용, ba_19/ba_20은 사진 배경 타일 — ba_18을 별도 유지, ba_19·ba_20을 **1개**로 통합 |
| 타사 vs 자사 2열 카드(이미지 포함) | ba_4, ba_7, ba_13 | `compare-product-cards` | ba_4(오렌지), ba_7(z-index 오버랩), ba_13(다크그린 뱃지) — 핵심 차별점(오버랩·뱃지)은 토큰 옵션으로 흡수. **ba_7(오버랩)만 독립 변형**으로 분리 |

통합 후 최종 목록:

| # | frameId | variantId | 아키타입 | 설명 한줄 | complexity | isSingleBlock |
|---|---|---|---|---|---|---|
| 1 | ba_1 | `ba-painpoint-bubbles` | recommend | 교차 말풍선 pain point 리스트 + 하단 인물 사진 | low | true |
| 2 | ba_2 | `ba-photo-split-card` | compare | 흰 카드 내 2열 이미지 + 색상 캡션 바(전=차콜/후=틸) | low | false |
| 3 | ba_3 | `recommend-persona-grid` | recommend | 원형 일러스트 아바타 + 다크그린 배경 3열 그리드 | medium | true |
| 4 | ba_4+ba_13 | `compare-product-cards` | compare | 뱃지+2열 카드 단가 비교(타사 de-emphasized / 자사 브랜드색) | low | true |
| 5 | ba_5 | `event-comment-prize-grid` | event | 아이폰 목업 해시태그 댓글 버블 + 2열 경품 카드 그리드 | medium | true |
| 6 | ba_6 | `compare-price-bar-chart` | compare | 다크 네이비 + 세로 바차트 2개(타사 vs 자사 단가) | medium | true |
| 7 | ba_7 | `compare-overlap-cards` | compare | z-index 오버랩 2열 카드(타사 뒤/자사 앞) + 아이콘 행 리스트 | medium | true |
| 8 | ba_8 | `ba-multi-effect-stacked` | compare | 문제헤더 + 번호 효과 라벨 + 사용전후 쌍 3행 스택 | medium | true |
| 9 | ba_9 | `compare-competitor-photo` | compare | 2열 사진 + 하단 인셋 색상 캡션 바(타사=회색/자사=브랜드색) | low | true |
| 10 | ba_11 | `recommend-painpoint-bubbles` | recommend | 우측 정렬 채팅 버블 pill pain point + USP chip + 제품 히어로 | medium | true |
| 11 | ba_12 | `compare-tab-panels-image-list` | compare | 탭형 2열 헤더(인디고/회색) + 이미지 + 단점 로우 | medium | true |
| 12 | ba_14 | `credentials-stat-bento` | stats | 다크 벤토 KPI 타일 + 3D 이모지 아이콘 | medium | true |
| 13 | ba_15 | `painpoint-brand-research-trio` | recommend | 생각이모지 앵커 + 권위 카피 + 번호형 고민 3행(아웃라인) + 제품 이미지 | medium | true |
| 14 | 16 | `compare-product-spec-matrix` | compare | 제품 이미지 열 헤더 + 속성 카테고리 띠 행 N×M 스펙 매트릭스 | medium | true |
| 15 | ba_17 | `compare-upgrade-product-cards` | compare | 구버전(연배경) vs 신버전(강조+배지) 업그레이드 2열 카드 | medium | true |
| 16 | ba_18 | `feature-dark-grid` | feature | 다크 배경 텍스트 전용 2열 USP 피처 그리드 + 상단 가격 히어로 | medium | false |
| 17 | ba_19+ba_20 | `feature-bento-photo-grid` | feature | 라이프스타일 사진 풀블리드 타일 + feature headline 오버레이 벤토 그리드 | medium | true |
| 18 | ba_21 | `feature-bento-mosaic` | feature | 비대칭 벤토 이미지+불릿 카드 + 스캐터 히어로 + 하단 티어 가격 그리드 | high | false |
| 19 | 22 | `compare-product-card-vs` | compare | 경쟁사(무채색) vs 자사(골드) 2열 카드 — 이미지+스펙 수치+유저 보이스 | medium | true |
| 20 | ba_23 | `spec-nutrition-macro-table` | spec | 원형 매크로 뱃지(3종) + 계층형 영양성분 테이블 + 제품 사진 | medium | true |
| 21 | ba_24 | `ba-clinical-bar-chart` | compare | 임상 결과 big-stat% + 사용전후 수평 막대 쌍 반복 구조 | medium | true |

---

## 2. 중복 제외 목록

| frameId | 판정 | 겹치는 기존 변형 | 처리 방안 |
|---|---|---|---|
| ba_10 | `isDistinct=false` | `compare-beforeafter` | 신규 변형 불필요. compare-beforeafter에 `header_tags[]`·`case_label`·`duration` 토큰 옵션으로 흡수 |

---

## 3. 순 추가 변형 수

```
distinct=true 판정       : 23개 (ba_1~ba_9, ba_11~ba_24, 16, 19, 22)
유사 프레임 통합 감소    : -3개 (ba_19+ba_20 → 1개, ba_4+ba_13 → 1개 + 별도 overlap 1개 유지)
distinct=false 제외      :  -1개 (ba_10)
──────────────────────────────
순 추가 변형 수          : 21개
```

> 단, ba_4+ba_13 통합 시 ba_7(overlap)은 별도 유지하므로 실질 구현 파일 수 = **21개**

기존 variants/ 디렉토리에 해당 아키타입 파일 다수 존재:
- `compare.ts` 계열: compare-beforeafter, compare-grid-table, compare-hero-panels, compare-asymmetric-cta, compare-stacked-rows, compare-hero-table, compare-phone-mockup, compare-staggered-banners 등
- `feature.ts` 계열: feature-dark-inset-card, feature-captionbar, feature-editorial, feature-split-panels 등
- `stats.ts` 계열: stats-bento-grid 기존재 — credentials-stat-bento는 **다크 벤토 KPI+3D 이모지** 특화로 별도 추가 필요
- `spec.ts` 계열: detail-spec-table 존재 — spec-nutrition-macro-table은 **식품 영양성분 매크로 뱃지** 특화로 별도 추가 필요

---

## 4. 재구성 착수 순서 (저복잡도·단일블록 우선)

### Phase 1 — Low complexity · isSingleBlock=true (즉시 착수, 3개)

| 순서 | variantId | frameId | 이유 |
|---|---|---|---|
| 1 | `compare-competitor-photo` | ba_9 | low·single·2열 사진+캡션바 패턴 간단 |
| 2 | `compare-product-cards` | ba_4+ba_13 | low·single·뱃지+2열 카드 토큰 구조 명확 |
| 3 | `ba-painpoint-bubbles` | ba_1 | low·single·교차 말풍선 CSS 단순 |

### Phase 2 — Low complexity · isSingleBlock=false (2개)

| 순서 | variantId | frameId | 비고 |
|---|---|---|---|
| 4 | `ba-photo-split-card` | ba_2 | low·2-block·흰카드+이미지 슬롯 조합 |

### Phase 3 — Medium complexity · isSingleBlock=true (13개, 의존성 없는 순서)

| 순서 | variantId | frameId | 착수 이유 |
|---|---|---|---|
| 5 | `ba-clinical-bar-chart` | ba_24 | 수평 바차트 CSS, 토큰 구조 명확 |
| 6 | `spec-nutrition-macro-table` | ba_23 | spec 아키타입 기존 패턴 참조 가능 |
| 7 | `credentials-stat-bento` | ba_14 | stats-bento-grid 기존 변형 참조 가능 |
| 8 | `compare-price-bar-chart` | ba_6 | 세로 바차트, compare 아키타입 확장 |
| 9 | `compare-overlap-cards` | ba_7 | z-index 오버랩 CSS 패턴 명확 |
| 10 | `ba-multi-effect-stacked` | ba_8 | 3행 반복 구조 단순 |
| 11 | `recommend-persona-grid` | ba_3 | recommend 아키타입, 3열 그리드 |
| 12 | `recommend-painpoint-bubbles` | ba_11 | pill+chip+히어로 조합 |
| 13 | `painpoint-brand-research-trio` | ba_15 | 아웃라인 박스 3행 + 브랜드 권위 카피 |
| 14 | `compare-tab-panels-image-list` | ba_12 | 탭형 헤더+이미지+리스트 |
| 15 | `compare-product-spec-matrix` | 16 | N×M 매트릭스, colspan 처리 |
| 16 | `compare-upgrade-product-cards` | ba_17 | 업그레이드 서사 카드 |
| 17 | `compare-product-card-vs` | 22 | 골드 비대칭 카드+스펙 수치+인용구 |
| 18 | `event-comment-prize-grid` | ba_5 | 아이폰 목업 필요, event 아키타입 확장 |

### Phase 4 — Medium complexity · isSingleBlock=false (1개)

| 순서 | variantId | frameId | 비고 |
|---|---|---|---|
| 19 | `feature-dark-grid` | ba_18 | 2-block 구조, 상단 히어로+하단 그리드 분리 |
| 20 | `feature-bento-photo-grid` | ba_19+ba_20 | photo-card bento, 스크림 오버레이 |

### Phase 5 — High complexity · isSingleBlock=false (1개, 마지막)

| 순서 | variantId | frameId | 비고 |
|---|---|---|---|
| 21 | `feature-bento-mosaic` | ba_21 | 비대칭 벤토+스캐터 히어로+티어 가격 3-block 복합 |

---

## 5. 기존 변형 토큰 확장 필요 사항

| 기존 variantId | 추가 토큰 | 출처 프레임 |
|---|---|---|
| `compare-beforeafter` | `header_tags[]`, `case_label`, `duration` | ba_10 |

---

## 요약 카운터

| 항목 | 수 |
|---|---|
| 감사 대상 프레임 | 24 |
| distinct=true | 23 |
| distinct=false (중복) | 1 |
| 통합으로 감소 | -2 |
| **순 신규 변형** | **21** |
| 기존 변형 토큰 확장 | 1 |
| Phase 1 즉시 착수 | 3 |
