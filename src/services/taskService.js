import { supabase } from '../lib/supabase'

export const taskService = {
  async createTask({ agentId, officeId, title, instruction }) {
    const { data, error } = await supabase
      .from('tasks')
      .insert({ agent_id: agentId, office_id: officeId, title, instruction })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async getTask(id) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async getTasks({ agentId, officeId, limit = 20 }) {
    let query = supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (agentId) query = query.eq('agent_id', agentId)
    if (officeId) query = query.eq('office_id', officeId)

    const { data, error } = await query
    if (error) throw error
    return data
  },

  /**
   * SSE 스트리밍 시작 — EventSource 반환
   * 호출자가 직접 이벤트 핸들러 등록
   */
  streamTask(taskId) {
    const url = `/api/tasks/${taskId}/stream`
    return new EventSource(url)
  },

  async submitFeedback(taskId, { rating, comment }) {
    const { data, error } = await supabase
      .from('tasks')
      .update({ feedback: { rating, comment, submitted_at: new Date().toISOString() } })
      .eq('id', taskId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async approveTask(taskId) {
    const response = await fetch(`/api/tasks/${taskId}/approve`, { method: 'POST' })
    if (!response.ok) throw new Error('승인 실패')
    return response.json()
  },

  async rejectTask(taskId, { reason, modification }) {
    const response = await fetch(`/api/tasks/${taskId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, modification }),
    })
    if (!response.ok) throw new Error('거부 실패')
    return response.json()
  },
}
