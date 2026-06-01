-- 섹션별 이미지 URL을 JSONB 배열로 저장
-- 형식: [{"type": "hero", "url": "https://..."}, {"type": "benefits", "url": "..."}, ...]
ALTER TABLE designs ADD COLUMN IF NOT EXISTS section_images jsonb;
