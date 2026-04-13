import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAgentStore } from '../../stores/useAgentStore'
import { useOfficeStore } from '../../stores/useOfficeStore'
import { useTaskStore } from '../../stores/useTaskStore'
import { taskService } from '../../services/taskService'
import { useStreamStore } from '../../stores/useStreamStore'

export default function CommandBar() {
  const [instruction, setInstruction] = useState('')
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

      // SSE 스트리밍 시작
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

      es.onerror = () => {
        stopStream()
      }
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!instruction.trim() || !selectedAgent || isPending) return
    submitTask(instruction.trim())
    setInstruction('')
  }

  return (
    <div className="h-12 panel border-t border-surface-700 flex items-center gap-2 px-3 flex-shrink-0">
      {/* 선택된 에이전트 표시 */}
      <div className="text-xs text-white/40 flex-shrink-0">
        {selectedAgent
          ? <span className="text-brand-400">{selectedAgent.name}</span>
          : <span>에이전트를 선택하세요</span>
        }
      </div>

      <span className="text-white/20 flex-shrink-0">›</span>

      {/* 지시 입력 */}
      <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2">
        <input
          type="text"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder={selectedAgent ? '작업을 지시하세요...' : '좌측에서 에이전트를 선택하세요'}
          disabled={!selectedAgent || isPending}
          className="flex-1 bg-transparent text-sm text-white placeholder-white/20 outline-none"
        />
        <button
          type="submit"
          disabled={!instruction.trim() || !selectedAgent || isPending}
          className="btn-primary text-xs h-8 px-4 flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {isPending ? '처리 중...' : '전송 ▶'}
        </button>
      </form>
    </div>
  )
}
