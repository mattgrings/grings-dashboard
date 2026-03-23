import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Lead } from '../types'
import { jsonStorage } from '../lib/storage'

interface LeadsState {
  leads: Lead[]
  addLead: (lead: Omit<Lead, 'id' | 'criadoEm' | 'atualizadoEm'>) => void
  updateLead: (id: string, data: Partial<Lead>) => void
  deleteLead: (id: string) => void
  getLeadById: (id: string) => Lead | undefined
}

export const useLeadsStore = create<LeadsState>()(
  persist(
    (set, get) => ({
      leads: [],

      addLead: (data) => {
        const newLead: Lead = {
          ...data,
          id: crypto.randomUUID(),
          criadoEm: new Date(),
          atualizadoEm: new Date(),
        }
        set((state) => ({ leads: [newLead, ...state.leads] }))
      },

      updateLead: (id, data) => {
        set((state) => ({
          leads: state.leads.map((lead) =>
            lead.id === id ? { ...lead, ...data, atualizadoEm: new Date() } : lead
          ),
        }))
      },

      deleteLead: (id) => {
        set((state) => ({ leads: state.leads.filter((lead) => lead.id !== id) }))
      },

      getLeadById: (id) => {
        return get().leads.find((lead) => lead.id === id)
      },
    }),
    {
      name: 'grings-leads',
      storage: createJSONStorage(() => jsonStorage),
      partialize: (state) => ({ leads: state.leads }),
    }
  )
)
