import { create } from 'zustand'

export const useOfficeStore = create((set) => ({
  offices: [],
  currentOffice: null,

  setOffices: (offices) => set({ offices }),
  setCurrentOffice: (office) => set({ currentOffice: office }),
  updateOfficeLayout: (officeId, layoutConfig) => set((state) => ({
    offices: state.offices.map((o) =>
      o.id === officeId ? { ...o, layout_config: layoutConfig } : o
    ),
    currentOffice: state.currentOffice?.id === officeId
      ? { ...state.currentOffice, layout_config: layoutConfig }
      : state.currentOffice,
  })),
}))
