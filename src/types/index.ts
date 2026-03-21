// ==================== AUTH ====================

export interface User {
  id: string
  nome: string
  email: string
  senha: string
  role: 'admin' | 'aluno'
  avatar?: string
}

export type UserRole = 'admin' | 'aluno'

// ==================== LEADS ====================

export type StatusLead = 'novo' | 'contactado' | 'agendado' | 'convertido' | 'perdido'
export type OrigemLead = 'instagram' | 'whatsapp' | 'indicacao' | 'trafego_pago' | 'outro'
export type StatusChamada = 'agendada' | 'realizada' | 'faltou' | 'remarcada'

export interface Lead {
  id: string
  nome: string
  telefone: string
  instagram?: string
  email?: string
  origem: OrigemLead
  status: StatusLead
  observacoes?: string
  criadoEm: Date
  atualizadoEm: Date
}

export interface Chamada {
  id: string
  leadId: string
  lead: Lead
  dataHora: Date
  duracao?: number
  status: StatusChamada
  notas?: string
  googleEventId?: string
  notionPageId?: string
  criadoEm: Date
}

export interface Captacao {
  id: string
  leadId: string
  lead: Lead
  dataCaptura: Date
  origem: OrigemLead
  campanhaTag?: string
}

// ==================== ALUNOS ====================

export type StatusAluno = 'ativo' | 'pausado' | 'cancelado'
export type ObjetivoAluno = 'emagrecimento' | 'hipertrofia' | 'saude' | 'performance' | 'reabilitacao'

export interface Aluno {
  id: string
  nome: string
  telefone: string
  instagram?: string
  email?: string
  dataNascimento?: string
  objetivo: ObjetivoAluno
  status: StatusAluno
  dataInicio: Date
  observacoes?: string
  pesoInicial?: number
  alturaM?: number
  criadoEm: Date
  atualizadoEm: Date
}

export interface FotoProgresso {
  id: string
  alunoId: string
  url: string // base64 ou URL local
  legenda?: string
  data: Date
  tipo: 'frente' | 'costas' | 'lateral' | 'outro'
}

export interface AtualizacaoTreino {
  id: string
  alunoId: string
  data: Date
  titulo: string
  descricao: string
  detalhes: GrupoMuscular[]
}

export interface GrupoMuscular {
  nome: string
  exercicios: Exercicio[]
}

export interface Exercicio {
  nome: string
  series: number
  repeticoes: string // ex: "8-12" ou "15"
  carga?: string
  observacao?: string
}

export interface AtualizacaoDieta {
  id: string
  alunoId: string
  data: Date
  titulo: string
  descricao: string
  refeicoes: Refeicao[]
  macros?: {
    calorias: number
    proteina: number
    carboidrato: number
    gordura: number
  }
}

export interface Refeicao {
  nome: string // ex: "Café da manhã", "Almoço"
  horario?: string
  alimentos: string[]
}

// ==================== TAREFAS ====================

export type Prioridade = 'alta' | 'media' | 'baixa'
export type StatusTarefa = 'a_fazer' | 'em_progresso' | 'concluida' | 'pausada'

export interface Tarefa {
  id: string
  titulo: string
  descricao?: string
  prioridade: Prioridade
  progresso: number
  status: StatusTarefa
  responsavel?: string
  prazo?: string
  tags?: string[]
  criadoEm: string
  atualizadoEm: string
}

// ==================== FINANCEIRO ====================

export type TipoVenda = 'confirmada' | 'sinal' | 'pendente' | 'cancelada'

export interface Venda {
  id: string
  clienteNome: string
  valor: number
  tipo: TipoVenda
  valorSinal?: number
  valorRestante?: number
  dataVenda: string
  servico: string
  observacoes?: string
}

export interface MesFinanceiro {
  id: string
  mes: string
  meta: number
  vendas: Venda[]
}

// ==================== SOCIAL SELLING ====================

export type PlataformaSocial = 'instagram_feed' | 'instagram_reels' | 'instagram_stories' | 'whatsapp_status' | 'tiktok' | 'youtube_shorts'

export type StatusConteudo = 'ideia' | 'roteiro' | 'gravado' | 'editado' | 'agendado' | 'publicado'

export type CategoriaConteudo = 'transformacao' | 'dica_treino' | 'dica_nutricao' | 'bastidores' | 'depoimento' | 'oferta' | 'motivacional' | 'resultado'

export interface MetricasPost {
  alcance?: number
  curtidas?: number
  comentarios?: number
  compartilhamentos?: number
  salvamentos?: number
  cliquesLink?: number
  leadsGerados?: number
}

export interface Conteudo {
  id: string
  titulo: string
  descricao?: string
  plataforma: PlataformaSocial
  categoria: CategoriaConteudo
  status: StatusConteudo
  roteiro?: string
  legenda?: string
  hashtags?: string[]
  dataPublicacao?: string
  linkPublicado?: string
  metricas?: MetricasPost
  alunoFeatured?: string
  criadoEm: string
  atualizadoEm: string
}

export interface IdeiaPauta {
  id: string
  titulo: string
  descricao?: string
  plataformas: PlataformaSocial[]
  categoria: CategoriaConteudo
  prioridade: Prioridade
  criadoEm: string
}

// ==================== FREQUÊNCIA ====================

export type TipoFrequencia = 'presencial' | 'online' | 'faltou' | 'cancelou'

export interface RegistroFrequencia {
  id: string
  alunoId: string
  alunoNome: string
  data: string
  hora: string
  diaSemana?: string
  tipo: TipoFrequencia
  treinoId?: string
  treinoNome?: string
  sessaoId?: string
  duracaoMinutos?: number
  observacoes?: string
}

// ==================== SESSÃO DE TREINO ====================

export type StatusSessao = 'ativa' | 'pausada' | 'encerrada'

export interface RegistroCargaSessao {
  exercicioId: string
  exercicioNome: string
  series: SerieRegistrada[]
}

export interface SessaoTreino {
  id: string
  alunoId: string
  alunoNome: string
  treinoId: string
  treinoNome: string
  dataInicio: string
  dataFim?: string
  duracaoSegundos?: number
  status: StatusSessao
  exerciciosConcluidos: number
  totalExercicios: number
  cargas: RegistroCargaSessao[]
  sensacao?: 1 | 2 | 3 | 4 | 5
  observacoes?: string
}

// ==================== CARGAS DO TREINO ====================

export interface SerieRegistrada {
  numeroSerie: number
  cargaKg: number
  repeticoesFeitas: number
  concluida: boolean
}

export interface TreinoSemana {
  id: string
  exercicioId: string
  alunoId: string
  semana: string
  dataRegistro: string
  series: SerieRegistrada[]
  observacoes?: string
  sensacaoSubjetiva?: 1 | 2 | 3 | 4 | 5
}
