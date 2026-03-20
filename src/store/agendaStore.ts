import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { jsonStorage } from '../lib/storage'

interface AgendaEvent {
  id: string
  titulo: string
  descricao?: string
  dataHora: Date
  duracao: number
  tipo: 'chamada' | 'tarefa' | 'outro'
  cor?: string
}

interface AgendaState {
  events: AgendaEvent[]
  selectedDate: Date
  setSelectedDate: (date: Date) => void
  addEvent: (event: Omit<AgendaEvent, 'id'>) => void
  removeEvent: (id: string) => void
}

export const useAgendaStore = create<AgendaState>()(
  persist(
    (set) => ({
      events: [],
      selectedDate: new Date(),

      setSelectedDate: (date) => set({ selectedDate: date }),

      addEvent: (data) => {
        const newEvent: AgendaEvent = {
          ...data,
          id: crypto.randomUUID(),
        }
        set((state) => ({ events: [...state.events, newEvent] }))
      },

      removeEvent: (id) => {
        set((state) => ({ events: state.events.filter((e) => e.id !== id) }))
      },
    }),
    {
      name: 'grings-agenda',
      storage: createJSONStorage(() => jsonStorage),
      partialize: (state) => ({ events: state.events }),
    }
  )
)
