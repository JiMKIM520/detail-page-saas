-- auth.users 직접 조회 대신 auth.jwt()로 역할 확인 (권한 이슈 해결)

-- projects
drop policy if exists "admin_read_projects" on projects;
create policy "admin_read_projects" on projects
  for select using (
    (auth.jwt()->'user_metadata'->>'role') in ('planner', 'designer', 'admin')
  );

drop policy if exists "admin_update_projects" on projects;
create policy "admin_update_projects" on projects
  for update using (
    (auth.jwt()->'user_metadata'->>'role') in ('planner', 'designer', 'admin')
  );

-- scripts
drop policy if exists "scripts_access" on scripts;
create policy "scripts_access" on scripts
  for all using (
    exists (select 1 from projects where id = project_id and client_id = auth.uid())
    or (auth.jwt()->'user_metadata'->>'role') in ('planner', 'designer', 'admin')
  );

-- photos
drop policy if exists "photos_read" on photos;
create policy "photos_read" on photos
  for select using (
    exists (select 1 from projects where id = project_id and client_id = auth.uid())
    or (auth.jwt()->'user_metadata'->>'role') in ('planner', 'designer', 'admin')
  );

drop policy if exists "photos_write_admin" on photos;
create policy "photos_write_admin" on photos
  for insert with check (
    (auth.jwt()->'user_metadata'->>'role') in ('planner', 'designer', 'admin')
  );

drop policy if exists "photos_update_admin" on photos;
create policy "photos_update_admin" on photos
  for update using (
    (auth.jwt()->'user_metadata'->>'role') in ('planner', 'designer', 'admin')
  );

-- designs
drop policy if exists "designs_read" on designs;
create policy "designs_read" on designs
  for select using (
    exists (select 1 from projects where id = project_id and client_id = auth.uid())
    or (auth.jwt()->'user_metadata'->>'role') in ('planner', 'designer', 'admin')
  );

drop policy if exists "designs_write_admin" on designs;
create policy "designs_write_admin" on designs
  for insert with check (
    (auth.jwt()->'user_metadata'->>'role') in ('planner', 'designer', 'admin')
  );

drop policy if exists "designs_update_admin" on designs;
create policy "designs_update_admin" on designs
  for update using (
    (auth.jwt()->'user_metadata'->>'role') in ('planner', 'designer', 'admin')
  );

-- project_logs
drop policy if exists "logs_read" on project_logs;
create policy "logs_read" on project_logs
  for select using (
    exists (select 1 from projects where id = project_id and client_id = auth.uid())
    or (auth.jwt()->'user_metadata'->>'role') in ('planner', 'designer', 'admin')
  );

drop policy if exists "logs_insert_admin" on project_logs;
create policy "logs_insert_admin" on project_logs
  for insert with check (
    (auth.jwt()->'user_metadata'->>'role') in ('planner', 'designer', 'admin')
  );

-- intake_files (004에서 생성된 정책도 수정)
drop policy if exists "admin_read_intake_files" on intake_files;
create policy "admin_read_intake_files" on intake_files
  for select using (
    (auth.jwt()->'user_metadata'->>'role') in ('planner', 'designer', 'admin')
  );
