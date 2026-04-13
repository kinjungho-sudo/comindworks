import { authenticate, jsonResponse, errorResponse } from '../_lib/supabase-admin.js'

export default async function handler(req) {
  try {
    const { user, supabase } = await authenticate(req)

    // GET: 오피스 목록 조회
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('offices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
      if (error) return errorResponse(error.message)
      return jsonResponse({ offices: data })
    }

    // POST: 새 오피스 생성
    if (req.method === 'POST') {
      const { name, theme } = await req.json()
      if (!name) return errorResponse('name 필드가 필요합니다.')

      const { data, error } = await supabase
        .from('offices')
        .insert({ user_id: user.id, name, theme: theme ?? 'default' })
        .select()
        .single()
      if (error) return errorResponse(error.message)
      return jsonResponse({ office: data }, 201)
    }

    return errorResponse('Method Not Allowed', 405)
  } catch (res) {
    return res
  }
}
