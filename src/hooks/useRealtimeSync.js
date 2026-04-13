import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAgentStore } from '../stores/useAgentStore'
import { useTaskStore } from '../stores/useTaskStore'

/**
 * Supabase Realtime 구독 훅
 * - agents 테이블: status 변경 즉시 반영
 * - tasks 테이블: status/result 변경 즉시 반영
 */
export function useRealtimeSync(officeId) {
  const queryClient = useQueryClient()
  const { updateAgentStatus } = useAgentStore()
  const { updateTaskStatus } = useTaskStore()

  // 채널 ref — cleanup 시 사용
  const channelRef = useRef(null)

  useEffect(() => {
    if (!officeId) return

    const channelName = `office-${officeId}`

    const channel = supabase
      .channel(channelName)
      // agents: UPDATE 이벤트
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'agents',
          filter: `office_id=eq.${officeId}`,
        },
        (payload) => {
          const updated = payload.new
          if (!updated?.id) return

          // Zustand store 즉시 갱신 (status만)
          if (updated.status) {
            updateAgentStatus(updated.id, updated.status)
          }

          // React Query 캐시 무효화 (전체 에이전트 재조회)
          queryClient.invalidateQueries({ queryKey: ['agents', officeId] })
        }
      )
      // tasks: INSERT + UPDATE 이벤트
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `office_id=eq.${officeId}`,
        },
        (payload) => {
          const updated = payload.new
          if (!updated?.id) return

          // Zustand store 상태 갱신
          if (updated.status) {
            updateTaskStatus(updated.id, updated.status)
          }

          // React Query 캐시 무효화
          queryClient.invalidateQueries({ queryKey: ['tasks'] })
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[Realtime] 구독 시작: ${channelName}`)
        }
        if (status === 'CHANNEL_ERROR') {
          console.warn(`[Realtime] 구독 오류: ${channelName}`)
        }
      })

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
        console.log(`[Realtime] 구독 해제: ${channelName}`)
      }
    }
  }, [officeId, queryClient, updateAgentStatus, updateTaskStatus])
}
