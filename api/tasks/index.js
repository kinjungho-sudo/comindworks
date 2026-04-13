import { authenticate, jsonResponse, errorResponse } from '../_lib/supabase-admin.js'

export default async function handler(req) {
  try {
    const { supabase } = await authenticate(req)
    const url = new URL(req.url)

    // GET: 작업 목록
    if (req.method === 'GET') {
      const agentId = url.searchParams.get('agent_id')
      const officeId = url.searchParams.get('office_id')
      const limit = parseInt(url.searchParams.get('limit') ?? '20')

      let query = supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (agentId) query = query.eq('agent_id', agentId)
      if (officeId) query = query.eq('office_id', officeId)

      const { data, error } = await query
      if (error) return errorResponse(error.message)
      return jsonResponse({ tasks: data, total: data.length })
    }

    // POST: 작업 생성 및 실행 시작
    if (req.method === 'POST') {
      const { agent_id, title, instruction } = await req.json()
      if (!agent_id || !instruction) {
        return errorResponse('agent_id, instruction 필드가 필요합니다.')
      }

      // 에이전트 조회 (office_id 확인용)
      const { data: agent, error: agentError } = await supabase
        .from('agents')
        .select('*, offices!inner(id)')
        .eq('id', agent_id)
        .single()
      if (agentError) return errorResponse('에이전트를 찾을 수 없습니다.', 404)

      // 작업 레코드 생성
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .insert({
          agent_id,
          office_id: agent.office_id,
          title: title ?? instruction.slice(0, 100),
          instruction,
          status: 'pending',
        })
        .select()
        .single()
      if (taskError) return errorResponse(taskError.message)

      // 에이전트 상태를 working으로 업데이트
      await supabase
        .from('agents')
        .update({ status: 'thinking' })
        .eq('id', agent_id)

      return jsonResponse({ task }, 201)
    }

    return errorResponse('Method Not Allowed', 405)
  } catch (res) {
    return res
  }
}
