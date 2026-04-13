import { authenticate, jsonResponse, errorResponse } from '../_lib/supabase-admin.js'

export default async function handler(req) {
  if (req.method !== 'GET') return errorResponse('Method Not Allowed', 405)

  try {
    const { user, supabase } = await authenticate(req)
    const url = new URL(req.url)
    const tier = url.searchParams.get('tier') // free | basic | pro

    // 사용자 구독 등급 조회
    const { data: userProfile } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    const userTier = userProfile?.subscription_tier ?? 'free'
    const allowedTiers = userTier === 'free'
      ? ['free']
      : userTier === 'basic'
      ? ['free', 'basic']
      : ['free', 'basic', 'pro']

    const { data, error } = await supabase
      .from('ability_cards')
      .select('*')
      .in('tier_required', allowedTiers)
      .order('category', { ascending: true })

    if (error) return errorResponse(error.message)
    return jsonResponse({ abilities: data })
  } catch (res) {
    return res
  }
}
