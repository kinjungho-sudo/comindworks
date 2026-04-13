import { createClient } from '@supabase/supabase-js'

// 서버 전용 — Service Role Key 사용 (RLS 우회)
export function createAdminClient() {
  return createClient(
    process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// 사용자 JWT로 인증된 클라이언트 생성
export function createUserClient(accessToken) {
  const client = createClient(
    process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY,
    {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    }
  )
  return client
}

/**
 * Authorization 헤더에서 Bearer 토큰 추출
 */
export function extractToken(req) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  return authHeader.slice(7)
}

/**
 * 요청 인증 검증 — 성공 시 { user, supabase } 반환
 */
export async function authenticate(req) {
  const token = extractToken(req)
  if (!token) {
    throw new Response(JSON.stringify({ error: '인증이 필요합니다.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const admin = createAdminClient()
  const { data: { user }, error } = await admin.auth.getUser(token)
  if (error || !user) {
    throw new Response(JSON.stringify({ error: '유효하지 않은 토큰입니다.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return { user, supabase: createUserClient(token) }
}

export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export function errorResponse(message, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
