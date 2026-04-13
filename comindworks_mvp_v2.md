# Co-Mind Works (코마인드웍스) MVP 설계서 v2.0

> **Version:** 2.0 (Pivot 반영)  
> **Date:** 2026년 4월 13일  
> **Author:** 정호 (창업자)  
> **Tech Stack:** JavaScript · Supabase · Claude API · Vercel · Tiptap · Monaco  
> **Status:** MVP 재설계 완료 → 개발 착수

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| v1.0 | 2026.04.13 | 최초 작성 (도트형 메타버스 오피스 + Phaser.js 기반) |
| v2.0 | 2026.04.13 | **핵심 피봇**: Phaser.js 제거 → Slack형 워크스페이스, 도트 캐릭터 → 2.5D 일러스트 캐릭터, CommandBar → 채팅 스레드, 메모리 모달 → 자기 기록 .md 스킬 파일, 승인/거부 → 인라인 공동 편집, React Flow → 불필요(Slack 방향으로 해결) |

---

## 피봇 의사결정 요약

### v1.0의 문제점 (솔직한 진단)

| 문제 | 상세 |
|------|------|
| 핵심 인터랙션이 결국 텍스트 입력 | 오피스가 아무리 예뻐도 CommandBar에 타이핑하는 건 ChatGPT와 동일 |
| 기술 해자 부재 | Claude API를 쓰는 건 누구나 가능. Cursor, Perplexity가 기능 추가하면 따라잡힘 |
| 가장 강력한 차별점(메모리)이 숨겨져 있음 | 모달 3depth 안에 있어서 사용자가 인지 불가 |
| Phaser.js가 과잉 | 게임 엔진을 비즈니스 툴에 사용. 유지보수 부담 > 실제 기능 개발 |
| 정보 밀도 낮음 | 픽셀 캐릭터가 전달하는 정보 = 이름 + 상태 점뿐 |
| 학습 루프 부재 | 사용자 수정 → 에이전트 학습 → 다음 작업 반영 구조가 없음 |

### v2.0의 핵심 전환 (6가지 결정)

| # | v1.0 | v2.0 | 전환 근거 |
|---|------|------|----------|
| 1 | 도트 픽셀 캐릭터 (Phaser.js) | **2.5D 일러스트 캐릭터** (상태별 표정 변화) | 정보 밀도 10배 ↑, Phaser 제거로 번들 2.2MB→600KB, 감정적 임팩트 유지 |
| 2 | 도트형 메타버스 오피스 | **Slack형 워크스페이스** (채널 + 채팅 + 파일) | 비교 대상이 없어짐. "AI 팀원과 함께 일하는 실제 워크스페이스" |
| 3 | React Flow 캔버스 | **불필요** (Slack 방향으로 해결) | 채널 목록 + 채팅 스레드 + 파일 패널 = React로 충분 |
| 4 | 승인/거부 버튼 (HITL) | **인라인 공동 편집** (Tiptap + Monaco) | 수정할 때마다 에이전트가 학습. "쓸수록 나에게 맞춰지는 팀원" 구현 |
| 5 | 상태 텍스트 표시 | **캐릭터 표정 변화** (5~6개 표정 세트) | 첫 작업 완료 순간의 감정적 임팩트. 30초 안에 WOW |
| 6 | Vector DB 메모리 (블랙박스) | **자기 기록 .md 스킬 파일** + Vector DB | CLAUDE.md 개념을 에이전트에 적용. 투명하고 편집 가능한 지식 |

### 유지되는 것

- Supabase + pgvector (데이터 계층)
- Claude API + Tool Use + Streaming (AI 엔진)
- SSE 스트리밍 (Glass-box 사고 과정)
- 능력 카드 시스템 (드래그 앤 드롭)
- Human-in-the-loop 체크포인트 (방식만 변경: 대화형으로)
- 에이전트 단위 메모리 (저장 방식 확장: Vector DB + .md)

---

## 목차

1. [MVP 전략 개요](#1-mvp-전략-개요)
2. [시스템 아키텍처 (v2.0)](#2-시스템-아키텍처-v20)
3. [데이터베이스 스키마 설계 (v2.0)](#3-데이터베이스-스키마-설계-v20)
4. [API 엔드포인트 설계 (v2.0)](#4-api-엔드포인트-설계-v20)
5. [화면 설계 (v2.0 Slack형 워크스페이스)](#5-화면-설계-v20-slack형-워크스페이스)
6. [프론트엔드 컴포넌트 설계 (v2.0)](#6-프론트엔드-컴포넌트-설계-v20)
7. [2.5D 일러스트 캐릭터 시스템](#7-25d-일러스트-캐릭터-시스템)
8. [AI 엔진 설계 (v2.0 — 자기 기록 .md 포함)](#8-ai-엔진-설계-v20--자기-기록-md-포함)
9. [아티팩트 패널 설계 (인라인 공동 편집)](#9-아티팩트-패널-설계-인라인-공동-편집)
10. [프로젝트 폴더 구조 (v2.0)](#10-프로젝트-폴더-구조-v20)
11. [MVP 개발 로드맵 (v2.0)](#11-mvp-개발-로드맵-v20)
12. [리스크 및 대응 전략 (v2.0)](#12-리스크-및-대응-전략-v20)
13. [핵심 기술 의사결정 기록 (ADR v2.0)](#13-핵심-기술-의사결정-기록-adr-v20)
14. [MVP 기본 능력 카드 목록](#14-mvp-기본-능력-카드-목록)
15. [개발용 Sub-Agent 구성안 (v2.0)](#15-개발용-sub-agent-구성안-v20)
16. [Skill 활용 방안 (v2.0)](#16-skill-활용-방안-v20)
17. [개발 효율화 방안 (v2.0)](#17-개발-효율화-방안-v20)
18. [종합 실행 매트릭스 (v2.0)](#18-종합-실행-매트릭스-v20)

---

## 1. MVP 전략 개요

### 1.1 MVP 정의 및 목표 (v2.0 재정의)

코마인드웍스 MVP는 **"AI 팀원들과 함께 일하는 실제 워크스페이스"**를 최소 기능으로 검증하는 것을 목표로 합니다.

> v1.0: "게임처럼 직관적으로 AI 에이전트를 배치하고 업무를 위임하는 경험"  
> v2.0: **"AI 팀원이 채널에 있고, 표정으로 상태를 표현하며, 자신만의 스킬 문서를 스스로 쌓아가는 워크스페이스"**

#### MVP 핵심 가설 (v2.0)

- Slack형 워크스페이스에서 AI 에이전트와 대화하면 "도구"가 아닌 "팀원"으로 인지한다
- 2.5D 일러스트 캐릭터의 표정 변화는 에이전트에 대한 애착과 신뢰를 형성한다
- 인라인 공동 편집(수정 → 학습 → 반영)은 "쓸수록 나에게 맞춰지는" 체감을 만든다
- 에이전트의 자기 기록 .md 스킬 파일은 AI의 투명성과 사용자 통제감을 확보한다
- Glass-box 사고 과정 시각화는 AI 신뢰의 핵심 문제를 직접 해결한다

#### MVP 성공 기준 (Success Metrics)

| 지표 | 목표값 | 측정 방법 |
|------|--------|-----------|
| 초기 베타 테스터 확보 | 50명 | 가입 수 |
| 에이전트 생성 완료율 | 70% 이상 | 온보딩 퍼널 완료/이탈 |
| 주간 재방문율 (WAU) | 40% 이상 | 주간 활성 사용자/전체 |
| 핵심 작업 완료 시간 | 5분 이내 | 에이전트 생성부터 첫 작업 완료까지 |
| 인라인 편집 활용률 | 30% 이상 | 아티팩트 수정 사용자/전체 사용자 |
| 스킬 문서 생성 수 | 에이전트당 3개+ | 자동 생성된 .md 파일 수 |
| NPS (Net Promoter Score) | 30 이상 | 베타 설문 |

### 1.2 MVP 범위 정의 (v2.0 Scope)

| 기능 영역 | MVP 포함 | 후순위 (Post-MVP) |
|-----------|----------|-------------------|
| Slack형 워크스페이스 | ✅ 채널 사이드바 + 채팅 스레드 + 메시지 입력 | 스레드 분기, 리액션, DM |
| 2.5D 일러스트 캐릭터 | ✅ 상태별 표정 5~6종 (idle/thinking/working/completed/failed) | 커스텀 캐릭터 생성, 의상 변경 |
| 에이전트 채팅 | ✅ 에이전트와 자연어 대화 + Glass-box 스트리밍 | 음성 지시, 멀티모달 |
| 아티팩트 패널 | ✅ Tiptap(문서) + Monaco(코드) 인라인 편집 | 스프레드시트, 프레젠테이션 |
| 능력 카드 시스템 | ✅ 드래그 앤 드롭으로 에이전트에 능력 부여 | 커스텀 능력 카드 제작 |
| 자기 기록 .md 스킬 파일 | ✅ 에이전트가 작업에서 배운 내용을 스킬 문서로 기록 | 스킬 마켓플레이스 공유 |
| Vector DB 메모리 | ✅ pgvector 유사도 검색 (내부 검색용) | 조직 지능 자산화 |
| 파일 저장소 | ✅ Supabase Storage 기반 파일 업로드/관리 | Google Drive 동기화 |
| 외부 툴 연동 (Slack, Gmail) | ❌ Post-MVP (알림 채널로만 사용) | Gmail 연동, 이메일 리다이렉션 |
| C2C 마켓플레이스 | ❌ Post-MVP | 에이전트/스킬 거래 |
| 과금 시스템 | ❌ Post-MVP | 구독/사용량 과금 |

---

## 2. 시스템 아키텍처 (v2.0)

### 2.1 전체 아키텍처 개요

```
┌──────────────────────────────────────────────────────────────┐
│                     Frontend Layer                            │
│              React 18 + Vite + Tailwind CSS                   │
│  ┌───────────┐ ┌────────────┐ ┌───────────┐ ┌─────────────┐  │
│  │ Channel   │ │ Chat       │ │ Artifact  │ │ Agent       │  │
│  │ Sidebar   │ │ Thread     │ │ Panel     │ │ Profile     │  │
│  │           │ │ (메시지)   │ │ Tiptap    │ │ 2.5D 일러스트│  │
│  │ 에이전트  │ │ Glass-box  │ │ Monaco    │ │ 표정 상태   │  │
│  │ 채널 목록 │ │ Streaming  │ │ 공동편집  │ │ 스킬 .md    │  │
│  └───────────┘ └────────────┘ └───────────┘ └─────────────┘  │
└───────────────────────────┬──────────────────────────────────┘
                            │ REST / SSE / WebSocket
┌───────────────────────────▼──────────────────────────────────┐
│                       API Layer                               │
│               Vercel Edge Functions (Node.js)                 │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────────┐  │
│  │Auth    │ │Channel │ │Message │ │Task    │ │SkillDoc    │  │
│  │API     │ │API     │ │API     │ │API     │ │API         │  │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────────┘  │
└──────────┬──────────────────────────────┬────────────────────┘
           │ SQL + pgvector + Realtime     │ Streaming + Tool Use
┌──────────▼──────────────┐   ┌───────────▼───────────────────┐
│      Data Layer         │   │         AI Engine              │
│  Supabase               │   │  Claude API                    │
│  (PostgreSQL 15+)       │   │  claude-sonnet-4-20250514      │
│  ┌──────┐ ┌───────────┐ │   │  ┌───────────┐ ┌────────────┐ │
│  │ Auth │ │ Realtime   │ │   │  │ System    │ │ Tool       │ │
│  └──────┘ │ (WebSocket)│ │   │  │ Prompt    │ │ Definitions│ │
│  ┌──────┐ └───────────┘ │   │  └───────────┘ └────────────┘ │
│  │Storag│ ┌───────────┐ │   │  ┌───────────┐ ┌────────────┐ │
│  │  e   │ │ pgvector  │ │◄──┤  │ Skill .md │ │ Memory     │ │
│  └──────┘ └───────────┘ │   │  │ Injection │ │ Search     │ │
└─────────────────────────┘   │  └───────────┘ └────────────┘ │
                              └────────────────────────────────┘
```

### 2.2 기술 스택 상세 (v2.0 변경사항 포함)

| 계층 | 기술 스택 | 역할 | v1.0 대비 변경 |
|------|-----------|------|---------------|
| Frontend | React 18 + Vite | SPA 프레임워크 | 유지 |
| ~~Game Engine~~ | ~~Phaser.js 3~~ | ~~도트형 오피스~~ | **제거** (번들 -1.6MB) |
| Chat UI | 자체 React 컴포넌트 | Slack형 채팅 스레드 | **신규** |
| Artifact Editor | Tiptap (문서) + Monaco (코드) | 인라인 공동 편집 | **신규** (v1.0의 ResultViewer 대체) |
| Character | 2.5D 일러스트 이미지 세트 | 에이전트 표정 상태 표현 | **변경** (Phaser 스프라이트 → 정적 이미지) |
| State Mgmt | Zustand + React Query | 클라이언트 상태 관리 | 유지 |
| Styling | Tailwind CSS + Framer Motion | UI 스타일링 + 애니메이션 | 유지 |
| Backend API | Vercel Edge Functions (Node.js) | 서버리스 API | 유지 |
| Realtime | Supabase Realtime (WebSocket) | 실시간 채팅 + Glass-box 스트리밍 | **확장** (채팅 메시지 동기화 추가) |
| Database | Supabase (PostgreSQL 15+) | 관계형 데이터 저장소 | 유지 (테이블 구조 변경) |
| Vector DB | Supabase pgvector | 임베딩 벡터 유사도 검색 (내부용) | 유지 |
| Skill Docs | Supabase DB + Storage | 에이전트 자기 기록 .md 파일 | **신규** |
| AI Engine | Claude API (claude-sonnet-4-20250514) | 에이전트 지능 엔진 | 유지 (Tool 추가: update_skill_doc) |
| Auth | Supabase Auth (OAuth 2.0) | 사용자 인증/인가 | 유지 |
| File Storage | Supabase Storage | 파일 업로드/관리 | **확장** (워크스페이스 파일 서버) |
| Hosting | Vercel | 프론트엔드 + Edge Functions | 유지 |
| Monitoring | Vercel Analytics + Sentry | 성능 모니터링 + 에러 추적 | 유지 |

### 2.3 실시간 처리 플로우 (v2.0)

```
1. 사용자가 에이전트 채널에서 메시지 입력
   └─ 채팅 스레드에서 직접 대화 (CommandBar 제거)

2. Supabase Realtime으로 메시지 저장 + 실시간 표시
   └─ messages 테이블에 INSERT → Realtime 브로드캐스트

3. Edge Function이 컨텍스트 조합 (v2.0 확장)
   └─ Agent system_prompt
   └─ 능력 카드 prompt_template
   └─ 에이전트 자기 기록 .md 스킬 파일 (★신규)
   └─ pgvector 관련 메모리 Top 5
   └─ 사용자 메시지

4. Claude API Streaming + Tool Use 실행
   └─ 에이전트 캐릭터 표정 변화: idle → thinking → working
   └─ Glass-box: 사고 과정 실시간 스트리밍

5. 결과물 생성
   └─ 텍스트 응답: 채팅 스레드에 메시지로 표시
   └─ 문서/코드: 아티팩트 패널에 편집 가능한 형태로 표시
   └─ 에이전트 표정: working → completed (만족 표정)

6. 사용자 인라인 편집 (★신규 학습 루프)
   └─ 아티팩트 패널에서 직접 수정
   └─ 수정 diff → 에이전트 메모리에 저장
   └─ 에이전트가 수정 패턴 학습 → 스킬 .md에 기록
   └─ 다음 작업에서 학습된 스타일 반영

7. 에이전트 자기 기록 (★신규)
   └─ 작업 완료 시 update_skill_doc Tool 호출
   └─ 배운 내용을 스킬별 .md 파일로 기록
   └─ 다음 작업 시 System Prompt에 자동 주입
```

---

## 3. 데이터베이스 스키마 설계 (v2.0)

### v1.0 대비 변경사항

| 테이블 | 변경 유형 | 설명 |
|--------|---------|------|
| users | 유지 | 변경 없음 |
| offices | **→ workspaces** | 이름 변경 + 구조 변경 (오피스 → 워크스페이스) |
| agents | **수정** | position_x/y 제거, avatar_sprite → character_image, 표정 상태 추가 |
| ability_cards | 유지 | 변경 없음 |
| tasks | **수정** | 채팅 메시지 구조로 통합 |
| agent_memories | 유지 | 변경 없음 |
| **channels** | **신규** | Slack형 채널 테이블 |
| **messages** | **신규** | 채팅 메시지 테이블 |
| **artifacts** | **신규** | 아티팩트(문서/코드) 테이블 |
| **agent_skill_docs** | **신규** | 에이전트 자기 기록 .md 파일 테이블 |
| **files** | **신규** | 파일 저장소 메타데이터 |

### 3.1 users 테이블 (유지)

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
```

### 3.2 workspaces 테이블 (구 offices → 이름/구조 변경)

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | UUID (PK) | 워크스페이스 고유 ID |
| user_id | UUID (FK → users) | 소유자 |
| name | VARCHAR(100) | 워크스페이스 이름 |
| description | TEXT | 워크스페이스 설명 |
| max_agents | INTEGER | 최대 에이전트 수 |
| created_at | TIMESTAMPTZ | 생성일 |

```sql
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT DEFAULT '',
  max_agents INTEGER NOT NULL DEFAULT 2,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own workspaces" ON workspaces
  FOR ALL USING (auth.uid() = user_id);
```

### 3.3 channels 테이블 (★신규)

Slack형 채널 구조. 에이전트별 전용 채널 + 범용 채널.

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | UUID (PK) | 채널 고유 ID |
| workspace_id | UUID (FK → workspaces) | 소속 워크스페이스 |
| agent_id | UUID (FK → agents, NULLABLE) | 에이전트 전용 채널이면 에이전트 ID |
| name | VARCHAR(100) | 채널 이름 (예: #general, #민수-법무) |
| channel_type | VARCHAR(20) | general / agent / project |
| description | TEXT | 채널 설명 |
| created_at | TIMESTAMPTZ | 생성일 |

```sql
CREATE TABLE channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  channel_type VARCHAR(20) NOT NULL DEFAULT 'general'
    CHECK (channel_type IN ('general', 'agent', 'project')),
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access channels in own workspaces" ON channels
  FOR ALL USING (
    workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid())
  );

CREATE INDEX idx_channels_workspace ON channels(workspace_id);
CREATE INDEX idx_channels_agent ON channels(agent_id);
```

### 3.4 agents 테이블 (v2.0 수정)

| 컬럼명 | 타입 | 설명 | v1.0 대비 변경 |
|--------|------|------|---------------|
| id | UUID (PK) | 에이전트 고유 ID | 유지 |
| workspace_id | UUID (FK) | 소속 워크스페이스 | 이름 변경 (office_id →) |
| name | VARCHAR(100) | 에이전트 이름 | 유지 |
| role | VARCHAR(100) | 역할 | 유지 |
| character_image_set | VARCHAR(50) | 일러스트 캐릭터 세트 키 | **변경** (avatar_sprite →) |
| expression | VARCHAR(20) | 현재 표정 상태 | **신규** |
| ~~position_x~~ | ~~INTEGER~~ | ~~오피스 내 X 좌표~~ | **제거** |
| ~~position_y~~ | ~~INTEGER~~ | ~~오피스 내 Y 좌표~~ | **제거** |
| status | VARCHAR(20) | 현재 작업 상태 | 유지 |
| system_prompt | TEXT | 기본 시스템 프롬프트 | 유지 |
| abilities | JSONB | 부여된 능력 카드 목록 | 유지 |
| personality | JSONB | 성격 특성 설정 | 유지 |
| stats | JSONB | 작업 통계 | 유지 |
| created_at | TIMESTAMPTZ | 생성일 | 유지 |
| updated_at | TIMESTAMPTZ | 수정일 | 유지 |

```sql
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(100) NOT NULL,
  character_image_set VARCHAR(50) NOT NULL DEFAULT 'agent_default',
  expression VARCHAR(20) NOT NULL DEFAULT 'idle'
    CHECK (expression IN ('idle', 'thinking', 'working', 'completed', 'failed', 'happy')),
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
CREATE POLICY "Users can CRUD agents in own workspaces" ON agents
  FOR ALL USING (
    workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid())
  );
```

### 3.5 messages 테이블 (★신규)

채팅 메시지를 저장합니다. Supabase Realtime으로 실시간 동기화됩니다.

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | UUID (PK) | 메시지 고유 ID |
| channel_id | UUID (FK → channels) | 소속 채널 |
| sender_type | VARCHAR(10) | user / agent / system |
| sender_id | UUID | 사용자 또는 에이전트 ID |
| content | TEXT | 메시지 내용 (마크다운) |
| message_type | VARCHAR(20) | text / thinking / tool_use / artifact_ref / approval_request |
| metadata | JSONB | 추가 정보 (사고 단계, 도구 호출 정보 등) |
| artifact_id | UUID (FK → artifacts, NULLABLE) | 연결된 아티팩트 |
| created_at | TIMESTAMPTZ | 생성일 |

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  sender_type VARCHAR(10) NOT NULL
    CHECK (sender_type IN ('user', 'agent', 'system')),
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  message_type VARCHAR(20) NOT NULL DEFAULT 'text'
    CHECK (message_type IN ('text', 'thinking', 'tool_use', 'artifact_ref', 'approval_request')),
  metadata JSONB NOT NULL DEFAULT '{}',
  artifact_id UUID REFERENCES artifacts(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access messages in own channels" ON messages
  FOR ALL USING (
    channel_id IN (
      SELECT c.id FROM channels c
      JOIN workspaces w ON c.workspace_id = w.id
      WHERE w.user_id = auth.uid()
    )
  );

CREATE INDEX idx_messages_channel ON messages(channel_id, created_at DESC);
CREATE INDEX idx_messages_type ON messages(message_type);

-- Supabase Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
```

### 3.6 artifacts 테이블 (★신규)

에이전트가 생성한 결과물(문서/코드)을 저장합니다. 인라인 편집 대상입니다.

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | UUID (PK) | 아티팩트 고유 ID |
| channel_id | UUID (FK → channels) | 소속 채널 |
| agent_id | UUID (FK → agents) | 생성한 에이전트 |
| title | VARCHAR(200) | 아티팩트 제목 |
| content | TEXT | 아티팩트 내용 (마크다운 또는 코드) |
| artifact_type | VARCHAR(20) | document / code / data |
| language | VARCHAR(20) | 코드 언어 (code 타입일 때) |
| version | INTEGER | 버전 (편집 시 자동 증가) |
| edit_history | JSONB | 사용자 수정 이력 (diff 기록) |
| created_at | TIMESTAMPTZ | 생성일 |
| updated_at | TIMESTAMPTZ | 수정일 |

```sql
CREATE TABLE artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES agents(id),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  artifact_type VARCHAR(20) NOT NULL DEFAULT 'document'
    CHECK (artifact_type IN ('document', 'code', 'data')),
  language VARCHAR(20),
  version INTEGER NOT NULL DEFAULT 1,
  edit_history JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access artifacts in own channels" ON artifacts
  FOR ALL USING (
    channel_id IN (
      SELECT c.id FROM channels c
      JOIN workspaces w ON c.workspace_id = w.id
      WHERE w.user_id = auth.uid()
    )
  );
```

**edit_history JSONB 구조:**
```json
[
  {
    "version": 2,
    "editor": "user",
    "diff": "- 기존 문장\n+ 수정된 문장",
    "timestamp": "2026-04-13T10:30:00Z"
  }
]
```

### 3.7 agent_skill_docs 테이블 (★신규 — 핵심 차별점)

에이전트가 자기 학습 내용을 직접 기록하는 .md 스킬 파일. CLAUDE.md 개념을 에이전트에게 적용한 것입니다.

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | UUID (PK) | 스킬 문서 고유 ID |
| agent_id | UUID (FK → agents) | 소유 에이전트 |
| skill_name | VARCHAR(100) | 스킬 이름 (예: legal-analysis, report-writing) |
| content | TEXT | 마크다운 내용 (에이전트가 직접 작성) |
| auto_generated | BOOLEAN | 자동 생성 여부 (에이전트가 Tool로 생성 vs 수동) |
| created_at | TIMESTAMPTZ | 생성일 |
| updated_at | TIMESTAMPTZ | 수정일 |

```sql
CREATE TABLE agent_skill_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  skill_name VARCHAR(100) NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  auto_generated BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(agent_id, skill_name)
);

ALTER TABLE agent_skill_docs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD skill docs of agents in own workspaces" ON agent_skill_docs
  FOR ALL USING (
    agent_id IN (
      SELECT a.id FROM agents a
      JOIN workspaces w ON a.workspace_id = w.id
      WHERE w.user_id = auth.uid()
    )
  );

CREATE INDEX idx_skill_docs_agent ON agent_skill_docs(agent_id);
```

**스킬 문서 예시 (에이전트 자동 생성):**
```markdown
# 법무 분석 스킬

## 학습된 원칙
- 관할권을 먼저 확인한다
- 계약서 검토 시 면책 조항을 최우선으로 체크한다
- 정호님은 법률 용어를 쉽게 풀어서 설명하는 것을 선호한다

## 이전 작업 패턴
- 보고서 형식: 요약 → 분석 → 리스크 → 권고사항 순서
- 분량: A4 기준 2~3페이지 선호
- 톤: 전문적이되 과도한 법률 용어는 피한다

## 수정 반영 이력
- 2026.04.13: "법적 리스크" → "실무적 주의점"으로 용어 변경 (정호님 피드백)
- 2026.04.15: 결론 부분에 "다음 단계 액션"을 추가하는 패턴 학습
```

### 3.8 ability_cards 테이블 (유지)

```sql
-- v1.0과 동일
CREATE TABLE ability_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  category VARCHAR(30) NOT NULL
    CHECK (category IN ('writing', 'analysis', 'coding', 'design', 'communication')),
  description TEXT NOT NULL,
  icon VARCHAR(50) NOT NULL,
  tools_config JSONB NOT NULL DEFAULT '[]',
  prompt_template TEXT NOT NULL,
  tier_required VARCHAR(20) NOT NULL DEFAULT 'free',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 3.9 tasks 테이블 (v2.0 수정)

채팅 메시지 구조와 통합되지만, 작업 추적용으로 유지합니다.

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  instruction TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'review', 'completed', 'failed')),
  result_artifact_id UUID REFERENCES artifacts(id),
  thinking_log JSONB NOT NULL DEFAULT '[]',
  token_usage JSONB NOT NULL DEFAULT '{"input_tokens": 0, "output_tokens": 0}',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 3.10 agent_memories 테이블 (유지)

```sql
-- v1.0과 동일 (내부 벡터 검색용으로 유지)
CREATE TABLE agent_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding VECTOR(1536) NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  memory_type VARCHAR(30) NOT NULL
    CHECK (memory_type IN ('task_result', 'user_feedback', 'context', 'decision', 'edit_pattern')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- ★ memory_type에 'edit_pattern' 추가 (인라인 편집 패턴 학습용)
```

### 3.11 files 테이블 (★신규)

```sql
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES channels(id),
  uploader_type VARCHAR(10) NOT NULL CHECK (uploader_type IN ('user', 'agent')),
  uploader_id UUID NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access files in own workspaces" ON files
  FOR ALL USING (
    workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid())
  );
```

### 3.12 ER 다이어그램 (v2.0)

```
users (1) ──── (N) workspaces
                      │
                 (1)──(N) channels ──(1)──(N) messages
                 │         │
            (1)──(N) agents │──(1)──(N) artifacts
                 │         │
            (1)──(N) agent_skill_docs    (★신규)
                 │
            (1)──(N) agent_memories
                 │
            (1)──(N) tasks

ability_cards (독립)
files (workspace 소속)
```

---

## 4. API 엔드포인트 설계 (v2.0)

### 4.1 인증 API (유지)

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| POST | `/api/auth/signup` | 회원가입 |
| POST | `/api/auth/login` | 로그인 |
| POST | `/api/auth/oauth` | OAuth 로그인 (Google/GitHub) |
| POST | `/api/auth/logout` | 로그아웃 |
| GET | `/api/auth/me` | 현재 사용자 정보 |

### 4.2 워크스페이스 API (구 오피스 API 대체)

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/workspaces` | 내 워크스페이스 목록 |
| POST | `/api/workspaces` | 새 워크스페이스 생성 (자동으로 #general 채널 생성) |
| GET | `/api/workspaces/:id` | 워크스페이스 상세 (채널 목록 포함) |
| PATCH | `/api/workspaces/:id` | 워크스페이스 수정 |

### 4.3 채널 API (★신규)

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/channels?workspace_id=xxx` | 채널 목록 |
| POST | `/api/channels` | 채널 생성 |
| GET | `/api/channels/:id` | 채널 상세 (최근 메시지 포함) |
| DELETE | `/api/channels/:id` | 채널 삭제 |

### 4.4 메시지 API (★신규)

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/channels/:id/messages` | 채널 메시지 목록 (페이지네이션) |
| POST | `/api/channels/:id/messages` | 메시지 전송 (에이전트에게 작업 지시 트리거) |
| GET | `/api/channels/:id/messages/stream` | SSE: Glass-box 실시간 스트리밍 |

### 4.5 에이전트 API (수정)

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/agents?workspace_id=xxx` | 에이전트 목록 |
| POST | `/api/agents` | 에이전트 생성 (자동으로 전용 채널 생성) |
| GET | `/api/agents/:id` | 에이전트 상세 (스킬 문서 + 메모리 요약 포함) |
| PATCH | `/api/agents/:id` | 에이전트 수정 |
| DELETE | `/api/agents/:id` | 에이전트 삭제 |
| POST | `/api/agents/:id/abilities` | 능력 카드 부여 |
| DELETE | `/api/agents/:id/abilities/:abilityId` | 능력 카드 제거 |

### 4.6 아티팩트 API (★신규)

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/artifacts/:id` | 아티팩트 상세 (내용 + 편집 이력) |
| PATCH | `/api/artifacts/:id` | 아티팩트 편집 (인라인 수정 → diff 저장 → 메모리 학습) |
| GET | `/api/artifacts?channel_id=xxx` | 채널별 아티팩트 목록 |

### 4.7 스킬 문서 API (★신규)

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/agents/:id/skills` | 에이전트 스킬 문서 목록 |
| GET | `/api/agents/:id/skills/:skillName` | 특정 스킬 문서 내용 |
| PUT | `/api/agents/:id/skills/:skillName` | 스킬 문서 수동 편집 (사용자가 직접 수정 가능) |
| DELETE | `/api/agents/:id/skills/:skillName` | 스킬 문서 삭제 |

### 4.8 파일 API (★신규)

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/files?workspace_id=xxx` | 파일 목록 |
| POST | `/api/files/upload` | 파일 업로드 (Supabase Storage) |
| GET | `/api/files/:id/download` | 파일 다운로드 |
| DELETE | `/api/files/:id` | 파일 삭제 |

### 4.9 능력 카드 API (유지)

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/abilities` | 능력 카드 목록 |
| GET | `/api/abilities/:id` | 능력 카드 상세 |

### 4.10 메모리 API (유지)

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| GET | `/api/agents/:id/memories?query=xxx` | 유사도 검색 |
| POST | `/api/agents/:id/memories` | 메모리 수동 추가 |
| DELETE | `/api/agents/:id/memories/:memId` | 메모리 삭제 |

---

## 5. 화면 설계 (v2.0 Slack형 워크스페이스)

### 5.1 화면 목록 (v2.0)

| 화면 ID | 화면명 | v1.0 대비 | 주요 기능 |
|---------|--------|----------|-----------|
| S-01 | 로그인/회원가입 | 유지 | 이메일/소셜 로그인 |
| S-02 | 온보딩 마법사 | 수정 | 워크스페이스 생성 + 첫 에이전트 만들기 |
| S-03 | **메인 워크스페이스** | **전면 교체** | Slack형 레이아웃 (채널 + 채팅 + 아티팩트) |
| S-04 | 에이전트 프로필 | 수정 | 2.5D 캐릭터 + 스킬 .md 브라우저 + 메모리 |
| S-05 | 능력 카드 인벤토리 | 유지 | 드래그 앤 드롭 능력 부여 |
| S-06 | Glass-box 뷰 | **채팅에 통합** | 채팅 스레드 내 사고 과정 인라인 표시 |
| S-07 | 아티팩트 패널 | **전면 교체** | Tiptap + Monaco 인라인 편집 |
| S-08 | 파일 브라우저 | **신규** | 워크스페이스 파일 목록/업로드/다운로드 |

### 5.2 S-03: 메인 워크스페이스 (Core Screen) — 전면 교체

```
┌──────────────────────────────────────────────────────────────┐
│ TopBar (48px)                                                 │
│ [☰]  Co-Mind Works - 정호의 워크스페이스    [🔔] [⚙] [👤]    │
├───────────┬──────────────────────────┬────────────────────────┤
│ Channel   │     Chat Thread          │   Artifact Panel       │
│ Sidebar   │     (채팅 스레드)         │   (결과물 편집)         │
│ (240px)   │     (가변)               │   (400px, 접이식)      │
│           │                          │                        │
│ 📋 채널   │  ┌──────────────────┐    │  ┌──────────────────┐  │
│           │  │ 💬 정호 10:01     │    │  │ 📄 시장 분석 보고서│  │
│ #general  │  │ "이번 달 시장    │    │  │                  │  │
│           │  │  동향 분석해줘"  │    │  │  [Tiptap Editor]  │  │
│ #민수-법무│  └──────────────────┘    │  │                  │  │
│  [😊 완료]│  ┌──────────────────┐    │  │  ## 1. 시장 개요  │  │
│           │  │ 🤔 민수 (생각중)  │    │  │  글로벌 AI 에이전 │  │
│ #지은-마케│  │ 💭 계획 수립 중...│    │  │  트 시장은...     │  │
│  [💼 작업]│  │ 📖 메모리 2건 참조│    │  │                  │  │
│           │  │ ✍️ 초안 작성 중...│    │  │  ## 2. 경쟁 분석  │  │
│ #프로젝트 │  └──────────────────┘    │  │  CrewAI는...      │  │
│           │  ┌──────────────────┐    │  │                  │  │
│ ──────── │  │ 😊 민수 10:03     │    │  │  [편집 중 표시]   │  │
│ 📁 파일   │  │ "보고서 완성했습  │    │  │                  │  │
│ 📊 대시보드│  │  니다. 확인해주세 │    │  └──────────────────┘  │
│           │  │  요."             │    │                        │
│ ──────── │  │ 📎 아티팩트: 시장 │    │  수정하면 에이전트가   │
│ 👤 에이전트│  │    분석 보고서     │    │  학습합니다 💡        │
│  프로필   │  └──────────────────┘    │                        │
│           │                          │  [학습 반영 이력]       │
│           │                          │  ✅ 톤: 전문적 유지     │
│           │                          │  ✅ 분량: 3페이지 선호  │
├───────────┴──────────────────────────┴────────────────────────┤
│ Message Input (56px)                                          │
│ [📎 파일] 민수에게 메시지 입력...                    [전송 ▶]  │
└──────────────────────────────────────────────────────────────┘
```

### 5.3 S-04: 에이전트 프로필 (v2.0)

```
┌──────────────────────────────────────┐
│        에이전트 프로필                 │
│                                      │
│     ┌──────────────┐                 │
│     │  [2.5D 일러스트]│                │
│     │   😊 민수      │                │
│     │  법무팀장      │                │
│     │  [완료] 상태   │                │
│     └──────────────┘                 │
│                                      │
│  ─── 장착된 능력 카드 ───             │
│  [📝 보고서] [🔍 리서치] [📊 분석]    │
│                                      │
│  ─── 스킬 문서 (.md) ───             │
│  📄 legal-analysis.md     [편집]     │
│  📄 report-writing.md     [편집]     │
│  📄 company-context.md    [편집]     │
│  "이 에이전트는 당신의 보고서 스타일을│
│   17번 학습했습니다"                  │
│                                      │
│  ─── 작업 통계 ───                   │
│  완료: 42건 | 성공률: 94%            │
│  총 토큰: 128,450                    │
│                                      │
│  ─── 메모리 타임라인 ───             │
│  • 04.13 법무 검토 패턴 학습         │
│  • 04.12 보고서 톤 피드백 반영       │
│  • 04.11 계약서 양식 선호도 기록     │
└──────────────────────────────────────┘
```

---

## 6. 프론트엔드 컴포넌트 설계 (v2.0)

### 6.1 컴포넌트 트리 (v2.0)

```
App
├── AuthProvider
├── OnboardingWizard (워크스페이스 + 에이전트 생성)
├── MainLayout
│   ├── TopBar
│   ├── ChannelSidebar                          ★ 신규 (구 LeftPanel 대체)
│   │   ├── ChannelList
│   │   │   ├── ChannelItem (에이전트 표정 아이콘 포함)
│   │   │   └── ChannelCreateButton
│   │   ├── FileExplorer
│   │   └── AgentProfileLink
│   ├── ChatThread                              ★ 신규 (구 Phaser 캔버스 대체)
│   │   ├── MessageList
│   │   │   ├── UserMessage
│   │   │   ├── AgentMessage (2.5D 캐릭터 썸네일)
│   │   │   ├── ThinkingMessage (Glass-box 인라인)
│   │   │   └── ArtifactRefMessage (아티팩트 링크 카드)
│   │   ├── ApprovalRequest (HITL 대화형)
│   │   └── MessageInput (구 CommandBar 대체)
│   ├── ArtifactPanel                           ★ 신규 (구 RightPanel 대체)
│   │   ├── ArtifactHeader (제목 + 버전)
│   │   ├── TiptapEditor (문서 편집)
│   │   ├── MonacoEditor (코드 편집)
│   │   ├── EditDiffTracker (수정 이력 추적)
│   │   └── LearningIndicator ("학습 반영 이력")
│   └── AbilityCardInventory (드래그 앤 드롭, 유지)
├── AgentProfileModal
│   ├── CharacterDisplay (2.5D 일러스트 + 표정)
│   ├── AbilitySlots
│   ├── SkillDocBrowser                         ★ 신규
│   │   ├── SkillDocList (.md 파일 목록)
│   │   └── SkillDocEditor (사용자 편집 가능)
│   ├── MemoryTimeline
│   └── AgentStats
└── FileManagerModal                            ★ 신규
    ├── FileList
    ├── FileUploader
    └── FilePreview
```

### 6.2 주요 컴포넌트 상세 (v2.0)

| 컴포넌트 | 책임 | v1.0 대비 | Zustand Store |
|---------|------|----------|---------------|
| ChannelSidebar | 채널 목록 + 에이전트 표정 아이콘 | 구 LeftPanel 대체 | useChannelStore |
| ChatThread | 채팅 메시지 + Glass-box 인라인 | 구 Phaser 캔버스 대체 | useMessageStore |
| MessageInput | 자연어 메시지 입력 + 파일 첨부 | 구 CommandBar 대체 | useMessageStore |
| ArtifactPanel | Tiptap/Monaco 인라인 편집 + 학습 추적 | 구 ResultViewer 대체 | useArtifactStore |
| CharacterDisplay | 2.5D 일러스트 표정 전환 | 구 AgentSprite 대체 | useAgentStore |
| SkillDocBrowser | .md 스킬 파일 목록 + 편집 | ★ 완전 신규 | useSkillDocStore |
| ApprovalRequest | 대화형 HITL (채팅 스레드 내) | 구 승인/거부 버튼 대체 | useTaskStore |

---

## 7. 2.5D 일러스트 캐릭터 시스템

### 7.1 개요

Phaser.js의 도트 스프라이트를 **2.5D 일러스트레이션 캐릭터**로 교체합니다. 비주얼 노벨(역전재판, 헬테이커) 방식으로 표정 세트를 5~6가지 만들어두고 상태에 따라 교체합니다.

### 7.2 표정 상태 매핑

| 상태 | 표정 | 시각적 표현 | 파일명 규칙 |
|------|------|------------|------------|
| idle | 기본 표정 | 자연스러운 미소 | `{character}_idle.png` |
| thinking | 집중 표정 | 눈썹 모양 변화, 약간 심각 | `{character}_thinking.png` |
| working | 바쁜 표정 | 활기찬 눈빛, 약간의 땀 | `{character}_working.png` |
| completed | 만족 표정 | 환한 미소, 성취감 | `{character}_completed.png` |
| failed | 당황 표정 | 미안한 표정, 약간 긴장 | `{character}_failed.png` |
| happy | 행복 표정 | 최고의 미소 (긍정 피드백 시) | `{character}_happy.png` |

### 7.3 기술 구현

```jsx
// CharacterDisplay.jsx
function CharacterDisplay({ agent }) {
  const expressionMap = {
    idle: `/characters/${agent.character_image_set}_idle.png`,
    thinking: `/characters/${agent.character_image_set}_thinking.png`,
    working: `/characters/${agent.character_image_set}_working.png`,
    completed: `/characters/${agent.character_image_set}_completed.png`,
    failed: `/characters/${agent.character_image_set}_failed.png`,
    happy: `/characters/${agent.character_image_set}_happy.png`,
  };

  return (
    <div className="relative">
      <img
        src={expressionMap[agent.expression]}
        alt={`${agent.name} - ${agent.expression}`}
        className="w-24 h-24 rounded-xl transition-all duration-300"
      />
      <StatusBadge status={agent.status} />
    </div>
  );
}
```

### 7.4 초기 캐릭터 세트 (MVP)

| 캐릭터 세트 ID | 설명 | 이미지 수 | 비고 |
|---------------|------|----------|------|
| agent_professional | 전문가 스타일 (정장, 안경) | 6장 | 법무, 기획 에이전트용 |
| agent_creative | 크리에이티브 스타일 (캐주얼) | 6장 | 마케터, 디자이너 에이전트용 |
| agent_developer | 개발자 스타일 (후드티, 헤드셋) | 6장 | 코딩, 기술 에이전트용 |
| agent_analyst | 분석가 스타일 (노트북, 차트) | 6장 | 데이터, 리서치 에이전트용 |

> 정호님이 직접 이미지를 생성하여 초기 3~4개 세트를 준비 예정

---

## 8. AI 엔진 설계 (v2.0 — 자기 기록 .md 포함)

### 8.1 System Prompt 구성 구조 (v2.0 확장)

```
[Agent Base Prompt]                     ← 에이전트 역할/성격
+ [Ability Card Prompts]               ← 능력 카드 전문 프롬프트
+ [Skill Documents (.md)]              ← ★신규: 에이전트 자기 기록
+ [Relevant Memories (pgvector Top 5)]  ← 벡터 검색 결과
+ [User Message]                        ← 사용자 지시
```

### 8.2 Tool Use 설계 (v2.0 확장)

| 도구명 | 설명 | v1.0 대비 |
|--------|------|----------|
| write_document | 보고서/문서 작성 → 아티팩트 생성 | 유지 (아티팩트 테이블 연동) |
| search_web | 웹 검색 및 정보 수집 | 유지 |
| analyze_data | 데이터 분석 및 인사이트 | 유지 |
| generate_code | 코드 생성 → 아티팩트 생성 | 유지 (아티팩트 테이블 연동) |
| request_approval | HITL 승인 요청 (채팅 메시지로 전송) | 방식 변경 (채팅 내 대화형) |
| save_memory | 벡터 메모리 저장 | 유지 |
| **update_skill_doc** | **에이전트 자기 기록 .md 업데이트** | **★신규** |
| **create_artifact** | **채팅에 아티팩트 생성 및 표시** | **★신규** |

### 8.3 update_skill_doc Tool 상세 (★핵심 신규)

```json
{
  "name": "update_skill_doc",
  "description": "작업에서 배운 내용을 스킬 문서에 기록합니다. 새로운 패턴, 사용자 선호도, 업무 규칙을 학습하면 해당 스킬의 .md 파일에 기록합니다.",
  "input_schema": {
    "type": "object",
    "properties": {
      "skill_name": {
        "type": "string",
        "description": "스킬 이름 (예: legal-analysis, report-writing, data-processing)"
      },
      "content": {
        "type": "string",
        "description": "마크다운 형식의 내용 (기존 내용에 추가 또는 전체 교체)"
      },
      "mode": {
        "type": "string",
        "enum": ["append", "overwrite"],
        "description": "append: 기존 내용에 추가, overwrite: 전체 교체"
      }
    },
    "required": ["skill_name", "content"]
  }
}
```

### 8.4 학습 루프 구현 (★핵심 신규)

```
사용자가 아티팩트 수정
    │
    ▼
수정 diff 생성 (이전 버전 vs 현재 버전)
    │
    ├──▶ edit_history에 diff 저장 (artifacts 테이블)
    │
    ├──▶ diff를 텍스트로 변환 → 임베딩 → agent_memories에 저장
    │    (memory_type: 'edit_pattern')
    │
    └──▶ 에이전트의 다음 작업 시:
         ├── pgvector 검색으로 관련 수정 패턴 찾기
         ├── update_skill_doc Tool로 패턴을 .md에 기록
         └── 다음 결과물에 학습된 스타일 반영
```

### 8.5 메모리 이중 구조 (v2.0)

```
[사람이 읽는 레이어]              [기계가 읽는 레이어]
agent_skill_docs                 agent_memories
├── legal-analysis.md            ├── Vector(1536) + metadata
├── report-writing.md            ├── 코사인 유사도 검색
└── company-context.md           └── Top 5 자동 주입
    │                                │
    ├── 사용자가 직접 읽고 편집 가능    ├── 빠른 의미 검색
    ├── 에이전트가 투명하게 공개        ├── 내부 검색 최적화
    └── System Prompt에 전문 주입      └── 관련 컨텍스트 주입
```

---

## 9. 아티팩트 패널 설계 (인라인 공동 편집)

### 9.1 개요

Claude의 Artifact 패턴을 차용합니다. 에이전트가 결과물을 생성하면 오른쪽 아티팩트 패널에 편집 가능한 형태로 열립니다. 사용자가 수정하면 diff를 메모리에 저장하여 에이전트가 학습합니다.

### 9.2 에디터 스택

| 아티팩트 타입 | 에디터 | 라이브러리 | npm 패키지 |
|-------------|--------|-----------|-----------|
| document | 리치 텍스트 | Tiptap | @tiptap/react |
| code | 코드 에디터 | Monaco Editor | @monaco-editor/react |
| data | 테이블 (Post-MVP) | - | - |

### 9.3 레이아웃 구조

```
[채팅 스레드]              [아티팩트 패널]
 좌 (가변)                  우 (400px, 접이식)
┌──────────────┐          ┌──────────────────┐
│ 대화 메시지   │          │ 📄 시장 분석 보고서│
│ ...          │          │ v3 | 수정 2회     │
│ 📎 아티팩트   │ ──────▶ │                  │
│   링크 카드   │          │ [Tiptap Editor]  │
│              │          │                  │
│ 💬 에이전트   │          │ ## 1. 시장 개요   │
│ "수정 내용을  │          │ 글로벌 AI 에이전트│
│  학습했습니다"│ ◀────── │ 시장은...         │
│              │          │                  │
└──────────────┘          │ ─────────────── │
                          │ 학습 반영 이력    │
                          │ ✅ 톤: 전문적     │
                          │ ✅ 분량: 3페이지  │
                          └──────────────────┘
```

---

## 10. 프로젝트 폴더 구조 (v2.0)

```
co-mind-works/
├── public/
│   ├── characters/               ★ 신규 (구 sprites 대체)
│   │   ├── agent_professional/   # 전문가 캐릭터 세트
│   │   │   ├── idle.png
│   │   │   ├── thinking.png
│   │   │   ├── working.png
│   │   │   ├── completed.png
│   │   │   ├── failed.png
│   │   │   └── happy.png
│   │   ├── agent_creative/       # 크리에이티브 캐릭터 세트
│   │   ├── agent_developer/      # 개발자 캐릭터 세트
│   │   └── agent_analyst/        # 분석가 캐릭터 세트
│   └── ui/                       # UI 아이콘
├── src/
│   ├── components/
│   │   ├── layout/               # TopBar, MainLayout
│   │   ├── channels/             ★ 신규 (구 office 대체)
│   │   │   ├── ChannelSidebar.jsx
│   │   │   ├── ChannelList.jsx
│   │   │   └── ChannelItem.jsx
│   │   ├── chat/                 ★ 신규
│   │   │   ├── ChatThread.jsx
│   │   │   ├── MessageList.jsx
│   │   │   ├── UserMessage.jsx
│   │   │   ├── AgentMessage.jsx
│   │   │   ├── ThinkingMessage.jsx
│   │   │   ├── ArtifactRefMessage.jsx
│   │   │   ├── ApprovalRequest.jsx
│   │   │   └── MessageInput.jsx
│   │   ├── artifacts/            ★ 신규 (구 tasks/ResultViewer 대체)
│   │   │   ├── ArtifactPanel.jsx
│   │   │   ├── TiptapEditor.jsx
│   │   │   ├── MonacoEditor.jsx
│   │   │   ├── EditDiffTracker.jsx
│   │   │   └── LearningIndicator.jsx
│   │   ├── agents/
│   │   │   ├── AgentProfileModal.jsx
│   │   │   ├── CharacterDisplay.jsx    ★ 신규 (구 AgentSprite 대체)
│   │   │   ├── SkillDocBrowser.jsx     ★ 신규
│   │   │   ├── SkillDocEditor.jsx      ★ 신규
│   │   │   ├── AbilitySlots.jsx
│   │   │   └── MemoryTimeline.jsx
│   │   ├── abilities/
│   │   │   ├── AbilityCardInventory.jsx
│   │   │   └── AbilityCard.jsx
│   │   ├── files/                ★ 신규
│   │   │   ├── FileExplorer.jsx
│   │   │   └── FileUploader.jsx
│   │   └── common/
│   ├── stores/
│   │   ├── useChannelStore.js    ★ 신규
│   │   ├── useMessageStore.js    ★ 신규
│   │   ├── useArtifactStore.js   ★ 신규
│   │   ├── useSkillDocStore.js   ★ 신규
│   │   ├── useAgentStore.js      수정
│   │   ├── useAbilityStore.js
│   │   └── useFileStore.js       ★ 신규
│   ├── hooks/
│   │   ├── useRealtimeMessages.js  ★ 신규 (Supabase Realtime 구독)
│   │   ├── useSSEStream.js         (구 useStream.js 개선)
│   │   ├── useDragDrop.js
│   │   └── useArtifactDiff.js      ★ 신규 (수정 diff 추적)
│   ├── services/
│   │   ├── authService.js
│   │   ├── workspaceService.js   ★ 신규 (구 officeService 대체)
│   │   ├── channelService.js     ★ 신규
│   │   ├── messageService.js     ★ 신규
│   │   ├── artifactService.js    ★ 신규
│   │   ├── skillDocService.js    ★ 신규
│   │   ├── agentService.js       수정
│   │   ├── abilityService.js
│   │   ├── fileService.js        ★ 신규
│   │   └── memoryService.js
│   ├── lib/
│   │   ├── supabase.js
│   │   ├── claude.js
│   │   └── diff.js               ★ 신규 (텍스트 diff 유틸)
│   └── App.jsx
├── api/                          Vercel Edge Functions
│   ├── auth/
│   ├── workspaces/               ★ 신규 (구 offices 대체)
│   ├── channels/                 ★ 신규
│   ├── messages/                 ★ 신규
│   ├── agents/
│   ├── artifacts/                ★ 신규
│   ├── skills/                   ★ 신규
│   ├── abilities/
│   ├── files/                    ★ 신규
│   └── memories/
├── supabase/
│   ├── migrations/
│   │   ├── 001_create_users.sql
│   │   ├── 002_create_workspaces.sql     ★ 변경
│   │   ├── 003_create_agents.sql         ★ 수정
│   │   ├── 004_create_channels.sql       ★ 신규
│   │   ├── 005_create_messages.sql       ★ 신규
│   │   ├── 006_create_artifacts.sql      ★ 신규
│   │   ├── 007_create_ability_cards.sql
│   │   ├── 008_create_tasks.sql          ★ 수정
│   │   ├── 009_create_agent_memories.sql
│   │   ├── 010_create_agent_skill_docs.sql  ★ 신규
│   │   ├── 011_create_files.sql          ★ 신규
│   │   └── 012_create_rls_policies.sql
│   └── seed.sql
├── package.json
├── vite.config.js
├── tailwind.config.js
└── vercel.json
```

---

## 11. MVP 개발 로드맵 (v2.0)

| 주차 | 목표 | 산출물 | 품질 게이트 |
|------|------|--------|------------|
| Week 1 | 프로젝트 셋업 + DB (v2.0 스키마) | 11개 테이블 생성, Auth 연동, Supabase Realtime 설정 | G1: DB + Realtime 검증 |
| Week 2 | Slack형 워크스페이스 UI | ChannelSidebar + ChatThread + MessageInput, 실시간 메시지 동기화 | G2: 채팅 기본 작동 |
| Week 3 | 에이전트 시스템 + 능력 카드 | 에이전트 CRUD, 2.5D 캐릭터 표정 전환, 능력 카드 드래그앤드롭 | G3: 에이전트 생성 + 표정 작동 |
| Week 4 | Claude API + Glass-box + 아티팩트 | 작업 실행, SSE 스트리밍, Tiptap/Monaco 아티팩트 패널 | G4: 핵심 루프 완성 |
| Week 5 | 메모리 + 스킬 .md + 학습 루프 | pgvector, update_skill_doc Tool, 인라인 편집 → 학습 반영 | G5: 학습 루프 검증 |
| Week 6 | 통합 테스트 + 배포 | E2E 테스트, UX 검수, Vercel 배포, 베타 테스터 모집 | G6: 배포 완료 |

---

## 12. 리스크 및 대응 전략 (v2.0)

| 리스크 | 영향도 | 대응 전략 |
|--------|--------|-----------|
| Claude API 비용 초과 | 높음 | 토큰 제한, 캐싱, Sonnet 우선 |
| 실시간 채팅 성능 | 중간 | Supabase Realtime 최적화, 메시지 페이지네이션 |
| Tiptap/Monaco 통합 복잡도 | 중간 | 최소 기능부터 구현, 에디터-AI 스트리밍 충돌 관리 |
| 2.5D 캐릭터 에셋 품질 | 중간 | 정호님 직접 준비, Midjourney 컨셉 → 디자이너 마감 |
| 스킬 .md 문서 품질 | 중간 | 프롬프트 튜닝으로 기록 품질 관리, 사용자 편집 허용 |
| 학습 루프 체감 속도 | 높음 | 수정 즉시 "학습 반영" 표시, 다음 작업에서 명시적 언급 |
| 사용자 러닝커브 | 높음 | 온보딩 마법사 강화, Slack 유사 UX로 학습 비용 최소화 |

---

## 13. 핵심 기술 의사결정 기록 (ADR v2.0)

### ADR-001 (v2.0): Phaser.js 제거 → Slack형 워크스페이스

- **결정:** Phaser.js 3 완전 제거. 도트형 오피스를 Slack형 워크스페이스(채널+채팅+아티팩트)로 전환
- **근거:** 번들 2.2MB→600KB, 정보 밀도 10배 향상, 핵심 인터랙션(채팅)에 집중, 멀티유저 확장 용이
- **대안 검토:** React Flow 캔버스 (Slack 방향으로 불필요해짐), Phaser 유지+축소 (근본 문제 해결 안됨)
- **트레이드오프:** 첫인상 바이럴 임팩트 감소 → 2.5D 일러스트 캐릭터로 보완

### ADR-002: 도트 스프라이트 → 2.5D 일러스트 캐릭터

- **결정:** 픽셀아트 스프라이트를 2.5D 일러스트레이션 캐릭터(표정 세트 6종)로 교체
- **근거:** 감정적 임팩트 유지+강화, 기술 복잡도 대폭 감소 (`<img>` 교체만으로 구현), 정보 밀도 향상
- **구현:** `expressionMap[agent.expression]`으로 이미지 교체. 애니메이션 불필요.
- **주의:** 캐릭터 비주얼 스타일을 초반에 확정 필수 (브랜드 아이덴티티 확립)

### ADR-003: 인라인 공동 편집 (Tiptap + Monaco)

- **결정:** ResultViewer(읽기 전용)를 Tiptap(문서)+Monaco(코드) 기반 인라인 편집으로 교체
- **근거:** 사용자 수정 → 에이전트 학습 → 다음 작업 반영의 학습 루프 구현. Claude Artifact 패턴 차용.
- **트레이드오프:** 리치 텍스트 에디터 통합 복잡도 증가 → npm 패키지 활용으로 해결

### ADR-004: 자기 기록 .md 스킬 파일 (CLAUDE.md 적용)

- **결정:** 에이전트에게 `update_skill_doc` Tool을 추가하여 자신의 학습 내용을 .md 파일로 직접 기록
- **근거:** CLAUDE.md 개념의 에이전트 적용. 벡터 메모리(블랙박스) + .md(투명한 레이어) 이중 구조
- **차별점:** 사용자가 에이전트의 지식을 직접 읽고 편집 가능 → 투명성 + 통제감 확보

### ADR-005: Vector DB + pgvector 유지 (v1.0 계승)

- **결정:** 자기 기록 .md 추가에도 불구하고 pgvector 기반 벡터 메모리 유지
- **근거:** .md는 사람이 읽는 레이어, pgvector는 빠른 의미 검색 레이어. 상호 보완적.

### ADR-006: Vercel Edge Functions + Supabase 유지 (v1.0 계승)

- **결정:** 백엔드/데이터 인프라는 v1.0과 동일하게 유지
- **근거:** 기술 스택 안정성, 비용 효율, SSE 지원, Realtime 활용 확대

---

## 14. MVP 기본 능력 카드 목록

v1.0과 동일합니다.

| 카드명 | 카테고리 | 설명 | Tool Use 함수 | 등급 |
|--------|---------|------|--------------|------|
| 보고서 작성 | writing | 주제에 맞는 보고서/문서 작성 | write_document, create_artifact | free |
| 웹 리서치 | analysis | 웹 검색 기반 조사 및 요약 | search_web | free |
| 데이터 분석 | analysis | 제공된 데이터 분석 및 인사이트 도출 | analyze_data | basic |
| 코드 생성 | coding | 프로그래밍 코드 생성 및 설명 | generate_code, create_artifact | basic |
| 기획서 작성 | writing | 사업 기획서/제안서 작성 | write_document, create_artifact | free |
| 브레인스토밍 | analysis | 아이디어 발산 및 구조화 | write_document | free |
| 번역 | communication | 다국어 번역 및 로컬라이제이션 | write_document | free |
| 경쟁사 분석 | analysis | 경쟁사 조사 및 비교 분석 | search_web, analyze_data | basic |

---

## 15. 개발용 Sub-Agent 구성안 (v2.0)

### 15.1 Sub-Agent 조직도 (v2.0 업데이트)

| Agent ID | Agent 역할 | v2.0 변경사항 |
|----------|-----------|-------------|
| SA-01 | PM Agent | 유지 (워크스페이스 구조로 문서 업데이트) |
| SA-02 | Frontend Agent | **대폭 변경**: Phaser.js → Slack형 UI, Tiptap/Monaco 통합 |
| SA-03 | Backend Agent | **확장**: channels/messages/artifacts/skill_docs API 추가 |
| SA-04 | AI Engine Agent | **확장**: update_skill_doc Tool, 학습 루프 구현 |
| SA-05 | QA Agent | 유지 |
| SA-06 | Biz Agent | 유지 |

### 15.2 SA-02 Frontend Agent (v2.0 변경)

| 항목 | v2.0 설정 |
|------|----------|
| System Prompt | "너는 React + Tailwind CSS 전문 프론트엔드 개발자이다. Slack형 워크스페이스 UI를 만든다. ~~Phaser.js는 사용하지 않는다.~~ Tiptap(문서 편집)과 Monaco(코드 편집)를 아티팩트 패널에 통합한다. Supabase Realtime으로 실시간 채팅을 구현한다." |
| Project Knowledge | v2.0 컴포넌트 트리, 화면 설계 (Slack형), Tiptap/Monaco 연동 가이드 |
| 활용 Skill | frontend-design, web-artifacts-builder |
| **제거됨** | ~~Phaser.js 씬 구성, 스프라이트 상태, 타일맵 설계~~ |

---

## 16. Skill 활용 방안 (v2.0)

| 개발 단계 | 활용 Skill | 활용 방법 | v2.0 변경 |
|-----------|-----------|-----------|----------|
| Week 1 | docx, xlsx | DB 스키마 문서화, 스프린트 계획 | 유지 |
| Week 2 | frontend-design | **Slack형 워크스페이스** UI 구현 | 변경 (오피스→워크스페이스) |
| Week 3 | frontend-design | 능력 카드 UI + **2.5D 캐릭터 통합** | 변경 |
| Week 4 | product-self-knowledge, skill-creator | Claude API + **Tiptap/Monaco 아티팩트** | 확장 |
| Week 5 | product-self-knowledge | pgvector + **스킬 .md 시스템** | 확장 |
| Week 6 | website-reviewer | UX 검수 | 유지 |

---

## 17. 개발 효율화 방안 (v2.0)

### v2.0 시간 절약 재산정

| 영역 | v1.0 예상 | v2.0 예상 | 변경 이유 |
|------|----------|----------|----------|
| Phaser.js 오피스 | 30시간 | **0시간** | 완전 제거 |
| **Slack형 채팅 UI** | - | **20시간** | 신규 (Supabase Realtime 활용) |
| **아티팩트 패널 (Tiptap+Monaco)** | - | **15시간** | 신규 (npm 패키지 활용) |
| **2.5D 캐릭터 시스템** | - | **5시간** | 이미지 교체 방식 (간단) |
| **스킬 .md 시스템** | - | **10시간** | 신규 (CRUD + Tool 연동) |
| API 개발 | 60시간 → 15시간 | **20시간** | 채널/메시지/아티팩트 API 추가 |
| UI 컴포넌트 | 40시간 → 15시간 | **18시간** | 컴포넌트 수 변경 |
| AI 엔진 | 25시간 → 12시간 | **15시간** | 학습 루프 + update_skill_doc |
| QA + 배포 | 15시간 → 5시간 | **5시간** | 유지 |
| **합계** | **76시간 (v1.0+Skill)** | **108시간** | 범위 확장에도 불구하고 Phaser 제거로 상쇄 |

### 품질 게이트 (v2.0)

| 게이트 | 시점 | 통과 기준 |
|--------|------|-----------|
| G1 | Week 1 종료 | 11개 테이블 생성, RLS 적용, Realtime 활성화, seed 데이터 |
| G2 | Week 2 종료 | 채널 사이드바 + 채팅 스레드 + 실시간 메시지 동기화 작동 |
| G3 | Week 3 종료 | 에이전트 생성, 2.5D 캐릭터 표정 전환, 능력 카드 부여 작동 |
| G4 | Week 4 종료 | 채팅으로 작업 지시 → Claude 실행 → 아티팩트 패널에 결과 표시 + 인라인 편집 |
| G5 | Week 5 종료 | 인라인 편집 → diff 저장 → 에이전트 스킬 .md 자동 기록 → 다음 작업 반영 확인 |
| G6 | Week 6 종료 | UX 검수 70점+, E2E 통과, Vercel 배포, 베타 URL 발급 |

---

## 18. 종합 실행 매트릭스 (v2.0)

| 주차 | 주력 Agent | Skill / MCP | 핵심 산출물 | 게이트 |
|------|-----------|-------------|------------|--------|
| W1 | SA-01 PM, SA-03 Backend | docx, xlsx, Notion | DB 11테이블, Auth, Realtime 설정 | G1 |
| W2 | SA-02 Frontend | frontend-design | **Slack형 워크스페이스** (채널+채팅+메시지 입력) | G2 |
| W3 | SA-02 Frontend, SA-03 Backend | frontend-design | **2.5D 캐릭터** 표정 전환, 능력 카드, 에이전트 프로필 | G3 |
| W4 | SA-04 AI Engine, SA-02 Frontend | product-self-knowledge | Claude API 연동, Glass-box, **Tiptap/Monaco 아티팩트** | G4 |
| W5 | SA-04 AI Engine, SA-03 Backend | skill-creator | pgvector, **스킬 .md 시스템**, **학습 루프** | G5 |
| W6 | SA-05 QA, SA-01 PM | website-reviewer, Slack | E2E 테스트, UX 검수, Vercel 배포 | G6 |

---

> **문서 끝 | Co-Mind Works MVP 설계서 v2.0 (Pivot 반영) | 2026.04.13**  
> **한 줄 요약: "게임처럼 생긴 AI 도구" → "AI 팀원이 성장하는 워크스페이스"**
