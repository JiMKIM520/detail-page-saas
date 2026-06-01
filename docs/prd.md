# DetailAI — 상세페이지 자동화 SaaS PRD

> **버전**: v1.0
> **최종 수정**: 2026-04-06
> **상태**: 구현 준비 중

---

## 1. 프로젝트 개요

### 1.1 목적
기업이 제품 정보를 입력하고 실물 제품을 발송하면, 관리자가 누끼컷을 촬영 후 AI가 자동으로 고품질 상세페이지를 생성하는 B2B SaaS.

### 1.2 대상
- **타겟**: 200개 폐쇄형 기업 회원 (정부 지원 사업 하나은행 200개소)
- **기업당 제한**: 1회 생성 (`usage_limit = 1`)
- **카테고리**: 식품, 뷰티, 생활용품이 주요 비중이나 제한 없음 — 200개 기업의 카테고리는 매우 다양. PM 에이전트가 입력된 카테고리에 따라 동적 대응 필수.
  - 기존 프롬프트 보유: 식품, 뷰티, 전자제품, 패션, 생활용품, 건강기능식품, 반려동물
  - 미보유 카테고리: 가장 유사한 카테고리 프롬프트 활용 + 관리자 검토
- **플랫폼**: 스마트스토어, 쿠팡, 11번가, G마켓, 카카오쇼핑, 오늘의집, 무신사, 위메프, SSG가 주요 플랫폼이나 제한 없음 — 자사몰 및 기타 플랫폼 포함. PM 에이전트가 동적 대응 필수.
  - 미등록 플랫폼: 범용 스펙(860px, 스마트스토어 기준) 적용 + 관리자 안내

### 1.3 최종 산출물

**기업 납품물:**
- 전체 상세페이지 PNG (2x 레티나)
- 섹션별 PNG (플랫폼 업로드용)

**디자이너 수정 지원용:**
- 전체 상세페이지 PDF (디자이너가 수정할 때 사용)
- 레이어별 PNG (배경, 제품, 타이포 각각 분리)
- style-guide.json (브랜드 가이드 문서)
- HTML 원본 (텍스트 수정 가능)

**규격:** 가로 860px 고정, 세로 자유 (최소 10,000px)

### 1.4 프로젝트 핵심 원칙
- **결과물 퀄리티가 프로젝트 존폐 결정** — 퀄리티 미달 시 폐기
- **1건당 비용 10,000원 이내** — 프리미엄 모델 허용
- **템플릿 금지** — 제품마다 레퍼런스 기반 커스텀
- **이모지 아이콘 금지** — 프로 SVG 라이브러리 선별
- **레퍼런스 기반** — 핀터레스트/Behance 등에서 카테고리/제품별 검색
- **기업 자가 입력** — 관리자가 아닌 기업이 웹앱에서 직접 입력
- **영어 중심 프롬프트** — 페르소나/지시문 영어, 렌더링 텍스트만 한글

---

## 2. 기술 스택

### 2.1 인프라
- **프론트엔드**: Next.js 15 + TypeScript + Tailwind CSS
- **백엔드**: Next.js API Routes + Supabase (PostgreSQL/Auth/Storage)
- **배포**: Vercel
- **AI SDK**: `@google/genai` (Vertex AI 전환 대비 통일)

### 2.2 AI 모델
| 용도 | 모델 | 비고 |
|------|------|------|
| 스크립트/카피 생성 | `claude-sonnet-4-20250514` | JSON output, Max 4096 tokens |
| 이미지 생성 (메인) | `gemini-3-pro-image-preview` (Nano Banana Pro) | 4K, 예술적 품질 |
| 이미지 생성 (한글 타이포) | `gemini-3.1-flash-image-preview` (Nano Banana 2) | 한글 90%+, 참조 14장 |
| 이미지 생성 (Fallback) | `gemini-2.5-flash-image` (Standard) | Pro 모델 호출 실패 시 자동 재시도 (2K). 개발/테스트 비용 절감용. |
| QA/Validator | `claude-haiku-4-5` / `claude-sonnet-4` | 빠른 검증 |
| 영상 (후순위) | `veo-3.1-generate-preview` | Standard $0.40/초 |

### 2.3 인증 전략 (Vertex AI 전환 대비)
- **MVP 단계**: Google AI Studio API Key
- **프로덕션 단계**: Vertex AI (ADC + 서비스 계정)
- **코드**: `@google/genai` SDK가 양쪽 지원 — 인증 1줄만 변경

---

## 3. 6-에이전트 구조

### 3.1 아키텍처 개요

```
[Step 0] 🏢 기업 입력 (웹앱) + 실물 제품 발송
  ↓
[Step 0.3] 📷 관리자 누끼컷 촬영 + 시스템 업로드
  ↓
[Step 0.5] 👤 관리자 검수
  ↓
[Agent 1] 📋 PM (총괄 기획자)
  ↓
[Agent 2] 🎨 Art Director (디자인 방향 + 레퍼런스)
  ↓
[Agent 3] ⚙️ 실행 에이전트 6개 (병렬)
  ├─ 3-1. 🔲 아이콘 에이전트 (SVG 선별)
  ├─ 3-2. 📷 스타일링샷 에이전트 (Gemini Pro)
  ├─ 3-3. 🖼️ 레이어 이미지 에이전트 (Gemini Pro)
  ├─ 3-4. ✍️ Copy Writer (섹션 카피 튜닝)
  ├─ 3-5. 💻 HTML 에이전트 (레이아웃 조립)
  └─ 3-6. 📝 Script Writer (스크립트 생성)
  ↓
[Agent 4] ⚖️ QA (법적 검증)
  ↓
[Agent 5] ✅ Validator (디자인 통일성)
  ↓
[PM 판단] PASS → Playwright 캡처 / FAIL → 재작업
  ↓
[납품] 기업에게 최종 전달
```

### 3.2 각 에이전트 상세

#### Agent 1: PM (총괄 기획자) 📋
**역할**: 전체 파이프라인 오케스트레이션

**입력**: 관리자 승인된 기업 입력 정보 전체 (Section 7.2 참조)
- 기본 정보 (제품명, 카테고리, 플랫폼, 특장점, 타겟)
- 브랜드 아이덴티티 (로고, 컬러, URL)
- 디자인 선호도 (스타일 방향, 톤앤매너 키워드)
- 레퍼런스 (이미지, URL, 참고 설명)
- 필수 포함 사항 (인증, 필수 문구/이미지, 이벤트)
- 금지사항 (스타일, 표현, 경쟁사)
- 자료 (관리자 촬영 누끼컷, 기업 제공 제품 사진)

**작업**:
1. 요구사항 분석 → `project-brief.json` 생성
2. Art Director에게 작업 지시
3. 실행 에이전트 6개 병렬 오케스트레이션
4. QA + Validator 결과 검토
5. 재작업 의사결정 (MAX 3회)
6. 최종 리포트 생성

**출력**: `project-brief.json`, `final-report.md`

**모델**: Claude Sonnet 4

---

#### Agent 2: Art Director (디자인 방향) 🎨
**역할**: 레퍼런스 기반 엄격한 스타일 가이드 작성

**입력**: `project-brief.json`, 누끼컷, 스크립트

**작업**:
1. 기업 업로드 레퍼런스 확인 (있으면 최우선 활용)
2. 기업 입력 기반으로 웹 검색 레퍼런스 추가 수집 (필수 — 유사 스타일 보강)
3. 기업 스타일 방향/톤앤매너 키워드 반영
4. 브랜드 컬러/로고 분석
5. 기업 홈페이지/기존 페이지 톤 분석
6. 금지사항 제약 확인
7. 수집된 레퍼런스 시각 분석 → 디자인 DNA 추출
8. 두 개의 JSON 계약서 생성

> ※ 웹 검색은 "보조"가 아님 — 기업 레퍼런스를 기반으로 비슷한 스타일을 추가 수집하는 필수 단계.

**출력 1**: `style-guide.json`
```json
{
  "brand": { "name", "moodKeywords", "targetEmotion" },
  "colors": { "primary", "secondary", "surface1/2/3", "text*", "accent" },
  "typography": { "headlineFont", "bodyFont", "sizes", "weights", "letterSpacing" },
  "icons": { "library", "weight", "size", "primaryColor", "useCases" },
  "decorativeElements": { "dividerStyle", "cornerRadius", "shadows" },
  "layoutPatterns": [7개 섹션 레이아웃],
  "sectionRhythm": "impact → info → impact → info ..."
}
```

**출력 2**: `styling-shots-prompts.json` (제품별 동적 생성)
```json
{
  "shots": [
    {
      "name": "closeup_texture",
      "composition": "45-degree close-up macro",
      "surface": "dark walnut cutting board",
      "props": ["fleur de sel jar", "rosemary", "linen napkin"],
      "lighting": "warm morning window light from camera-left",
      "camera": "Canon 5D Mark IV, 85mm f/2.8 macro",
      "mood": "warm home bakery atmosphere"
    }
  ]
}
```

**핵심**: 이 두 JSON은 **계약서**다. 실행 에이전트들은 이 값만 사용 가능.

**모델**: Claude Opus 4 (깊은 분석)

---

#### Agent 3: 실행 에이전트 6개 (병렬) ⚙️

**3-1. 아이콘 에이전트** 🔲
- 입력: `style-guide.json`의 icons 섹션
- 작업: 지정된 라이브러리에서 `useCases` 매핑대로 SVG 선별/다운로드
- 출력: `icons/*.svg` (5~7개)
- 모델: 로컬 스크립트 (API 불필요)
- **라이브러리 매핑 (카테고리별)**:
  - 식품/수제/감성 → Phosphor duotone
  - 프리미엄/미니멀 → Lucide
  - 테크/전문 → Tabler
  - 친근/귀여움 → Iconoir

**3-2. 스타일링샷 에이전트** 📷
- 입력: `styling-shots-prompts.json` + 누끼컷
- 작업: 제품별 동적 프롬프트로 Gemini Pro 4K 호출 (4장)
- 출력: `styling_shots/*.png` (5056×3376)
- 모델: `gemini-3-pro-image-preview`
- **카테고리별 촬영 가이드 자산 재활용**: `lib/ai/prompts/categories/*.ts`
- **제품 보존 규칙 필수**: "Subject 유지 + 배경만 재생성", "제품 변형 금지"
- **AI 느낌 감소 기법**:
  - 카메라 렌즈 용어 (`Canon 5D Mark IV, 85mm f/2.8`)
  - 필름 그레인 (`Kodak Portra 400 film grain`)
  - 의도적 불완전함 (`slight crumbs, wrinkled napkin`)
  - 금지 단어 (`perfect`, `clean`, `symmetrical`, `4K`, `hyperrealistic`)
- **스튜디오 배경만** — 카페/주방 등 실제 장소 배경 금지

**3-3. 레이어 이미지 에이전트** 🖼️
- 입력: `style-guide.json` + 스타일링샷
- 작업 (2단계 B방식):
  - Step 1: 배경+제품 이미지 (텍스트 없이)
  - Step 2: 같은 이미지에 Gemini가 한글 타이포 직접 추가
- 출력:
  - `layers/hero_with_typo.png` (히어로 완성본)
  - `layers/story_background.png` (브랜드 스토리)
  - `layers/break_image.png` (시각적 브레이크)
- 모델: `gemini-3-pro-image-preview`

**3-4. Copy Writer 에이전트** ✍️
- 입력: 스크립트 + `style-guide.json`의 layoutPatterns
- 작업: 섹션별 마이크로 카피 튜닝 (섹션 라벨, 헤드라인, 보조 설명)
- 출력: `refined-copy.json`
- 모델: Claude Sonnet 4

**3-5. HTML 에이전트** 💻
- 입력: 스타일 가이드 + refined-copy + 아이콘 SVG + 레이어 이미지
- 작업:
  - 7개 레이아웃 패턴을 섹션에 매핑
  - 스타일 가이드의 colors/typography/shadows 엄격 적용
  - 섹션 배경에 Gemini 생성 텍스처 이미지 합성
- 출력: `detail_page.html`
- 모델: Claude Sonnet 4

**3-6. Script Writer 에이전트** 📝
- 입력: 기업 입력 정보 + 카테고리×플랫폼 분화 프롬프트
- 작업:
  - `buildDifferentiatedSystemPrompt` 활용 (기존 자산)
  - 카테고리별 `forbiddenExpressions` 준수
  - 감정:정보 비율 적용 (식품 70:30 ~ 전자제품 30:70)
- 출력: `script.json`
- 모델: Claude Sonnet 4 + Vision
- **기존 자산 재활용**:
  - `lib/ai/prompts/builder.ts`
  - `lib/ai/prompts/categories/*.ts`
  - `lib/ai/prompts/platforms/*.ts`
  - `lib/ai/prompts/compatibility.ts`
  - `lib/ai/prompts/design-guide.ts`

---

#### Agent 4: QA (법적 검증 + 필수 포함 검증) ⚖️
- 입력: 스크립트 + 최종 HTML + `project-brief.json` (기업 요청사항)
- 검증:
  - 카테고리별 법적 금지 표현
  - 인증 마크/필수 고지사항
  - **기업이 요청한 필수 포함 사항** (필수 문구, 필수 이미지, 인증 이미지) — 빠졌으면 FAIL
  - **기업 금지사항** (금지 표현/경쟁사 언급) — 있으면 FAIL
- 출력: `compliance-report.json`
- 모델: Claude Haiku 4.5 (빠른 검증)
- **기존 자산 재활용**: `categories/*.ts`의 `forbiddenExpressions`

---

#### Agent 5: Validator (디자인 통일성) ✅
- 입력: 스타일 가이드 + 모든 에이전트 산출물
- 검증 항목:
  1. 모든 아이콘이 같은 라이브러리/weight
  2. 사용된 색상이 팔레트 내
  3. 모든 폰트가 fontPair 내
  4. 섹션 레이아웃이 sectionRhythm 순서
  5. 이모지/플레이스홀더 없음
  6. Gemini 섹션과 HTML 섹션 톤 일치
- 출력: `validation-report.json`
- 실패 시: PM에게 에스컬레이션
- 모델: Claude Sonnet 4

---

### 3.3 중간 검수 포인트

```
1. Script Writer 완료 후 → 관리자에게 스크립트 검수 알림
   - 관리자 승인 → 다음 단계 진행
   - 관리자 수정 요청 → Script Writer 재실행
   - 관리자가 직접 수정 → 수정된 스크립트로 다음 단계
2. Art Director 완료 후 → 자동 진행 (관리자가 원하면 중간 확인 가능)
3. 최종 산출물 → 관리자 검수 필수
```

### 3.4 PM 재작업 의사결정 로직

```
IF Validator FAIL:
  - 실패 원인 분석
  - 원인 에이전트 식별
  - 구체적 피드백 작성
  - 해당 에이전트만 재실행
  - MAX 3회 재시도 → 초과 시 관리자 에스컬레이션

IF QA FAIL:
  - Copy Writer에게 수정 요청
  - 재QA → 재Validator → 재HTML

IF 모두 PASS:
  - Playwright 캡처 (2x 레티나)
  - PDF 생성
  - 최종 리포트 작성
```

---

## 4. 프롬프트 & 페르소나 언어 원칙

### 4.1 언어 매트릭스
| 항목 | 언어 | 이유 |
|------|------|------|
| 페르소나 (역할/경력) | **영어** | LLM 역할 정의 정확도 |
| 지시문 (촬영/구도/색감) | **영어** | 학습 데이터 대부분 영어 |
| 이미지 렌더링 텍스트 | **한글** | 실제 카피 |
| 브랜드/제품 고유명사 | 원어 유지 | 브랜드명, 제품명 (카테고리 불문) |
| 한국 법규/플랫폼 | 영어+한글 병기 | 카테고리별 관련 법규, "SmartStore (스마트스토어)" |
| 클라이언트 UI | 한국어 | 사용자 인터페이스 |
| 출력물 카피 | 한국어 명시 | "Output in Korean" 필수 |

### 4.2 페르소나 작성 예시 (식품/베이커리 카테고리 기준)
```
You are a senior Korean ecommerce detail page strategist with 10+ 
years of experience in SmartStore (스마트스토어) and Coupang (쿠팡) 
platforms. Your expertise includes:
- Korean food category (식품) regulations (식품표시광고법 제8조)
- Warm editorial storytelling for artisan bakery brands
- Premium product positioning for Korean consumers 30-40s

Output language: Korean for all deliverables.
```

### 4.3 프롬프트 작성 예시
```
Create a warm bakery hero image with serif typography.
Korean text to render: '아빠가 딸에게 먹이는 빵'.
Brand: 고메코나 베이커리 (Gomecona Bakery).
Camera: Canon 5D Mark IV, 85mm f/2.8 macro.
Lighting: warm morning window light from camera-left.
Shallow depth of field, soft bokeh background.
Style: Kodak Portra 400 film grain, asymmetric composition.
```

---

## 5. 스크립트 구조 (Script Writer 에이전트 상세)

### 5.1 시스템 프롬프트 5개 레이어
`buildDifferentiatedSystemPrompt`로 자동 조합:

| 레이어 | 소스 | 내용 |
|-------|------|------|
| 1. 카테고리 | `categories/{slug}.ts` | legalRules, forbiddenExpressions, requiredSections, tone, shootingGuide |
| 2. 플랫폼 | `platforms/{slug}.ts` | imageSpecs, targetAudience, layoutRules, conversionTips |
| 3. 궁합 | `compatibility.ts` | 카테고리×플랫폼 적합도 (◎/○/△/×) |
| 4. 전략팁 | `compatibility.ts` | 63개 조합별 전략 (18개 누락 — 식품 외 확장 시 보완) |
| 5. 디자인 가이드 | `design-guide.ts` | 카피 품질 기준 + 촬영 가이드 |

### 5.2 출력 JSON 스키마
```json
{
  "sections": [
    {
      "type": "hero|benefits|features|how_to_use|social_proof|comparison|cta",
      "title": "헤드라인 (최대 15자)",
      "subtitle": "서브 카피",
      "items": [{"title": "...", "description": "..."}],
      "steps": ["..."],
      "text": "...",
      "image_description": "이미지 연출 가이드"
    }
  ],
  "shooting_requirements": {
    "nukki_shots": ["정면 누끼", "45도 누끼"],
    "styling_shots": ["장면 1 설명", "장면 2 설명"],
    "additional_notes": "특수 촬영 조건"
  },
  "tone": "톤앤매너 설명",
  "color_suggestion": "#HEX — 컬러 설명",
  "key_insights": "핵심 인사이트"
}
```

### 5.3 카테고리별 감정:정보 비율
| 카테고리 | 감성 | 정보 | 출처 |
|---------|------|------|------|
| 식품 | 70% | 30% | `design-guide.ts` 확정 |
| 뷰티 | 60% | 40% | `design-guide.ts` 확정 |
| 생활용품 | 50% | 50% | `design-guide.ts` 확정 |
| 전자제품 | 30% | 70% | `design-guide.ts` 확정 |
| 건강기능식품 | 20% | 80% | 카테고리 특성 추정 (확장 시 검증) |
| 패션 | 65% | 35% | 카테고리 특성 추정 (확장 시 검증) |
| 반려동물 | 60% | 40% | 카테고리 특성 추정 (확장 시 검증) |

---

## 6. 디자인 시스템 규칙

### 6.1 사이즈 (고정)
| 항목 | 값 |
|------|-----|
| 가로 | **860px 고정** (스마트스토어 권장 860px 기준. 900px는 일부 플랫폼에서 스케일다운 가능성) |
| 세로 | 최소 10,000px (충분히 긴 스크롤) |
| 이미지:텍스트 비율 | 7:3 |
| 모바일 텍스트 최소 | 18px |
| 풀블리드 이미지 | 860px 꽉 채움 (좌우 여백 0) |
| 섹션 상하 패딩 | 60~100px 변화 (리듬감) |
| 콘텐츠 좌우 패딩 | 48px |

### 6.2 레이아웃 패턴 7종 (Art Director 선택)

> **목적**: Art Director가 `style-guide.json`의 `layoutPatterns` 필드에 섹션별 패턴을 선택·기록하면, HTML 에이전트는 이 선택만 참조하여 구현한다 — 에이전트 간 계약서 역할. 7종 중 조합·순서로 제품마다 다른 리듬감을 만든다.

1. **full-bleed-hero** — 히어로 섹션
2. **left-image-right-text** — 제품 디테일 1
3. **right-image-left-text** — 제품 디테일 2
4. **full-bleed-sensory** — 시각적 브레이크
5. **dark-story-centered** — 브랜드 스토리
6. **numbered-steps-horizontal** — 사용법
7. **grid-info-cards** — 배송/인증 정보

### 6.3 섹션 배경색 교차 원칙
- 선 구분선 금지, 배경색 교차로만 구분
- 패턴: 흰색 → 크림 → 흰색 → 브라운(다크) → 크림 → 흰색

### 6.4 금지사항
- 와이어프레임/스케치/목업 느낌
- 섹션 라벨 뱃지 ("히어로", "SECTION 1")
- 플레이스홀더 텍스트
- 균일한 기계적 여백
- 흰 배경에 텍스트만 나열
- UI 크롬 (상태바, 네비게이션)
- 영문 Lorem ipsum
- **이모지 아이콘 (절대 금지)**

---

## 7. 웹앱 플로우

### 7.1 기업 사용자 플로우
```
1. 로그인 (폐쇄형 200개 계정)
   ↓
2. 상세페이지 신청 (1회 제한)
   ↓
3. 정보 입력 (멀티 스텝 폼)
   ↓
4. 제출
   ↓
5. 진행 상황 확인 (대시보드)
   ↓
6. 결과물 확인 (PDF + PNG)
   ↓
7. 코멘트 입력 (수정 요청)
   ↓
8. 관리자 검토 → 에이전트 재실행 or 관리자 직접 수정
   ↓
9. 관리자가 이메일로 최종 납품
```

**수정 요청 상세 플로우:**
```
1. 기업이 결과물 확인
2. 코멘트 입력 (텍스트 + 이미지 첨부 가능)
   - "이 부분 텍스트 수정해주세요"
   - "이 이미지 교체해주세요"
   - "전체적으로 톤을 더 밝게"
3. 관리자가 코멘트 검토 → 판단:
   a. 에이전트 재실행이 적절 → 해당 에이전트만 재실행
   b. 관리자가 직접 수정하는 게 빠름 → 관리자 직접 수정
4. 수정본 완성
5. 관리자가 이메일로 최종 납품
```

### 7.2 기업 입력 필드 (상세)

**[Step 1. 기본 정보]**
- 제품명 (필수)
- 카테고리 (필수, 7개 중 선택 + 기타)
  - **기타 선택 시**: 직접 입력 → 가장 유사한 카테고리 프롬프트 사용 + 관리자 수동 검토 필수
- 플랫폼 (필수, 9개 중 선택 + 기타)
  - **기타/자사몰 선택 시**: 직접 입력 → 범용 스펙(860px, 스마트스토어 기준 레이아웃) 적용
  - ※ 카테고리·플랫폼 "기타" 선택 시 관리자에게 알림 발송, 파이프라인 시작 전 확인 필요
- 제품 특장점 (필수, 자유 입력)
- 타겟 고객층 (필수)

**[Step 2. 브랜드 아이덴티티]**
- 브랜드 로고 업로드 (선택, 있으면)
- 브랜드 컬러 HEX (선택, 있으면, 없으면 AI 자동 추천)
- 기존 홈페이지 URL (선택, 톤 분석용)
- 기존 SNS URL (선택)
- 기존 상세페이지 URL (선택)

**[Step 3. 디자인 선호도]**
- **스타일 방향** (필수, 다중 선택 가능):
  - ☐ 감성 편집형 (매거진 스타일)
  - ☐ 미니멀 럭셔리
  - ☐ 친근 캐주얼
  - ☐ 트렌디 모던
  - ☐ 전통 한국적
  - ☐ 프리미엄 클래식
  - ☐ 기타 (직접 입력)
- **톤앤매너 키워드** (3~5개 선택 또는 자유 입력)
  - 예: "따뜻한, 진솔한, 수제의, 가족적인"

**[Step 4. 레퍼런스]** (중요)
- 좋아하는 상세페이지 이미지 업로드 (3~5장, 선택이지만 권장)
- 레퍼런스 URL 링크 (선택)
  - ⚠️ **URL 접근 실패 시**: Art Director가 크롤링 실패 감지 → 관리자에게 알림 발송 → 관리자가 기업에게 해당 URL 캡처 이미지 업로드 요청 → 기업 재업로드 후 파이프라인 진행
- 참고 설명: "이런 느낌으로 만들어 주세요" (자유 입력)

**[Step 5. 포함 희망 사항]** (선택, 단 강력 권장)

> HACCP 인증, 수상 이력, 방송 출연 등 신뢰 자산이 있다면 반드시 입력하세요 — 빠지면 경쟁력이 떨어집니다.

- **인증/자격 증빙 업로드** (선택):
  - HACCP, KC, GMP, 특허 등 인증 이미지
  - 수상 이력
  - 방송 출연 이력
- **포함 희망 콘텐츠** (선택):
  - "꼭 들어갔으면 하는 문구" (자유 입력)
  - "꼭 포함하고 싶은 이미지" (업로드)
  - 이벤트/프로모션 정보
- **법적 고지** (선택): 추가로 넣고 싶은 고지사항

**[Step 6. 금지사항]**
- 피해야 할 스타일/컬러 (자유 입력)
- 피해야 할 표현/단어
- 경쟁사 언급 금지 등

**[Step 7. 자료 업로드]**
- 제품 사진 업로드 (선택, 스타일링샷 참고용)
- 기업 자체 촬영 사진 (선택)
- ※ 누끼컷은 기업이 실물 제품을 발송하면 관리자가 직접 촬영 후 업로드

---

### 7.3 Art Director 입력 활용 우선순위

Art Director가 스타일 가이드를 만들 때 기업 입력을 다음 순서로 활용:

```
1순위: 기업 업로드 레퍼런스 (기업 의도 최우선)
2순위: 선택한 스타일 방향 + 톤앤매너 키워드
3순위: 브랜드 컬러/로고 (브랜드 일관성)
4순위: 기업 홈페이지/기존 페이지 톤 분석
5순위: 금지사항 (제약)
6순위: Pinterest/Behance 자동 검색 (1~5가 부족할 때만 보조)
```

---

### 7.4 필수 포함 사항 처리 로직

**Script Writer 에이전트 (Agent 3-6)**
- 기업 입력의 "필수 포함 문구"를 스크립트 섹션에 통합
- 섹션 순서 조정 (예: 인증 섹션을 상단으로)

**HTML 에이전트 (Agent 3-5)**
- 인증 이미지를 지정된 섹션에 배치 (예: 신뢰 섹션)
- 필수 포함 이미지를 자연스러운 위치에 배치

**QA 에이전트 (Agent 4)**
- 필수 포함 사항이 빠졌는지 검증
- 금지 표현/경쟁사 언급 체크
- **실패 시 재작업 필수**

**Validator 에이전트 (Agent 5)**
- 금지 스타일/컬러가 사용됐는지 확인
- 기업 요청사항이 반영됐는지 확인

### 7.5 진행 상황 알림

**관리자 알림** (웹앱 대시보드):
- 실시간 파이프라인 상태 표시 (진행률 %)
- 스크립트 검수 요청 알림
- 최종 산출물 완료 알림
- QA/Validator 실패 알림

**기업 알림** (최소한):
- 1차 결과물 완료 시 알림 1회 (이메일 or 웹앱)
- 최종 결과물은 관리자가 직접 이메일로 발송

**예상 소요 시간:**
- 자동 생성: 5~10분
- 스크립트 관리자 검수 포함: 1~2일
- 수정 요청 반영: 관리자 판단에 따라

---

### 7.6 관리자(기획자) 플로우
```
1. 신청 목록 확인
   ↓
2. 기업 입력 정보 검수:
   - 입력 정보 충분성
   - 부족한 정보 보완 요청 (기업에게 재요청)
   ↓
3. 기업으로부터 실물 제품 수령 → 누끼컷 촬영 → 시스템 업로드
   ↓
4. 승인 → 6-에이전트 파이프라인 시작
   ↓
5. 중간 검수 (Script, Style Guide 완료 시점)
   ↓
6. 최종 산출물 검수
   ↓
7. 기업에게 납품
```

---

## 8. 데이터 모델 (Supabase)

### 8.1 주요 테이블

```sql
-- 프로젝트 (확장)
projects (
  id uuid primary key,
  company_id uuid references companies(id),
  -- 기본 정보
  product_name text,
  category text,
  platform text,
  product_highlights text,
  target_audience text,
  -- 브랜드 아이덴티티
  brand_identity jsonb, -- { logo_url, brand_colors: ["#..."], homepage_url, sns_url, existing_detail_url }
  -- 디자인 선호도
  style_preferences jsonb, -- { style_directions: [], tone_keywords: [], custom_description }
  -- 필수 포함/금지
  required_content jsonb, -- { required_phrases: [], required_images: [], certifications: [], events: [], legal_notices }
  restrictions jsonb, -- { forbidden_styles, forbidden_colors, forbidden_words, competitor_restrictions }
  -- 레퍼런스
  reference_urls text[],
  reference_description text,
  -- 상태 관리
  status text, -- intake_submitted | planner_review | script_review | design_generating | design_review | delivered
  usage_limit int default 1,
  created_at timestamptz
)

-- 기업 입력 파일 (file_type 확장)
intake_files (
  id uuid primary key,
  project_id uuid references projects(id),
  file_type text, -- product_photo | detail_capture | reference | brand_logo | certification | required_image
  storage_path text,
  mime_type text,
  metadata jsonb, -- 인증 종류, 설명 등
  created_at timestamptz
)

-- 스크립트
scripts (
  id uuid primary key,
  project_id uuid references projects(id),
  content jsonb, -- 5.2 JSON 스키마
  planner_status text, -- pending | approved | revision_requested
  version int,
  created_at timestamptz
)

-- 스타일 가이드 (Art Director 출력)
style_guides (
  id uuid primary key,
  project_id uuid references projects(id),
  style_guide jsonb, -- 3.2 style-guide.json
  styling_prompts jsonb, -- 3.2 styling-shots-prompts.json
  created_at timestamptz
)

-- 디자인 산출물
designs (
  id uuid primary key,
  project_id uuid references projects(id),
  preview_url text,
  preview_pdf_url text,
  section_images jsonb, -- [{type, url}, ...]
  designer_status text, -- pending | approved | revision_requested
  version int,
  created_at timestamptz
)
```

### 8.2 Storage 버킷
- `intake-files`: 기업 업로드 파일 + 관리자 촬영 누끼컷 (모든 기업 제공 자료)
- `designs`: AI 생성 산출물 (이미지, PDF, 스타일 가이드)

### 8.3 파일 업로드 아키텍처

**기업당 예상 파일 규모:**
| 파일 종류 | 수량 | 예상 크기 |
|-----------|------|----------|
| 제품 사진 (기업 업로드) | 0~10장 | ~30MB |
| 레퍼런스 이미지 | 0~5장 | ~5MB |
| 인증서/로고 | 0~5장 | ~5MB |
| 누끼컷 (관리자 촬영) | 3~5장 | ~15MB |
| **기업당 합계** | | **~55MB 이하** |

**200기업 총 규모**: ~11GB → Supabase Storage 비용 ~$0.23/월 (용량 문제 없음)

**핵심 설계:**
- **모든 파일 Supabase Storage**: Vercel API Route(4.5MB 제한) 경유 없이 pre-signed URL로 클라이언트 직접 업로드
- **관리자 다운로드**: 관리자 대시보드에서 기업별 업로드 파일 전체 다운로드 가능
  - Supabase RLS: 관리자 role은 `intake-files` 버킷 전체 읽기 허용
  - 관리자 UI: 파일 목록 + 개별 다운로드 버튼
- **이미지 최적화**: 업로드 후 sharp로 작업용 리사이즈본 생성 (원본 별도 보존)
- **허용 MIME**: `image/png`, `image/jpeg`, `image/webp`, `application/pdf`
- **단건 크기 제한**: 없음 (단, 100MB 이상은 업로드 전 압축 권장 안내)

---

## 9. 비용 모델

### 9.1 건당 비용 (6-에이전트, 공식 가격 기준)

| 에이전트 | 모델 | 호출 | 비용 |
|---------|------|------|------|
| PM (project-brief + 오케스트레이션) | Claude Sonnet | 2회 | ~$0.05 |
| Art Director | Claude Opus | 1회 | ~$0.15 |
| Script Writer | Claude Sonnet | 1회 | ~$0.07 |
| 아이콘 에이전트 | 로컬 | 0 | $0 |
| 스타일링샷 (Gemini Pro 4K) | Gemini | 4회 | ~$0.96 |
| 레이어 이미지 (Gemini Pro 4K) | Gemini | 3~4회 | ~$0.72~0.96 |
| Copy Writer | Claude Sonnet | 1회 | ~$0.03 |
| HTML 에이전트 | Claude Sonnet | 1회 | ~$0.05 |
| QA | Claude Haiku | 1회 | ~$0.01 |
| Validator | Claude Sonnet | 1회 | ~$0.03 |
| PM 최종 리포트 | Claude Sonnet | 1회 | ~$0.02 |
| Playwright | 로컬 | 0 | $0 |
| **합계** | | | **~$2.09~2.33** |

**한화 환산**: 약 2,850~3,200원/건
**예산 대비**: 10,000원의 28~32%
**재작업 1회 포함**: 약 5,000원 이내

### 9.2 공식 가격 참조 (2026-04)
| 모델 | 가격 |
|------|------|
| Gemini 3 Pro Image (1K/2K) | $0.134/장 |
| Gemini 3 Pro Image (4K) | $0.24/장 |
| Gemini 3.1 Flash Image (4K) | $0.151/장 |
| 참조 이미지 입력 (HIGH) | $0.00224/장 |
| Veo 3.1 Standard | $0.40/초 |
| Veo 3.1 Fast | $0.15/초 |
| Claude Sonnet 4 (입력/출력) | $3/$15 per 1M tokens |

---

## 10. 구현 순서

### Phase 1: 6-에이전트 프로토타입 (2-3일)
1. Art Director 에이전트 구현
2. 스타일링샷 에이전트 (동적 프롬프트)
3. 아이콘 에이전트 (Phosphor 선별)
4. 레이어 이미지 에이전트 (2단계 B방식)
5. Copy Writer 에이전트
6. HTML 에이전트 (7개 레이아웃)
7. QA 에이전트 (기존 forbiddenExpressions 활용)
8. Validator 에이전트
9. PM 오케스트레이터

### Phase 2: 고메코나 테스트 (1일)
- 고메코나 소금빵으로 전체 파이프라인 실행
- 클라이언트 검토
- 피드백 반영

### Phase 3: 카테고리 확장 (3-5일)
- 다른 식품 1-2개 (베이커리 외)
- 뷰티 1개
- 전자제품 1개

### Phase 4: 웹앱 통합 (5-7일)
- 기업 입력 UI
- 관리자 검수 UI
- 진행 상황 대시보드
- 결과물 뷰어 + 코멘트
- Supabase 통합

### Phase 5: 배포 (2-3일)
- Vercel 배포
- Vercel 300s 타임아웃 대응 (Task 분리)
- Supabase RLS 정책 검증
- 이미지 보호 (우클릭/드래그 차단)

---

## 11. 산출물 파일 구조

```
output/{project_id}/
  ├─ project-brief.json          (PM)
  ├─ style-guide.json            (Art Director)
  ├─ styling-shots-prompts.json  (Art Director)
  ├─ script.json                 (Script Writer)
  ├─ refined-copy.json           (Copy Writer)
  ├─ compliance-report.json      (QA)
  ├─ validation-report.json      (Validator)
  ├─ final-report.md             (PM)
  ├─ 1_script/
  │   └─ script.md
  ├─ 2_styling_shots/
  │   ├─ styling_01_closeup.png
  │   ├─ styling_02_overhead.png
  │   ├─ styling_03_hand.png
  │   └─ styling_04_studio.png
  ├─ 3_layers/
  │   ├─ hero_with_typo.png
  │   ├─ story_background.png
  │   └─ break_image.png
  ├─ icons/
  │   └─ *.svg
  └─ 4_final/
      ├─ detail_page.html
      ├─ detail_page.png
      └─ detail_page.pdf
```

---

## 12. Quality Rubric (평가 기준)

평가자가 1-5점 채점. **3점 미만 항목 하나라도 있으면 통과 불가.**

| 기준 | 가중치 | 평가 내용 |
|------|--------|----------|
| **기능 정확성** | 35% | 요구사항 동작 (로그인, 결과물 확인, 코멘트, 1회 제한) |
| **UI/UX 품질** | 25% | 일관된 디자인, 반응형, 접근성. 템플릿 느낌 금지. |
| **보안** | 20% | 폐쇄형 인증, 이미지 보호, 데이터 격리 |
| **코드 품질** | 20% | 타입 안전성, 에러 처리, 중복 제거 |

### 디자인 품질 세부 기준
- 이모지 아이콘 0개 (있으면 실패)
- 모든 아이콘 같은 라이브러리/weight
- 색상이 스타일 가이드 팔레트 내
- 폰트가 fontPair 내
- 섹션 레이아웃이 서로 다름 (리듬감)
- Gemini 섹션과 HTML 섹션 톤 일치
- 사용자 육안: "프로 디자이너가 만든 것" 판단

---

## 13. 제약 사항

- 폐쇄형 200개소 한정 — 공개 가입 기능 절대 금지
- 기업당 1회 제한 (`usage_limit = 1`)
- 배포 전 auto-deploy 비활성화 필수 (Vercel ignoreCommand)
- Notion 작업 로그 기록 필수
- 카테고리×플랫폼 조합별 프롬프트 분화 필수
- 이미지 보호 (우클릭/드래그/개발자도구 차단)

---

## 14. 알려진 이슈 & 보류 사항

| 이슈 | 상태 | 해결 시점 |
|------|------|----------|
| Vercel 300s 타임아웃 | 미적용 | 웹앱 배포 시 |
| CROSS_STRATEGY_TIPS 18개 누락 | 보류 | 식품 외 카테고리 확장 시 |
| 패션 모델 착용샷 (personGeneration 제약) | 보류 | 패션 카테고리 확장 시 |
| 영상 생성 (Veo) | 후순위 | 이미지 파이프라인 완성 후 |

---

## 15. 다음 단계

**즉시 실행:**
1. 기존 한글 페르소나/프롬프트를 영어로 재작성
2. Art Director 에이전트 구현 (고메코나 테스트)
3. 6-에이전트 프로토타입 완성
4. 클라이언트 검토

**참고 문서:**
- 의사결정 기록: `docs/decisions.md`
- 실험 히스토리: `docs/history/`
- 기존 자산: `lib/ai/prompts/` (categories, platforms, compatibility, design-guide, builder)
