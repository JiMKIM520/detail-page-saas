-- 클라이언트 프로필 + 사용 제한
create table user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  avatar_url text,
  role text not null default 'client',
  usage_count int not null default 0,
  usage_limit int not null default 3,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table user_profiles enable row level security;

create policy "users_read_own_profile" on user_profiles
  for select using (id = auth.uid());

create policy "users_update_own_profile" on user_profiles
  for update using (id = auth.uid());

create policy "admin_read_all_profiles" on user_profiles
  for select using (
    (auth.jwt()->'user_metadata'->>'role') in ('planner', 'designer', 'admin')
  );

create policy "admin_update_profiles" on user_profiles
  for update using (
    (auth.jwt()->'user_metadata'->>'role') = 'admin'
  );

-- 서비스 롤에서 insert 가능하도록 (회원가입 시)
create policy "service_insert_profile" on user_profiles
  for insert with check (true);

-- updated_at 트리거
create trigger user_profiles_updated_at
  before update on user_profiles
  for each row execute function update_updated_at();
