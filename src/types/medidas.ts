export interface Circunferencias {
  cintura?: number
  quadril?: number
  peitoral?: number
  bracoDireito?: number
  bracoEsquerdo?: number
  coxaDireita?: number
  coxaEsquerda?: number
  panturrilhaDireita?: number
  panturrilhaEsquerda?: number
  abdomen?: number
}

export interface MedidaCorporal {
  id: string
  alunoId: string
  data: string
  peso: number
  altura?: number
  gorduraCorporal?: number
  massaMuscular?: number
  imc?: number
  circunferencias: Circunferencias
  observacoes?: string
  registradoPor: 'admin' | 'aluno'
}
