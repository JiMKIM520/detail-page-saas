-- 폐쇄형 플랫폼: 사업자등록번호 컬럼 추가 + 사용 제한 1회로 변경
alter table user_profiles add column business_number text;

alter table user_profiles alter column usage_limit set default 1;

-- 기존 사용자도 1회 제한 적용
update user_profiles set usage_limit = 1 where usage_limit > 1;
