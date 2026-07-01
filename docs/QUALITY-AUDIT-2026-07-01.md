# DetailAI 품질 감사 보고서 — 2026-07-01

> 감사 범위: 9개 생성 페이지 (kokodang×3, hwangtae×3, publisher×3) + 코드베이스 진단 3건  
> 작성 기준: 9페이지 평가 JSON + 렌더 버그/대비 버그/컴포저 고착화 진단 종합

---

## 1. 총평

**렌더 버그 2종(HTML 태그 리터럴 노출 + 강조 빈칸)이 9개 페이지 전체에 걸쳐 반복되어, 생성물의 완성도와 신뢰성을 심각하게 훼손한다. 디자인 대비 문제는 독립적으로 존재하나, 렌더 버그 수정 없이는 판단 불가능한 영역이 많다. 블록 다양성(활용률 17.7%)은 라이브러리 투자 대비 효과가 극히 낮다.**

---

## 2. 문제 계층별 정리

### 2-A. 실제 렌더 버그 (최우선)

#### Bug-1: HTML 태그 리터럴 노출 (`<span class="em">…</span>` 그대로 출력)

- **원인**: `stats-figures.ts` 93번 줄에서 `value` 필드를 `esc(row.value)`로 렌더. LLM이 `value` 필드에 `<span class="em">` 마크업을 삽입하면 `<` → `&lt;`, `>` → `&gt;`로 이스케이프되어 태그가 화면에 그대로 노출된다.
- **영향 범위**: hwangtae-v1(s00/s03), hwangtae-v2(s04), hwangtae-v3(s00), publisher-v2(s04), publisher-v3(s00) — 확인된 것만 5개 섹션
- **근본 원인 보완**: `blocks-composer.ts` 116번 줄 DATA_CONTRACTS의 `stats-figures` 계약에서 `value` 필드에 `(em)` 어노테이션이 없어 LLM에게 강조 허용 신호가 전달되지 않았음에도 LLM이 em 태그를 삽입함

#### Bug-2: 강조 span 빈칸 렌더 (내용이 빈 `<span class="em"></span>`)

- **원인 A**: LLM이 fill-in-blank 자리표시자를 빈 span으로 출력 — DOM에는 span이 존재하나 콘텐츠가 없어 빈칸으로 렌더
- **원인 B**: `shared.ts` 149번 줄 `.acc,.em{color:var(--accent)}` — warm-playful 등 프리셋에서 accent와 배경(`--bg`)이 유사 명도일 때 텍스트가 시각적으로 소실
- **영향 범위**: 9개 페이지 전체. kokodang 3종(s00~s05), hwangtae 3종(s00~s05), publisher 3종(s00~s05)에서 체크리스트 항목, 히어로 헤드라인, HOW TO USE 단계, FAQ 답변, 제품 상세 테이블 등에 반복 확인됨

#### Bug-3: `<br>` 태그 리터럴 노출

- **확인 지점**: kokodang-v3 s02 헤더, publisher-v3 s00 본문
- **원인**: LLM이 줄바꿈을 `<br>` 텍스트로 출력 → `esc()`가 태그로 인식하지 않고 그대로 통과하거나, `richSafe()`가 적용되지 않은 필드에 삽입됨

---

### 2-B. 디자인: 대비 · 타이포 · 구성

#### 대비 문제 (WCAG AA 미달)

| 위치 | CSS 규칙 | 추정 대비 | 기준 |
|------|---------|----------|------|
| `ingredient.ts:148` `.isp-eye` | `color:var(--accent); opacity:.5` (sand-luxury) | ~1.6:1 | AA 4.5:1 |
| `ingredient.ts:157` `.isp-d` | `color:var(--ink); opacity:.62` | ~2.8:1 | AA 4.5:1 |
| `ingredient.ts:40` `.ia-no` | `color:rgba(255,255,255,.55)` | ~2.2:1 | AA large 3:1 |
| `ingredient.ts:96` `.ig-sub` | `color:rgba(255,255,255,.6)` | ~3.5:1 | AA 4.5:1 |
| `hero.ts:30` `.hc-sub` | `color:var(--ink-2)` (sand-luxury) | ~4.2:1 | AA 4.5:1 |
| `ingredient-stagger.ts:62` `.istag-no` | `opacity:.75` on accent-tint bg | <3:1 | AA large 3:1 |

#### 타이포그래피 문제

- `publisher-v2`: typography 점수 1/5 — 헤드라인 강조어 공백 + 단어 붙여쓰기 ('발행하는라이프스타일')
- `hwangtae-v1`: typography 점수 1/5 — 핵심 수치 섹션 전체 태그 노출으로 판독 불가
- 전체적으로 em 스팬 렌더 실패가 타이포 점수를 왜곡 (버그 수정 후 재평가 필요)

#### 구성 문제

- 말풍선 텍스트 클리핑: kokodang-v1 s02 냉동 bubble 높이 부족으로 내용 잘림
- 비교표 강조색 저대비: kokodang 시리즈 Before/After 비교표에서 sand/cream 배경 위 강조 텍스트 가독성 없음

---

### 2-C. 블록 다양성 · 컴포저 고착화

- **활용률**: 181개 등록 변형 중 32개만 사용 = **17.7%**. 149개(82%)는 9페이지 전체에서 한 번도 선택되지 않음
- **고착 코어**: `checklist-checks`, `recommend-dark`, `callout-banner`, `ingredient-grid`, `story-brand`, `statement-serif`, `spec-table`, `closing-mood` — 9/9 페이지 전부 등장
- **v1/v2/v3 다양성 실패**: kokodang Jaccard 유사도 0.84~0.89, hwangtae 0.71~0.80. 버전 간 차이는 블록 순서 정도이며 구성 자체는 동일
- **원인**: SYSTEM_PROMPT의 묵시적 순서 예시(`hero → recommend/checklist → trust → point/feature → ...`)가 사실상 레일로 작동. 카테고리별 선택 풀·배제 규칙·다양성 강제 장치 없음

---

### 2-D. 테스트 하네스 부재

- 렌더 버그(Bug-1/2/3)는 자동화 스냅샷 테스트나 DOM 파싱 검사가 있었다면 코드 변경 시점에 포착 가능
- 대비 검사 자동화 없음 — 프리셋별 accent/bg 조합에서 WCAG 4.5:1 이하 색상 조합을 사전에 걸러내는 단위 테스트 부재
- 블록 선택 다양성 지표 추적 없음 — variantId 사용 이력/빈도를 측정하는 파이프라인 로그 없음

---

## 3. 우선순위 개선 로드맵

### P0 — 즉시 렌더 버그 수정 (배포 차단 수준)

| # | 파일 | 위치 | 수정 내용 |
|---|------|------|----------|
| P0-1 | `agents/templates/blocks/variants/stats-figures.ts` | 93번 줄 | `esc(row.value)` → `richSafe(row.value)` 로 교체. 94번 줄 `row.sub`도 동일 처리 |
| P0-2 | `agents/blocks-composer.ts` | 116번 줄 DATA_CONTRACTS | `stats-figures { ..., rows:[{ label, value, sub? }] }` → `rows:[{ label, value(em), sub? }]` 로 수정 |
| P0-3 | `agents/blocks-composer.ts` | 69번 줄 DATA_CONTRACTS | `checklist-checks { ..., items:[{ text(em), star?:bool }] }` 에 주석 추가: `-- text(em) 내 빈 span 금지; 자리표시자는 실제 단어로 채울 것` |
| P0-4 | `agents/templates/blocks/shared.ts` | 149번 줄 | `.acc,.em{color:var(--accent)}` → `.acc,.em{color:var(--accent-d)}` 로 변경하여 accentDark 토큰 사용 (밝은 배경 블록 최소 대비 확보) |
| P0-5 | `agents/blocks-composer.ts` | SYSTEM_PROMPT 또는 DATA_CONTRACTS 전체 | `<br>` 리터럴 출력 방지 주석: `(br)` 어노테이션이 없는 필드에는 `<br>` 태그 삽입 금지 명시. 또는 `richSafe()` 함수에서 `<br>` 이외의 태그를 차단하는 allowlist 정책 재확인 |

**예상 효과**: P0 완료 시 9개 페이지에 걸쳐 반복된 태그 노출·빈칸 강조 버그가 일괄 해소됨. 모든 페이지 재생성 권장.

---

### P1 — 디자인 · 대비 수정 (P0 완료 후)

| # | 파일 | 위치 | 수정 내용 |
|---|------|------|----------|
| P1-1 | `agents/templates/blocks/variants/ingredient.ts` | `.isp-eye` | `opacity:.5` → `opacity:.85` 또는 제거. sand-luxury 프리셋에서 추가로 `color:var(--accent-d)` 전환 권장 |
| P1-2 | `agents/templates/blocks/variants/ingredient.ts` | `.isp-d` | `opacity:.62` → `opacity:.82` 또는 `color:var(--ink-2)` + opacity 제거 |
| P1-3 | `agents/templates/blocks/variants/ingredient.ts` | `.ia-no` | `color:rgba(255,255,255,.55)` → `color:rgba(255,255,255,.75)` |
| P1-4 | `agents/templates/blocks/variants/ingredient.ts` | `.ig-sub` | `color:rgba(255,255,255,.6)` → `color:rgba(255,255,255,.82)` |
| P1-5 | `agents/templates/blocks/variants/hero.ts` | `.hc-sub` | `color:var(--ink-2)` → `color:var(--ink)` (sand-luxury에서 9.5:1 확보) |
| P1-6 | `agents/templates/blocks/variants/ingredient-stagger.ts` | `.istag-no` | `opacity:.75` → `opacity:.9` |
| P1-공통 | 전체 변형 CSS | opacity 감쇄 패턴 | `opacity` + `var(--ink)` 조합 대신 `color-mix(in srgb,var(--ink) 72%,transparent)` 또는 `var(--ink-2)` 직접 지정으로 통일. 대비를 프리셋 토큰 단계에서 보장하는 전략 도입 |

**예상 효과**: P1 완료 시 kokodang-v1/v3 및 hwangtae 시리즈의 성분 섹션 가독성 회복, WCAG AA 근접.

---

### P2 — 블록 다양성 · 컴포저 개선

| # | 파일 | 수정 내용 |
|---|------|----------|
| P2-1 | `agents/blocks-composer.ts` | SYSTEM_PROMPT에 아키타입별 변형 풀 명시. 고착 8개 블록 각각을 3~5개 동급 변형 풀로 교체 요구 (예: `hero: [hero-centered, hero-editorial, hero-points, hero-arch, hero-split-list, ...]`) |
| P2-2 | `agents/blocks-composer.ts` | "이전 버전과 다른 변형 선택" 지시 추가 — v2/v3 생성 시 v1 사용 블록 목록을 user prompt에 주입하여 다양성 강제 |
| P2-3 | `agents/blocks-composer.ts` | 카테고리-프리셋 매핑 테이블 도입: 반려동물/sand → hero-photo/story-curve-panel 우대; 뷰티/cobalt → feature-editorial/ingredient-spotlight 우대; 건기식 → cert-badge-hero/stats-bento-grid 우대 |
| P2-4 | `agents/templates/blocks/index.ts` | variantId 사용 이력 로그 파이프라인 추가 (outputDir에 `block-usage.json` 누적) — 다음 생성 시 재사용 페널티 부여 기반 |

**예상 효과**: 활용률 17.7% → 40%+ 목표. v1/v2/v3 Jaccard 유사도 0.50 이하 목표.

---

### P3 — 테스트 하네스 구축

| # | 내용 |
|---|------|
| P3-1 | 렌더 결과 HTML에서 `&lt;span`, `&lt;br`, `&gt;` 패턴 감지하는 자동화 스냅샷 검사 추가 |
| P3-2 | 프리셋별 accent/bg/ink 대비 비율을 `deriveTokens()` 단계에서 단위 테스트로 검증 (WCAG AA 4.5:1 기준) |
| P3-3 | 빈 em span(`<span class="em"></span>`) 감지 규칙 — 렌더 후 DOM 파싱으로 빈 콘텐츠 span 차단 |
| P3-4 | 블록 다양성 지표 CI 체크 — 동일 제품 v1/v2/v3 Jaccard > 0.7 이면 경고 출력 |

---

## 4. 확장 라이브러리(181변형) 효과 판정

### 판정: **투자 대비 효과 매우 낮음 — 구조적 활용 실패**

| 지표 | 수치 |
|------|------|
| 등록 변형 수 | 181개 |
| 실제 사용 변형 수 | 32개 |
| **활용률** | **17.7%** |
| 한 번도 선택 안 된 변형 | 149개 (82%) |
| 9/9 페이지 전부 등장 블록 | 8개 |
| kokodang v1↔v2 Jaccard 유사도 | 0.84 |
| kokodang v1↔v3 Jaccard 유사도 | 0.89 |

**결론**: 181개 변형 라이브러리를 구축했음에도 LLM의 자유 선택 방식 + 컴포저의 묵시적 순서 레일로 인해 실질적으로는 8~10개 블록이 고정 반복된다. 다양성·품질 향상 기여는 카테고리 특화 변형에서 부분적으로만 관찰되었다(hwangtae에서만 `equation-visual`/`stats-figures`, publisher에서만 `feature-editorial`/`ingredient-spotlight` 선택). 라이브러리 자체는 잘 설계되어 있으나, P2 컴포저 개선 없이는 다수 변형이 사장된다.

---

## 5. 9개 페이지 Verdict 집계 및 점수

### Verdict 집계

| Verdict | 수 | 페이지 |
|---------|----|-|
| pass | 0 | — |
| warn | 3 | kokodang-v1, kokodang-v2, publisher-v3 |
| fail | 6 | kokodang-v3, hwangtae-v1, hwangtae-v2, hwangtae-v3, publisher-v1, publisher-v2 |

**합격률: 0% (pass 0/9), 조건부 경고: 33% (warn 3/9), 불합격: 67% (fail 6/9)**

### 항목별 평균 점수 (9페이지 기준, 각 5점 만점)

| 항목 | 합계 | **평균** |
|------|------|--------|
| hierarchy (계층) | 4+4+3+3+4+3+4+3+4 = 32 | **3.56** |
| contrast (대비) | 2+3+2+2+3+2+2+3+3 = 22 | **2.44** |
| typography (타이포) | 2+3+2+1+2+2+2+1+2 = 17 | **1.89** |
| composition (구성) | 4+4+3+3+3+3+4+4+3 = 31 | **3.44** |
| imageEmptyResilience (이미지 빈 슬롯 탄력) | 3+3+3+3+3+3+3+4+4 = 29 | **3.22** |
| briefFit (브리프 적합도) | 4+5+4+3+4+4+4+3+4 = 35 | **3.89** |
| **overall (종합)** | 3+4+3+2+3+2+2+2+3 = 24 | **2.67** |

> 최저: typography 1.89 / contrast 2.44  
> 최고: briefFit 3.89 / hierarchy 3.56  
> 종합 평균: **2.67 / 5.00**

---

## 6. 수정 우선순위 요약 카드

```
P0 (즉시, 배포 차단)
  - stats-figures.ts:93 — esc() → richSafe()
  - blocks-composer.ts:116 — stats-figures value(em) 어노테이션 추가
  - blocks-composer.ts:69 — checklist 빈 span 금지 주석
  - shared.ts:149 — .em{color:var(--accent-d)} accentDark 전환
  - SYSTEM_PROMPT — (br) 없는 필드에 <br> 삽입 금지 명시

P1 (P0 완료 후, 디자인 대비)
  - ingredient.ts — .isp-eye opacity:.5 → .85
  - ingredient.ts — .isp-d opacity:.62 → .82
  - ingredient.ts — .ia-no rgba(255,255,255,.55) → .75
  - ingredient.ts — .ig-sub rgba(255,255,255,.6) → .82
  - hero.ts — .hc-sub ink-2 → ink
  - ingredient-stagger.ts — .istag-no opacity:.75 → .9

P2 (컴포저 다양성)
  - blocks-composer.ts — 아키타입별 변형 풀 + 이전 버전 배제 주입

P3 (테스트 하네스)
  - 렌더 HTML 태그 노출 자동 감지
  - 프리셋 대비 단위 테스트
```

---

*감사일: 2026-07-01 | 감사 대상: /products/detail-page-saas | 버전: v2.2 기준*
