import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useOfficeStore } from '../../stores/useOfficeStore'
import { useAgentStore } from '../../stores/useAgentStore'
import { officeService } from '../../services/officeService'
import { agentService } from '../../services/agentService'
import { taskService } from '../../services/taskService'
import { useRealtimeSync } from '../../hooks/useRealtimeSync'
import { useAuthStore } from '../../stores/useAuthStore'
import { authService } from '../../services/authService'
import { supabase } from '../../lib/supabase'
import OnboardingWizard from '../onboarding/OnboardingWizard'
import ChannelSidebar from './ChannelSidebar'
import MessageThread from './MessageThread'
import MessageInput from './MessageInput'
import ArtifactPanel from './ArtifactPanel'

export default function WorkspaceLayout() {
  const { currentOffice, setOffices, setCurrentOffice } = useOfficeStore()
  const { setAgents } = useAgentStore()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const initializedRef = useRef(false)

  // 아티팩트 패널 상태
  const [artifactTask, setArtifactTask] = useState(null)

  // 오피스 로드
  const { data: officesData } = useQuery({
    queryKey: ['offices'],
    queryFn: officeService.getOffices,
  })

  useEffect(() => {
    if (!officesData) return
    setOffices(officesData)
    // 최초 1회만 currentOffice 초기화
    if (!initializedRef.current && officesData.length > 0) {
      setCurrentOffice(officesData[0])
      initializedRef.current = true
    }
  }, [officesData, setOffices, setCurrentOffice])

  // 에이전트 로드
  const { data: agentsData } = useQuery({
    queryKey: ['agents', currentOffice?.id],
    queryFn: () => agentService.getAgents(currentOffice.id),
    enabled: !!currentOffice?.id,
  })

  useEffect(() => {
    if (agentsData) setAgents(agentsData)
  }, [agentsData, setAgents])

  // Supabase Realtime
  useRealtimeSync(currentOffice?.id)

  // 피드백 제출
  const handleFeedback = async ({ rating, comment }) => {
    if (!artifactTask) return
    await taskService.submitFeedback(artifactTask.id, { rating, comment })
    if (comment.trim() && artifactTask.agent_id) {
      const ratingLabel = ['', '매우 나쁨', '나쁨', '보통', '좋음', '매우 좋음'][rating] ?? ''
      await supabase.from('agent_memories').insert({
        agent_id: artifactTask.agent_id,
        content: `작업 "${artifactTask.title}"에 대한 사용자 피드백 (${ratingLabel}): ${comment.trim()}`,
        embedding: Array(1536).fill(0),
        memory_type: 'user_feedback',
        metadata: { task_id: artifactTask.id, rating, saved_at: new Date().toISOString() },
      })
    }
  }

  // 온보딩
  if (officesData && officesData.length === 0) {
    return <OnboardingWizard />
  }

  return (
    <div className="flex flex-col h-screen bg-surface-900 overflow-hidden">
      {/* 상단 헤더 */}
      <header className="h-14 panel border-b border-surface-700 flex items-center justify-between px-4 flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <span className="text-brand-400 font-extrabold text-sm tracking-wider">CO-MIND WORKS</span>
          {currentOffice && (
            <>
              <span className="text-white/20">|</span>
              <span className="text-white/50 text-sm">{currentOffice.name}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/30 text-xs hidden sm:block">{user?.email}</span>
          <button
            onClick={() => authService.signOut()}
            className="btn-ghost text-xs"
          >
            로그아웃
          </button>
        </div>
      </header>

      {/* 메인 영역 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 채널 사이드바 */}
        <ChannelSidebar />

        {/* 메시지 영역 + 입력창 */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <MessageThread onViewArtifact={(task) => setArtifactTask(task)} />
          <MessageInput />
        </div>

        {/* 아티팩트 패널 (결과 있을 때만) */}
        <ArtifactPanel
          task={artifactTask}
          onClose={() => setArtifactTask(null)}
          onFeedback={handleFeedback}
        />
      </div>
    </div>
  )
}
