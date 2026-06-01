# DetailAI 파이프라인 단계별 구성 + 검증 체크리스트 (2026-06-01)

> 13단계 상태머신(`lib/status-machine.ts`) 기준. 각 단계의 트리거·처리·산출물·전이와
> 검증 체크 항목을 정리하고, 단계별로 체크하며 진행한다.
> 범례: ✅ 검증완료 · ⏳ 미검증 · ⚠️ 리스크

```
[사업자]  intake_submitted ─┐
                            ▼
[AI/시스템] script_generating → script_review ─[운영자 승인]→ script_approved
                            ▼
[AI/시스템] design_planning → design_plan_review ─[운영자 승인]→ prompt_ready
                            ▼
[운영자]   (누끼 다운로드 + 스타일링샷 생성/업로드) → photo_uploaded
                            ▼
[AI/시스템] design_generating → design_review ─[승인]→ design_approved → delivered
```

---

## 1단계 · intake_submitted (접수 완료)  ⏳
- **트리거**: 사업자가 `/intake` 의뢰 제출 → `POST /api/projects`
- **처리**: `projects` row 생성 + `intake_files` 업로드 + `generateScriptForProject` 자동 호출(fire-and-forget)
- **체크 항목**:
  - [ ] 의뢰 폼 검증(필수값, 사업자등록번호, 1회 제한 usage_limit)
  - [ ] 이미지/파일 업로드 → `intake_files` 저장 + Storage 업로드
  - [ ] status=intake_submitted 로 생성, 사업자 목록에 노출

## 2단계 · script_generating (스크립트 생성 중)  ✅
- **트리거**: `generateScriptForProject` (신규 의뢰 / `/api/scripts/generate` / 재생성)
- **처리**: 인테이크 이미지 **1568px 리사이즈**(버그#2 수정) → Claude Vision → 스크립트 JSON
- **체크 항목**:
  - [x] 이미지 리사이즈로 413 회피 (42MB→0.33MB 확인)
  - [x] Claude 호출 성공(키 수정 후 401 해소) + 유효 JSON 파싱
  - [x] JSON 파싱 실패 시 1회 재시도 로직 존재
  - [ ] ⚠️ 실패가 `catch`로 **무음 처리**됨 → 관측성 개선 필요(별도 항목)

## 3단계 · script_review (기획 검수)  ✅
- **트리거**: 2단계 완료 → `scripts` row 생성(planner_status=pending)
- **처리**: 운영자(기획자)가 `/planner/[id]`에서 검토
- **체크 항목**:
  - [x] 진짜 스크립트 DB 저장(돈덕 순대: 더미→진짜 7섹션)
  - [x] 기획 검수 UI 렌더링(섹션 편집/AI 재생성/A·B 비교/승인)
  - [ ] A/B 비교 생성(`generateAbVariant`) 동작
  - [ ] 섹션 직접 편집(action=edit) 저장
  - [ ] AI 재생성(클라이언트 코멘트 반영) 동작

## 4단계 · script_approved (스크립트 승인)  ✅
- **트리거**: `POST /api/scripts/review` action=approve (admin 권한)
- **처리**: planner_status=approved + 전이
- **체크 항목**:
  - [x] 승인 200 + 전이 확인
  - [ ] 미인증/비admin 차단(403) 확인

## 5단계 · design_planning (디자인 기획 생성 중)  ✅ ⚠️
- **트리거**: `POST /api/designs/planning` → `runPlanningForProject` → `agents/pm` `runPlanningPipeline`
- **처리**: 누끼 다운로드 → 기획 파이프라인 → style-guide/script/styling-prompts 산출
- **체크 항목**:
  - [x] 산출물 3종 생성(`designs` 버킷 `projects/{id}/planning/*.json`)
  - [x] 내용 진짜·제품 맞춤(돈덕순대 moodKeywords/컬러/타이포)
  - [ ] ⚠️ **223초 소요 — Vercel 300초 한도 근접**(타임아웃 리스크, 대응 필요)

## 6단계 · design_plan_review (디자인 기획 검수)  ✅
- **트리거**: 5단계 완료 → design_plan_review 전이
- **처리**: 운영자가 기획안(컬러/타이포/레이아웃) 검토
- **체크 항목**:
  - [x] 기획 검수 UI 렌더링(쌀과밀에서 확인: 팔레트/타이포/9섹션/디자인노트)
  - [ ] 돈덕 순대 기획안도 UI에서 정상 렌더링(신규 생성분)

## 7단계 · prompt_ready (스타일링샷 프롬프트 준비)  ✅
- **트리거**: `POST /api/designs/plan-review` 승인 → prompt_ready
- **처리**: 운영자가 누끼 다운로드 + `styling-final-prompts.json` 프롬프트로 이미지 추출
- **체크 항목**:
  - [x] plan-review 승인 → prompt_ready 전이(돈덕 순대 확인)
  - [x] `styling-final-prompts.json` 유효(shots 6개, name/composition/finalPrompt, operatorGuide)
  - [ ] 스타일링샷 제작 화면(누끼 다운로드/프롬프트 복사) UI 동작

## 8단계 · photo_uploaded (사진 접수 완료)  ⏳
- **트리거**: 운영자 스타일링샷 업로드 → `POST /api/photography/complete`
- **처리**: photo_uploaded 전이 + `generateDesignForProject` 자동 트리거
- **체크 항목**:
  - [ ] 스타일링샷 업로드 → 저장 + 전이
  - [ ] 업로드 직후 초안 생성 자동 시작

## 9단계 · design_generating (제작 중)  ⏳
- **트리거**: `generateDesignForProject` / `runPipelineForProject`(`/api/designs/generate`)
- **처리**: 선택 템플릿 + 스타일링샷 결합 → **HTML 초안 + 이미지(Gemini)** 생성
- **체크 항목**:
  - [ ] Gemini 이미지 생성 성공(키·크레딧·런타임)
  - [ ] HTML 초안 산출 + `designs` 테이블 row 생성
  - [ ] ⚠️ 런타임/타임아웃(기획 223초보다 길 수 있음)

## 10단계 · design_review (초안 확인 요청)  ⏳
- **체크 항목**: [ ] 초안 HTML/이미지 미리보기 렌더링, Figma import 소스 산출

## 11단계 · design_approved (최종 확인 완료)  ⏳
- **트리거**: `POST /api/designs/review` action=approve
- **체크 항목**: [ ] 승인 전이, 사업자 측 상태 동기화

## 12단계 · delivered (납품 완료)  ⏳
- **체크 항목**: [ ] 사업자 다운로드/전달, 최종 산출물 접근

---

## 별도 개선 항목 (단계 무관)
- [ ] **관측성**: `generateScriptForProject` 등이 실패를 `catch`로 삼키고 success 반환 → 실패를 UI/상태에 표면화
- [ ] **더미 데이터**: `reset-demo`/`create-test-projects`의 `dummyScript` → 실제 생성분으로 대체(돈덕 순대는 완료)
- [ ] **타임아웃**: 디자인 기획/초안 생성 장시간 작업 비동기화 또는 분할
