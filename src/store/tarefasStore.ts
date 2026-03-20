import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Tarefa } from '../types'
import { jsonStorage } from '../lib/storage'

interface TarefasState {
  tarefas: Tarefa[]
  addTarefa: (data: Omit<Tarefa, 'id' | 'criadoEm' | 'atualizadoEm'>) => void
  updateTarefa: (id: string, data: Partial<Tarefa>) => void
  updateProgresso: (id: string, progresso: number) => void
  deleteTarefa: (id: string) => void
}

const mockTarefas: Tarefa[] = [
  {
    id: '1',
    titulo: 'Criar planilha de treinos do mês',
    descricao: 'Montar a planilha com os treinos individualizados para todos os alunos ativos',
    prioridade: 'alta',
    progresso: 0,
    status: 'a_fazer',
    responsavel: 'Matheus',
    prazo: '2026-03-25',
    tags: ['treino', 'planejamento'],
    criadoEm: '2026-03-18T10:00:00',
    atualizadoEm: '2026-03-18T10:00:00',
  },
  {
    id: '2',
    titulo: 'Responder leads do Instagram',
    descricao: 'Verificar e responder todas as DMs pendentes do Instagram',
    prioridade: 'alta',
    progresso: 0,
    status: 'a_fazer',
    responsavel: 'Matheus',
    prazo: '2026-03-21',
    tags: ['leads', 'instagram'],
    criadoEm: '2026-03-19T08:00:00',
    atualizadoEm: '2026-03-19T08:00:00',
  },
  {
    id: '3',
    titulo: 'Gravar vídeos para o conteúdo semanal',
    descricao: 'Gravar 3 vídeos curtos sobre dicas de nutrição para postar nos reels',
    prioridade: 'media',
    progresso: 0,
    status: 'a_fazer',
    tags: ['conteúdo', 'marketing'],
    criadoEm: '2026-03-19T14:00:00',
    atualizadoEm: '2026-03-19T14:00:00',
  },
  {
    id: '4',
    titulo: 'Atualizar dietas dos alunos',
    descricao: 'Revisar e ajustar as dietas de 5 alunos que pediram alterações',
    prioridade: 'alta',
    progresso: 40,
    status: 'em_progresso',
    responsavel: 'Matheus',
    prazo: '2026-03-22',
    tags: ['dieta', 'alunos'],
    criadoEm: '2026-03-16T09:00:00',
    atualizadoEm: '2026-03-20T11:00:00',
  },
  {
    id: '5',
    titulo: 'Configurar automação de WhatsApp',
    descricao: 'Implementar respostas automáticas para novos contatos no WhatsApp Business',
    prioridade: 'media',
    progresso: 75,
    status: 'em_progresso',
    responsavel: 'Matheus',
    prazo: '2026-03-28',
    tags: ['automação', 'whatsapp'],
    criadoEm: '2026-03-10T10:00:00',
    atualizadoEm: '2026-03-19T16:00:00',
  },
  {
    id: '6',
    titulo: 'Fechar parceria com loja de suplementos',
    descricao: 'Negociar desconto exclusivo para alunos na loja NutriMax',
    prioridade: 'baixa',
    progresso: 100,
    status: 'concluida',
    responsavel: 'Matheus',
    tags: ['parceria', 'suplementos'],
    criadoEm: '2026-03-05T08:00:00',
    atualizadoEm: '2026-03-15T14:00:00',
  },
  {
    id: '7',
    titulo: 'Montar apresentação para workshop',
    descricao: 'Preparar slides e material para o workshop de sábado sobre periodização',
    prioridade: 'media',
    progresso: 100,
    status: 'concluida',
    responsavel: 'Matheus',
    prazo: '2026-03-15',
    tags: ['workshop', 'apresentação'],
    criadoEm: '2026-03-08T10:00:00',
    atualizadoEm: '2026-03-14T18:00:00',
  },
  {
    id: '8',
    titulo: 'Revisar contrato com academia parceira',
    descricao: 'Analisar cláusulas do novo contrato com a academia FitCenter',
    prioridade: 'baixa',
    progresso: 20,
    status: 'pausada',
    responsavel: 'Matheus',
    prazo: '2026-04-01',
    tags: ['contrato', 'parceria'],
    criadoEm: '2026-03-12T11:00:00',
    atualizadoEm: '2026-03-17T09:00:00',
  },
]

export const useTarefasStore = create<TarefasState>()(
  persist(
    (set) => ({
      tarefas: mockTarefas,

      addTarefa: (data) => {
        const now = new Date().toISOString()
        const newTarefa: Tarefa = {
          ...data,
          id: crypto.randomUUID(),
          criadoEm: now,
          atualizadoEm: now,
        }
        set((state) => ({ tarefas: [newTarefa, ...state.tarefas] }))
      },

      updateTarefa: (id, data) => {
        set((state) => ({
          tarefas: state.tarefas.map((t) =>
            t.id === id ? { ...t, ...data, atualizadoEm: new Date().toISOString() } : t
          ),
        }))
      },

      updateProgresso: (id, progresso) => {
        const clamped = Math.max(0, Math.min(100, progresso))
        let status: Tarefa['status']
        if (clamped === 100) status = 'concluida'
        else if (clamped > 0) status = 'em_progresso'
        else status = 'a_fazer'

        set((state) => ({
          tarefas: state.tarefas.map((t) =>
            t.id === id
              ? { ...t, progresso: clamped, status, atualizadoEm: new Date().toISOString() }
              : t
          ),
        }))
      },

      deleteTarefa: (id) => {
        set((state) => ({ tarefas: state.tarefas.filter((t) => t.id !== id) }))
      },
    }),
    {
      name: 'grings-tarefas',
      storage: createJSONStorage(() => jsonStorage),
      partialize: (state) => ({ tarefas: state.tarefas }),
    }
  )
)
