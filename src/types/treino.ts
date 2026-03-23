export type DiaSemana = 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab' | 'dom'

export type GrupoMuscularTreino =
  | 'peito' | 'costas' | 'ombros' | 'biceps' | 'triceps'
  | 'abdomen' | 'gluteos' | 'quadriceps' | 'posterior' | 'panturrilha'
  | 'antebraco' | 'cardio' | 'funcional'

export type Equipamento = 'barra' | 'halteres' | 'maquina' | 'cabo' | 'peso_corpo' | 'outro'

export interface ExercicioCompleto {
  id: string
  nome: string
  grupoMuscular: GrupoMuscularTreino
  equipamento: Equipamento
  dificuldade: 'iniciante' | 'intermediario' | 'avancado'
  instrucoes: string
  dicas: string
  errosComuns: string
  linkVideo?: string
  gifUrl?: string
  gifBase64?: string
  musculosSecundarios?: string
  custom: boolean
  criadoEm: string
}

export interface SerieConfig {
  numeroSerie: number
  repeticoes: string
  cargaSugerida?: number
  tempoDescanso: number
  tipoSerie: 'normal' | 'drop_set' | 'bi_set' | 'super_set' | 'isometrica'
  observacaoSerie?: string
}

export interface ExercicioNoPlano {
  id: string
  exercicioId: string
  exercicio: ExercicioCompleto
  series: SerieConfig[]
  observacoesAdmin: string
  linkVideoEspecifico?: string
  substituicaoPossivel?: string
  ordem: number
}

export interface TreinoDia {
  id: string
  nome: string
  diasSemana: DiaSemana[]
  observacoesGerais: string
  aquecimento?: string
  alongamento?: string
  duracaoEstimadaMinutos: number
  exercicios: ExercicioNoPlano[]
  ativo: boolean
}

export interface PlanoTreinoCompleto {
  id: string
  alunoId: string
  nome: string
  descricao: string
  objetivo: string
  nivel: 'iniciante' | 'intermediario' | 'avancado'
  treinos: TreinoDia[]
  dataInicio: string
  dataFim?: string
  ativo: boolean
  observacoesGerais: string
  criadoPor: string
  criadoEm: string
  atualizadoEm: string
}
