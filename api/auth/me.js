import { authenticate, jsonResponse, errorResponse } from '../_lib/supabase-admin.js'

export default async function handler(req) {
  if (req.method !== 'GET') return errorResponse('Method Not Allowed', 405)

  try {
    const { user, supabase } = await authenticate(req)

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    return jsonResponse({ user: { ...user, profile } })
  } catch (res) {
    return res
  }
}
