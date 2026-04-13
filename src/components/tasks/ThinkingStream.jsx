import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTaskStore } from '../../stores/useTaskStore'

const PHASE_LABELS = {
  planning: '계획 수립',
  information_gathering: '정보 수집',
  analysis: '분석',
  drafting: '초안 작성',
  review: '검수',
  thinking: '사고 중',
  tool_use: '도구 사용',
}

const PHASE_COLORS = {
  planning: '#a78bfa',
  information_gathering: '#60a5fa',
  analysis: '#34d399',
  drafting: '#fbbf24',
  review: '#f87171',
  thinking: '#a78bfa',
  tool_use: '#f59e0b',
}

export default function ThinkingStream() {
  const { thinkingLog } = useTaskStore()
  const bottomRef = useRef(null)

  // 새 스텝 추가 시 자동 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thinkingLog.length])

  return (
    <div className="p-3 space-y-2">
      <AnimatePresence initial={false}>
        {thinkingLog.map((step) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex gap-2"
          >
            {/* 단계 인디케이터 */}
            <div
              className="w-1.5 flex-shrink-0 rounded-full mt-1"
              style={{ backgroundColor: PHASE_COLORS[step.phase] ?? '#6b7280', minHeight: '16px' }}
            />

            <div className="flex-1 min-w-0">
              <div
                className="text-xs font-bold uppercase tracking-wider mb-0.5"
                style={{ color: PHASE_COLORS[step.phase] ?? '#6b7280' }}
              >
                {PHASE_LABELS[step.phase] ?? step.phase}
              </div>
              <div className="thinking-step break-words">{step.content}</div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      <div ref={bottomRef} />
    </div>
  )
}
