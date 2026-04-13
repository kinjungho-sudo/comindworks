import { useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAgentStore } from '../../stores/useAgentStore'
import { useOfficeStore } from '../../stores/useOfficeStore'
import { useTaskStore } from '../../stores/useTaskStore'
import { useStreamStore } from '../../stores/useStreamStore'
import { taskService } from '../../services/taskService'

export default function MessageInput() {
  const [instruction, setInstruction] = useState('')
  const textareaRef = useRef(null)

  const { getSelectedAgent } = useAgentStore()
  const { currentOffice } = useOfficeStore()
  const { addTask, setCurrentTask, appendThinkingStep, completeTask, failTask, setPendingApproval } = useTaskStore()
  const { startStream, stopStream } = useStreamStore()
  const queryClient = useQueryClient()

  const selectedAgent = getSelectedAgent()

  const { mutate: submitTask, isPending } = useMutation({
    mutationFn: async (instr) => {
      const task = await taskService.createTask({
        agentId: selectedAgent.id,
        officeId: currentOffice.id,
        title: instr.slice(0, 100),
        instruction: instr,
      })
      return task
    },
    onSuccess: (task) => {
      addTask(task)
      setCurrentTask(task)
      queryClient.invalidateQueries(['tasks'])

      const es = taskService.streamTask(task.id)
      startStream(task.id, es)

      es.addEventListener('thinking', (e) => {
        appendThinkingStep(JSON.parse(e.data))
      })

      es.addEventListener('approval_required', (e) => {
        setPendingApproval(JSON.parse(e.data))
      })

      es.addEventListener('completed', (e) => {
        const { result } = JSON.parse(e.data)
        completeTask(task.id, result)
        stopStream()
        queryClient.invalidateQueries(['tasks'])
      })

      es.addEventListener('error', (e) => {
        try {
          const data = JSON.parse(e.data)
          failTask(task.id, data.message ?? '오류 발생')
        } catch {
          failTask(task.id, '스트리밍 오류')
        }
        stopStream()
      })

      es.onerror = () => stopStream()
    },
  })

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleSubmit = () => {
    if (!instruction.trim() || !selectedAgent || isPending) return
    submitTask(instruction.trim())
    setInstruction('')
    textareaRef.current?.focus()
  }

  const canSubmit = instruction.trim().length > 0 && !!selectedAgent && !isPending

  return (
    <div className="flex-shrink-0 px-4 py-3 border-t border-surface-700 bg-surface-900">
      <div className={`flex items-end gap-3 bg-surface-700/60 rounded-2xl px-4 py-3 border transition-colors ${
        selectedAgent ? 'border-surface-600' : 'border-surface-700'
      }`}>
        {/* 선택 에이전트 pill */}
        {selectedAgent ? (
          <div className="flex items-center gap-1.5 bg-brand-500/20 border border-brand-500/30 rounded-full px-2.5 py-1 flex-shrink-0 mb-0.5">
            <span className="text-xs text-brand-400 font-medium">{selectedAgent.name}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 bg-surface-600/60 rounded-full px-2.5 py-1 flex-shrink-0 mb-0.5">
            <span className="text-xs text-white/30">에이전트 미선택</span>
          </div>
        )}

        {/* 텍스트 입력 */}
        <textarea
          ref={textareaRef}
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={selectedAgent ? `${selectedAgent.name}에게 작업을 지시하세요... (Enter 전송, Shift+Enter 줄바꿈)` : '좌측에서 에이전트를 선택하세요'}
          disabled={!selectedAgent || isPending}
          rows={1}
          className="flex-1 bg-transparent text-sm text-white placeholder-white/25 outline-none resize-none leading-relaxed max-h-32 overflow-y-auto"
          style={{ minHeight: '24px' }}
          onInput={(e) => {
            // 높이 자동 조정
            e.target.style.height = 'auto'
            e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px'
          }}
        />

        {/* 전송 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="flex-shrink-0 mb-0.5 w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-brand-400 active:scale-95"
        >
          {isPending ? (
            <span className="animate-spin text-white text-xs">⟳</span>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
