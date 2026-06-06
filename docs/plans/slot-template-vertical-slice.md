# 식품 슬롯템플릿 수직슬라이스 (정식화) — 2026-06-06

## 목표
증명된 슬롯템플릿(`renderFoodDetail`)을 **식품 카테고리의 실제 의뢰 생성 경로**로 정식화.
슬롯 경로가 식품의 메인 생성 경로가 된다(뷰티/전자는 당분간 기존 제너릭 유지 — 무회귀).
슬롯이 더 효과적임이 검증되면 Art Director 역할 축소를 확정한다.

## 결정 (사용자 확정 2026-06-06)
- 범위: **식품 1개 수직슬라이스 end-to-end**.
- 구조: **슬롯템플릿으로 전환**(공존 아님, 식품의 메인 경로). 효과적이면 AD 역할도 변경.

## 아키텍처 변화
- 기존(제너릭): `brief → AD(풀 StyleGuide 8색/4폰트/레이아웃) → script → copy → html-builder(제너릭 조립) → QA/Validator → exporter`
- 슬롯(신규·식품): `brief → AD(축소: 슬롯템플릿 선택 + 브랜드 FoodTokens) → script → slot-filler(→FoodDetailData) → renderFoodDetail(고정 프리미엄 CSS) → (QA/Validator) → exporter`
- **핵심: 레이아웃/폰트/CSS가 템플릿에 고정 → AD의 StyleGuide 생성 대부분 불필요. AD = 토큰+변형 선택만.**

## 스프린트
- **S1** 슬롯템플릿 프로덕션화: `agents/templates/slots/food-slot.ts` = `renderFoodDetail` + `FoodDetailData` + **zod 스키마**(`foodDetailSchema`). scripts/food-template.ts는 lib에서 re-export(중복 제거). 렌더테스트 통과.
- **S2** `agents/slot-filler.ts`: 입력 ProjectBrief+Script(+RefinedCopy)+tokens → 출력 검증된 `FoodDetailData`. zod 검증+재시도. 황태/소금빵 brief로 eval(에이전트 조합 재현).
- **S3** AD 역할 축소(슬롯용): 슬롯템플릿 variant 선택 + `FoodTokens` 추출(경량 Claude 또는 템플릿 colorTokens 매핑). 풀 StyleGuide 생성 스킵.
- **S4** 파이프라인 배선: `runSlotPipeline`(또는 pm.ts 식품 분기) + pipeline-bridge 식품 라우팅 + 이미지(누끼 hero / 스타일링샷 / placeholder 폴백) + 상태 `design_review` 전이 + 산출물 저장(기존 경로 계약 동일).
- **S5** E2E 검증: 실제 식품 프로젝트 → HTML → PNG 렌더 → 그래놀라급 확인 + **별도 code-reviewer/verifier 채점**(Quality Rubric, 생성자-평가자 분리).

## 제약/주의
- 식품만. 뷰티/전자 기존 제너릭 경로 무회귀(빌드/타입 깨지면 안 됨).
- 이미지 크레딧 막힘 → placeholder(브랜드 그라데이션) 허용, 실이미지 후속.
- 생성자-평가자 분리: 내가 구현, 채점은 별도 에이전트.
- `npm run build` 그린 유지. 스프린트별 commit.

## 검증 기준 (S5 통과 조건)
- slot-filler가 최소 brief에서 9섹션 FoodDetailData를 zod-valid하게 생성.
- renderFoodDetail 출력이 소금빵 샘플과 동급 레이아웃(섹션 9개·토큰 반영·폴백 정상).
- 파이프라인이 식품 프로젝트를 design_review까지 에러 없이 전이, HTML 산출물 저장 확인(DB/스토리지).
