-- S1: 플랫폼 워크플로 MVP — 데이터·상태 확장
-- 적용 대상: projects 컬럼 추가, status CHECK 제약, project_assignments, notifications

-- ─────────────────────────────────────────────────────────────────
-- 1. projects: 신규 컬럼 추가
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS due_date              timestamptz,
  ADD COLUMN IF NOT EXISTS product_received_at   timestamptz,
  ADD COLUMN IF NOT EXISTS intake_approved_at    timestamptz,
  ADD COLUMN IF NOT EXISTS revision_count        int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS client_viewed_at      timestamptz,
  ADD COLUMN IF NOT EXISTS client_delivered_at   timestamptz,
  ADD COLUMN IF NOT EXISTS tags                  jsonb NOT NULL DEFAULT '{}';

COMMENT ON COLUMN projects.due_date            IS 'D-day 기준일 (product_received_at + intake_approved_at 둘 다 확정되면 +14일 자동 산정)';
COMMENT ON COLUMN projects.product_received_at IS '제품 도착 확인 일시';
COMMENT ON COLUMN projects.intake_approved_at  IS '의뢰서 승인 일시';
COMMENT ON COLUMN projects.revision_count      IS '기업 수정요청 누적 횟수 (최대 2회)';
COMMENT ON COLUMN projects.client_viewed_at    IS '기업 초안 최초 열람 일시';
COMMENT ON COLUMN projects.client_delivered_at IS '납품 확인 일시';
COMMENT ON COLUMN projects.tags                IS '운영 태그 { hold, revise, reviewing, rewrite, revision_n } — JSON 오브젝트';

-- ─────────────────────────────────────────────────────────────────
-- 2. projects.status CHECK 제약
--    기존 14종 + 신규 5종 (invited, designer_working, draft_submitted, revision_1, revision_2)
--    NOT VALID → 기존 데이터 스캔 없이 DDL 즉시 완료, VALIDATE로 별도 검증
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE projects
  ADD CONSTRAINT projects_status_check CHECK (status IN (
    -- 신규 5종
    'invited',
    'designer_working',
    'draft_submitted',
    'revision_1',
    'revision_2',
    -- 기존 14종
    'intake_submitted',
    'script_generating',
    'script_review',
    'script_approved',
    'design_planning',
    'design_plan_review',
    'prompt_ready',
    'photo_scheduled',
    'photo_uploaded',
    'design_generating',
    'design_failed',
    'design_review',
    'design_approved',
    'delivered'
  )) NOT VALID;

-- 기존 데이터 전수 검증 (위반 행이 있으면 여기서 에러 발생 → 적용 중단)
ALTER TABLE projects VALIDATE CONSTRAINT projects_status_check;

-- ─────────────────────────────────────────────────────────────────
-- 3. project_assignments — 배정 이력 (덮어쓰기 유실 방지)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS project_assignments (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  role         text NOT NULL,          -- 'designer' | 'planner' | 'photographer'
  staff_id     uuid NOT NULL REFERENCES auth.users(id),
  assigned_by  uuid REFERENCES auth.users(id),
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE project_assignments ENABLE ROW LEVEL SECURITY;

-- 스태프(admin/designer/planner)는 조회 가능
CREATE POLICY "staff_read_project_assignments" ON project_assignments
  FOR SELECT USING (
    (auth.jwt()->'user_metadata'->>'role') IN ('admin', 'designer', 'planner')
  );

-- 관리자만 생성·수정·삭제
CREATE POLICY "admin_manage_project_assignments" ON project_assignments
  FOR ALL USING (
    (auth.jwt()->'user_metadata'->>'role') = 'admin'
  );

-- ─────────────────────────────────────────────────────────────────
-- 4. notifications — 발송 로그 (중복 발송 방지)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid REFERENCES projects(id) ON DELETE SET NULL,
  channel     text NOT NULL,    -- 'email' | 'sms' | 'alimtalk'
  template    text NOT NULL,    -- 템플릿 식별자 (예: 'invite', 'draft_ready', 'delivered')
  recipient   text NOT NULL,    -- 수신자 이메일/전화번호
  status      text NOT NULL DEFAULT 'pending', -- 'pending' | 'sent' | 'failed'
  sent_at     timestamptz,
  meta        jsonb DEFAULT '{}',
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 관리자/플래너는 발송 로그 조회 가능
CREATE POLICY "staff_read_notifications" ON notifications
  FOR SELECT USING (
    (auth.jwt()->'user_metadata'->>'role') IN ('admin', 'planner')
  );

-- 관리자/플래너는 발송 레코드 생성 가능 (서비스 롤은 RLS 우회)
CREATE POLICY "staff_insert_notifications" ON notifications
  FOR INSERT WITH CHECK (
    (auth.jwt()->'user_metadata'->>'role') IN ('admin', 'planner')
  );

-- 서비스 롤(크론잡)이 상태 업데이트 가능 (RLS 우회이므로 정책 추가 불필요)
-- 단, 사용자 롤에서도 실패 상태 업데이트 허용
CREATE POLICY "staff_update_notifications" ON notifications
  FOR UPDATE USING (
    (auth.jwt()->'user_metadata'->>'role') IN ('admin', 'planner')
  );
