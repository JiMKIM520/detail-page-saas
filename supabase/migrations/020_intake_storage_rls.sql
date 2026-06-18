-- 020: intake-files 스토리지 RLS + 사용량 보상 감소 함수
-- 배경(버그):
--   (1) intake-files 버킷(private)에 storage.objects 정책이 전무 → 클라이언트의
--       supabase.storage.from('intake-files').upload()가 "new row violates row-level
--       security policy"로 실패(파일 업로드 불가). [Bug1]
--   (2) 제출 흐름이 "사용량 증가+프로젝트 생성" → "파일 업로드" 순서라, 업로드 실패 시
--       사용 횟수만 소모되고 고아 프로젝트가 남음. → 코드에서 "업로드 먼저, 그다음
--       원자적 생성"으로 재배치하고, 생성 단계 실패 시 보상 감소를 위해 함수 추가. [Bug2]
--
-- 스토리지 경로 규약(두 가지 모두 허용 — 코드 배포 전/후 호환):
--   (신) {userId}/{uploadId}/{fileType}/...   → 첫 폴더가 본인 uid
--   (구) {projectId}/{fileType}/...           → 첫 폴더가 본인 소유 프로젝트 id
-- 본인 폴더(또는 본인 프로젝트)에만 쓰기/읽기 허용.

-- 클라이언트: 업로드
create policy "clients_insert_own_intake_storage" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'intake-files'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1 from projects
        where id::text = (storage.foldername(name))[1] and client_id = auth.uid()
      )
    )
  );

-- 클라이언트: 조회
create policy "clients_select_own_intake_storage" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'intake-files'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1 from projects
        where id::text = (storage.foldername(name))[1] and client_id = auth.uid()
      )
    )
  );

-- 스태프(기획/디자이너/관리자): intake-files 전체 조회
create policy "staff_select_intake_storage" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'intake-files'
    and exists (
      select 1 from auth.users
      where id = auth.uid()
      and raw_user_meta_data->>'role' in ('planner', 'designer', 'admin')
    )
  );

-- 사용량 보상 감소: increment_usage 이후 후속 단계(프로젝트 생성) 실패 시 롤백용.
create or replace function decrement_usage(uid uuid)
returns void as $$
begin
  update user_profiles
  set usage_count = greatest(usage_count - 1, 0)
  where id = uid;
end;
$$ language plpgsql security definer;
