import { useQuery } from '@tanstack/react-query'
import AgentList from '../agents/AgentList'
import AbilityCardInventory from '../abilities/AbilityCardInventory'
import { abilityService } from '../../services/abilityService'
import { useAbilityStore } from '../../stores/useAbilityStore'
import { useEffect } from 'react'

export default function LeftPanel() {
  const { setAbilities } = useAbilityStore()

  const { data: abilities } = useQuery({
    queryKey: ['abilities'],
    queryFn: () => abilityService.getAbilities(),
  })

  useEffect(() => {
    if (abilities) setAbilities(abilities)
  }, [abilities, setAbilities])

  return (
    <aside className="w-[280px] panel border-r border-surface-700 flex flex-col overflow-hidden flex-shrink-0">
      {/* 에이전트 목록 */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 pb-1">
          <span className="section-label">에이전트</span>
        </div>
        <AgentList />
      </div>

      {/* 능력 카드 인벤토리 */}
      <div className="border-t border-surface-700 max-h-64 overflow-y-auto">
        <div className="p-3 pb-1">
          <span className="section-label">능력 카드</span>
        </div>
        <AbilityCardInventory />
      </div>
    </aside>
  )
}
