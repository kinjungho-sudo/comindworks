# Co-Mind Works (코마인드웍스) MVP 설계서

> **Version:** 1.0  
> **Date:** 2026년 4월 13일  
> **Author:** 정호 (창업자)  
> **Tech Stack:** JavaScript · Supabase · Claude API · Vercel  
> **Status:** MVP 개발 착수 단계

---

## 목차

1. [MVP 전략 개요](#1-mvp-전략-개요)
2. [시스템 아키텍처](#2-시스템-아키텍처)
3. [데이터베이스 스키마 설계](#3-데이터베이스-스키마-설계)
4. [API 엔드포인트 설계](#4-api-엔드포인트-설계)
5. [화면 설계 (UI/UX Wireframe)](#5-화면-설계-uiux-wireframe)
6. [프론트엔드 컴포넌트 설계](#6-프론트엔드-컴포넌트-설계)
7. [Phaser.js 오피스 엔진 설계](#7-phaserjs-오피스-엔진-설계)
8. [AI 엔진 설계 (Claude API 연동)](#8-ai-엔진-설계-claude-api-연동)
9. [프로젝트 폴더 구조](#9-프로젝트-폴더-구조)
10. [MVP 개발 로드맵](#10-mvp-개발-로드맵)
11. [리스크 및 대응 전략](#11-리스크-및-대응-전략)
12. [핵심 기술 의사결정 기록 (ADR)](#12-핵심-기술-의사결정-기록-adr)
13. [MVP 기본 능력 카드 목록](#13-mvp-기본-능력-카드-목록)
14. [개발용 Sub-Agent 구성안](#14-개발용-sub-agent-구성안)
15. [Skill 활용 방안](#15-skill-활용-방안)
16. [개발 효율화 방안](#16-개발-효율화-방안)
17. [종합 실행 매트릭스](#17-종합-실행-매트릭스)

---

## 1. MVP 전략 개요

### 1.1 MVP 정의 및 목표

코마인드웍스 MVP는 전체 비전의 핵심 가치 명제인 **"게임처럼 직관적으로 AI 에이전트를 배치하고 업무를 위임하는 경험"**을 최소 기능으로 검증하는 것을 목표로 합니다.

#### MVP 핵심 가설

- 1인 창업가/지식 노동자는 도트형 가상 오피스 UI를 통해 AI 에이전트를 더 직관적으로 이해하고 활용할 수 있다
- 드래그 앤 드롭 능력 카드 방식은 복잡한 프롬프트 설정보다 사용자 채택률을 높인다
- 에이전트의 사고 과정 시각화(Glass-box)는 AI에 대한 신뢰를 확보한다

#### MVP 성공 기준 (Success Metrics)

| 지표 | 목표값 | 측정 방법 |
|------|--------|-----------|
| 초기 베타 테스터 확보 | 50명 | 가입 수 |
| 에이전트 생성 완료율 | 70% 이상 | 온보딩 퍼널 완료/이탈 |
| 주간 재방문율 (WAU) | 40% 이상 | 주간 활성 사용자/전체 |
| 핵심 작업 완료 시간 | 5분 이내 | 에이전트 생성부터 첫 작업 완료까지 |
| NPS (Net Promoter Score) | 30 이상 | 베타 설문 |

### 1.2 MVP 범위 정의 (Scope)

MVP에서는 전체 비전의 레이어 1(플랫폼) + 레이어 2(에이전트 시스템)의 핵심만 구현합니다. 레이어 3(Co-Mind Market)은 MVP 범위 밖입니다.

| 기능 영역 | MVP 포함 | 후순위 (Post-MVP) |
|-----------|----------|-------------------|
| 도트형 메타버스 오피스 UI | ✅ 기본 2D 오피스 + 에이전트 배치 | 3D 확장, 커스텀 인테리어 |
| 에이전트 생성 및 역할 부여 | ✅ 능력 카드 드래그 앤 드롭 | 커스텀 능력 카드 제작 |
| 에이전트 업무 실행 | ✅ 텍스트 기반 작업 실행 | 음성 지시, 멀티모달 |
| Glass-box 사고 과정 시각화 | ✅ 실시간 로그 스트리밍 | 에이전트 간 토론 시각화 |
| Vector DB 기반 학습 (Persistent Memory) | ✅ 기본 메모리 저장/참조 | 조직 지능 자산화 |
| 외부 툴 연동 (Slack, Gmail 등) | ❌ Post-MVP | Agentic RAG 연동 |
| C2C 마켓플레이스 | ❌ Post-MVP | 에이전트/템플릿 거래 |
| 커스텀 아바타/스킨 | ❌ Post-MVP | 에셋 스토어 |
| 과금 시스템 | ❌ Post-MVP | 구독/사용량 과금 |

---

## 2. 시스템 아키텍처

### 2.1 전체 아키텍처 개요

코마인드웍스 MVP는 3계층 아키텍처로 설계됩니다.

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend Layer                         │
│         React 18 + Vite + Phaser.js 3                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────┐ │
│  │Phaser.js │ │ React UI │ │Drag&Drop │ │ Glass-box   │ │
│  │ Office   │ │ Zustand  │ │ Ability  │ │   View      │ │
│  │ Canvas   │ │ Tailwind │ │  Cards   │ │ SSE Stream  │ │
│  └──────────┘ └──────────┘ └──────────┘ └─────────────┘ │
└───────────────────────┬─────────────────────────────────┘
                        │ REST / SSE / WebSocket
┌───────────────────────▼─────────────────────────────────┐
│                    API Layer                              │
│            Vercel Edge Functions (Node.js)                │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────┐  │
│  │Auth API │ │Agent API │ │ Task API │ │ Memory API  │  │
│  └─────────┘ └──────────┘ └──────────┘ └─────────────┘  │
└──────────┬──────────────────────────┬───────────────────┘
           │ SQL + pgvector            │ Streaming + Tool Use
┌──────────▼──────────┐   ┌───────────▼──────────────────┐
│     Data Layer      │   │        AI Engine              │
│  Supabase           │   │  Claude API                   │
│  (PostgreSQL 15+)   │   │  claude-sonnet-4-20250514     │
│  ┌──────┐ ┌───────┐ │   │  ┌──────────┐ ┌────────────┐ │
│  │ Auth │ │Realtime│ │   │  │ System   │ │   Tool     │ │
│  └──────┘ └───────┘ │   │  │ Prompt   │ │ Definitions│ │
│  ┌──────┐ ┌───────┐ │   │  └──────────┘ └────────────┘ │
│  │Storag│ │pgvecto│ │◄──┤  Agent Prompt + Abilities    │
│  └──────┘ └───────┘ │   │  + Memories (context)         │
└─────────────────────┘   └──────────────────────────────┘
```

### 2.2 기술 스택 상세

| 계층 | 기술 스택 | 역할 | 선택 근거 |
|------|-----------|------|-----------|
| Frontend | React 18 + Vite | SPA 프레임워크 | 성숙한 생태계, Phaser.js 연동 용이 |
| Game Engine | Phaser.js 3 | 도트형 오피스 렌더링 | 타일맵 지원 내장, 경량, 2D 최적화 |
| State Mgmt | Zustand + React Query | 클라이언트 상태 관리 | 보일러플레이트 최소, 비동기 캐싱 |
| Styling | Tailwind CSS + Framer Motion | UI 스타일링 + 애니메이션 | 유틸리티 우선, 모션 라이브러리 |
| Backend API | Vercel Edge Functions (Node.js) | 서버리스 API | 콜드스타트 없음, 자동 스케일링, SSE 지원 |
| Realtime | Supabase Realtime (WebSocket) | 실시간 데이터 동기화 | 에이전트 상태/작업 로그 스트리밍 |
| Database | Supabase (PostgreSQL 15+) | 관계형 데이터 저장소 | 무료 티어, Auth/Storage/Realtime 통합 |
| Vector DB | Supabase pgvector | 임베딩 벡터 저장 및 유사도 검색 | 추가 인프라 불필요, JOIN 가능 |
| AI Engine | Claude API (claude-sonnet-4-20250514) | 에이전트 지능 엔진 | Tool Use 우수, Streaming, 한국어 품질 |
| Auth | Supabase Auth (OAuth 2.0) | 사용자 인증/인가 | Google/GitHub OAuth, JWT 기반 |
| Storage | Supabase Storage | 파일 및 에셋 저장 | S3 호환, RLS 적용 가능 |
| Hosting | Vercel | 프론트엔드 + Edge Functions | GitHub 연동, 자동 배포, 프리뷰 URL |
| Monitoring | Vercel Analytics + Sentry | 성능 모니터링 + 에러 추적 | 무료 티어, 실시간 알림 |

### 2.3 실시간 처리 플로우

```
1. 사용자가 오피스 UI에서 에이전트에게 작업 지시
   └─ CommandBar 입력 → POST /api/tasks

2. Edge Function이 컨텍스트 조합
   └─ Agent system_prompt + 능력 카드 prompt_template
   └─ pgvector 유사도 검색 → 관련 메모리 Top 5 주입
   └─ 사용자 지시문 추가

3. Claude API에 Streaming 요청 전송 (Tool Use 포함)
   └─ model: claude-sonnet-4-20250514
   └─ stream: true
   └─ tools: 에이전트에 부여된 능력별 Tool 정의

4. 사고 과정 실시간 스트리밍
   └─ Claude Streaming 응답 → Supabase Realtime 브로드캐스트
   └─ 클라이언트 ThinkingStream 컴포넌트에서 타이핑 효과로 표시

5. 에이전트 캐릭터 애니메이션
   └─ 작업 시작: idle → working 상태 전환
   └─ 사고 중: thinking 상태 (물음표 버블)
   └─ 완료: completed 상태 (파티클 이펙트)

6. Human-in-the-loop 체크포인트 (필요시)
   └─ 중요 의사결정 시점에서 승인 요청
   └─ 사용자 승인/거부/수정 후 계속 진행

7. 결과물 생성 완료
   └─ ResultViewer에 결과 표시
   └─ 사용자 피드백 수집

8. 메모리 엔진이 작업 결과를 Vector DB에 임베딩하여 저장
   └─ 결과 요약 + 사용자 피드백 → 텍스트 임베딩 (1536차원)
   └─ pgvector에 저장 (metadata: 작업ID, 타입, 타임스탬프)
```

---

## 3. 데이터베이스 스키마 설계

Supabase(PostgreSQL)를 기반으로 하며, pgvector 확장을 통해 벡터 검색을 지원합니다.

```sql
-- pgvector 확장 활성화
CREATE EXTENSION IF NOT EXISTS vector;
```

### 3.1 users 테이블

사용자 계정 정보를 저장합니다. Supabase Auth와 연동됩니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 사용자 고유 ID (Supabase Auth uid 연동) |
| email | VARCHAR(255) | NOT NULL, UNIQUE | 이메일 주소 |
| display_name | VARCHAR(100) | NOT NULL | 표시 이름 |
| avatar_url | TEXT | NULLABLE | 프로필 이미지 URL |
| subscription_tier | VARCHAR(20) | NOT NULL, DEFAULT 'free' | 구독 등급: free / basic / pro |
| onboarding_completed | BOOLEAN | NOT NULL, DEFAULT false | 온보딩 완료 여부 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 가입일 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 수정일 |

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  subscription_tier VARCHAR(20) NOT NULL DEFAULT 'free' 
    CHECK (subscription_tier IN ('free', 'basic', 'pro')),
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS 정책
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);
```

### 3.2 offices 테이블 (가상 오피스)

사용자의 가상 오피스 공간을 정의합니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK | 오피스 고유 ID |
| user_id | UUID | FK → users.id, NOT NULL | 소유자 |
| name | VARCHAR(100) | NOT NULL | 오피스 이름 (예: 정호의 본사) |
| layout_config | JSONB | NOT NULL, DEFAULT '{}' | 오피스 레이아웃 설정 (Phaser 타일맵 데이터) |
| theme | VARCHAR(50) | NOT NULL, DEFAULT 'default' | 오피스 테마 (default/modern/retro) |
| max_agents | INTEGER | NOT NULL, DEFAULT 2 | 최대 에이전트 수 (구독 등급별) |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 생성일 |

```sql
CREATE TABLE offices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  layout_config JSONB NOT NULL DEFAULT '{}',
  theme VARCHAR(50) NOT NULL DEFAULT 'default',
  max_agents INTEGER NOT NULL DEFAULT 2,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: 소유자만 접근
ALTER TABLE offices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own offices" ON offices
  FOR ALL USING (auth.uid() = user_id);

-- 인덱스
CREATE INDEX idx_offices_user_id ON offices(user_id);
```

**layout_config JSONB 구조 예시:**
```json
{
  "tilemap": "office_basic_20x15",
  "furniture": [
    { "type": "desk", "x": 5, "y": 3, "rotation": 0 },
    { "type": "bookshelf", "x": 10, "y": 2, "rotation": 0 },
    { "type": "plant", "x": 1, "y": 8, "rotation": 0 }
  ],
  "walls": [
    { "from": [0,0], "to": [19,0] },
    { "from": [0,0], "to": [0,14] }
  ],
  "zones": [
    { "name": "법무팀", "x": 0, "y": 0, "w": 10, "h": 7, "color": "#E6F1FB" },
    { "name": "마케팅팀", "x": 10, "y": 0, "w": 10, "h": 7, "color": "#EAF3DE" }
  ]
}
```

### 3.3 agents 테이블 (AI 에이전트)

가상 오피스에 배치된 AI 에이전트를 정의합니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK | 에이전트 고유 ID |
| office_id | UUID | FK → offices.id, NOT NULL | 소속 오피스 |
| name | VARCHAR(100) | NOT NULL | 에이전트 이름 (예: 법무팀장 민수) |
| role | VARCHAR(100) | NOT NULL | 역할 (예: 법무 분석가, 마케터) |
| avatar_sprite | VARCHAR(50) | NOT NULL, DEFAULT 'agent_default' | 도트 아바타 스프라이트 키 |
| position_x | INTEGER | NOT NULL, DEFAULT 5 | 오피스 내 X 좌표 (타일 단위) |
| position_y | INTEGER | NOT NULL, DEFAULT 5 | 오피스 내 Y 좌표 (타일 단위) |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'idle' | 현재 상태: idle/working/thinking/completed |
| system_prompt | TEXT | NOT NULL | 에이전트 기본 시스템 프롬프트 |
| abilities | JSONB | NOT NULL, DEFAULT '[]' | 부여된 능력 카드 목록 |
| personality | JSONB | NOT NULL, DEFAULT '{}' | 성격 특성 설정 |
| stats | JSONB | NOT NULL, DEFAULT '{}' | 작업 통계 (완료 수, 성공률 등) |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 생성일 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 수정일 |

```sql
CREATE TABLE agents (
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
  personality JSONB NOT NULL DEFAULT '{}',
  stats JSONB NOT NULL DEFAULT '{"tasks_completed": 0, "success_rate": 0, "total_tokens": 0}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD agents in own offices" ON agents
  FOR ALL USING (
    office_id IN (SELECT id FROM offices WHERE user_id = auth.uid())
  );

CREATE INDEX idx_agents_office_id ON agents(office_id);
CREATE INDEX idx_agents_status ON agents(status);
```

**abilities JSONB 구조 예시:**
```json
[
  {
    "ability_id": "uuid-report-writing",
    "name": "보고서 작성",
    "category": "writing",
    "assigned_at": "2026-04-13T10:00:00Z"
  },
  {
    "ability_id": "uuid-web-research",
    "name": "웹 리서치",
    "category": "analysis",
    "assigned_at": "2026-04-13T10:05:00Z"
  }
]
```

**personality JSONB 구조 예시:**
```json
{
  "tone": "professional",
  "verbosity": "concise",
  "proactivity": "high",
  "language": "ko",
  "specialNotes": "법률 용어를 쉽게 풀어서 설명"
}
```

### 3.4 ability_cards 테이블 (능력 카드)

에이전트에게 부여할 수 있는 능력 카드를 정의합니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK | 능력 카드 고유 ID |
| name | VARCHAR(100) | NOT NULL | 능력명 (예: 보고서 작성, 리서치) |
| category | VARCHAR(30) | NOT NULL | 카테고리: writing/analysis/coding/design/communication |
| description | TEXT | NOT NULL | 능력 설명 |
| icon | VARCHAR(50) | NOT NULL | 아이콘 키 (예: icon_report, icon_search) |
| tools_config | JSONB | NOT NULL, DEFAULT '[]' | Claude Tool Use 설정 (함수 정의) |
| prompt_template | TEXT | NOT NULL | 에이전트에 주입되는 프롬프트 템플릿 |
| tier_required | VARCHAR(20) | NOT NULL, DEFAULT 'free' | 필요 구독 등급: free/basic/pro |
| is_default | BOOLEAN | NOT NULL, DEFAULT false | 기본 제공 여부 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 생성일 |

```sql
CREATE TABLE ability_cards (
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

-- 능력 카드는 모든 사용자가 조회 가능
ALTER TABLE ability_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read ability cards" ON ability_cards
  FOR SELECT USING (true);
```

**tools_config JSONB 구조 예시 (보고서 작성):**
```json
[
  {
    "name": "write_document",
    "description": "보고서 또는 문서를 작성하여 반환합니다.",
    "input_schema": {
      "type": "object",
      "properties": {
        "title": { "type": "string", "description": "문서 제목" },
        "content": { "type": "string", "description": "문서 본문 (마크다운)" },
        "format": { "type": "string", "enum": ["markdown", "html"], "description": "출력 형식" }
      },
      "required": ["title", "content"]
    }
  }
]
```

### 3.5 tasks 테이블 (작업)

에이전트에게 지시된 작업과 그 결과를 기록합니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK | 작업 고유 ID |
| agent_id | UUID | FK → agents.id, NOT NULL | 담당 에이전트 |
| office_id | UUID | FK → offices.id, NOT NULL | 소속 오피스 |
| title | VARCHAR(200) | NOT NULL | 작업 제목 |
| instruction | TEXT | NOT NULL | 사용자 지시 내용 |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'pending' | 상태: pending/in_progress/review/completed/failed |
| result | JSONB | NULLABLE | 작업 결과물 |
| thinking_log | JSONB | NOT NULL, DEFAULT '[]' | Glass-box 사고 과정 로그 배열 |
| token_usage | JSONB | NOT NULL, DEFAULT '{}' | 토큰 사용량 (input/output) |
| started_at | TIMESTAMPTZ | NULLABLE | 작업 시작 시각 |
| completed_at | TIMESTAMPTZ | NULLABLE | 작업 완료 시각 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 생성일 |

```sql
CREATE TABLE tasks (
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
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD tasks in own offices" ON tasks
  FOR ALL USING (
    office_id IN (SELECT id FROM offices WHERE user_id = auth.uid())
  );

CREATE INDEX idx_tasks_agent_id ON tasks(agent_id);
CREATE INDEX idx_tasks_office_id ON tasks(office_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);
```

**thinking_log JSONB 구조 예시:**
```json
[
  {
    "step": 1,
    "phase": "planning",
    "content": "주어진 주제에 대해 보고서 구조를 먼저 설계하겠습니다.",
    "timestamp": "2026-04-13T10:01:00Z"
  },
  {
    "step": 2,
    "phase": "information_gathering",
    "content": "관련 메모리에서 이전 보고서 작성 패턴을 참조합니다.",
    "references": ["memory_id_1", "memory_id_2"],
    "timestamp": "2026-04-13T10:01:05Z"
  },
  {
    "step": 3,
    "phase": "drafting",
    "content": "초안을 작성하고 있습니다...",
    "timestamp": "2026-04-13T10:01:30Z"
  },
  {
    "step": 4,
    "phase": "review",
    "content": "초안 검수 완료. 최종 결과물을 생성합니다.",
    "timestamp": "2026-04-13T10:02:00Z"
  }
]
```

### 3.6 agent_memories 테이블 (Vector DB)

에이전트의 학습 데이터를 벡터로 저장하여 유사도 검색을 지원합니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | UUID | PK | 메모리 고유 ID |
| agent_id | UUID | FK → agents.id, NOT NULL | 소속 에이전트 |
| content | TEXT | NOT NULL | 원본 텍스트 내용 |
| embedding | VECTOR(1536) | NOT NULL | 임베딩 벡터 (OpenAI ada-002 호환) |
| metadata | JSONB | NOT NULL, DEFAULT '{}' | 출처, 작업 ID, 타입 등 메타정보 |
| memory_type | VARCHAR(30) | NOT NULL | 타입: task_result/user_feedback/context/decision |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 생성일 |

```sql
CREATE TABLE agent_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding VECTOR(1536) NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  memory_type VARCHAR(30) NOT NULL
    CHECK (memory_type IN ('task_result', 'user_feedback', 'context', 'decision')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE agent_memories ENABLE ROW LEVEL SECURITY;
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
```

### 3.7 ER 다이어그램 (관계도)

```
users (1) ──────── (N) offices
                         │
                    (1)──(N) agents
                         │        │
                    (1)──(N) tasks │
                                  │
                         (1)──(N) agent_memories

ability_cards (독립 테이블 - agents.abilities JSONB로 참조)
```

---

## 4. API 엔드포인트 설계

Vercel Edge Functions 기반의 RESTful API입니다. 인증은 Supabase Auth JWT 토큰을 사용합니다.

### 4.1 인증 API

| 메서드 | 엔드포인트 | 설명 | Request Body | Response |
|--------|-----------|------|-------------|----------|
| POST | `/api/auth/signup` | 회원가입 | `{ email, password, display_name }` | `{ user, session }` |
| POST | `/api/auth/login` | 로그인 | `{ email, password }` | `{ user, session }` |
| POST | `/api/auth/oauth` | OAuth 로그인 | `{ provider: 'google' \| 'github' }` | `{ url }` (리다이렉트) |
| POST | `/api/auth/logout` | 로그아웃 | - | `{ success: true }` |
| GET | `/api/auth/me` | 현재 사용자 정보 | - | `{ user }` |

### 4.2 오피스 API

| 메서드 | 엔드포인트 | 설명 | Request Body | Response |
|--------|-----------|------|-------------|----------|
| GET | `/api/offices` | 내 오피스 목록 조회 | - | `{ offices: [] }` |
| POST | `/api/offices` | 새 오피스 생성 | `{ name, theme? }` | `{ office }` |
| GET | `/api/offices/:id` | 오피스 상세 조회 | - | `{ office, agents: [] }` |
| PATCH | `/api/offices/:id` | 오피스 설정 수정 | `{ name?, theme? }` | `{ office }` |
| PATCH | `/api/offices/:id/layout` | 레이아웃 저장 | `{ layout_config }` | `{ office }` |

### 4.3 에이전트 API

| 메서드 | 엔드포인트 | 설명 | Request Body | Response |
|--------|-----------|------|-------------|----------|
| GET | `/api/agents?office_id=xxx` | 오피스 내 에이전트 목록 | - | `{ agents: [] }` |
| POST | `/api/agents` | 에이전트 생성 | `{ office_id, name, role, system_prompt, avatar_sprite?, position_x?, position_y? }` | `{ agent }` |
| GET | `/api/agents/:id` | 에이전트 상세 조회 | - | `{ agent, recent_tasks: [], memory_count }` |
| PATCH | `/api/agents/:id` | 에이전트 수정 | `{ name?, role?, position_x?, position_y?, personality? }` | `{ agent }` |
| DELETE | `/api/agents/:id` | 에이전트 삭제 | - | `{ success: true }` |
| POST | `/api/agents/:id/abilities` | 능력 카드 부여 | `{ ability_id }` | `{ agent }` (abilities 업데이트됨) |
| DELETE | `/api/agents/:id/abilities/:abilityId` | 능력 카드 제거 | - | `{ agent }` |

### 4.4 작업 실행 API

| 메서드 | 엔드포인트 | 설명 | Request Body | Response |
|--------|-----------|------|-------------|----------|
| POST | `/api/tasks` | 에이전트에게 작업 지시 | `{ agent_id, title, instruction }` | `{ task }` (status: pending) |
| GET | `/api/tasks/:id` | 작업 상세 및 결과 조회 | - | `{ task }` |
| GET | `/api/tasks/:id/stream` | SSE: 사고 과정 실시간 스트리밍 | - | `text/event-stream` |
| POST | `/api/tasks/:id/feedback` | 결과물에 대한 피드백 | `{ rating: 1-5, comment }` | `{ success: true }` |
| POST | `/api/tasks/:id/approve` | Human-in-the-loop 승인 | - | `{ task }` (계속 진행) |
| POST | `/api/tasks/:id/reject` | Human-in-the-loop 거부 | `{ reason, modification }` | `{ task }` (수정 후 재실행) |
| GET | `/api/tasks?agent_id=xxx` | 에이전트별 작업 이력 | - | `{ tasks: [], total, page }` |

**SSE 스트리밍 이벤트 형식:**
```
event: thinking
data: {"step": 1, "phase": "planning", "content": "보고서 구조를 설계합니다..."}

event: thinking
data: {"step": 2, "phase": "drafting", "content": "초안을 작성 중입니다..."}

event: tool_use
data: {"tool": "write_document", "input": {"title": "시장 분석 보고서"}}

event: approval_required
data: {"checkpoint": "final_review", "message": "최종 결과물을 확인해주세요."}

event: completed
data: {"task_id": "uuid", "result": {...}}
```

### 4.5 능력 카드 API

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/abilities` | 사용 가능한 능력 카드 목록 (tier 필터링) |
| GET | `/api/abilities/:id` | 능력 카드 상세 |

### 4.6 메모리 API

| 메서드 | 엔드포인트 | 설명 | Request Body |
|--------|-----------|------|-------------|
| GET | `/api/agents/:id/memories?query=xxx` | 유사도 검색 기반 메모리 조회 | query param: query (검색 텍스트) |
| POST | `/api/agents/:id/memories` | 메모리 수동 추가 | `{ content, memory_type }` |
| DELETE | `/api/agents/:id/memories/:memId` | 메모리 삭제 | - |

---

## 5. 화면 설계 (UI/UX Wireframe)

### 5.1 화면 목록 및 플로우

| 화면 ID | 화면명 | 주요 기능 | 진입 경로 |
|---------|--------|-----------|-----------|
| S-01 | 로그인/회원가입 | 이메일/소셜 로그인, 회원가입 | 최초 접근 |
| S-02 | 온보딩 마법사 | 첫 오피스 생성 + 첫 에이전트 만들기 가이드 | 최초 로그인 후 |
| S-03 | 메인 오피스 뷰 (Core) | 도트형 오피스 + 에이전트 배치 + 작업 지시 | 기본 화면 |
| S-04 | 에이전트 상세 패널 | 에이전트 정보/능력/통계/메모리 | 에이전트 클릭 |
| S-05 | 능력 카드 인벤토리 | 드래그 앤 드롭으로 능력 부여 | 좌측 패널 |
| S-06 | 작업 실행 모니터 | Glass-box 사고과정 실시간 뷰 | 작업 실행 시 |
| S-07 | 결과물 뷰어 | 작업 결과 확인 + 피드백 + 승인/거부 | 작업 완료 시 |
| S-08 | 대시보드 | 작업 통계, 에이전트 활동 요약 | 상단 네비게이션 |

### 5.2 S-03: 메인 오피스 뷰 (Core Screen) 상세

플랫폼의 핵심 화면으로, 사용자가 가장 많은 시간을 보내는 화면입니다.

```
┌──────────────────────────────────────────────────────────┐
│ TopBar (64px)                                             │
│ [☰ Menu]  코마인드웍스 - 정호의 본사    [🔔] [👤 정호]    │
├──────────┬───────────────────────────────┬────────────────┤
│LeftPanel │     OfficeCanvas (가변)       │  RightPanel    │
│ (280px)  │     Phaser.js 도트형 오피스    │  (360px)       │
│          │                               │                │
│ 에이전트  │  ┌─────────────────────┐     │  작업 타임라인  │
│ 목록     │  │  🏢 오피스 맵        │     │  ──────────    │
│ ──────── │  │                     │     │  ✅ 시장분석    │
│ 🤖 민수  │  │  [🤖]  [📋]  [🪴]  │     │  ⏳ 보고서     │
│  법무팀장 │  │                     │     │  📝 코드리뷰   │
│  🟢 작업중│  │  [💼]        [🤖]  │     │                │
│          │  │                     │     │  Glass-box     │
│ 🤖 지은  │  │  [🪑]  [📚]        │     │  ─────────     │
│  마케터  │  │                     │     │  💭 계획 수립중 │
│  🔵 대기 │  └─────────────────────┘     │  📖 메모리참조  │
│          │                               │  ✍️ 초안 작성중 │
│ ──────── │                               │                │
│ 능력카드  │                               │  결과물 뷰어   │
│ 인벤토리 │                               │  ──────────    │
│ [📝보고서]│                               │  (작업 완료시   │
│ [🔍리서치]│                               │   결과 표시)   │
│ [📊분석] │                               │                │
│ [💻코딩] │                               │  [👍 승인]     │
│          │                               │  [👎 거부]     │
├──────────┴───────────────────────────────┴────────────────┤
│ CommandBar (48px)                                          │
│ [🤖 민수에게] "이번 달 시장 동향 보고서 작성해줘" [전송▶]    │
└──────────────────────────────────────────────────────────┘
```

**레이아웃 구성:**
- **상단 바 (64px):** 오피스명, 사용자 프로필, 알림, 설정
- **좌측 패널 (280px):** 에이전트 목록 + 능력 카드 인벤토리 (드래그 소스)
- **중앙 캔버스 (가변):** Phaser.js 도트형 오피스 렌더링 영역
- **우측 패널 (360px):** 작업 타임라인 + 채팅 인터페이스 + Glass-box 로그
- **하단 바 (48px):** 빠른 작업 지시 입력창 (캐릭스 바)

**인터랙션:**
- 에이전트 클릭 → 에이전트 상세 패널(S-04) 오픈
- 능력 카드를 에이전트에 드래그 → 능력 부여 API 호출
- 하단 캐릭스 바에 입력 → 선택된 에이전트에게 작업 지시
- 에이전트 작업 중 → 도트 캐릭터 애니메이션 + 사고 과정 우측 패널에 스트리밍

### 5.3 S-06: 작업 실행 모니터 (Glass-box View)

코마인드웍스의 핵심 차별화 기능입니다.

**표시 요소:**
- **사고 단계 표시:** 계획 → 정보수집 → 분석 → 초안작성 → 검수 → 수정 → 완료
- **현재 단계 하이라이트:** 진행 중인 단계에 펄스 애니메이션
- **참조 데이터 표시:** 에이전트가 참조한 메모리/문서 출처 표시
- **실시간 텍스트 스트림:** Claude API Streaming 응답을 타이핑 효과로 표시
- **개입 버튼:** Human-in-the-loop 승인/거부/수정 버튼

---

## 6. 프론트엔드 컴포넌트 설계

### 6.1 컴포넌트 트리

```
App
├── AuthProvider (인증 컨텍스트)
├── OnboardingWizard (초기 설정 흐름)
│   ├── Step1_CreateOffice
│   ├── Step2_CreateAgent
│   └── Step3_AssignAbility
├── MainLayout
│   ├── TopBar (네비게이션 + 프로필)
│   ├── LeftPanel (에이전트 목록 + 능력 카드)
│   │   ├── AgentList
│   │   │   └── AgentListItem (상태 뱃지 포함)
│   │   └── AbilityCardInventory (Draggable)
│   │       └── AbilityCard (개별 카드)
│   ├── OfficeCanvas (핵심: Phaser.js 연동)
│   │   ├── OfficeMap (타일맵 렌더링)
│   │   ├── AgentSprite (도트 캐릭터 + 상태 애니메이션)
│   │   └── DropZone (능력 카드 드롭 영역)
│   ├── RightPanel (작업 + Glass-box)
│   │   ├── TaskTimeline (작업 목록)
│   │   ├── ThinkingStream (SSE 스트리밍)
│   │   │   ├── ThinkingStep (단계별 표시)
│   │   │   └── MemoryReference (참조 메모리 표시)
│   │   └── ResultViewer (결과물 + 피드백)
│   │       ├── ResultContent (마크다운 렌더링)
│   │       ├── FeedbackForm (별점 + 코멘트)
│   │       └── ApprovalButtons (승인/거부)
│   └── CommandBar (하단 작업 지시 입력)
└── AgentDetailModal
    ├── AgentProfile (정보 + 통계)
    ├── AbilitySlots (장착된 능력 카드)
    ├── PersonalityEditor (성격 설정)
    └── MemoryBrowser (메모리 목록/검색)
```

### 6.2 주요 컴포넌트 상세

| 컴포넌트 | 책임 | 주요 Props/State | Zustand Store |
|---------|------|-----------------|---------------|
| OfficeCanvas | Phaser.js 캔버스 마운트 및 생명주기 관리 | officeId, agents[], onAgentClick | useOfficeStore |
| AgentSprite | 개별 에이전트 도트 렌더링 + 상태 애니메이션 | agent, status, position | useAgentStore |
| AbilityCardInventory | 능력 카드 목록 + Drag 시작점 | abilities[], onDragStart | useAbilityStore |
| DropZone | 능력 카드 Drop 대상 영역 | agentId, onDrop(abilityId) | - |
| CommandBar | 자연어 작업 지시 입력 + 전송 | selectedAgentId, onSubmit(instruction) | useTaskStore |
| ThinkingStream | SSE 기반 실시간 사고 과정 표시 | taskId, streamUrl | useStreamStore |
| ResultViewer | 작업 결과물 + 승인/거부 UI | task, onApprove, onReject, onFeedback | useTaskStore |
| AgentDetailModal | 에이전트 전체 정보 모달 | agentId, isOpen, onClose | useAgentStore |

### 6.3 Zustand Store 설계

```javascript
// useAgentStore.js
const useAgentStore = create((set, get) => ({
  agents: [],
  selectedAgentId: null,
  
  setAgents: (agents) => set({ agents }),
  selectAgent: (id) => set({ selectedAgentId: id }),
  updateAgentStatus: (id, status) => set(state => ({
    agents: state.agents.map(a => a.id === id ? { ...a, status } : a)
  })),
  addAbility: (agentId, ability) => set(state => ({
    agents: state.agents.map(a => a.id === agentId 
      ? { ...a, abilities: [...a.abilities, ability] } : a)
  })),
}));

// useTaskStore.js
const useTaskStore = create((set) => ({
  tasks: [],
  currentTask: null,
  thinkingLog: [],
  
  addTask: (task) => set(state => ({ tasks: [task, ...state.tasks] })),
  setCurrentTask: (task) => set({ currentTask: task, thinkingLog: [] }),
  appendThinkingStep: (step) => set(state => ({
    thinkingLog: [...state.thinkingLog, step]
  })),
  completeTask: (taskId, result) => set(state => ({
    tasks: state.tasks.map(t => t.id === taskId 
      ? { ...t, status: 'completed', result } : t),
    currentTask: state.currentTask?.id === taskId 
      ? { ...state.currentTask, status: 'completed', result } : state.currentTask
  })),
}));
```

---

## 7. Phaser.js 오피스 엔진 설계

### 7.1 씬 구성

| 씬 이름 | 책임 | 주요 요소 |
|---------|------|-----------|
| BootScene | 에셋 프리로드 | 스프라이트시트, 타일맵, UI 에셋 로드 |
| OfficeScene | 메인 오피스 렌더링 | 타일맵, 에이전트 스프라이트, 상호작용 영역 |
| UIScene | HUD 오버레이 | 에이전트 상태 버블, 알림 팝업, 말풍선 |

### 7.2 타일맵 설계

- **타일 크기:** 32x32 픽셀
- **맵 크기 (MVP):** 20x15 타일 (640x480 기본 해상도)
- **레이어 구성:** 바닥(Floor) → 가구(Furniture) → 에이전트(Characters) → UI 오버레이
- **충돌 영역:** 벽, 책상 등 이동 불가 영역 설정
- **타일셋:** 도트 오피스 에셋 (무료 에셋 활용 후 커스텀 제작)

### 7.3 에이전트 스프라이트 상태

| 상태 | 애니메이션 | 시각적 표현 | 프레임 |
|------|-----------|------------|--------|
| idle | 2프레임 루프 (breathing) | 제자리에 서 있는 상태 | 0.8초 간격 |
| working | 4프레임 루프 (타이핑 동작) | 책상에서 작업 중 + 말풍선 표시 | 0.3초 간격 |
| thinking | 3프레임 루프 (물음표 표시) | 머리 위에 ... 버블 애니메이션 | 0.5초 간격 |
| completed | 파티클 이펙트 (sparkle) | 체크마크 + 축하격 표시 | 1회 재생 |

### 7.4 Phaser-React 연동

```javascript
// OfficeCanvas.jsx - React에서 Phaser.js 마운트
import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { OfficeScene } from '../scenes/OfficeScene';
import { UIScene } from '../scenes/UIScene';

export function OfficeCanvas({ officeId, agents, onAgentClick }) {
  const gameRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: 640,
      height: 480,
      pixelArt: true, // 도트 그래픽 선명하게
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [BootScene, OfficeScene, UIScene],
    };

    gameRef.current = new Phaser.Game(config);
    
    // React → Phaser 이벤트 전달
    gameRef.current.events.on('agent-clicked', (agentId) => {
      onAgentClick(agentId);
    });

    return () => {
      gameRef.current?.destroy(true);
    };
  }, [officeId]);

  // agents 상태 변경 시 Phaser에 전달
  useEffect(() => {
    const scene = gameRef.current?.scene?.getScene('OfficeScene');
    if (scene) {
      scene.updateAgents(agents);
    }
  }, [agents]);

  return <div ref={containerRef} className="w-full h-full" />;
}
```

---

## 8. AI 엔진 설계 (Claude API 연동)

### 8.1 에이전트 실행 파이프라인

```
1. 사용자 지시 수신 → Edge Function이 컨텍스트 조합
2. 컨텍스트 조합:
   ├── Agent system_prompt (에이전트 기본 설정)
   ├── 부여된 능력 카드의 prompt_template (전문 능력)
   ├── 관련 메모리 (pgvector 유사도 검색 Top 5)
   └── 사용자 instruction (실제 지시문)
3. Claude API 호출 (Streaming + Tool Use)
4. 사고 과정 실시간 스트리밍 → Supabase Realtime → 클라이언트
5. Human-in-the-loop 체크포인트 확인 (필요시)
6. 결과물 생성 및 저장
7. 메모리 임베딩 및 Vector DB 저장
```

### 8.2 Claude API 호출 구조

```javascript
// api/tasks/index.js - 작업 실행 Edge Function
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const anthropic = new Anthropic();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req) {
  const { agent_id, title, instruction } = await req.json();
  
  // 1. 에이전트 정보 조회
  const { data: agent } = await supabase
    .from('agents').select('*').eq('id', agent_id).single();
  
  // 2. 능력 카드 프롬프트 수집
  const abilityIds = agent.abilities.map(a => a.ability_id);
  const { data: abilities } = await supabase
    .from('ability_cards').select('*').in('id', abilityIds);
  
  // 3. 관련 메모리 검색 (pgvector)
  const queryEmbedding = await getEmbedding(instruction);
  const { data: memories } = await supabase
    .rpc('match_memories', {
      query_embedding: queryEmbedding,
      match_agent_id: agent_id,
      match_threshold: 0.7,
      match_count: 5
    });
  
  // 4. System Prompt 조합
  const systemPrompt = buildSystemPrompt(agent, abilities, memories);
  
  // 5. Tool 정의 조합
  const tools = abilities.flatMap(a => a.tools_config);
  tools.push(COMMON_TOOLS.request_approval);
  tools.push(COMMON_TOOLS.save_memory);
  
  // 6. Claude API Streaming 호출
  const stream = anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: instruction }],
    tools: tools,
  });

  // 7. SSE로 클라이언트에 스트리밍
  return new Response(
    new ReadableStream({
      async start(controller) {
        for await (const event of stream) {
          controller.enqueue(
            `data: ${JSON.stringify(event)}\n\n`
          );
        }
        controller.close();
      }
    }),
    { headers: { 'Content-Type': 'text/event-stream' } }
  );
}
```

### 8.3 System Prompt 구성 구조

```
[Agent Base Prompt]
+ [Ability Card Prompts]
+ [Relevant Memories]
+ [User Instruction]
```

- **Agent Base Prompt:** 에이전트의 역할, 성격, 응답 스타일 정의
- **Ability Card Prompts:** 부여된 능력 카드의 전문 프롬프트 템플릿
- **Relevant Memories:** pgvector에서 검색된 관련 경험/피드백 (Top 5)
- **User Instruction:** 사용자의 실제 작업 지시문

### 8.4 Tool Use 설계 (MVP 기본 도구)

| 도구명 | 설명 | 관련 능력 카드 | input_schema 주요 필드 |
|--------|------|---------------|----------------------|
| write_document | 보고서/문서 작성 및 반환 | 보고서 작성, 기획서 작성 | title, content, format |
| search_web | 웹 검색 및 정보 수집 | 리서치, 시장조사 | query, max_results |
| analyze_data | 데이터 분석 및 인사이트 도출 | 데이터 분석, 경쟁 분석 | data, analysis_type |
| generate_code | 코드 생성 및 실행 | 코딩, 웹 개발 | language, description, test |
| request_approval | Human-in-the-loop 승인 요청 | 모든 능력 공통 | checkpoint, message, options |
| save_memory | 중요 결과물/피드백을 메모리에 저장 | 모든 능력 공통 | content, memory_type, importance |

### 8.5 메모리 엔진 (Persistent Memory)

```
메모리 저장 플로우:
1. 작업 결과물 생성 시 → 결과 요약본 자동 생성
2. 사용자 피드백 수신 시 → 피드백 내용 임베딩
3. 텍스트 → 임베딩 벡터 변환 (1536차원)
4. pgvector에 저장 (metadata: 작업ID, 타입, 타임스탬프)
5. 다음 작업 시 코사인 유사도 검색으로 Top 5 메모리 검색

메모리 타입:
- task_result: 작업 결과 요약
- user_feedback: 사용자의 수정/피드백 내용
- context: 업무 맥락 정보
- decision: 중요 의사결정 기록
```

---

## 9. 프로젝트 폴더 구조

```
co-mind-works/
├── public/
│   ├── assets/
│   │   ├── sprites/          # 에이전트 도트 스프라이트시트
│   │   │   ├── agent_default.png
│   │   │   ├── agent_developer.png
│   │   │   ├── agent_marketer.png
│   │   │   └── agent_analyst.png
│   │   ├── tiles/            # 오피스 타일셋
│   │   │   ├── office_floor.png
│   │   │   ├── office_furniture.png
│   │   │   └── office_walls.png
│   │   ├── ui/               # UI 아이콘 및 에셋
│   │   │   ├── status_icons.png
│   │   │   └── thinking_bubbles.png
│   │   └── ability-cards/    # 능력 카드 이미지
│   │       ├── card_report.png
│   │       ├── card_research.png
│   │       └── card_coding.png
│   └── tilemaps/             # Phaser 타일맵 JSON
│       ├── office_basic.json
│       └── office_modern.json
├── src/
│   ├── components/
│   │   ├── layout/           # TopBar, LeftPanel, RightPanel, CommandBar
│   │   ├── office/           # OfficeCanvas, AgentSprite, DropZone
│   │   ├── agents/           # AgentList, AgentDetail, AbilitySlots
│   │   ├── tasks/            # TaskTimeline, ThinkingStream, ResultViewer
│   │   ├── abilities/        # AbilityCardInventory, AbilityCard
│   │   └── common/           # Button, Modal, Badge, Tooltip, Loading
│   ├── scenes/               # Phaser 씬: BootScene, OfficeScene, UIScene
│   ├── stores/               # Zustand 스토어
│   │   ├── useAgentStore.js
│   │   ├── useTaskStore.js
│   │   ├── useOfficeStore.js
│   │   ├── useAbilityStore.js
│   │   └── useStreamStore.js
│   ├── hooks/                # 커스텀 훅
│   │   ├── useAgent.js
│   │   ├── useTask.js
│   │   ├── useStream.js      # SSE 스트리밍 훅
│   │   └── useDragDrop.js    # 드래그앤드롭 훅
│   ├── services/             # API 호출 레이어
│   │   ├── authService.js
│   │   ├── agentService.js
│   │   ├── taskService.js
│   │   ├── abilityService.js
│   │   └── memoryService.js
│   ├── lib/                  # 유틸리티
│   │   ├── supabase.js       # Supabase 클라이언트 초기화
│   │   ├── claude.js         # Claude API 헬퍼
│   │   └── utils.js          # 공통 유틸리티
│   ├── types/                # TypeScript 타입 정의 (JSDoc으로 대체 가능)
│   └── App.jsx
├── api/                      # Vercel Edge Functions
│   ├── auth/
│   │   ├── signup.js
│   │   ├── login.js
│   │   └── me.js
│   ├── offices/
│   │   ├── index.js          # GET (목록), POST (생성)
│   │   └── [id].js           # GET, PATCH
│   ├── agents/
│   │   ├── index.js
│   │   ├── [id].js
│   │   └── [id]/abilities.js
│   ├── tasks/
│   │   ├── index.js          # POST (작업 생성)
│   │   ├── [id].js           # GET (작업 조회)
│   │   ├── [id]/stream.js    # GET SSE (사고과정 스트리밍)
│   │   ├── [id]/feedback.js  # POST (피드백)
│   │   └── [id]/approve.js   # POST (승인)
│   ├── abilities/
│   │   └── index.js
│   └── memories/
│       └── [agentId].js
├── supabase/
│   ├── migrations/
│   │   ├── 001_create_users.sql
│   │   ├── 002_create_offices.sql
│   │   ├── 003_create_agents.sql
│   │   ├── 004_create_ability_cards.sql
│   │   ├── 005_create_tasks.sql
│   │   ├── 006_create_agent_memories.sql
│   │   └── 007_create_rls_policies.sql
│   └── seed.sql              # 초기 데이터 (기본 능력 카드 8종)
├── package.json
├── vite.config.js
├── tailwind.config.js
├── .env.local                # 환경변수 (SUPABASE_URL, CLAUDE_API_KEY 등)
└── vercel.json
```

---

## 10. MVP 개발 로드맵

총 6주 개발 계획으로, 주차별 목표와 산출물을 정의합니다.

| 주차 | 목표 | 산출물 | 품질 게이트 |
|------|------|--------|------------|
| Week 1 | 프로젝트 셋업 + DB 설계 | Supabase 테이블 생성, Auth 연동, 프로젝트 스캐폴딩 | G1: DB 스키마 검증 |
| Week 2 | Phaser.js 오피스 + 에이전트 렌더링 | 타일맵 오피스, 에이전트 스프라이트, 기본 상태 애니메이션 | G2: UI 프로토타입 |
| Week 3 | 능력 카드 + 드래그 앤 드롭 | 능력 카드 UI, 드래그 앤 드롭 로직, 에이전트 능력 부여 API | - |
| Week 4 | Claude API 연동 + Glass-box | 작업 실행, SSE 스트리밍, 사고과정 시각화 | G3: 핵심 루프 완성 |
| Week 5 | Vector DB + 메모리 시스템 | pgvector 연동, 메모리 저장/검색, 피드백 루프 | G4: 메모리 검증 |
| Week 6 | 통합 테스트 + 베타 배포 | E2E 테스트, 버그 수정, Vercel 배포, 베타 테스터 모집 | G5: 배포 준비 완료 |

---

## 11. 리스크 및 대응 전략

| 리스크 | 영향도 | 발생 확률 | 대응 전략 |
|--------|--------|-----------|-----------|
| Claude API 비용 초과 | 높음 | 중간 | 토큰 사용량 제한 (일일 상한), 결과 캐싱, Sonnet 모델 우선 사용, 비용 대시보드 모니터링 |
| Phaser.js 성능 문제 | 중간 | 중간 | 스프라이트 수 제한 (max 12), 뷰포트 바깥 에이전트 비활성화, 타일맵 최적화 |
| 사용자 러닝커브 높음 | 높음 | 높음 | 온보딩 마법사 강화 (3단계 가이드), 툴팁 시스템, 샘플 오피스 프리셋 제공 |
| 메모리 검색 정확도 | 중간 | 중간 | 임베딩 모델 튜닝, 메타데이터 필터링 보강, 유사도 임계값 조정 (0.7 → 실험적 최적화) |
| 동시 접속자 스케일링 | 낮음 | 낮음 | MVP 단계에서는 50명 이하 대상, Edge Functions 자동 스케일링으로 충분 |
| 스프라이트 에셋 제작 리소스 | 중간 | 높음 | 무료 도트 에셋 사용, AI 생성 검토, 최소 4종 에이전트 스프라이트로 시작 |

---

## 12. 핵심 기술 의사결정 기록 (ADR)

### ADR-001: 오피스 엔진으로 Phaser.js 선택

- **결정:** Phaser.js 3을 도트형 메타버스 오피스 렌더링 엔진으로 선택
- **근거:** 성숙한 생태계, 타일맵 지원 내장, React 연동 용이, 경량 (번들 크기 ~300KB gzipped)
- **대안 검토:** PixiJS (너무 로우레벨, 타일맵 직접 구현 필요), Three.js (3D 오버스펙), 순수 Canvas (기능 부족, 개발 시간 과다)
- **트레이드오프:** Phaser.js의 React 연동이 완벽하지 않아 이벤트 브릿지 패턴 필요

### ADR-002: Vector DB로 Supabase pgvector 선택

- **결정:** 별도 Vector DB 대신 Supabase pgvector 확장 사용
- **근거:** 추가 인프라 불필요 (비용 절약), 관계형 데이터와 벡터 데이터 단일 DB에서 JOIN 가능, Supabase 무료 티어 활용 가능
- **대안 검토:** Pinecone (별도 비용 + 복잡성), Weaviate (오버스펙, 운영 부담), Chroma (임베디드만 가능)
- **트레이드오프:** 대규모 벡터 데이터 시 성능 한계 (MVP 규모에서는 충분)

### ADR-003: 백엔드로 Vercel Edge Functions 선택

- **결정:** 전통적인 서버 대신 Vercel Edge Functions 사용
- **근거:** 콜드 스타트 없음 (Edge 런타임), 자동 스케일링, SSE 지원, 프론트엔드와 동일 플랫폼 (배포 단순화)
- **대안 검토:** AWS Lambda (복잡한 설정, 콜드 스타트), Cloudflare Workers (Supabase 연동 제한적), 자체 서버 (운영 부담)
- **트레이드오프:** Edge Functions의 실행 시간 제한 (30초), 대용량 처리 불가 → Streaming으로 해결

### ADR-004: AI 모델로 Claude API 선택

- **결정:** Claude API (claude-sonnet-4-20250514)를 기본 AI 엔진으로 사용
- **근거:** 우수한 Tool Use 지원 (안정적인 함수 호출), Streaming 성능, 한국어 품질 최상급, 비용 효율성 (Sonnet 기준)
- **대안 검토:** GPT-4o (다양하나 Tool Use 복잡성 높음), Gemini (생태계 미성숙), 오픈소스 (성능/안정성 부족)
- **트레이드오프:** Anthropic 단일 의존성 → 향후 멀티 LLM 지원 아키텍처로 확장 가능하도록 추상화 레이어 설계

---

## 13. MVP 기본 능력 카드 목록

MVP에서 기본 제공되는 능력 카드 8종입니다.

| 카드명 | 카테고리 | 설명 | Tool Use 함수 | 등급 |
|--------|---------|------|--------------|------|
| 보고서 작성 | writing | 주제에 맞는 보고서/문서 작성 | write_document | free |
| 웹 리서치 | analysis | 웹 검색 기반 조사 및 요약 | search_web | free |
| 데이터 분석 | analysis | 제공된 데이터 분석 및 인사이트 도출 | analyze_data | basic |
| 코드 생성 | coding | 프로그래밍 코드 생성 및 설명 | generate_code | basic |
| 기획서 작성 | writing | 사업 기획서/제안서 작성 | write_document | free |
| 브레인스토밍 | analysis | 아이디어 발산 및 구조화 | write_document | free |
| 번역 | communication | 다국어 번역 및 로컬라이제이션 | write_document | free |
| 경쟁사 분석 | analysis | 경쟁사 조사 및 비교 분석 | search_web, analyze_data | basic |

---

## 14. 개발용 Sub-Agent 구성안

솔로 창업자가 Claude를 역할별 Sub-Agent로 활용하여 개발 팀처럼 운영하는 전략입니다. 각 Sub-Agent는 독립된 Claude Project에서 운영되어 컨텍스트 오염을 방지합니다.

### 14.1 Sub-Agent 조직도

| Agent ID | Agent 역할 | 전문 영역 | 프로젝트 채널 |
|----------|-----------|-----------|-------------|
| SA-01 | PM Agent (프로젝트 매니저) | 요구사항 정리, 스프린트 계획, 일정 관리, 의사결정 기록 | Claude Project: comind-pm |
| SA-02 | Frontend Agent (프론트엔드) | React, Phaser.js, Tailwind CSS, UI 컴포넌트 개발 | Claude Project: comind-frontend |
| SA-03 | Backend Agent (백엔드) | Vercel Edge Functions, API 설계, Supabase 연동 | Claude Project: comind-backend |
| SA-04 | AI Engine Agent (AI 엔진) | Claude API 연동, 프롬프트 엔지니어링, Tool Use 설계 | Claude Project: comind-ai |
| SA-05 | QA Agent (품질보증) | UX 검수, 코드 리뷰, 테스트 시나리오, 버그 분석 | Claude Project: comind-qa |
| SA-06 | Biz Agent (비즈니스) | 사업계획서, 피칭, 시장조사, 금융/법률 검토 | Claude Project: comind-biz |

### 14.2 각 Sub-Agent 상세 설계

#### SA-01: PM Agent (프로젝트 매니저)

| 항목 | 설정 내용 |
|------|----------|
| System Prompt 핵심 | "너는 코마인드웍스 MVP 프로젝트 PM이다. 6주 로드맵 기반으로 주간 스프린트를 계획하고, 작업을 분배하고, 병목을 해소해라. 소크라테스식 질문으로 의사결정을 돕되, 실행 요청에는 즉시 실행해라." |
| Project Knowledge | MVP 설계서 전문, 6주 로드맵, DB 스키마, API 목록 |
| Memory Edits | "코마인드웍스는 도트형 메타버스 오피스에서 AI 에이전트를 운영하는 플랫폼", "기술 스택: React + Phaser.js / Vercel / Supabase / Claude API", "MVP 6주 로드맵 진행 중" |
| 주요 산출물 | 주간 스프린트 계획서, 일일 스탠드업 아젠다, 병목 해소 방안 |
| 활용 MCP | Google Calendar (일정), Notion (작업 트래커), Slack (진행 보고) |
| 활용 Skill | 없음 (순수 대화 기반) |

#### SA-02: Frontend Agent (프론트엔드)

| 항목 | 설정 내용 |
|------|----------|
| System Prompt 핵심 | "너는 React + Phaser.js 전문 프론트엔드 개발자이다. Zustand 상태관리, Tailwind CSS, 드래그앤드롭을 활용해 코마인드웍스의 가상 오피스 UI를 만들어라. 도트 그래픽 스타일을 유지하고, pixelArt: true 설정을 항상 적용해라." |
| Project Knowledge | 컴포넌트 트리, 화면 설계(S-01~S-08), Phaser.js 씬 구성, 스프라이트 상태 정의, Zustand Store 설계 |
| Memory Edits | "Phaser.js 3 사용, pixelArt: true 필수", "타일 크기 32x32px, 맵 20x15", "Zustand + React Query 조합", "Tailwind CSS + Framer Motion" |
| 주요 산출물 | 컴포넌트 코드, Phaser 씬 코드, CSS 스타일링, 애니메이션 로직 |
| 활용 MCP | Figma (디자인 참고) |
| 활용 Skill | frontend-design (UI 품질 가이드), web-artifacts-builder (복잡 컴포넌트) |

#### SA-03: Backend Agent (백엔드)

| 항목 | 설정 내용 |
|------|----------|
| System Prompt 핵심 | "너는 Vercel Edge Functions + Supabase 전문 백엔드 개발자이다. PostgreSQL, pgvector, Supabase Auth/Realtime/Storage를 활용해 API를 구축해라. 모든 API는 JWT 인증을 적용하고, RLS 정책을 반드시 설정해라." |
| Project Knowledge | DB 스키마 6개 테이블, API 엔드포인트 설계 (30+ API), Supabase RLS 정책, SSE 스트리밍 구조 |
| Memory Edits | "Vercel Edge Functions (Node.js 런타임)", "Supabase PostgreSQL 15+ with pgvector", "모든 테이블에 RLS 적용 필수", "SSE로 Claude Streaming 전달" |
| 주요 산출물 | Edge Function 코드, SQL 마이그레이션, RLS 정책, seed.sql |
| 활용 MCP | 없음 |
| 활용 Skill | product-self-knowledge (Claude API 정확한 사양 확인) |

#### SA-04: AI Engine Agent (AI 엔진)

| 항목 | 설정 내용 |
|------|----------|
| System Prompt 핵심 | "너는 AI 에이전트 시스템 설계자이다. Claude API Tool Use, Streaming, 프롬프트 엔지니어링, pgvector 임베딩 전략을 설계해라. 각 능력 카드의 System Prompt 템플릿을 최적화하고, Tool 함수 정의를 설계해라." |
| Project Knowledge | AI 엔진 설계 (8장), 능력 카드 8종, Tool Use 정의, 메모리 파이프라인, System Prompt 구성 구조 |
| Memory Edits | "Claude API model: claude-sonnet-4-20250514", "Tool Use + Streaming 조합", "pgvector 1536차원 임베딩", "System Prompt = Agent Base + Ability Cards + Memories + Instruction" |
| 주요 산출물 | System Prompt 템플릿, Tool 함수 정의 JSON, 임베딩 파이프라인 코드 |
| 활용 MCP | 없음 |
| 활용 Skill | product-self-knowledge (Claude API 스펙 확인), skill-creator (능력 카드 프롬프트 테스트) |

#### SA-05: QA Agent (품질보증)

| 항목 | 설정 내용 |
|------|----------|
| System Prompt 핵심 | "너는 UX 검수 및 QA 전문가이다. UX 심리학 법칙 10가지, Nielsen 휴리스틱 10가지, Gestalt 원칙 5가지 기반으로 웹사이트를 검토해라. 100점 만점으로 채점하고 구체적인 개선 피드백을 제공해라." |
| Project Knowledge | 화면 설계 (S-01~S-08), 사용자 플로우, 성공 기준 (Success Metrics) |
| Memory Edits | "UX 심리학 + Nielsen + Gestalt 기반 100점 채점", "E2E 테스트는 Playwright 사용", "컴포넌트 테스트는 React Testing Library" |
| 주요 산출물 | UX 검수 보고서 (100점 채점), 버그 리포트, 테스트 시나리오 |
| 활용 MCP | 없음 |
| 활용 Skill | website-reviewer (UX 심리학 + Nielsen + Gestalt 기반 100점 채점) |

#### SA-06: Biz Agent (비즈니스)

| 항목 | 설정 내용 |
|------|----------|
| System Prompt 핵심 | "너는 AI 에이전트 시장의 비즈니스 전략가이다. 모두의창업 2026 심사기준(혁신성/실현가능성/성장잠재력/창업가역량)을 숙지하고 있다. 피칭 자료, 시장 분석, 재무 모델을 전문적으로 작성해라." |
| Project Knowledge | 사업계획서 8페이지, 경쟁 지형 분석, 수익 모델, 8무기 대회 준비 로드맵, 심사기준 |
| Memory Edits | "모두의창업 2026 심사기준: 혁신성/실현가능성/성장잠재력/창업가역량", "B2C 핵심 메시지: 게임처럼 일하고 일하면서 돈 버는 플랫폼", "경쟁사: CrewAI, AutoGPT, Salesforce Agentforce, MS Copilot Studio, Zapier Central" |
| 주요 산출물 | 피칭덱, Q&A 스크립트, 시장 분석 보고서, 금융 계획 |
| 활용 MCP | Google Drive (문서 관리), Notion (정보 정리) |
| 활용 Skill | docx (사업계획서), pptx (피칭덱), xlsx (재무모델) |

### 14.3 Sub-Agent 간 협업 프로토콜

#### 핵심본 공유 방식

- **Notion 중앙 허브:** 모든 Sub-Agent의 산출물을 Notion 페이지에 정리. Agent 간 이동 시 Notion 링크를 컨텍스트로 제공
- **Google Drive 파일 공유:** 코드 파일, 설계서, 에셋 등 물리적 산출물은 Drive에 저장
- **인터페이스 계약서:** Frontend↔Backend 간 API 인터페이스 문서를 PM Agent가 관리

#### 일일 운영 루틴

```
09:30  PM Agent와 오늘의 스프린트 목표 확인 (5분)
10:00  Frontend/Backend Agent에서 각각 작업 진행 (2시간씩)
12:00  PM Agent에게 진행상황 보고 + 병목 상의 (10분)
13:00  AI Engine/QA Agent 작업 (2시간)
15:00  통합 이슈 확인 및 해결 (30분)
16:00  PM Agent에게 오늘 완료/미완료 정리, Notion 업데이트 (10분)
```

---

## 15. Skill 활용 방안

### 15.1 기존 Skill → 개발 단계별 매핑

| 개발 단계 | 활용 Skill | 활용 방법 | 담당 Agent |
|-----------|-----------|-----------|-----------|
| Week 1: 프로젝트 셋업 | docx | DB 스키마 문서화, API 인터페이스 계약서 생성 | SA-01 PM |
| Week 1: 프로젝트 셋업 | xlsx | 6주 스프린트 계획 스프레드시트 생성 | SA-01 PM |
| Week 2: 오피스 UI | frontend-design | 도트형 오피스 UI 디자인 가이드라인 적용 | SA-02 Frontend |
| Week 2: 오피스 UI | web-artifacts-builder | React + shadcn/ui 복잡 컴포넌트 제작 | SA-02 Frontend |
| Week 3: 능력 카드 | frontend-design | 드래그앤드롭 인터랙션 UI 구현 | SA-02 Frontend |
| Week 4: Claude API | product-self-knowledge | Claude API Tool Use 정확한 스펙 확인 | SA-04 AI Engine |
| Week 4: Claude API | skill-creator | 능력 카드 프롬프트 템플릿 테스트 및 평가 | SA-04 AI Engine |
| Week 5: 메모리 | product-self-knowledge | pgvector 연동 및 임베딩 파이프라인 검증 | SA-03 Backend |
| Week 6: QA + 배포 | website-reviewer | UX 심리학 + Nielsen + Gestalt 기반 100점 검수 | SA-05 QA |
| 전 기간: 비즈니스 | docx / pptx / xlsx | 사업계획서 보강, 피칭덱, 재무모델 | SA-06 Biz |

### 15.2 신규 커스텀 Skill 제작 계획

skill-creator 스킬을 활용하여 코마인드웍스 전용 Skill을 새로 만들어 개발 효율을 근본적으로 높입니다.

| Skill 이름 | 목적 | 트리거 예시 | 우선순위 |
|------------|------|-----------|---------|
| comind-component-gen | Phaser.js 에이전트 스프라이트 + React UI 컴포넌트 보일러플레이트 자동 생성 | "에이전트 컴포넌트 만들어줘", "새 스프라이트 추가" | ★★★ |
| comind-api-scaffold | Edge Function API 엔드포인트 보일러플레이트 + Supabase CRUD + RLS 자동 생성 | "에이전트 API 만들어줘", "tasks API 생성" | ★★★ |
| comind-prompt-lab | 능력 카드의 System Prompt 템플릿 A/B 테스트 및 성능 비교 도구 | "프롬프트 테스트", "능력 카드 평가" | ★★ |
| comind-sprint-report | 주간 스프린트 결과를 Notion 페이지 + 마크다운 보고서로 자동 생성 | "스프린트 보고서", "주간 정리" | ★★ |
| comind-deploy-check | Vercel 배포 전 체크리스트 자동 검증 (환경변수, API 엔드포인트, DB 마이그레이션) | "배포 전 확인", "배포 체크" | ★ |

### 15.3 MCP 통합 활용 전략

현재 연결된 MCP 서버를 개발 프로세스에 통합합니다.

| MCP 서버 | 활용 목적 | 연동 시나리오 |
|---------|---------|-------------|
| Google Calendar | 스프린트 일정 관리 | 주간 마일스톤 자동 생성, 배포일 알림 설정 |
| Gmail | 베타 테스터 모집/소통 | 베타 초대 메일 초안 작성, 피드백 수집 |
| Notion | 프로젝트 중앙 허브 | 스프린트 보드, 버그 트래커, API 문서, 회의록 |
| Figma | UI 디자인 참고 | 화면 설계 컴포넌트 확인, 디자인 토큰 추출 |
| Canva | 마케팅 에셋 제작 | 베타 런칭 홈페이지, 소셜 미디어 카드 |
| Slack | 개발 진행 보고 | 스프린트 완료 보고, 버그 알림, 배포 알림 |
| n8n | 워크플로우 자동화 | CI/CD 트리거, 베타 피드백 수집 자동화, 뉴스 다이제스트 |

### 15.4 n8n 워크플로우 통합 계획

기존 n8n 인프라를 활용하여 반복 작업을 자동화합니다.

| 워크플로우 | 트리거 | 동작 |
|-----------|--------|------|
| 베타 피드백 수집기 | 웹훅 (베타 폼 제출) | 폼 데이터 → Notion DB 저장 → Slack 알림 |
| 데일리 뉴스 다이제스트 | 매일 08:00 스케줄 | AI/창업/보안 뉴스 수집 → Notion 저장 (daily-news-digest Skill 연동) |
| 배포 알림 봇 | Vercel 배포 웹훅 | 배포 완료 → Slack + Calendar 업데이트 |
| 경쟁사 모니터링 | 주간 스케줄 | CrewAI/AutoGPT/Zapier Central 업데이트 추적 → 보고서 |

---

## 16. 개발 효율화 방안

### 16.1 코드 생성 효율화 전략

#### 전략 1: 보일러플레이트 선행 제작

반복되는 코드 패턴을 보일러플레이트화하여 comind-component-gen, comind-api-scaffold Skill로 제작합니다.

| 보일러플레이트 | 생성 내용 | 시간 절약 |
|--------------|---------|---------|
| Edge Function 엔드포인트 | CRUD + Auth 미들웨어 + 에러 처리 + Supabase 연동 | API당 30분 → 5분 |
| React 컴포넌트 | Zustand 연동 + Tailwind 스타일링 + 타입 정의 | 컴포넌트당 20분 → 5분 |
| Phaser 스프라이트 | 애니메이션 상태머신 + 위치 로직 + 이벤트 핸들러 | 스프라이트당 40분 → 10분 |
| Supabase 테이블 + RLS | CREATE TABLE + RLS 정책 + 인덱스 + 시드 데이터 | 테이블당 20분 → 3분 |

#### 전략 2: 대화 컨텍스트 최적화

Claude 대화창의 컨텍스트 창을 최대한 효율적으로 사용하기 위한 원칙입니다.

- **프로젝트 분리 원칙:** 영역별 별도 Claude Project를 생성하여 컨텍스트 오염 방지. 각 Project에는 해당 영역의 설계서만 첨부.
- **프로젝트 지식 파일 활용:** 각 Project에 해당 영역의 설계서, 타입 정의, API 인터페이스 문서를 Project Knowledge로 첨부.
- **메모리 에디트 활용:** 각 Agent의 핵심 컨벤션, 의사결정 기록, 코딩 컨벤션을 Memory Edit으로 등록.
- **대화 길이 관리:** 30턴 이상 되면 새 대화 시작. 이전 대화 결과물은 파일로 출력하여 다음 대화에 첨부.

#### 전략 3: 테스트 자동화

개발 속도와 품질을 동시에 확보하기 위한 테스트 전략입니다.

| 테스트 유형 | 도구 | 적용 시점 | 커버리지 목표 |
|------------|------|----------|-------------|
| 단위 테스트 (함수별) | Vitest | Week 1부터 모든 유틸 함수 | 80% |
| 컴포넌트 테스트 | React Testing Library | Week 2부터 핵심 UI | 60% |
| API 통합 테스트 | Supabase 로컬 테스트 + MSW | Week 3부터 API 연동 | 70% |
| E2E 테스트 | Playwright | Week 6 통합 테스트 | 핵심 플로우 5개 |
| 프롬프트 품질 테스트 | skill-creator eval 프레임워크 | Week 4 능력 카드 제작 시 | 능력 카드 8종 전체 |
| UX 검수 | website-reviewer Skill | Week 6 배포 전 | 70점 이상 통과 |

### 16.2 시간 절약 예상 효과

Sub-Agent + Skill 조합으로 기대되는 시간 절약 효과입니다.

| 영역 | 기존 예상 (순수 코딩) | Sub-Agent + Skill 적용 | 절약률 |
|------|---------------------|----------------------|--------|
| 프로젝트 관리 | 주 5시간 (직접 정리) | 주 1시간 (PM Agent 대행) | 80% |
| API 개발 (30+ API) | 60시간 | 15시간 (보일러플레이트 + Backend Agent) | 75% |
| UI 컴포넌트 (20개) | 40시간 | 15시간 (Frontend Agent + 보일러플레이트) | 62% |
| Phaser.js 오피스 | 30시간 | 20시간 (영역 특성상 수동 비율 높음) | 33% |
| AI 엔진 연동 | 25시간 | 12시간 (AI Engine Agent + prompt-lab) | 52% |
| QA + UX 검수 | 15시간 | 5시간 (website-reviewer 자동 채점) | 67% |
| 비즈니스 문서 | 20시간 | 8시간 (docx/pptx/xlsx Skill) | 60% |
| **합계** | **195시간 (약 8주)** | **76시간 (약 3주)** | **61%** |

### 16.3 주간 스프린트 운영 템플릿

각 주차를 시작할 때 PM Agent와 사용할 스프린트 플래닝 템플릿입니다.

| 항목 | 내용 |
|------|------|
| 스프린트 목표 | Week N의 핵심 목표 1문장 정의 |
| 핵심 산출물 | 이번 주에 완성해야 할 구체적 산출물 3~5개 |
| Agent 별 작업 배분 | 각 Sub-Agent에게 배분할 작업 목록 |
| 어제의 병목 | 이전 주에서 발생한 병목 + 해결 방안 |
| 위험 요소 | 이번 주 예상 리스크 + 대응 전략 |
| 성공 기준 | 이번 주 완료 판단 기준 (체크리스트) |

### 16.4 품질 게이트 (Quality Gate)

각 단계별로 다음 단계로 넘어가기 전 반드시 통과해야 할 품질 기준입니다.

| 게이트 | 시점 | 통과 기준 |
|--------|------|-----------|
| G1: DB 스키마 검증 | Week 1 종료 | 모든 테이블 생성 완료, RLS 적용 완료, seed 데이터 삽입 성공, 관계 무결성 확인 |
| G2: UI 프로토타입 | Week 2 종료 | 오피스 렌더링 성공, 에이전트 스프라이트 표시, 4개 상태 전환 작동, 기본 클릭 인터랙션 |
| G3: 핵심 루프 완성 | Week 4 종료 | 에이전트에게 작업 지시 → Claude 실행 → 결과 표시 전체 플로우 작동, Glass-box 스트리밍 확인 |
| G4: 메모리 검증 | Week 5 종료 | 작업 결과 임베딩 → 다음 작업에서 관련 메모리 검색 성공, 피드백 저장/반영 확인 |
| G5: 배포 준비 완료 | Week 6 종료 | UX 검수 70점+, E2E 테스트 통과, Vercel 배포 성공, 베타 URL 발급 완료 |

---

## 17. 종합 실행 매트릭스

주차별로 어떤 Sub-Agent가, 어떤 Skill/MCP를 사용하여, 무엇을 만드는지를 한 눈에 보여주는 종합 매트릭스입니다.

| 주차 | 주력 Agent | Skill / MCP | 핵심 산출물 | 품질 게이트 |
|------|-----------|-------------|------------|------------|
| W1 | SA-01 PM, SA-03 Backend | docx, xlsx, Notion, Calendar | DB 스키마, Auth 연동, 프로젝트 스캐폴딩 | G1 |
| W2 | SA-02 Frontend | frontend-design, web-artifacts-builder, Figma | Phaser.js 오피스, 에이전트 스프라이트, 기본 애니메이션 | G2 |
| W3 | SA-02 Frontend, SA-03 Backend | frontend-design, comind-api-scaffold | 능력 카드 UI, 드래그앤드롭, Agent API | - |
| W4 | SA-04 AI Engine, SA-03 Backend | product-self-knowledge, skill-creator | Claude API 연동, SSE 스트리밍, Glass-box 뷰 | G3 |
| W5 | SA-04 AI Engine, SA-03 Backend | product-self-knowledge, comind-prompt-lab | pgvector 연동, 메모리 시스템, 피드백 루프 | G4 |
| W6 | SA-05 QA, SA-01 PM | website-reviewer, comind-deploy-check, Slack | E2E 테스트, UX 검수 보고서, Vercel 배포 | G5 |

---

> **문서 끝 | Co-Mind Works MVP 설계서 v1.0 | 2026.04.13**
