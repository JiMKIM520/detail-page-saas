# Task 4: 카테고리×플랫폼 스크립트 분화 시스템

## 현재 상태
- IntakeForm: 6개 카테고리 하드코딩, 플랫폼 4개 DB
- 프롬프트: 카테고리명만 텍스트로 전달, 플랫폼 style_guide만 전달
- 카테고리별 법적 요건/구조/톤 미반영
- docs/script-differentiation-guide.md에 7개 카테고리 × 9개 플랫폼 상세 가이드 존재

## 구현 계획

### Sprint 1: DB + 프롬프트 템플릿
1. **DB 마이그레이션** (`009_categories_platforms.sql`)
   - categories 테이블 생성 (id, name, slug, legal_rules, tone, section_structure)
   - 7개 카테고리 시드: 식품, 건강기능식품, 뷰티, 패션, 생활용품, 전자제품, 반려동물
   - 5개 플랫폼 추가 시드: 11번가, 오늘의집, 무신사, 위메프, SSG
   - 기존 platforms style_guide 업데이트 (정확한 스펙 반영)
   - projects.category → category_id UUID FK 마이그레이션

2. **카테고리 프롬프트** (`lib/ai/prompts/categories/`)
   - 카테고리별 파일: food.ts, health-food.ts, beauty.ts, fashion.ts, living.ts, electronics.ts, pet.ts
   - 각 파일 export: { legalRules, forbiddenExpressions, requiredSections, tone, qualityCriteria }

3. **플랫폼 프롬프트** (`lib/ai/prompts/platforms/`)
   - 플랫폼별 파일: smartstore.ts, coupang.ts, gmarket.ts, kakao.ts, 11st.ts, ohouse.ts, musinsa.ts, wemakeprice.ts, ssg.ts
   - 각 파일 export: { specs, layoutRules, conversionTips }

4. **프롬프트 빌더** (`lib/ai/prompts/builder.ts`)
   - buildCategoryPrompt(categorySlug) → 카테고리 규칙 텍스트
   - buildPlatformPrompt(platformSlug) → 플랫폼 가이드 텍스트
   - buildDifferentiatedPrompt(category, platform) → 최종 시스템 프롬프트

### Sprint 2: 연동 + UI
5. **generate-script.ts 수정**
   - categories 테이블에서 slug 조회
   - buildDifferentiatedPrompt() 호출로 시스템 프롬프트 교체
   - buildUserPrompt()에서 카테고리 세부 규칙 포함

6. **IntakeForm 업데이트**
   - categories 테이블에서 동적 fetch
   - platforms도 동적 fetch (기존 유지)
   - 7개 카테고리 표시

7. **조합 검증 매트릭스**
   - lib/ai/prompts/compatibility.ts: ◎/○/△/× 매트릭스 정의
   - IntakeForm에서 △ 선택 시 경고, × 선택 시 차단
   - 호환성 배지 표시

## 파일 변경 목록
- 신규: supabase/migrations/009_categories_platforms.sql
- 신규: lib/ai/prompts/categories/*.ts (7개)
- 신규: lib/ai/prompts/platforms/*.ts (9개)
- 신규: lib/ai/prompts/builder.ts
- 신규: lib/ai/prompts/compatibility.ts
- 수정: lib/ai/prompts/script-base.ts
- 수정: lib/ai/generate-script.ts
- 수정: components/intake/IntakeForm.tsx
- 수정: app/api/projects/route.ts (category_id 처리)
