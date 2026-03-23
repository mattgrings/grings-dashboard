export interface EstatisticasAluno {
  totalTreinos: number
  semanaPerfeita: number
  streakAtual: number
  maiorStreak: number
  totalFotos: number
  metaPesoAtingida: boolean
  totalMedidas: number
  totalFeedbacks: number
}

export interface Conquista {
  id: string
  titulo: string
  descricao: string
  emoji: string
  raridade: 'comum' | 'raro' | 'epico' | 'lendario'
  condicao: (stats: EstatisticasAluno) => boolean
}

export interface ConquistaDesbloqueada {
  conquistaId: string
  alunoId: string
  desbloqueadaEm: string
}

export const CONQUISTAS: Conquista[] = [
  {
    id: 'primeiro_treino',
    titulo: 'Primeiro Passo',
    descricao: 'Completou seu primeiro treino!',
    emoji: '🎯',
    raridade: 'comum',
    condicao: (s) => s.totalTreinos >= 1,
  },
  {
    id: 'dez_treinos',
    titulo: 'Aquecendo',
    descricao: '10 treinos completados!',
    emoji: '💪',
    raridade: 'comum',
    condicao: (s) => s.totalTreinos >= 10,
  },
  {
    id: 'semana_perfeita',
    titulo: 'Semana Perfeita',
    descricao: 'Treinou todos os dias previstos em uma semana!',
    emoji: '🔥',
    raridade: 'raro',
    condicao: (s) => s.semanaPerfeita >= 1,
  },
  {
    id: 'streak_7',
    titulo: 'Uma Semana Seguida',
    descricao: '7 dias seguidos treinando!',
    emoji: '📅',
    raridade: 'raro',
    condicao: (s) => s.streakAtual >= 7,
  },
  {
    id: 'streak_30',
    titulo: 'Máquina Imparável',
    descricao: '30 dias seguidos sem faltar!',
    emoji: '⚡',
    raridade: 'epico',
    condicao: (s) => s.streakAtual >= 30,
  },
  {
    id: '50_treinos',
    titulo: 'Meio Centenário',
    descricao: '50 treinos completados!',
    emoji: '🏅',
    raridade: 'raro',
    condicao: (s) => s.totalTreinos >= 50,
  },
  {
    id: '100_treinos',
    titulo: 'Centenário',
    descricao: '100 treinos completados!',
    emoji: '💯',
    raridade: 'lendario',
    condicao: (s) => s.totalTreinos >= 100,
  },
  {
    id: 'primeira_foto',
    titulo: 'Registro em Dia',
    descricao: 'Enviou a primeira foto de evolução!',
    emoji: '📸',
    raridade: 'comum',
    condicao: (s) => s.totalFotos >= 1,
  },
  {
    id: 'meta_peso',
    titulo: 'Meta Atingida!',
    descricao: 'Atingiu seu objetivo de peso!',
    emoji: '🏆',
    raridade: 'epico',
    condicao: (s) => s.metaPesoAtingida,
  },
  {
    id: 'primeira_medida',
    titulo: 'Números não Mentem',
    descricao: 'Registrou suas primeiras medidas corporais!',
    emoji: '📏',
    raridade: 'comum',
    condicao: (s) => s.totalMedidas >= 1,
  },
]
