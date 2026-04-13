-- Migration: 006_create_agent_memories
-- Description: 에이전트 메모리 (Vector DB) 테이블 생성

-- pgvector 확장 활성화
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS agent_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding VECTOR(1536) NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  memory_type VARCHAR(30) NOT NULL
    CHECK (memory_type IN ('task_result', 'user_feedback', 'context', 'decision')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS 활성화
ALTER TABLE agent_memories ENABLE ROW LEVEL SECURITY;

-- 정책: 자신의 에이전트 메모리만 CRUD
CREATE POLICY "Users can CRUD memories of agents in own offices" ON agent_memories
  FOR ALL USING (
    agent_id IN (
      SELECT a.id FROM agents a
      JOIN offices o ON a.office_id = o.id
      WHERE o.user_id = auth.uid()
    )
  );

-- 벡터 유사도 검색용 인덱스 (IVFFlat)
CREATE INDEX idx_memories_embedding ON agent_memories
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_memories_agent_id ON agent_memories(agent_id);
CREATE INDEX idx_memories_type ON agent_memories(memory_type);

-- 유사도 검색 함수
CREATE OR REPLACE FUNCTION match_memories(
  query_embedding VECTOR(1536),
  match_agent_id UUID,
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  memory_type VARCHAR(30),
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    am.id,
    am.content,
    am.metadata,
    am.memory_type,
    1 - (am.embedding <=> query_embedding) AS similarity
  FROM agent_memories am
  WHERE am.agent_id = match_agent_id
    AND 1 - (am.embedding <=> query_embedding) > match_threshold
  ORDER BY am.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
