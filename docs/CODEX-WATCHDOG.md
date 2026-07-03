# Codex Watchdog Log

> 목적: Claude Code가 같은 잘못된 결과를 반복하지 않도록, Codex가 감시 중 발견한 반복 문제를 남긴다.
> 작업 전 `CLAUDE.md`와 함께 이 문서를 확인하고, 아래 항목이 해결됐는지 DB/브라우저/산출물로 검증한다.

<!-- CODEX-WATCHDOG:AUTO-CHECK:START -->
## 최근 자동 점검 요약

- 점검 시각: 2026-06-01T23:38:35.801Z
- HEAD: `2c6dd4c docs: compact 핸드오프 — MVP 우선순위(웹앱+상세페이지 완성도), 템플릿↔이미지 연속성 보류 결정 반영`
- worktree: `M agents/html-builder.ts
 M app/(admin)/layout.tsx
 M app/(auth)/login/page.tsx
 M app/(client)/intake/page.tsx
 M app/actions/admin-login.ts
 M app/api/designs/review/route.ts
 M app/api/photography/shooting-list/route.ts
 M app/api/scripts/ab-test/route.ts
 M app/api/scripts/generate/route.ts
 M app/layout.tsx
 M components/designer/DesignPreview.tsx
 M docs/CODEX-WATCHDOG.md
 M proxy.ts
?? .watchdog/
?? docs/AUDIT-FINDINGS.md
?? docs/CLIENT-STATUS.html
?? docs/CODEX-WATCHDOG-RUNS.md
?? docs/MORNING-REPORT.md
?? docs/OVERNIGHT-PROGRESS.md
?? scripts/codex-watchdog.ts
?? scripts/com.detailai.codex-watchdog.plist
?? scripts/gen-ssal-extra-shots.ts
?? scripts/publish-ssal-v2.ts
?? scripts/render-html.ts
?? scripts/rerender-ssal-template.ts
?? scripts/run-codex-watchdog-loop.sh
?? scripts/run-codex-watchdog.sh
?? scripts/upload-ssal-rerender.ts`
- 발견 이슈: 9건

| 프로젝트 | status | script | preview | section_images | output_url keys | photos | 판정 |
|---|---|---|---|---:|---|---:|---|
| 돈덕 순대 | delivered | claude-sonnet-4-20250514 / 7섹션 | image | 7 | - | 0/0 | delivered인데 output_url 다운로드 링크 없음<br>photos=0 상태에서 design 존재: 업로드 스타일링샷 검증 증거로 보기 어려움 |
| 쌀과밀 소금빵 | design_review | claude-sonnet-4-20250514 / 6섹션 | image | 20 | html, mobile_zip, pc_zip, designer_zip | 1/6 | output_url은 있으나 design_review라 사업자 다운로드 UI에서 숨겨질 수 있음<br>photos 슬롯 6개 중 업로드 1개 |
| 황태이야기 | design_review | claude-sonnet-4-20250514 / 7섹션 | image | 7 | - | 0/0 | photos=0 상태에서 design 존재: 업로드 스타일링샷 검증 증거로 보기 어려움 |
| 청정원 흑마늘진액 | design_review | claude-sonnet-4-20250514 / 6섹션 | non-image | 0 | html | 0/0 | preview_url이 이미지가 아님: https://uddyemjqoxqttzpminwa.supabase.co/storage/v1/object/public/designs/projects/6eee52ac-696b-4e54-b170-66a68a42d870/4_final/index.html<br>section_images 없음<br>output_url은 있으나 design_review라 사업자 다운로드 UI에서 숨겨질 수 있음<br>photos=0 상태에서 design 존재: 업로드 스타일링샷 검증 증거로 보기 어려움 |

### 발견 이슈
- 돈덕 순대: delivered인데 output_url 다운로드 링크 없음
- 돈덕 순대: photos=0 상태에서 design 존재: 업로드 스타일링샷 검증 증거로 보기 어려움
- 쌀과밀 소금빵: output_url은 있으나 design_review라 사업자 다운로드 UI에서 숨겨질 수 있음
- 쌀과밀 소금빵: photos 슬롯 6개 중 업로드 1개
- 황태이야기: photos=0 상태에서 design 존재: 업로드 스타일링샷 검증 증거로 보기 어려움
- 청정원 흑마늘진액: preview_url이 이미지가 아님: https://uddyemjqoxqttzpminwa.supabase.co/storage/v1/object/public/designs/projects/6eee52ac-696b-4e54-b170-66a68a42d870/4_final/index.html
- 청정원 흑마늘진액: section_images 없음
- 청정원 흑마늘진액: output_url은 있으나 design_review라 사업자 다운로드 UI에서 숨겨질 수 있음
- 청정원 흑마늘진액: photos=0 상태에서 design 존재: 업로드 스타일링샷 검증 증거로 보기 어려움
<!-- CODEX-WATCHDOG:AUTO-CHECK:END -->
## 2026-06-01 반복 문제

### 0. "최종 완성" 문서와 DB/웹앱 상태를 반드시 대조

- 최신 주장 문서: `docs/FINAL-DELIVERABLES.md`
  - 3종 데모(돈덕 순대·쌀과밀 소금빵·황태이야기)가 실제 한국어 상세페이지로 완성됐다고 기록됨.
- DB로 확인된 개선:
  - 3종 모두 최신 `scripts.ai_model`이 `claude-sonnet-4-20250514`.
  - 더미 흔적은 없고 제품 키워드가 반영됨.
  - `designs.preview_url`은 이미지 URL이고 `preview_pdf_url`도 존재.
  - section images 수: 돈덕 7장, 쌀과밀 6장, 황태 7장.
- 남은 불일치:
  - 후속 확인: `쌀과밀 소금빵`은 `output_url` JSON에 `html`, `mobile_zip`, `pc_zip`, `designer_zip`가 들어가도록 개선됨.
  - 그러나 `돈덕 순대`, `황태이야기`는 여전히 `designs.output_url`이 `null`.
  - 사업자 결과 페이지는 `design_approved` 이상이고 `output_url` JSON에 다운로드 URL이 있을 때만 "결과물 다운로드" 영역을 보여준다.
  - `쌀과밀 소금빵`은 다운로드 URL이 있어도 `design_review` 상태라 사업자 화면에서 다운로드 영역이 숨겨질 가능성이 높다.
  - 황태는 `design_review` 상태라 아직 최종 승인/납품이 아니다.
  - 돈덕은 `delivered`지만 `output_url=null`이라 다운로드 가능한 최종 파일 링크가 없다.
  - `청정원 흑마늘진액`은 아직 `preview_url`이 HTML URL이고 `output_url`에는 HTML만 있어 이미지 미리보기/zip 납품 경로가 깨져 있다.
- 빌드 확인:
  - sandbox 네트워크 제한 상태에서는 Google Fonts fetch 실패로 `npm run build`가 실패했다.
  - 네트워크 허용 상태에서는 `npm run build` 성공.
  - 단, Turbopack 경고: `next.config.ts`가 `app/api/designs/[id]/html/route.ts` import trace에 잡혀 프로젝트 전체 trace 가능성이 경고됨.
- 실패 기준:
  - 이미지/PDF 미리보기 존재만으로 "최종 납품 가능" 또는 "사업자가 다운로드 가능"이라고 주장하면 안 된다.
  - `docs/FINAL-DELIVERABLES.md`의 육안 검증 주장은 DB/브라우저 증거가 동반되지 않으면 완료 증거로 보지 않는다.
- 수용 기준:
  - 최소한 `preview_url`/`preview_pdf_url` 접근 가능성, `section_images` 렌더링, 사업자/운영자 화면 렌더링을 실제 브라우저로 확인한다.
  - 납품 완료를 주장하려면 `design_approved` 또는 `delivered` 상태와 함께 다운로드 가능한 `output_url` 또는 명시된 대체 납품 경로가 있어야 한다.

### 1. `prompt_ready` 이후 스타일링샷 업로드 플로우가 막힘

- 반복 증상: `design_plan_review -> prompt_ready` 전이는 되지만 `photos` row가 생성되지 않아 `/photography/[id]`에서 업로드할 대상이 없다.
- 확인된 샘플: `쌀과밀 소금빵` project `c0ff7994-4c13-4bbf-9ddd-d621bcfd5096`
  - status: `prompt_ready`
  - 초기 확인 photos: `0`
  - designs: `0`
  - 후속 수정 `4a4e7ff` 이후 photos: `6`
    - `photos(photo_type='styling')` 슬롯 6개 생성됨.
    - 이 중 1개만 `storage_path`가 채워짐: `projects/c0ff7994-4c13-4bbf-9ddd-d621bcfd5096/styling_test_01.png`
    - 현재 `ShootingList`는 `photos.length > 0 && photos.every((p) => p.storage_path)`일 때만 완료 버튼을 보여주므로, 6개 중 1개만 업로드된 상태는 아직 `photo_uploaded`로 넘어갈 수 있는 실사용 완료 상태가 아니다.
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
  - 모든 필수 슬롯 업로드 후 `photos.storage_path`가 채워지고 `prompt_ready -> photo_uploaded` 전이가 DB 로그로 확인된다.
  - 업로드된 스타일링샷으로 `generateDesignForProject` 풀 초안 재생성까지 완료되어 `design_review`의 preview/output이 웹앱에서 확인된다.

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
  - 이후 Supabase `designs` row는 생성됐지만 값 연결이 아직 불완전하다.
    - `preview_url`이 이미지가 아니라 `4_final/index.html` URL이다.
    - 현재 `components/designer/DesignPreview.tsx`는 `preview_url`을 `<img src=...>`로 렌더링하므로 HTML URL이면 미리보기가 깨질 가능성이 높다.
    - `output_url` JSON은 `{"html": ...}`만 있고, Storage에 존재하는 `mobile.zip`, `pc.zip`, `designer.zip` URL이 빠져 있다.
    - 따라서 `design_review` 상태와 DB row 존재만으로 "웹앱에서 실제 확인 가능한 샘플"이라고 판단하면 안 된다.
  - 의심 원인: `lib/storage.ts`의 `updateDesignUrls()`가 `edited_html_url`을 쓰지만 실제 DB schema 조회 결과 `designs` 테이블에 `edited_html_url` 컬럼이 없다. insert/update 에러를 확인하지 않아 실패가 묻히고 상태만 전이된다.
  - 후속 코드 수정 확인: `lib/storage.ts`에서 `edited_html_url` 사용을 제거하고 HTML URL을 `output_url` JSON에 넣도록 변경됨. insert/update `error`도 throw하도록 추가됨.
  - 단, 기존 `청정원 흑마늘진액` 샘플은 아직 올바른 preview/output URL 형태로 backfill/rerun되지 않았다.
- 실패 기준:
  - 로컬 파일 존재만으로 "웹앱에서 실제 확인 가능"이라고 판단하면 안 된다.
  - QA PASS만으로 샘플 완료로 간주하면 안 된다. DB와 웹앱 확인 화면까지 연결되어야 한다.
  - HTML URL을 `preview_url`에 넣고 이미지 미리보기로 사용하면 안 된다.
  - zip 산출물이 Storage에 있는데 `output_url`에 빠진 상태를 납품 가능으로 보면 안 된다.
- 수용 기준:
  - QA가 pass이거나, 법정 표시/건강 주장 문제를 명시적으로 해소한 재검증 리포트가 있다.
  - Supabase `designs` row가 생성되고 `preview_url`은 실제 이미지/PDF 미리보기로 렌더링 가능하다.
  - `output_url`에는 최소 HTML과 납품 zip(`mobile_zip`, `pc_zip`, `designer_zip` 중 생성된 항목)이 포함된다.
  - 웹앱 상세 화면에서 미리보기와 다운로드 링크가 실제 클릭 가능한 URL로 확인된다.
  - project status가 `design_review` 이상으로 전이되고 `project_logs`에 성공 전이가 기록된다.
  - `updateDesignUrls()`는 Supabase insert/update `error`를 반드시 검사하고 실패 시 상태 전이를 막거나 실패 상태로 롤백한다.

## 검증 명령

```bash
npx tsx --env-file=.env.local scripts/check-project-state.ts <projectId>
```

추가로 `photos`, `designs`, `intake_files` 개수를 직접 확인해 status만 보고 성공 판단하지 않는다.
