# 다음 세션 이어가기 (핸드오프) — 2026-06-01

> `/clear` 이후 이 문서를 먼저 읽고 진행. 함께 볼 것: `docs/pipeline-verification-checklist.md`,
> `docs/template-expansion-roadmap.md`, 메모리 `project_detailai_pipeline_verified`.

## 0. 현재 상태 (커밋 완료, git clean)
- `248eed7` 초안 생성이 디자이너 업로드 스타일링샷 우선 사용 + 템플릿 로드맵
- `88b44aa` 파이프라인 차단 버그 수정 + 운영 UI 통합 + 12단계 E2E 검증
- 파이프라인 1~12단계 전부 실제 데이터로 검증됨. 돈덕 순대 샘플(7섹션+PDF, status=delivered) 생성됨.

## 1. 반드시 아는 gotcha / 환경
- **API 키**: `~/.zshrc`의 전역 `ANTHROPIC_API_KEY`는 주석 처리됨(무효 키였음). 앱은 `.env.local`의 유효 키 사용. 터미널에서 직접 tsx 실행 시 전역 env가 없어야 .env.local이 먹음 → `env -u ANTHROPIC_API_KEY ... --env-file=.env.local` 패턴 사용.
- **dev 서버 기동**: `env -u ANTHROPIC_API_KEY PORT=3000 npm run dev` (전역 키 잔재 방지). `.next` 손상 시 `rm -rf .next` 후 재기동.
- **무음 에러 주의**: generateScriptForProject/generateDesignForProject는 실패해도 project_logs에만 기록하고 success 반환. **200 응답을 믿지 말고 항상 DB(project_logs/projects.status)로 검증**.
- **장시간 작업**: 디자인 기획 ~223초, 초안 생성 ~9분 (로컬 OK, Vercel 300초 초과 → 배포 전 비동기화 필요).

## 2. 검증 도구 (이미 작성됨, scripts/)
- `npx tsx --env-file=.env.local scripts/check-project-state.ts <projectId>` — status/script/logs 확인
- `npx tsx --env-file=.env.local scripts/verify-stage1-script.ts` — Claude 스크립트 생성 단독 검증(DB 미접촉)
- DB 직접 조회: `@supabase/supabase-js` + service role (`.env.local`)

## 3. 로그인 (인증된 브라우저로 API 트리거 시)
- 운영자(admin): `/admin` → `admin` / `DetailAI!2026` (role=admin)
- 사업자(demo): `/login` → `demo@detailai.app` / `123-45-67890`
- 인증 필요한 API는 Playwright 브라우저 세션에서 `fetch`(쿠키 포함) 또는 `browser_evaluate`로 호출.

## 4. 테스트 프로젝트 (시드됨, `scripts/reset-demo.ts`로 리셋 가능)
- 돈덕 순대 `5d2f266f-4f34-4562-9223-6d3050b518b2` — 이미 delivered까지 완주
- 쌀과밀 소금빵 `c0ff7994-4c13-4bbf-9ddd-d621bcfd5096` — design_plan_review
- 황태이야기 `5b919f67-b9b7-4c43-a33a-108bb05dd5d7`

## 5. 다음 세션 작업 순서 (사용자 지정)

### A. 웹앱 기능 체크 (개별 기능 전수 QA) — 미검증분
인증된 브라우저로 각 기능을 실제 조작해 동작+DB 반영 확인, 실패 시 수정:
- [ ] 담당자 배정 저장 (`/api/projects/[id]/assign`) — planner_id/designer_id 반영
- [ ] 사업자 코멘트 작성 (`/api/comments`) + 운영자 확인
- [ ] A/B 비교 생성 (`/api/scripts/ab-test` → generateAbVariant)
- [ ] 스크립트 섹션 직접 편집 (scripts/review action=edit)
- [ ] AI 재생성 (action=regenerate, 클라이언트 피드백 반영)
- [ ] 사용자 관리 / 직원 등록 (`/users`, `/api/admin/staff`, register-users)
- [ ] 신규 의뢰 제출 (`/intake` → `/api/projects`) 전체 흐름 + usage_limit=1 검증
- [ ] 이미지 보호(우클릭/드래그 차단), 미인증 직접 URL 접근 차단(엣지)
- [ ] /photography(스타일링샷 제작), /designer(초안 제작) 화면 렌더+상호작용

### B. 실제 데이터로 스크립트 뽑기
- 새 프로젝트(실제 제품 입력)로 intake→generateScriptForProject 실행, 진짜 스크립트 생성 확인.
- 또는 기존 테스트 프로젝트 재생성. DB로 sections/제품정보 반영 검증.

### C. 스타일링샷 프롬프트 구현/검증
- `styling-final-prompts.json`(shots N개, finalPrompt) 생성·표시(StylingPromptPanel) 확인.
- **디자이너 업로드 흐름 검증**: photos 테이블 photo_type='styling' 업로드 → 초안에 반영되는지
  (generate-design.ts의 fetchUploadedStylingShots 우선 사용 로직, 이번에 추가됨 — E2E 미검증).

### D. 템플릿 활용한 초안 작성 테스트
- **핵심 미해결**: 두 초안 경로 존재 —
  - `generateDesignForProject`(generate-design.ts, Gemini 섹션이미지 생성, photography/complete가 트리거) ← 현재 검증된 경로
  - `runPipelineForProject`(pipeline-bridge.ts → agents/pm runPipeline → html-builder, **선택 템플릿(selectedTemplateId) 적용**, designs/generate가 트리거) ← v6 의도(템플릿+스타일링샷 합성)
- 어느 경로가 캐노니컬인지 사용자 확정 필요. v6 문서(operations-redesign.md E절)는 html-builder 경로 지향.
- 템플릿(food/beauty/electronics, agents/templates/)이 실제 초안에 반영되는지 runPipelineForProject로 테스트.
- 업로드된 스타일링샷이 페이지에 직접 합성되려면 html-builder 경로 통합 필요(현재는 Gemini 참조용).

### (병행) 배포 전 필수
- 무음 에러 표면화(#2), Vercel 타임아웃 비동기화(`docs/async-jobs-design.md` 미작성).
