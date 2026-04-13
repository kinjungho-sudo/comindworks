import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { officeService } from '../../services/officeService'
import { agentService } from '../../services/agentService'
import { useOfficeStore } from '../../stores/useOfficeStore'

const AVATAR_SPRITES = [
  { id: 'agent_default', label: '기본' },
  { id: 'agent_developer', label: '개발자' },
  { id: 'agent_marketer', label: '마케터' },
  { id: 'agent_analyst', label: '분석가' },
]

export default function OnboardingWizard() {
  const [step, setStep] = useState(1)
  const [officeName, setOfficeName] = useState('')
  const [agentName, setAgentName] = useState('')
  const [agentRole, setAgentRole] = useState('')
  const [agentSprite, setAgentSprite] = useState('agent_default')
  const [createdOffice, setCreatedOffice] = useState(null)

  const queryClient = useQueryClient()
  const { setCurrentOffice } = useOfficeStore()

  const { mutate: createOffice, isPending: creatingOffice } = useMutation({
    mutationFn: () => officeService.createOffice({ name: officeName }),
    onSuccess: (office) => {
      setCreatedOffice(office)
      setCurrentOffice(office)
      setStep(2)
    },
  })

  const { mutate: createAgent, isPending: creatingAgent } = useMutation({
    mutationFn: () => agentService.createAgent({
      officeId: createdOffice.id,
      name: agentName,
      role: agentRole,
      systemPrompt: `당신은 ${agentName}입니다. 역할: ${agentRole}. 사용자의 업무를 전문적으로 지원하세요.`,
      avatarSprite: agentSprite,
      positionX: 8,
      positionY: 7,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['offices'])
      queryClient.invalidateQueries(['agents'])
      setStep(3)
    },
  })

  return (
    <div className="flex items-center justify-center h-screen bg-surface-900">
      <div className="w-96 space-y-6">
        {/* 스텝 인디케이터 */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-8 h-1.5 rounded-full transition-colors ${
                s <= step ? 'bg-brand-500' : 'bg-surface-600'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: 오피스 이름 */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="panel rounded-2xl p-6 space-y-5"
            >
              <div>
                <div className="text-lg font-bold text-white mb-1">오피스를 만들어보세요</div>
                <div className="text-white/40 text-sm">당신의 AI 팀이 일할 가상 오피스입니다.</div>
              </div>

              <input
                type="text"
                placeholder="예: 정호의 본사"
                value={officeName}
                onChange={(e) => setOfficeName(e.target.value)}
                className="w-full bg-surface-700 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:ring-1 focus:ring-brand-500"
              />

              <button
                onClick={() => createOffice()}
                disabled={!officeName.trim() || creatingOffice}
                className="btn-primary w-full disabled:opacity-30"
              >
                {creatingOffice ? '생성 중...' : '오피스 만들기 →'}
              </button>
            </motion.div>
          )}

          {/* STEP 2: 첫 에이전트 */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="panel rounded-2xl p-6 space-y-5"
            >
              <div>
                <div className="text-lg font-bold text-white mb-1">첫 AI 에이전트를 고용하세요</div>
                <div className="text-white/40 text-sm">에이전트에게 이름과 역할을 부여합니다.</div>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="에이전트 이름 (예: 민수)"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="w-full bg-surface-700 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:ring-1 focus:ring-brand-500"
                />
                <input
                  type="text"
                  placeholder="역할 (예: 법무 분석가, 마케터)"
                  value={agentRole}
                  onChange={(e) => setAgentRole(e.target.value)}
                  className="w-full bg-surface-700 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:ring-1 focus:ring-brand-500"
                />

                {/* 아바타 선택 */}
                <div>
                  <div className="text-xs text-white/40 mb-2">아바타</div>
                  <div className="flex gap-2">
                    {AVATAR_SPRITES.map((sprite) => (
                      <button
                        key={sprite.id}
                        onClick={() => setAgentSprite(sprite.id)}
                        className={`flex-1 py-1.5 rounded-lg text-xs transition-colors ${
                          agentSprite === sprite.id
                            ? 'bg-brand-500 text-white'
                            : 'bg-surface-700 text-white/40 hover:text-white'
                        }`}
                      >
                        {sprite.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => createAgent()}
                disabled={!agentName.trim() || !agentRole.trim() || creatingAgent}
                className="btn-primary w-full disabled:opacity-30"
              >
                {creatingAgent ? '고용 중...' : '에이전트 고용하기 →'}
              </button>
            </motion.div>
          )}

          {/* STEP 3: 완료 */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="panel rounded-2xl p-6 space-y-5 text-center"
            >
              <div className="text-4xl">🎉</div>
              <div>
                <div className="text-lg font-bold text-white mb-1">준비됐습니다!</div>
                <div className="text-white/40 text-sm">
                  {agentName}이(가) 오피스에 출근했습니다.<br />
                  능력 카드를 드래그하여 능력을 부여하고<br />
                  작업을 지시해보세요.
                </div>
              </div>

              <button
                onClick={() => queryClient.invalidateQueries()}
                className="btn-primary w-full"
              >
                오피스로 이동 →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
