import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { SessaoTreino, SerieRegistrada } from '../types'
import { jsonStorage } from '../lib/storage'
import { useFrequenciaStore } from './frequenciaStore'

interface CronometroState {
  sessaoAtiva: SessaoTreino | null
  segundosDecorridos: number
  pausado: boolean

  iniciarTreino: (alunoId: string, alunoNome: string, treinoId: string, treinoNome: string, totalExercicios: number) => void
  pausar: () => void
  retomar: () => void
  tick: () => void
  registrarSerie: (exercicioId: string, exercicioNome: string, serie: SerieRegistrada) => void
  marcarExercicioConcluido: () => void
  setSensacao: (s: 1 | 2 | 3 | 4 | 5) => void
  encerrarTreino: () => void
}

export const useCronometroStore = create<CronometroState>()(
  persist(
    (set, get) => ({
      sessaoAtiva: null,
      segundosDecorridos: 0,
      pausado: false,

      iniciarTreino: (alunoId, alunoNome, treinoId, treinoNome, totalExercicios) => {
        const agora = new Date()

        const sessao: SessaoTreino = {
          id: crypto.randomUUID(),
          alunoId,
          alunoNome,
          treinoId,
          treinoNome,
          dataInicio: agora.toISOString(),
          status: 'ativa',
          exerciciosConcluidos: 0,
          totalExercicios,
          cargas: [],
        }

        set({ sessaoAtiva: sessao, segundosDecorridos: 0, pausado: false })

        // Auto-register frequência
        const diaSemana = agora.toLocaleDateString('pt-BR', { weekday: 'long' })
        useFrequenciaStore.getState().addRegistro({
          alunoId,
          alunoNome,
          data: agora.toISOString().split('T')[0],
          hora: agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          diaSemana,
          tipo: 'presencial',
          treinoId,
          treinoNome,
          sessaoId: sessao.id,
        })
      },

      pausar: () => set({ pausado: true }),
      retomar: () => set({ pausado: false }),

      tick: () => {
        const { pausado } = get()
        if (!pausado) {
          set((s) => ({ segundosDecorridos: s.segundosDecorridos + 1 }))
        }
      },

      registrarSerie: (exercicioId, exercicioNome, serie) => {
        set((s) => {
          if (!s.sessaoAtiva) return s
          const cargas = [...s.sessaoAtiva.cargas]
          const existingIdx = cargas.findIndex((c) => c.exercicioId === exercicioId)

          if (existingIdx >= 0) {
            const existing = cargas[existingIdx]
            const series = existing.series.filter((sr) => sr.numeroSerie !== serie.numeroSerie)
            cargas[existingIdx] = { ...existing, series: [...series, serie] }
          } else {
            cargas.push({ exercicioId, exercicioNome, series: [serie] })
          }

          return { sessaoAtiva: { ...s.sessaoAtiva, cargas } }
        })
      },

      marcarExercicioConcluido: () => {
        set((s) => {
          if (!s.sessaoAtiva) return s
          return {
            sessaoAtiva: {
              ...s.sessaoAtiva,
              exerciciosConcluidos: Math.min(s.sessaoAtiva.exerciciosConcluidos + 1, s.sessaoAtiva.totalExercicios),
            },
          }
        })
      },

      setSensacao: (sensacao) => {
        set((s) => {
          if (!s.sessaoAtiva) return s
          return { sessaoAtiva: { ...s.sessaoAtiva, sensacao } }
        })
      },

      encerrarTreino: () => {
        const { sessaoAtiva, segundosDecorridos } = get()
        if (!sessaoAtiva) return

        // Update frequência with duration
        const duracaoMinutos = Math.floor(segundosDecorridos / 60)
        const { registros } = useFrequenciaStore.getState()
        const freq = registros.find((r) => r.sessaoId === sessaoAtiva.id)
        if (freq) {
          useFrequenciaStore.getState().updateRegistro(freq.id, { duracaoMinutos })
        }

        set({ sessaoAtiva: null, segundosDecorridos: 0, pausado: false })
      },
    }),
    {
      name: 'grings-cronometro',
      storage: createJSONStorage(() => jsonStorage),
      partialize: (state) => ({
        sessaoAtiva: state.sessaoAtiva,
        segundosDecorridos: state.segundosDecorridos,
        pausado: state.pausado,
      }),
    }
  )
)
