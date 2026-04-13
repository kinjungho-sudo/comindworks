-- 채팅 메시지 히스토리 테이블
-- tasks와 별도로 UI 메시지 흐름 저장 (시스템 메시지, 알림 등 포함 가능)
CREATE TABLE IF NOT EXISTS messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id   UUID REFERENCES agents(id) ON DELETE CASCADE,
  office_id  UUID REFERENCES offices(id) ON DELETE CASCADE NOT NULL,
  role       TEXT NOT NULL CHECK (role IN ('user', 'agent', 'system')),
  content    TEXT NOT NULL,
  task_id    UUID REFERENCES tasks(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users access own messages"
  ON messages FOR ALL
  USING (
    office_id IN (
      SELECT id FROM offices WHERE user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS messages_office_agent_idx ON messages(office_id, agent_id, created_at DESC);
