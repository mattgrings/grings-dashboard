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

// ========== MOCK DATA ==========

const mockAlunos: Aluno[] = [
  {
    id: 'a1',
    nome: 'Ana Beatriz',
    telefone: '(41) 96543-2109',
    instagram: '@anabfit',
    email: 'ana.b@email.com',
    dataNascimento: '1995-06-15',
    objetivo: 'emagrecimento',
    status: 'ativo',
    dataInicio: new Date('2026-01-10'),
    observacoes: 'Quer perder 8kg em 3 meses. Tem restrição no joelho direito.',
    pesoInicial: 72,
    alturaM: 1.65,
    criadoEm: new Date('2026-01-10'),
    atualizadoEm: new Date('2026-03-18'),
  },
  {
    id: 'a2',
    nome: 'Fernanda Lima',
    telefone: '(11) 90987-6543',
    instagram: '@fernandafit',
    email: 'fernanda.l@email.com',
    dataNascimento: '1992-03-22',
    objetivo: 'hipertrofia',
    status: 'ativo',
    dataInicio: new Date('2026-02-01'),
    observacoes: 'Já treina há 2 anos, quer ganhar massa muscular.',
    pesoInicial: 58,
    alturaM: 1.70,
    criadoEm: new Date('2026-02-01'),
    atualizadoEm: new Date('2026-03-15'),
  },
  {
    id: 'a3',
    nome: 'Pedro Henrique',
    telefone: '(31) 97654-3210',
    instagram: '@pedroh_treino',
    objetivo: 'hipertrofia',
    status: 'ativo',
    dataInicio: new Date('2025-11-20'),
    observacoes: 'Objetivo de competição. Foco em peito e costas.',
    pesoInicial: 82,
    alturaM: 1.78,
    criadoEm: new Date('2025-11-20'),
    atualizadoEm: new Date('2026-03-19'),
  },
  {
    id: 'a4',
    nome: 'Mariana Costa',
    telefone: '(21) 98765-4321',
    instagram: '@maricostafit',
    dataNascimento: '1998-11-08',
    objetivo: 'saude',
    status: 'pausado',
    dataInicio: new Date('2025-10-01'),
    observacoes: 'Pausou por 1 mês por viagem. Retorna em abril.',
    pesoInicial: 65,
    alturaM: 1.62,
    criadoEm: new Date('2025-10-01'),
    atualizadoEm: new Date('2026-03-01'),
  },
  {
    id: 'a5',
    nome: 'Lucas Ferreira',
    telefone: '(11) 99876-5432',
    instagram: '@lucasferreira',
    email: 'lucas@email.com',
    dataNascimento: '1990-01-30',
    objetivo: 'emagrecimento',
    status: 'ativo',
    dataInicio: new Date('2026-03-01'),
    observacoes: 'Sedentário, primeiro programa de treino. Precisa de acompanhamento próximo.',
    pesoInicial: 95,
    alturaM: 1.80,
    criadoEm: new Date('2026-03-01'),
    atualizadoEm: new Date('2026-03-20'),
  },
]

const mockFotos: FotoProgresso[] = [
  { id: 'f1', alunoId: 'a1', url: '', legenda: 'Início do programa', data: new Date('2026-01-10'), tipo: 'frente' },
  { id: 'f2', alunoId: 'a1', url: '', legenda: 'Início - costas', data: new Date('2026-01-10'), tipo: 'costas' },
  { id: 'f3', alunoId: 'a1', url: '', legenda: '30 dias de treino', data: new Date('2026-02-10'), tipo: 'frente' },
  { id: 'f4', alunoId: 'a1', url: '', legenda: '30 dias - costas', data: new Date('2026-02-10'), tipo: 'costas' },
  { id: 'f5', alunoId: 'a1', url: '', legenda: '60 dias - resultado!', data: new Date('2026-03-10'), tipo: 'frente' },
  { id: 'f6', alunoId: 'a2', url: '', legenda: 'Início consultoria', data: new Date('2026-02-01'), tipo: 'frente' },
  { id: 'f7', alunoId: 'a2', url: '', legenda: '45 dias de treino', data: new Date('2026-03-15'), tipo: 'frente' },
  { id: 'f8', alunoId: 'a3', url: '', legenda: 'Check 4 meses', data: new Date('2026-03-19'), tipo: 'frente' },
  { id: 'f9', alunoId: 'a5', url: '', legenda: 'Dia 1 - ponto de partida', data: new Date('2026-03-01'), tipo: 'frente' },
  { id: 'f10', alunoId: 'a5', url: '', legenda: 'Dia 1 - lateral', data: new Date('2026-03-01'), tipo: 'lateral' },
]

const mockTreinos: AtualizacaoTreino[] = [
  {
    id: 't1',
    alunoId: 'a1',
    data: new Date('2026-01-10'),
    titulo: 'Treino A - Adaptação',
    descricao: 'Fase de adaptação, 3x por semana. Foco em movimentos compostos com carga leve.',
    detalhes: [
      {
        nome: 'Membros Inferiores',
        exercicios: [
          { nome: 'Agachamento Smith', series: 3, repeticoes: '12-15', carga: '20kg' },
          { nome: 'Leg Press 45°', series: 3, repeticoes: '12-15', carga: '60kg' },
          { nome: 'Cadeira Extensora', series: 3, repeticoes: '15', carga: '25kg' },
          { nome: 'Stiff', series: 3, repeticoes: '12', carga: '15kg', observacao: 'Cuidado com o joelho' },
        ],
      },
      {
        nome: 'Abdômen',
        exercicios: [
          { nome: 'Prancha', series: 3, repeticoes: '30s' },
          { nome: 'Crunch', series: 3, repeticoes: '20' },
        ],
      },
    ],
  },
  {
    id: 't2',
    alunoId: 'a1',
    data: new Date('2026-02-10'),
    titulo: 'Treino A - Progressão',
    descricao: 'Progressão de carga. Adicionado exercícios unilaterais.',
    detalhes: [
      {
        nome: 'Membros Inferiores',
        exercicios: [
          { nome: 'Agachamento Livre', series: 4, repeticoes: '10-12', carga: '30kg' },
          { nome: 'Leg Press 45°', series: 4, repeticoes: '10-12', carga: '80kg' },
          { nome: 'Búlgaro', series: 3, repeticoes: '12 (cada)', carga: '10kg' },
          { nome: 'Cadeira Flexora', series: 3, repeticoes: '12', carga: '30kg' },
          { nome: 'Panturrilha em Pé', series: 4, repeticoes: '15', carga: '40kg' },
        ],
      },
    ],
  },
  {
    id: 't3',
    alunoId: 'a3',
    data: new Date('2026-03-19'),
    titulo: 'Treino Push - Peito/Ombro/Tríceps',
    descricao: 'Divisão Push/Pull/Legs. Semana de intensificação.',
    detalhes: [
      {
        nome: 'Peito',
        exercicios: [
          { nome: 'Supino Reto', series: 4, repeticoes: '6-8', carga: '80kg' },
          { nome: 'Supino Inclinado Haltere', series: 4, repeticoes: '8-10', carga: '32kg' },
          { nome: 'Cross Over', series: 3, repeticoes: '12', carga: '25kg' },
        ],
      },
      {
        nome: 'Ombro',
        exercicios: [
          { nome: 'Desenvolvimento Militar', series: 4, repeticoes: '8-10', carga: '40kg' },
          { nome: 'Elevação Lateral', series: 4, repeticoes: '12-15', carga: '12kg' },
        ],
      },
      {
        nome: 'Tríceps',
        exercicios: [
          { nome: 'Tríceps Pulley', series: 3, repeticoes: '12', carga: '30kg' },
          { nome: 'Francês', series: 3, repeticoes: '10', carga: '20kg' },
        ],
      },
    ],
  },
  {
    id: 't4',
    alunoId: 'a5',
    data: new Date('2026-03-01'),
    titulo: 'Treino Iniciante - Full Body',
    descricao: 'Programa iniciante 3x por semana. Adaptação neuromuscular.',
    detalhes: [
      {
        nome: 'Full Body',
        exercicios: [
          { nome: 'Agachamento Guiado', series: 3, repeticoes: '12', carga: '30kg' },
          { nome: 'Supino Máquina', series: 3, repeticoes: '12', carga: '20kg' },
          { nome: 'Puxada Frontal', series: 3, repeticoes: '12', carga: '35kg' },
          { nome: 'Leg Press', series: 3, repeticoes: '15', carga: '60kg' },
          { nome: 'Remada Baixa', series: 3, repeticoes: '12', carga: '30kg' },
          { nome: 'Desenvolvimento Máquina', series: 3, repeticoes: '12', carga: '15kg' },
        ],
      },
    ],
  },
]

const mockDietas: AtualizacaoDieta[] = [
  {
    id: 'd1',
    alunoId: 'a1',
    data: new Date('2026-01-10'),
    titulo: 'Plano Alimentar - Deficit Calórico',
    descricao: 'Deficit de 500kcal. Foco em proteína para preservar massa magra.',
    refeicoes: [
      { nome: 'Café da Manhã', horario: '07:00', alimentos: ['2 ovos mexidos', '1 fatia pão integral', '1 fruta', 'Café preto'] },
      { nome: 'Lanche da Manhã', horario: '10:00', alimentos: ['1 iogurte grego natural', '1 colher de granola'] },
      { nome: 'Almoço', horario: '12:30', alimentos: ['150g frango grelhado', '100g arroz integral', '2 conchas feijão', 'Salada à vontade', '1 colher azeite'] },
      { nome: 'Lanche da Tarde', horario: '15:30', alimentos: ['1 scoop whey', '1 banana', '1 colher pasta amendoim'] },
      { nome: 'Jantar', horario: '19:00', alimentos: ['150g peixe grelhado', 'Legumes refogados', 'Salada verde'] },
    ],
    macros: { calorias: 1600, proteina: 130, carboidrato: 150, gordura: 55 },
  },
  {
    id: 'd2',
    alunoId: 'a1',
    data: new Date('2026-02-10'),
    titulo: 'Plano Alimentar - Ajuste Mês 2',
    descricao: 'Reduziu mais 200kcal. Ajuste nos carboidratos pós-treino.',
    refeicoes: [
      { nome: 'Café da Manhã', horario: '07:00', alimentos: ['3 claras + 1 ovo', '1 fatia pão integral', 'Café preto'] },
      { nome: 'Lanche da Manhã', horario: '10:00', alimentos: ['1 fruta', '30g castanhas'] },
      { nome: 'Almoço', horario: '12:30', alimentos: ['150g frango grelhado', '80g batata doce', 'Salada à vontade', '1 colher azeite'] },
      { nome: 'Pós-Treino', horario: '16:00', alimentos: ['1 scoop whey', '1 banana'] },
      { nome: 'Jantar', horario: '19:00', alimentos: ['150g carne magra', 'Legumes no vapor', 'Salada verde'] },
    ],
    macros: { calorias: 1400, proteina: 140, carboidrato: 120, gordura: 45 },
  },
  {
    id: 'd3',
    alunoId: 'a3',
    data: new Date('2026-03-19'),
    titulo: 'Plano Alimentar - Bulk Limpo',
    descricao: 'Superávit de 300kcal. Alto carboidrato nos dias de treino pesado.',
    refeicoes: [
      { nome: 'Café da Manhã', horario: '06:30', alimentos: ['4 ovos mexidos', '2 fatias pão integral', '1 banana', 'Suco de laranja'] },
      { nome: 'Lanche', horario: '09:30', alimentos: ['Vitamina: leite + whey + aveia + banana'] },
      { nome: 'Almoço', horario: '12:00', alimentos: ['200g frango', '200g arroz branco', 'Feijão', 'Salada', 'Abacate'] },
      { nome: 'Pré-Treino', horario: '15:00', alimentos: ['Pão com pasta de amendoim', '1 banana', 'Café'] },
      { nome: 'Pós-Treino', horario: '17:30', alimentos: ['2 scoops whey', 'Dextrose 40g', '1 banana'] },
      { nome: 'Jantar', horario: '20:00', alimentos: ['200g carne vermelha', '150g batata doce', 'Brócolis', 'Azeite'] },
    ],
    macros: { calorias: 3200, proteina: 200, carboidrato: 380, gordura: 90 },
  },
  {
    id: 'd4',
    alunoId: 'a5',
    data: new Date('2026-03-01'),
    titulo: 'Reeducação Alimentar - Fase 1',
    descricao: 'Transição gradual. Sem cortes drásticos, foco em qualidade.',
    refeicoes: [
      { nome: 'Café da Manhã', horario: '07:30', alimentos: ['2 ovos', '2 fatias pão integral', '1 fruta', 'Café com leite'] },
      { nome: 'Almoço', horario: '12:00', alimentos: ['150g proteína (frango/carne/peixe)', '100g arroz', 'Feijão', 'Salada', '1 colher azeite'] },
      { nome: 'Lanche', horario: '15:30', alimentos: ['1 fruta', '1 iogurte', '1 punhado castanhas'] },
      { nome: 'Jantar', horario: '19:30', alimentos: ['Sopa de legumes com frango', '1 fatia pão integral'] },
    ],
    macros: { calorias: 1800, proteina: 120, carboidrato: 180, gordura: 60 },
  },
]

export const useAlunosStore = create<AlunosState>()(
  persist(
    (set, get) => ({
      alunos: mockAlunos,
      fotos: mockFotos,
      treinos: mockTreinos,
      dietas: mockDietas,

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
