import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Tarefa } from '../types'
import { jsonStorage } from '../lib/storage'

interface TarefasState {
  tarefas: Tarefa[]
  addTarefa: (data: Omit<Tarefa, 'id' | 'criadoEm' | 'atualizadoEm'>) => void
  updateTarefa: (id: string, data: Partial<Tarefa>) => void
  updateProgresso: (id: string, progresso: number) => void
  deleteTarefa: (id: string) => void
}

export const useTarefasStore = create<TarefasState>()(
  persist(
    (set) => ({
      tarefas: [],

      addTarefa: (data) => {
        const now = new Date().toISOString()
        const newTarefa: Tarefa = {
          ...data,
          id: crypto.randomUUID(),
          criadoEm: now,
          atualizadoEm: now,
        }
        set((state) => ({ tarefas: [newTarefa, ...state.tarefas] }))
      },

      updateTarefa: (id, data) => {
        set((state) => ({
          tarefas: state.tarefas.map((t) =>
            t.id === id ? { ...t, ...data, atualizadoEm: new Date().toISOString() } : t
          ),
        }))
      },

      updateProgresso: (id, progresso) => {
        const clamped = Math.max(0, Math.min(100, progresso))
        let status: Tarefa['status']
        if (clamped === 100) status = 'concluida'
        else if (clamped > 0) status = 'em_progresso'
        else status = 'a_fazer'

        set((state) => ({
          tarefas: state.tarefas.map((t) =>
            t.id === id
              ? { ...t, progresso: clamped, status, atualizadoEm: new Date().toISOString() }
              : t
          ),
        }))
      },

      deleteTarefa: (id) => {
        set((state) => ({ tarefas: state.tarefas.filter((t) => t.id !== id) }))
      },
    }),
    {
      name: 'grings-tarefas',
      storage: createJSONStorage(() => jsonStorage),
      partialize: (state) => ({ tarefas: state.tarefas }),
    }
  )
)
