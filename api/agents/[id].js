import { authenticate, jsonResponse, errorResponse } from '../_lib/supabase-admin.js'

export default async function handler(req) {
  try {
    const { supabase } = await authenticate(req)
    const urlPath = req.url.split('/agents/')[1] ?? ''
    const segments = urlPath.split('/')
    const id = segments[0]

    // POST /api/agents/:id/abilities — 능력 카드 부여
    if (req.method === 'POST' && segments[1] === 'abilities') {
      const { ability_id } = await req.json()
      if (!ability_id) return errorResponse('ability_id 필드가 필요합니다.')

      const { data: agent } = await supabase.from('agents').select('abilities').eq('id', id).single()
      if (!agent) return errorResponse('에이전트를 찾을 수 없습니다.', 404)

      const { data: card } = await supabase.from('ability_cards').select('id,name,category').eq('id', ability_id).single()
      if (!card) return errorResponse('능력 카드를 찾을 수 없습니다.', 404)

      const already = (agent.abilities ?? []).some((a) => a.ability_id === ability_id)
      if (already) return errorResponse('이미 부여된 능력 카드입니다.', 409)

      const newAbility = { ability_id: card.id, name: card.name, category: card.category, assigned_at: new Date().toISOString() }
      const abilities = [...(agent.abilities ?? []), newAbility]

      const { data, error } = await supabase.from('agents').update({ abilities }).eq('id', id).select().single()
      if (error) return errorResponse(error.message)
      return jsonResponse({ agent: data })
    }

    // DELETE /api/agents/:id/abilities/:abilityId — 능력 카드 제거
    if (req.method === 'DELETE' && segments[1] === 'abilities' && segments[2]) {
      const abilityId = segments[2]
      const { data: agent } = await supabase.from('agents').select('abilities').eq('id', id).single()
      if (!agent) return errorResponse('에이전트를 찾을 수 없습니다.', 404)

      const abilities = (agent.abilities ?? []).filter((a) => a.ability_id !== abilityId)
      const { data, error } = await supabase.from('agents').update({ abilities }).eq('id', id).select().single()
      if (error) return errorResponse(error.message)
      return jsonResponse({ agent: data })
    }

    // GET /api/agents/:id — 에이전트 상세
    if (req.method === 'GET') {
      const { data: agent, error } = await supabase.from('agents').select('*').eq('id', id).single()
      if (error) return errorResponse('에이전트를 찾을 수 없습니다.', 404)

      const { data: recentTasks } = await supabase
        .from('tasks')
        .select('id,title,status,created_at')
        .eq('agent_id', id)
        .order('created_at', { ascending: false })
        .limit(10)

      const { count: memoryCount } = await supabase
        .from('agent_memories')
        .select('id', { count: 'exact', head: true })
        .eq('agent_id', id)

      return jsonResponse({ agent, recent_tasks: recentTasks ?? [], memory_count: memoryCount ?? 0 })
    }

    // PATCH /api/agents/:id — 에이전트 수정
    if (req.method === 'PATCH') {
      const body = await req.json()
      const allowed = ['name', 'role', 'system_prompt', 'position_x', 'position_y', 'personality', 'avatar_sprite']
      const updates = Object.fromEntries(
        Object.entries(body).filter(([k]) => allowed.includes(k))
      )
      if (Object.keys(updates).length === 0) return errorResponse('수정할 필드가 없습니다.')

      const { data, error } = await supabase.from('agents').update(updates).eq('id', id).select().single()
      if (error) return errorResponse(error.message)
      return jsonResponse({ agent: data })
    }

    // DELETE /api/agents/:id — 에이전트 삭제
    if (req.method === 'DELETE') {
      const { error } = await supabase.from('agents').delete().eq('id', id)
      if (error) return errorResponse(error.message)
      return jsonResponse({ success: true })
    }

    return errorResponse('Method Not Allowed', 405)
  } catch (res) {
    return res
  }
}
