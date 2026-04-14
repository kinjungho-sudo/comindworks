-- =============================================
-- Co-Mind Works DB 셋업
-- =============================================

-- auth.users 트리거만 먼저 제거 (나머지는 CASCADE로 자동 삭제)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 기존 테이블 삭제 (CASCADE가 트리거/FK 모두 정리)
DROP TABLE IF EXISTS agent_skill_docs CASCADE;
DROP TABLE IF EXISTS messages         CASCADE;
DROP TABLE IF EXISTS agent_memories   CASCADE;
DROP TABLE IF EXISTS tasks            CASCADE;
DROP TABLE IF EXISTS ability_cards    CASCADE;
DROP TABLE IF EXISTS agents           CASCADE;
DROP TABLE IF EXISTS offices          CASCADE;
DROP TABLE IF EXISTS users            CASCADE;

-- 기존 함수 삭제
DROP FUNCTION IF EXISTS handle_new_user()           CASCADE;
DROP FUNCTION IF EXISTS handle_new_office_for_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at()          CASCADE;
DROP FUNCTION IF EXISTS match_memories(vector,uuid,float,int) CASCADE;

-- =============================================
-- 공통 함수
-- =============================================
CREATE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- =============================================
-- 테이블 생성
-- =============================================

CREATE TABLE users (
  id                  UUID        PRIMARY KEY,
  email               VARCHAR(255) NOT NULL UNIQUE,
  display_name        VARCHAR(100) NOT NULL,
  avatar_url          TEXT,
  subscription_tier   VARCHAR(20)  NOT NULL DEFAULT 'free'
    CHECK (subscription_tier IN ('free','basic','pro')),
  onboarding_completed BOOLEAN    NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_users_auth FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view own"   ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "update own" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "insert own" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE offices (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  layout_config JSONB     NOT NULL DEFAULT '{}',
  theme       VARCHAR(50)  NOT NULL DEFAULT 'default'
    CHECK (theme IN ('default','modern','retro')),
  max_agents  INTEGER      NOT NULL DEFAULT 2,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE offices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crud own offices" ON offices FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_offices_user_id ON offices(user_id);

CREATE TABLE agents (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id     UUID        NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
  name          VARCHAR(100) NOT NULL,
  role          VARCHAR(100) NOT NULL,
  avatar_sprite VARCHAR(50)  NOT NULL DEFAULT 'agent_default',
  position_x    INTEGER      NOT NULL DEFAULT 5,
  position_y    INTEGER      NOT NULL DEFAULT 5,
  status        VARCHAR(20)  NOT NULL DEFAULT 'idle'
    CHECK (status IN ('idle','working','thinking','completed','failed')),
  system_prompt TEXT         NOT NULL,
  abilities     JSONB        NOT NULL DEFAULT '[]',
  personality   JSONB        NOT NULL DEFAULT '{}',
  stats         JSONB        NOT NULL DEFAULT '{}',
  portrait_set  JSONB        DEFAULT '{}',
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crud agents" ON agents FOR ALL
  USING (office_id IN (SELECT id FROM offices WHERE user_id = auth.uid()));
CREATE INDEX idx_agents_office_id ON agents(office_id);
CREATE TRIGGER agents_updated_at
  BEFORE UPDATE ON agents FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE ability_cards (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(100) NOT NULL,
  category        VARCHAR(30)  NOT NULL
    CHECK (category IN ('writing','analysis','coding','design','communication')),
  description     TEXT         NOT NULL,
  icon            VARCHAR(50)  NOT NULL DEFAULT '📌',
  tools_config    JSONB        NOT NULL DEFAULT '[]',
  prompt_template TEXT         NOT NULL DEFAULT '',
  tier_required   VARCHAR(20)  NOT NULL DEFAULT 'free'
    CHECK (tier_required IN ('free','basic','pro')),
  is_default      BOOLEAN      NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);
ALTER TABLE ability_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read ability cards" ON ability_cards
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE TABLE tasks (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id     UUID        NOT NULL REFERENCES agents(id)  ON DELETE CASCADE,
  office_id    UUID        NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
  title        VARCHAR(200) NOT NULL,
  instruction  TEXT         NOT NULL,
  status       VARCHAR(20)  NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','in_progress','review','completed','failed')),
  result       JSONB,
  thinking_log JSONB        NOT NULL DEFAULT '[]',
  token_usage  JSONB        NOT NULL DEFAULT '{}',
  feedback     JSONB,
  started_at   TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crud tasks" ON tasks FOR ALL
  USING (office_id IN (SELECT id FROM offices WHERE user_id = auth.uid()));
CREATE INDEX idx_tasks_agent_id  ON tasks(agent_id);
CREATE INDEX idx_tasks_office_id ON tasks(office_id);
CREATE INDEX idx_tasks_created   ON tasks(created_at DESC);

CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE agent_memories (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id    UUID        NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  content     TEXT        NOT NULL,
  embedding   VECTOR(1536) NOT NULL,
  metadata    JSONB        NOT NULL DEFAULT '{}',
  memory_type VARCHAR(30)  NOT NULL
    CHECK (memory_type IN ('task_result','user_feedback','context','decision')),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);
ALTER TABLE agent_memories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crud memories" ON agent_memories FOR ALL
  USING (agent_id IN (
    SELECT a.id FROM agents a
    JOIN offices o ON a.office_id = o.id
    WHERE o.user_id = auth.uid()
  ));
CREATE INDEX idx_memories_agent ON agent_memories(agent_id);

CREATE FUNCTION match_memories(
  query_embedding  VECTOR(1536),
  match_agent_id   UUID,
  match_threshold  FLOAT DEFAULT 0.7,
  match_count      INT   DEFAULT 5
)
RETURNS TABLE (id UUID, content TEXT, metadata JSONB, memory_type VARCHAR(30), similarity FLOAT)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT am.id, am.content, am.metadata, am.memory_type,
         1 - (am.embedding <=> query_embedding) AS similarity
  FROM agent_memories am
  WHERE am.agent_id = match_agent_id
    AND 1 - (am.embedding <=> query_embedding) > match_threshold
  ORDER BY am.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

CREATE TABLE messages (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id   UUID        REFERENCES agents(id)  ON DELETE CASCADE,
  office_id  UUID        NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
  role       TEXT        NOT NULL CHECK (role IN ('user','agent','system')),
  content    TEXT        NOT NULL,
  task_id    UUID        REFERENCES tasks(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crud messages" ON messages FOR ALL
  USING (office_id IN (SELECT id FROM offices WHERE user_id = auth.uid()));

CREATE TABLE agent_skill_docs (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id   UUID        UNIQUE REFERENCES agents(id) ON DELETE CASCADE,
  content    TEXT        NOT NULL DEFAULT '',
  version    INTEGER     DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE agent_skill_docs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crud skill docs" ON agent_skill_docs FOR ALL
  USING (agent_id IN (
    SELECT a.id FROM agents a
    JOIN offices o ON a.office_id = o.id
    WHERE o.user_id = auth.uid()
  ));

-- =============================================
-- Auth 훅
-- =============================================
CREATE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, avatar_url)
  VALUES (
    NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE FUNCTION handle_new_office_for_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.offices (user_id, name, theme)
  VALUES (NEW.id, NEW.display_name || '의 워크스페이스', 'default');
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_user_created_create_office
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_office_for_user();

-- =============================================
-- 기존 Google 로그인 유저 프로필 + 워크스페이스 생성
-- =============================================
INSERT INTO public.users (id, email, display_name, avatar_url)
SELECT
  id, email,
  COALESCE(raw_user_meta_data->>'full_name', split_part(email,'@',1)),
  raw_user_meta_data->>'avatar_url'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.offices (user_id, name, theme)
SELECT u.id, u.display_name || '의 워크스페이스', 'default'
FROM public.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.offices o WHERE o.user_id = u.id
);
