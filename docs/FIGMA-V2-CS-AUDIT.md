# CS 블록 감사 결과 — 흡수 계획서

> 생성일: 2026-07-01
> 감사 대상: CS 프레임 23종 (cs_1 ~ cs_23)
> 기준: 기존 블록 라이브러리 변형과의 구조적 중복 여부

---

## 1. distinct=false — 중복 제외 목록

기존 변형으로 흡수 가능하며 **신규 구현 불필요**.

| frameId | 제목 | 겹치는 기존 변형 | 처리 방침 |
|---------|------|-----------------|-----------|
| cs_11 | 도착보장 히어로 + 유의사항 | `shipping-icon-hero` | 하단 유의사항 bullet을 footer-notes 슬롯으로 흡수 |
| cs_16 | 파업 배송 지연/불가 공지 (NOTICE 풀블리드) | `shipping-notice` | 동일 패턴, 배경색·에셋만 다름 |
| cs_20 | 배송 지연·불가 공지 배너 (이미지 장식형) | `shipping-notice` | shipping-notice에 이미지 슬롯 옵션으로 흡수 가능 |

**중복 제외: 3개**

---

## 2. distinct=true — 재구성 대상 목록 (통합·정리 후)

### 2-1. variantId 중복 통합

- **cs_1 + cs_3** → `cs-hours-contact` 통합
  - 둘 다 "요일별 시간표 + 아이콘 연락처" 복합 패턴
  - cs_3이 더 풍부(accent-red 강조 행 + 예외 배너 + 2-col 연락처 카드)하므로 **cs_3 구조를 대표로 채택**
  - cs_1의 로고 슬롯과 vertical-rule 분할은 optional 슬롯으로 흡수

- **cs_9 + cs_10** → `cs-delivery-calendar` 통합
  - 둘 다 "배송 연휴 달력 7열 그리드 + 날짜별 상태 표시" 패턴
  - cs_10이 더 풍부(4가지 셀 상태 + 다크 요약 배너)하므로 **cs_10 구조를 대표로 채택**
  - cs_9의 warm-cream 배경 + 핑크 heading 스타일은 variant props로 흡수

### 2-2. 재구성 대상 최종 목록

| # | variantId | 대표 frameId | 한 줄 요약 | complexity | isSingleBlock |
|---|-----------|-------------|-----------|------------|---------------|
| 1 | `cs-hours-contact` | cs_1 + cs_3 통합 | 요일별 영업시간 시간표 + 예외 배너 + 아이콘 연락처 2-col 카드 | low | true |
| 2 | `cs-contact-banner` | cs_2 | 이중언어 타이틀 헤더(accent bg) + display-size 전화·시간 label-value 투-존 배너 | low | true |
| 3 | `cs-monthly-calendar` | cs_4 | 월간 7×N 캘린더 그리드 + 날짜별 원형 상태 배지(운영/휴진) | medium | true |
| 4 | `reason-zebra-rows` | cs_5 | 챕터 번호 헤더 + 오프셋 카드 + 번호/텍스트 zebra 교번 행 리스트 | low | true |
| 5 | `cs-delivery-guarantee-split` | cs_6 | 풀블리드 accent bg + 2컬럼 비대칭 배송 조건 비교 셀(평일 vs 주말) | medium | true |
| 6 | `cs-vacation-calendar` | cs_7 | 7열 달력 + 연속 기간 pill-span + 배지 날짜(휴가·재개일 구분) | medium | true |
| 7 | `cs-holiday-calendar` | cs_8 | 딥 네이비 bg 7열 달력 + 날짜 셀별 컬러 배지(핑크·노란 밴드) + 불릿 노트 | medium | true |
| 8 | `cs-delivery-calendar` | cs_9 + cs_10 통합 | 7열 배송 연휴 달력 + 4종 셀 상태(기본/fill/pill/circle) + 다크 요약 배너 | medium | true |
| 9 | `shipping-subscription-hero` | cs_12 | amber 풀블리드 + 3D 에셋 + 01/02/03 점선 연결 step-flow 혜택 행 + CTA 바 | medium | true |
| 10 | `shipping-speed-banner` | cs_13 | 단색 전폭 배경 + 분리색 2줄 헤드라인(흰+골드) + 우측 플로팅 3D 일러스트 | medium | true |
| 11 | `shipping-hero-notice-strip` | cs_14 | 상하 2-zone 분할(다크 히어로 + 코랄 유의사항 스트립) + 우측 3D 일러스트 | medium | true |
| 12 | `shipping-illust-hero` | cs_15 | 하늘색 그라데이션 + 2줄 헤드라인(두 번째 줄 노란 하이라이트 바) + 3D 씬 배열 | high | true |
| 13 | `shipping-speed-hero` | cs_17 | 선명한 녹색 풀블리드 + 대형 3D 트럭 + 수평 4단계 점선 파이프라인 타임라인 | medium | true |
| 14 | `shipping-vehicle-composite-hero` | cs_18 | 차콜 다크 풀블리드 + 상품 누끼 합성 배송 차량 이미지 + 마감 시간 eyebrow | medium | true |
| 15 | `shipping-date-timeline` | cs_19 | 초대형 날짜 숫자 앵커 타임라인 + 두 종류 수평 룰 + 아이소메트릭 일러스트 | high | true |
| 16 | `cs-closure-calendar` | cs_21 | 7열 달력 + 특정 날짜 채워진 빨간 원형 배지 + 이벤트 레이블 (휴진 특화) | low | true |
| 17 | `cs-authorized-seller-hero` | cs_22 | 핑크 bg 원형 씰 배지 히어로 + 쉴드 아이콘 경고 배너 2-zone | medium | false |
| 18 | `cs-authorized-retailer-badge` | cs_23 | 다크 bg + 골드 메달 씰 배지 2-col + 다크 경고 카드 + 미세 저작권 문구 | medium | true |
| 19 | `shipping-date-timeline` (고복잡) | cs_19 | (위 15번 동일, high complexity 별도 표기) | high | true |

> cs_19는 high complexity로 인해 순위 후반 배치. 목록에서 중복 제거하면 **총 18개 고유 variantId**.

---

## 3. 순 추가 변형 수

| 구분 | 수량 |
|------|------|
| 감사 대상 전체 | 23개 |
| distinct=false (중복 제외) | 3개 |
| distinct=true 원본 | 20개 |
| variantId 중복 통합 (-2 프레임 → -1 variantId) | cs_1+cs_3 → 1개, cs_9+cs_10 → 1개 |
| **순 추가 variantId** | **18개** |

---

## 4. 재구성 착수 순서 (저복잡도·단일블록 우선)

### Phase 1 — low complexity, isSingleBlock=true (즉시 착수)

| 순서 | variantId | 근거 |
|------|-----------|------|
| 1 | `cs-hours-contact` | low, 단일, 병원·카페 필수 패턴, 재사용 빈도 높음 |
| 2 | `cs-contact-banner` | low, 단일, 구조 단순 (2-zone 투-톤) |
| 3 | `cs-closure-calendar` | low, 단일, 7열 달력 중 가장 단순 (원형 배지 1종) |
| 4 | `reason-zebra-rows` | low, 단일, CS와 무관한 범용 패턴 (이유·특장점) |

### Phase 2 — medium complexity, isSingleBlock=true (달력 패턴 묶음)

달력 계열은 7열 그리드 공통 베이스를 먼저 작성하고 상태 레이어를 순차 추가.

| 순서 | variantId | 근거 |
|------|-----------|------|
| 5 | `cs-monthly-calendar` | 원형 배지 2종 (운영/휴진), 베이스 달력 구현 후 첫 확장 |
| 6 | `cs-vacation-calendar` | pill-span 기간 하이라이트 추가 |
| 7 | `cs-holiday-calendar` | 딥 네이비 bg + 연속 노란 밴드 추가 |
| 8 | `cs-delivery-calendar` | 4종 셀 상태 + 다크 요약 배너, 달력 패밀리 완성 |

### Phase 3 — medium complexity, 배송 히어로 패밀리

| 순서 | variantId | 근거 |
|------|-----------|------|
| 9 | `cs-delivery-guarantee-split` | 3D 에셋 불필요, 2-col 비교 셀만 |
| 10 | `shipping-hero-notice-strip` | 2-zone 구조, 이미지 슬롯 단순 |
| 11 | `shipping-speed-banner` | 수평 배너, 이미지 우측 플로팅 |
| 12 | `shipping-subscription-hero` | 점선 step-flow + CTA 바 |
| 13 | `shipping-speed-hero` | 4단계 점선 파이프라인 |
| 14 | `shipping-vehicle-composite-hero` | 합성 이미지 슬롯 구조 |

### Phase 4 — medium, isSingleBlock=false / high complexity (후반)

| 순서 | variantId | 근거 |
|------|-----------|------|
| 15 | `cs-authorized-seller-hero` | isSingleBlock=false, 2 sub-block 조합 |
| 16 | `cs-authorized-retailer-badge` | 골드 SVG 씰 배지 제작 필요 |
| 17 | `shipping-illust-hero` | high, 3D 에셋 씬 구성 의존 |
| 18 | `shipping-date-timeline` | high, 아이소메트릭 일러스트 의존 |

---

## 5. 달력 패턴 공통 베이스 설계 메모

cs_4, cs_7, cs_8, cs_9/cs_10, cs_21 이 모두 7열 달력 그리드를 공유함.
Phase 2 착수 전 `cs-calendar-base` 공통 컴포넌트를 먼저 설계 권장:

```
cs-calendar-base
├── 7열 CSS grid (SUN~SAT 헤더)
├── 날짜 셀 (date, dayOfWeek, state)
└── 상태 레이어 (pluggable)
    ├── circle-badge (cs_4, cs_21)
    ├── pill-span (cs_7)
    ├── color-band (cs_8)
    └── multi-state (cs_9/cs_10)
```

구현 시 `variants/cs-calendar-base.ts` 또는 `shared.ts` 내 helper로 분리하면
4개 달력 변형의 렌더 코드 중복을 80% 이상 제거 가능.

---

*감사 종료. 순 추가 18개 variantId, Phase 1(4개) 즉시 착수 권장.*
