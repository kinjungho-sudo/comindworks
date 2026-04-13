import { authenticate, jsonResponse, errorResponse } from '../_lib/supabase-admin.js'

export default async function handler(req) {
  try {
    const { supabase } = await authenticate(req)
    const url = new URL(req.url)
    const officeId = url.searchParams.get('office_id')

    // GET: 에이전트 목록
    if (req.method === 'GET') {
      if (!officeId) return errorResponse('office_id 파라미터가 필요합니다.')

      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('office_id', officeId)
        .order('created_at', { ascending: true })
      if (error) return errorResponse(error.message)
      return jsonResponse({ agents: data })
    }

    // POST: 에이전트 생성
    if (req.method === 'POST') {
      const { office_id, name, role, system_prompt, avatar_sprite, position_x, position_y } = await req.json()
      if (!office_id || !name || !role || !system_prompt) {
        return errorResponse('office_id, name, role, system_prompt 필드가 필요합니다.')
      }

      const { data, error } = await supabase
        .from('agents')
        .insert({
          office_id,
          name,
          role,
          system_prompt,
          avatar_sprite: avatar_sprite ?? 'agent_default',
          position_x: position_x ?? 5,
          position_y: position_y ?? 5,
        })
        .select()
        .single()
      if (error) return errorResponse(error.message)
      return jsonResponse({ agent: data }, 201)
    }

    return errorResponse('Method Not Allowed', 405)
  } catch (res) {
    return res
  }
}
