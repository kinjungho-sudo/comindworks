/**
 * 텍스트 임베딩 생성
 * - OPENAI_API_KEY 있으면: OpenAI text-embedding-ada-002 (1536차원)
 * - 없으면: null 반환 → 호출자가 텍스트 검색 fallback 사용
 */
export async function getEmbedding(text) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null

  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-ada-002',
      input: text.slice(0, 8000), // ada-002 토큰 제한
    }),
  })

  if (!res.ok) {
    console.warn('[embeddings] OpenAI API 오류:', await res.text())
    return null
  }

  const data = await res.json()
  return data.data[0].embedding // number[]
}

/**
 * 에이전트 메모리 검색
 * - 임베딩 있으면 pgvector 코사인 유사도 검색
 * - 없으면 PostgreSQL 전문 텍스트 검색 (ilike) fallback
 */
export async function searchMemories({ supabase, agentId, query, limit = 5 }) {
  const embedding = await getEmbedding(query)

  if (embedding) {
    const { data, error } = await supabase.rpc('match_memories', {
      query_embedding: embedding,
      match_agent_id: agentId,
      match_threshold: 0.65,
      match_count: limit,
    })
    if (!error && data?.length > 0) return data
  }

  // fallback: 최근 N개 + 키워드 필터
  const keywords = query.split(/\s+/).filter(Boolean).slice(0, 3)
  let q = supabase
    .from('agent_memories')
    .select('id, content, metadata, memory_type')
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (keywords.length > 0) {
    q = q.ilike('content', `%${keywords[0]}%`)
  }

  const { data } = await q
  return data ?? []
}
