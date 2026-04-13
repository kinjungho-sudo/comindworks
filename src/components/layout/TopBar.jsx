import { useState } from 'react'
import { useOfficeStore } from '../../stores/useOfficeStore'
import { useAuthStore } from '../../stores/useAuthStore'
import { authService } from '../../services/authService'
import CreateAgentModal from '../agents/CreateAgentModal'

export default function TopBar() {
  const { currentOffice } = useOfficeStore()
  const { user } = useAuthStore()
  const [showCreateAgent, setShowCreateAgent] = useState(false)

  const handleSignOut = async () => {
    await authService.signOut()
  }

  return (
    <>
      <header className="h-16 panel border-b border-surface-700 flex items-center justify-between px-4 flex-shrink-0 z-10">
        {/* 로고 + 오피스명 */}
        <div className="flex items-center gap-3">
          <div className="text-brand-400 font-extrabold text-sm tracking-wider">
            CO-MIND WORKS
          </div>
          {currentOffice && (
            <>
              <span className="text-white/20">|</span>
              <span className="text-white/60 text-sm">{currentOffice.name}</span>
            </>
          )}
        </div>

        {/* 우측 액션 */}
        <div className="flex items-center gap-2">
          {currentOffice && (
            <button
              onClick={() => setShowCreateAgent(true)}
              className="btn-primary text-xs h-8 px-3"
            >
              + 에이전트 고용
            </button>
          )}
          <div className="text-white/30 text-xs hidden sm:block">{user?.email}</div>
          <button
            onClick={handleSignOut}
            className="btn-ghost text-xs"
          >
            로그아웃
          </button>
        </div>
      </header>

      {showCreateAgent && (
        <CreateAgentModal onClose={() => setShowCreateAgent(false)} />
      )}
    </>
  )
}
