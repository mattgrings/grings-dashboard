import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { TreinoSemana, SerieRegistrada } from '../types'
import { jsonStorage } from '../lib/storage'

function getCurrentWeekId(): string {
  const now = new Date()
  const jan1 = new Date(now.getFullYear(), 0, 1)
  const days = Math.floor((now.getTime() - jan1.getTime()) / 86400000)
  const week = Math.ceil((days + jan1.getDay() + 1) / 7)
  return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`
}

function getPreviousWeekId(): string {
  const now = new Date()
  now.setDate(now.getDate() - 7)
  const jan1 = new Date(now.getFullYear(), 0, 1)
  const days = Math.floor((now.getTime() - jan1.getTime()) / 86400000)
  const week = Math.ceil((days + jan1.getDay() + 1) / 7)
  return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`
}

interface CargasState {
  registros: TreinoSemana[]

  salvarSerie: (alunoId: string, exercicioId: string, numSerie: number, cargaKg: number, reps: number) => void
  salvarSensacao: (alunoId: string, exercicioId: string, sensacao: 1 | 2 | 3 | 4 | 5) => void
  getHistorico: (exercicioId: string, alunoId: string) => TreinoSemana[]
  getSemanaAtual: (exercicioId: string, alunoId: string) => TreinoSemana | undefined
  getSemanaAnterior: (exercicioId: string, alunoId: string) => TreinoSemana | undefined
}

export { getCurrentWeekId, getPreviousWeekId }

export const useCargasStore = create<CargasState>()(
  persist(
    (set, get) => ({
      registros: [],

      salvarSerie: (alunoId, exercicioId, numSerie, cargaKg, reps) => {
        const semana = getCurrentWeekId()
        set((s) => {
          const existing = s.registros.find(
            (r) => r.exercicioId === exercicioId && r.alunoId === alunoId && r.semana === semana
          )

          const novaSerie: SerieRegistrada = {
            numeroSerie: numSerie,
            cargaKg,
            repeticoesFeitas: reps,
            concluida: true,
          }

          if (existing) {
            return {
              registros: s.registros.map((r) => {
                if (r.id !== existing.id) return r
                const series = r.series.filter((sr) => sr.numeroSerie !== numSerie)
                return { ...r, series: [...series, novaSerie], dataRegistro: new Date().toISOString() }
              }),
            }
          }

          const novo: TreinoSemana = {
            id: crypto.randomUUID(),
            exercicioId,
            alunoId,
            semana,
            dataRegistro: new Date().toISOString(),
            series: [novaSerie],
          }
          return { registros: [...s.registros, novo] }
        })
      },

      salvarSensacao: (alunoId, exercicioId, sensacao) => {
        const semana = getCurrentWeekId()
        set((s) => ({
          registros: s.registros.map((r) =>
            r.exercicioId === exercicioId && r.alunoId === alunoId && r.semana === semana
              ? { ...r, sensacaoSubjetiva: sensacao }
              : r
          ),
        }))
      },

      getHistorico: (exercicioId, alunoId) => {
        return get()
          .registros.filter((r) => r.exercicioId === exercicioId && r.alunoId === alunoId)
          .sort((a, b) => a.semana.localeCompare(b.semana))
      },

      getSemanaAtual: (exercicioId, alunoId) => {
        const semana = getCurrentWeekId()
        return get().registros.find(
          (r) => r.exercicioId === exercicioId && r.alunoId === alunoId && r.semana === semana
        )
      },

      getSemanaAnterior: (exercicioId, alunoId) => {
        const semana = getPreviousWeekId()
        return get().registros.find(
          (r) => r.exercicioId === exercicioId && r.alunoId === alunoId && r.semana === semana
        )
      },
    }),
    {
      name: 'grings-cargas',
      storage: createJSONStorage(() => jsonStorage),
      partialize: (state) => ({ registros: state.registros }),
    }
  )
)
