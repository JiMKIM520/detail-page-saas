# Figma V2 상품구성(Product) 섹션 감사 종합

> 생성일: 2026-07-01
> 대상 프레임: 26개 (product_1 ~ product_26)
> 루트: `/agents/templates/blocks/variants/`

---

## 1. 중복 제외 목록 (distinct=false)

| frameId | 제안 variantId | 흡수 대상 | 처리 방법 |
|---------|---------------|----------|----------|
| 11 | ~~package-offset-image-rows~~ | `package-offset-image-rows` (기존) | 텍스트 정렬 left/right 토큰 파라미터 + `badgeLabel?` 슬롯 + `bonusImage?` 슬롯 추가로 대응. 신규 변형 불필요. |

**중복 제외 수: 1개**

---

## 2. variantId 충돌 정리

감사 데이터에서 frameId 1과 frameId 19가 동일하게 `package-event-price-rows`를 제안했으나, 구조가 실질적으로 다르므로 분리한다.

| frameId | 원래 제안 | 정리 후 variantId | 구분 이유 |
|---------|----------|-----------------|---------|
| 1 | package-event-price-rows | **`package-event-price-rows`** | 이미지 행 리스트 + 3단 이벤트 가격 (이미지 슬롯 4개 포함) |
| 19 | package-event-price-rows | **`package-event-text-rows`** | 텍스트 전용 헤더 + 테두리 카드 행 + 검정 CTA 바 (이미지 없음) |

---

## 3. 재구성 대상 전체 (distinct=true, 중복 제외 후)

총 **25개** 프레임 중 중복 1개(frameId 11) 제외 → **재구성 대상 24개**

| 순번 | frameId | variantId (확정) | complexity | isSingleBlock | 핵심 모티프 요약 |
|-----|---------|----------------|-----------|--------------|----------------|
| 1 | product_1 | `package-event-price-rows` | medium | true | 다크 섹션 + 흰 카드 컨테이너 + 3단 이벤트 가격 행(정상가↗할인가↗이벤트가+%배지) |
| 2 | 2 | `package-image-rows-strike-price` | medium | true | 좌고정 이미지 + 취소선→화살표→판매가 + 점선 구분선, 단일 회색 컨테이너 |
| 3 | product_3 | `package-split-image-price-rows` | medium | true | 좌텍스트-우이미지 수평분할 카드 + 플로팅 원형 할인율 배지 + 이중가격행 |
| 4 | product_4 | `package-option-rows-panel` | medium | true | 단일 흰 패널 내 점선 divider 옵션 행 + 주황 배경 헤더 + 해시태그 아웃라인 배지 |
| 5 | product_5 | `package-numbered-split-rows` | medium | true | 서수(01/02/03) + 좌흰-우크림 분할 패널 행 + 배지색 단계적 강조(앰버→레드) |
| 6 | 6 | `product-tab-filter-rows` | medium | true | 카테고리 탭 필터 + 이미지행+원형 할인배지 오버레이 + 쿠폰 pill + 이중가격 + 원형 CTA |
| 7 | 7 | `package-discount-badge-grid` | medium | true | 딥그린 배경 + 3열 카드 그리드 + 원형 할인배지 카드 상단 오버랩 + 이미지+취소선+최종가 |
| 8 | 8 | `package-option-grid` | medium | false | 블루 헤더 밴드 + 2×2 이미지 카드 그리드 + 옵션번호 배지 + 원형 할인배지+취소선+화살표+최종가 |
| 9 | product_9 | `package-numbered-split-rows` | medium | true | ※ product_5와 동일 variantId → **`package-numbered-split-rows-v2`** 로 구분. 히어로 인트로 카드 포함 버전. |
| 10 | product_10 | `product-price-breakdown-card` | medium | false | 3행 가격분해테이블(판매가/할인가/적립가)+합산 + 1+2 비대칭 혜택카드 모자이크 |
| 11 | ~~11~~ | ~~(중복 제외)~~ | — | — | package-offset-image-rows 파라미터 확장으로 흡수 |
| 12 | product_12 | `product-discount-badge-rows` | medium | false | % OFF pill 배지 + 정사각 썸네일 + 카테고리+상품명+설명 (가격 없음, 카탈로그형) |
| 13 | 13 | `package-numbered-option-selector` | low | true | 4열 동등 카드 + 순번(01-04) + 활성/비활성 토글 상태 + 가격 없음 |
| 14 | 14 | `package-numbered-band-rows` | medium | true | 다크 네이비 + 번호 뱃지(01-04) + 인라인 취소선·강조가격 + 지정행 레드 앵커 |
| 15 | product_15 | `package-split-icon-cards` | low | true | 다크 히어로→라이트 아이콘 카드 스플릿 배경 전환 + 2열 흰카드 + 아이콘+설명+회색 푸터바 |
| 16 | product_16 | `package-gradient-bundle-discount` | medium | true | 파스텔 핑크 그라디언트 + 번들샷 + 번호 구성품 리스트 + 하단 할인율\|취소선\|최종가 바 |
| 17 | 17 | `package-bundle-gift-rows` | medium | true | 이미지+"+" 원형 커넥터+기프트 이미지 연결 + 복합 원형 배지 클러스터 + 파스텔 카드 |
| 18 | 18 | `product-lineup-dark-cards` | medium | true | 다크 네이비 + 2열 흰카드 + ──N–– 번호 구분선 + 인셋 다크 푸터 밴드 + 해시태그 레이블 |
| 19 | 19 | `package-event-text-rows` | low | true | 텍스트 전용 헤더(워터마크 배경) + 테두리 카드 행(레이블↔가격 양단) + 검정 CTA 바 |
| 20 | 20 | `package-event-product-rows` | medium | true | 다크 히어로(축제 데코) + 3단계 가격 공개 행(정상가↗행사가↗최종가) + 역삼각형 % 배지 |
| 21 | 21 | `product-hero-discount-grid` | medium | false | 라이프스타일 모델 히어로 오버레이 + 섹션 헤딩 밴드 반복 + 3열 퍼센트배지 이중가격 카드 |
| 22 | 22 | `event-countdown-product-grid` | medium | true | 다크 히어로 + 카운트다운 타이머(HH:MM) + 이벤트 배지 + 2×2 상품 카드 그리드 |
| 23 | 23 | `package-discount-image-rows` | medium | true | 딥그린 풀블리드 + 플로팅 모델 히어로 + 행별 원형 할인% 배지 인라인 + 이미지행 리스트 |
| 24 | 24 | `product-hero-gift-price` | medium | true | 따뜻한 그레이지 히어로 + 플로팅 증정품 pill 배지 + 3행 가격분해카드(정가/판매가/조건부 할인밴드) |
| 25 | product_25 | `package-hero-price-table` | low | true | 제품 그룹샷 + 3행 가격 투명성 테이블(특가/소비자가/판매가) + 다크 CTA 버튼 |
| 26 | 26 | `package-dark-component-grid` | medium | true | 다크 페데스탈 히어로 + 2열 플랫 셀 그리드(소형 이미지+제목+설명) + 럭셔리 다크 스타일 |

> **주의:** product_9(frameId product_9)은 product_5와 동일한 `package-numbered-split-rows` variantId를 제안했으나,
> product_9은 히어로 인트로 카드가 추가된 확장 버전이므로 `package-numbered-split-rows-v2`로 분리.
> 또는 product_5 구현 시 `heroCard?: boolean` prop으로 통합 가능 — 구현 착수 시 결정.

---

## 4. 기존 package 계열 대비 순 추가 수

### 기존 variants (9개)
```
package-band-rows
package-extra
package-hero-fade-list
package-hero-list
package-list
package-offset-image-rows
package-ticket-podium
package-zigzag-circle
detail-package-faq
```

### 이번 감사 결과
- 총 프레임: 26개
- distinct=false 중복 제외: 1개 (frameId 11)
- variantId 충돌 정리 후 순 신규: **24개**

> frameId 11은 `package-offset-image-rows`에 파라미터 3개 추가로 흡수 처리.

**순 추가 변형 수: 24개**

---

## 5. 재구성 우선순위

### P0 — 즉시 착수 (low complexity, single block, 범용성 높음)

| variantId | frameId | 이유 |
|-----------|---------|-----|
| `package-hero-price-table` | product_25 | low + single + 단품 제품 가장 범용적 패턴 |
| `package-numbered-option-selector` | 13 | low + single + 가격 없는 옵션 선택 UI, 활용도 높음 |
| `package-split-icon-cards` | product_15 | low + single + 가격 없는 구성 안내, 스플릿 배경 패턴 |
| `package-lineup-badge-rows` | product_9* | low + single + 순수 타이포 행 리스트, 구현 단순 |
| `package-event-text-rows` | 19 | low + single + 텍스트 전용 가격 리스트 |

> *product_9의 `package-lineup-badge-rows`는 frameId 9(뱃지 pill + 할인가 트리오 행)이며 product_9(히어로+번들 분할행)와 다른 프레임임에 주의.

### P1 — 2순위 (medium complexity, single block, 임팩트 높은 패턴)

| variantId | frameId | 이유 |
|-----------|---------|-----|
| `package-event-price-rows` | product_1 | 3단 이벤트 가격 — 이커머스 핵심 패턴 |
| `package-split-image-price-rows` | product_3 | 분할 카드+플로팅 배지 — 시각 임팩트 상위 |
| `package-numbered-band-rows` | 14 | 다크 번호 밴드 — 고급 이커머스 전형 |
| `package-gradient-bundle-discount` | product_16 | 파스텔 번들 — 뷰티/식품 공통 활용 |
| `package-bundle-gift-rows` | 17 | 번들 "+" 연결 패턴 — 증정 이벤트 전용 |
| `package-event-product-rows` | 20 | 3단계 가격 공개 — 이벤트 세일 핵심 |
| `package-discount-image-rows` | 23 | 행별 원형 배지 — 딥그린 브랜드 스타일 |
| `product-hero-gift-price` | 24 | 증정품 배지+가격분해 — 한국 이커머스 전형 |

### P2 — 3순위 (medium complexity, single block, 특수 목적)

| variantId | frameId | 이유 |
|-----------|---------|-----|
| `package-image-rows-strike-price` | 2 | 좌고정+점선 구분 — 일반적이나 대안 있음 |
| `package-option-rows-panel` | product_4 | 단일 패널 옵션 행 — 비교 선택 UX |
| `package-numbered-split-rows` | product_5 | 서수 분할 패널 — 클라이맥스 구조 |
| `package-discount-badge-grid` | 7 | 3열 그리드+오버랩 배지 — 딥그린 전용 |
| `product-lineup-dark-cards` | 18 | 다크+번호구분선+인셋 푸터 — 다크 브랜드 전용 |
| `package-numbered-split-rows-v2` | product_9 | P0 product_5 구현 후 prop 통합 검토 |
| `product-tab-filter-rows` | 6 | 탭 필터 인터랙션 — JS 상태 필요 |
| `event-countdown-product-grid` | 22 | 카운트다운 타이머 — 동적 상태 필요 |

### P3 — 후순위 (medium complexity, false isSingleBlock 또는 특수 구조)

| variantId | frameId | 이유 |
|-----------|---------|-----|
| `package-option-grid` | 8 | false/2섹션 — 구조 복잡도 높음 |
| `product-price-breakdown-card` | product_10 | false/2섹션 — 가격분해+모자이크 복합 |
| `product-discount-badge-rows` | product_12 | false/2섹션 — 가격 없는 카탈로그형 |
| `product-hero-discount-grid` | 21 | false/멀티섹션 반복 — 모바일 전용 패턴 |

---

## 6. 요약

| 항목 | 수치 |
|------|-----|
| 총 감사 프레임 | 26 |
| distinct=false 중복 제외 | 1 (frameId 11 → package-offset-image-rows 흡수) |
| variantId 충돌 정리 | 1건 (19번 rename: package-event-text-rows) |
| 재구성 대상 | 24 |
| 그 중 isSingleBlock=true | 20 |
| 그 중 isSingleBlock=false | 4 |
| complexity=low | 5 |
| complexity=medium | 19 |
| **순 추가 변형 수** | **24** |

---

## 7. frameId 11 흡수 처리 메모

`package-offset-image-rows` 구현 시 아래 3개 선택적 prop 추가로 흡수 완료:

```ts
// 추가 props
badgeLabel?: string        // "선택 1번" / "스페셜 1번" 등 행별 레이블
textAlign?: 'left' | 'right'  // 기존 right → left 전환
bonusImage?: string        // 보너스 오버레이 썸네일 URL
```
