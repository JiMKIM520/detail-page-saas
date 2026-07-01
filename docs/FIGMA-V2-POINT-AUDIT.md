# FIGMA V2 포인트 웨이브 감사 결과 — 블록 라이브러리 흡수 계획

> 감사 대상: 포인트 구성 페이지 37종 프레임  
> 작성일: 2026-07-01  
> 담당: 블록 라이브러리 흡수 계획 책임자

---

## 1. 재구성 대상 목록 (distinct=true)

### 1-1. 원시 distinct=true 프레임 (30개)

| # | frameId | suggestedVariantId (원본) | 한 줄 요약 | complexity | isSingleBlock |
|---|---------|--------------------------|-----------|------------|---------------|
| 1 | point_1 | `point-discount-price-reveal` | 초대형 할인% 앵커 + 가격 비교표 + 혜택카드 3열 다크 네이비 | medium | true |
| 2 | point_2 | `point-promo-asymcard` | 그라디언트 bg + tall 지배 카드(좌) + 3-unit 스택(우) + burst 배지 비대칭 2열 | medium | true |
| 3 | point_3 | `feature-dark-product-grid` | 다크 배경 캠페인 헤딩 + 멀티 제품 이미지 2열 카드 그리드 + 배지+카드CTA | medium | true |
| 4 | point_5 | `point-fullbleed-caption` | 전체화면 이미지 + 하단앵커 원형 번호배지 + 이미지 하단 오렌지 헤드라인 텍스트블록 | medium | true |
| 5 | point_6 | `point-award-credential` | 월계관 마일스톤 헤드라인 + 원형 어워드 배지 스탬프 클러스터 + 연대기 수상 내역 리스트 | medium | true |
| 6 | point_7 | `feature-dark-float-cutout` | 검정 bg + floating 제품 컷아웃 + overflow 라이프스타일 카드 + 배지 오버레이 3중 구조 | medium | true |
| 7 | point_8 | `point-editorial-marquee` | 양측 bilateral rotated marquee ticker strip + full-bleed 이미지 + 고스트 overflow 타이포 | medium | true |
| 8 | point_9 | `point-heritage-split` | 전통 단청 문양 크림슨 패널(상) + 골드 이중언어 타이포 + 텍스트 없는 풀블리드 제품사진(하) | medium | true |
| 9 | point_10 | `point-ingredient-hero` | 문제제기 헤드라인 + 인라인 키워드 민트 하이라이트 + 풀블리드 성분 비주얼 수직 스택 | low | true |
| 10 | point_11 | `point-brand-collab-editorial` | 아웃라인 초대형 브랜드 로고타입 + 지오태그 칩 이미지 오버레이 + 하단 바코드풍 틱 스트립 | medium | true |
| 11 | point_12 | `promo-event-spotlight` | 스태킹 풀폭 이벤트명 디스플레이 타입(3줄) + conic spotlight + 구분선 프레임 날짜 범위 | medium | true |
| 12 | point_13 | `promo-story-price-reveal` | 인라인 반응 뱃지 헤드라인 + 제품 이미지 오버랩 + 가격 계단 공개(정가→최종가) | medium | true |
| 13 | point_14 | `point-fullbleed-bookend` | 번호 pill 뱃지 + 헤드라인 → 풀블리드 이미지 → 독립 클로징 스테이트먼트 북엔드 구조 | low | true |
| 14 | point_15 | `point-timing-banner` | 조건 pill 뱃지 + 검정 하이라이트 밴드 헤드라인 + 점선 구분선+날짜 + 풀블리드 이미지 | medium | true |
| 15 | point_16 | `promo-scatter-banner` | 다크 bg + 도트 구분 초대형 헤드라인 + 해시태그 필 + 3D 오브젝트 4개 귀퉁이 산포 | medium | true |
| 16 | point_17 | `point-numbered-hero-card` | 번호 pill 뱃지 + 헤드라인이 이미지 위에 배치되는 상단 헤더 존재 + 하단 캡션 스트립 4-레이어 | low | true |
| 17 | 18 | `point-numbered-image-card` | 대형 서수 번호(좌상단) + 짧은 설명 + 하단 풀너비 제품 이미지 텍스트·이미지 분리 카드 | low | true |
| 18 | point_20 | `point-step-timeline-bleed` | 수평 numbered dot 타임라인 + 대형 헤드카피가 bg→이미지 영역으로 vertical overflow bleed | medium | true |
| 19 | 21 | `point-radar-web` | 6축 육각 레이더 차트 중앙 제품 이미지 오버레이 + 하단 pill-badge+dashed-list callout | medium | true |
| 20 | 22 | `feature-event-poster` | 다크 풀블리드 이벤트 포스터: ✦ 장식+pill 배지+우하단 앵커 제품 콜아웃 카드 | medium | true |
| 21 | point_25 | `point-ingredient-overlay` | 제품 이미지 캔버스 + 연결선 없는 부유 pill 태그(+아이콘·카테고리·성분명 3-tier) | medium | true |
| 22 | 26 | `feature-dark-tab-mosaic` | 다크 bg + 디스플레이 헤드라인 + 우측 블리드 hero 이미지 + 하단 4-탭 Nav + 비대칭 3-이미지 모자이크 | medium | false |
| 23 | point_28 | `stats-satisfaction-bars` | 식물 장식 베이지 bg + 고객만족도 헤드라인 + 제품 이미지 + 레이블·진행바·퍼센트 행 반복 | medium | true |
| 24 | point_29 | `point-product-annotation` | 제품 이미지 중심 + 점선 커넥터 라인으로 연결된 우측 텍스트 annotation callout 다이어그램 | medium | true |
| 25 | point_30 | `feature-image-row-list` | 파스텔 배경 + 상단 증정 오퍼 배너 + 좌정사각이미지-우타이틀/설명 3행 반복(행 구분선) | medium | true |
| 26 | 31 | `point-urgency-tape-cross` | 블랙 bg + X자 대각 marquee tape 밴드 오버레이 제품 이미지 + D-day 카운트다운 | medium | true |
| 27 | 32 | `point-list-image-bleed` | 연핑크 bg + 다이아몬드 pill 배지 포인트 리스트(좌) + 이미지 자유 블리드(우) + 전폭 워터마크 타이포 | medium | true |
| 28 | 33 | `stats-hero-anchor-card-grid` | 히어로 앵커 수치+제품이미지 split(상) + 2열 균등 stat 카드 그리드(하) 2-tier 구조 | medium | true |
| 29 | 34 | `feature-product-float-icon-grid` | 브랜드 솔리드 핑크 bg + 제품 이미지 free-float + 하단 2열×4행 white 아이콘 카드 그리드 | medium | true |
| 30 | 37 | `point-product-stats-split` | 다크 bg + 좌 제품 hero 이미지 + 우 signed % 수치 수직 리스트(3-5개) 2열 분할 | low | true |

---

### 1-2. suggestedVariantId 중복 그룹 정리

동일 variantId를 가리키는 프레임이 여러 개인 경우, 대표 1개 + 서브변형으로 통합한다.

#### 그룹 A: `point-fullbleed-caption` (프레임 point_5, point_14)

| 역할 | frameId | 핵심 차이 |
|------|---------|---------|
| **대표** | point_5 | 원형 번호배지 하단앵커 + 이미지 하단 오렌지 헤드라인. 배지·색상 강조형 |
| 서브변형 | point_14 | 번호 pill 뱃지 + 헤드라인 → 이미지 → 독립 클로징 라인. 북엔드 내러티브형 |

→ **처리**: `point-fullbleed-caption` (point_5 대표) + `point-fullbleed-bookend` (point_14 독립 ID 유지). 레이아웃 리듬이 실질적으로 달라 **별도 변형 2개**로 등록.

#### 그룹 B: `promo-*` 신규 카테고리 (프레임 point_12, point_13, point_16)

| variantId | frameId | 성격 |
|-----------|---------|------|
| `promo-event-spotlight` | point_12 | 이벤트 날짜 공지용 — 스태킹 디스플레이 타입 + spotlight |
| `promo-story-price-reveal` | point_13 | 오퍼/가격 공개용 — 인라인 반응 뱃지 헤드라인 |
| `promo-scatter-banner` | point_16 | 캠페인 배너용 — 도트 헤드라인 + 3D 오브젝트 산포 |

→ **처리**: `promo` 아키타입 신설 3개 변형으로 등록.

#### 그룹 C: `feature-dark-*` 확장 (프레임 point_3, point_7)

| variantId | frameId | 성격 |
|-----------|---------|------|
| `feature-dark-product-grid` | point_3 | 다크 bg + 멀티 제품 그리드 |
| `feature-dark-float-cutout` | point_7 | 다크 bg + floating 컷아웃 + overflow 카드 |

→ **처리**: 기존 `feature` 아키타입 내 `feature-dark-*` 서브변형 2개 추가.

#### 그룹 D: `stats-*` 확장 (프레임 point_28, 33)

| variantId | frameId | 성격 |
|-----------|---------|------|
| `stats-satisfaction-bars` | point_28 | 만족도 진행바 목록 |
| `stats-hero-anchor-card-grid` | 33 | 히어로 수치 + stat 카드 2열 그리드 |

→ **처리**: 기존 `stats` 아키타입 내 신규 변형 2개 추가.

---

## 2. distinct=false — 기존 변형과 겹침 (7개)

| frameId | 판정 변형 | 겹치는 기존 변형 | 차이 요약 |
|---------|---------|---------------|---------|
| point_4 | feature-dark-inset-card | `feature-dark-inset-card` | 텍스처(위브/메시) 배경 추가 외 레이아웃 구조 동일. 기존 변형에 prop 추가로 흡수 가능 |
| point_19 | feature-fullbleed--brand-badge | `feature-fullbleed` | 브랜드 타원 배지 + 인라인 마커 하이라이트 + 플로팅 배지 3요소 추가. 기존 변형 내 옵션 처리 가능 |
| point_23 | feature-fullbleed | `feature-fullbleed` | 배경색과 이미지 배경 seamless 블렌딩 외 구조 동일 |
| point_24 | feature-fullbleed | `feature-fullbleed` (또는 hero) | 포인트 구조 없음. 제품 커버/히어로 용도로 신규 블록 불필요 |
| point_27 | feature-captionbar | `feature-captionbar` | 워터 텍스처 배경 차이 외 풀블리드+하단 캡션바 구조 동일 |
| 35 | point-bubble | `point-bubble` | 핵심 모티프(제품 이미지 + 플로팅 원형 배지) 동일. 3-zone 구조는 point-bubble 내 수용 |
| 36 | point-bubble | `point-bubble` | 제품 이미지+플로팅 pill 배지+하단 3열 스트립. point-bubble 내 소변형 |

**총 7개 프레임 신규 변형 불필요. 기존 변형 재활용 또는 prop 확장으로 처리.**

---

## 3. 통합 후 순 추가 변형 수

### 아키타입별 신규 변형

| 아키타입 | 신규 변형 ID | 수 |
|---------|------------|---|
| **point** (기존 `point-bubble` 1개 → 확장) | `point-discount-price-reveal`, `point-fullbleed-caption`, `point-fullbleed-bookend`, `point-award-credential`, `point-editorial-marquee`, `point-heritage-split`, `point-ingredient-hero`, `point-brand-collab-editorial`, `point-timing-banner`, `point-numbered-hero-card`, `point-numbered-image-card`, `point-step-timeline-bleed`, `point-radar-web`, `point-ingredient-overlay`, `point-urgency-tape-cross`, `point-list-image-bleed`, `point-product-stats-split`, `point-product-annotation` | **18** |
| **feature** (기존 6개 → 확장) | `feature-dark-product-grid`, `feature-dark-float-cutout`, `feature-dark-tab-mosaic`, `feature-event-poster`, `feature-product-float-icon-grid`, `feature-image-row-list` | **6** |
| **promo** (신규 아키타입) | `promo-event-spotlight`, `promo-story-price-reveal`, `promo-scatter-banner` | **3** |
| **stats** (기존 확장) | `stats-satisfaction-bars`, `stats-hero-anchor-card-grid` | **2** |
| **point** (기존 cert 계열) | `point-award-credential` | *(위 point 합산)* |

### 집계

| 구분 | 수 |
|------|---|
| 원시 distinct=true 프레임 | 30 |
| 중복 variantId 그룹 통합 후 제거 (point_5↔point_14 별도 유지) | 0 |
| distinct=false 제외 | 7 |
| **순 추가 변형 수** | **29** |

> ※ point_5와 point_14는 variantId가 유사했으나 레이아웃 리듬이 실질 달라 **별도 2개**로 최종 확정.  
> ※ `feature-dark-tab-mosaic` (프레임 26)은 isSingleBlock=false — 멀티 블록 조합 패턴. 구현 시 2개 블록(헤더 + 탭+모자이크)으로 분리 가능.

---

## 4. 재구성 착수 우선순위

### 우선순위 기준
- **P0 (즉시)**: complexity low + 단일 블록 + 새 아키타입/에셋 의존 없음
- **P1 (1주)**: complexity medium + CSS만으로 재현 가능 + 고빈도 활용 패턴
- **P2 (2주)**: complexity medium + SVG/에셋 의존 또는 신규 아키타입 선행 필요
- **best-effort**: isSingleBlock=false 또는 복합 다중 에셋 의존

### 착수 순서표

| 순서 | 변형 ID | 대응 프레임 | 우선순위 | 이유 |
|------|---------|-----------|--------|------|
| 1 | `point-ingredient-hero` | point_10 | **P0** | complexity low, CSS만으로 완전 재현. 인라인 하이라이트+풀블리드 패턴은 고빈도 뷰티/식품 활용 |
| 2 | `point-numbered-image-card` | 18 | **P0** | complexity low, 대형 서수+텍스트+이미지 분리 카드. 단순 flex-col 구조 |
| 3 | `point-fullbleed-bookend` | point_14 | **P0** | complexity low, 북엔드 3단 구조 명확. 번호 pill+이미지+클로징 라인만 필요 |
| 4 | `point-product-stats-split` | 37 | **P0** | complexity low, 2열 분할+수치 리스트. 다크 bg + 이미지 슬롯만 연결 |
| 5 | `point-numbered-hero-card` | point_17 | **P0** | complexity low, 4-레이어 수직 스택 패턴 명확 |
| 6 | `point-discount-price-reveal` | point_1 | **P1** | 한국 이커머스 핵심 패턴. CSS Grid 2열+가격표+혜택카드 row. 다크 네이비 색상만 주의 |
| 7 | `point-fullbleed-caption` | point_5 | **P1** | 원형 번호배지+이미지+텍스트블록. 모바일 상세페이지 고빈도 포인트 패턴 |
| 8 | `point-timing-banner` | point_15 | **P1** | 텍스트 하이라이트 밴드 + 점선 구분선 + 풀블리드. 배송 타이밍 배너로 범용 활용 |
| 9 | `point-product-annotation` | point_29 | **P1** | 점선 커넥터 SVG/CSS 라인. 성분 어노테이션 고빈도. CSS only 구현 가능 |
| 10 | `feature-dark-product-grid` | point_3 | **P1** | 다크 배경 멀티 제품 그리드. feature 아키타입 확장으로 기존 구조 재활용 가능 |
| 11 | `stats-satisfaction-bars` | point_28 | **P1** | 진행바+퍼센트 행. CSS만으로 재현 명확. 소셜 프루프 고빈도 |
| 12 | `stats-hero-anchor-card-grid` | 33 | **P1** | 히어로 수치 + 2열 stat 카드. stats 아키타입 확장 |
| 13 | `point-ingredient-overlay` | point_25 | **P1** | 부유 pill 태그 absolute 배치. 성분 어노테이션 overlay 패턴 고빈도 |
| 14 | `feature-image-row-list` | point_30 | **P1** | 좌이미지-우텍스트 행 반복. 단순 flex 구조. 증정 오퍼 배너 패턴 |
| 15 | `feature-product-float-icon-grid` | 34 | **P1** | 솔리드 bg + free-float 이미지 + 아이콘 카드 그리드. 뷰티 카테고리 범용 |
| 16 | `promo-event-spotlight` | point_12 | **P1** | promo 아키타입 첫 번째. 다크 bg + 스태킹 타이포 + spotlight. CSS radial-gradient only |
| 17 | `promo-scatter-banner` | point_16 | **P1** | promo 아키타입 두 번째. 3D 오브젝트 PNG 슬롯만 연결하면 구현 완료 |
| 18 | `promo-story-price-reveal` | point_13 | **P1** | promo 아키타입 세 번째. 인라인 반응 뱃지 독특. box-decoration-break 처리 주의 |
| 19 | `point-step-timeline-bleed` | point_20 | **P2** | 수평 dot 타임라인 + vertical bleed overflow. overflow:visible 처리 필요 |
| 20 | `point-radar-web` | 21 | **P2** | SVG polygon 레이더 차트. 6꼭짓점 좌표 계산 + 제품 이미지 중앙 절대 배치 |
| 21 | `feature-dark-float-cutout` | point_7 | **P2** | floating 컷아웃 + overflow 카드 + 배지. z-index 3중 레이어 구조 |
| 22 | `point-promo-asymcard` | point_2 | **P2** | burst 배지 starburst CSS clip-path. 비대칭 2열 그리드 구조는 단순 |
| 23 | `feature-dark-tab-mosaic` | 26 | **P2** | isSingleBlock=false. 탭 Nav + 비대칭 모자이크 멀티 블록 조합 |
| 24 | `feature-event-poster` | 22 | **P2** | 다크 이벤트 포스터. ✦ 장식+pill 배지+우하단 콜아웃 카드 3레이어 |
| 25 | `point-award-credential` | point_6 | **P2** | 원형 어워드 배지 스탬프 클러스터 SVG. 월계관 에셋 의존 |
| 26 | `point-urgency-tape-cross` | 31 | **P2** | X자 diagonal tape band. transform:rotate + width:140% overflow 구현 |
| 27 | `point-editorial-marquee` | point_8 | **P2** | 양측 bilateral rotated ticker strip. writing-mode + CSS animation |
| 28 | `point-brand-collab-editorial` | point_11 | **P2** | ghost logotype(-webkit-text-stroke) + 바코드 틱 스트립 |
| 29 | `point-heritage-split` | point_9 | **best-effort** | 전통 단청 패턴 SVG 에셋 필요. CSS repeating-pattern 추상화 범위 제한 |
| 30 | `point-list-image-bleed` | 32 | **best-effort** | 전폭 워터마크 + 이미지 자유 블리드 + 다이아몬드 pill. z-index 레이어 복잡 |

---

## 5. 신규 아키타입 신설 여부

| 아키타입 | 판정 | 근거 |
|---------|------|------|
| `promo` | **신설 필요** | point_12(이벤트 공지), point_13(오퍼 가격 공개), point_16(캠페인 배너) — 3종 모두 특장점 나열이 아닌 프로모션 전용 구조. 기존 15개 아키타입 어디에도 속하지 않음 |
| `feature` 확장 | 기존 아키타입 내 추가 | `feature-dark-*` 계열 확장으로 충분 |
| `stats` 확장 | 기존 아키타입 내 추가 | 수치/만족도 패턴으로 stats 아키타입에 자연스럽게 통합 |

→ `types.ts`의 `BlockArchetype` 유니온에 `'promo'` 추가 필요.

---

## 6. 선행 작업 — 에셋 준비

| 에셋 | 필요 변형 | 비고 |
|------|---------|------|
| 월계관/어워드 SVG | `point-award-credential` | award 웨이브와 공유 가능 |
| 전통 단청 문양 SVG/CSS pattern | `point-heritage-split` | CSS repeating-pattern으로 추상화 권장 |
| starburst CSS clip-path | `point-promo-asymcard` | CSS polygon으로 직접 구현 가능 |
| writing-mode vertical ticker | `point-editorial-marquee` | CSS only — 에셋 불필요 |
| SVG 레이더 차트 (polygon) | `point-radar-web` | JS 또는 하드코드 SVG |

---

## 7. 전체 요약

| 항목 | 수치 |
|------|------|
| 감사 대상 프레임 총수 | 37 |
| distinct=true (재구성 대상) | 30 |
| distinct=false (기존 변형 재활용) | 7 |
| 중복 variantId 통합으로 제거 | 0 (point_5↔point_14 별도 유지) |
| **순 추가 변형 수** | **29** |
| 신규 아키타입 | 1 (`promo`) |
| P0 (즉시 착수) | 5 |
| P1 (1주 이내) | 13 |
| P2 (2주 이내) | 9 |
| best-effort | 2 |
