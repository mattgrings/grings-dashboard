import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Lead } from '../types'
import { jsonStorage } from '../lib/storage'

interface LeadsState {
  leads: Lead[]
  addLead: (lead: Omit<Lead, 'id' | 'criadoEm' | 'atualizadoEm'>) => void
  updateLead: (id: string, data: Partial<Lead>) => void
  deleteLead: (id: string) => void
  getLeadById: (id: string) => Lead | undefined
}

const mockLeads: Lead[] = [
  {
    id: '1',
    nome: 'Lucas Ferreira',
    telefone: '(11) 99876-5432',
    instagram: '@lucasferreira',
    email: 'lucas@email.com',
    origem: 'instagram',
    status: 'novo',
    observacoes: 'Interessado em consultoria de emagrecimento',
    criadoEm: new Date('2026-03-20T08:00:00'),
    atualizadoEm: new Date('2026-03-20T08:00:00'),
  },
  {
    id: '2',
    nome: 'Mariana Costa',
    telefone: '(21) 98765-4321',
    instagram: '@maricostafit',
    email: 'mariana@email.com',
    origem: 'trafego_pago',
    status: 'contactado',
    observacoes: 'Viu anúncio no Instagram, quer ganho de massa',
    criadoEm: new Date('2026-03-19T14:30:00'),
    atualizadoEm: new Date('2026-03-19T16:00:00'),
  },
  {
    id: '3',
    nome: 'Pedro Henrique',
    telefone: '(31) 97654-3210',
    instagram: '@pedroh_treino',
    origem: 'indicacao',
    status: 'agendado',
    observacoes: 'Indicado pelo cliente João. Chamada agendada para amanhã',
    criadoEm: new Date('2026-03-18T10:00:00'),
    atualizadoEm: new Date('2026-03-19T09:00:00'),
  },
  {
    id: '4',
    nome: 'Ana Beatriz',
    telefone: '(41) 96543-2109',
    email: 'ana.b@email.com',
    origem: 'whatsapp',
    status: 'convertido',
    observacoes: 'Fechou pacote trimestral',
    criadoEm: new Date('2026-03-15T11:00:00'),
    atualizadoEm: new Date('2026-03-17T15:00:00'),
  },
  {
    id: '5',
    nome: 'Rafael Santos',
    telefone: '(51) 95432-1098',
    instagram: '@rafaelsantos',
    origem: 'instagram',
    status: 'novo',
    criadoEm: new Date('2026-03-20T09:30:00'),
    atualizadoEm: new Date('2026-03-20T09:30:00'),
  },
  {
    id: '6',
    nome: 'Camila Oliveira',
    telefone: '(61) 94321-0987',
    email: 'camila.o@email.com',
    origem: 'trafego_pago',
    status: 'contactado',
    observacoes: 'Respondeu formulário do site',
    criadoEm: new Date('2026-03-19T08:00:00'),
    atualizadoEm: new Date('2026-03-19T10:00:00'),
  },
  {
    id: '7',
    nome: 'Thiago Mendes',
    telefone: '(71) 93210-9876',
    instagram: '@thiagomendes',
    origem: 'instagram',
    status: 'perdido',
    observacoes: 'Não respondeu após 3 tentativas',
    criadoEm: new Date('2026-03-10T12:00:00'),
    atualizadoEm: new Date('2026-03-15T12:00:00'),
  },
  {
    id: '8',
    nome: 'Juliana Rocha',
    telefone: '(81) 92109-8765',
    email: 'ju.rocha@email.com',
    origem: 'indicacao',
    status: 'agendado',
    criadoEm: new Date('2026-03-19T16:00:00'),
    atualizadoEm: new Date('2026-03-20T08:30:00'),
  },
  {
    id: '9',
    nome: 'Bruno Almeida',
    telefone: '(91) 91098-7654',
    instagram: '@brunoalmeida',
    origem: 'whatsapp',
    status: 'novo',
    observacoes: 'Enviou mensagem perguntando sobre preços',
    criadoEm: new Date('2026-03-20T07:00:00'),
    atualizadoEm: new Date('2026-03-20T07:00:00'),
  },
  {
    id: '10',
    nome: 'Fernanda Lima',
    telefone: '(11) 90987-6543',
    email: 'fernanda.l@email.com',
    origem: 'outro',
    status: 'convertido',
    observacoes: 'Veio pela landing page. Fechou mensal',
    criadoEm: new Date('2026-03-12T09:00:00'),
    atualizadoEm: new Date('2026-03-14T14:00:00'),
  },
]

export const useLeadsStore = create<LeadsState>()(
  persist(
    (set, get) => ({
      leads: mockLeads,

      addLead: (data) => {
        const newLead: Lead = {
          ...data,
          id: crypto.randomUUID(),
          criadoEm: new Date(),
          atualizadoEm: new Date(),
        }
        set((state) => ({ leads: [newLead, ...state.leads] }))
      },

      updateLead: (id, data) => {
        set((state) => ({
          leads: state.leads.map((lead) =>
            lead.id === id ? { ...lead, ...data, atualizadoEm: new Date() } : lead
          ),
        }))
      },

      deleteLead: (id) => {
        set((state) => ({ leads: state.leads.filter((lead) => lead.id !== id) }))
      },

      getLeadById: (id) => {
        return get().leads.find((lead) => lead.id === id)
      },
    }),
    {
      name: 'grings-leads',
      storage: createJSONStorage(() => jsonStorage),
      partialize: (state) => ({ leads: state.leads }),
    }
  )
)
