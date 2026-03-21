import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { RegistroFrequencia } from '../types'
import { jsonStorage } from '../lib/storage'

interface FrequenciaState {
  registros: RegistroFrequencia[]

  addRegistro: (data: Omit<RegistroFrequencia, 'id'>) => void
  updateRegistro: (id: string, data: Partial<RegistroFrequencia>) => void
  deleteRegistro: (id: string) => void
  getByAluno: (alunoId: string) => RegistroFrequencia[]
  getByData: (data: string) => RegistroFrequencia[]
}

export const useFrequenciaStore = create<FrequenciaState>()(
  persist(
    (set, get) => ({
      registros: [],

      addRegistro: (data) => {
        const novo: RegistroFrequencia = { ...data, id: crypto.randomUUID() }
        set((s) => ({ registros: [novo, ...s.registros] }))
      },

      updateRegistro: (id, data) => {
        set((s) => ({
          registros: s.registros.map((r) => (r.id === id ? { ...r, ...data } : r)),
        }))
      },

      deleteRegistro: (id) => {
        set((s) => ({ registros: s.registros.filter((r) => r.id !== id) }))
      },

      getByAluno: (alunoId) => {
        return get().registros.filter((r) => r.alunoId === alunoId).sort((a, b) => b.data.localeCompare(a.data))
      },

      getByData: (data) => {
        return get().registros.filter((r) => r.data === data)
      },
    }),
    {
      name: 'grings-frequencia',
      storage: createJSONStorage(() => jsonStorage),
      partialize: (state) => ({ registros: state.registros }),
    }
  )
)
