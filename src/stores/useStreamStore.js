import { create } from 'zustand'

export const useStreamStore = create((set) => ({
  isStreaming: false,
  streamTaskId: null,
  eventSource: null,

  startStream: (taskId, eventSource) => set({
    isStreaming: true,
    streamTaskId: taskId,
    eventSource,
  }),

  stopStream: () => set((state) => {
    state.eventSource?.close()
    return { isStreaming: false, streamTaskId: null, eventSource: null }
  }),
}))
