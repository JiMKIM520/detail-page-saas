create table comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) not null,
  user_id uuid references auth.users(id) not null,
  content text not null,
  created_at timestamptz default now()
);

-- RLS: project owner and admin roles can read/write
alter table comments enable row level security;

create policy "Users can view comments on their projects"
  on comments for select using (
    user_id = auth.uid()
    or project_id in (select id from projects where client_id = auth.uid())
    or (auth.jwt()->'user_metadata'->>'role') in ('planner', 'designer', 'admin')
  );

create policy "Users can create comments on their projects"
  on comments for insert with check (
    auth.uid() = user_id
    and (
      project_id in (select id from projects where client_id = auth.uid())
      or (auth.jwt()->'user_metadata'->>'role') in ('planner', 'designer', 'admin')
    )
  );
