-- user_profiles 테이블 RLS 활성화 + 정책 추가
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 프로필만 조회 가능
CREATE POLICY "users_read_own_profile" ON user_profiles
  FOR SELECT USING (id = auth.uid());

-- 관리자는 모든 프로필 조회 가능
CREATE POLICY "admin_read_all_profiles" ON user_profiles
  FOR SELECT USING (
    (auth.jwt()->'user_metadata'->>'role') IN ('planner', 'designer', 'admin')
  );

-- 서비스 역할만 INSERT/UPDATE 가능 (클라이언트 직접 수정 불가)
-- service_role은 RLS를 우회하므로 별도 정책 불필요
