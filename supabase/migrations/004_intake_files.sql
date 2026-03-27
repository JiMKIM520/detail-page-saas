-- 작업지시서 첨부파일 (제품사진, 소개서, 상세페이지 캡처 등)
create table intake_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) not null,
  file_type text not null check (file_type in ('product_photo', 'brochure', 'detail_capture', 'other')),
  storage_path text not null,
  file_name text not null,
  mime_type text,
  file_size int,
  created_at timestamptz default now()
);

-- RLS
alter table intake_files enable row level security;

create policy "clients_read_own_intake_files" on intake_files
  for select using (
    exists (select 1 from projects where id = project_id and client_id = auth.uid())
  );

create policy "clients_insert_intake_files" on intake_files
  for insert with check (
    exists (select 1 from projects where id = project_id and client_id = auth.uid())
  );

create policy "admin_read_intake_files" on intake_files
  for select using (
    exists (
      select 1 from auth.users where id = auth.uid()
      and raw_user_meta_data->>'role' in ('planner', 'designer', 'admin')
    )
  );
