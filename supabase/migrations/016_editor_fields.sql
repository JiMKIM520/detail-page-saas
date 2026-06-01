-- 에디터 관련 컬럼 추가 (designs 테이블)
ALTER TABLE designs ADD COLUMN IF NOT EXISTS edited_copy jsonb;
ALTER TABLE designs ADD COLUMN IF NOT EXISTS edited_style_guide jsonb;
ALTER TABLE designs ADD COLUMN IF NOT EXISTS edited_html_url text;
ALTER TABLE designs ADD COLUMN IF NOT EXISTS editor_version int DEFAULT 0;
ALTER TABLE designs ADD COLUMN IF NOT EXISTS last_edited_at timestamptz;
