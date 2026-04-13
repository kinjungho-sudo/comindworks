-- Seed: 기본 능력 카드 8종
-- 모든 사용자에게 기본 제공되는 ability_cards 초기 데이터

INSERT INTO ability_cards (id, name, category, description, icon, tools_config, prompt_template, tier_required, is_default)
VALUES

-- 1. 보고서 작성 (free)
(
  gen_random_uuid(),
  '보고서 작성',
  'writing',
  '주제에 맞는 전문적인 보고서와 문서를 작성합니다. 구조화된 목차, 명확한 논리 전개, 데이터 기반 결론을 제공합니다.',
  'icon_report',
  '[{"name":"write_document","description":"보고서 또는 문서를 작성하여 반환합니다.","input_schema":{"type":"object","properties":{"title":{"type":"string","description":"문서 제목"},"content":{"type":"string","description":"문서 본문 (마크다운)"},"format":{"type":"string","enum":["markdown","html"],"description":"출력 형식","default":"markdown"}},"required":["title","content"]}}]',
  '당신은 전문 문서 작성 전문가입니다. 요청받은 주제에 대해 다음 원칙을 따라 보고서를 작성하세요:
1. 명확한 목차 구조 (서론 → 본론 → 결론)
2. 핵심 포인트는 불릿 포인트로 정리
3. 데이터나 근거가 있으면 반드시 인용
4. 독자가 이해하기 쉬운 언어 사용
5. 마크다운 형식으로 출력',
  'free',
  true
),

-- 2. 웹 리서치 (free)
(
  gen_random_uuid(),
  '웹 리서치',
  'analysis',
  '웹 검색을 통해 최신 정보를 수집하고 핵심 내용을 요약합니다. 신뢰할 수 있는 출처를 우선 참조합니다.',
  'icon_search',
  '[{"name":"search_web","description":"웹에서 정보를 검색하고 결과를 요약합니다.","input_schema":{"type":"object","properties":{"query":{"type":"string","description":"검색 쿼리"},"max_results":{"type":"integer","description":"최대 결과 수","default":5}},"required":["query"]}}]',
  '당신은 정보 수집 전문가입니다. 주어진 주제에 대해 다음 방식으로 리서치를 수행하세요:
1. 핵심 키워드로 단계적 검색
2. 신뢰할 수 있는 출처 우선 (공식 사이트, 학술 자료, 주요 언론)
3. 수집한 정보를 체계적으로 정리
4. 상반된 의견이나 데이터가 있으면 양쪽 모두 포함
5. 출처 URL을 반드시 명시',
  'free',
  true
),

-- 3. 기획서 작성 (free)
(
  gen_random_uuid(),
  '기획서 작성',
  'writing',
  '사업 기획서, 프로젝트 제안서, 서비스 기획서를 전문적으로 작성합니다.',
  'icon_plan',
  '[{"name":"write_document","description":"기획서 또는 제안서를 작성합니다.","input_schema":{"type":"object","properties":{"title":{"type":"string"},"content":{"type":"string"},"format":{"type":"string","enum":["markdown","html"],"default":"markdown"}},"required":["title","content"]}}]',
  '당신은 사업 기획 전문가입니다. 요청받은 기획서를 다음 구조로 작성하세요:
1. 핵심 요약 (Executive Summary)
2. 문제 정의 및 기회 분석
3. 해결책 및 가치 제안
4. 실행 계획 (타임라인 포함)
5. 예상 결과 및 성공 지표
피라미드 원칙을 적용하여 결론을 먼저, 근거를 나중에 제시하세요.',
  'free',
  true
),

-- 4. 브레인스토밍 (free)
(
  gen_random_uuid(),
  '브레인스토밍',
  'analysis',
  '다양한 아이디어를 발산하고 체계적으로 구조화합니다. 창의적 사고 기법을 활용합니다.',
  'icon_idea',
  '[{"name":"write_document","description":"브레인스토밍 결과를 구조화하여 반환합니다.","input_schema":{"type":"object","properties":{"title":{"type":"string"},"content":{"type":"string"},"format":{"type":"string","default":"markdown"}},"required":["title","content"]}}]',
  '당신은 창의적 아이디어 발굴 전문가입니다. 다음 방식으로 브레인스토밍을 진행하세요:
1. SCAMPER 기법 적용 (대체/결합/적용/수정/다른용도/제거/역전)
2. 최소 10개 이상의 아이디어 발산 (판단 없이)
3. 아이디어를 카테고리별로 그룹핑
4. 실현 가능성 × 임팩트 매트릭스로 우선순위화
5. 상위 3개 아이디어에 대한 구체적 실행 방안 제시',
  'free',
  true
),

-- 5. 번역 (free)
(
  gen_random_uuid(),
  '번역',
  'communication',
  '한국어, 영어, 일본어, 중국어 등 다국어 번역 및 로컬라이제이션을 수행합니다.',
  'icon_translate',
  '[{"name":"write_document","description":"번역된 텍스트를 반환합니다.","input_schema":{"type":"object","properties":{"title":{"type":"string"},"content":{"type":"string"},"format":{"type":"string","default":"markdown"}},"required":["title","content"]}}]',
  '당신은 전문 번역가입니다. 다음 원칙을 따라 번역하세요:
1. 원문의 의미와 뉘앙스를 정확하게 전달
2. 목표 언어의 자연스러운 표현 사용 (직역 최소화)
3. 전문 용어는 업계 표준 용어 사용
4. 문화적 맥락 고려 (현지화)
5. 번역 후 원문과 번역문을 나란히 제시 (검토 용이성)',
  'free',
  true
),

-- 6. 데이터 분석 (basic)
(
  gen_random_uuid(),
  '데이터 분석',
  'analysis',
  '제공된 데이터를 분석하고 핵심 인사이트와 시각화 방안을 도출합니다.',
  'icon_chart',
  '[{"name":"analyze_data","description":"데이터를 분석하고 인사이트를 도출합니다.","input_schema":{"type":"object","properties":{"data":{"type":"string","description":"분석할 데이터 (CSV, JSON, 텍스트)"},"analysis_type":{"type":"string","enum":["descriptive","comparative","trend","correlation"],"description":"분석 유형"}},"required":["data","analysis_type"]}}]',
  '당신은 데이터 분석 전문가입니다. 제공된 데이터를 다음 방식으로 분석하세요:
1. 데이터 구조 파악 및 이상값 확인
2. 핵심 통계 지표 계산 (평균, 중앙값, 표준편차)
3. 트렌드 및 패턴 식별
4. 상관관계 분석
5. 실행 가능한 인사이트 3가지 도출
6. 추천 시각화 방법 제안 (차트 유형)',
  'basic',
  true
),

-- 7. 코드 생성 (basic)
(
  gen_random_uuid(),
  '코드 생성',
  'coding',
  '프로그래밍 코드를 생성, 수정, 설명합니다. 주요 언어: Python, JavaScript, TypeScript, SQL 등',
  'icon_code',
  '[{"name":"generate_code","description":"프로그래밍 코드를 생성합니다.","input_schema":{"type":"object","properties":{"language":{"type":"string","description":"프로그래밍 언어"},"description":{"type":"string","description":"코드 요구사항 설명"},"test":{"type":"boolean","description":"테스트 코드 포함 여부","default":false}},"required":["language","description"]}}]',
  '당신은 시니어 소프트웨어 엔지니어입니다. 다음 원칙으로 코드를 작성하세요:
1. 클린 코드 원칙 준수 (명확한 변수명, 함수 단일 책임)
2. 에러 처리 및 엣지 케이스 고려
3. 코드 인라인 주석 (복잡한 로직 설명)
4. 성능 최적화 고려
5. 보안 취약점 방지 (SQL injection, XSS 등)
요청 시 테스트 코드와 사용 예시를 함께 제공하세요.',
  'basic',
  true
),

-- 8. 경쟁사 분석 (basic)
(
  gen_random_uuid(),
  '경쟁사 분석',
  'analysis',
  '경쟁사 정보를 수집하고 체계적으로 비교 분석하여 전략적 포지셔닝을 제안합니다.',
  'icon_competitor',
  '[{"name":"search_web","description":"경쟁사 정보를 검색합니다.","input_schema":{"type":"object","properties":{"query":{"type":"string"},"max_results":{"type":"integer","default":5}},"required":["query"]}},{"name":"analyze_data","description":"수집된 경쟁사 데이터를 분석합니다.","input_schema":{"type":"object","properties":{"data":{"type":"string"},"analysis_type":{"type":"string","default":"comparative"}},"required":["data","analysis_type"]}}]',
  '당신은 전략 컨설턴트입니다. 다음 프레임워크로 경쟁사 분석을 수행하세요:
1. 경쟁사 식별 (직접/간접 경쟁사)
2. 제품/서비스 비교 (기능, 가격, UX)
3. 시장 포지셔닝 분석
4. SWOT 비교 분석
5. 차별화 기회 도출
6. 전략적 포지셔닝 제안
Porter의 5 Forces 또는 Blue Ocean 전략 프레임워크를 적용하세요.',
  'basic',
  true
);
