-- 기타 카테고리 추가
INSERT INTO categories (name, slug, legal_summary, tone)
VALUES ('기타', 'etc', '해당 없음', '친근하고 명확한')
ON CONFLICT (slug) DO NOTHING;

-- projects 테이블에 신규 컬럼 추가
ALTER TABLE projects ADD COLUMN IF NOT EXISTS brand_name text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS target_audience jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS design_preference text;
