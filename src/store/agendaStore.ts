import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { jsonStorage } from '../lib/storage'

export type TipoEvento = 'chamada' | 'vencimento_plano' | 'lembrete_lead' | 'tarefa' | 'outro'
export type StatusEvento = 'pendente' | 'concluido' | 'cancelado'

export interface EventoAgenda {
  id: string
  titulo: string
  descricao?: string
  tipo: TipoEvento
  status: StatusEvento
  data: string        // ISO date string (YYYY-MM-DD)
  horario?: string    // HH:mm
  alunoId?: string
  leadId?: string
  tarefaId?: string
  cor?: string
  criadoEm: string
}

interface AgendaState {
  eventos: EventoAgenda[]
  addEvento: (ev: Omit<EventoAgenda, 'id' | 'criadoEm'>) => void
  updateEvento: (id: string, data: Partial<EventoAgenda>) => void
  deleteEvento: (id: string) => void
  concluirEvento: (id: string) => void
  getEventosPorData: (data: string) => EventoAgenda[]
}

export const useAgendaStore = create<AgendaState>()(
  persist(
    (set, get) => ({
      eventos: [],

      addEvento: (ev) => {
        set((s) => ({
          eventos: [
            ...s.eventos,
            { ...ev, id: crypto.randomUUID(), criadoEm: new Date().toISOString() },
          ],
        }))
      },

      updateEvento: (id, data) => {
        set((s) => ({
          eventos: s.eventos.map((e) => (e.id === id ? { ...e, ...data } : e)),
        }))
      },

      deleteEvento: (id) => {
        set((s) => ({ eventos: s.eventos.filter((e) => e.id !== id) }))
      },

      concluirEvento: (id) => {
        set((s) => ({
          eventos: s.eventos.map((e) =>
            e.id === id ? { ...e, status: 'concluido' as const } : e
          ),
        }))
      },

      getEventosPorData: (data) => get().eventos.filter((e) => e.data === data),
    }),
    {
      name: 'grings-agenda',
      storage: createJSONStorage(() => jsonStorage),
      partialize: (state) => ({ eventos: state.eventos }),
    }
  )
)
