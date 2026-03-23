import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { jsonStorage } from '../lib/storage'
import type { MedidaCorporal } from '../types/medidas'

interface MedidasState {
  medidas: MedidaCorporal[]
  addMedida: (medida: Omit<MedidaCorporal, 'id'>) => void
  updateMedida: (id: string, data: Partial<MedidaCorporal>) => void
  deleteMedida: (id: string) => void
  getMedidasByAluno: (alunoId: string) => MedidaCorporal[]
  getUltimaMedida: (alunoId: string) => MedidaCorporal | undefined
}

export const useMedidasStore = create<MedidasState>()(
  persist(
    (set, get) => ({
      medidas: [],

      addMedida: (medida) => {
        const imc =
          medida.peso && medida.altura
            ? +(medida.peso / (medida.altura * medida.altura)).toFixed(1)
            : undefined

        set((s) => ({
          medidas: [
            ...s.medidas,
            { ...medida, id: crypto.randomUUID(), imc },
          ],
        }))
      },

      updateMedida: (id, data) => {
        set((s) => ({
          medidas: s.medidas.map((m) => (m.id === id ? { ...m, ...data } : m)),
        }))
      },

      deleteMedida: (id) => {
        set((s) => ({ medidas: s.medidas.filter((m) => m.id !== id) }))
      },

      getMedidasByAluno: (alunoId) =>
        get()
          .medidas.filter((m) => m.alunoId === alunoId)
          .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()),

      getUltimaMedida: (alunoId) => {
        const medidas = get().getMedidasByAluno(alunoId)
        return medidas[0]
      },
    }),
    { name: 'grings-medidas', storage: createJSONStorage(() => jsonStorage) }
  )
)
