import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  Aluno,
  FotoProgresso,
  AtualizacaoTreino,
  AtualizacaoDieta,
} from '../types'
import { jsonStorage } from '../lib/storage'

interface AlunosState {
  alunos: Aluno[]
  fotos: FotoProgresso[]
  treinos: AtualizacaoTreino[]
  dietas: AtualizacaoDieta[]

  // Alunos
  addAluno: (data: Omit<Aluno, 'id' | 'criadoEm' | 'atualizadoEm'>) => void
  updateAluno: (id: string, data: Partial<Aluno>) => void
  deleteAluno: (id: string) => void

  // Fotos
  addFoto: (data: Omit<FotoProgresso, 'id'>) => void
  deleteFoto: (id: string) => void
  getFotosByAluno: (alunoId: string) => FotoProgresso[]

  // Treinos
  addTreino: (data: Omit<AtualizacaoTreino, 'id'>) => void
  updateTreino: (id: string, data: Partial<AtualizacaoTreino>) => void
  deleteTreino: (id: string) => void
  getTreinosByAluno: (alunoId: string) => AtualizacaoTreino[]

  // Dietas
  addDieta: (data: Omit<AtualizacaoDieta, 'id'>) => void
  updateDieta: (id: string, data: Partial<AtualizacaoDieta>) => void
  deleteDieta: (id: string) => void
  getDietasByAluno: (alunoId: string) => AtualizacaoDieta[]
}

export const useAlunosStore = create<AlunosState>()(
  persist(
    (set, get) => ({
      alunos: [],
      fotos: [],
      treinos: [],
      dietas: [],

      // Alunos
      addAluno: (data) => {
        const novo: Aluno = { ...data, id: crypto.randomUUID(), criadoEm: new Date(), atualizadoEm: new Date() }
        set((s) => ({ alunos: [novo, ...s.alunos] }))
      },
      updateAluno: (id, data) => {
        set((s) => ({
          alunos: s.alunos.map((a) => (a.id === id ? { ...a, ...data, atualizadoEm: new Date() } : a)),
        }))
      },
      deleteAluno: (id) => {
        set((s) => ({ alunos: s.alunos.filter((a) => a.id !== id) }))
      },

      // Fotos
      addFoto: (data) => {
        const nova: FotoProgresso = { ...data, id: crypto.randomUUID() }
        set((s) => ({ fotos: [nova, ...s.fotos] }))
      },
      deleteFoto: (id) => {
        set((s) => ({ fotos: s.fotos.filter((f) => f.id !== id) }))
      },
      getFotosByAluno: (alunoId) => {
        return get().fotos.filter((f) => f.alunoId === alunoId).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      },

      // Treinos
      addTreino: (data) => {
        const novo: AtualizacaoTreino = { ...data, id: crypto.randomUUID() }
        set((s) => ({ treinos: [novo, ...s.treinos] }))
      },
      updateTreino: (id, data) => {
        set((s) => ({ treinos: s.treinos.map((t) => (t.id === id ? { ...t, ...data } : t)) }))
      },
      deleteTreino: (id) => {
        set((s) => ({ treinos: s.treinos.filter((t) => t.id !== id) }))
      },
      getTreinosByAluno: (alunoId) => {
        return get().treinos.filter((t) => t.alunoId === alunoId).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      },

      // Dietas
      addDieta: (data) => {
        const nova: AtualizacaoDieta = { ...data, id: crypto.randomUUID() }
        set((s) => ({ dietas: [nova, ...s.dietas] }))
      },
      updateDieta: (id, data) => {
        set((s) => ({ dietas: s.dietas.map((d) => (d.id === id ? { ...d, ...data } : d)) }))
      },
      deleteDieta: (id) => {
        set((s) => ({ dietas: s.dietas.filter((d) => d.id !== id) }))
      },
      getDietasByAluno: (alunoId) => {
        return get().dietas.filter((d) => d.alunoId === alunoId).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      },
    }),
    {
      name: 'grings-alunos',
      storage: createJSONStorage(() => jsonStorage),
      partialize: (state) => ({
        alunos: state.alunos,
        fotos: state.fotos,
        treinos: state.treinos,
        dietas: state.dietas,
      }),
    }
  )
)
