import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { jsonStorage } from '../lib/storage'
import type { PlanoTreinoCompleto, ExercicioCompleto } from '../types/treino'

interface PlanoTreinoState {
  planos: PlanoTreinoCompleto[]
  exerciciosCustom: ExercicioCompleto[]

  addPlano: (plano: Omit<PlanoTreinoCompleto, 'id' | 'criadoEm' | 'atualizadoEm'>) => void
  updatePlano: (id: string, data: Partial<PlanoTreinoCompleto>) => void
  deletePlano: (id: string) => void
  getPlanosByAluno: (alunoId: string) => PlanoTreinoCompleto[]
  getPlanoAtivo: (alunoId: string) => PlanoTreinoCompleto | undefined

  addExercicioCustom: (ex: Omit<ExercicioCompleto, 'id' | 'criadoEm'>) => void
  updateExercicioCustom: (id: string, data: Partial<ExercicioCompleto>) => void
  deleteExercicioCustom: (id: string) => void
}

export const usePlanoTreinoStore = create<PlanoTreinoState>()(
  persist(
    (set, get) => ({
      planos: [],
      exerciciosCustom: [],

      addPlano: (plano) => {
        const now = new Date().toISOString()
        set((s) => ({
          planos: [
            ...s.planos,
            { ...plano, id: crypto.randomUUID(), criadoEm: now, atualizadoEm: now },
          ],
        }))
      },

      updatePlano: (id, data) => {
        set((s) => ({
          planos: s.planos.map((p) =>
            p.id === id ? { ...p, ...data, atualizadoEm: new Date().toISOString() } : p
          ),
        }))
      },

      deletePlano: (id) => {
        set((s) => ({ planos: s.planos.filter((p) => p.id !== id) }))
      },

      getPlanosByAluno: (alunoId) => get().planos.filter((p) => p.alunoId === alunoId),

      getPlanoAtivo: (alunoId) =>
        get().planos.find((p) => p.alunoId === alunoId && p.ativo),

      addExercicioCustom: (ex) => {
        set((s) => ({
          exerciciosCustom: [
            ...s.exerciciosCustom,
            { ...ex, id: `custom-${crypto.randomUUID().slice(0, 8)}`, criadoEm: new Date().toISOString() },
          ],
        }))
      },

      updateExercicioCustom: (id, data) => {
        set((s) => ({
          exerciciosCustom: s.exerciciosCustom.map((ex) => (ex.id === id ? { ...ex, ...data } : ex)),
        }))
      },

      deleteExercicioCustom: (id) => {
        set((s) => ({ exerciciosCustom: s.exerciciosCustom.filter((ex) => ex.id !== id) }))
      },
    }),
    { name: 'grings-planos-treino', storage: createJSONStorage(() => jsonStorage) }
  )
)
