import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import WorkspaceLayout from './components/layout/WorkspaceLayout'
import AuthPage from './components/auth/AuthPage'
import { useAuthStore } from './stores/useAuthStore'

export default function App() {
  const { user, setUser, setSession } = useAuthStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 현재 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // 인증 상태 변경 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [setUser, setSession])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-surface-900">
        <div className="text-white/40 text-sm animate-pulse">코마인드웍스 로딩 중...</div>
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  // 온보딩 체크는 MainLayout 내부에서 처리
  return <WorkspaceLayout />
}
