-- Migration: 004_create_ability_cards
-- Description: 능력 카드 테이블 생성

CREATE TABLE IF NOT EXISTS ability_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  category VARCHAR(30) NOT NULL
    CHECK (category IN ('writing', 'analysis', 'coding', 'design', 'communication')),
  description TEXT NOT NULL,
  icon VARCHAR(50) NOT NULL,
  tools_config JSONB NOT NULL DEFAULT '[]',
  prompt_template TEXT NOT NULL,
  tier_required VARCHAR(20) NOT NULL DEFAULT 'free'
    CHECK (tier_required IN ('free', 'basic', 'pro')),
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS 활성화
ALTER TABLE ability_cards ENABLE ROW LEVEL SECURITY;

-- 정책: 모든 인증 사용자가 조회 가능
CREATE POLICY "Anyone authenticated can read ability cards" ON ability_cards
  FOR SELECT USING (auth.role() = 'authenticated');

-- 인덱스
CREATE INDEX idx_ability_cards_category ON ability_cards(category);
CREATE INDEX idx_ability_cards_tier ON ability_cards(tier_required);
