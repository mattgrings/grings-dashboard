import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Conteudo, IdeiaPauta, StatusConteudo } from '../types'
import { jsonStorage } from '../lib/storage'

interface SocialState {
  conteudos: Conteudo[]
  ideias: IdeiaPauta[]

  addConteudo: (data: Omit<Conteudo, 'id' | 'criadoEm' | 'atualizadoEm'>) => void
  updateConteudo: (id: string, data: Partial<Conteudo>) => void
  moveConteudo: (id: string, status: StatusConteudo) => void
  deleteConteudo: (id: string) => void

  addIdeia: (data: Omit<IdeiaPauta, 'id' | 'criadoEm'>) => void
  deleteIdeia: (id: string) => void
  ideiaToConteudo: (ideiaId: string) => void
}

export const useSocialStore = create<SocialState>()(
  persist(
    (set, get) => ({
      conteudos: [],
      ideias: [],

      addConteudo: (data) => {
        const now = new Date().toISOString()
        const novo: Conteudo = { ...data, id: crypto.randomUUID(), criadoEm: now, atualizadoEm: now }
        set((s) => ({ conteudos: [novo, ...s.conteudos] }))
      },

      updateConteudo: (id, data) => {
        set((s) => ({
          conteudos: s.conteudos.map((c) =>
            c.id === id ? { ...c, ...data, atualizadoEm: new Date().toISOString() } : c
          ),
        }))
      },

      moveConteudo: (id, status) => {
        set((s) => ({
          conteudos: s.conteudos.map((c) =>
            c.id === id ? { ...c, status, atualizadoEm: new Date().toISOString() } : c
          ),
        }))
      },

      deleteConteudo: (id) => {
        set((s) => ({ conteudos: s.conteudos.filter((c) => c.id !== id) }))
      },

      addIdeia: (data) => {
        const nova: IdeiaPauta = { ...data, id: crypto.randomUUID(), criadoEm: new Date().toISOString() }
        set((s) => ({ ideias: [nova, ...s.ideias] }))
      },

      deleteIdeia: (id) => {
        set((s) => ({ ideias: s.ideias.filter((i) => i.id !== id) }))
      },

      ideiaToConteudo: (ideiaId) => {
        const ideia = get().ideias.find((i) => i.id === ideiaId)
        if (!ideia) return
        const now = new Date().toISOString()
        const conteudo: Conteudo = {
          id: crypto.randomUUID(),
          titulo: ideia.titulo,
          descricao: ideia.descricao,
          plataforma: ideia.plataformas[0] || 'instagram_feed',
          categoria: ideia.categoria,
          status: 'ideia',
          criadoEm: now,
          atualizadoEm: now,
        }
        set((s) => ({
          conteudos: [conteudo, ...s.conteudos],
          ideias: s.ideias.filter((i) => i.id !== ideiaId),
        }))
      },
    }),
    {
      name: 'grings-social',
      storage: createJSONStorage(() => jsonStorage),
      partialize: (state) => ({ conteudos: state.conteudos, ideias: state.ideias }),
    }
  )
)
