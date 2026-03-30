-- [CRITICAL] categories 테이블 RLS 활성화
alter table categories enable row level security;
create policy "Anyone can read categories" on categories for select using (true);

-- platforms 테이블 RLS 활성화 (기존 누락분)
alter table platforms enable row level security;
create policy "Anyone can read platforms" on platforms for select using (true);

-- [CRITICAL] usage_count 원자적 증가 함수 (레이스 컨디션 방지)
create or replace function increment_usage(uid uuid)
returns boolean as $$
declare
  current_count int;
  max_limit int;
begin
  select usage_count, usage_limit into current_count, max_limit
  from user_profiles where id = uid for update;

  if current_count is null then return false; end if;
  if current_count >= max_limit then return false; end if;

  update user_profiles set usage_count = usage_count + 1 where id = uid;
  return true;
end;
$$ language plpgsql security definer;
