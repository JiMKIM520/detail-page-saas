# 상세페이지 AI 자동화 SaaS — MVP 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 기업 정보를 입력하면 AI가 상세페이지 스크립트·디자인을 자동 생성하고, 기획자·디자이너 검수를 거쳐 납품하는 4단계 워크플로우 SaaS MVP 구축

**Architecture:** Next.js 15 App Router 단일 앱 + Supabase(DB/Auth/Storage) + Claude Sonnet 4.6(스크립트) + Vertex AI Imagen 4(이미지). 클라이언트·기획자·디자이너·어드민 4개 롤 기반 라우팅. 프로젝트 상태 머신으로 단계 전환 관리.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Supabase, Claude API (claude-sonnet-4-6), Google Vertex AI Imagen 4, Vercel

> **⚠️ 리뷰 반영 수정사항 (2026-03-25)**
> - CRITICAL: 서버→서버 fetch() 체인 → service role client 직접 호출로 교체 (RLS 우회 방지)
> - CRITICAL: 사용자 프로비저닝 Task 추가 (Task 3.5)
> - MAJOR: 상태 머신 `transitionStatus` 헬퍼 추가 및 전체 적용
> - MAJOR: `project_logs` RLS 추가 + 모든 상태 전환에 로그 기록
> - MAJOR: 기획자 "수정 요청" 액션 → MVP에서 제거, 승인/재생성만 유지
> - MAJOR: RLS `for all` → 역할별 분리 정책으로 교체

---

## 배경 및 비즈니스 컨텍스트

- **정부 지원 사업(하나은행)** 200개소 대상 상세페이지 제작 → 건당 80만원
- **기존**: 외부 업체 위탁 → **목표**: 자체 AI 자동화로 전환
- **차별점**: 완전 자동화 아님 — 기획자 + 디자이너 검수 포함(완성도 80→100%)
- **제약**: SNS 링크 크롤링 불가(메타 차단) → 상세페이지 URL만 허용

## 프로젝트 상태 흐름

```
intake_submitted
  → script_generating → script_review → script_approved
  → photo_scheduled → photo_uploaded
  → design_generating → design_review → design_approved
  → delivered
```

## 파일 구조

```
detail-page-saas/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx              # 로그인 페이지 (Supabase Auth)
│   ├── (client)/
│   │   ├── layout.tsx                  # 클라이언트 레이아웃 + 롤 가드
│   │   ├── intake/page.tsx             # 작업지시서 입력 폼
│   │   └── projects/page.tsx           # 내 프로젝트 현황
│   ├── (admin)/
│   │   ├── layout.tsx                  # 어드민 레이아웃 + 롤 가드
│   │   ├── planner/
│   │   │   ├── page.tsx                # 기획자 대시보드 (스크립트 검수 목록)
│   │   │   └── [id]/page.tsx           # 스크립트 검수 상세
│   │   ├── photography/
│   │   │   ├── page.tsx                # 촬영 대기 목록
│   │   │   └── [id]/page.tsx           # 촬영 리스트 + 사진 업로드
│   │   └── designer/
│   │       ├── page.tsx                # 디자이너 대시보드 (디자인 검수 목록)
│   │       └── [id]/page.tsx           # 디자인 검수 + 납품
│   └── api/
│       ├── projects/route.ts           # 프로젝트 CRUD
│       ├── scripts/generate/route.ts   # Claude API 스크립트 생성
│       ├── scripts/review/route.ts     # 기획자 검수 처리
│       ├── photography/shooting-list/route.ts  # 촬영 리스트 생성
│       ├── photography/complete/route.ts       # 촬영 완료 처리
│       └── designs/generate/route.ts   # 이미지 생성 + 디자인 합성
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   # 브라우저 클라이언트
│   │   ├── server.ts                   # 서버 클라이언트
│   │   ├── service.ts                  # 서비스 롤 클라이언트 (서버 백그라운드 작업용)
│   │   └── types.ts                    # DB 타입 자동 생성 타입
│   ├── ai/
│   │   ├── claude.ts                   # Claude API 래퍼
│   │   ├── imagen.ts                   # Vertex AI Imagen 4 래퍼
│   │   └── prompts/
│   │       ├── script-base.ts          # 공통 스크립트 프롬프트
│   │       ├── smartstore.ts           # 스마트스토어 스타일 가이드
│   │       ├── gmarket.ts              # G마켓 스타일 가이드
│   │       └── shooting-list.ts        # 촬영 리스트 생성 프롬프트
│   └── status-machine.ts               # 프로젝트 상태 전환 로직
├── components/
│   ├── intake/
│   │   └── IntakeForm.tsx              # 작업지시서 멀티스텝 폼
│   ├── planner/
│   │   ├── ScriptViewer.tsx            # 스크립트 뷰어 (섹션별)
│   │   └── ReviewPanel.tsx             # 승인/수정/추가요청 패널
│   ├── photography/
│   │   ├── ShootingList.tsx            # 촬영 리스트 체크리스트
│   │   └── PhotoUploader.tsx           # Supabase Storage 업로더
│   ├── designer/
│   │   ├── DesignPreview.tsx           # 디자인 미리보기
│   │   └── DeliveryPanel.tsx           # 납품 파일 업로드 + 완료처리
│   └── shared/
│       ├── StatusBadge.tsx             # 상태 배지 컴포넌트
│       └── ProjectCard.tsx             # 프로젝트 카드 컴포넌트
└── supabase/
    └── migrations/
        ├── 001_initial_schema.sql      # 테이블 생성
        ├── 002_rls_policies.sql        # Row Level Security
        └── 003_seed_platforms.sql      # 플랫폼 초기 데이터
```

---

## Task 1: 프로젝트 초기 셋업

**Files:**
- Create: `detail-page-saas/` (new Next.js project)
- Create: `.env.local`
- Create: `supabase/migrations/001_initial_schema.sql`

- [ ] **Step 1: Next.js 프로젝트 생성**

```bash
cd ~/Desktop/Projects
npx create-next-app@latest detail-page-saas \
  --typescript --tailwind --app --src-dir=false \
  --import-alias="@/*"
cd detail-page-saas
```

- [ ] **Step 2: 의존성 설치**

```bash
npm install @supabase/supabase-js @supabase/ssr \
  @anthropic-ai/sdk @google-cloud/aiplatform \
  react-hook-form @hookform/resolvers zod \
  lucide-react clsx
npm install -D supabase
```

- [ ] **Step 3: Supabase 프로젝트 초기화**

[Supabase Dashboard](https://app.supabase.com)에서 새 프로젝트 생성 후:

```bash
npx supabase init
npx supabase login
npx supabase link --project-ref <PROJECT_REF>
```

- [ ] **Step 4: 환경 변수 설정**

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
ANTHROPIC_API_KEY=<anthropic-key>
GOOGLE_CLOUD_PROJECT_ID=<gcp-project-id>
GOOGLE_APPLICATION_CREDENTIALS=./gcp-service-account.json
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- [ ] **Step 5: 개발 서버 확인**

```bash
npm run dev
```
Expected: `http://localhost:3000` 정상 실행

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "chore: init Next.js 15 + Supabase + AI SDK setup"
```

---

## Task 2: 데이터베이스 스키마

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`
- Create: `supabase/migrations/002_rls_policies.sql`
- Create: `supabase/migrations/003_seed_platforms.sql`
- Create: `lib/supabase/types.ts`

- [ ] **Step 1: 스키마 작성**

```sql
-- supabase/migrations/001_initial_schema.sql

-- 플랫폼 (스마트스토어, G마켓 등)
create table platforms (
  id uuid primary key default gen_random_uuid(),
  name text not null,           -- '스마트스토어'
  slug text not null unique,    -- 'smartstore'
  style_guide text,             -- AI 프롬프트용 스타일 가이드
  created_at timestamptz default now()
);

-- 프로젝트 (메인 테이블)
create table projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references auth.users(id) not null,
  planner_id uuid references auth.users(id),
  designer_id uuid references auth.users(id),
  status text not null default 'intake_submitted',
  -- 작업지시서 정보
  company_name text not null,
  homepage_url text,
  detail_page_url text,         -- 참조 상세페이지 URL
  product_highlights text,      -- 강조할 포인트
  reference_notes text,         -- 기타 참고사항
  platform_id uuid references platforms(id),
  category text,                -- 식품, 패션, 뷰티 등
  -- 메타
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- AI 생성 스크립트
create table scripts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) not null,
  content jsonb not null,       -- 섹션별 스크립트 JSON
  ai_model text,                -- 사용된 AI 모델
  planner_status text default 'pending', -- pending | approved | revision_requested
  planner_notes text,
  version int default 1,
  created_at timestamptz default now()
);

-- 사진 파일
create table photos (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) not null,
  storage_path text not null,   -- Supabase Storage 경로
  photo_type text not null,     -- 'nukki' | 'styling'
  is_retouched boolean default false,
  retouched_path text,
  shooting_list_item text,      -- 촬영 리스트 항목
  created_at timestamptz default now()
);

-- AI 생성 디자인
create table designs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) not null,
  preview_url text,             -- 미리보기 이미지
  output_url text,              -- 최종 납품 파일 URL
  designer_status text default 'pending', -- pending | approved | revision_requested
  designer_notes text,
  version int default 1,
  created_at timestamptz default now()
);

-- 프로젝트 상태 변경 이력
create table project_logs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) not null,
  from_status text,
  to_status text not null,
  changed_by uuid references auth.users(id),
  note text,
  created_at timestamptz default now()
);

-- updated_at 자동 갱신 트리거
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger projects_updated_at
  before update on projects
  for each row execute function update_updated_at();
```

- [ ] **Step 2: RLS 정책 작성**

```sql
-- supabase/migrations/002_rls_policies.sql

alter table projects enable row level security;
alter table scripts enable row level security;
alter table photos enable row level security;
alter table designs enable row level security;

-- 클라이언트: 자기 프로젝트만 읽기
create policy "clients_own_projects" on projects
  for select using (client_id = auth.uid());

create policy "clients_create_projects" on projects
  for insert with check (client_id = auth.uid());

-- 기획자/디자이너: 모든 프로젝트 읽기 (어드민 롤 체크는 앱 레이어에서)
create policy "admin_read_all_projects" on projects
  for all using (
    exists (
      select 1 from auth.users
      where id = auth.uid()
      and raw_user_meta_data->>'role' in ('planner', 'designer', 'admin')
    )
  );

-- scripts: 본인 프로젝트 또는 어드민
create policy "scripts_access" on scripts
  for all using (
    exists (select 1 from projects where id = project_id and client_id = auth.uid())
    or exists (
      select 1 from auth.users where id = auth.uid()
      and raw_user_meta_data->>'role' in ('planner', 'designer', 'admin')
    )
  );

-- admin: 읽기 전용
create policy "admin_read_projects" on projects
  for select using (
    exists (
      select 1 from auth.users where id = auth.uid()
      and raw_user_meta_data->>'role' in ('planner', 'designer', 'admin')
    )
  );

-- admin: 업데이트만 허용 (삽입/삭제 불가)
create policy "admin_update_projects" on projects
  for update using (
    exists (
      select 1 from auth.users where id = auth.uid()
      and raw_user_meta_data->>'role' in ('planner', 'designer', 'admin')
    )
  );

-- photos, designs도 동일 패턴 적용
create policy "photos_read" on photos
  for select using (
    exists (select 1 from projects where id = project_id and client_id = auth.uid())
    or exists (
      select 1 from auth.users where id = auth.uid()
      and raw_user_meta_data->>'role' in ('planner', 'designer', 'admin')
    )
  );

create policy "photos_write_admin" on photos
  for insert with check (
    exists (
      select 1 from auth.users where id = auth.uid()
      and raw_user_meta_data->>'role' in ('planner', 'designer', 'admin')
    )
  );

create policy "photos_update_admin" on photos
  for update using (
    exists (
      select 1 from auth.users where id = auth.uid()
      and raw_user_meta_data->>'role' in ('planner', 'designer', 'admin')
    )
  );

create policy "designs_read" on designs
  for select using (
    exists (select 1 from projects where id = project_id and client_id = auth.uid())
    or exists (
      select 1 from auth.users where id = auth.uid()
      and raw_user_meta_data->>'role' in ('planner', 'designer', 'admin')
    )
  );

create policy "designs_write_admin" on designs
  for insert with check (
    exists (
      select 1 from auth.users where id = auth.uid()
      and raw_user_meta_data->>'role' in ('planner', 'designer', 'admin')
    )
  );

create policy "designs_update_admin" on designs
  for update using (
    exists (
      select 1 from auth.users where id = auth.uid()
      and raw_user_meta_data->>'role' in ('planner', 'designer', 'admin')
    )
  );

-- project_logs: RLS 활성화 (어드민만 쓰기, 본인 프로젝트 읽기)
alter table project_logs enable row level security;

create policy "logs_read" on project_logs
  for select using (
    exists (select 1 from projects where id = project_id and client_id = auth.uid())
    or exists (
      select 1 from auth.users where id = auth.uid()
      and raw_user_meta_data->>'role' in ('planner', 'designer', 'admin')
    )
  );

create policy "logs_insert_admin" on project_logs
  for insert with check (
    exists (
      select 1 from auth.users where id = auth.uid()
      and raw_user_meta_data->>'role' in ('planner', 'designer', 'admin')
    )
  );
```

- [ ] **Step 3: 플랫폼 초기 데이터**

```sql
-- supabase/migrations/003_seed_platforms.sql
insert into platforms (name, slug, style_guide) values
('스마트스토어', 'smartstore',
 '네이버 스마트스토어 상세페이지 스타일: 상단 히어로 이미지 → 제품 특징 3-5개 → 사용법/적용 방법 → 고객 리뷰 섹션 → 구매 CTA. 폰트는 가독성 중심, 배경은 흰색 또는 밝은 계열. 이미지와 텍스트 비율 7:3.'),
('G마켓', 'gmarket',
 'G마켓 상세페이지 스타일: 가격 강조형 레이아웃, 할인/혜택 배너 상단 배치, 제품 스펙 표 포함, 배송/AS 정보 하단. 원색 계열 강조색 사용 가능.'),
('쿠팡', 'coupang',
 '쿠팡 상세페이지 스타일: 로켓배송 뱃지 활용, 간결한 구성, 핵심 특징 아이콘+텍스트 조합, 모바일 최적화 세로형 레이아웃.'),
('카카오쇼핑', 'kakao',
 '카카오쇼핑 스타일: 감성적 톤앤매너, 라이프스타일 이미지 중심, 스토리텔링형 구성, 따뜻한 색감.');
```

- [ ] **Step 4: 마이그레이션 실행**

```bash
npx supabase db push
```
Expected: 3개 마이그레이션 성공

- [ ] **Step 5: TypeScript 타입 생성**

```bash
npx supabase gen types typescript --linked > lib/supabase/types.ts
```

- [ ] **Step 6: Commit**

```bash
git add supabase/ lib/supabase/types.ts
git commit -m "feat: add database schema, RLS policies, platform seed data"
```

---

## Task 3: Supabase 클라이언트 & 상태 머신

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/status-machine.ts`

- [ ] **Step 1: 브라우저 클라이언트**

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 2: 서버 클라이언트**

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './types'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

- [ ] **Step 3: 서비스 롤 클라이언트 (백그라운드 AI 작업용)**

> ⚠️ CRITICAL FIX: 서버→서버 내부 fetch() 호출은 쿠키가 없어 RLS에 막힘.
> AI 파이프라인(스크립트 생성·디자인 생성·촬영완료 처리)은 모두 이 클라이언트로 직접 실행.

```typescript
// lib/supabase/service.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

// 서비스 롤 키 사용 — RLS 우회. 절대 클라이언트 번들에 포함하지 말 것 (server-only)
export function createServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}
```

- [ ] **Step 4: 상태 머신 정의 (transitionStatus 헬퍼 포함)**

```typescript
// lib/status-machine.ts
export type ProjectStatus =
  | 'intake_submitted'
  | 'script_generating'
  | 'script_review'
  | 'script_approved'
  | 'photo_scheduled'
  | 'photo_uploaded'
  | 'design_generating'
  | 'design_review'
  | 'design_approved'
  | 'delivered'

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  intake_submitted:   '접수 완료',
  script_generating:  '스크립트 생성 중',
  script_review:      '스크립트 검수 대기',
  script_approved:    '스크립트 승인',
  photo_scheduled:    '촬영 예정',
  photo_uploaded:     '사진 업로드 완료',
  design_generating:  '디자인 생성 중',
  design_review:      '디자인 검수 대기',
  design_approved:    '디자인 승인',
  delivered:          '납품 완료',
}

const TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  intake_submitted:  ['script_generating'],
  script_generating: ['script_review'],
  script_review:     ['script_approved', 'script_generating'], // 재생성 가능
  script_approved:   ['photo_scheduled'],
  photo_scheduled:   ['photo_uploaded'],
  photo_uploaded:    ['design_generating'],
  design_generating: ['design_review'],
  design_review:     ['design_approved', 'design_generating'], // 재생성 가능
  design_approved:   ['delivered'],
  delivered:         [],
}

export function canTransition(from: ProjectStatus, to: ProjectStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false
}

export function nextStatus(current: ProjectStatus): ProjectStatus | null {
  return TRANSITIONS[current]?.[0] ?? null
}

// 모든 상태 전환은 이 함수를 통해 처리 (직접 .update({ status }) 금지)
export async function transitionStatus(
  supabase: ReturnType<typeof import('./supabase/service').createServiceClient>,
  projectId: string,
  toStatus: ProjectStatus,
  options?: { changedBy?: string; note?: string }
) {
  const { data: project } = await supabase
    .from('projects').select('status').eq('id', projectId).single()
  if (!project) throw new Error(`Project ${projectId} not found`)

  const from = project.status as ProjectStatus
  if (!canTransition(from, toStatus)) {
    throw new Error(`Invalid transition: ${from} → ${toStatus}`)
  }

  await supabase.from('projects').update({ status: toStatus }).eq('id', projectId)
  await supabase.from('project_logs').insert({
    project_id: projectId,
    from_status: from,
    to_status: toStatus,
    changed_by: options?.changedBy ?? null,
    note: options?.note ?? null,
  })
}
```

- [ ] **Step 5: Commit**

```bash
git add lib/
git commit -m "feat: add Supabase clients, service role client, and status machine with transitionStatus"
```

---

## Task 3.5: 사용자 프로비저닝 (계정 생성)

> ⚠️ CRITICAL: 200개 클라이언트 + 기획자/디자이너 계정이 없으면 시스템 전체가 동작 불가.
> Supabase Dashboard 수동 생성은 MVP 이후 불가 → 어드민 API + 시드 스크립트 필요.

**Files:**
- Create: `app/api/admin/users/route.ts`
- Create: `scripts/seed-users.ts`

- [ ] **Step 1: 어드민 사용자 생성 API**

```typescript
// app/api/admin/users/route.ts
// 이 엔드포인트는 어드민 롤만 호출 가능
import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // 호출자가 admin인지 검증
  const userSupabase = await createClient()
  const { data: { user } } = await userSupabase.auth.getUser()
  if (user?.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { email, password, role, name } = await request.json()
  const service = createServiceClient()

  const { data, error } = await service.auth.admin.createUser({
    email,
    password,
    user_metadata: { role, name },
    email_confirm: true,   // 이메일 인증 스킵 (MVP)
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ id: data.user.id, email: data.user.email }, { status: 201 })
}
```

- [ ] **Step 2: 초기 어드민 계정 시드 스크립트**

```typescript
// scripts/seed-users.ts
// 실행: npx ts-node scripts/seed-users.ts
import { createClient } from '@supabase/supabase-js'

const service = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const SEED_USERS = [
  { email: 'admin@kompa.kr',    password: 'Change_me_1!', role: 'admin',    name: '어드민' },
  { email: 'planner@kompa.kr',  password: 'Change_me_1!', role: 'planner',  name: '기획자' },
  { email: 'designer@kompa.kr', password: 'Change_me_1!', role: 'designer', name: '디자이너' },
]

async function seed() {
  for (const u of SEED_USERS) {
    const { data, error } = await service.auth.admin.createUser({
      email: u.email, password: u.password,
      user_metadata: { role: u.role, name: u.name },
      email_confirm: true,
    })
    if (error) console.error(`❌ ${u.email}:`, error.message)
    else console.log(`✅ Created: ${u.email} (${u.role})`)
  }
}

seed()
```

- [ ] **Step 3: 시드 실행 및 확인**

```bash
npx ts-node --project tsconfig.json scripts/seed-users.ts
```
Expected: `✅ Created: admin@kompa.kr (admin)` 등 3개 출력

Supabase Dashboard → Authentication → Users에서 계정 3개 확인.

- [ ] **Step 4: 로그아웃 버튼 (공통 레이아웃용 서버 액션)**

```typescript
// app/actions/auth.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
```

- [ ] **Step 5: Commit**

```bash
git add app/api/admin/ scripts/ app/actions/
git commit -m "feat: add user provisioning API, seed script, and sign-out action"
```

---

## Task 4: 인증 & 롤 시스템

**Files:**
- Create: `app/(auth)/login/page.tsx`
- Create: `middleware.ts`
- Create: `components/shared/StatusBadge.tsx`

- [ ] **Step 1: 미들웨어 (인증 가드)**

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // 미인증 → 로그인 리다이렉트
  if (!user && !path.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 어드민 경로: planner/designer/admin 롤만 허용
  if (path.startsWith('/planner') || path.startsWith('/designer') || path.startsWith('/photography')) {
    const role = user?.user_metadata?.role
    if (!['planner', 'designer', 'admin'].includes(role)) {
      return NextResponse.redirect(new URL('/projects', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

- [ ] **Step 2: 로그인 페이지**

```typescript
// app/(auth)/login/page.tsx
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); return }
    const role = data.user?.user_metadata?.role ?? 'client'
    router.push(role === 'client' ? '/projects' : '/planner')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">상세페이지 AI</h1>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <input
          type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="이메일" required
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password" value={password} onChange={e => setPassword(e.target.value)}
          placeholder="비밀번호" required
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="w-full bg-blue-600 text-white rounded-lg py-2 font-medium hover:bg-blue-700">
          로그인
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 3: StatusBadge 공통 컴포넌트**

```typescript
// components/shared/StatusBadge.tsx
import { STATUS_LABELS, type ProjectStatus } from '@/lib/status-machine'
import clsx from 'clsx'

const STATUS_COLORS: Record<ProjectStatus, string> = {
  intake_submitted:  'bg-gray-100 text-gray-700',
  script_generating: 'bg-yellow-100 text-yellow-700',
  script_review:     'bg-orange-100 text-orange-700',
  script_approved:   'bg-green-100 text-green-700',
  photo_scheduled:   'bg-blue-100 text-blue-700',
  photo_uploaded:    'bg-indigo-100 text-indigo-700',
  design_generating: 'bg-purple-100 text-purple-700',
  design_review:     'bg-pink-100 text-pink-700',
  design_approved:   'bg-emerald-100 text-emerald-700',
  delivered:         'bg-slate-100 text-slate-700',
}

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span className={clsx('px-2 py-1 rounded-full text-xs font-medium', STATUS_COLORS[status])}>
      {STATUS_LABELS[status]}
    </span>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add app/(auth)/ middleware.ts components/shared/
git commit -m "feat: add auth middleware, login page, role-based routing"
```

---

## Task 5: 클라이언트 — 작업지시서 입력 폼 (Intake Form)

**Files:**
- Create: `app/(client)/layout.tsx`
- Create: `app/(client)/intake/page.tsx`
- Create: `components/intake/IntakeForm.tsx`
- Create: `app/api/projects/route.ts`

- [ ] **Step 1: 클라이언트 레이아웃**

```typescript
// app/(client)/layout.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-gray-900">상세페이지 AI</span>
        <span className="text-sm text-gray-500">{user.email}</span>
      </nav>
      <main className="max-w-3xl mx-auto p-6">{children}</main>
    </div>
  )
}
```

- [ ] **Step 2: 작업지시서 폼 컴포넌트**

```typescript
// components/intake/IntakeForm.tsx
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'

const schema = z.object({
  company_name: z.string().min(1, '기업명을 입력하세요'),
  homepage_url: z.string().url('올바른 URL을 입력하세요').optional().or(z.literal('')),
  detail_page_url: z.string().url('올바른 URL을 입력하세요').optional().or(z.literal('')),
  product_highlights: z.string().min(10, '강조 포인트를 10자 이상 입력하세요'),
  reference_notes: z.string().optional(),
  platform_id: z.string().uuid('플랫폼을 선택하세요'),
  category: z.string().min(1, '카테고리를 선택하세요'),
})

type FormData = z.infer<typeof schema>

interface Platform { id: string; name: string }

export function IntakeForm({ platforms }: { platforms: Platform[] }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema)
  })
  const router = useRouter()

  async function onSubmit(data: FormData) {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) router.push('/projects')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">기업명 *</label>
        <input {...register('company_name')}
          className="w-full border rounded-lg px-4 py-2"
          placeholder="예: 홍길동 쇼핑몰" />
        {errors.company_name && <p className="text-red-500 text-sm mt-1">{errors.company_name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">홈페이지 URL</label>
        <input {...register('homepage_url')} className="w-full border rounded-lg px-4 py-2"
          placeholder="https://example.com" />
        {errors.homepage_url && <p className="text-red-500 text-sm mt-1">{errors.homepage_url.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">참조 상세페이지 URL</label>
        <input {...register('detail_page_url')} className="w-full border rounded-lg px-4 py-2"
          placeholder="https://smartstore.naver.com/..." />
        <p className="text-xs text-gray-400 mt-1">※ SNS 링크 불가. 상세페이지 URL만 입력 가능합니다.</p>
        {errors.detail_page_url && <p className="text-red-500 text-sm mt-1">{errors.detail_page_url.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">강조 포인트 *</label>
        <textarea {...register('product_highlights')} rows={4}
          className="w-full border rounded-lg px-4 py-2"
          placeholder="제품의 핵심 특징, 강조하고 싶은 점, 경쟁 제품 대비 차별점 등을 구체적으로 입력하세요." />
        {errors.product_highlights && <p className="text-red-500 text-sm mt-1">{errors.product_highlights.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">판매 플랫폼 *</label>
          <select {...register('platform_id')} className="w-full border rounded-lg px-4 py-2">
            <option value="">선택하세요</option>
            {platforms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          {errors.platform_id && <p className="text-red-500 text-sm mt-1">{errors.platform_id.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">카테고리 *</label>
          <select {...register('category')} className="w-full border rounded-lg px-4 py-2">
            <option value="">선택하세요</option>
            {['식품', '패션', '뷰티', '생활용품', '전자제품', '기타'].map(c =>
              <option key={c} value={c}>{c}</option>
            )}
          </select>
          {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">기타 참고사항</label>
        <textarea {...register('reference_notes')} rows={3}
          className="w-full border rounded-lg px-4 py-2"
          placeholder="추가로 전달할 내용이 있다면 입력하세요." />
      </div>

      <button type="submit" disabled={isSubmitting}
        className="w-full bg-blue-600 text-white rounded-lg py-3 font-medium hover:bg-blue-700 disabled:opacity-50">
        {isSubmitting ? '제출 중...' : '작업 의뢰하기'}
      </button>
    </form>
  )
}
```

- [ ] **Step 3: Intake 페이지**

```typescript
// app/(client)/intake/page.tsx
import { createClient } from '@/lib/supabase/server'
import { IntakeForm } from '@/components/intake/IntakeForm'

export default async function IntakePage() {
  const supabase = await createClient()
  const { data: platforms } = await supabase.from('platforms').select('id, name')

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">작업 의뢰하기</h1>
      <p className="text-gray-500 mb-8">기업 정보와 상세페이지 제작 요구사항을 입력해 주세요.</p>
      <IntakeForm platforms={platforms ?? []} />
    </div>
  )
}
```

- [ ] **Step 4: 프로젝트 생성 API**

```typescript
// app/api/projects/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { data, error } = await supabase
    .from('projects')
    .insert({ ...body, client_id: user.id, status: 'intake_submitted' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // 즉시 스크립트 생성 (서비스 롤로 직접 실행 — fetch() 체인 사용 금지)
  generateScriptForProject(data.id) // fire-and-forget (비동기)

  return NextResponse.json(data, { status: 201 })
}
```

- [ ] **Step 5: Commit**

```bash
git add app/(client)/ components/intake/ app/api/projects/
git commit -m "feat: add client intake form with Zod validation and project creation API"
```

---

## Task 6: AI 스크립트 생성 엔진 (Claude API)

**Files:**
- Create: `lib/ai/claude.ts`
- Create: `lib/ai/prompts/script-base.ts`
- Create: `lib/ai/prompts/smartstore.ts`
- Create: `app/api/scripts/generate/route.ts`

- [ ] **Step 1: Claude API 래퍼**

```typescript
// lib/ai/claude.ts
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function generateScript(systemPrompt: string, userPrompt: string): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6-20260320',
    max_tokens: 4096,
    messages: [{ role: 'user', content: userPrompt }],
    system: systemPrompt,
  })
  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type')
  return content.text
}
```

- [ ] **Step 2: 공통 스크립트 프롬프트**

```typescript
// lib/ai/prompts/script-base.ts
export const SCRIPT_SYSTEM_PROMPT = `당신은 이커머스 상세페이지 기획 전문가입니다.
입력된 기업 정보와 제품 특징을 분석하여 판매 전환율을 극대화하는 상세페이지 스크립트를 JSON 형식으로 생성합니다.

출력 형식:
{
  "sections": [
    {
      "type": "hero",
      "title": "헤드라인 텍스트",
      "subtitle": "서브 텍스트",
      "image_description": "필요한 이미지 설명"
    },
    {
      "type": "features",
      "items": [
        { "title": "특징1", "description": "설명", "icon_suggestion": "아이콘 키워드" }
      ]
    },
    {
      "type": "usage",
      "title": "사용 방법",
      "steps": ["단계1", "단계2", "단계3"]
    },
    {
      "type": "cta",
      "text": "구매 유도 문구",
      "urgency": "긴급성/희소성 문구 (선택)"
    }
  ],
  "shooting_requirements": {
    "nukki_shots": ["흰 배경 정면 컷", "측면 컷", "디테일 컷"],
    "styling_shots": ["사용 장면 컷", "분위기 연출 컷"]
  },
  "tone": "친근함|전문성|고급스러움 중 선택",
  "color_suggestion": "메인 컬러 제안"
}

중요: JSON만 출력하세요. 마크다운 코드 블록 없이 순수 JSON으로 응답하세요.`

export function buildUserPrompt(project: {
  company_name: string
  homepage_url?: string | null
  detail_page_url?: string | null
  product_highlights: string
  reference_notes?: string | null
  category: string
  platform_style_guide: string
}): string {
  return `
기업명: ${project.company_name}
카테고리: ${project.category}
${project.homepage_url ? `홈페이지: ${project.homepage_url}` : ''}
${project.detail_page_url ? `참조 상세페이지: ${project.detail_page_url}` : ''}

강조 포인트:
${project.product_highlights}

${project.reference_notes ? `추가 요청사항:\n${project.reference_notes}` : ''}

플랫폼 스타일 가이드:
${project.platform_style_guide}

위 정보를 바탕으로 상세페이지 스크립트를 생성해 주세요.`
}
```

- [ ] **Step 3: 스크립트 생성 API**

```typescript
// lib/ai/generate-script.ts
// 서비스 롤로 직접 실행하는 스크립트 생성 로직 (HTTP 체인 없음)
import { createServiceClient } from '@/lib/supabase/service'
import { generateScript } from './claude'
import { SCRIPT_SYSTEM_PROMPT, buildUserPrompt } from './prompts/script-base'
import { transitionStatus } from '@/lib/status-machine'

export async function generateScriptForProject(projectId: string) {
  const supabase = createServiceClient()

  const { data: project } = await supabase
    .from('projects')
    .select('*, platforms(name, style_guide)')
    .eq('id', projectId)
    .single()

  if (!project) throw new Error(`Project ${projectId} not found`)

  await transitionStatus(supabase, projectId, 'script_generating', { note: '스크립트 생성 시작' })

  try {
    const userPrompt = buildUserPrompt({
      company_name: project.company_name,
      homepage_url: project.homepage_url,
      detail_page_url: project.detail_page_url,
      product_highlights: project.product_highlights,
      reference_notes: project.reference_notes,
      category: project.category,
      platform_style_guide: (project.platforms as any)?.style_guide ?? '',
    })

    const rawScript = await generateScript(SCRIPT_SYSTEM_PROMPT, userPrompt)

    // JSON 파싱 실패 대비 — 재시도 1회
    let scriptContent: unknown
    try {
      scriptContent = JSON.parse(rawScript)
    } catch {
      const retried = await generateScript(
        SCRIPT_SYSTEM_PROMPT + '\n\n반드시 순수 JSON만 응답하세요. 마크다운 없이.',
        userPrompt
      )
      scriptContent = JSON.parse(retried)
    }

    await supabase.from('scripts').insert({
      project_id: projectId,
      content: scriptContent,
      ai_model: 'claude-sonnet-4-6-20260320',
      planner_status: 'pending',
    })

    await transitionStatus(supabase, projectId, 'script_review', { note: 'AI 스크립트 자동 생성 완료' })
  } catch (err) {
    // 실패 시 롤백 (직접 update — 상태 검증 불필요)
    await supabase.from('projects').update({ status: 'intake_submitted' }).eq('id', projectId)
    await supabase.from('project_logs').insert({
      project_id: projectId, from_status: 'script_generating',
      to_status: 'intake_submitted', note: `스크립트 생성 실패: ${String(err)}`,
    })
  }
}
```

```typescript
// app/api/scripts/generate/route.ts
// HTTP 엔드포인트 — 기획자가 수동 재생성 요청할 때만 사용
import { generateScriptForProject } from '@/lib/ai/generate-script'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { project_id } = await request.json()
  generateScriptForProject(project_id) // fire-and-forget
  return NextResponse.json({ queued: true })
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/ai/ app/api/scripts/
git commit -m "feat: add Claude API script generation with platform-specific prompts"
```

---

## Task 7: 기획자 대시보드 — 스크립트 검수

**Files:**
- Create: `app/(admin)/layout.tsx`
- Create: `app/(admin)/planner/page.tsx`
- Create: `app/(admin)/planner/[id]/page.tsx`
- Create: `components/planner/ScriptViewer.tsx`
- Create: `components/planner/ReviewPanel.tsx`

- [ ] **Step 1: 어드민 레이아웃**

```typescript
// app/(admin)/layout.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const role = user.user_metadata?.role
  if (!['planner', 'designer', 'admin'].includes(role)) redirect('/projects')

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex items-center gap-6">
        <span className="font-bold text-gray-900">상세페이지 AI — 관리자</span>
        <a href="/planner" className="text-sm text-gray-600 hover:text-gray-900">기획 검수</a>
        <a href="/designer" className="text-sm text-gray-600 hover:text-gray-900">디자인 검수</a>
        <span className="ml-auto text-sm text-gray-400">{user.email} ({role})</span>
      </nav>
      <main className="max-w-6xl mx-auto p-6">{children}</main>
    </div>
  )
}
```

- [ ] **Step 2: 기획자 대시보드 (목록)**

```typescript
// app/(admin)/planner/page.tsx
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/shared/StatusBadge'
import type { ProjectStatus } from '@/lib/status-machine'
import Link from 'next/link'

export default async function PlannerDashboard() {
  const supabase = await createClient()
  const { data: projects } = await supabase
    .from('projects')
    .select('*, platforms(name)')
    .in('status', ['script_review', 'script_generating'])
    .order('created_at', { ascending: true })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">스크립트 검수 대기</h1>
      <div className="space-y-3">
        {projects?.map(project => (
          <Link key={project.id} href={`/planner/${project.id}`}>
            <div className="bg-white rounded-xl border p-5 flex items-center justify-between hover:border-blue-300 transition-colors">
              <div>
                <p className="font-medium text-gray-900">{project.company_name}</p>
                <p className="text-sm text-gray-500">
                  {(project.platforms as any)?.name} · {project.category} ·{' '}
                  {new Date(project.created_at).toLocaleDateString('ko-KR')}
                </p>
              </div>
              <StatusBadge status={project.status as ProjectStatus} />
            </div>
          </Link>
        ))}
        {!projects?.length && (
          <p className="text-gray-400 text-center py-12">검수 대기 중인 프로젝트가 없습니다.</p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: ScriptViewer 컴포넌트**

```typescript
// components/planner/ScriptViewer.tsx
interface ScriptSection {
  type: string
  title?: string
  subtitle?: string
  image_description?: string
  items?: Array<{ title: string; description: string }>
  steps?: string[]
  text?: string
}

interface ScriptContent {
  sections: ScriptSection[]
  shooting_requirements: {
    nukki_shots: string[]
    styling_shots: string[]
  }
  tone: string
  color_suggestion: string
}

export function ScriptViewer({ content }: { content: ScriptContent }) {
  return (
    <div className="space-y-6">
      {content.sections.map((section, i) => (
        <div key={i} className="bg-gray-50 rounded-lg p-4">
          <span className="text-xs font-mono text-gray-400 uppercase">{section.type}</span>
          {section.title && <h3 className="font-semibold text-gray-900 mt-1">{section.title}</h3>}
          {section.subtitle && <p className="text-gray-600 text-sm">{section.subtitle}</p>}
          {section.image_description && (
            <p className="text-blue-600 text-sm mt-2">📷 {section.image_description}</p>
          )}
          {section.items?.map((item, j) => (
            <div key={j} className="mt-2 pl-3 border-l-2 border-gray-200">
              <p className="font-medium text-sm">{item.title}</p>
              <p className="text-gray-500 text-sm">{item.description}</p>
            </div>
          ))}
          {section.steps && (
            <ol className="mt-2 list-decimal list-inside space-y-1 text-sm text-gray-700">
              {section.steps.map((step, j) => <li key={j}>{step}</li>)}
            </ol>
          )}
        </div>
      ))}

      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">촬영 요구사항</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-blue-700">누끼 컷</p>
            <ul className="mt-1 space-y-1 text-blue-600">
              {content.shooting_requirements.nukki_shots.map((s, i) => <li key={i}>· {s}</li>)}
            </ul>
          </div>
          <div>
            <p className="font-medium text-blue-700">스타일링 컷</p>
            <ul className="mt-1 space-y-1 text-blue-600">
              {content.shooting_requirements.styling_shots.map((s, i) => <li key={i}>· {s}</li>)}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex gap-4 text-sm text-gray-600">
        <span>톤앤매너: <strong>{content.tone}</strong></span>
        <span>컬러 제안: <strong>{content.color_suggestion}</strong></span>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: ReviewPanel + 검수 상세 페이지**

```typescript
// app/(admin)/planner/[id]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { ScriptViewer } from '@/components/planner/ScriptViewer'
import { ReviewPanel } from '@/components/planner/ReviewPanel'
import { notFound } from 'next/navigation'

export default async function PlannerReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects')
    .select('*, platforms(name, style_guide)')
    .eq('id', id)
    .single()

  if (!project) notFound()

  const { data: script } = await supabase
    .from('scripts')
    .select('*')
    .eq('project_id', id)
    .order('version', { ascending: false })
    .limit(1)
    .single()

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2">
        <h1 className="text-xl font-bold text-gray-900 mb-1">{project.company_name}</h1>
        <p className="text-sm text-gray-500 mb-6">
          {(project.platforms as any)?.name} · {project.category}
        </p>
        {script ? (
          <ScriptViewer content={script.content as any} />
        ) : (
          <p className="text-gray-400">스크립트 생성 중...</p>
        )}
      </div>
      <div>
        <ReviewPanel projectId={id} scriptId={script?.id} />
      </div>
    </div>
  )
}
```

```typescript
// components/planner/ReviewPanel.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

// MVP: "수정 요청" 버튼 제거 — 워크플로우 막힘 방지.
// 기획자는 승인 또는 메모와 함께 AI 재생성만 가능.
export function ReviewPanel({ projectId, scriptId }: { projectId: string; scriptId?: string }) {
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleAction(action: 'approve' | 'regenerate') {
    setLoading(true)
    await fetch('/api/scripts/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: projectId, script_id: scriptId, action, notes }),
    })
    setLoading(false)
    router.push('/planner')
  }

  return (
    <div className="bg-white rounded-xl border p-5 sticky top-6 space-y-4">
      <h3 className="font-semibold text-gray-900">검수 패널</h3>
      <textarea
        value={notes} onChange={e => setNotes(e.target.value)}
        placeholder="재생성 요청 시 수정 방향을 입력하세요 (선택)..."
        rows={4} className="w-full border rounded-lg px-3 py-2 text-sm resize-none" />
      <div className="space-y-2">
        <button onClick={() => handleAction('approve')} disabled={loading}
          className="w-full bg-green-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-50">
          ✓ 승인 → 촬영 단계
        </button>
        <button onClick={() => handleAction('regenerate')} disabled={loading}
          className="w-full bg-gray-200 text-gray-700 rounded-lg py-2 text-sm font-medium hover:bg-gray-300 disabled:opacity-50">
          ↻ AI 재생성 (메모 반영)
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: 검수 처리 API 작성**

```typescript
// app/api/scripts/review/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { project_id, script_id, action, notes } = await request.json()

  if (action === 'approve') {
    await supabase.from('scripts').update({ planner_status: 'approved', planner_notes: notes })
      .eq('id', script_id)
    await supabase.from('projects').update({ status: 'script_approved' }).eq('id', project_id)
    // 촬영 리스트 자동 생성 트리거
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/photography/shooting-list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id }),
    })
  } else if (action === 'revise') {
    await supabase.from('scripts').update({ planner_status: 'revision_requested', planner_notes: notes })
      .eq('id', script_id)
  } else if (action === 'regenerate') {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/scripts/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id }),
    })
  }

  return NextResponse.json({ success: true })
}
```

- [ ] **Step 6: Commit**

```bash
git add app/(admin)/planner/ components/planner/ app/api/scripts/review/
git commit -m "feat: add planner review dashboard with approve/revise/regenerate workflow"
```

---

## Task 8: 촬영 모듈 — 촬영 리스트 + 사진 업로드

**Files:**
- Create: `app/api/photography/shooting-list/route.ts`
- Create: `app/(admin)/photography/[id]/page.tsx`
- Create: `components/photography/ShootingList.tsx`
- Create: `components/photography/PhotoUploader.tsx`

- [ ] **Step 1: 촬영 리스트 생성 API**

```typescript
// app/api/photography/shooting-list/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { project_id } = await request.json()

  // 최신 승인된 스크립트에서 촬영 요구사항 추출
  const { data: script } = await supabase
    .from('scripts')
    .select('content')
    .eq('project_id', project_id)
    .eq('planner_status', 'approved')
    .single()

  if (!script) return NextResponse.json({ error: 'No approved script' }, { status: 404 })

  const content = script.content as any
  const shootingReqs = content.shooting_requirements

  // 촬영 항목을 photos 테이블에 초기 레코드로 생성
  const photoItems = [
    ...shootingReqs.nukki_shots.map((shot: string) => ({
      project_id, photo_type: 'nukki', shooting_list_item: shot,
      storage_path: '', // 업로드 전
    })),
    ...shootingReqs.styling_shots.map((shot: string) => ({
      project_id, photo_type: 'styling', shooting_list_item: shot,
      storage_path: '',
    })),
  ]

  await supabase.from('photos').insert(photoItems)
  await supabase.from('projects').update({ status: 'photo_scheduled' }).eq('id', project_id)

  return NextResponse.json({ success: true })
}
```

- [ ] **Step 2: 사진 업로드 페이지**

```typescript
// app/(admin)/photography/[id]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { ShootingList } from '@/components/photography/ShootingList'
import { notFound } from 'next/navigation'

export default async function PhotographyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('projects').select('*').eq('id', id).single()
  if (!project) notFound()

  const { data: photos } = await supabase
    .from('photos').select('*').eq('project_id', id).order('photo_type')

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">{project.company_name}</h1>
      <p className="text-sm text-gray-500 mb-6">촬영 리스트 및 사진 업로드</p>
      <ShootingList projectId={id} photos={photos ?? []} />
    </div>
  )
}
```

- [ ] **Step 3: ShootingList 컴포넌트 (업로드 포함)**

```typescript
// components/photography/ShootingList.tsx
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Photo {
  id: string
  photo_type: string
  shooting_list_item: string
  storage_path: string
  is_retouched: boolean
}

export function ShootingList({ projectId, photos }: { projectId: string; photos: Photo[] }) {
  const [uploading, setUploading] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function uploadPhoto(photoId: string, file: File) {
    setUploading(photoId)
    const path = `projects/${projectId}/${photoId}_${file.name}`
    const { error } = await supabase.storage.from('photos').upload(path, file)
    if (!error) {
      await supabase.from('photos').update({ storage_path: path }).eq('id', photoId)
      router.refresh()
    }
    setUploading(null)
  }

  async function markAllUploaded() {
    await fetch('/api/photography/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: projectId }),
    })
    router.push('/planner')
  }

  const nukki = photos.filter(p => p.photo_type === 'nukki')
  const styling = photos.filter(p => p.photo_type === 'styling')
  const allUploaded = photos.every(p => p.storage_path)

  return (
    <div className="space-y-6">
      {[{ label: '누끼 컷', items: nukki }, { label: '스타일링 컷', items: styling }].map(({ label, items }) => (
        <div key={label}>
          <h3 className="font-semibold text-gray-900 mb-3">{label}</h3>
          <div className="space-y-2">
            {items.map(photo => (
              <div key={photo.id} className="flex items-center gap-4 bg-white border rounded-lg p-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{photo.shooting_list_item}</p>
                  <p className="text-xs text-gray-400">{photo.storage_path ? '✓ 업로드 완료' : '미업로드'}</p>
                </div>
                {!photo.storage_path && (
                  <label className="cursor-pointer bg-blue-50 text-blue-600 border border-blue-200 rounded-lg px-3 py-1 text-sm hover:bg-blue-100">
                    {uploading === photo.id ? '업로드 중...' : '파일 선택'}
                    <input type="file" accept="image/*" className="hidden"
                      onChange={e => e.target.files?.[0] && uploadPhoto(photo.id, e.target.files[0])} />
                  </label>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {allUploaded && (
        <button onClick={markAllUploaded}
          className="w-full bg-indigo-600 text-white rounded-lg py-3 font-medium hover:bg-indigo-700">
          촬영 완료 → 디자인 생성 시작
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 4: 촬영 완료 API**

```typescript
// app/api/photography/complete/route.ts
import { createServiceClient } from '@/lib/supabase/service'
import { transitionStatus } from '@/lib/status-machine'
import { generateDesignForProject } from '@/lib/ai/generate-design'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { project_id } = await request.json()
  const supabase = createServiceClient()

  await transitionStatus(supabase, project_id, 'photo_uploaded', { note: '촬영 완료' })
  generateDesignForProject(project_id) // fire-and-forget

  return NextResponse.json({ success: true })
}
```

- [ ] **Step 5: 촬영 대기 목록 페이지 추가**

```typescript
// app/(admin)/photography/page.tsx
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/shared/StatusBadge'
import type { ProjectStatus } from '@/lib/status-machine'
import Link from 'next/link'

export default async function PhotographyListPage() {
  const supabase = await createClient()
  const { data: projects } = await supabase
    .from('projects')
    .select('*, platforms(name)')
    .in('status', ['script_approved', 'photo_scheduled'])
    .order('created_at', { ascending: true })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">촬영 대기 목록</h1>
      <div className="space-y-3">
        {projects?.map(project => (
          <Link key={project.id} href={`/photography/${project.id}`}>
            <div className="bg-white rounded-xl border p-5 flex items-center justify-between hover:border-blue-300 transition-colors">
              <div>
                <p className="font-medium text-gray-900">{project.company_name}</p>
                <p className="text-sm text-gray-500">
                  {(project.platforms as any)?.name} · {project.category}
                </p>
              </div>
              <StatusBadge status={project.status as ProjectStatus} />
            </div>
          </Link>
        ))}
        {!projects?.length && <p className="text-gray-400 text-center py-12">촬영 대기 없음</p>}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: 어드민 네비게이션에 촬영 링크 추가**

[app/(admin)/layout.tsx:1014](app/(admin)/layout.tsx#L1014) 의 nav에 추가:
```typescript
<a href="/photography" className="text-sm text-gray-600 hover:text-gray-900">촬영 관리</a>
```

- [ ] **Step 7: Commit**

```bash
git add app/(admin)/photography/ components/photography/ app/api/photography/
git commit -m "feat: add photography module with shooting list, upload, and list page"
```

---

## Task 9: AI 디자인 생성 + 디자이너 검수

**Files:**
- Create: `lib/ai/imagen.ts`
- Create: `app/api/designs/generate/route.ts`
- Create: `app/(admin)/designer/page.tsx`
- Create: `app/(admin)/designer/[id]/page.tsx`
- Create: `components/designer/DesignPreview.tsx`
- Create: `components/designer/DeliveryPanel.tsx`

- [ ] **Step 0: 의존성 추가**

```bash
npm install @google-cloud/aiplatform
```

Vertex AI 인증: Google Cloud 프로젝트에서 서비스 계정 키 생성 후 `.env.local`에 추가:
```env
GOOGLE_CLOUD_PROJECT_ID=<project-id>
GOOGLE_APPLICATION_CREDENTIALS=./gcp-service-account.json
```

- [ ] **Step 1: Vertex AI Imagen 4 래퍼 (최고 품질 이미지 생성)**

```typescript
// lib/ai/imagen.ts
import { PredictionServiceClient, helpers } from '@google-cloud/aiplatform'

const client = new PredictionServiceClient()
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID!
const LOCATION = 'us-central1'
const ENDPOINT = `projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/imagen-4.0-generate-preview-05-20`

export async function generateProductImage(prompt: string): Promise<Buffer> {
  const instance = helpers.toValue({
    prompt,
  })
  const parameters = helpers.toValue({
    sampleCount: 1,
    aspectRatio: '9:16',        // 상세페이지 세로형 최적
    safetyFilterLevel: 'block_few',
    personGeneration: 'dont_allow',
  })

  const [response] = await client.predict({
    endpoint: ENDPOINT,
    instances: [instance!],
    parameters,
  })

  const prediction = response.predictions?.[0]
  if (!prediction) throw new Error('Imagen 4: No image generated')

  const base64 = (prediction as any).structValue?.fields?.bytesBase64Encoded?.stringValue
  if (!base64) throw new Error('Imagen 4: Missing base64 data')

  return Buffer.from(base64, 'base64')
}
```

- [ ] **Step 2: 디자인 생성 API (스크립트 + 사진 → 목업)**

```typescript
// lib/ai/generate-design.ts
// 서비스 롤로 직접 실행 (HTTP 체인 없음). Imagen 4 이미지를 Supabase Storage에 즉시 저장.
import { createServiceClient } from '@/lib/supabase/service'
import { generateProductImage } from './imagen'
import { transitionStatus } from '@/lib/status-machine'

export async function generateDesignForProject(projectId: string) {
  const supabase = createServiceClient()

  const { data: project } = await supabase
    .from('projects').select('*, platforms(name)').eq('id', projectId).single()
  const { data: script } = await supabase
    .from('scripts').select('content')
    .eq('project_id', projectId).eq('planner_status', 'approved').single()

  if (!project || !script) throw new Error('Missing project or approved script')

  await transitionStatus(supabase, projectId, 'design_generating', { note: '디자인 생성 시작' })

  const content = script.content as any
  const heroSection = content.sections.find((s: any) => s.type === 'hero')
  const imagePrompt = `E-commerce product detail page hero banner for ${project.company_name}.
${heroSection?.image_description ?? project.product_highlights}.
Style: ${content.tone}, Color: ${content.color_suggestion}.
Professional product photography, white background, high quality.`

  try {
    // Imagen 4는 Buffer를 직접 반환
    const imageBuffer = await generateProductImage(imagePrompt)
    const storagePath = `projects/${projectId}/design_v1_${Date.now()}.png`
    await supabase.storage.from('designs').upload(storagePath, imageBuffer, { contentType: 'image/png' })
    const { data: { publicUrl } } = supabase.storage.from('designs').getPublicUrl(storagePath)

    await supabase.from('designs').insert({
      project_id: projectId,
      preview_url: publicUrl,
      designer_status: 'pending',
    })

    await transitionStatus(supabase, projectId, 'design_review', { note: 'AI 디자인 자동 생성 완료' })
  } catch (err) {
    await supabase.from('projects').update({ status: 'photo_uploaded' }).eq('id', projectId)
    await supabase.from('project_logs').insert({
      project_id: projectId, from_status: 'design_generating',
      to_status: 'photo_uploaded', note: `디자인 생성 실패: ${String(err)}`,
    })
  }
}
```

```typescript
// app/api/designs/generate/route.ts
import { generateDesignForProject } from '@/lib/ai/generate-design'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { project_id } = await request.json()
  generateDesignForProject(project_id) // fire-and-forget
  return NextResponse.json({ queued: true })
}
```

- [ ] **Step 3: 디자이너 대시보드 + 상세 검수 페이지**

```typescript
// app/(admin)/designer/page.tsx
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/shared/StatusBadge'
import type { ProjectStatus } from '@/lib/status-machine'
import Link from 'next/link'

export default async function DesignerDashboard() {
  const supabase = await createClient()
  const { data: projects } = await supabase
    .from('projects')
    .select('*, platforms(name)')
    .in('status', ['design_review', 'design_generating'])
    .order('created_at', { ascending: true })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">디자인 검수 대기</h1>
      <div className="space-y-3">
        {projects?.map(project => (
          <Link key={project.id} href={`/designer/${project.id}`}>
            <div className="bg-white rounded-xl border p-5 flex items-center justify-between hover:border-purple-300 transition-colors">
              <div>
                <p className="font-medium text-gray-900">{project.company_name}</p>
                <p className="text-sm text-gray-500">
                  {(project.platforms as any)?.name} · {project.category}
                </p>
              </div>
              <StatusBadge status={project.status as ProjectStatus} />
            </div>
          </Link>
        ))}
        {!projects?.length && <p className="text-gray-400 text-center py-12">검수 대기 없음</p>}
      </div>
    </div>
  )
}
```

```typescript
// app/(admin)/designer/[id]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { DesignPreview } from '@/components/designer/DesignPreview'
import { DeliveryPanel } from '@/components/designer/DeliveryPanel'
import { notFound } from 'next/navigation'

export default async function DesignerReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: project } = await supabase.from('projects').select('*').eq('id', id).single()
  if (!project) notFound()

  const { data: design } = await supabase
    .from('designs').select('*').eq('project_id', id)
    .order('version', { ascending: false }).limit(1).single()

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2">
        <h1 className="text-xl font-bold mb-4">{project.company_name}</h1>
        <DesignPreview design={design} />
      </div>
      <div>
        <DeliveryPanel projectId={id} designId={design?.id} />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: DesignPreview + DeliveryPanel**

```typescript
// components/designer/DesignPreview.tsx
interface Design { id: string; preview_url: string | null; output_url: string | null }

export function DesignPreview({ design }: { design: Design | null }) {
  if (!design) return <p className="text-gray-400">디자인 생성 중...</p>
  return (
    <div className="space-y-4">
      {design.preview_url && (
        <img src={design.preview_url} alt="디자인 미리보기"
          className="w-full rounded-xl border shadow-sm" />
      )}
      {design.output_url && (
        <a href={design.output_url} download
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm">
          최종 파일 다운로드
        </a>
      )}
    </div>
  )
}
```

```typescript
// components/designer/DeliveryPanel.tsx
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function DeliveryPanel({ projectId, designId }: { projectId: string; designId?: string }) {
  const [notes, setNotes] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleApprove() {
    setLoading(true)
    let outputUrl = null

    if (file) {
      const path = `projects/${projectId}/final_${file.name}`
      await supabase.storage.from('designs').upload(path, file)
      const { data } = supabase.storage.from('designs').getPublicUrl(path)
      outputUrl = data.publicUrl
    }

    await fetch('/api/designs/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: projectId, design_id: designId, action: 'approve', notes, output_url: outputUrl }),
    })
    setLoading(false)
    router.push('/designer')
  }

  async function handleRegenerate() {
    setLoading(true)
    await fetch('/api/designs/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: projectId }),
    })
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="bg-white rounded-xl border p-5 sticky top-6 space-y-4">
      <h3 className="font-semibold text-gray-900">디자이너 검수</h3>
      <div>
        <label className="text-sm text-gray-600 mb-1 block">최종 납품 파일 업로드</label>
        <input type="file" onChange={e => setFile(e.target.files?.[0] ?? null)}
          className="w-full text-sm" />
      </div>
      <textarea value={notes} onChange={e => setNotes(e.target.value)}
        placeholder="디자이너 메모..." rows={3}
        className="w-full border rounded-lg px-3 py-2 text-sm resize-none" />
      <div className="space-y-2">
        <button onClick={handleApprove} disabled={loading}
          className="w-full bg-emerald-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-emerald-700 disabled:opacity-50">
          ✓ 승인 + 납품 완료
        </button>
        <button onClick={handleRegenerate} disabled={loading}
          className="w-full bg-gray-200 text-gray-700 rounded-lg py-2 text-sm font-medium hover:bg-gray-300 disabled:opacity-50">
          ↻ 디자인 재생성
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: 디자인 검수 API**

```typescript
// app/api/designs/review/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { project_id, design_id, action, notes, output_url } = await request.json()

  if (action === 'approve') {
    await supabase.from('designs').update({
      designer_status: 'approved',
      designer_notes: notes,
      output_url,
    }).eq('id', design_id)

    await supabase.from('projects').update({ status: 'delivered' }).eq('id', project_id)
  }

  return NextResponse.json({ success: true })
}
```

- [ ] **Step 6: Commit**

```bash
git add lib/ai/imagen.ts app/api/designs/ app/(admin)/designer/ components/designer/
git commit -m "feat: add AI design generation pipeline and designer review/delivery workflow"
```

---

## Task 10: 클라이언트 프로젝트 현황 페이지

**Files:**
- Create: `app/(client)/projects/page.tsx`
- Create: `components/shared/ProjectCard.tsx`

- [ ] **Step 1: ProjectCard 컴포넌트**

```typescript
// components/shared/ProjectCard.tsx
import { StatusBadge } from './StatusBadge'
import type { ProjectStatus } from '@/lib/status-machine'

interface ProjectCardProps {
  id: string
  company_name: string
  category: string
  platform_name: string
  status: ProjectStatus
  created_at: string
}

export function ProjectCard({ company_name, category, platform_name, status, created_at }: ProjectCardProps) {
  return (
    <div className="bg-white rounded-xl border p-5 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{company_name}</h3>
          <p className="text-sm text-gray-500">{platform_name} · {category}</p>
        </div>
        <StatusBadge status={status} />
      </div>
      <p className="text-xs text-gray-400">
        의뢰일: {new Date(created_at).toLocaleDateString('ko-KR')}
      </p>
    </div>
  )
}
```

- [ ] **Step 2: 클라이언트 프로젝트 목록 페이지**

```typescript
// app/(client)/projects/page.tsx
import { createClient } from '@/lib/supabase/server'
import { ProjectCard } from '@/components/shared/ProjectCard'
import type { ProjectStatus } from '@/lib/status-machine'
import Link from 'next/link'

export default async function ClientProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: projects } = await supabase
    .from('projects')
    .select('*, platforms(name)')
    .eq('client_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">내 프로젝트</h1>
        <Link href="/intake"
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700">
          + 새 의뢰
        </Link>
      </div>
      <div className="space-y-3">
        {projects?.map(project => (
          <ProjectCard
            key={project.id}
            id={project.id}
            company_name={project.company_name}
            category={project.category}
            platform_name={(project.platforms as any)?.name ?? '-'}
            status={project.status as ProjectStatus}
            created_at={project.created_at}
          />
        ))}
        {!projects?.length && (
          <div className="text-center py-16">
            <p className="text-gray-400 mb-4">아직 의뢰한 프로젝트가 없습니다.</p>
            <Link href="/intake" className="text-blue-600 hover:underline">첫 번째 의뢰 시작하기</Link>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/(client)/projects/ components/shared/ProjectCard.tsx
git commit -m "feat: add client project dashboard with status tracking"
```

---

## Task 11: 배포 (Vercel + Supabase)

**Files:**
- Modify: `next.config.ts`
- Create: `vercel.json`

- [ ] **Step 1: Next.js 설정 (이미지 도메인 허용)**

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'oaidalleapiprodscus.blob.core.windows.net' },
    ],
  },
}

export default nextConfig
```

- [ ] **Step 2: 빌드 검증**

```bash
npm run build
```
Expected: Build 성공, 에러 없음

- [ ] **Step 3: Vercel 배포**

```bash
npx vercel --prod
```

Vercel Dashboard에서 환경 변수 설정:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`
- `GOOGLE_CLOUD_PROJECT_ID`
- `GOOGLE_APPLICATION_CREDENTIALS`
- `NEXT_PUBLIC_APP_URL` = `https://<your-domain>.vercel.app`

- [ ] **Step 4: Supabase Storage 버킷 생성**

Supabase Dashboard → Storage:
- `photos` 버킷 생성 (public: false)
- `designs` 버킷 생성 (public: true)

- [ ] **Step 5: E2E 검증 체크리스트**

```
□ 클라이언트 계정으로 로그인
□ 작업지시서 제출 → intake_submitted 상태 확인
□ 스크립트 자동 생성 → script_review 상태 전환 확인
□ 기획자 계정으로 스크립트 승인
□ 촬영 리스트 자동 생성 확인
□ 사진 업로드 → 디자인 생성 트리거 확인
□ 디자이너 계정으로 최종 승인 + 납품
□ 클라이언트 프로젝트 상태 'delivered' 확인
```

- [ ] **Step 6: Final Commit**

```bash
git add .
git commit -m "feat: production deployment config and build verification"
```

---

## MVP 일정 요약

| 날짜 | 마일스톤 |
|------|----------|
| 3/25 (화) | Task 1-3: 프로젝트 셋업, DB 스키마, Supabase 클라이언트 |
| 3/26 (수) | Task 3.5: 사용자 프로비저닝 + 인증 (Task 4) |
| 3/28 (금) | Task 5-6: Intake Form + AI 스크립트 생성 파이프라인 |
| 3/31 (월) | Task 7: 기획자 검수 대시보드 |
| 4/1 (화) | **기술 스택 확정 미팅 (이사님)** — Tasks 1-7 데모 가능 상태 |
| 4/7 (월) | Task 8: 촬영 모듈 (리스트 + 업로드) |
| 4/9 (수) | Task 9: AI 디자인 생성 + 디자이너 대시보드 |
| 4/10 (목) | Task 10-11: 클라이언트 대시보드 + 배포 |
| 4/14 (월) | 본부장님 미팅 + 컨설턴트 워크샵 |
| 4/15 (화) | **MVP 베타 버전 완성** |

## 비용 추정 (건당)

| 항목 | 단가 | 건당 예상 |
|------|------|---------|
| Claude Sonnet 4.6 스크립트 생성 | ~₩50/1K tokens | ~₩1,500 |
| Vertex AI Imagen 4 (3장) | ~₩600/장 | ~₩1,800 |
| Supabase Storage | ~₩0.023/GB | 무시 |
| Vertex AI 인프라 | 월정액 분배 | ~₩200 |
| **총 AI 비용** | | **~₩3,500** |
| **매출** | | **₩800,000** |
| **마진** | | **₩796,500 (99.6%)** |

## 향후 확장 계획 (Post-MVP)

- [ ] AI 이미지 후보정 (배경 제거, 색보정) — Replicate/Remove.bg API
- [ ] 플랫폼별 자동 업로드 — 스마트스토어 파트너 API
- [ ] 카카오 알림톡 / 이메일 자동 발송
- [ ] 어드민 계정 관리 페이지
- [ ] 다중 사업별 전용 프론트 분기 (사업코드 기반)
- [ ] 통계 대시보드 (완료 건수, 평균 처리 시간, AI 비용 현황)
