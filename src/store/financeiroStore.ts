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

const mockVendas: Venda[] = [
  {
    id: '1',
    clienteNome: 'Ana Beatriz',
    valor: 2400,
    tipo: 'confirmada',
    dataVenda: '2026-03-02',
    servico: 'Plano Trimestral',
    observacoes: 'Pagamento via PIX',
  },
  {
    id: '2',
    clienteNome: 'Fernanda Lima',
    valor: 800,
    tipo: 'confirmada',
    dataVenda: '2026-03-05',
    servico: 'Consultoria Mensal',
  },
  {
    id: '3',
    clienteNome: 'Lucas Ferreira',
    valor: 4200,
    tipo: 'sinal',
    valorSinal: 1500,
    valorRestante: 2700,
    dataVenda: '2026-03-10',
    servico: 'Plano Semestral',
    observacoes: 'Restante em 3x no cartão',
  },
  {
    id: '4',
    clienteNome: 'Pedro Henrique',
    valor: 350,
    tipo: 'pendente',
    dataVenda: '2026-03-15',
    servico: 'Avulso',
    observacoes: 'Aguardando confirmação de pagamento',
  },
  {
    id: '5',
    clienteNome: 'Mariana Costa',
    valor: 1600,
    tipo: 'confirmada',
    dataVenda: '2026-03-18',
    servico: 'Plano Trimestral',
  },
]

const mockMeses: MesFinanceiro[] = [
  {
    id: '2026-01',
    mes: '2026-01',
    meta: 8000,
    vendas: [
      { id: 'jan-1', clienteNome: 'Carlos Silva', valor: 2400, tipo: 'confirmada', dataVenda: '2026-01-05', servico: 'Plano Trimestral' },
      { id: 'jan-2', clienteNome: 'Maria Santos', valor: 800, tipo: 'confirmada', dataVenda: '2026-01-12', servico: 'Consultoria Mensal' },
      { id: 'jan-3', clienteNome: 'João Oliveira', valor: 4800, tipo: 'confirmada', dataVenda: '2026-01-20', servico: 'Plano Semestral' },
    ],
  },
  {
    id: '2026-02',
    mes: '2026-02',
    meta: 9000,
    vendas: [
      { id: 'fev-1', clienteNome: 'Paula Mendes', valor: 1600, tipo: 'confirmada', dataVenda: '2026-02-03', servico: 'Plano Trimestral' },
      { id: 'fev-2', clienteNome: 'Ricardo Alves', valor: 7200, tipo: 'confirmada', dataVenda: '2026-02-10', servico: 'Plano Anual' },
      { id: 'fev-3', clienteNome: 'Camila Rocha', valor: 800, tipo: 'sinal', valorSinal: 300, valorRestante: 500, dataVenda: '2026-02-18', servico: 'Consultoria Mensal' },
    ],
  },
  {
    id: '2026-03',
    mes: '2026-03',
    meta: 10000,
    vendas: mockVendas,
  },
]

export const useFinanceiroStore = create<FinanceiroState>()(
  persist(
    (set) => ({
      meses: mockMeses,
      mesAtualId: '2026-03',

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
