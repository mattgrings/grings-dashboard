import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { jsonStorage } from '../lib/storage'

export interface Feedback {
  id: string
  alunoId: string
  alunoNome: string
  sessaoId?: string
  tipo: 'pos_treino' | 'geral' | 'sugestao' | 'dificuldade'
  sensacao: 1 | 2 | 3 | 4 | 5
  mensagem: string
  lido: boolean
  criadoEm: string
}

interface FeedbackState {
  feedbacks: Feedback[]

  addFeedback: (data: Omit<Feedback, 'id' | 'criadoEm' | 'lido'>) => string
  marcarLido: (id: string) => void
  marcarTodosLidos: () => void
  deleteFeedback: (id: string) => void
  getByAluno: (alunoId: string) => Feedback[]
  getNaoLidos: () => number
}

export const useFeedbackStore = create<FeedbackState>()(
  persist(
    (set, get) => ({
      feedbacks: [],

      addFeedback: (data) => {
        const id = crypto.randomUUID()
        const novo: Feedback = {
          ...data,
          id,
          lido: false,
          criadoEm: new Date().toISOString(),
        }
        set((s) => ({ feedbacks: [novo, ...s.feedbacks] }))
        return id
      },

      marcarLido: (id) => {
        set((s) => ({
          feedbacks: s.feedbacks.map((f) =>
            f.id === id ? { ...f, lido: true } : f
          ),
        }))
      },

      marcarTodosLidos: () => {
        set((s) => ({
          feedbacks: s.feedbacks.map((f) => ({ ...f, lido: true })),
        }))
      },

      deleteFeedback: (id) => {
        set((s) => ({ feedbacks: s.feedbacks.filter((f) => f.id !== id) }))
      },

      getByAluno: (alunoId) => {
        return get()
          .feedbacks.filter((f) => f.alunoId === alunoId)
          .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
      },

      getNaoLidos: () => {
        return get().feedbacks.filter((f) => !f.lido).length
      },
    }),
    {
      name: 'grings-feedbacks',
      storage: createJSONStorage(() => jsonStorage),
      partialize: (state) => ({ feedbacks: state.feedbacks }),
    }
  )
)
