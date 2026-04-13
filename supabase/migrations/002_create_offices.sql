-- Migration: 002_create_offices
-- Description: 가상 오피스 테이블 생성

CREATE TABLE IF NOT EXISTS offices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  layout_config JSONB NOT NULL DEFAULT '{
    "tilemap": "office_basic_20x15",
    "furniture": [],
    "walls": [],
    "zones": []
  }',
  theme VARCHAR(50) NOT NULL DEFAULT 'default'
    CHECK (theme IN ('default', 'modern', 'retro')),
  max_agents INTEGER NOT NULL DEFAULT 2,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS 활성화
ALTER TABLE offices ENABLE ROW LEVEL SECURITY;

-- 정책: 소유자만 CRUD
CREATE POLICY "Users can CRUD own offices" ON offices
  FOR ALL USING (auth.uid() = user_id);

-- 인덱스
CREATE INDEX idx_offices_user_id ON offices(user_id);
