# DetailAI 품질 재감사 리포트 — 2026-07-01

> P0(렌더 버그) + P1(저대비) 수정 후 9개 페이지 재채점 결과 vs 이전 감사 기준선 비교

---

## 1. P0 검증 — literalTagLeak

| 항목 | 이전 | 이번 |
|------|------|------|
| literalTagLeak=true 페이지 수 | 9 / 9 (전수 오염) | **0 / 9** |

**P0 완전 해소.** `<span class="em">`, `<br>` 등 HTML 태그가 화면에 노출되는 렌더 버그는 9개 페이지 전원에서 제거됨.

---

## 2. 항목별 평균 점수 + 증감

| 항목 | 이전 평균 | 이번 평균 | Δ |
|------|-----------|-----------|---|
| hierarchy | 3.56 | 3.33 | **-0.23** |
| contrast | 2.44 | 2.78 | **+0.34** |
| typography | 1.89 | 3.11 | **+1.22 ★** |
| composition | 3.44 | 3.67 | +0.23 |
| imageEmptyResilience | 3.22 | 3.56 | +0.34 |
| briefFit | 3.89 | 4.11 | +0.22 |
| **overall** | **2.67** | **3.11** | **+0.44** |

- **최대 상승**: typography +1.22 — 리터럴 태그 노출 제거가 점수에 직접 반영됨
- **유일한 하락**: hierarchy -0.23 — 통계적으로 미미하나, 강조 태그 제거 후 일부 섹션의 텍스트 위계가 평탄해진 것으로 추정
- **contrast**: +0.34 상승했으나 2.78로 여전히 최저권 — P1이 부분 해소에 그침

---

## 3. Verdict 집계 + 이전 대비

| verdict | 이전 | 이번 | 변화 |
|---------|------|------|------|
| pass | 0 | **1** | +1 (kokodang-v3) |
| warn | 3 | **8** | +5 |
| fail | 6 | **0** | -6 |

- fail 전멸: 이전 6개 fail 모두 warn 이상으로 격상
- pass는 1개(kokodang-v3)에 불과 — 목표(전체 pass)까지는 아직 거리 있음
- warn 8개 = 출시 가능하나 품질 경고 상태. 수정 권고 수준

---

## 4. 잔존 최우선 문제 Top 3

### P1-A. 밝은 배경 위 연한 회색 소형 텍스트 — 전 템플릿 반복 (severity: high)

**영향 페이지**: 9개 중 8개 (kokodang-v3 제외 전원)

**구체 발생 위치**:
- `kokodang-v1/v2`: 원재료 카드(코코넛·우뭇가사리) 설명 텍스트 — 크림 배경 위 연회색
- `hwangtae-v1/v2/v3`: KEY INGREDIENTS eyebrow + 원료 리스트 항목 — 흰 배경 위 극연회색; 영양성분 테이블 라벨 행
- `publisher-v1`: Brand Story 헤드라인 2번째 행('새롭게 발행되는'), PURE AROMA OIL BLENDING eyebrow, 골드 텍스트 흰 배경 배치
- `publisher-v2`: Hero eyebrow, 향 피라미드 HEART/BASE 레이블
- `publisher-v3`: CH.02 레이블, HOW TO USE eyebrow, 피처 아이콘 하단 라벨

**근본 원인 추정**: eyebrow/label 컴포넌트의 기본 텍스트 컬러가 `color: #ccc` 또는 `opacity: 0.4` 수준으로 하드코딩된 것으로 보임 — 배경색 변수와 연동되지 않음.

---

### P1-B. FAQ 답변 내 cobalt 강조 span 빈 문자열 렌더링 (severity: high)

**영향 페이지**: publisher-v3

**구체 발생 위치** (최소 3곳):
- '베르가못·스윗오렌지의 `[공백]` 으로 부담이 없습니다'
- '다만 개인 피부 특성에 따라 `[공백]` 을 권장합니다'
- 'switch는 `[공백]` 합니다'

**성격**: P0 태그 노출과 유사한 계열의 버그 — 강조 콘텐츠가 렌더링되지 않고 공백만 남음. 별도 수정 필요.

---

### P1-C. 한국어 줄바꿈 어절 단절 — 의미 훼손 (severity: medium, 다수 반복)

**영향 페이지**: hwangtae-v3, publisher-v3

**구체 발생 위치**:
- `hwangtae-v3`: '자연의 황금 비율이 / 합니다' — '비율이'와 '합니다' 사이 줄바꿈으로 의미 단절
- `publisher-v3`: '깨우 / 다'(Hero 헤드라인), '부 / 담 없이'(HOW TO USE 헤드라인) — 어절 중간 줄바꿈

**근본 원인**: `word-break: break-all` 또는 `overflow-wrap` 설정이 한국어 어절 경계를 무시하는 것으로 추정. `word-break: keep-all` 적용 필요.

---

## 5. 총평

P0(리터럴 태그 노출) 완전 해소, typography +1.22·overall +0.44 유의미한 상승으로 최악의 품질 위기는 탈출했으나, 밝은 배경 위 연한 회색 소형 텍스트 저대비 문제가 8개 페이지에 걸쳐 구조적으로 잔존하여 contrast가 여전히 2.78에 머물고 있으며, pass 달성은 9개 중 1개(kokodang-v3)에 불과해 배포 품질 기준 충족까지 추가 수정 스프린트가 필요하다.

---

*감사 기준일: 2026-07-01 | 감사 대상: 9페이지(kokodang×3, hwangtae×3, publisher×3) | 채점 항목: hierarchy·contrast·typography·composition·imageEmptyResilience·briefFit·overall (각 1–5점)*
