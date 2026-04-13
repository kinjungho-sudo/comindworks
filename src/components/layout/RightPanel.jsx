import { motion, AnimatePresence } from 'framer-motion'
import TaskTimeline from '../tasks/TaskTimeline'
import ThinkingStream from '../tasks/ThinkingStream'
import ResultViewer from '../tasks/ResultViewer'
import { useTaskStore } from '../../stores/useTaskStore'
import { taskService } from '../../services/taskService'
import { useQueryClient } from '@tanstack/react-query'

function ApprovalBanner({ approval, onApprove, onReject }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="border-t border-yellow-500/40 bg-yellow-500/10 flex-shrink-0"
    >
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 text-sm">⏸</span>
          <span className="section-label text-yellow-400">승인 요청</span>
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
      </div>
    </motion.div>
  )
}

export default function RightPanel() {
  const { currentTask, thinkingLog, pendingApproval, clearPendingApproval, updateTaskStatus } = useTaskStore()
  const queryClient = useQueryClient()

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

  return (
    <aside className="w-[360px] panel border-l border-surface-700 flex flex-col overflow-hidden flex-shrink-0">
      {/* 작업 타임라인 */}
      <div className="p-3 pb-1 flex-shrink-0">
        <span className="section-label">작업 이력</span>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        <TaskTimeline />
      </div>

      {/* HITL 승인 배너 */}
      <AnimatePresence>
        {pendingApproval && (
          <ApprovalBanner
            approval={pendingApproval}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        )}
      </AnimatePresence>

      {/* Glass-box 사고 과정 */}
      {currentTask && thinkingLog.length > 0 && (
        <div className="border-t border-surface-700 flex-shrink-0 max-h-64 overflow-y-auto">
          <div className="p-3 pb-1">
            <span className="section-label">사고 과정</span>
          </div>
          <ThinkingStream />
        </div>
      )}

      {/* 결과물 뷰어 */}
      {currentTask?.status === 'completed' && (
        <div className="border-t border-surface-700 flex-shrink-0 max-h-80 overflow-y-auto">
          <div className="p-3 pb-1">
            <span className="section-label">결과물</span>
          </div>
          <ResultViewer />
        </div>
      )}
    </aside>
  )
}
