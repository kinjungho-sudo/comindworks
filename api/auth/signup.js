import { createAdminClient, jsonResponse, errorResponse } from '../_lib/supabase-admin.js'

export default async function handler(req) {
  if (req.method !== 'POST') return errorResponse('Method Not Allowed', 405)

  try {
    const { email, password, displayName } = await req.json()

    if (!email || !password) return errorResponse('이메일과 비밀번호를 입력하세요.', 400)
    if (password.length < 6) return errorResponse('비밀번호는 6자 이상이어야 합니다.', 400)

    const admin = createAdminClient()

    // email_confirm: true → 이메일 인증 없이 즉시 활성화
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: displayName ?? '' },
    })

    if (error) {
      if (error.message?.includes('already')) {
        return errorResponse('이미 사용 중인 이메일입니다.', 409)
      }
      return errorResponse(error.message, 400)
    }

    return jsonResponse({ user: data.user }, 201)
  } catch (err) {
    return errorResponse(err.message, 500)
  }
}
