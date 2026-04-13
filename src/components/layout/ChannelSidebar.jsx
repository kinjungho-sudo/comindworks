import { useState } from 'react'
import { useAgentStore } from '../../stores/useAgentStore'
import { useOfficeStore } from '../../stores/useOfficeStore'
import AgentPortrait from '../agents/AgentPortrait'
import CreateAgentModal from '../agents/CreateAgentModal'

const STATUS_LABEL = {
  idle: '대기',
  in_progress: '작업 중',
  thinking: '사고 중',
  completed: '완료',
  failed: '실패',
  review: '검토',
}

export default function ChannelSidebar() {
  const { agents, selectedAgentId, selectAgent } = useAgentStore()
  const { currentOffice } = useOfficeStore()
  const [showCreateAgent, setShowCreateAgent] = useState(false)

  return (
    <>
      <aside className="w-60 bg-surface-900 border-r border-surface-700 flex flex-col flex-shrink-0 overflow-hidden">
        {/* 워크스페이스 헤더 */}
        <div className="px-4 py-3 border-b border-surface-700 flex-shrink-0">
          <div className="text-white/80 font-bold text-sm truncate">
            {currentOffice?.name ?? '워크스페이스'}
          </div>
          <div className="text-white/30 text-xs mt-0.5">
            AI 팀 · {agents.length}명
          </div>
        </div>

        {/* 에이전트 채널 목록 */}
        <div className="flex-1 overflow-y-auto py-2">
          <div className="px-3 mb-1">
            <span className="text-white/30 text-xs font-bold uppercase tracking-wider">에이전트</span>
          </div>

          {agents.length === 0 ? (
            <div className="px-4 py-4 text-white/30 text-xs">
              아직 에이전트가 없습니다.
            </div>
          ) : (
            agents.map((agent) => {
              const isSelected = agent.id === selectedAgentId
              const isActive = agent.status === 'in_progress' || agent.status === 'thinking'

              return (
                <button
                  key={agent.id}
                  onClick={() => selectAgent(agent.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors rounded-lg mx-1 mb-0.5 ${
                    isSelected
                      ? 'bg-brand-500/20 text-white'
                      : 'text-white/50 hover:text-white/80 hover:bg-surface-700/60'
                  }`}
                  style={{ width: 'calc(100% - 8px)' }}
                >
                  <AgentPortrait agent={agent} size="sm" />

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {agent.name}
                    </div>
                    <div className={`text-xs truncate ${
                      isActive ? 'text-purple-400' : 'text-white/30'
                    }`}>
                      {isActive ? (
                        <span className="flex items-center gap-1">
                          <span className="animate-pulse">●</span>
                          {STATUS_LABEL[agent.status]}
                        </span>
                      ) : (
                        agent.role ?? STATUS_LABEL[agent.status] ?? '대기'
                      )}
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>

        {/* 에이전트 고용 버튼 */}
        <div className="p-3 border-t border-surface-700 flex-shrink-0">
          <button
            onClick={() => setShowCreateAgent(true)}
            className="w-full btn-ghost border border-surface-600 rounded-lg py-2 text-xs text-white/50 hover:text-white/80 transition-colors flex items-center justify-center gap-1.5"
          >
            <span className="text-brand-400 text-base leading-none">+</span>
            에이전트 고용
          </button>
        </div>
      </aside>

      {showCreateAgent && (
        <CreateAgentModal onClose={() => setShowCreateAgent(false)} />
      )}
    </>
  )
}
