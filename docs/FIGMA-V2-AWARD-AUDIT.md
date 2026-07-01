# FIGMA V2 어워드 웨이브 감사 결과 — 블록 라이브러리 흡수 계획

> 감사 대상: 어워드(수상·권위) 구성 페이지 17개 프레임  
> 작성일: 2026-07-01  
> 담당: 블록 라이브러리 흡수 계획 책임자

---

## 1. 재구성 대상 목록 (distinct=true, 전체 17개)

모든 프레임이 기존 변형과 실질적으로 다른 독립 패턴으로 판정됨.

| # | frameId | suggestedVariantId | 한 줄 요약 | complexity | 비고 |
|---|---------|-------------------|-----------|------------|------|
| 1 | award_1 | `award-no1-emblem` | 3개 미니 메달 배지 행 + 대형 월계관 No.1 메달리온 듀얼존 어워드 히어로 | high | 그룹 A 대표 |
| 2 | award_2 | `award-no1-emblem` | 대형 3D 숫자 "1" + 좌우 대칭 월계관 + "N년 연속 수상" 오버레이 풀스크린 히어로 | high | 그룹 A 서브변형 |
| 3 | award_3 | `award-no1-emblem-banner` | 월계관 안 대형 "1" 엠블럼 단일 히어로 + 랭킹 카피 + 캠페인 기간 세로형 배너 | high | 독립 |
| 4 | award_4 | `award-no1-emblem-hero` | 중앙 원형 No.1 엠블럼 메달 + 양측 월계수 + 3단 포디움 배경 어워드 히어로 | high | 그룹 B 대표 |
| 5 | award_5 | `award-no1-emblem-badges` | 초대형 골드 "1위" 입체 엠블럼 + 월계관 래퍼 + 하단 근거 배지 3열 | high | 독립 |
| 6 | award_6 | `award-gov-seal-hero` | 정부기관 원형 씰 메달리온 + 3단 페데스탈 + 양측 월계수 리스 + 풀쿼트 수상 헤드라인 | high | 독립 |
| 7 | award_7 | `award-trophy-hero` | 단일 수치 히어로 + 대형 골드 트로피(월계관 포함) 레이어드 배경 + 하단 리본 배너 2행 | high | 그룹 C 대표 |
| 8 | award_8 | `award-milestone-hero` | 왕관 아이콘 → 누적판매 N만개 초대형 헤드라인 → 월계관 보증 배지 → 스포트라이트 제품샷 수직 스택 | high | 독립 |
| 9 | award_9 | `award-trophy-badge-grid` | 골드 트로피 히어로 앵커 + 7개 월계관 배지 비대칭 계단식 그리드(수상 아카이브) | high | 독립 |
| 10 | award_10 | `award-laurel-stat-rows` | 골드 월계관(로제트) SVG가 각 실적 행 좌측 반복 + 수직 행 스택 + 우측 제품 목업 | high | 독립 |
| 11 | award_11 | `award-ranking-podium-sale` | No.1 황금 엠블럼 히어로 + 1·2·3위 포디움 배지 + 행사가 2×2 카드 + 베스트 상품 3컬럼 복합 이벤트 랜딩 | high | 독립 |
| 12 | award_12 | `award-no1-emblem-hero` | 대형 원형 No.1 로제트 엠블럼 풀스크린 히어로 + 연속 수상·특허 텍스트 계층 + 좌우 플로팅 배지 | high | 그룹 B 서브변형 |
| 13 | award_13 | `award-trophy-hero` | 3D 골드 트로피 + 좌우 월계관 + 금색 리본 콘페티 수상 이벤트 포스터 히어로 | high | 그룹 C 서브변형 |
| 14 | award_14 | `award-trophy-hero` | 골드 트로피 컵 일러스트 풀-히어로 + 연도+스타 배지 행 + 수상 선언 단일 컬럼 | high | 그룹 C 서브변형 |
| 15 | award_15 | `award-laurel-emblem-grid` | 황금 월계관 SVG가 브랜드명+리뷰 수치 원형 포위 + 빅넘버 각주존 + 2×2 어워드 카드 그리드 복합 | high | 독립 |
| 16 | award_16 | `award-warranty-pledge` | A/S 보증 기간 선언 + 골드 픽토그램 엠블럼 + 담당자 캐릭터 아이콘 + 3단 배경 전환 | **medium** | 독립 — 유일한 비-수상 패턴 |
| 17 | award_17 | `award-rank1-listing-card` | 골드 트로피 + 카테고리 랭킹 달성 헤드라인 + 마켓플레이스 리스팅 카드 목업(1위 배지 오버레이) + 이중 금색 테두리 | high | 독립 |

---

## 2. distinct=false (기존 변형과 겹침) — 해당 없음

**이번 웨이브 17개 프레임 전원 distinct=true 판정.** 감사 데이터에 `isDistinct: false` 항목이 없음.

각 프레임의 `matchesExisting` 분석 근거:

| frameId | 유사 기존 변형 | 차이 요약 |
|---------|--------------|---------|
| award_1 | `stats-columns` (부분 유사) | stats-columns는 수치 3컬럼 그리드가 주역. 이 프레임은 No.1 메달리온 히어로존이 별도 존재 — 구조 상이 |
| award_2 | `stats-columns` (부분 유사) | stats-columns는 다중 컬럼 수치 레이아웃. 이 프레임은 단일 No.1 엠블럼 중심 풀스크린 히어로 — 구조 상이 |
| award_3 | `stats-columns`, `cert-rosette` | 각각 수치 그리드 중심, 로제트 훈장+설명 구조 — 세로형 단일 No.1 엠블럼 배너와 근본적 차이 |
| award_4 | `cert-pedestal` (부분 유사) | cert-pedestal은 인증서/뱃지를 받침대 위에 올리는 패턴. 이 프레임은 No.1 엠블럼 메달이 히어로이고 포디움은 장식 |
| award_6 | `cert-pedestal` (부분 유사) | cert-pedestal은 인증서 형식. 이 프레임은 정부기관 씰 + 풀쿼트 수상 헤드라인 복합 구성으로 독립 패턴 |

---

## 3. suggestedVariantId 중복 정리

동일 패턴을 가리키는 프레임이 여러 개인 경우, 대표 변형 1개 + 서브변형으로 통합한다.

### 그룹 A: `award-no1-emblem` (프레임 1, 2, 12)

| 역할 | frameId | 핵심 차이 |
|------|---------|---------|
| **대표** | award_1 | 미니 배지 3개 행 + 대형 메달리온 **듀얼존** 구조 |
| 서브변형 | award_2 | 3D 숫자 "1" + 좌우 월계관 + "N년 연속" 오버레이 텍스트 |
| 서브변형 | award_12 | 원형 로제트 풀스크린 + 연속수상 텍스트 계층 + 좌우 플로팅 배지 |

→ **구현 전략**: `award-no1-emblem` 파일에 `variant` 파라미터(duet / year-streak / rosette-hero)로 분기하거나, 3개 별도 변형 ID로 등록. 레이아웃 분기가 크면 별도 파일 권장.

### 그룹 B: `award-no1-emblem-hero` (프레임 4, 12)

award_12는 그룹 A의 서브변형이기도 하므로, **award_4가 그룹 B의 단독 대표**로 처리.

| 역할 | frameId | 핵심 차이 |
|------|---------|---------|
| **대표** | award_4 | 원형 No.1 메달 + 양측 월계수 + 3단 포디움 배경 3레이어 구성 |

### 그룹 C: `award-trophy-hero` (프레임 7, 13, 14)

| 역할 | frameId | 핵심 차이 |
|------|---------|---------|
| **대표** | award_7 | 단일 수치 히어로 + 트로피 레이어드 + 리본 배너 2행 (수치 강조형) |
| 서브변형 | award_13 | 3D 트로피 + 리본 콘페티 이벤트 포스터 (수치 없음, 이벤트 선언형) |
| 서브변형 | award_14 | 트로피 컵 풀-히어로 + 연도+스타 배지 + 수상 타이틀만 (가장 단순, 타이틀 선언형) |

→ **구현 전략**: 3개를 별도 변형 ID로 등록 권장 (`award-trophy-stat`, `award-trophy-poster`, `award-trophy-declare`). 슬롯 구조가 달라 하나로 합치면 복잡도가 오히려 높아짐.

### 독립 변형 (그룹 없음, 1:1 매핑)

| suggestedVariantId | frameId |
|-------------------|---------|
| `award-no1-emblem-banner` | award_3 |
| `award-no1-emblem-badges` | award_5 |
| `award-gov-seal-hero` | award_6 |
| `award-milestone-hero` | award_8 |
| `award-trophy-badge-grid` | award_9 |
| `award-laurel-stat-rows` | award_10 |
| `award-ranking-podium-sale` | award_11 |
| `award-laurel-emblem-grid` | award_15 |
| `award-warranty-pledge` | award_16 |
| `award-rank1-listing-card` | award_17 |

---

## 4. 순 distinct 변형 수 추정

### 그룹별 통합 후 최종 변형 ID 수

| 그룹/변형 | 최종 변형 ID | 프레임 수 |
|----------|------------|---------|
| 그룹 A — No.1 엠블럼 계열 | `award-no1-emblem` + `award-no1-emblem-streak` + `award-no1-emblem-rosette` | 3개 ID |
| 그룹 B — 엠블럼 히어로 | `award-no1-emblem-hero` | 1개 ID |
| 그룹 C — 트로피 히어로 계열 | `award-trophy-stat` + `award-trophy-poster` + `award-trophy-declare` | 3개 ID |
| 독립 변형 10종 | (위 표 참고) | 10개 ID |

**이번 어워드 웨이브로 추가될 순 distinct 변형 수: 17개**

> 통합 후 실제 등록 변형 ID는 17개 (그룹 내 서브변형도 별도 ID로 등록하는 것이 컴포저 선택 정밀도상 유리).  
> 만약 그룹 A를 1개 ID+파라미터로 처리하면 최소 **14개** ID로 압축 가능.

---

## 5. 재구성 착수 권고 순서

### 우선순위 기준
- **P0 (즉시)**: complexity medium 또는 SVG 장식 의존도 낮은 것
- **P1 (1주)**: 독립 구조·명확한 CSS 재현 가능
- **P2 (2주)**: 월계관/트로피 SVG 에셋 의존도 높으나 패턴 가치 높음
- **best-effort**: 복합 레이아웃 + 고장식 의존 — SVG 에셋 준비 선행 필요

### 착수 순서표

| 순서 | 변형 ID | 대응 프레임 | 우선순위 | 이유 |
|------|---------|-----------|--------|------|
| 1 | `award-warranty-pledge` | award_16 | **P0** | complexity medium, 유일한 비-수상 패턴. A/S 보증 신뢰 블록으로 즉시 사용 가능. SVG 의존 낮음(픽토그램 단순) |
| 2 | `award-rank1-listing-card` | award_17 | **P1** | 마켓플레이스 목업 카드 구조 독특. CSS+HTML만으로 리스팅 카드 재현 가능. 이중 테두리·트로피 SVG만 해결하면 됨 |
| 3 | `award-laurel-stat-rows` | award_10 | **P1** | 수직 행 스택 구조 명확. 월계관 아이콘 1개 재사용. 제품 목업 이미지 슬롯만 연결하면 즉시 활용 가능 |
| 4 | `award-no1-emblem-banner` | award_3 | **P1** | 단일 존 구조. 월계관 SVG 1개 + 배경 + 텍스트로 CSS 재현 범위 명확 |
| 5 | `award-trophy-declare` | award_14 | **P1** | 그룹 C 중 가장 단순. 수치 없음, 슬롯 구조 최소(트로피 이미지+타이틀+연도). 진입점으로 적합 |
| 6 | `award-milestone-hero` | award_8 | **P1** | 수직 스택 구조 명확. 왕관 아이콘 단순 SVG. 핵심은 초대형 헤드라인 타이포+radial-gradient로 CSS만으로 재현 고품질 가능 |
| 7 | `award-no1-emblem` (대표) | award_1 | **P2** | 듀얼존 구조 명확하나 월계관 메달리온 SVG 필수. 서브변형 2개(award_2, award_12)를 묶어 한 번에 구현 |
| 8 | `award-no1-emblem-hero` | award_4 | **P2** | 3단 포디움 CSS clip-path 재현 가능. 월계수 SVG 필요. 그룹 A 구현 후 연속 진행 |
| 9 | `award-no1-emblem-badges` | award_5 | **P2** | 초대형 타이포 + text-shadow 3D 기법. 월계관 SVG 1개면 충분. 하단 배지 행은 flex로 단순 |
| 10 | `award-trophy-stat` | award_7 | **P2** | 리본 배너 CSS clip-path 재현 가능. 트로피 SVG 필요. 그룹 C 대표로 먼저 구현 |
| 11 | `award-trophy-poster` | award_13 | **P2** | 그룹 C 서브. award_7 트로피 SVG 재사용. 콘페티 CSS animation 추가 |
| 12 | `award-gov-seal-hero` | award_6 | **P2** | 정부기관 씰 이미지 슬롯 + 월계수 리스 SVG 필요. 구조는 단순하나 에셋 준비가 선행 조건 |
| 13 | `award-ranking-podium-sale` | award_11 | **P2** | 복합 레이아웃(4존). 포디움 중앙 돌출은 CSS translateY로 재현 가능. 월계관 SVG 재사용 |
| 14 | `award-laurel-emblem-grid` | award_15 | **best-effort** | 4존 복합. 월계관 SVG가 텍스트를 원형 포위하는 구조 — CSS만으로 완전 재현 어려움. SVG 에셋 정교도가 품질 결정 |
| 15 | `award-trophy-badge-grid` | award_9 | **best-effort** | 트로피 + 7개 월계관 배지 비대칭 그리드. CSS grid로 구조 재현 가능하나 월계관 배지 SVG 7종(또는 1종 반복) 필요 |
| 16 | `award-laurel-emblem-grid` (15존) | award_15 | **best-effort** | (위와 동일 항목) |
| 17 | `award-no1-emblem-rosette` | award_12 | **best-effort** | 그룹 A 서브변형 중 장식 의존도 가장 높음. 로제트+플로팅 배지 조합. 그룹 A 대표 구현 이후 연속 처리 |

---

## 6. 선행 작업 — SVG 에셋 준비

고복잡도 변형 대부분이 아래 SVG 에셋에 의존. 재구성 착수 전 공용 에셋으로 준비 권장.

| 에셋 | 사용 변형 | 비고 |
|-----|---------|------|
| 월계관(laurel wreath) SVG — 좌우 대칭 branch | 거의 전 변형 | CC0 또는 자체 제작 필수. 픽셀 클론 금지 |
| 골드 트로피 컵 SVG | award_7, 13, 14, 9, 17 | 고해상도 장식 그래픽. 오픈소스 trophy SVG 탐색 선행 |
| 왕관(crown) SVG | award_8 | 단순. ICONS 공용 등록 가능 |
| 원형 No.1 로제트 SVG | award_1, 3, 4, 12 | CSS circle+border로 근사 가능하나 SVG 쪽이 품질 우수 |
| 정부기관 씰 이미지 | award_6 | 실제 수상 근거 브리프에서 수급 필수 (임의 생성 금지) |

---

## 7. 아키타입 신설 여부 판단

현재 `types.ts` BlockArchetype에 `award` 아키타입이 없음. 기존 `cert`/`stats` 아키타입으로 흡수하는 방안과 `award` 신규 아키타입 추가 두 가지 선택지.

| 선택지 | 장점 | 단점 |
|--------|-----|------|
| **`cert` 확장 + `stats` 확장** | types.ts 변경 없음. 기존 컴포저 프롬프트 호환 | cert(인증서 형식)·stats(수치 강조)와 award(수상 권위)는 의미상 구분이 모호해짐 |
| **`award` 신규 아키타입 추가** | 의미 명확. 컴포저 AI가 섹션 역할을 정확히 선택 가능. 확장성 우수 | types.ts 1줄 추가 + 컴포저 프롬프트 예시 보강 필요 |

**권고: `award` 아키타입 신설.** 수상·권위 전용 섹션은 상세페이지에서 독립적 역할(신뢰 크리덴셜 극대화)을 담당하며, cert(인증서/시험성적서)·stats(성과 수치)와 사용 목적이 구분됨.

---

## 요약

| 항목 | 값 |
|-----|---|
| 감사 프레임 수 | 17개 |
| distinct=true | **17개 (100%)** |
| distinct=false (기존 흡수 가능) | 0개 |
| suggestedVariantId 중복 그룹 | 3개 그룹 (A: 3프레임, B: 1프레임, C: 3프레임) |
| 통합 후 순 distinct 변형 수 | **17개** (그룹별 서브변형 별도 ID 등록 기준) |
| 최소 압축 시 변형 수 | 14개 (그룹 A를 1 ID+파라미터로 처리 시) |
| 유일한 medium complexity | award_16 (`award-warranty-pledge`) |
| 권고 아키타입 | `award` 신설 |
| SVG 에셋 선행 준비 필요 | 월계관, 트로피, 왕관, 로제트 (CC0/자체 제작) |
