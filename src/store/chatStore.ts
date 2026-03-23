import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { jsonStorage } from '../lib/storage'
import type { Mensagem, Conversa } from '../types/chat'

interface ChatState {
  conversas: Conversa[]
  mensagens: Mensagem[]

  getOrCreateConversa: (alunoId: string, alunoNome: string) => Conversa
  enviarMensagem: (
    conversaId: string,
    conteudo: string,
    remetente: 'admin' | 'aluno',
    remetenteNome: string
  ) => void
  getMensagens: (conversaId: string) => Mensagem[]
  marcarLidas: (conversaId: string, leitor: 'admin' | 'aluno') => void
  getTotalNaoLidas: (leitor: 'admin' | 'aluno') => number
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversas: [],
      mensagens: [],

      getOrCreateConversa: (alunoId, alunoNome) => {
        const existente = get().conversas.find((c) => c.alunoId === alunoId)
        if (existente) return existente

        const nova: Conversa = {
          id: crypto.randomUUID(),
          alunoId,
          alunoNome,
          ultimaAtividade: new Date().toISOString(),
          naoLidasAdmin: 0,
          naoLidasAluno: 0,
        }

        set((s) => ({ conversas: [...s.conversas, nova] }))
        return nova
      },

      enviarMensagem: (conversaId, conteudo, remetente, remetenteNome) => {
        const msg: Mensagem = {
          id: crypto.randomUUID(),
          conversaId,
          remetente,
          remetenteNome,
          conteudo,
          tipo: 'texto',
          lida: false,
          criadoEm: new Date().toISOString(),
        }

        set((s) => ({
          mensagens: [...s.mensagens, msg],
          conversas: s.conversas.map((c) =>
            c.id === conversaId
              ? {
                  ...c,
                  ultimaMensagem: conteudo,
                  ultimaAtividade: msg.criadoEm,
                  naoLidasAdmin: remetente === 'aluno' ? c.naoLidasAdmin + 1 : c.naoLidasAdmin,
                  naoLidasAluno: remetente === 'admin' ? c.naoLidasAluno + 1 : c.naoLidasAluno,
                }
              : c
          ),
        }))
      },

      getMensagens: (conversaId) =>
        get()
          .mensagens.filter((m) => m.conversaId === conversaId)
          .sort((a, b) => new Date(a.criadoEm).getTime() - new Date(b.criadoEm).getTime()),

      marcarLidas: (conversaId, leitor) => {
        set((s) => ({
          mensagens: s.mensagens.map((m) =>
            m.conversaId === conversaId && m.remetente !== leitor
              ? { ...m, lida: true }
              : m
          ),
          conversas: s.conversas.map((c) =>
            c.id === conversaId
              ? {
                  ...c,
                  ...(leitor === 'admin' ? { naoLidasAdmin: 0 } : { naoLidasAluno: 0 }),
                }
              : c
          ),
        }))
      },

      getTotalNaoLidas: (leitor) =>
        get().conversas.reduce(
          (sum, c) => sum + (leitor === 'admin' ? c.naoLidasAdmin : c.naoLidasAluno),
          0
        ),
    }),
    { name: 'grings-chat', storage: createJSONStorage(() => jsonStorage) }
  )
)
