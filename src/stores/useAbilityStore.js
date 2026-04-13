import { create } from 'zustand'

export const useAbilityStore = create((set) => ({
  abilities: [],
  draggingAbility: null,

  setAbilities: (abilities) => set({ abilities }),
  setDraggingAbility: (ability) => set({ draggingAbility: ability }),
  clearDragging: () => set({ draggingAbility: null }),
}))
