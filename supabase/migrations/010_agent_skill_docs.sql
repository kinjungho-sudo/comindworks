-- 에이전트 자기유지 스킬 문서 테이블
-- 에이전트가 작업을 통해 배운 내용을 마크다운으로 축적
CREATE TABLE IF NOT EXISTS agent_skill_docs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id   UUID REFERENCES agents(id) ON DELETE CASCADE UNIQUE,
  content    TEXT NOT NULL DEFAULT '',
  version    INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE agent_skill_docs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users access own agent skill docs"
  ON agent_skill_docs FOR ALL
  USING (
    agent_id IN (
      SELECT a.id FROM agents a
      JOIN offices o ON a.office_id = o.id
      WHERE o.user_id = auth.uid()
    )
  );

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_skill_doc_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER skill_doc_updated
  BEFORE UPDATE ON agent_skill_docs
  FOR EACH ROW EXECUTE FUNCTION update_skill_doc_timestamp();
