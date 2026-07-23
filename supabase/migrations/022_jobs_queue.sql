-- 022: 파이프라인 잡 큐 — Vercel 800초 한도 회피(진동벨 구조)
-- 웹 버튼은 잡을 등록만 하고 즉시 응답, 실행은 외부 워커(Railway)가 폴링해 수행한다.
-- 기획(③) 5~7분·조립(⑤) 10~20분이 서버리스 한도를 초과하던 실측 문제의 구조적 해법.

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  kind text not null check (kind in ('planning', 'shots', 'draft')),
  status text not null default 'pending' check (status in ('pending', 'running', 'done', 'failed')),
  -- 진행 메모(워커가 갱신) / 실패 사유
  note text,
  error text,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz
);

create index if not exists jobs_pending_idx on jobs (status, created_at);
create index if not exists jobs_project_idx on jobs (project_id, created_at desc);

-- RLS: 정책 없이 enable — anon/authenticated 직접 접근 차단.
-- 읽기/쓰기는 전부 서버 API(service role)와 워커(service role)만 수행한다.
alter table jobs enable row level security;
