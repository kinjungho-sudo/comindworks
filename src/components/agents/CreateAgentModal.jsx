import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { agentService } from '../../services/agentService'
import { useOfficeStore } from '../../stores/useOfficeStore'
import { useAgentStore } from '../../stores/useAgentStore'

const AVATAR_SPRITES = [
  { id: 'agent_default', label: '기본' },
  { id: 'agent_developer', label: '개발자' },
  { id: 'agent_marketer', label: '마케터' },
  { id: 'agent_analyst', label: '분석가' },
]

export default function CreateAgentModal({ onClose }) {
  const { currentOffice } = useOfficeStore()
  const { addAgent, selectAgent } = useAgentStore()
  const queryClient = useQueryClient()

  const [form, setForm] = useState({
    name: '',
    role: '',
    system_prompt: '',
    avatar_sprite: 'agent_default',
  })

  const { mutate: create, isPending, error } = useMutation({
    mutationFn: () => agentService.createAgent({
      officeId: currentOffice.id,
      name: form.name.trim(),
      role: form.role.trim(),
      systemPrompt: form.system_prompt.trim()
        || `당신은 ${form.name.trim()}입니다. 역할: ${form.role.trim()}. 사용자의 업무를 전문적으로 지원하세요.`,
      avatarSprite: form.avatar_sprite,
    }),
    onSuccess: (agent) => {
      addAgent(agent)
      selectAgent(agent.id)
      queryClient.invalidateQueries({ queryKey: ['agents'] })
      onClose()
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.role.trim()) return
    create()
  }

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 z-40"
      />

      <motion.div
        key="modal"
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
      >
        <div
          className="w-[420px] panel border border-surface-700 rounded-2xl overflow-hidden pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="p-4 border-b border-surface-700 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">새 에이전트 고용</h2>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-surface-700 transition-colors text-sm"
            >
              ✕
            </button>
          </div>

          {/* 폼 */}
          <form onSubmit={handleSubmit} className="p-4 space-y-3">
            <div>
              <label className="text-xs text-white/50 mb-1 block">이름 *</label>
              <input
                autoFocus
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="예: 민수"
                className="w-full bg-surface-800 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-brand-500/60"
                required
              />
            </div>

            <div>
              <label className="text-xs text-white/50 mb-1 block">역할 *</label>
              <input
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="예: 법무 분석가, 마케터, 개발자"
                className="w-full bg-surface-800 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-brand-500/60"
                required
              />
            </div>

            <div>
              <label className="text-xs text-white/50 mb-1 block">
                시스템 프롬프트 <span className="text-white/20">(선택 — 비워두면 자동 생성)</span>
              </label>
              <textarea
                value={form.system_prompt}
                onChange={(e) => setForm({ ...form, system_prompt: e.target.value })}
                placeholder="이 에이전트의 전문성, 행동 원칙, 응답 스타일을 정의하세요."
                rows={3}
                className="w-full bg-surface-800 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-brand-500/60 resize-none"
              />
            </div>

            {/* 아바타 선택 */}
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">아바타</label>
              <div className="grid grid-cols-4 gap-2">
                {AVATAR_SPRITES.map((sprite) => (
                  <button
                    key={sprite.id}
                    type="button"
                    onClick={() => setForm({ ...form, avatar_sprite: sprite.id })}
                    className={`py-2 rounded-lg text-xs transition-colors ${
                      form.avatar_sprite === sprite.id
                        ? 'bg-brand-500 text-white font-bold'
                        : 'bg-surface-800 text-white/40 hover:text-white border border-surface-600'
                    }`}
                  >
                    {sprite.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400">에이전트 생성 실패: {error.message}</p>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 text-sm text-white/50 border border-surface-600 rounded-lg hover:bg-surface-700 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isPending || !form.name.trim() || !form.role.trim()}
                className="flex-1 py-2 text-sm font-bold bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors disabled:opacity-30"
              >
                {isPending ? '고용 중...' : '고용하기'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
