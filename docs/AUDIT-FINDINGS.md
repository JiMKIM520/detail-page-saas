# 코드 정적 감사 결과 (서브에이전트)

감사 일시: 2026-06-01  
감사 범위: API 라우트 전체, 페이지/접근제어, 이미지 보호, 코드 품질

---

## CRITICAL (기능 깨짐 / 보안 / 데이터 노출)

### C-1. `app/api/photography/shooting-list/route.ts:5-7` — 인증·역할 가드 완전 누락
- **근거**: 라우트 최상단에 `createClient()` / `getUser()` 호출이 없다. 서비스 클라이언트만 직접 사용하고, 인증 여부·역할을 전혀 확인하지 않는다. 인터넷에서 `project_id`만 알면 누구나 촬영 리스트를 생성하고 `photo_scheduled` 상태로 전이시킬 수 있다.
- **권장 수정**: 다른 photography 라우트(`/complete`)처럼 `createClient()` → `getUser()` → role 검증 추가. 최소 `['admin', 'planner', 'designer']` 허용.

### C-2. `proxy.ts:9` — `/dashboard` 경로가 ADMIN_PATHS에 없음
- **근거**: `ADMIN_PATHS = ['/planner', '/designer', '/photography', '/users']`에 `/dashboard`가 빠져 있다. 미들웨어는 인증된 모든 사용자에게 `/dashboard`를 허용한다. 클라이언트(사업자) 계정이 `/dashboard`에 직접 URL 접근하면 AdminLayout의 서버 컴포넌트 검사(`!['admin','planner','designer'].includes(role)`)가 `/projects`로 리다이렉트하긴 하지만, 미들웨어 레이어에서 차단되지 않아 **두 겹 보호 중 하나가 누락**된 상태다. page-level guard에 의존하는 단일-방어선 구조.
- **권장 수정**: `ADMIN_PATHS`에 `'/dashboard'` 추가.

### C-3. `proxy.ts:6` — `/admin` 경로가 PUBLIC_PATHS에 포함됨
- **근거**: `PUBLIC_PATHS = ['/login', '/admin', '/signup', ...]`이므로 `/admin`으로 시작하는 모든 경로는 인증 없이 접근 가능하다. `app/(auth)/admin/page.tsx`가 admin 로그인 페이지로 의도된 것이라면 정상이지만, 추후 `/admin/...` 하위 경로가 추가될 경우 자동으로 공개 경로가 된다. 현재는 단일 페이지이므로 즉각적 취약점은 아니지만, 정확한 경로 매칭으로 범위를 제한해야 한다.
- **권장 수정**: `'/admin'` → `'/admin'` (exact) 또는 `pathname === '/admin'`으로 좁히거나, admin 로그인 페이지를 `/login?admin=1` 등으로 통합하고 PUBLIC_PATHS에서 제거.

### C-4. `app/api/scripts/generate/route.ts:6-9` — 인증·역할 가드 완전 누락
- **근거**: 라우트 전체에 `createClient()` / `getUser()` 호출이 없다. `project_id`만 알면 누구나 AI 스크립트 재생성을 무제한 트리거할 수 있다(Claude API 비용 소모 + 상태 오염).
- **권장 수정**: `scripts/review/route.ts` 패턴 동일하게 `['admin','planner']` 역할 검증 추가.

---

## HIGH (버그 / 주요 품질)

### H-1. `app/api/scripts/ab-test/route.ts:19` — fire-and-forget으로 A/B 변형 생성 (Vercel에서 중단됨)
- **근거**: `generateAbVariant(project_id, script_id)` 앞에 `await`가 없다. `scripts/review/route.ts:46`의 주석에서 "await 필수: fire-and-forget 시 Vercel 서버리스가 응답 후 함수를 종료해 재생성이 중단됨"이라고 명시했음에도, ab-test 라우트에는 동일한 조치가 적용되지 않았다. Vercel 환경에서 A/B 변형이 항상 무음으로 실패한다.
- **권장 수정**: `await generateAbVariant(project_id, script_id)` + maxDuration 설정.

### H-2. `app/api/projects/route.ts:78` — 프로젝트 생성 후 스크립트 생성 fire-and-forget (Vercel 중단)
- **근거**: `generateScriptForProject(data.id)` 앞에 `await` 없음. H-1과 동일한 Vercel 서버리스 함수 종료 문제. 프로젝트는 생성되고 `intake_submitted` 상태에 머무르며, 스크립트 생성이 조용히 실패한다.
- **근거 보충**: `generate-script.ts:211-217` catch 블록이 `intake_submitted`로 롤백하므로, 실패 자체는 핸들링되지만 Vercel에서는 함수가 종료되어 catch도 실행되지 않는다.
- **권장 수정**: `await generateScriptForProject(data.id)` + maxDuration 설정, 또는 백그라운드 잡 큐 사용.

### H-3. `lib/ai/generate-script.ts:281` — A/B 재시도 시 JSON 파싱 실패를 throw하지 않음 (무음 실패)
- **근거**: `generateAbVariant` 함수 내부 두 번째 catch 블록(278~283줄)에서 재시도 후에도 JSON 파싱이 실패하면 `JSON.parse(retried)` 예외가 그대로 throw되어 호출자(`ab-test/route.ts`)에서 잡히지 않는다. H-1과 결합하면 오류가 완전히 소멸된다.
- **권장 수정**: catch 내부에 적절한 에러 로깅 및 scripts 테이블 상태 업데이트 추가.

### H-4. `app/api/designs/review/route.ts:24-32` — design_id / project_id 입력 검증 없음
- **근거**: `action`, `design_id`, `project_id`, `notes`, `output_url`을 request.json()에서 직접 사용하는데, `design_id`와 `project_id`가 빈 값이거나 null일 때 Supabase 쿼리가 예기치 않게 동작한다(`.eq('id', undefined)`는 실제로 WHERE 절 없이 전체 업데이트를 유발할 수 있음).
- **권장 수정**: Zod 스키마로 `project_id`, `design_id`를 `z.string().uuid()`로 검증.

### H-5. `app/api/designs/[id]/copy/route.ts:83-86` — 클라이언트가 프로젝트 파일을 직접 쓸 수 있음 (PATCH)
- **근거**: 소유권 검증이 `project.client_id !== user.id && !isAdmin`이므로 클라이언트도 PATCH 허용 대상이다. 클라이언트가 `regenerateHtml=true`로 보내면 서버의 로컬 파일시스템에 HTML을 직접 재생성할 수 있다. 의도된 설계인지 확인 필요.
- **권장 수정**: 확인필요 — 클라이언트가 카피 편집을 할 수 있도록 의도된 것이라면 허용 범위 제한(예: `regenerateHtml`은 admin/designer 전용으로 분리).

### H-6. `app/(admin)/dashboard/page.tsx:84-135` — 페이지 내 role 검증 없음 (미들웨어 누락과 결합)
- **근거**: C-2와 연결. `DashboardPage`는 `createClient()`로 인증 확인하지만 role 검증이 없다. 레이아웃(`AdminLayout`)이 role 검증을 하지만, RSC(서버 컴포넌트) 렌더링 순서에서 레이아웃이 먼저 실행됨을 보장하기 어려운 엣지 케이스에서 문제가 될 수 있다. 또한 `supabase.from('user_profiles').select(...)`가 인증된 사용자 클라이언트로 실행되어 RLS 정책에 의존하는데, 클라이언트가 다른 사용자의 이름을 볼 수 있는지 RLS 정책을 별도 확인 필요.
- **권장 수정**: `DashboardPage`에 직접 role 검증 + `ADMIN_PATHS` 수정(C-2).

### H-7. `app/api/photography/complete/route.ts:30` — fire-and-forget 디자인 생성 (Vercel 중단)
- **근거**: `generateDesignForProject(project_id).catch(console.error)` — await 없음. 주석에서 Vercel 환경에서 중단됨을 인지하고 있으나 미해결 상태. 결과적으로 `photo_uploaded` → `design_generating` 상태 전이만 발생하고 실제 디자인은 생성되지 않는다.
- **권장 수정**: `await`로 변경 + maxDuration 설정 (현재 300s 제한), 또는 Supabase Edge Functions / 큐로 분리.

### H-8. `agents/pm.ts` — 800줄 초과 (812줄)
- **근거**: `wc -l agents/pm.ts` = 812. 프로젝트 코딩 기준(800줄 max) 초과.
- **권장 수정**: runPipeline / runPlanningPipeline 각각 별도 모듈로 분리.

---

## MEDIUM (유지보수 / UX)

### M-1. `proxy.ts:9` — ADMIN_PATHS가 `planner`, `designer` 역할을 구분하지 않음
- **근거**: 미들웨어는 `/planner`, `/designer`, `/photography`, `/users` 모두에 대해 role이 `'admin'`인지만 확인한다(`role !== 'admin'`). 그러나 API 라우트들은 planner/designer를 별도로 허용한다. 미들웨어에서 designer가 `/planner`에 접근하면 차단된다. AdminLayout은 `['admin','planner','designer']` 모두 허용하므로 미들웨어와 레이아웃 간 정책이 불일치한다.
- **권장 수정**: 미들웨어의 역할 검증을 `!['admin','planner','designer'].includes(role ?? '')` 로 변경하고, `/users`만 admin 전용으로 별도 처리.

### M-2. `app/api/comments/route.ts:93-95` — 클라이언트가 임의 role로 댓글 삽입 가능
- **근거**: `role: role ?? 'client'` — user_metadata.role이 없으면 'client'가 되지만, admin/planner/designer가 댓글을 달면 해당 role이 그대로 저장된다. 이는 의도된 동작이나, 악의적 사용자가 자신의 role을 조작해 댓글에 'admin' 역할을 붙일 수 없는지(user_metadata.role은 서버에서 관리되므로 직접 조작 불가) 확인 필요. 현 구조에서는 문제없지만 코드만 보면 불명확하다.
- **권장 수정**: `role` 필드를 서버에서 DB로 검증하거나, enum 허용값을 코드에 명시.

### M-3. `app/api/designs/[id]/copy/route.ts:32-45` — 로컬 파일시스템 의존 (Vercel에서 동작 불가)
- **근거**: `fs.readFileSync(path.join(process.cwd(), 'output', projectId, ...))` — Vercel 서버리스에서 `process.cwd()` 하위의 `output/` 디렉토리는 배포 시 존재하지 않는다. 이 API는 Vercel 환경에서 404를 반환한다.
- **권장 수정**: Supabase Storage에서 직접 읽도록 변경 (lib/storage.ts의 `downloadFromStorage` 활용).

### M-4. `app/api/designs/[id]/html/route.ts:38-49` — 동일한 로컬 파일시스템 의존
- **근거**: M-3과 동일. `output/{projectId}/4_final/index.html`을 로컬에서 읽는다.
- **권장 수정**: Supabase Storage에서 HTML 파일 읽기로 전환.

### M-5. `app/api/designs/[id]/image/route.ts:49-64` — 동일한 로컬 파일시스템 의존
- **근거**: M-3, M-4와 동일 패턴. Vercel 배포 시 이미지 프록시가 동작하지 않는다.

### M-6. `lib/ai/generate-script.ts:199-217` — catch 블록에서 상태를 직접 업데이트 (transitionStatus 우회)
- **근거**: catch 블록(213줄)에서 `supabase.from('projects').update({ status: 'intake_submitted' })`를 직접 호출한다. `transitionStatus`를 거치지 않아 project_logs에 기록되지 않고 상태 머신 규칙도 검사하지 않는다.
- **권장 수정**: `transitionStatus(supabase, projectId, 'intake_submitted', { note: ... })`로 교체.

### M-7. `app/(admin)/planner/[id]/page.tsx:27` — any 캐스팅 다수
- **근거**: `(project.platforms as any)?.name`, `script.content as any`, `section: any` 등 any 남용. 타입 안전성 없이 런타임 오류 위험.
- **권장 수정**: agents/types.ts의 타입을 활용하거나 최소한 `unknown`으로 변경 후 narrowing.

### M-8. `components/client/ProtectedImage.tsx` — 이미지 보호가 preview_url에만 적용됨
- **근거**: `ProtectedImage`가 `app/(client)/projects/[id]/page.tsx:179`의 `preview_url`에는 올바르게 적용되어 있다. 그러나 다운로드 링크(`downloadUrls.mobile_zip`, `pc_zip`, `designer_zip`)는 `<a href="..." download>` 태그로 직접 노출되어 있다(199-234줄). 인증된 클라이언트라면 zip 다운로드가 의도된 동작이나, `designer_zip`(HTML + 폰트 포함)도 클라이언트에게 공개된다.
- **권장 수정**: 확인필요 — `designer_zip`을 클라이언트에게 노출하는 것이 의도인지 확인. 아니라면 `hasDownloads` 조건에서 `designer_zip` 제외 또는 admin-only 다운로드로 처리.

---

## LOW (사소)

### L-1. `proxy.ts:6` — PUBLIC_PATHS에 `/signup` 포함 (폐쇄형 SaaS와 불일치)
- **근거**: CLAUDE.md에 "공개 가입 기능 절대 추가 금지"라고 명시되어 있으나, `/signup`이 PUBLIC_PATHS에 포함되어 미인증 접근이 가능하다. `app/(auth)/signup/page.tsx`가 실제로 가입 기능을 하는지 확인 필요.
- **권장 수정**: `/signup` 페이지가 사용되지 않는다면 PUBLIC_PATHS에서 제거하거나 페이지 자체를 삭제.

### L-2. `lib/status-machine.ts:75-76` — `supabase` 파라미터 타입이 `any`
- **근거**: `transitionStatus(supabase: any, ...)` — eslint-disable 주석으로 억제됨. 서비스 클라이언트와 일반 클라이언트 모두 전달되기 때문이나, 제네릭 또는 union 타입으로 개선 가능.

### L-3. `app/(admin)/designer/[id]/page.tsx:15` — `.single()` 사용 시 디자인 미존재 처리 없음
- **근거**: `await supabase.from('designs').select('*').eq('project_id', id)...single()` — 디자인이 없으면 null이 반환되어 `DesignPreview`, `DeliveryPanel`에 null이 전달된다. 컴포넌트가 null을 처리하는지 확인 필요.

### L-4. `app/(admin)/photography/[id]/page.tsx` — 프로젝트 소유권 검증 없음 (관리자 경로이므로 낮은 위험도)
- **근거**: `supabase.from('projects').select('...').eq('id', id).single()` 후 client_id 비교 없이 `notFound()`만 처리. 관리자 경로이므로 AdminLayout이 role 검증을 하지만, 다른 관리자 프로젝트의 ID를 직접 URL에 넣으면 모든 관리자가 모든 프로젝트를 볼 수 있다. 의도된 동작으로 보임.

### L-5. `app/api/admin/bulk-register/route.ts` / `register-users/route.ts` — auth 생성 성공 후 프로필 생성 실패 시 고아 계정 발생
- **근거**: auth 사용자 생성 성공 후 user_profiles insert가 실패하면 `results.push({ email, success: false, error: ... })`로 실패 처리하지만, 이미 생성된 auth 사용자는 삭제되지 않는다. 이후 동일 이메일로 재시도 시 "Email already exists" 오류가 발생한다.
- **권장 수정**: 프로필 생성 실패 시 `service.auth.admin.deleteUser(authData.user.id)` 롤백 추가.

### L-6. `next.config.ts` — Content-Security-Policy 헤더 없음
- **근거**: securityHeaders에 X-Frame-Options, HSTS, X-Content-Type-Options, Referrer-Policy는 있으나 CSP가 없다. XSS 방어를 위한 추가 레이어 부재.

---

## 요약

| Severity | 건수 |
|----------|------|
| CRITICAL | 4건 |
| HIGH     | 8건 |
| MEDIUM   | 8건 |
| LOW      | 6건 |

**즉시 수정 필요 (운영 영향)**: C-1 (shooting-list 미인증), C-4 (scripts/generate 미인증), H-1/H-2/H-7 (Vercel fire-and-forget 무음 실패).  
**보안 강화**: C-2 (dashboard 미들웨어 누락), C-3 (PUBLIC_PATHS /admin 범위 과대), M-1 (미들웨어-레이아웃 role 불일치).
