-- Migration: 005_create_tasks
-- Description: 작업(Task) 테이블 생성

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  office_id UUID NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  instruction TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'review', 'completed', 'failed')),
  result JSONB,
  thinking_log JSONB NOT NULL DEFAULT '[]',
  token_usage JSONB NOT NULL DEFAULT '{"input_tokens": 0, "output_tokens": 0}',
  feedback JSONB,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS 활성화
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 정책: 자신의 오피스에 속한 작업만 CRUD
CREATE POLICY "Users can CRUD tasks in own offices" ON tasks
  FOR ALL USING (
    office_id IN (SELECT id FROM offices WHERE user_id = auth.uid())
  );

-- 인덱스
CREATE INDEX idx_tasks_agent_id ON tasks(agent_id);
CREATE INDEX idx_tasks_office_id ON tasks(office_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);
