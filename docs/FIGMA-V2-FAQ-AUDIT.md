# Figma V2 FAQ 감사 종합 보고서

> 생성일: 2026-07-02
> 대상: FAQ 계열 23종 프레임 감사 JSON 종합 분석
> 기존 FAQ 블록 8종: `faq-box` · `faq-plain` · `faq-numbered` · `faq-pill-bar` · `faq-glyph-box` · `faq-badge-row` · `faq-chat` · `faq-list`
> 관련 비FAQ 기존 블록: `review-chat-bubbles` · `shipping-notice` · `cs-hours-contact` · `cs-contact-banner`

---

## 1. 재구성 대상 — distinct=true (신규 블록)

중복이 없고 레이아웃 패턴이 질적으로 다른 프레임만 신규 블록으로 등록.
유사 프레임은 대표 1개로 통합.

### 1-A. FAQ 계열 신규 블록 6종

| # | variantId | frameId(대표) | 복잡도 | 단일블록 | 한 줄 요약 |
|---|-----------|--------------|--------|---------|-----------|
| 1 | `faq-circle-badge` | faq_3 | low | yes | 솔리드 원형 Q 배지 + 단일 공유 카드 컨테이너, A 레이블 없는 들여쓰기 답변 |
| 2 | `faq-stagger-offset` | faq_4 | medium | yes | Q 카드(좌정렬 full-width) / A 카드(우인덴트 별도 박스) 분리 스태거드 배치 |
| 3 | `faq-editorial-split` | faq_10 | medium | yes | 단일 Q&A를 다크 Q존 / 라이트 A존 수직 분할 패널 + 에디토리얼 이미지 블리드 |
| 4 | `faq-pill-card-split` | faq_17 | low | yes | 다크 풀폭 pill Q행 + 별도 흰 카드 A행, 2레이어 구조, 주황 Q./A. 글리프 |
| 5 | `faq-satisfaction-bar` | faq_18 | medium | yes | 전폭 골드 그래디언트 fill 행 + 우측 100% 수치 — 만족도 정량 시각화 |
| 6 | `faq-dual-circle` | faq_20 | low | yes | Q=틸 / A=네이비 듀얼 컬러 원형 배지, 카드 없는 오픈 레이아웃, 2단 A 타이포 |

### 1-B. 비FAQ 계열 신규 블록 2종 (별도 스프린트)

| variantId | frameId | 분류 제안 | 이유 |
|-----------|---------|----------|------|
| `feature-radial-icon-list` | faq_8 | feature 계열 | 방사형 아이콘 다이어그램 + hr 피처리스트, Q&A 구조 없음 |
| `spec-table-label-value` | faq_21 | spec/recruit 계열 | 라벨-값 2열 HR 테이블, 채용공고·스펙 공시용 |

---

## 2. 중복 제외 목록 — distinct=false (기존 블록 흡수 15건)

| frameId | 흡수 대상 기존 블록 | 중복 근거 |
|---------|------------------|---------|
| faq_1 | `faq-box` | Q/A 구분선+레이블 조합이 faq-box 패턴과 동일. 스타일 토큰 차이만 존재 |
| faq_2 | `faq-plain` | Q. 접두어 + 평문 답변 + 여백 구분 — faq-plain 타이포 스킨 |
| faq_5 | 상단: hero 블록 / 하단: spec 계열 | FAQ Q&A 아님. 2존(다크히어로+라벨값테이블) — 기존 블록 조합으로 재현 가능 |
| faq_6 | `shipping-notice` + `cs-hours-contact` + `cs-contact-banner` | 기존 3블록 순서 조합으로 완전 재현 가능, 신규 패턴 없음 |
| faq_7 | `review-chat-bubbles` | 좌우 교차 말풍선 + 인라인 원형 아바타 — review-chat-bubbles와 구조 동일 |
| faq_9 | `faq-glyph-box` | Q./A. 글리프 + 카드-per-pair 구조가 정확히 일치 |
| faq_11 | `faq-plain` | 카드/아이콘/번호 없는 수직 Q&A 스택 — faq-plain 표준 패턴 |
| faq_12 | `faq-glyph-box` | Q. 글리프+답변 divider 구조 동일, 아바타+배지는 prop 추가로 흡수 |
| faq_13 | `faq-numbered` | 대형 서수 앵커 FAQ — faq-numbered에 `cardWrapper` boolean prop 추가로 커버 |
| faq_14 | `faq-numbered` | Q[n]. 번호 접두어 + 수평 구분선 + 들여쓰기 답변 — faq-numbered 스타일 변형 |
| faq_15 | `faq-plain` | Q. 글리프 인라인 + accent bold 요약 + 본문 2단 — faq-plain에 `aSummary` 필드 추가 |
| faq_16 | `review-chat-bubbles` | 민트 배경 교차 말풍선 — heroImage/emoji 옵셔널 생략 + bg 토큰 오버라이드로 재현 |
| faq_19 | `faq-plain` | 중앙 정렬 + accent 컬러 답변 — faq-plain에 `align=center` + `answerColor` 토큰 추가 |
| faq_22 | `review-chat-bubbles` | 별점 집계 배너 + 키워드 하이라이트 버블 — 기존 컴포넌트에 `scoreHero` + `highlight` prop 추가 |
| faq_23 | `review-chat-bubbles` | 3D 이모지 아바타 교차 말풍선 — 구조 동일, 아바타 타입 prop + 틸 바 슬롯만 추가 |

---

## 3. 집계 요약

| 구분 | 수 |
|------|-----|
| 총 감사 프레임 | 23 |
| distinct=true — 신규 FAQ 블록 | **6** |
| distinct=true — 비FAQ 신규 블록 | **2** |
| distinct=false — 기존 블록 흡수 | 15 |
| 기존 블록 prop 확장 필요 | 5종 (하단 P3 참조) |
| **순 추가 FAQ 블록 수** | **6** |
| **순 추가 비FAQ 블록 수** | **2** |

---

## 4. 재구성 착수 순서

복잡도 low → medium 순, 단일블록 우선.

### P0 — 즉시 착수 (low, isSingleBlock=true)

**1. `faq-circle-badge`** (faq_3)
- 솔리드 원형 Q 배지 + 전체 항목 공유 단일 카드. 토큰 6개, 구조 단순.
- 핵심 토큰: `--faq-badge-size`, `--faq-badge-bg`, `--faq-badge-color`, `--faq-question-color`, `--faq-answer-color`, `--faq-answer-indent`
- 구조: `section > h2 + div.faq-card(단일) > ul > li[span.badge + p.question + div.answer]`

**2. `faq-pill-card-split`** (faq_17)
- 다크 pill Q행 + 흰 카드 A행 2레이어. 구조 명확, 주황 Q./A. 글리프.
- 핵심 토큰: `--color-faq-q-bg(near-black)`, `--color-faq-a-bg(white)`, `--color-glyph(orange)`, `--radius-pill`
- 구조: `div.faq-item > div.faq-q-pill + div.faq-a-card` 반복

**3. `faq-dual-circle`** (faq_20)
- Q=틸 / A=네이비 듀얼 컬러 원형 배지. 카드 없음, 토큰 4개.
- 핵심 토큰: `--badge-q-bg(teal)`, `--badge-a-bg(navy)`, `--badge-size(48px)`, `--faq-pair-gap`
- 섹션 타이틀 두 톤: Q=틸 / &A=네이비 span 분리 구현

### P1 — 다음 착수 (medium, isSingleBlock=true)

**4. `faq-stagger-offset`** (faq_4)
- Q/A 분리 카드 스태거 배치. A 카드 `margin-left + max-width` 조합으로 우인덴트.
- 핵심 토큰: `--faq-q-card-radius`, `--faq-a-card-indent(~15-20% or 60px)`, `--faq-glyph-size`, `--faq-card-bg`
- trailing A 글리프는 A 카드 우측 절대 배치

**5. `faq-editorial-split`** (faq_10)
- 다크/라이트 수직 스플릿 + 이미지 블리드. CSS grid overlap 또는 `position:absolute`.
- 핵심 토큰: `--color-surface-dark`, `--color-surface-light`, `--text-glyph-size(clamp(5rem,15vw,10rem))`
- 이미지: Q패널 우측~A패널 전체 걸쳐 블리드. 좌측 마진에 수직 브랜드명 텍스트.

**6. `faq-satisfaction-bar`** (faq_18)
- 골드 그래디언트 fill 행 + 퍼센트 수치. `display:flex; justify-content:space-between`.
- 핵심 토큰: `--color-gold-dark(#8B6914)`, `--color-gold-light(#D4A843)`, `--color-hero-bg(#0d0d0d)`
- 행 구조: `flex row(gradient fill) + [문장 텍스트 | 대형 % 수치]`

### P2 — 비FAQ 계열 (별도 스프린트, spec·feature 카테고리 생성 후)

7. **`spec-table-label-value`** (faq_21) — 2열 CSS Grid(`7rem 1fr`), filled-black 배지 라벨, full-width hr 구분행
8. **`feature-radial-icon-list`** (faq_8) — 방사형 CSS absolute 배치 + hr-section 반복 구조

### P3 — 기존 블록 prop 확장 (신규 파일 불필요, 기존 컴포넌트 수정)

| 기존 블록 | 추가 prop / 필드 |
|----------|----------------|
| `faq-plain` | `align`, `answerColor`, `aSummary`, `showCategoryLabel` |
| `faq-glyph-box` | `avatarSrc`, `avatarBadgeLabel`, `avatarBadgeBg` |
| `faq-numbered` | `cardWrapper: boolean` |
| `review-chat-bubbles` | `scoreHero`, `highlightKeywords`, `hashtagBar` |
| `faq-box` | `showDivider`, `aLabelColor`, `surfaceBg` |

---

## 5. 토큰 네이밍 컨벤션 (신규 6종 공통)

기존 블록 토큰 패턴(`--faq-*`, `--color-*`, `--text-*`)을 그대로 따름.
픽셀 값 하드코딩 금지 — 모든 크기는 CSS spacing/type 토큰으로 추상화.

```
--faq-badge-size: 36px          → var(--space-9) 권장
--faq-item-gap: 28px            → var(--space-7)
--faq-answer-indent: calc(...)  → badge-size + 12px 수식 유지
--color-brand-primary           → 기존 토큰 참조, 새 값 추가 금지
```

라이선스 안전 원칙: Figma 원본 픽셀 수치 클론 금지 — 패턴(레이아웃 구조·색상 역할)만 추출하여 재구현.

---

*이 문서는 FAQ 23종 감사 JSON을 기반으로 생성된 분석 보고서입니다. 구현 전 각 프레임의 Figma 원본을 교차 검증하십시오.*
