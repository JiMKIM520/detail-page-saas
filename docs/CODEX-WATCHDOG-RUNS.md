# Codex Watchdog Runs

## 2026-06-01T14:52:18.419Z

- HEAD: `2c6dd4c docs: compact 핸드오프 — MVP 우선순위(웹앱+상세페이지 완성도), 템플릿↔이미지 연속성 보류 결정 반영`
- worktree: `M docs/CODEX-WATCHDOG.md
?? docs/OVERNIGHT-PROGRESS.md
?? scripts/codex-watchdog.ts`
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
## 2026-06-01T23:22:19.345Z

- HEAD: `2c6dd4c docs: compact 핸드오프 — MVP 우선순위(웹앱+상세페이지 완성도), 템플릿↔이미지 연속성 보류 결정 반영`
- worktree: `M agents/html-builder.ts
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
## 2026-06-01T23:38:35.801Z

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
