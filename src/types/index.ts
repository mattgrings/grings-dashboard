// ==================== AUTH ====================

export interface User {
  id: string
  nome: string
  email: string
  senha: string
  role: 'admin' | 'aluno'
  avatar?: string
}

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
