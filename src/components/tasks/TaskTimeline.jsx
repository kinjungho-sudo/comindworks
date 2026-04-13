import { useQuery } from '@tanstack/react-query'
import { useOfficeStore } from '../../stores/useOfficeStore'
import { useTaskStore } from '../../stores/useTaskStore'
import { taskService } from '../../services/taskService'
import { formatRelativeTime } from '../../lib/utils'

const STATUS_ICONS = {
  pending: '⏳',
  in_progress: '↻',
  review: '◎',
  completed: '✓',
  failed: '✕',
}

const STATUS_COLORS = {
  pending: 'text-white/40',
  in_progress: 'text-blue-400',
  review: 'text-yellow-400',
  completed: 'text-green-400',
  failed: 'text-red-400',
}

export default function TaskTimeline() {
  const { currentOffice } = useOfficeStore()
  const { currentTask, setCurrentTask } = useTaskStore()

  const { data: tasks } = useQuery({
    queryKey: ['tasks', currentOffice?.id],
    queryFn: () => taskService.getTasks({ officeId: currentOffice.id }),
    enabled: !!currentOffice?.id,
    // Realtime이 실시간 갱신하므로 폴링 간격 늘림 (fallback용)
    refetchInterval: 30_000,
  })

  const handleTaskClick = async (task) => {
    // thinking_log가 없는 간략 목록 데이터면 DB에서 전체 로드
    if (!task.thinking_log) {
      try {
        const full = await taskService.getTask(task.id)
        setCurrentTask(full)
      } catch {
        setCurrentTask(task)
      }
    } else {
      setCurrentTask(task)
    }
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="p-4 text-white/20 text-xs text-center">
        아직 실행된 작업이 없습니다.
      </div>
    )
  }

  return (
    <ul className="p-2 space-y-1">
      {tasks.map((task) => (
        <li key={task.id}>
          <button
            onClick={() => handleTaskClick(task)}
            className={`w-full text-left p-2 rounded-lg transition-colors ${
              currentTask?.id === task.id
                ? 'bg-surface-700 ring-1 ring-surface-500'
                : 'hover:bg-surface-700'
            }`}
          >
            <div className="flex items-start gap-2">
              <span className={`text-xs flex-shrink-0 font-bold mt-0.5 ${STATUS_COLORS[task.status]}`}>
                {STATUS_ICONS[task.status]}
              </span>
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-medium truncate ${STATUS_COLORS[task.status]}`}>
                  {task.title}
                </div>
                <div className="text-xs text-white/30 mt-0.5">
                  {formatRelativeTime(task.created_at)}
                </div>
              </div>
            </div>
          </button>
        </li>
      ))}
    </ul>
  )
}
