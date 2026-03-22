import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { jsonStorage } from '../lib/storage'

export interface Notificacao {
  id: string
  tipo: 'feedback' | 'treino_concluido' | 'reset_senha' | 'novo_aluno' | 'vencimento'
  titulo: string
  mensagem: string
  alunoId?: string
  alunoNome?: string
  referencia?: string
  lida: boolean
  criadoEm: string
}

interface NotificacoesState {
  notificacoes: Notificacao[]

  addNotificacao: (data: Omit<Notificacao, 'id' | 'criadoEm' | 'lida'>) => void
  marcarLida: (id: string) => void
  marcarTodasLidas: () => void
  deleteNotificacao: (id: string) => void
  getNaoLidas: () => number
}

export const useNotificacoesStore = create<NotificacoesState>()(
  persist(
    (set, get) => ({
      notificacoes: [],

      addNotificacao: (data) => {
        const nova: Notificacao = {
          ...data,
          id: crypto.randomUUID(),
          lida: false,
          criadoEm: new Date().toISOString(),
        }
        set((s) => ({ notificacoes: [nova, ...s.notificacoes] }))
      },

      marcarLida: (id) => {
        set((s) => ({
          notificacoes: s.notificacoes.map((n) =>
            n.id === id ? { ...n, lida: true } : n
          ),
        }))
      },

      marcarTodasLidas: () => {
        set((s) => ({
          notificacoes: s.notificacoes.map((n) => ({ ...n, lida: true })),
        }))
      },

      deleteNotificacao: (id) => {
        set((s) => ({
          notificacoes: s.notificacoes.filter((n) => n.id !== id),
        }))
      },

      getNaoLidas: () => {
        return get().notificacoes.filter((n) => !n.lida).length
      },
    }),
    {
      name: 'grings-notificacoes',
      storage: createJSONStorage(() => jsonStorage),
      partialize: (state) => ({ notificacoes: state.notificacoes }),
    }
  )
)
