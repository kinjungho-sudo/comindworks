-- 에이전트 포트레이트 이미지 세트 저장
ALTER TABLE agents ADD COLUMN IF NOT EXISTS portrait_set JSONB DEFAULT '{}';
-- portrait_set 구조: { "idle": "url", "thinking": "url", "happy": "url", "focused": "url" }
