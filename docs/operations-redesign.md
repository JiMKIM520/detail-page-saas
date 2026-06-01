# DetailAI 운영 UI 재설계 (v3 — 2026-06-01)

> **목적**: 데모 검토에서 드러난 "운영 UI가 합의된 v6 워크플로와 어긋남"을 바로잡는 합의 문서.
> 확정 후 우선순위대로 구현한다. (참고: 메인 plan = `.claude/plans/image-pipeline-redesign.md`)

---

## 1. 왜 이 문서 (진단)

기획 파이프라인(스크립트 → 디자인기획)은 plan대로 들어갔으나, **하류 단계가 옛 이름·개념으로 방치**되고 **관리자 레이어(할당·대시보드)가 통째로 누락**됨. 데모가 "동작은 하지만 계획과 다른" 이유.

| 사용자 지적 | 정체 |
|------------|------|
| 1. 할당 기능 없음 | 회의 A2 "관리자 작업배분" — **UI 누락** (데이터 컬럼은 있음) |
| 2. 진행 대시보드 없음 | 회의 A2 "진행상황 대시보드" — **UI 누락** |
| 3. 기획검수 AI재생성/승인 작동 안 함 | `ReviewPanel`이 fetch 응답 검증 없이 무조건 목록 이동 — **버그** |
| 4. 촬영관리 정체불명 | plan 3·4단계(스타일링샷 프롬프트+이미지 업로드)인데 "촬영관리"로 오명 — **재명명·재배치** |
| 5. 디자인검수 정체불명 | plan 5단계(스타일링샷+템플릿→초안)인데 v5 완성품 검수로 남음 — **재정의** |
| 6. 사용자관리 왜? | 폐쇄형 계정 등록(필요) but 상단 전면 노출 — **설정으로 강등** |

## 2. 핵심 사실 (재설계 범위가 작은 이유)

데이터 레이어는 이미 v6 준비 완료 — **갭은 UI뿐**:

1. **status 13단계가 이미 v6 흐름** (`lib/status-machine.ts`):
   ```
   intake_submitted → script_generating → script_review → script_approved
   → design_planning → design_plan_review → prompt_ready → photo_uploaded
   → design_generating → design_review → design_approved → delivered
   ```
2. **`projects.planner_id` / `designer_id` 담당자 컬럼 이미 존재** (`001_initial_schema.sql`) → 할당은 UI만 추가
3. **`StylingPromptPanel`(스타일링샷 프롬프트 패널) 이미 구현됨** → 재명명/재배치만

## 3. 올바른 운영 구조 (목표 모습)

```
┌─ 관리자 레이어 ─────────────── (신규 UI, 데이터는 있음)
│  📊 대시보드   전체 프로젝트를 단계별로 한눈에 (status 그룹)
│  👥 할당       프로젝트 → 기획자(planner_id)/디자이너(designer_id) 배정
│
├─ 워크플로 ──────────────────── (이름·개념 교정)
│  1. 기획 검수       script_review → script_approved        [버튼 버그만 수정]
│  2. 디자인 기획      design_planning → design_plan_review    [정상 동작 확인됨]
│  3·4. 스타일링샷 제작  design_plan_review → prompt_ready → photo_uploaded
│        = 기획안 맞춤 프롬프트 + 누끼 다운로드 + 결과 이미지 업로드   [현 '촬영관리' 재명명]
│  5. 초안 제작        photo_uploaded → design_generating → design_review
│        = 스타일링샷 + 템플릿 결합 → 초안 → Figma 소스            [현 '디자인검수' 재정의]
│  6. 검수·전달        design_review → design_approved → delivered  [DeliveryPanel 활용]
│
└─ 설정 ──────────────────────
   사용자 관리 (계정 일괄 등록)                                   [상단→설정 강등]
```

## 4. 항목별 작업 명세

### A. 관리자 대시보드 (신규)
- `/dashboard` (또는 `/planner` 상위) — 전체 프로젝트를 **status별 그룹/칸반**으로 표시
- 각 카드: 회사명 · 현재 단계 · 담당자(planner/designer) · 경과일
- 단계별 카운트, 병목(오래 머문 프로젝트) 표시
- 파일: `app/(admin)/dashboard/page.tsx`(신규) + `components/admin/DashboardBoard.tsx`

### B. 할당 (신규 UI, 컬럼 활용)
- 대시보드/상세에서 **기획자·디자이너 드롭다운 배정** → `projects.planner_id`/`designer_id` 업데이트
- 운영팀 계정 목록은 role 기반(아래 결정 D1)
- 담당자별 필터("내 작업")
- 파일: `components/admin/AssignPanel.tsx` + `app/api/projects/[id]/assign/route.ts`(신규)

### C. 기획검수 버튼 버그 수정
- `ReviewPanel.tsx`: `fetch` 응답 `res.ok` 검증 → 실패 시 에러 표시, 성공 시에만 이동
- `/api/scripts/review` 동작 확인 (approve/regenerate 실제 status 전이·재생성 수행 여부)
- 파일: `components/planner/ReviewPanel.tsx`, `app/api/scripts/review/route.ts`

### D. 스타일링샷 제작 (현 /photography 재명명·재정의)
- 메뉴/제목 "촬영 관리" → **"스타일링샷 제작"**
- 목록: `design_plan_review`/`prompt_ready` 단계 프로젝트 (촬영 일정 프레이밍 제거)
- 상세: `StylingPromptPanel`을 **주 콘텐츠로** 승격 (기획안 맞춤 프롬프트 + 누끼 다운로드 + 복사) + 결과 이미지 업로드 → `photo_uploaded` 전이
- `ShootingList`(촬영 일정) 제거 또는 "결과 업로드"로 축소
- 파일: `app/(admin)/photography/` → 의미상 `styling/`로 이동 고려, `layout.tsx` 메뉴 라벨

### E. 초안 제작 (현 /designer 재정의)
- 메뉴/제목 "디자인 검수" → **"초안 제작"**
- 입력: 업로드된 스타일링샷(`photos`) + 선택된 템플릿(`style-guide`의 selectedTemplateId)
- 작업: 템플릿 + 스타일링샷 결합 → 초안 생성 → **Figma import 소스** 산출 (html.to.design)
- v5 `DesignPreview`(html-builder 완성품) 의존 정리 — 초안 작업대로 전환
- 검수·전달은 6단계(DeliveryPanel) 유지
- 파일: `app/(admin)/designer/[id]/`, `components/designer/*`

### F. 사용자관리 강등
- 상단 네비 → 우측 상단 설정 메뉴 또는 `/settings/users`
- 파일: `app/(admin)/layout.tsx`

## 5. 결정 확정 (2026-06-01 사용자 확정)

- **D1. role 체계** ✅: `admin`(관리자) / `planner`(기획) / `designer`(디자인) / `client`(사업자=고객, 별도). 기획·디자인은 **여러 명** 가능. 할당 시 해당 role 계정만 후보. → user 메타에 role 부여 + 운영팀 계정 세팅.
- **D2. 초안 제작** ✅: **자동 초안 + Figma 보정**. html-builder가 선택 템플릿 + 업로드된 스타일링샷을 결합해 HTML 초안 자동 생성 → Figma import 소스. 디자이너는 Figma에서 미세조정.
- **D3. 대시보드** ✅: **칸반** (단계별 컬럼에 프로젝트 카드).

## 6. 구현 우선순위 (확정 후)

1. **C** 기획검수 버튼 버그 (즉시, 작음)
2. **D** 스타일링샷 제작 재명명·재배치 (기능 있음, 중간)
3. **A·B** 관리자 대시보드 + 할당 (데이터 있음, 중간)
4. **E** 초안 제작 재정의 (D2 결정 의존, 큼)
5. **F** 사용자관리 강등 (작음)
