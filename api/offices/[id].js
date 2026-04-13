import { authenticate, jsonResponse, errorResponse } from '../_lib/supabase-admin.js'

export default async function handler(req) {
  try {
    const { supabase } = await authenticate(req)
    const id = req.url.split('/offices/')[1]?.split('?')[0]?.split('/')[0]

    // GET: 오피스 상세 (에이전트 포함)
    if (req.method === 'GET') {
      const { data: office, error } = await supabase
        .from('offices')
        .select('*')
        .eq('id', id)
        .single()
      if (error) return errorResponse('오피스를 찾을 수 없습니다.', 404)

      const { data: agents } = await supabase
        .from('agents')
        .select('*')
        .eq('office_id', id)
        .order('created_at', { ascending: true })

      return jsonResponse({ office, agents: agents ?? [] })
    }

    // PATCH: 오피스 수정 (name, theme, layout_config)
    if (req.method === 'PATCH') {
      const body = await req.json()
      const allowed = ['name', 'theme', 'layout_config']
      const updates = Object.fromEntries(
        Object.entries(body).filter(([k]) => allowed.includes(k))
      )
      if (Object.keys(updates).length === 0) return errorResponse('수정할 필드가 없습니다.')

      const { data, error } = await supabase
        .from('offices')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) return errorResponse(error.message)
      return jsonResponse({ office: data })
    }

    return errorResponse('Method Not Allowed', 405)
  } catch (res) {
    return res
  }
}
