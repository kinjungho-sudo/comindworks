import { create } from 'zustand'

export const useAgentStore = create((set, get) => ({
  agents: [],
  selectedAgentId: null,

  setAgents: (agents) => set({ agents }),

  selectAgent: (id) => set({ selectedAgentId: id }),

  getSelectedAgent: () => {
    const { agents, selectedAgentId } = get()
    return agents.find((a) => a.id === selectedAgentId) ?? null
  },

  updateAgentStatus: (id, status) => set((state) => ({
    agents: state.agents.map((a) => a.id === id ? { ...a, status } : a),
  })),

  updateAgentPosition: (id, x, y) => set((state) => ({
    agents: state.agents.map((a) =>
      a.id === id ? { ...a, position_x: x, position_y: y } : a
    ),
  })),

  addAbilityToAgent: (agentId, ability) => set((state) => ({
    agents: state.agents.map((a) =>
      a.id === agentId
        ? { ...a, abilities: [...a.abilities, ability] }
        : a
    ),
  })),

  removeAbilityFromAgent: (agentId, abilityId) => set((state) => ({
    agents: state.agents.map((a) =>
      a.id === agentId
        ? { ...a, abilities: a.abilities.filter((ab) => ab.ability_id !== abilityId) }
        : a
    ),
  })),

  addAgent: (agent) => set((state) => ({ agents: [...state.agents, agent] })),

  removeAgent: (agentId) => set((state) => ({
    agents: state.agents.filter((a) => a.id !== agentId),
    selectedAgentId: state.selectedAgentId === agentId ? null : state.selectedAgentId,
  })),
}))
