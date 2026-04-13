# Co-Mind Works — MVP 개발 계획서

## 목표
- **한 줄 요약:** 도트형 가상 오피스에서 AI 에이전트를 게임처럼 배치하고 업무를 위임하는 플랫폼 MVP
- **핵심 문제:** 1인 창업가/지식 노동자의 AI 에이전트 활용 장벽 (복잡한 설정, 블랙박스 실행)
- **성공 기준:** 베타 테스터 50명 / 에이전트 생성 완료율 70% / WAU 40% / NPS 30+

---

## 기술 스택

| 영역 | 선택 | 이유 |
|------|------|------|
| Frontend | React 18 + Vite | 성숙한 생태계, Phaser.js 연동 용이 |
| Game Engine | Phaser.js 3 (pixelArt: true) | 타일맵 내장, 도트 최적화, 경량 |
| State | Zustand + React Query | 보일러플레이트 최소, 비동기 캐싱 |
| Styling | Tailwind CSS + Framer Motion | 유틸리티 우선 + 애니메이션 |
| Backend | Vercel Edge Functions (Node.js) | SSE 지원, 자동 스케일링, 콜드스타트 없음 |
| DB | Supabase (PostgreSQL 15+ + pgvector) | Auth/Realtime/Storage/벡터 통합 |
| AI | Claude API (claude-sonnet-4-20250514) | Tool Use 우수, Streaming, 한국어 최고 |
| Auth | Supabase Auth (Google/GitHub OAuth) | JWT 기반, 무료 티어 |
| Hosting | Vercel | GitHub 자동 배포, 프리뷰 URL |

---

## MVP 기능 목록

### Must Have (Week 1~6)
1. Supabase Auth 연동 (이메일 + Google OAuth)
2. 도트형 가상 오피스 UI (Phaser.js 타일맵 20×15)
3. AI 에이전트 생성/배치/관리
4. 능력 카드 드래그 앤 드롭으로 에이전트에 부여
5. Claude API 기반 에이전트 작업 실행
6. Glass-box 사고 과정 실시간 SSE 스트리밍
7. pgvector 기반 에이전트 메모리 (Persistent Memory)
8. Human-in-the-loop 승인/거부 체크포인트
9. 작업 결과물 뷰어 + 피드백 수집

### Nice to Have (Post-MVP)
1. 외부 툴 연동 (Slack, Gmail)
2. C2C 마켓플레이스
3. 커스텀 아바타/스킨
4. 과금 시스템 (구독/사용량)

---

## 파일 구조

```
co-mind-works/
├── PLAN.md
├── CLAUDE.md
├── .claude/
│   └── agents/               ← sub-agent 설정 (SA-01~SA-06)
├── public/
│   ├── assets/sprites/       ← 에이전트 도트 스프라이트
│   ├── assets/tiles/         ← 오피스 타일셋
│   ├── assets/ui/            ← UI 아이콘
│   └── tilemaps/             ← Phaser 타일맵 JSON
├── src/
│   ├── components/
│   │   ├── layout/           ← TopBar, LeftPanel, RightPanel, CommandBar
│   │   ├── office/           ← OfficeCanvas, AgentSprite, DropZone
│   │   ├── agents/           ← AgentList, AgentDetail, AbilitySlots
│   │   ├── tasks/            ← TaskTimeline, ThinkingStream, ResultViewer
│   │   ├── abilities/        ← AbilityCardInventory, AbilityCard
│   │   └── common/           ← Button, Modal, Badge, Loading
│   ├── scenes/               ← Phaser: BootScene, OfficeScene, UIScene
│   ├── stores/               ← Zustand 스토어 5종
│   ├── hooks/                ← useAgent, useTask, useStream, useDragDrop
│   ├── services/             ← API 호출 레이어
│   ├── lib/                  ← supabase.js, claude.js, utils.js
│   └── App.jsx
├── api/                      ← Vercel Edge Functions
│   ├── auth/
│   ├── offices/
│   ├── agents/
│   ├── tasks/
│   ├── abilities/
│   └── memories/
├── supabase/
│   ├── migrations/           ← 001~007 SQL
│   └── seed.sql
└── docs/                     ← agent-log.md 산출물
```

---

## 6주 개발 로드맵

| 주차 | 목표 | 주력 Agent | 품질 게이트 |
|------|------|-----------|------------|
| W1 | 프로젝트 셋업 + DB 설계 | SA-01 PM, SA-03 Backend | G1: DB 스키마 + Auth |
| W2 | Phaser.js 오피스 + 에이전트 렌더링 | SA-02 Frontend | G2: UI 프로토타입 |
| W3 | 능력 카드 + 드래그 앤 드롭 | SA-02 Frontend, SA-03 Backend | - |
| W4 | Claude API 연동 + Glass-box | SA-04 AI Engine, SA-03 Backend | G3: 핵심 루프 |
| W5 | Vector DB + 메모리 시스템 | SA-04 AI Engine, SA-03 Backend | G4: 메모리 검증 |
| W6 | 통합 테스트 + 배포 | SA-05 QA, SA-01 PM | G5: 배포 완료 |

---

## 현재 스프린트 (W1)

### 목표
- Supabase 테이블 6개 생성 + RLS 설정
- Auth 연동 (이메일 + Google OAuth)
- 프로젝트 스캐폴딩 (Vite + React + Tailwind)
- seed.sql로 기본 능력 카드 8종 삽입

### 완료 기준 (G1)
- [ ] 모든 테이블 생성 완료
- [ ] RLS 정책 적용 완료
- [ ] seed 데이터 삽입 성공
- [ ] 관계 무결성 확인
- [ ] npm run dev 정상 실행

---

## 작업 배분

| Agent | 담당 영역 |
|-------|----------|
| SA-01 PM | 스프린트 계획, 진행 추적, 의사결정 기록 |
| SA-02 Frontend | React + Phaser.js UI 구현 |
| SA-03 Backend | Edge Functions + Supabase API |
| SA-04 AI Engine | Claude API 연동 + 프롬프트 엔지니어링 |
| SA-05 QA | UX 검수 + 테스트 |
| SA-06 Biz | 사업계획서 + 피칭 |
