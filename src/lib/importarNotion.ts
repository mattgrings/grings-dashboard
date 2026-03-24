import type { PlanoAluno, TipoProtocolo, StatusPlano, SituacaoProtocolo } from '../types'

export interface AlunoNotion {
  nome: string
  plano: PlanoAluno
  statusPlano: StatusPlano
  tipoProtocolo?: TipoProtocolo
  situacaoProtocolo: SituacaoProtocolo[]
  vencimento?: string
  dataRenovacao?: string
  notionPageId: string
}

// Dados exportados do Notion em 23/03/2026
export const alunosNotion: AlunoNotion[] = [
  { nome: 'Sintia Carolini Schutz', plano: 'Anual', statusPlano: 'Ativo', tipoProtocolo: 'Protocolo Completo', situacaoProtocolo: ['Entregue'], vencimento: '2026-06-20', dataRenovacao: '2025-06-20', notionPageId: '21871c238a89803b880bdb6dbebc3d44' },
  { nome: 'Barbara Gomes', plano: 'Anual', statusPlano: 'Ativo', tipoProtocolo: 'Protocolo Completo', situacaoProtocolo: ['Entregue'], vencimento: '2026-11-17', dataRenovacao: '2025-11-18', notionPageId: '21871c238a8980e3bf7df9fc9c978683' },
  { nome: 'Carlos Eduardo', plano: 'Semestral', statusPlano: 'Ativo', tipoProtocolo: 'Protocolo Completo', situacaoProtocolo: ['Entregue'], vencimento: '2026-03-15', dataRenovacao: '2025-09-15', notionPageId: '21871c238a8980f5abfecd67635820e9' },
  { nome: 'Jessica Ferreira', plano: 'Semestral', statusPlano: 'Ativo', tipoProtocolo: 'Protocolo Completo', situacaoProtocolo: ['Entregue'], vencimento: '2026-11-12', dataRenovacao: '2025-11-12', notionPageId: '21871c238a8980f3afabde1546ca99fe' },
  { nome: 'Everson Francisco', plano: 'Trimestral', statusPlano: 'Ativo', tipoProtocolo: 'Protocolo Completo', situacaoProtocolo: ['Entregue'], vencimento: '2025-06-22', dataRenovacao: '2025-03-22', notionPageId: '21a71c238a898058a725f136baed0cfc' },
  { nome: 'Aline Machado', plano: 'Trimestral', statusPlano: 'Ativo', tipoProtocolo: 'Protocolo Completo', situacaoProtocolo: ['Entregue', 'Observação'], vencimento: '2026-03-15', dataRenovacao: '2025-07-04', notionPageId: '21a71c238a898002bfd8ff7541142361' },
  { nome: 'Jheyson Santos', plano: 'Trimestral', statusPlano: 'Ativo', tipoProtocolo: 'Protocolo Completo', situacaoProtocolo: ['Entregue'], vencimento: '2026-06-08', dataRenovacao: '2026-03-02', notionPageId: '21a71c238a8980ce8d54eceb940326c9' },
  { nome: 'Bruna da Costa Machado', plano: 'Anual', statusPlano: 'Ativo', tipoProtocolo: 'Protocolo Completo', situacaoProtocolo: ['Entregue'], vencimento: '2026-05-15', dataRenovacao: '2025-10-16', notionPageId: '22371c238a898099af50f4461f14d322' },
  { nome: 'Nicole Aiko Hata', plano: 'Anual', statusPlano: 'Ativo', tipoProtocolo: 'Protocolo Completo', situacaoProtocolo: ['Entregue'], vencimento: '2027-03-16', dataRenovacao: '2026-03-16', notionPageId: '22371c238a8980188b2bd06fc19b51c5' },
  { nome: 'Palmer Silva Oliveira', plano: 'Anual', statusPlano: 'Ativo', tipoProtocolo: 'Protocolo Completo', situacaoProtocolo: ['Entregue'], vencimento: '2026-12-12', dataRenovacao: '2025-11-10', notionPageId: '22371c238a8980d89689d82089dd14ef' },
  { nome: 'Sofia Holzmann Antunes', plano: 'Anual', statusPlano: 'Ativo', tipoProtocolo: 'Protocolo Completo', situacaoProtocolo: ['Entregue'], vencimento: '2026-12-26', dataRenovacao: '2025-11-23', notionPageId: '22371c238a8980ddb4a7ca081fa80554' },
  { nome: 'Ariele Da Rossa', plano: 'Semestral', statusPlano: 'Ativo', tipoProtocolo: 'Protocolo Completo', situacaoProtocolo: ['Entregue'], vencimento: '2026-03-03', dataRenovacao: '2025-09-02', notionPageId: '26371c238a89809fadedcd9bb28ba8b3' },
  { nome: 'Luana Hermes', plano: 'Semestral', statusPlano: 'Ativo', tipoProtocolo: 'Protocolo Completo', situacaoProtocolo: ['Entregue', 'Observação'], vencimento: '2026-04-28', dataRenovacao: '2025-09-28', notionPageId: '28b71c238a89802e9b95f5f3be99d5c3' },
  { nome: 'Kamilla Pires', plano: 'Semestral', statusPlano: 'Ativo', tipoProtocolo: 'Plano Light', situacaoProtocolo: ['Entregue'], vencimento: '2026-04-27', dataRenovacao: '2025-10-27', notionPageId: '29371c238a89809890e9c6f4a4c1cf7e' },
  { nome: 'Bruna Alves Vidal (Casal)', plano: 'Semestral', statusPlano: 'Ativo', tipoProtocolo: 'Somente Treino', situacaoProtocolo: ['Entregue'], vencimento: '2026-05-10', dataRenovacao: '2025-11-10', notionPageId: '2a171c238a89800393a4f902e1636d49' },
  { nome: 'Gabriel Holzba (Casal)', plano: 'Semestral', statusPlano: 'Ativo', tipoProtocolo: 'Somente Treino', situacaoProtocolo: ['Entregue'], vencimento: '2026-05-10', dataRenovacao: '2025-11-10', notionPageId: '2a171c238a89806c9e7cfc2aa25fbf5b' },
  { nome: 'Patricia Holzmann', plano: 'Trimestral', statusPlano: 'Ativo', tipoProtocolo: 'Protocolo Completo', situacaoProtocolo: ['Entregue'], vencimento: '2026-05-18', dataRenovacao: '2025-11-18', notionPageId: '2a271c238a898072b671eab5a4685285' },
  { nome: 'Vitor Alexandre Andrade Pinto', plano: 'Semestral', statusPlano: 'Ativo', tipoProtocolo: 'Protocolo Completo', situacaoProtocolo: ['Entregue'], vencimento: '2026-05-18', dataRenovacao: '2025-11-18', notionPageId: '2a671c238a8980fb9f4ef00e8b7e5986' },
  { nome: 'Luisa Campani', plano: 'Parceria', statusPlano: 'Ativo', tipoProtocolo: 'Protocolo Completo', situacaoProtocolo: ['Entregue'], vencimento: '2026-02-18', dataRenovacao: '2025-11-18', notionPageId: '2a671c238a8980f487c2c1323d6df4c5' },
  { nome: 'Jessica Soares', plano: 'Trimestral', statusPlano: 'Ativo', tipoProtocolo: 'Protocolo Completo', situacaoProtocolo: ['Entregue', 'VERÃO LIGHT'], vencimento: '2026-02-24', dataRenovacao: '2025-11-24', notionPageId: '2bc71c238a898029a61cd6764ea60fb6' },
  { nome: 'Priscila Pichani', plano: 'Semestral', statusPlano: 'Ativo', tipoProtocolo: 'Protocolo Completo', situacaoProtocolo: ['Entregue'], vencimento: '2026-05-24', dataRenovacao: '2025-11-24', notionPageId: '2bc71c238a898079b4b2d296775ad0d9' },
  { nome: 'Gabriela Alvarenga', plano: 'Anual', statusPlano: 'Ativo', tipoProtocolo: 'Somente Treino', situacaoProtocolo: ['Entregue'], vencimento: '2027-01-04', dataRenovacao: '2026-01-04', notionPageId: '2cc71c238a8980c885b0ea6191eeb7c1' },
  { nome: 'Gustavo Pecly', plano: 'Trimestral', statusPlano: 'Ativo', tipoProtocolo: 'Protocolo Completo', situacaoProtocolo: ['Entregue', 'VERÃO LIGHT'], vencimento: '2026-04-04', dataRenovacao: '2026-01-04', notionPageId: '2ce71c238a8980668d5ac96fd6e877f0' },
  { nome: 'Sarah Nascimento', plano: 'Trimestral', statusPlano: 'Ativo', tipoProtocolo: 'Protocolo Completo', situacaoProtocolo: ['Entregue'], vencimento: '2026-04-08', dataRenovacao: '2026-01-08', notionPageId: '2e171c238a89801eb2a6ed91f22edf74' },
  { nome: 'Izabele Gontijo', plano: 'Parceria', statusPlano: 'Ativo', tipoProtocolo: 'Protocolo Completo', situacaoProtocolo: ['Entregue'], vencimento: '2026-03-01', dataRenovacao: '2026-01-01', notionPageId: '2e371c238a8980db8ee1e7460bd62f63' },
  { nome: 'Luana Jennifer', plano: 'Parceria', statusPlano: 'Ativo', tipoProtocolo: 'Protocolo Completo', situacaoProtocolo: ['Entregue'], vencimento: '2027-01-09', dataRenovacao: '2026-01-09', notionPageId: '2e271c238a8980e19d73da0644054311' },
  { nome: 'Maiara Diniz', plano: 'Trimestral', statusPlano: 'Ativo', tipoProtocolo: 'Protocolo Completo', situacaoProtocolo: ['Entregue'], vencimento: '2026-04-05', dataRenovacao: '2026-01-05', notionPageId: '2e171c238a8980818fa8d433ae535af8' },
  { nome: 'Alessandra Carvalho', plano: 'Parceria', statusPlano: 'Ativo', tipoProtocolo: 'Protocolo Completo', situacaoProtocolo: ['Entregue'], notionPageId: '2e371c238a89808ebf20c8ba29bf41af' },
  { nome: 'Augusto de Souza', plano: 'Anual', statusPlano: 'Ativo', tipoProtocolo: 'Protocolo Completo', situacaoProtocolo: ['Entregue'], vencimento: '2027-01-14', dataRenovacao: '2026-01-13', notionPageId: '2e171c238a8980e28c71ded80dc75624' },
  { nome: 'José Geraldo', plano: 'Trimestral', statusPlano: 'Ativo', situacaoProtocolo: ['Entregue'], vencimento: '2026-05-24', dataRenovacao: '2026-02-24', notionPageId: '2e371c238a89809ca863e9db6a1a5bc9' },
  { nome: 'Luiza Nascimento Torres', plano: 'Anual', statusPlano: 'Ativo', situacaoProtocolo: ['Entregue'], dataRenovacao: '2026-01-17', notionPageId: '2e671c238a89802e8d76de1c064fae3f' },
  { nome: 'Jézica Rodrigues', plano: 'Trimestral', statusPlano: 'Ativo', situacaoProtocolo: ['Entregue'], vencimento: '2026-04-14', dataRenovacao: '2026-01-14', notionPageId: '2e871c238a8980f7ad76cf548b513a4d' },
  { nome: 'Alexia Machado', plano: 'Semestral', statusPlano: 'Ativo', situacaoProtocolo: ['Entregue', 'VERÃO LIGHT'], vencimento: '2026-07-17', dataRenovacao: '2026-01-17', notionPageId: '2e371c238a89800298dff3ebc4ba34e1' },
  { nome: 'Claudio Ricardo Silva', plano: 'Trimestral', statusPlano: 'Ativo', situacaoProtocolo: ['Entregue', 'VERÃO LIGHT'], vencimento: '2026-04-18', dataRenovacao: '2026-01-18', notionPageId: '2ec71c238a8980dda482c9e5da2d8483' },
  { nome: 'Sara Ludmylla', plano: 'Mensal', statusPlano: 'Pendente', situacaoProtocolo: ['Chamar'], vencimento: '2026-02-21', dataRenovacao: '2026-01-21', notionPageId: '2e371c238a8980ef8794fc74f2cca102' },
  { nome: 'Maria Luísa Perolo Faria', plano: 'Anual', statusPlano: 'Ativo', situacaoProtocolo: ['Entregue'], vencimento: '2027-01-27', dataRenovacao: '2026-01-26', notionPageId: '2ee71c238a8980698659db631dcf0254' },
  { nome: 'Rebeca Lysias', plano: 'Anual', statusPlano: 'Ativo', situacaoProtocolo: ['Entregue'], vencimento: '2027-01-31', dataRenovacao: '2026-01-24', notionPageId: '2e171c238a89801b8cf3f3980dfef1e4' },
  { nome: 'Widerson Barbosa', plano: 'Trimestral', statusPlano: 'Ativo', situacaoProtocolo: ['Entregue'], vencimento: '2026-03-20', dataRenovacao: '2026-02-20', notionPageId: '2fb71c238a89808b8851f95e4aa94b41' },
  { nome: 'João Pedro Tosta', plano: 'Anual', statusPlano: 'Ativo', situacaoProtocolo: ['Entregue'], vencimento: '2027-02-01', dataRenovacao: '2026-01-31', notionPageId: '2ef71c238a8980deaf02f26588546fb0' },
  { nome: 'Sara Wosniak', plano: 'Anual', statusPlano: 'Ativo', situacaoProtocolo: ['Entregue'], vencimento: '2027-02-20', dataRenovacao: '2026-02-20', notionPageId: '2ee71c238a898095adbfe36b0f127ceb' },
  { nome: 'Heline Almeida', plano: 'Trimestral', statusPlano: 'Ativo', situacaoProtocolo: ['Entregue'], vencimento: '2026-05-09', dataRenovacao: '2026-02-09', notionPageId: '2fc71c238a89804289a8d053abdb718b' },
  { nome: 'Caterine Farias', plano: 'Trimestral', statusPlano: 'Ativo', situacaoProtocolo: ['Entregue'], vencimento: '2026-05-20', dataRenovacao: '2026-02-20', notionPageId: '2fd71c238a898088b913cbbe0df89c66' },
  { nome: 'Julia Jost Damma', plano: 'Anual', statusPlano: 'Ativo', situacaoProtocolo: ['Entregue'], vencimento: '2027-03-09', dataRenovacao: '2026-03-09', notionPageId: '31f71c238a8980c5959dfe52c7650339' },
  { nome: 'Matheus Becker Da Rosa', plano: 'Anual', statusPlano: 'Ativo', situacaoProtocolo: ['Entregue'], vencimento: '2027-03-09', dataRenovacao: '2026-03-06', notionPageId: '31f71c238a8980a7bd73cecc7ee7de27' },
  { nome: 'Eduarda Fraga', plano: 'Parceria', statusPlano: 'Ativo', situacaoProtocolo: ['Entregue'], notionPageId: '31f71c238a89801e8e70e40280070694' },
  { nome: 'Izabella Piccolo', plano: 'Trimestral', statusPlano: 'Ativo', situacaoProtocolo: ['Entregue'], vencimento: '2026-06-08', dataRenovacao: '2026-03-06', notionPageId: '31f71c238a89805e9cf5ed7ca111677d' },
  { nome: 'Marina Constanza Hidalgo', plano: 'Trimestral', statusPlano: 'Ativo', situacaoProtocolo: ['Entregue'], vencimento: '2026-06-02', dataRenovacao: '2026-03-02', notionPageId: '31f71c238a898029ad2df32494d391b6' },
  { nome: 'Julia Breier', plano: 'Parceria', statusPlano: 'Ativo', situacaoProtocolo: ['Entregue'], notionPageId: '31f71c238a8980c1b900f1055169a3aa' },
  { nome: 'Kauane Jessica', plano: 'Trimestral', statusPlano: 'Ativo', situacaoProtocolo: ['Entregue'], vencimento: '2026-04-27', dataRenovacao: '2026-01-27', notionPageId: '31f71c238a89802eaac1de5cb6692405' },
  { nome: 'Larissa Xavier Pereira', plano: 'Trimestral', statusPlano: 'Ativo', situacaoProtocolo: ['Não iniciada'], vencimento: '2026-06-16', dataRenovacao: '2026-03-16', notionPageId: '32171c238a8980798444de8adeeba30b' },
  { nome: 'Carolina Pertrack', plano: 'Trimestral', statusPlano: 'Ativo', situacaoProtocolo: ['Não iniciada'], notionPageId: '32571c238a8980c8a1cdf7a7e1ee550b' },
  { nome: 'João Pedro Finatto', plano: 'Mensal', statusPlano: 'Ativo', situacaoProtocolo: ['Não iniciada'], notionPageId: '32671c238a8980e19ffef930f85f482a' },
  { nome: 'Rafaela Spolidorio', plano: 'Semestral', statusPlano: 'Ativo', situacaoProtocolo: ['Não iniciada'], notionPageId: '32771c238a8980fe8f21f38e2cd66ec9' },
]
