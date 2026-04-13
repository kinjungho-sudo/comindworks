import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { DndContext, DragOverlay, pointerWithin } from '@dnd-kit/core'
import { useDroppable } from '@dnd-kit/core'
import TopBar from './TopBar'
import LeftPanel from './LeftPanel'
import RightPanel from './RightPanel'
import CommandBar from './CommandBar'
import OfficeCanvas from '../office/OfficeCanvas'
import OnboardingWizard from '../onboarding/OnboardingWizard'
import { useOfficeStore } from '../../stores/useOfficeStore'
import { useAgentStore } from '../../stores/useAgentStore'
import { useAbilityStore } from '../../stores/useAbilityStore'
import { officeService } from '../../services/officeService'
import { agentService } from '../../services/agentService'
import { getCategoryColor } from '../../lib/utils'
import { useRealtimeSync } from '../../hooks/useRealtimeSync'

// 중앙 캔버스 영역 드롭존
function OfficeDropZone({ children }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'agent-drop-zone' })
  return (
    <div
      ref={setNodeRef}
      className="flex-1 relative overflow-hidden transition-all"
      style={{ outline: isOver ? '2px solid rgba(77,120,255,0.6)' : '2px solid transparent' }}
    >
      {isOver && (
        <div className="absolute inset-0 bg-brand-500/10 pointer-events-none z-10 flex items-center justify-center">
          <span className="text-brand-400 text-sm font-bold bg-surface-900/80 px-4 py-2 rounded-lg">
            선택된 에이전트에게 능력 부여
          </span>
        </div>
      )}
      {children}
    </div>
  )
}

export default function MainLayout() {
  const { currentOffice, setOffices, setCurrentOffice } = useOfficeStore()
  const { setAgents, selectAgent, getSelectedAgent, addAbilityToAgent } = useAgentStore()
  const { abilities, draggingAbility, setDraggingAbility, clearDragging } = useAbilityStore()
  const queryClient = useQueryClient()

  const { data: officesData } = useQuery({
    queryKey: ['offices'],
    queryFn: officeService.getOffices,
  })

  useEffect(() => {
    if (officesData) {
      setOffices(officesData)
      if (officesData.length > 0 && !currentOffice) {
        setCurrentOffice(officesData[0])
      }
    }
  }, [officesData, currentOffice, setOffices, setCurrentOffice])

  const { data: agentsData } = useQuery({
    queryKey: ['agents', currentOffice?.id],
    queryFn: () => agentService.getAgents(currentOffice.id),
    enabled: !!currentOffice?.id,
  })

  useEffect(() => {
    if (agentsData) setAgents(agentsData)
  }, [agentsData, setAgents])

  // Supabase Realtime 구독 (에이전트/작업 상태 실시간 반영)
  useRealtimeSync(currentOffice?.id)

  // 드래그 앤 드롭 핸들러
  const handleDragStart = ({ active }) => {
    const ability = abilities.find((a) => a.id === active.id)
    if (ability) setDraggingAbility(ability)
  }

  const handleDragEnd = async ({ active, over }) => {
    clearDragging()
    if (over?.id !== 'agent-drop-zone') return

    const agent = getSelectedAgent()
    if (!agent) return

    const ability = abilities.find((a) => a.id === active.id)
    if (!ability) return
    if (agent.abilities?.some((a) => a.ability_id === ability.id)) return

    try {
      const abilityEntry = {
        ability_id: ability.id,
        name: ability.name,
        category: ability.category,
        assigned_at: new Date().toISOString(),
      }
      await agentService.addAbility(agent.id, abilityEntry)
      addAbilityToAgent(agent.id, abilityEntry)
      queryClient.invalidateQueries(['agents'])
    } catch (err) {
      console.error('능력 카드 부여 실패:', err)
    }
  }

  // 온보딩 체크
  if (officesData && officesData.length === 0) {
    return <OnboardingWizard />
  }

  return (
    <DndContext
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-screen bg-surface-900 overflow-hidden">
        <TopBar />

        <div className="flex flex-1 overflow-hidden">
          <LeftPanel />

          <OfficeDropZone>
            {currentOffice && (
              <OfficeCanvas
                officeId={currentOffice.id}
                onAgentClick={(agentId) => selectAgent(agentId)}
              />
            )}
          </OfficeDropZone>

          <RightPanel />
        </div>

        <CommandBar />
      </div>

      {/* 드래그 중 떠다니는 카드 미리보기 */}
      <DragOverlay>
        {draggingAbility && (
          <div
            className="px-3 py-2 rounded-lg text-xs font-bold shadow-xl pointer-events-none"
            style={{
              backgroundColor: getCategoryColor(draggingAbility.category) + '33',
              border: `1px solid ${getCategoryColor(draggingAbility.category)}80`,
              color: getCategoryColor(draggingAbility.category),
            }}
          >
            {draggingAbility.name}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
