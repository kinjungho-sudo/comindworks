import AbilityCard from './AbilityCard'
import { useAbilityStore } from '../../stores/useAbilityStore'
import { useAgentStore } from '../../stores/useAgentStore'

export default function AbilityCardInventory() {
  const { abilities } = useAbilityStore()
  const { getSelectedAgent } = useAgentStore()
  const selectedAgent = getSelectedAgent()

  if (abilities.length === 0) {
    return <div className="p-4 text-white/20 text-xs text-center">능력 카드 로딩 중...</div>
  }

  return (
    <div className="p-2 space-y-1">
      {!selectedAgent && (
        <p className="text-white/30 text-xs text-center py-1">
          에이전트를 선택 후 카드를 오피스로 드래그하세요
        </p>
      )}
      {abilities.map((ability) => {
        const alreadyAssigned = selectedAgent?.abilities?.some((a) => a.ability_id === ability.id)
        return (
          <AbilityCard
            key={ability.id}
            ability={ability}
            disabled={alreadyAssigned}
          />
        )
      })}
    </div>
  )
}
