import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { MesFinanceiro, Venda } from '../types'
import { jsonStorage } from '../lib/storage'

interface FinanceiroState {
  meses: MesFinanceiro[]
  mesAtualId: string
  addVenda: (mesId: string, venda: Omit<Venda, 'id'>) => void
  updateVenda: (mesId: string, vendaId: string, data: Partial<Venda>) => void
  deleteVenda: (mesId: string, vendaId: string) => void
  setMeta: (mesId: string, meta: number) => void
  addMes: (mes: MesFinanceiro) => void
  setMesAtual: (id: string) => void
}

// Mês atual vazio como ponto de partida
const now = new Date()
const currentMonthId = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

export const useFinanceiroStore = create<FinanceiroState>()(
  persist(
    (set) => ({
      meses: [
        {
          id: currentMonthId,
          mes: currentMonthId,
          meta: 0,
          vendas: [],
        },
      ],
      mesAtualId: currentMonthId,

      addVenda: (mesId, vendaData) => {
        const newVenda: Venda = {
          ...vendaData,
          id: crypto.randomUUID(),
        }
        set((state) => ({
          meses: state.meses.map((m) =>
            m.id === mesId ? { ...m, vendas: [...m.vendas, newVenda] } : m
          ),
        }))
      },

      updateVenda: (mesId, vendaId, data) => {
        set((state) => ({
          meses: state.meses.map((m) =>
            m.id === mesId
              ? {
                  ...m,
                  vendas: m.vendas.map((v) =>
                    v.id === vendaId ? { ...v, ...data } : v
                  ),
                }
              : m
          ),
        }))
      },

      deleteVenda: (mesId, vendaId) => {
        set((state) => ({
          meses: state.meses.map((m) =>
            m.id === mesId
              ? { ...m, vendas: m.vendas.filter((v) => v.id !== vendaId) }
              : m
          ),
        }))
      },

      setMeta: (mesId, meta) => {
        set((state) => ({
          meses: state.meses.map((m) =>
            m.id === mesId ? { ...m, meta } : m
          ),
        }))
      },

      addMes: (mes) => {
        set((state) => ({
          meses: [...state.meses, mes],
        }))
      },

      setMesAtual: (id) => {
        set({ mesAtualId: id })
      },
    }),
    {
      name: 'grings-financeiro',
      storage: createJSONStorage(() => jsonStorage),
      partialize: (state) => ({ meses: state.meses, mesAtualId: state.mesAtualId }),
    }
  )
)
