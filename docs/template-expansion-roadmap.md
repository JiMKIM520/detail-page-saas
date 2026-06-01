# DetailAI 템플릿 확장 로드맵

> 작성일: 2026-06-01  
> 대상: `agents/templates/` 디렉터리 및 파이프라인 연동  
> 목적: 현재 템플릿 인벤토리 분석 → 공백 카테고리 식별 → 단계적 확장 계획

---

## 1. 현황 인벤토리

### 1-1. 앱 지원 카테고리 전체 목록

`lib/ai/prompts/categories/index.ts`의 `CATEGORIES` 맵 기준으로 앱이 지원하는 카테고리는 **7개**입니다.

| 슬러그 | 한국어명 |
|--------|---------|
| `food` | 식품 |
| `health-food` | 건강기능식품 |
| `beauty` | 뷰티 |
| `fashion` | 패션 |
| `living` | 리빙/홈인테리어 |
| `electronics` | 전자제품 |
| `pet` | 반려동물 |

### 1-2. 현재 템플릿 등록 현황

`agents/templates/index.ts`는 food / beauty / electronics 3개 파일만 임포트합니다.

#### food (11개)

| ID | 이름 | 비주얼 톤 | 색상 계열 |
|----|------|----------|---------|
| `food_natural_01` | 자연주의/유기농 | natural | warm-cream |
| `food_premium_02` | 프리미엄 구르메 | premium | dark-luxury |
| `food_handmade_03` | 수제/홈메이드 | warm | earth |
| `food_health_04` | 건강기능식품 | minimal | clean-white |
| `food_traditional_05` | 전통/한식 | warm | earth |
| `food_minimal_06` | 미니멀 브랜드 | minimal | clean-white |
| `food_fresh_07` | 신선식품 | natural | fresh-green |
| `food_gift_08` | 선물세트/명절 | premium | warm-cream |
| `food_trendy_09` | 트렌디/인스타감성 | bold | vibrant |
| `food_story_10` | 브랜드 스토리 중심 | editorial | earth |
| `food_matcha_ref01` | 자연주의 말차 프리미엄형 *(레퍼런스 추출)* | natural | fresh-green |

#### beauty (10개)

| ID | 이름 | 비주얼 톤 | 색상 계열 |
|----|------|----------|---------|
| `beauty_skincare_01` | 스킨케어/기초화장품 | minimal | clean-white |
| `beauty_luxury_02` | 럭셔리/프리미엄 뷰티 | premium | dark-luxury |
| `beauty_natural_03` | 자연/비건 뷰티 | natural | warm-cream |
| `beauty_color_04` | 색조화장품 | bold | vibrant |
| `beauty_antiaging_05` | 안티에이징/기능성 | minimal | clean-white |
| `beauty_korean_06` | K-뷰티/트렌드 | bold | soft-pink |
| `beauty_haircare_07` | 헤어케어 | natural | warm-cream |
| `beauty_mens_08` | 남성 그루밍 | premium | dark-luxury |
| `beauty_bodycare_09` | 바디케어/향수 | warm | earth |
| `beauty_story_10` | 뷰티 브랜드 스토리 | editorial | warm-cream |

#### electronics (10개)

| ID | 이름 | 비주얼 톤 | 색상 계열 |
|----|------|----------|---------|
| `electronics_flagship_01` | 플래그십/프리미엄 가전 | premium | dark-luxury |
| `electronics_lifestyle_02` | 라이프스타일 전자제품 | minimal | clean-white |
| `electronics_audio_03` | 오디오/사운드 기기 | premium | midnight-blue |
| `electronics_health_04` | 헬스케어/웨어러블 | minimal | clean-white |
| `electronics_smarthome_05` | 스마트홈/IoT | minimal | midnight-blue |
| `electronics_gaming_06` | 게이밍 기기 | bold | dark-luxury |
| `electronics_kitchen_07` | 주방/생활가전 | warm | warm-cream |
| `electronics_computer_08` | 컴퓨터/노트북 | minimal | clean-white |
| `electronics_camera_09` | 카메라/촬영 장비 | editorial | earth |
| `electronics_electronics_eco_10` | 친환경/에너지 절약 가전 | natural | fresh-green |

#### 요약

| 카테고리 | 템플릿 수 | 상태 |
|---------|----------|------|
| food | **11** | 등록됨 (레퍼런스 추출 1개 포함) |
| beauty | **10** | 등록됨 |
| electronics | **10** | 등록됨 |
| health-food | **0** | **공백** |
| fashion | **0** | **공백** |
| living | **0** | **공백** |
| pet | **0** | **공백** |

---

## 2. 공백 분석

### 2-1. 템플릿 파일 자체가 없는 카테고리 (4개)

`agents/templates/` 디렉터리에 대응 파일이 없고, `index.ts`에도 임포트되지 않은 카테고리입니다.

#### `health-food` — 건강기능식품

- 앱 카테고리 중 food와 가장 가까우나 **별도 프롬프트 파일**(`lib/ai/prompts/categories/health-food.ts`)이 존재하는 독립 카테고리입니다.
- 기능성 원료 인증(HACCP·식약처 인증), 효능 데이터 섹션, 비교표, 복용법(how_to_use) 등 food와 다른 섹션 구성이 필요합니다.
- food의 `food_health_04` 템플릿(건강기능식품)과 겹치지만, health-food 전용 템플릿은 인증·임상 데이터·성분 상세에 더 집중해야 합니다.

#### `fashion` — 패션

- 착용 이미지 중심, 사이즈 가이드, 소재 상세, 스타일링 제안, 컬러/사이즈 컬렉션 등 고유한 섹션이 필요합니다.
- 시즌/트렌드 의존도가 높아 템플릿 다양성(casual / premium / streetwear / formal / sporty)이 특히 중요합니다.

#### `living` — 리빙/홈인테리어

- 공간 인테리어 사진, 사이즈 도면, 소재 상세, 코디 제안, 설치 안내 등 카테고리 특화 섹션이 필요합니다.
- 가구 / 패브릭 / 조명 / 소품 등 서브 세그먼트별 톤이 다릅니다.

#### `pet` — 반려동물

- 반려동물 모델 착용/사용 사진, 성분 안전성, 수의사 추천, 사이즈 가이드(반려동물 체중별) 등 고유 섹션이 필요합니다.
- 건식사료 / 간식 / 용품 / 의류 등 서브 세그먼트 분화가 필요합니다.

### 2-2. 등록된 카테고리 내 다양성 부족

| 카테고리 | 부족한 톤/축 |
|---------|------------|
| food | `midnight-blue` 색상 계열 없음. `casual` 폰트 무드를 가진 프리미엄 방향 없음 |
| beauty | `fresh-green` 색상 계열 없음. 더마·약국 브랜드 특화 템플릿 없음 |
| electronics | `warm-cream` 색상 계열 1개(`kitchen_07`)뿐. 모바일 액세서리, 드론 등 신흥 서브카테고리 없음 |

---

## 3. DetailTemplate 추가 가이드

### 3-1. `DetailTemplate` 필드 설명 및 작성 요령

```typescript
interface DetailTemplate {
  // ── 필수 식별자 ──
  id: string             // "{카테고리}_{서브타입}_{순번}" 형식 (예: "fashion_casual_01")
  name: string           // 한국어 2~5단어 이름 (Art Director 선택 목록에 표시)
  description: string    // 한 줄 설명 — Art Director 프롬프트에 직접 삽입됨. 제품 타입과 분위기 명시
  category: string       // CATEGORIES 맵의 슬러그와 정확히 일치해야 함 (예: "health-food", "fashion")

  // ── 비주얼 방향 ──
  visualTone: VisualTone          // 'minimal'|'warm'|'premium'|'natural'|'bold'|'editorial'
  colorFamily: ColorFamily        // 'warm-cream'|'earth'|'dark-luxury'|'fresh-green'|'clean-white'|'vibrant'|'soft-pink'|'midnight-blue'
  fontMood: FontMood              // 'elegant'|'casual'|'modern'|'natural'|'serif-heavy'

  // ── 폰트 조합 (4개 역할 전부 채울 것) ──
  fontPairing: {
    headlineFont: string   // art-director.ts의 [개성/임팩트] 또는 [범용/모던] 그룹에서 선택
    storyFont: string      // [세리프·고급/전통] 또는 [손글씨] 그룹에서 선택
    bodyFont: string       // 반드시 [산세리프·범용/모던] 그룹에서만 선택 (가독성 필수)
    accentFont: string     // headlineFont와 다른 폰트. [손글씨]·[디스플레이·특수] 가능
    rationale: string      // 조합 근거 한 줄 (디버깅·문서용)
  }

  // ── 섹션 구성 (8~12개 권장) ──
  sectionSequence: string[]
  // 사용 가능한 섹션 타입 (art-director.ts 시스템 프롬프트 기준):
  // 공통: hero, brand_story, key_benefit, process, photo_gallery, packaging, cta
  // 식품/건기식: ingredients, certifications, sensory, delivery_info, history, philosophy, comparison, how_to_use
  // 뷰티: sensory, social_proof, how_to_use, comparison, certifications
  // 패션: size_guide, styling, collection, how_to_wear, social_proof
  // 리빙: installation, size_guide, material_detail, room_style, social_proof
  // 반려동물: safety, vet_recommend, size_guide, ingredient_safety, social_proof

  // ── 레이아웃 오버라이드 (5개 이상 명시 권장) ──
  patternOverrides: Partial<Record<string, LayoutPatternType>>
  // 사용 가능한 패턴:
  // 'full-bleed-hero'|'left-image-right-text'|'right-image-left-text'|'full-bleed-sensory'
  // 'dark-story-centered'|'numbered-steps-horizontal'|'grid-info-cards'|'photo-gallery-strip'
  // 'masonry-gallery'|'split-text-heavy'|'centered-statement'|'icon-feature-row'
  // 'comparison-table'|'timeline-vertical'|'full-bleed-overlay'|'testimonial-quote'

  // ── Art Director 힌트 ──
  artDirectorHints: string
  // 팔레트, 사진 스타일링, 타이포 방향, 소품, 분위기 키워드를 2~4 문장으로 기술
  // Art Director 시스템 프롬프트에 직접 전달되므로 구체적이고 감각적으로 작성

  // ── v6 검증 메타 (선택) ──
  validatedAt?: string     // 실제 레퍼런스에서 추출했을 때만 기재. ISO 날짜 또는 빈 문자열
  validatedBy?: string
  originReference?: string
  colorTokens?: { primary, secondary, background, text, accent }  // 추출 색상 (HEX)
}
```

### 3-2. 새 템플릿 추가 절차

1. **파일 생성**: `agents/templates/{카테고리}.ts`  
   예: `agents/templates/fashion.ts`, `agents/templates/pet.ts`

2. **배열 명명**: `export const FASHION_TEMPLATES: DetailTemplate[] = [...]`

3. **`index.ts` 등록** (3곳 수정):
   ```typescript
   // 1. 임포트 추가
   import { FASHION_TEMPLATES } from './fashion'

   // 2. export 추가
   export { FASHION_TEMPLATES }

   // 3. ALL_TEMPLATES에 스프레드 추가
   const ALL_TEMPLATES: DetailTemplate[] = [
     ...FOOD_TEMPLATES,
     ...BEAUTY_TEMPLATES,
     ...ELECTRONICS_TEMPLATES,
     ...FASHION_TEMPLATES,  // ← 추가
   ]
   ```

4. **카테고리 슬러그 확인**: `DetailTemplate.category` 필드가 `CATEGORIES` 맵의 키와 **완전히 일치**해야 합니다. `lib/ai/prompts/categories/index.ts` 기준으로 확인하세요.

5. **`buildTemplateCatalog` 자동 연동**: `index.ts`의 `getTemplatesByCategory(category)` 필터를 통해 Art Director 프롬프트에 자동 주입됩니다. 별도 프롬프트 수정 불필요.

---

## 4. 단계적 로드맵

### Phase 1 — 공백 카테고리 기초 확보 (우선순위: 최고)

**목표**: 4개 미지원 카테고리 각 5개 템플릿으로 최소 커버리지 확보  
**기간**: 2주  
**수용 기준**: 카테고리당 5개 이상, visualTone 3가지 이상 커버, fontMood 다양성 확보

#### `health-food` (목표: 5개)

| 우선순위 | ID (안) | 이름 | 비주얼 톤 | 색상 계열 |
|---------|---------|------|----------|---------|
| 1 | `healthfood_clinical_01` | 임상/과학 기반 | minimal | clean-white |
| 2 | `healthfood_natural_02` | 천연/식물성 | natural | fresh-green |
| 3 | `healthfood_premium_03` | 프리미엄 건기식 | premium | dark-luxury |
| 4 | `healthfood_diet_04` | 다이어트/슬리밍 | bold | vibrant |
| 5 | `healthfood_senior_05` | 시니어/가족 건강 | warm | warm-cream |

#### `fashion` (목표: 5개)

| 우선순위 | ID (안) | 이름 | 비주얼 톤 | 색상 계열 |
|---------|---------|------|----------|---------|
| 1 | `fashion_casual_01` | 캐주얼/데일리 | minimal | clean-white |
| 2 | `fashion_premium_02` | 프리미엄/편집샵 | premium | dark-luxury |
| 3 | `fashion_street_03` | 스트리트/빈티지 | bold | vibrant |
| 4 | `fashion_outdoor_04` | 아웃도어/스포츠 | natural | fresh-green |
| 5 | `fashion_formal_05` | 포멀/오피스룩 | editorial | earth |

#### `living` (목표: 5개)

| 우선순위 | ID (안) | 이름 | 비주얼 톤 | 색상 계열 |
|---------|---------|------|----------|---------|
| 1 | `living_minimal_01` | 미니멀/스칸디나비아 | minimal | clean-white |
| 2 | `living_warm_02` | 따뜻한/우드 인테리어 | warm | warm-cream |
| 3 | `living_premium_03` | 프리미엄 가구/조명 | premium | dark-luxury |
| 4 | `living_natural_04` | 자연/에코 리빙 | natural | earth |
| 5 | `living_modern_05` | 모던/시티 스타일 | editorial | midnight-blue |

#### `pet` (목표: 5개)

| 우선순위 | ID (안) | 이름 | 비주얼 톤 | 색상 계열 |
|---------|---------|------|----------|---------|
| 1 | `pet_food_01` | 반려동물 사료/간식 | natural | fresh-green |
| 2 | `pet_healthcare_02` | 반려동물 건강/영양제 | minimal | clean-white |
| 3 | `pet_accessory_03` | 반려동물 용품/장난감 | bold | soft-pink |
| 4 | `pet_fashion_04` | 반려동물 의류/패션 | warm | warm-cream |
| 5 | `pet_premium_05` | 프리미엄 펫 라이프스타일 | premium | dark-luxury |

---

### Phase 2 — 기존 카테고리 다양성 강화 (우선순위: 중)

**목표**: food·beauty·electronics 각 카테고리 15개 이상으로 확장, 커버되지 않은 색상 계열 보완  
**기간**: 3주  
**수용 기준**: 카테고리당 15개 이상, `colorFamily` 7종 이상 커버, `validatedAt` 있는 레퍼런스 추출 템플릿 카테고리당 3개 이상

#### food 추가 (4개, 현재 11 → 목표 15)
- `food_overseas_11`: 수입/이국적 식품 (bold / vibrant)
- `food_subscription_12`: 구독형/정기배송 식품 (minimal / midnight-blue)
- `food_kids_13`: 아동/영유아 식품 (warm / soft-pink)
- `food_vegan_14`: 비건/채식 식품 (natural / fresh-green) — `food_natural_01`과 차별화: 비건 인증, 대체육·식물성 성분 섹션 강조

#### beauty 추가 (5개, 현재 10 → 목표 15)
- `beauty_derma_11`: 더마/약국 브랜드 (minimal / clean-white) — `beauty_antiaging_05`보다 의학적·피부과적 근거 강조
- `beauty_suncare_12`: 선케어/자외선 차단 (natural / fresh-green)
- `beauty_baby_13`: 아기/유아 스킨케어 (warm / soft-pink)
- `beauty_indie_14`: 인디/니치 뷰티 (editorial / earth)
- `beauty_wellness_15`: 웰니스/이너뷰티 (minimal / midnight-blue)

#### electronics 추가 (5개, 현재 10 → 목표 15)
- `electronics_mobile_11`: 모바일/스마트폰 액세서리 (minimal / clean-white)
- `electronics_drone_12`: 드론/RC 기기 (bold / dark-luxury)
- `electronics_beauty_device_13`: 뷰티 디바이스(피부 관리기기) (minimal / soft-pink)
- `electronics_ev_14`: EV/자동차 액세서리 (editorial / midnight-blue)
- `electronics_office_15`: 오피스/업무용 기기 (minimal / clean-white) — `computer_08`과 차별화: 멀티디바이스 호환, 설치/설정 경험 중심

---

### Phase 3 — 레퍼런스 추출 템플릿 확충 (우선순위: 낮음)

**목표**: 실제 한국 이커머스 레퍼런스에서 추출한 `colorTokens` 포함 고신뢰 템플릿을 전 카테고리에 걸쳐 추가  
**기간**: 지속 운영 (스프린트별 카테고리당 1개)  
**수용 기준**: `validatedAt` 날짜 기재, `colorTokens` 5색 모두 HEX 지정, `originReference` 경로 명시

현재 레퍼런스 추출 템플릿: `food_matcha_ref01` 1개만 존재.  
Phase 3에서 각 카테고리당 최소 2개 레퍼런스 추출 템플릿 확보를 목표로 합니다.

---

## 5. 검증 방법

새 템플릿을 추가한 뒤 아래 체크리스트를 순서대로 실행합니다.

### 5-1. 정적 검증 (빌드 단계)

```bash
# 1. TypeScript 컴파일 — DetailTemplate 타입 위반 검출
npm run build

# 2. 카테고리 슬러그 일치 확인 (수동)
# agents/templates/*.ts의 category 필드가
# lib/ai/prompts/categories/index.ts의 CATEGORIES 맵 키와 일치하는지 확인
```

### 5-2. 카탈로그 생성 확인

```typescript
// Node.js REPL 또는 별도 스크립트로 실행
import { buildTemplateCatalog, getTemplatesByCategory } from './agents/templates/index'

const category = 'fashion'   // 테스트할 카테고리 슬러그
const templates = getTemplatesByCategory(category)
console.log(`[${category}] 템플릿 수:`, templates.length)
console.log(buildTemplateCatalog(category))
// 기대: 카탈로그 텍스트에 새 템플릿 ID와 설명이 정상 출력됨
```

### 5-3. Art Director 선택 검증

Art Director(`runArtDirector`)는 `buildTemplateCatalog(brief.category)` 결과를 프롬프트에 주입하고, 응답의 `selectedTemplateId`로 템플릿을 선택합니다.

확인 항목:
- `selectedTemplateId` 값이 새로 추가한 템플릿 ID 형식과 일치하는가
- `getTemplateById(selectedTemplateId)`가 `undefined`를 반환하지 않는가
- StyleGuide의 `typography` 필드가 선택된 템플릿의 `fontPairing`을 반영하는가

### 5-4. HTML 빌더 렌더 파이프라인 검증

실제 파이프라인 E2E 실행 (`npm run pipeline` 또는 관리자 UI → 새 프로젝트 생성):

1. 새 템플릿이 속한 카테고리로 프로젝트 생성
2. Art Director가 해당 템플릿을 `selectedTemplateId`로 반환하는지 확인  
   *(특정 템플릿 강제 선택 테스트는 brief의 `styleDirection`에 템플릿 이름을 명시하여 유도)*
3. HTML 빌더가 `sectionSequence` 순서대로 섹션을 생성하는지 확인
4. `patternOverrides`의 레이아웃 패턴이 각 섹션에 적용되는지 확인
5. 브라우저에서 상세페이지 HTML 렌더링 — 레이아웃 깨짐 여부 확인

### 5-5. 템플릿 다양성 회귀 방지

카테고리 내 템플릿 중복 방지 기준:

| 중복 기준 | 판정 방법 |
|---------|---------|
| 동일 `visualTone` + `colorFamily` 조합 | 카테고리 내 동일 조합 2개 이상이면 재검토 |
| `fontPairing.headlineFont` 3개 초과 중복 | 카테고리 내 같은 헤드라인 폰트가 3개 초과 시 다양화 필요 |
| `sectionSequence` 80% 이상 동일 | 섹션 순서가 거의 같은 두 템플릿은 병합 또는 차별화 필요 |

---

## 6. 권장 우선순위 요약

| 순위 | 작업 | 이유 |
|-----|------|------|
| **1** | `health-food` 템플릿 5개 추가 | 프롬프트 파일이 이미 있고, 사업자 수요가 식품 다음으로 높음 |
| **2** | `pet` 템플릿 5개 추가 | 반려동물 카테고리는 국내 이커머스 고성장 세그먼트 |
| **3** | `fashion` 템플릿 5개 추가 | 의류 사업자 비중이 높으나 상세페이지 품질 편차 큼 |
| **4** | `living` 템플릿 5개 추가 | 가구·인테리어는 상세페이지 길이와 섹션 복잡도가 높아 템플릿 효과 큼 |
| **5** | food 레퍼런스 추출 템플릿 2개 추가 | `food_matcha_ref01` 이후 레퍼런스 추출 템플릿 확충 |
| **6** | beauty / electronics 다양성 보완 | 기존 커버리지로 운영 가능하나 특수 서브세그먼트 누락 |

---

*이 문서는 템플릿 확장 작업 전 반드시 읽고, 완료 후 인벤토리 표(1-2절)를 업데이트하세요.*
