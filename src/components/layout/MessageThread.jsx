import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { useAgentStore } from '../../stores/useAgentStore'
import { useTaskStore } from '../../stores/useTaskStore'
import { useOfficeStore } from '../../stores/useOfficeStore'
import { taskService } from '../../services/taskService'
import AgentPortrait from '../agents/AgentPortrait'

const PHASE_COLORS = {
  planning: '#a78bfa',
  information_gathering: '#60a5fa',
  analysis: '#34d399',
  drafting: '#fbbf24',
  review: '#f87171',
  thinking: '#a78bfa',
  tool_use: '#f59e0b',
}

const PHASE_LABELS = {
  planning: '계획',
  information_gathering: '정보 수집',
  analysis: '분석',
  drafting: '초안 작성',
  review: '검수',
  thinking: '사고 중',
  tool_use: '도구 실행',
}

function ThinkingBubble({ steps }) {
  if (!steps || steps.length === 0) return null
  return (
    <div className="space-y-1.5 mt-2">
      <AnimatePresence initial={false}>
        {steps.map((step) => (
          <motion.div
            key={step.id ?? step.timestamp}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex gap-2"
          >
            <div
              className="w-1 flex-shrink-0 rounded-full mt-0.5"
              style={{ backgroundColor: PHASE_COLORS[step.phase] ?? '#6b7280', minHeight: '14px' }}
            />
            <div className="flex-1 min-w-0">
              <span
                className="text-xs font-bold uppercase tracking-wider mr-2"
                style={{ color: PHASE_COLORS[step.phase] ?? '#6b7280' }}
              >
                {PHASE_LABELS[step.phase] ?? step.phase}
              </span>
              <span className="text-xs text-white/50 break-words">{step.content}</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

function ApprovalButtons({ approval, onApprove, onReject }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 space-y-2"
    >
      <div className="flex items-center gap-2">
        <span className="text-yellow-400">⏸</span>
        <span className="text-yellow-400 text-xs font-bold uppercase tracking-wider">승인 요청</span>
      </div>
      <p className="text-sm text-white/70">{approval.message}</p>
      <div className="flex gap-2">
        <button
          onClick={onApprove}
          className="flex-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 text-green-400 text-xs font-bold py-1.5 rounded-lg transition-colors"
        >
          ✓ 승인
        </button>
        <button
          onClick={onReject}
          className="flex-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 text-xs font-bold py-1.5 rounded-lg transition-colors"
        >
          ✗ 거부
        </button>
      </div>
    </motion.div>
  )
}

// 태스크 하나 = 메시지 교환 한 쌍
function MessageExchange({ task, agent, isStreaming, thinkingLog, pendingApproval, onApprove, onReject, onViewArtifact }) {
  const isCurrentTask = isStreaming
  const hasResult = task.status === 'completed' && task.result?.content

  return (
    <div className="space-y-3">
      {/* 유저 메시지 (우측) */}
      <div className="flex justify-end">
        <div className="max-w-[70%] bg-brand-500/20 border border-brand-500/30 rounded-2xl rounded-tr-sm px-4 py-2.5">
          <p className="text-sm text-white/90 break-words">{task.instruction}</p>
          <div className="text-xs text-white/30 mt-1 text-right">
            {task.created_at ? new Date(task.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : ''}
          </div>
        </div>
      </div>

      {/* 에이전트 응답 (좌측) */}
      <div className="flex items-start gap-3">
        <AgentPortrait agent={agent} size="md" />

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-sm font-semibold text-white/90">{agent?.name}</span>
            {task.completed_at && (
              <span className="text-xs text-white/30">
                {new Date(task.completed_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>

          <div className="bg-surface-700/60 rounded-2xl rounded-tl-sm px-4 py-3">
            {/* 스트리밍 중: thinking 표시 */}
            {isCurrentTask && (
              <>
                {thinkingLog.length === 0 ? (
                  <div className="flex items-center gap-2 text-white/40 text-sm">
                    <span className="animate-pulse">⠋</span>
                    <span>처리 중...</span>
                  </div>
                ) : (
                  <ThinkingBubble steps={thinkingLog} />
                )}

                {/* HITL 승인 */}
                {pendingApproval && (
                  <ApprovalButtons
                    approval={pendingApproval}
                    onApprove={onApprove}
                    onReject={onReject}
                  />
                )}
              </>
            )}

            {/* 완료: 결과 미리보기 */}
            {hasResult && !isCurrentTask && (
              <div className="space-y-2">
                <div className="text-sm text-white/80 prose prose-invert prose-sm max-w-none line-clamp-4">
                  <ReactMarkdown>{task.result.content}</ReactMarkdown>
                </div>
                <button
                  onClick={() => onViewArtifact(task)}
                  className="text-xs text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1 mt-1"
                >
                  아티팩트 열기 →
                </button>
              </div>
            )}

            {/* 실패 */}
            {task.status === 'failed' && !isCurrentTask && (
              <div className="text-sm text-red-400">
                ✕ 작업 실패: {task.error ?? '알 수 없는 오류'}
              </div>
            )}

            {/* 과거 완료 태스크에서 thinking 접기 */}
            {hasResult && !isCurrentTask && task.thinking_log?.length > 0 && (
              <ThinkingHistory steps={task.thinking_log} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ThinkingHistory({ steps }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-xs text-white/30 hover:text-white/50 transition-colors flex items-center gap-1"
      >
        <span>{open ? '▾' : '▸'}</span>
        사고 과정 {open ? '접기' : '보기'} ({steps.length}단계)
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <ThinkingBubble steps={steps.map((s, i) => ({ ...s, id: i }))} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function MessageThread({ onViewArtifact }) {
  const { getSelectedAgent, agents } = useAgentStore()
  const { currentOffice } = useOfficeStore()
  const {
    tasks, currentTask, thinkingLog, pendingApproval,
    setCurrentTask, addTask, appendThinkingStep,
    completeTask, failTask, setPendingApproval, clearPendingApproval, updateTaskStatus,
  } = useTaskStore()
  const { isStreaming, streamTaskId } = useTaskStore((s) => ({
    isStreaming: !!s.currentTask && s.currentTask?.status === 'in_progress',
    streamTaskId: s.currentTask?.id,
  }))
  const queryClient = useQueryClient()
  const bottomRef = useRef(null)
  const selectedAgent = getSelectedAgent()

  // 선택된 에이전트의 tasks만 필터
  const agentTasks = tasks
    .filter((t) => t.agent_id === selectedAgent?.id)
    .slice() // 복사
    .reverse() // 오래된 것이 위

  // 태스크 히스토리 로드
  const { data: tasksData } = useQuery({
    queryKey: ['tasks', currentOffice?.id, selectedAgent?.id],
    queryFn: () => taskService.getTasks(currentOffice.id),
    enabled: !!currentOffice?.id,
  })

  useEffect(() => {
    if (tasksData) {
      // store에 태스크 채우기
      tasksData.forEach((t) => {
        if (!tasks.find((s) => s.id === t.id)) addTask(t)
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasksData])

  // 새 메시지 시 하단 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [agentTasks.length, thinkingLog.length])

  const handleApprove = async () => {
    if (!currentTask) return
    clearPendingApproval()
    updateTaskStatus(currentTask.id, 'in_progress')
    await taskService.approveTask(currentTask.id)
    queryClient.invalidateQueries(['tasks'])
  }

  const handleReject = async () => {
    if (!currentTask) return
    const reason = window.prompt('거부 사유를 입력하세요 (선택 사항):') ?? ''
    clearPendingApproval()
    updateTaskStatus(currentTask.id, 'review')
    await taskService.rejectTask(currentTask.id, { reason, modification: '' })
    queryClient.invalidateQueries(['tasks'])
  }

  if (!selectedAgent) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="text-4xl">💬</div>
          <div className="text-white/40 text-sm">좌측에서 에이전트를 선택하세요</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* 채널 헤더 */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-surface-700 flex-shrink-0">
        <AgentPortrait agent={selectedAgent} size="sm" />
        <div>
          <div className="text-sm font-semibold text-white/90">{selectedAgent.name}</div>
          <div className="text-xs text-white/40">{selectedAgent.role}</div>
        </div>
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
        {agentTasks.length === 0 && (
          <div className="text-center py-16 space-y-2">
            <AgentPortrait agent={selectedAgent} size="lg" />
            <div className="text-white/50 text-sm mt-4">
              {selectedAgent.name}에게 첫 번째 작업을 지시해보세요.
            </div>
            <div className="text-white/25 text-xs">{selectedAgent.role}</div>
          </div>
        )}

        {agentTasks.map((task) => {
          const isCurrentStreaming = task.id === streamTaskId && isStreaming
          return (
            <MessageExchange
              key={task.id}
              task={task}
              agent={selectedAgent}
              isStreaming={isCurrentStreaming}
              thinkingLog={isCurrentStreaming ? thinkingLog : []}
              pendingApproval={isCurrentStreaming ? pendingApproval : null}
              onApprove={handleApprove}
              onReject={handleReject}
              onViewArtifact={onViewArtifact}
            />
          )
        })}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}
