import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { jsonStorage } from '../lib/storage'
import type { ConquistaDesbloqueada, EstatisticasAluno } from '../types/gamificacao'
import { CONQUISTAS } from '../types/gamificacao'

interface GamificacaoState {
  desbloqueadas: ConquistaDesbloqueada[]
  streaks: Record<string, { atual: number; maior: number; ultimoDia: string }>

  verificarConquistas: (alunoId: string, stats: EstatisticasAluno) => string[]
  registrarStreak: (alunoId: string, data: string) => void
  getStreak: (alunoId: string) => { atual: number; maior: number }
  getConquistasAluno: (alunoId: string) => ConquistaDesbloqueada[]
}

export const useGamificacaoStore = create<GamificacaoState>()(
  persist(
    (set, get) => ({
      desbloqueadas: [],
      streaks: {},

      verificarConquistas: (alunoId, stats) => {
        const jaDesbloqueadas = get().desbloqueadas
          .filter((d) => d.alunoId === alunoId)
          .map((d) => d.conquistaId)

        const novas: string[] = []

        for (const conquista of CONQUISTAS) {
          if (jaDesbloqueadas.includes(conquista.id)) continue
          if (conquista.condicao(stats)) {
            novas.push(conquista.id)
          }
        }

        if (novas.length > 0) {
          const now = new Date().toISOString()
          set((s) => ({
            desbloqueadas: [
              ...s.desbloqueadas,
              ...novas.map((id) => ({
                conquistaId: id,
                alunoId,
                desbloqueadaEm: now,
              })),
            ],
          }))
        }

        return novas
      },

      registrarStreak: (alunoId, data) => {
        const streaks = { ...get().streaks }
        const current = streaks[alunoId] ?? { atual: 0, maior: 0, ultimoDia: '' }

        const hoje = new Date(data)
        const ultimo = current.ultimoDia ? new Date(current.ultimoDia) : null

        if (ultimo) {
          const diff = Math.floor(
            (hoje.getTime() - ultimo.getTime()) / (1000 * 60 * 60 * 24)
          )
          if (diff === 1) {
            current.atual += 1
          } else if (diff > 1) {
            current.atual = 1
          }
          // same day = no change
        } else {
          current.atual = 1
        }

        current.maior = Math.max(current.maior, current.atual)
        current.ultimoDia = data
        streaks[alunoId] = current

        set({ streaks })
      },

      getStreak: (alunoId) => {
        const s = get().streaks[alunoId]
        return s ? { atual: s.atual, maior: s.maior } : { atual: 0, maior: 0 }
      },

      getConquistasAluno: (alunoId) =>
        get().desbloqueadas.filter((d) => d.alunoId === alunoId),
    }),
    { name: 'grings-gamificacao', storage: createJSONStorage(() => jsonStorage) }
  )
)
