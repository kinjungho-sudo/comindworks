import { authenticate, jsonResponse, errorResponse } from '../_lib/supabase-admin.js'

export default async function handler(req) {
  try {
    const { supabase } = await authenticate(req)
    const urlPath = req.url.split('/tasks/')[1] ?? ''
    const segments = urlPath.split('/')
    const id = segments[0]

    // GET /api/tasks/:id — 작업 상세
    if (req.method === 'GET' && segments.length === 1) {
      const { data, error } = await supabase.from('tasks').select('*').eq('id', id).single()
      if (error) return errorResponse('작업을 찾을 수 없습니다.', 404)
      return jsonResponse({ task: data })
    }

    // POST /api/tasks/:id/feedback — 피드백 제출
    if (req.method === 'POST' && segments[1] === 'feedback') {
      const { rating, comment } = await req.json()
      if (!rating || rating < 1 || rating > 5) return errorResponse('rating은 1~5 사이 정수여야 합니다.')

      const { data, error } = await supabase
        .from('tasks')
        .update({ feedback: { rating, comment, submitted_at: new Date().toISOString() } })
        .eq('id', id)
        .select()
        .single()
      if (error) return errorResponse(error.message)
      return jsonResponse({ task: data })
    }

    // POST /api/tasks/:id/approve — HITL 승인
    if (req.method === 'POST' && segments[1] === 'approve') {
      const { data, error } = await supabase
        .from('tasks')
        .update({ status: 'in_progress' })
        .eq('id', id)
        .select()
        .single()
      if (error) return errorResponse(error.message)
      return jsonResponse({ task: data, approved: true })
    }

    // POST /api/tasks/:id/reject — HITL 거부
    if (req.method === 'POST' && segments[1] === 'reject') {
      const { reason, modification } = await req.json()
      const { data, error } = await supabase
        .from('tasks')
        .update({ status: 'review', result: { rejected: true, reason, modification } })
        .eq('id', id)
        .select()
        .single()
      if (error) return errorResponse(error.message)
      return jsonResponse({ task: data, approved: false })
    }

    return errorResponse('Not Found', 404)
  } catch (res) {
    return res
  }
}
