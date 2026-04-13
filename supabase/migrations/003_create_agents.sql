-- Migration: 003_create_agents
-- Description: AI 에이전트 테이블 생성

CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id UUID NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(100) NOT NULL,
  avatar_sprite VARCHAR(50) NOT NULL DEFAULT 'agent_default',
  position_x INTEGER NOT NULL DEFAULT 5,
  position_y INTEGER NOT NULL DEFAULT 5,
  status VARCHAR(20) NOT NULL DEFAULT 'idle'
    CHECK (status IN ('idle', 'working', 'thinking', 'completed')),
  system_prompt TEXT NOT NULL,
  abilities JSONB NOT NULL DEFAULT '[]',
  personality JSONB NOT NULL DEFAULT '{
    "tone": "professional",
    "verbosity": "concise",
    "proactivity": "medium",
    "language": "ko",
    "specialNotes": ""
  }',
  stats JSONB NOT NULL DEFAULT '{
    "tasks_completed": 0,
    "success_rate": 0,
    "total_tokens": 0
  }',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS 활성화
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- 정책: 자신의 오피스에 속한 에이전트만 CRUD
CREATE POLICY "Users can CRUD agents in own offices" ON agents
  FOR ALL USING (
    office_id IN (SELECT id FROM offices WHERE user_id = auth.uid())
  );

-- 인덱스
CREATE INDEX idx_agents_office_id ON agents(office_id);
CREATE INDEX idx_agents_status ON agents(status);

-- updated_at 트리거
CREATE TRIGGER agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
