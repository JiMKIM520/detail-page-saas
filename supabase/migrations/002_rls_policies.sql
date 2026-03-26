alter table projects enable row level security;
alter table scripts enable row level security;
alter table photos enable row level security;
alter table designs enable row level security;
alter table project_logs enable row level security;

create policy "clients_own_projects" on projects
  for select using (client_id = auth.uid());

create policy "clients_create_projects" on projects
  for insert with check (client_id = auth.uid());

create policy "admin_read_projects" on projects
  for select using (
    exists (
      select 1 from auth.users where id = auth.uid()
      and raw_user_meta_data->>'role' in ('planner', 'designer', 'admin')
    )
  );

create policy "admin_update_projects" on projects
  for update using (
    exists (
      select 1 from auth.users where id = auth.uid()
      and raw_user_meta_data->>'role' in ('planner', 'designer', 'admin')
    )
  );

create policy "scripts_access" on scripts
  for all using (
    exists (select 1 from projects where id = project_id and client_id = auth.uid())
    or exists (
      select 1 from auth.users where id = auth.uid()
      and raw_user_meta_data->>'role' in ('planner', 'designer', 'admin')
    )
  );

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
