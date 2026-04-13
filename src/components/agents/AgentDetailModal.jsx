import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { agentService } from '../../services/agentService'
import { useAgentStore } from '../../stores/useAgentStore'
import { useAbilityStore } from '../../stores/useAbilityStore'
import {
  getStatusColor,
  getStatusLabel,
  getCategoryColor,
  getCategoryLabel,
  formatRelativeTime,
  formatTokens,
} from '../../lib/utils'

// ── 탭 상수 ─────────────────────────────────────────────
const TABS = [
  { id: 'profile', label: '프로필' },
  { id: 'abilities', label: '능력 카드' },
  { id: 'memory', label: '메모리' },
]

// ── 메모리 타입 한국어 라벨 ──────────────────────────────
const MEMORY_TYPE_LABELS = {
  task_result: '작업 결과',
  user_feedback: '사용자 피드백',
  context: '컨텍스트',
  decision: '결정 사항',
}

const MEMORY_TYPE_COLORS = {
  task_result: '#3B82F6',
  user_feedback: '#10B981',
  context: '#A78BFA',
  decision: '#F59E0B',
}

// ── 메모리 브라우저 ──────────────────────────────────────
function MemoryBrowser({ agentId }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('')

  const { data: memories = [], isLoading } = useQuery({
    queryKey: ['agent-memories', agentId, filterType],
    queryFn: async () => {
      let q = supabase
        .from('agent_memories')
        .select('id, content, memory_type, metadata, created_at')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false })
        .limit(30)
      if (filterType) q = q.eq('memory_type', filterType)
      const { data, error } = await q
      if (error) throw error
      return data ?? []
    },
    enabled: !!agentId,
  })

  const filtered = searchQuery.trim()
    ? memories.filter((m) =>
        m.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : memories

  return (
    <div className="space-y-3">
      {/* 검색 + 필터 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="메모리 검색..."
          className="flex-1 bg-surface-800 border border-surface-600 rounded-lg px-3 py-1.5 text-sm text-white placeholder-white/30 outline-none focus:border-brand-500/60"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-surface-800 border border-surface-600 rounded-lg px-2 py-1.5 text-xs text-white/70 outline-none focus:border-brand-500/60"
        >
          <option value="">전체</option>
          {Object.entries(MEMORY_TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* 메모리 목록 */}
      {isLoading ? (
        <div className="text-center text-white/30 text-xs py-6">불러오는 중...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-white/30 text-xs py-6">
          {searchQuery ? '검색 결과가 없습니다.' : '저장된 메모리가 없습니다.'}
        </div>
      ) : (
        <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {filtered.map((memory) => {
            const color = MEMORY_TYPE_COLORS[memory.memory_type] ?? '#6B7280'
            return (
              <li
                key={memory.id}
                className="p-3 rounded-lg border"
                style={{ borderColor: color + '30', backgroundColor: color + '0a' }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="text-xs font-bold px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: color + '25', color }}
                  >
                    {MEMORY_TYPE_LABELS[memory.memory_type] ?? memory.memory_type}
                  </span>
                  <span className="text-xs text-white/30">
                    {formatRelativeTime(memory.created_at)}
                  </span>
                </div>
                <p className="text-xs text-white/70 leading-relaxed line-clamp-3">
                  {memory.content}
                </p>
              </li>
            )
          })}
        </ul>
      )}

      <div className="text-xs text-white/20 text-right">
        총 {filtered.length}개
      </div>
    </div>
  )
}

// ── 장착 능력 카드 목록 ──────────────────────────────────
function EquippedAbilities({ agent }) {
  const { abilities: allAbilities } = useAbilityStore()
  const { removeAbilityFromAgent } = useAgentStore()
  const queryClient = useQueryClient()

  const { mutate: removeAbility, isPending } = useMutation({
    mutationFn: ({ agentId, abilityId }) => agentService.removeAbility(agentId, abilityId),
    onSuccess: (updatedAgent) => {
      removeAbilityFromAgent(agent.id, updatedAgent.abilities?.at(-1)?.ability_id)
      // store 전체 갱신
      queryClient.invalidateQueries(['agents'])
    },
  })

  const equippedIds = (agent.abilities ?? []).map((a) => a.ability_id)
  const equippedCards = allAbilities.filter((a) => equippedIds.includes(a.id))

  if (equippedCards.length === 0) {
    return (
      <div className="text-center text-white/30 text-xs py-6">
        장착된 능력 카드가 없습니다.<br />
        좌측 인벤토리에서 드래그해서 부여하세요.
      </div>
    )
  }

  return (
    <ul className="space-y-2">
      {equippedCards.map((ability) => {
        const color = getCategoryColor(ability.category)
        return (
          <li
            key={ability.id}
            className="flex items-center gap-3 p-2.5 rounded-lg border"
            style={{ borderColor: color + '30', backgroundColor: color + '0d' }}
          >
            <div
              className="w-8 h-8 rounded flex-shrink-0 flex items-center justify-center text-sm font-bold"
              style={{ backgroundColor: color + '25', color }}
            >
              {ability.icon?.replace('icon_', '').slice(0, 1).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{ability.name}</div>
              <div className="text-xs" style={{ color: color + 'aa' }}>
                {getCategoryLabel(ability.category)}
              </div>
            </div>
            <button
              onClick={() => removeAbility({ agentId: agent.id, abilityId: ability.id })}
              disabled={isPending}
              className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-30"
              title="능력 카드 제거"
            >
              ✕
            </button>
          </li>
        )
      })}
    </ul>
  )
}

// ── 프로필 편집 ──────────────────────────────────────────
function ProfileEditor({ agent, onClose }) {
  const { agents, setAgents } = useAgentStore()
  const queryClient = useQueryClient()

  const [form, setForm] = useState({
    name: agent.name ?? '',
    role: agent.role ?? '',
    system_prompt: agent.system_prompt ?? '',
    tone: agent.personality?.tone ?? 'professional',
    specialNotes: agent.personality?.specialNotes ?? '',
  })

  const { mutate: saveAgent, isPending } = useMutation({
    mutationFn: (updates) => agentService.updateAgent(agent.id, updates),
    onSuccess: (updated) => {
      setAgents(agents.map((a) => (a.id === updated.id ? updated : a)))
      queryClient.invalidateQueries(['agents'])
      onClose()
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    saveAgent({
      name: form.name.trim(),
      role: form.role.trim(),
      system_prompt: form.system_prompt.trim(),
      personality: {
        tone: form.tone,
        specialNotes: form.specialNotes.trim(),
      },
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* 이름 */}
      <div>
        <label className="text-xs text-white/50 mb-1 block">이름</label>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full bg-surface-800 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-brand-500/60"
          required
        />
      </div>

      {/* 역할 */}
      <div>
        <label className="text-xs text-white/50 mb-1 block">역할</label>
        <input
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="w-full bg-surface-800 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-brand-500/60"
        />
      </div>

      {/* 시스템 프롬프트 */}
      <div>
        <label className="text-xs text-white/50 mb-1 block">시스템 프롬프트</label>
        <textarea
          value={form.system_prompt}
          onChange={(e) => setForm({ ...form, system_prompt: e.target.value })}
          rows={4}
          className="w-full bg-surface-800 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-brand-500/60 resize-none"
        />
      </div>

      {/* 말투 */}
      <div>
        <label className="text-xs text-white/50 mb-1 block">말투</label>
        <select
          value={form.tone}
          onChange={(e) => setForm({ ...form, tone: e.target.value })}
          className="w-full bg-surface-800 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-brand-500/60"
        >
          <option value="professional">전문적</option>
          <option value="friendly">친근한</option>
          <option value="formal">격식체</option>
          <option value="casual">캐주얼</option>
          <option value="concise">간결한</option>
        </select>
      </div>

      {/* 특이사항 */}
      <div>
        <label className="text-xs text-white/50 mb-1 block">특이사항 (선택)</label>
        <input
          value={form.specialNotes}
          onChange={(e) => setForm({ ...form, specialNotes: e.target.value })}
          placeholder="예: 항상 숫자 근거를 포함하세요"
          className="w-full bg-surface-800 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-brand-500/60"
        />
      </div>

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
          disabled={isPending || !form.name.trim()}
          className="flex-1 py-2 text-sm font-bold bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors disabled:opacity-30"
        >
          {isPending ? '저장 중...' : '저장'}
        </button>
      </div>
    </form>
  )
}

// ── 메인 모달 ────────────────────────────────────────────
export default function AgentDetailModal({ agentId, onClose }) {
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)

  const { agents } = useAgentStore()
  const agent = agents.find((a) => a.id === agentId)

  // 에이전트가 없으면 모달 닫기
  useEffect(() => {
    if (!agent) onClose()
  }, [agent, onClose])

  if (!agent) return null

  const statusColor = getStatusColor(agent.status)
  const totalTokens = (agent.stats?.total_input_tokens ?? 0) + (agent.stats?.total_output_tokens ?? 0)

  return (
    <AnimatePresence>
      {/* 배경 오버레이 */}
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 z-40"
      />

      {/* 모달 */}
      <motion.div
        key="modal"
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
      >
        <div
          className="w-[480px] max-h-[80vh] panel border border-surface-700 rounded-2xl flex flex-col overflow-hidden pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="p-4 border-b border-surface-700 flex-shrink-0">
            <div className="flex items-center gap-3">
              {/* 아바타 */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0"
                style={{ backgroundColor: statusColor + '25', color: statusColor }}
              >
                {agent.name.slice(0, 2)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white truncate">{agent.name}</h2>
                  <span
                    className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: statusColor + '25', color: statusColor }}
                  >
                    {getStatusLabel(agent.status)}
                  </span>
                </div>
                <p className="text-sm text-white/40 truncate">{agent.role}</p>
              </div>

              <button
                onClick={onClose}
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-surface-700 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* 통계 */}
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { label: '완료 작업', value: agent.stats?.tasks_completed ?? 0 },
                { label: '능력 카드', value: (agent.abilities ?? []).length },
                { label: '총 토큰', value: formatTokens(totalTokens) },
              ].map(({ label, value }) => (
                <div key={label} className="bg-surface-800 rounded-lg p-2 text-center">
                  <div className="text-sm font-bold text-white">{value}</div>
                  <div className="text-xs text-white/30">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 탭 */}
          <div className="flex border-b border-surface-700 flex-shrink-0">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setIsEditing(false) }}
                className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-brand-400 border-b-2 border-brand-400'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 탭 콘텐츠 */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'profile' && (
              isEditing ? (
                <ProfileEditor agent={agent} onClose={() => setIsEditing(false)} />
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-white/40 mb-1">시스템 프롬프트</div>
                    <p className="text-sm text-white/70 leading-relaxed bg-surface-800 rounded-lg p-3">
                      {agent.system_prompt || <span className="text-white/20 italic">없음</span>}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-white/40 mb-1">말투</div>
                      <div className="text-sm text-white bg-surface-800 rounded-lg px-3 py-2">
                        {agent.personality?.tone ?? 'professional'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-white/40 mb-1">특이사항</div>
                      <div className="text-sm text-white/70 bg-surface-800 rounded-lg px-3 py-2 truncate">
                        {agent.personality?.specialNotes || <span className="text-white/20 italic">없음</span>}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full py-2 text-sm text-brand-400 border border-brand-500/30 rounded-lg hover:bg-brand-500/10 transition-colors"
                  >
                    편집
                  </button>
                </div>
              )
            )}

            {activeTab === 'abilities' && (
              <EquippedAbilities agent={agent} />
            )}

            {activeTab === 'memory' && (
              <MemoryBrowser agentId={agent.id} />
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
