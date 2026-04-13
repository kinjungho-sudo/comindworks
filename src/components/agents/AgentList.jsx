import { useState } from 'react'
import { useAgentStore } from '../../stores/useAgentStore'
import { getStatusColor, getStatusLabel } from '../../lib/utils'
import AgentDetailModal from './AgentDetailModal'

export default function AgentList() {
  const { agents, selectedAgentId, selectAgent } = useAgentStore()
  const [modalAgentId, setModalAgentId] = useState(null)

  if (agents.length === 0) {
    return (
      <div className="p-4 text-white/30 text-xs text-center">
        에이전트가 없습니다.<br />온보딩에서 첫 에이전트를 만들어보세요.
      </div>
    )
  }

  return (
    <>
      <ul className="p-2 space-y-1">
        {agents.map((agent) => (
          <li key={agent.id}>
            <div
              className={`w-full text-left p-2 rounded-lg transition-colors flex items-center gap-2 ${
                selectedAgentId === agent.id
                  ? 'bg-brand-500/20 border border-brand-500/40'
                  : 'hover:bg-surface-700 border border-transparent'
              }`}
            >
              {/* 아바타 — 클릭하면 에이전트 선택 */}
              <button
                onClick={() => selectAgent(agent.id)}
                className="w-8 h-8 rounded flex-shrink-0 flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: getStatusColor(agent.status) + '33', color: getStatusColor(agent.status) }}
              >
                {agent.name.slice(0, 2)}
              </button>

              {/* 이름/역할 — 클릭하면 에이전트 선택 */}
              <button
                onClick={() => selectAgent(agent.id)}
                className="flex-1 min-w-0 text-left"
              >
                <div className="text-sm font-medium text-white truncate">{agent.name}</div>
                <div className="text-xs text-white/40 truncate">{agent.role}</div>
              </button>

              {/* 상태 인디케이터 + 상세 버튼 */}
              <div className="flex-shrink-0 flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getStatusColor(agent.status) }}
                />
                <button
                  onClick={() => setModalAgentId(agent.id)}
                  className="text-white/20 hover:text-white/60 transition-colors text-xs px-1"
                  title="상세 보기"
                >
                  ···
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {modalAgentId && (
        <AgentDetailModal
          agentId={modalAgentId}
          onClose={() => setModalAgentId(null)}
        />
      )}
    </>
  )
}
