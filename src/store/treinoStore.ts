import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { jsonStorage } from '../lib/storage'
import type { ExercicioBiblioteca } from '../data/exerciciosBiblioteca'

export interface ExercicioNoTreino {
  exercicioId: string
  exercicio: ExercicioBiblioteca
  series: number
  repeticoes: string
  descanso: string
  cargaSugerida?: number
  observacoes?: string
  ordem: number
}

export interface PlanoTreino {
  id: string
  alunoId: string
  nome: string
  descricao?: string
  diasSemana: number[]
  exercicios: ExercicioNoTreino[]
  ativo: boolean
  criadoEm: string
  atualizadoEm: string
}

interface TreinoState {
  planos: PlanoTreino[]
  exerciciosCustom: ExercicioBiblioteca[]
  addPlano: (plano: Omit<PlanoTreino, 'id' | 'criadoEm' | 'atualizadoEm'>) => void
  updatePlano: (id: string, data: Partial<PlanoTreino>) => void
  deletePlano: (id: string) => void
  getPlanosByAluno: (alunoId: string) => PlanoTreino[]
  addExercicioCustom: (ex: Omit<ExercicioBiblioteca, 'id' | 'criadoEm'>) => void
  updateExercicioCustom: (id: string, data: Partial<ExercicioBiblioteca>) => void
  deleteExercicioCustom: (id: string) => void
}

export const useTreinoStore = create<TreinoState>()(
  persist(
    (set, get) => ({
      planos: [],
      exerciciosCustom: [],

      addPlano: (plano) => {
        const now = new Date().toISOString()
        set((s) => ({
          planos: [
            ...s.planos,
            {
              ...plano,
              id: crypto.randomUUID(),
              criadoEm: now,
              atualizadoEm: now,
            },
          ],
        }))
      },

      updatePlano: (id, data) => {
        set((s) => ({
          planos: s.planos.map((p) =>
            p.id === id
              ? { ...p, ...data, atualizadoEm: new Date().toISOString() }
              : p
          ),
        }))
      },

      deletePlano: (id) => {
        set((s) => ({ planos: s.planos.filter((p) => p.id !== id) }))
      },

      getPlanosByAluno: (alunoId) => {
        return get().planos.filter((p) => p.alunoId === alunoId)
      },

      addExercicioCustom: (ex) => {
        set((s) => ({
          exerciciosCustom: [
            ...s.exerciciosCustom,
            {
              ...ex,
              id: `custom-${crypto.randomUUID().slice(0, 8)}`,
              criadoEm: new Date().toISOString(),
            },
          ],
        }))
      },

      updateExercicioCustom: (id, data) => {
        set((s) => ({
          exerciciosCustom: s.exerciciosCustom.map((ex) =>
            ex.id === id ? { ...ex, ...data } : ex
          ),
        }))
      },

      deleteExercicioCustom: (id) => {
        set((s) => ({
          exerciciosCustom: s.exerciciosCustom.filter((ex) => ex.id !== id),
        }))
      },
    }),
    {
      name: 'grings-treinos',
      storage: createJSONStorage(() => jsonStorage),
    }
  )
)
