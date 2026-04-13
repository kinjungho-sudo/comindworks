import { create } from 'zustand'

export const useTaskStore = create((set, get) => ({
  tasks: [],
  currentTask: null,
  thinkingLog: [],
  pendingApproval: null,

  addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),

  setCurrentTask: (task) => set({
    currentTask: task,
    // 저장된 thinking_log가 있으면 복원, 없으면 초기화
    thinkingLog: (task?.thinking_log ?? []).map((step, i) => ({ ...step, id: step.id ?? i })),
  }),

  appendThinkingStep: (step) => set((state) => ({
    thinkingLog: [...state.thinkingLog, { ...step, id: Date.now() }],
  })),

  completeTask: (taskId, result) => set((state) => ({
    tasks: state.tasks.map((t) =>
      t.id === taskId ? { ...t, status: 'completed', result } : t
    ),
    currentTask: state.currentTask?.id === taskId
      ? { ...state.currentTask, status: 'completed', result }
      : state.currentTask,
  })),

  failTask: (taskId, error) => set((state) => ({
    tasks: state.tasks.map((t) =>
      t.id === taskId ? { ...t, status: 'failed', error } : t
    ),
    currentTask: state.currentTask?.id === taskId
      ? { ...state.currentTask, status: 'failed', error }
      : state.currentTask,
  })),

  setPendingApproval: (data) => set({ pendingApproval: data }),

  clearPendingApproval: () => set({ pendingApproval: null }),

  updateTaskStatus: (taskId, status) => set((state) => ({
    tasks: state.tasks.map((t) => t.id === taskId ? { ...t, status } : t),
  })),
}))
