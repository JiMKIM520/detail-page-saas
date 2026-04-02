ALTER TABLE comments ADD COLUMN IF NOT EXISTS role text DEFAULT 'client';
