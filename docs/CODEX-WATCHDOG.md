# Codex Watchdog Log

> 목적: Claude Code가 같은 잘못된 결과를 반복하지 않도록, Codex가 감시 중 발견한 반복 문제를 남긴다.
> 작업 전 `CLAUDE.md`와 함께 이 문서를 확인하고, 아래 항목이 해결됐는지 DB/브라우저/산출물로 검증한다.

## 2026-06-01 반복 문제

### 1. `prompt_ready` 이후 스타일링샷 업로드 플로우가 막힘

- 반복 증상: `design_plan_review -> prompt_ready` 전이는 되지만 `photos` row가 생성되지 않아 `/photography/[id]`에서 업로드할 대상이 없다.
- 확인된 샘플: `쌀과밀 소금빵` project `c0ff7994-4c13-4bbf-9ddd-d621bcfd5096`
  - status: `prompt_ready`
  - photos: `0`
  - designs: `0`
- 추가 반복 샘플: `청정원 흑마늘진액` project `6eee52ac-696b-4e54-b170-66a68a42d870`
  - status: `design_generating`
  - photos: `0`
  - designs: `0` at check time
  - 로그상 `photo_uploaded -> design_generating`은 있으나 실제 업로드 사진 row가 없다.
  - 이 상태는 "업로드 스타일링샷 검증"이 아니라 스타일링샷 업로드 단계를 건너뛴 진행으로 봐야 한다.
- 실패 기준: `prompt_ready` 프로젝트에서 운영자가 스타일링샷 이미지를 업로드하고 `photo_uploaded`로 넘길 수 없으면 미해결.
- 수용 기준:
  - `styling-final-prompts.json`의 shots 기준으로 `photos(photo_type='styling')` row가 생성되거나,
  - 업로드 UI/API가 row 없이도 새 `photos` row를 생성한다.
  - 업로드 후 `photos.storage_path`가 채워지고 `prompt_ready -> photo_uploaded` 전이가 DB 로그로 확인된다.

### 2. delivered 샘플이 업로드 스타일링샷 경로 검증을 증명하지 못함

- 반복 증상: `돈덕 순대`는 `delivered`지만 `photos` row가 0개라 디자이너 업로드 스타일링샷 우선 사용 로직을 검증한 샘플이 아니다.
- 확인된 샘플: `돈덕 순대` project `5d2f266f-4f34-4562-9223-6d3050b518b2`
  - status: `delivered`
  - photos: `0`
  - designs: `1`
  - latest design `output_url`: `null`
- 실패 기준: delivered만 보고 "실제 업로드 스타일링샷 반영 완료"라고 주장하면 안 된다.
- 수용 기준:
  - `photos(photo_type='styling')`에 실제 업로드 이미지가 있고,
  - `generate-design.ts`의 `fetchUploadedStylingShots` 경로가 로그/결과물로 확인되며,
  - 최종 산출물 링크 또는 확인 가능한 preview/output이 존재한다.

### 3. demo/dummy 샘플을 실제 품질 샘플로 착각함

- 반복 증상: 프로젝트 status만 전진시키고 script/content는 `demo`, `test-dummy`, 더미 섹션으로 남는다.
- 확인된 샘플:
  - `쌀과밀 소금빵`: script model `demo`, sections 1, 제품정보 없음
  - `황태이야기`: script model `demo`, 더미 흔적 있음, 제품정보 없음
- 실패 기준: 더미 스크립트/제품정보 없는 script로 "실사용 샘플 완성"이라고 판단하면 안 된다.
- 수용 기준:
  - 최신 script가 Claude 생성 모델이고,
  - 제품명/핵심 특징이 본문에 반영되며,
  - sections가 상세페이지로 볼 수 있는 수준으로 생성된다.

### 4. 운영자 role과 API 권한 불일치

- 반복 증상: admin layout은 `planner`, `designer` 접근을 열었지만 일부 API는 `admin`만 허용한다.
- 후속 코드 수정 확인:
  - `/api/scripts/review`: `admin`, `planner` 허용으로 변경됨.
  - `/api/designs/planning`: `admin`, `planner` 허용으로 변경됨.
  - `/api/scripts/ab-test`: `admin`, `planner` 허용으로 변경됨.
  - `/api/designs/generate`: `admin`, `designer` 허용으로 변경됨.
- 아직 남은 후보:
  - `/designer/[id]/editor` 페이지 자체가 `role !== 'admin'`이면 redirect한다.
  - `/api/designs/[id]/html`, `/api/designs/[id]/copy`, `/api/designs/[id]/image`도 소유자가 아니면 `admin`만 허용한다.
  - 따라서 designer role 사용자는 "초안 제작/HTML 에디터" 메뉴에 접근해도 실제 편집 API에서 403 또는 redirect를 맞을 가능성이 높다.
- 실패 기준: planner/designer UI에 버튼이 보이는데 클릭 시 403이 나면 미해결.
- 수용 기준: UI 노출 role과 API 허용 role이 일치하고, 비허용 role에는 버튼이 보이지 않거나 명확한 안내가 나온다.

### 5. 로컬 HTML 산출물은 생기지만 DB/웹앱 샘플로 연결되지 않음

- 반복 증상: `runPipeline`이 로컬 `output/<shortId>/4_final/index.html`을 만들지만 QA FAIL 또는 업로드 누락으로 Supabase `designs` row와 웹앱 확인 화면까지 연결되지 않는다.
- 확인된 샘플: `청정원 흑마늘진액` project `6eee52ac-696b-4e54-b170-66a68a42d870`
  - DB status: `design_generating`
  - DB photos: `0`
  - DB designs: `0`
  - 로컬 산출물: `output/884d5e94/4_final/index.html`
  - 1차 QA 결과: `output/884d5e94/compliance-report.json` failed
    - CRITICAL: 식품표시광고법 필수 표시 누락
    - CRITICAL: 건강 기능성 오인 가능 표현
    - HIGH: 알레르겐/소비기한/HACCP 근거 누락
  - 재작업 후 최신 QA 결과: `passed=true`, issues `0`
  - 하지만 `Copy Writer`가 JSON 파싱 실패(`Unterminated string`)했고, 이후 DB `designs` row 생성/상태 전이가 확인되지 않았다.
- 최신 추가 확인:
  - project status는 `design_review`로 전이됨.
  - Storage 업로드는 `38/39` 성공. `designer-figma.zip`은 74MB로 Storage 최대 크기 초과 실패.
  - Storage에는 `4_final/index.html`, `5_export/mobile.zip`, `5_export/pc.zip`, `5_export/designer.zip`, PC/mobile PNG 등이 존재.
  - 그러나 Supabase `designs` row는 여전히 `0`.
  - 웹앱 `/designer/[id]`는 `designs` row를 읽어 `DesignPreview`를 렌더링하므로, 현재 상태에서는 `design_review` 목록에 보여도 상세는 "디자인 생성 중..."으로 보일 가능성이 높다.
  - 의심 원인: `lib/storage.ts`의 `updateDesignUrls()`가 `edited_html_url`을 쓰지만 실제 DB schema 조회 결과 `designs` 테이블에 `edited_html_url` 컬럼이 없다. insert/update 에러를 확인하지 않아 실패가 묻히고 상태만 전이된다.
  - 후속 코드 수정 확인: `lib/storage.ts`에서 `edited_html_url` 사용을 제거하고 HTML URL을 `output_url` JSON에 넣도록 변경됨. insert/update `error`도 throw하도록 추가됨.
  - 단, 기존 `청정원 흑마늘진액` 샘플은 아직 backfill/rerun되지 않아 `design_review` 상태인데도 `designs` row가 `0`이다.
- 실패 기준:
  - 로컬 파일 존재만으로 "웹앱에서 실제 확인 가능"이라고 판단하면 안 된다.
  - QA PASS만으로 샘플 완료로 간주하면 안 된다. DB와 웹앱 확인 화면까지 연결되어야 한다.
- 수용 기준:
  - QA가 pass이거나, 법정 표시/건강 주장 문제를 명시적으로 해소한 재검증 리포트가 있다.
  - Supabase `designs` row가 생성되고 `preview_url` 또는 `output_url`이 웹앱에서 접근 가능하다.
  - project status가 `design_review` 이상으로 전이되고 `project_logs`에 성공 전이가 기록된다.
  - `updateDesignUrls()`는 Supabase insert/update `error`를 반드시 검사하고 실패 시 상태 전이를 막거나 실패 상태로 롤백한다.

## 검증 명령

```bash
npx tsx --env-file=.env.local scripts/check-project-state.ts <projectId>
```

추가로 `photos`, `designs`, `intake_files` 개수를 직접 확인해 status만 보고 성공 판단하지 않는다.
