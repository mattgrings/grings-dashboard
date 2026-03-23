export interface Mensagem {
  id: string
  conversaId: string
  remetente: 'admin' | 'aluno'
  remetenteNome: string
  conteudo: string
  tipo: 'texto' | 'imagem'
  lida: boolean
  criadoEm: string
}

export interface Conversa {
  id: string
  alunoId: string
  alunoNome: string
  ultimaMensagem?: string
  ultimaAtividade: string
  naoLidasAdmin: number
  naoLidasAluno: number
}
