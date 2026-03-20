import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Chamada } from '../types'
import { useLeadsStore } from './leadsStore'
import { jsonStorage } from '../lib/storage'

interface ChamadasState {
  chamadas: Chamada[]
  addChamada: (data: Omit<Chamada, 'id' | 'lead' | 'criadoEm'>) => void
  updateChamada: (id: string, data: Partial<Chamada>) => void
  deleteChamada: (id: string) => void
}

function getLead(id: string) {
  return useLeadsStore.getState().leads.find((l) => l.id === id)
}

const now = new Date()
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

const mockChamadas: Chamada[] = [
  {
    id: 'c1',
    leadId: '1',
    lead: useLeadsStore.getState().leads.find((l) => l.id === '1')!,
    dataHora: new Date(today.getTime() + 10 * 60 * 60 * 1000),
    duracao: 30,
    status: 'agendada',
    notas: 'Primeira conversa sobre objetivos',
    criadoEm: new Date('2026-03-19T18:00:00'),
  },
  {
    id: 'c2',
    leadId: '3',
    lead: useLeadsStore.getState().leads.find((l) => l.id === '3')!,
    dataHora: new Date(today.getTime() + 14 * 60 * 60 * 1000),
    duracao: 45,
    status: 'agendada',
    notas: 'Indicação do João, mostrar planos',
    criadoEm: new Date('2026-03-19T09:00:00'),
  },
  {
    id: 'c3',
    leadId: '8',
    lead: useLeadsStore.getState().leads.find((l) => l.id === '8')!,
    dataHora: new Date(today.getTime() + 16 * 60 * 60 * 1000),
    duracao: 30,
    status: 'agendada',
    criadoEm: new Date('2026-03-20T08:30:00'),
  },
  {
    id: 'c4',
    leadId: '4',
    lead: useLeadsStore.getState().leads.find((l) => l.id === '4')!,
    dataHora: new Date(today.getTime() - 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000),
    duracao: 40,
    status: 'realizada',
    notas: 'Apresentou proposta trimestral. Fechou!',
    criadoEm: new Date('2026-03-18T08:00:00'),
  },
  {
    id: 'c5',
    leadId: '2',
    lead: useLeadsStore.getState().leads.find((l) => l.id === '2')!,
    dataHora: new Date(today.getTime() - 48 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000),
    duracao: 30,
    status: 'faltou',
    notas: 'Lead não atendeu, tentar remarcar',
    criadoEm: new Date('2026-03-17T10:00:00'),
  },
  {
    id: 'c6',
    leadId: '10',
    lead: useLeadsStore.getState().leads.find((l) => l.id === '10')!,
    dataHora: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000),
    duracao: 50,
    status: 'realizada',
    notas: 'Fechou plano mensal',
    criadoEm: new Date('2026-03-14T08:00:00'),
  },
  {
    id: 'c7',
    leadId: '6',
    lead: useLeadsStore.getState().leads.find((l) => l.id === '6')!,
    dataHora: new Date(today.getTime() + 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000),
    duracao: 30,
    status: 'agendada',
    notas: 'Primeiro contato',
    criadoEm: new Date('2026-03-20T09:00:00'),
  },
  {
    id: 'c8',
    leadId: '2',
    lead: useLeadsStore.getState().leads.find((l) => l.id === '2')!,
    dataHora: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000),
    duracao: 30,
    status: 'remarcada',
    notas: 'Remarcada após falta',
    criadoEm: new Date('2026-03-19T16:00:00'),
  },
]

export const useChamadasStore = create<ChamadasState>()(
  persist(
    (set) => ({
      chamadas: mockChamadas,

      addChamada: (data) => {
        const lead = getLead(data.leadId)
        if (!lead) return
        const newChamada: Chamada = {
          ...data,
          id: crypto.randomUUID(),
          lead,
          criadoEm: new Date(),
        }
        set((state) => ({ chamadas: [newChamada, ...state.chamadas] }))
      },

      updateChamada: (id, data) => {
        set((state) => ({
          chamadas: state.chamadas.map((c) => (c.id === id ? { ...c, ...data } : c)),
        }))
      },

      deleteChamada: (id) => {
        set((state) => ({ chamadas: state.chamadas.filter((c) => c.id !== id) }))
      },
    }),
    {
      name: 'grings-chamadas',
      storage: createJSONStorage(() => jsonStorage),
      partialize: (state) => ({ chamadas: state.chamadas }),
    }
  )
)
