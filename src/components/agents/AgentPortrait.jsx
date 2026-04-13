import { motion, AnimatePresence } from 'framer-motion'

// 에이전트 상태 → 표정 매핑
const STATUS_TO_EXPRESSION = {
  idle: 'idle',
  in_progress: 'thinking',
  thinking: 'thinking',
  completed: 'happy',
  failed: 'focused',
  review: 'focused',
}

// 표정 → 이모지/색상 (이미지가 없을 때 fallback)
const EXPRESSION_STYLE = {
  idle:     { emoji: '😐', glow: 'rgba(148,163,184,0.3)' },
  thinking: { emoji: '🤔', glow: 'rgba(139,92,246,0.5)' },
  happy:    { emoji: '😊', glow: 'rgba(52,211,153,0.5)' },
  focused:  { emoji: '😤', glow: 'rgba(251,191,36,0.4)' },
}

// 이름으로 배경색 결정 (일관성 있게)
function getAvatarColor(name = '') {
  const colors = [
    '#7c3aed', '#2563eb', '#059669', '#d97706',
    '#dc2626', '#db2777', '#0891b2', '#65a30d',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

/**
 * AgentPortrait — 에이전트 2.5D 포트레이트
 *
 * props:
 *   agent       — { id, name, status, portrait_set: { idle, thinking, happy, focused } }
 *   size        — 'sm' | 'md' | 'lg'  (기본 'md')
 *   expression  — 강제 표정 (status 자동 계산 오버라이드)
 */
export default function AgentPortrait({ agent, size = 'md', expression }) {
  const expr = expression ?? STATUS_TO_EXPRESSION[agent?.status] ?? 'idle'
  const portraitUrl = agent?.portrait_set?.[expr]
  const exprStyle = EXPRESSION_STYLE[expr] ?? EXPRESSION_STYLE.idle
  const bgColor = getAvatarColor(agent?.name)

  const sizeClass = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-xl',
    lg: 'w-16 h-16 text-3xl',
  }[size]

  return (
    <div className="relative flex-shrink-0">
      <AnimatePresence mode="wait">
        <motion.div
          key={expr}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`${sizeClass} rounded-full overflow-hidden flex items-center justify-center flex-shrink-0`}
          style={{
            background: portraitUrl ? 'transparent' : bgColor,
            boxShadow: `0 0 12px ${exprStyle.glow}`,
          }}
        >
          {portraitUrl ? (
            <img
              src={portraitUrl}
              alt={`${agent?.name} ${expr}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="select-none leading-none">
              {size === 'sm'
                ? (agent?.name?.[0] ?? '?').toUpperCase()
                : exprStyle.emoji}
            </span>
          )}
        </motion.div>
      </AnimatePresence>

      {/* 상태 dot (sm 전용) */}
      {size === 'sm' && (
        <span
          className="absolute bottom-0 right-0 w-2 h-2 rounded-full border border-surface-900"
          style={{
            background:
              agent?.status === 'in_progress' || agent?.status === 'thinking' ? '#a78bfa'
              : agent?.status === 'completed' ? '#34d399'
              : agent?.status === 'failed' ? '#f87171'
              : '#6b7280',
          }}
        />
      )}

      {/* thinking pulse ring */}
      {(agent?.status === 'in_progress' || agent?.status === 'thinking') && (
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ border: '2px solid #a78bfa' }}
        />
      )}
    </div>
  )
}
