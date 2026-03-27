# 상세페이지 AI 자동화 SaaS — 구현 진행 현황

> **최종 업데이트:** 2026-03-26
> **프로젝트 경로:** `/Users/jinman/Desktop/Projects/detail-page-saas/`
> **계획 문서:** `/Users/jinman/Desktop/Projects/plans/2026-03-25-detail-page-saas-mvp.md`

---

## 1. 프로젝트 개요

- **목표:** 기업 정보 입력 → AI 스크립트·디자인 자동 생성 → 기획자·디자이너 검수 → 납품
- **배경:** 정부 지원 사업(하나은행), 200개소 대상, 건당 80만원
- **Tech Stack:** Next.js 16, TypeScript, Tailwind CSS, Supabase (DB/Auth/Storage), Claude Sonnet 4.6 (스크립트), Vertex AI Imagen 4 (이미지), Vercel

---

## 2. 구현 완료 상태 (Task 1~11 전체 완료)

### 커밋 이력

| 커밋 | 설명 |
|------|------|
| `d71e03e` | Initial commit from Create Next App |
| `e76c928` | chore: init Next.js 15 + Supabase + AI SDK setup |
| `4cfb69e` | feat: database schema, RLS policies, platform seed data |
| `b229918` | feat: Supabase clients, service role client, status machine |
| `3823f9b` | feat: user provisioning API, seed script, sign-out action |
| `932e3b6` | feat: auth proxy, login page, role-based routing |
| `7a3cb7d` | feat: client intake form with Zod validation |
| `b7cb9e8` | feat: Claude API script generation with prompts |
| `f70f355` | feat: planner review dashboard with approve/regenerate |
| `a0ba6ac` | feat: photography module (shooting list + upload) |
| `6fd8ded` | fix: harden shooting-list API, add error feedback |
| `76673a6` | feat: AI design generation + designer review workflow |
| `830f1ac` | fix: harden design generation pipeline error handling |
| `7a7ae62` | feat: client project dashboard with status tracking |
| `abd7eef` | feat: production deployment config |

### Task 완료 요약

| Task | 내용 | 상태 |
|------|------|------|
| 1 | 프로젝트 초기 셋업 (Next.js + Supabase + AI SDK) | ✅ |
| 2 | DB 스키마 (6 테이블 + RLS + 시드) | ✅ |
| 3 | Supabase 클라이언트 (browser/server/service) + 상태 머신 | ✅ |
| 3.5 | 사용자 프로비저닝 API + 시드 스크립트 | ✅ |
| 4 | 인증 (proxy.ts + 로그인 + 역할 기반 라우팅) | ✅ |
| 5 | 클라이언트 Intake Form (react-hook-form + Zod) | ✅ |
| 6 | AI 스크립트 생성 (Claude Sonnet 4.6 + fire-and-forget) | ✅ |
| 7 | 기획자 대시보드 (스크립트 뷰어 + 승인/재생성) | ✅ |
| 8 | 촬영 모듈 (촬영 리스트 + 사진 업로드 + 완료 API) | ✅ |
| 9 | AI 디자인 생성 (Imagen 4) + 디자이너 검수/납품 | ✅ |
| 10 | 클라이언트 프로젝트 현황 페이지 | ✅ |
| 11 | 배포 설정 (next.config.ts + 빌드 검증 통과) | ✅ |

---

## 3. 프로젝트 상태 흐름 (10단계)

```
intake_submitted
  → script_generating → script_review → script_approved
  → photo_scheduled → photo_uploaded
  → design_generating → design_review → design_approved
  → delivered
```

---

## 4. 파일 구조

```
detail-page-saas/
├── app/
│   ├── (auth)/login/page.tsx              # 로그인 (Supabase Auth)
│   ├── (client)/
│   │   ├── layout.tsx                     # 클라이언트 레이아웃 + 롤 가드
│   │   ├── intake/page.tsx                # 작업지시서 입력 폼
│   │   └── projects/page.tsx              # 내 프로젝트 현황
│   ├── (admin)/
│   │   ├── layout.tsx                     # 어드민 레이아웃 + 롤 가드
│   │   ├── planner/page.tsx               # 스크립트 검수 대기 목록
│   │   ├── planner/[id]/page.tsx          # 스크립트 상세 검수
│   │   ├── photography/page.tsx           # 촬영 대기 목록
│   │   ├── photography/[id]/page.tsx      # 촬영 리스트 + 사진 업로드
│   │   ├── designer/page.tsx              # 디자인 검수 대기 목록
│   │   └── designer/[id]/page.tsx         # 디자인 상세 검수 + 납품
│   ├── actions/auth.ts                    # 로그아웃 서버 액션
│   └── api/
│       ├── admin/users/route.ts           # 사용자 생성 (어드민 전용)
│       ├── projects/route.ts              # 프로젝트 생성 + 스크립트 생성 트리거
│       ├── scripts/generate/route.ts      # 스크립트 수동 재생성
│       ├── scripts/review/route.ts        # 스크립트 승인/재생성
│       ├── photography/shooting-list/route.ts  # 촬영 리스트 생성
│       ├── photography/complete/route.ts  # 촬영 완료 → 디자인 생성 트리거
│       ├── designs/generate/route.ts      # 디자인 수동 재생성
│       └── designs/review/route.ts        # 디자인 승인 + 납품
├── components/
│   ├── intake/IntakeForm.tsx              # 작업지시서 폼 (react-hook-form + Zod)
│   ├── planner/ScriptViewer.tsx           # 스크립트 JSON 렌더러
│   ├── planner/ReviewPanel.tsx            # 승인/재생성 패널
│   ├── photography/ShootingList.tsx       # 촬영 리스트 + 업로드 UI
│   ├── designer/DesignPreview.tsx         # 디자인 이미지 프리뷰
│   ├── designer/DeliveryPanel.tsx         # 납품 파일 업로드 + 승인
│   ├── shared/StatusBadge.tsx             # 상태 뱃지 (색상 코딩)
│   └── shared/ProjectCard.tsx             # 프로젝트 카드
├── lib/
│   ├── ai/
│   │   ├── claude.ts                      # Anthropic SDK (claude-sonnet-4-6)
│   │   ├── imagen.ts                      # Vertex AI Imagen 4 래퍼
│   │   ├── generate-script.ts             # 스크립트 생성 오케스트레이터
│   │   ├── generate-design.ts             # 디자인 생성 오케스트레이터
│   │   └── prompts/script-base.ts         # 스크립트 시스템 프롬프트
│   ├── status-machine.ts                  # 상태 머신 (전환 검증 + 로그)
│   └── supabase/
│       ├── client.ts                      # 브라우저 클라이언트
│       ├── server.ts                      # 서버 클라이언트 (쿠키 기반)
│       ├── service.ts                     # 서비스 롤 클라이언트 (RLS 우회)
│       └── types.ts                       # DB 타입 정의
├── supabase/migrations/
│   ├── 001_initial_schema.sql             # 6 테이블 + updated_at 트리거
│   ├── 002_rls_policies.sql               # RLS 정책 (역할별 분리)
│   └── 003_seed_platforms.sql             # 4개 플랫폼 시드
├── scripts/seed-users.ts                  # 어드민/기획자/디자이너 시드
├── proxy.ts                               # Next.js 16 인증 프록시 (middleware 대체)
└── next.config.ts                         # 이미지 도메인 + 배포 설정
```

---

## 5. 핵심 아키텍처 패턴

### 서버-서버 통신
- `fetch()` 체인 사용 금지 — RLS가 쿠키 없는 요청을 차단함
- 모든 백그라운드 작업은 `createServiceClient()` (서비스 롤 키) 직접 호출

### 상태 전환
- 모든 상태 변경은 `transitionStatus()` 헬퍼 통해 실행
- 전환 검증 (`canTransition`) + 자동 로그 (`project_logs`)
- 예외: `generate-design.ts` 실패 롤백은 직접 업데이트 (역방향 전환이 상태 머신에 없음)

### Fire-and-forget 패턴
- AI 생성 함수는 API 라우트에서 `await` 없이 호출
- `.catch(console.error)`로 미처리 rejection 방지
- 생성 완료 시 자동 상태 전환

### 4-Role 시스템
| 역할 | 라우트 그룹 | 주요 기능 |
|------|------------|----------|
| client | `(client)/*` | 작업지시서 제출, 프로젝트 현황 |
| planner | `(admin)/planner/*` | 스크립트 검수 (승인/재생성) |
| designer | `(admin)/designer/*` | 디자인 검수 + 최종 납품 |
| admin | `(admin)/*` | 전체 접근 + 사용자 관리 |

---

## 6. 환경 변수

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Claude API
ANTHROPIC_API_KEY=

# Vertex AI (Imagen 4)
GOOGLE_CLOUD_PROJECT_ID=
GOOGLE_APPLICATION_CREDENTIALS=./gcp-service-account.json

# App
NEXT_PUBLIC_APP_URL=https://<domain>.vercel.app
```

---

## 7. 배포 전 수동 작업 체크리스트

- [ ] Supabase 프로젝트 생성 + 마이그레이션 SQL 실행 (001~003)
- [ ] Supabase Storage 버킷 생성: `photos` (private), `designs` (public)
- [ ] `npx tsx scripts/seed-users.ts` — 초기 사용자 시드
- [ ] GCP 프로젝트 설정 + Vertex AI API 활성화 + 서비스 계정 키 생성
- [ ] Vercel 프로젝트 생성 + 환경 변수 6개 설정
- [ ] `npx vercel --prod` 배포
- [ ] E2E 검증:
  - [ ] 클라이언트 로그인 → 작업지시서 제출
  - [ ] 스크립트 자동 생성 확인
  - [ ] 기획자 로그인 → 스크립트 승인
  - [ ] 촬영 리스트 생성 + 사진 업로드
  - [ ] 디자인 자동 생성 확인
  - [ ] 디자이너 승인 + 납품
  - [ ] 클라이언트 프로젝트 상태 `delivered` 확인

---

## 8. 코드 리뷰에서 반영된 주요 수정사항

### Task 8 (촬영 모듈)
- `shooting-list/route.ts`: `createClient()` → `createServiceClient()` + `transitionStatus()`
- `shooting-list/route.ts`: `shooting_requirements` null-safety 가드 추가
- `shooting-list/route.ts`: insert 에러 체크 후 상태 전환
- `ShootingList.tsx`: 업로드 실패 시 alert 피드백, fetch 응답 체크

### Task 9 (디자인 모듈)
- `generate-design.ts`: Storage upload 에러 체크
- `generate-design.ts`: `content.sections` 배열 검증
- `imagen.ts`: `GOOGLE_CLOUD_PROJECT_ID` env var fail-fast 가드
- `designs/review/route.ts`: `createServiceClient()` + `transitionStatus()` 사용 (계획 원본의 `createClient()` 직접 업데이트 패턴 수정)
- `designs/review/route.ts`: 알 수 없는 action에 400 에러 반환
- fire-and-forget 호출에 `.catch(console.error)` 추가

---

## 9. 향후 확장 계획 (Post-MVP)

- [ ] AI 이미지 후보정 (배경 제거, 색보정) — Replicate/Remove.bg API
- [ ] 플랫폼별 자동 업로드 — 스마트스토어 파트너 API
- [ ] 카카오 알림톡 / 이메일 자동 발송
- [ ] 어드민 계정 관리 페이지
- [ ] 다중 사업별 전용 프론트 분기 (사업코드 기반)
- [ ] 통계 대시보드 (완료 건수, 평균 처리 시간, AI 비용 현황)

---

## 10. 비용 추정 (건당)

| 항목 | 건당 예상 |
|------|---------|
| Claude Sonnet 4.6 스크립트 | ~₩1,500 |
| Vertex AI Imagen 4 (3장) | ~₩1,800 |
| Supabase Storage | 무시 |
| Vertex AI 인프라 | ~₩200 |
| **총 AI 비용** | **~₩3,500** |
| **매출** | **₩800,000** |
| **마진** | **₩796,500 (99.6%)** |
