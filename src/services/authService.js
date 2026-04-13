import { supabase } from '../lib/supabase'

export const authService = {
  async signUp(email, password, displayName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: displayName } },
    })
    if (error) throw error
    // Supabase 이메일 확인이 꺼져 있으면 session 즉시 반환 → 바로 로그인
    // 켜져 있으면 session = null
    return data
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },

  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) throw error
    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getMe() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },
}
