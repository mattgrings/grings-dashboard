export interface TemplateTreinoExercicio {
  nome: string
  series: number
  repeticoes: string
  descanso: string
}

export interface TemplateTreinoDia {
  letra: string
  nome: string
  exercicios: TemplateTreinoExercicio[]
}

export interface TemplateTreino {
  id: string
  nome: string
  descricao: string
  objetivo: string
  nivel: 'iniciante' | 'intermediario' | 'avancado'
  diasSemana: number[]
  treinos: TemplateTreinoDia[]
}

export const TEMPLATES_TREINO: TemplateTreino[] = [
  {
    id: 'abc_hipertrofia',
    nome: 'ABC — Hipertrofia Clássica',
    descricao: '3 dias por semana. A: Peito+Ombro+Tríceps, B: Costas+Bíceps, C: Pernas',
    objetivo: 'Ganho de massa',
    nivel: 'intermediario',
    diasSemana: [1, 3, 5],
    treinos: [
      {
        letra: 'A',
        nome: 'Treino A — Peito, Ombro e Tríceps',
        exercicios: [
          { nome: 'Supino Reto com Barra',     series: 4, repeticoes: '8-12',  descanso: '90s' },
          { nome: 'Supino Inclinado Halteres',  series: 3, repeticoes: '10-12', descanso: '75s' },
          { nome: 'Crossover no Cabo',          series: 3, repeticoes: '12-15', descanso: '60s' },
          { nome: 'Desenvolvimento Halteres',   series: 4, repeticoes: '8-12',  descanso: '90s' },
          { nome: 'Elevação Lateral',           series: 3, repeticoes: '12-15', descanso: '60s' },
          { nome: 'Tríceps Corda no Cabo',      series: 3, repeticoes: '12-15', descanso: '60s' },
          { nome: 'Tríceps Testa',              series: 3, repeticoes: '10-12', descanso: '60s' },
        ],
      },
      {
        letra: 'B',
        nome: 'Treino B — Costas e Bíceps',
        exercicios: [
          { nome: 'Puxada Frontal',             series: 4, repeticoes: '8-12',  descanso: '90s' },
          { nome: 'Remada Curvada com Barra',   series: 4, repeticoes: '8-12',  descanso: '90s' },
          { nome: 'Remada Unilateral',          series: 3, repeticoes: '10-12', descanso: '75s' },
          { nome: 'Remada Baixa no Cabo',       series: 3, repeticoes: '12-15', descanso: '60s' },
          { nome: 'Rosca Direta com Barra',     series: 3, repeticoes: '10-12', descanso: '75s' },
          { nome: 'Rosca Alternada Halteres',   series: 3, repeticoes: '10-12', descanso: '60s' },
          { nome: 'Rosca Martelo',              series: 2, repeticoes: '12',    descanso: '60s' },
        ],
      },
      {
        letra: 'C',
        nome: 'Treino C — Pernas Completo',
        exercicios: [
          { nome: 'Agachamento Livre',          series: 4, repeticoes: '8-12',  descanso: '120s' },
          { nome: 'Leg Press 45°',              series: 4, repeticoes: '12-15', descanso: '90s' },
          { nome: 'Cadeira Extensora',          series: 3, repeticoes: '12-15', descanso: '60s' },
          { nome: 'Mesa Flexora',               series: 3, repeticoes: '12-15', descanso: '60s' },
          { nome: 'Stiff com Barra',            series: 3, repeticoes: '10-12', descanso: '75s' },
          { nome: 'Hip Thrust',                 series: 3, repeticoes: '12-15', descanso: '75s' },
          { nome: 'Panturrilha em Pé',          series: 4, repeticoes: '15-20', descanso: '45s' },
        ],
      },
    ],
  },
  {
    id: 'full_body_iniciante',
    nome: 'Full Body — Iniciante',
    descricao: '3 dias por semana. Corpo todo em cada sessão. Ideal para quem está começando.',
    objetivo: 'Condicionamento inicial',
    nivel: 'iniciante',
    diasSemana: [1, 3, 5],
    treinos: [
      {
        letra: 'A',
        nome: 'Full Body',
        exercicios: [
          { nome: 'Agachamento Livre',          series: 3, repeticoes: '12',  descanso: '90s' },
          { nome: 'Supino Reto com Barra',      series: 3, repeticoes: '12',  descanso: '90s' },
          { nome: 'Puxada Frontal',             series: 3, repeticoes: '12',  descanso: '90s' },
          { nome: 'Desenvolvimento Halteres',   series: 3, repeticoes: '12',  descanso: '90s' },
          { nome: 'Rosca Direta com Barra',     series: 2, repeticoes: '12',  descanso: '60s' },
          { nome: 'Tríceps Corda no Cabo',      series: 2, repeticoes: '12',  descanso: '60s' },
          { nome: 'Prancha Isométrica',         series: 3, repeticoes: '30s', descanso: '45s' },
        ],
      },
    ],
  },
  {
    id: 'upper_lower',
    nome: 'Upper/Lower — Intermediário',
    descricao: '4 dias por semana. Alternando entre membros superiores e inferiores.',
    objetivo: 'Força e hipertrofia',
    nivel: 'intermediario',
    diasSemana: [1, 2, 4, 5],
    treinos: [
      {
        letra: 'A',
        nome: 'Upper — Empurrar',
        exercicios: [
          { nome: 'Supino Reto com Barra',      series: 4, repeticoes: '6-8',   descanso: '120s' },
          { nome: 'Desenvolvimento com Barra',  series: 4, repeticoes: '8-10',  descanso: '90s' },
          { nome: 'Supino Inclinado Halteres',  series: 3, repeticoes: '10-12', descanso: '75s' },
          { nome: 'Elevação Lateral',           series: 3, repeticoes: '15',    descanso: '60s' },
          { nome: 'Tríceps Corda no Cabo',      series: 3, repeticoes: '12-15', descanso: '60s' },
        ],
      },
      {
        letra: 'B',
        nome: 'Lower — Pernas',
        exercicios: [
          { nome: 'Agachamento Livre',          series: 4, repeticoes: '6-8',   descanso: '120s' },
          { nome: 'Stiff com Barra',            series: 3, repeticoes: '8-10',  descanso: '90s' },
          { nome: 'Leg Press 45°',              series: 3, repeticoes: '12-15', descanso: '90s' },
          { nome: 'Cadeira Extensora',          series: 3, repeticoes: '12-15', descanso: '60s' },
          { nome: 'Mesa Flexora',               series: 3, repeticoes: '12-15', descanso: '60s' },
          { nome: 'Panturrilha em Pé',          series: 4, repeticoes: '15-20', descanso: '45s' },
        ],
      },
      {
        letra: 'C',
        nome: 'Upper — Puxar',
        exercicios: [
          { nome: 'Barra Fixa',                 series: 4, repeticoes: '6-8',   descanso: '120s' },
          { nome: 'Remada Curvada com Barra',   series: 4, repeticoes: '8-10',  descanso: '90s' },
          { nome: 'Remada Unilateral',          series: 3, repeticoes: '10-12', descanso: '75s' },
          { nome: 'Face Pull',                  series: 3, repeticoes: '15',    descanso: '60s' },
          { nome: 'Rosca Direta com Barra',     series: 3, repeticoes: '10-12', descanso: '75s' },
          { nome: 'Rosca Martelo',              series: 2, repeticoes: '12',    descanso: '60s' },
        ],
      },
      {
        letra: 'D',
        nome: 'Lower — Glúteos e Posterior',
        exercicios: [
          { nome: 'Hip Thrust',                 series: 4, repeticoes: '10-12', descanso: '90s' },
          { nome: 'Afundo com Halteres',        series: 3, repeticoes: '12',    descanso: '75s' },
          { nome: 'Cadeira Flexora',            series: 3, repeticoes: '12-15', descanso: '60s' },
          { nome: 'Abdução de Quadril',         series: 3, repeticoes: '15',    descanso: '60s' },
          { nome: 'Panturrilha Sentada',        series: 4, repeticoes: '15-20', descanso: '45s' },
          { nome: 'Prancha Isométrica',         series: 3, repeticoes: '45s',   descanso: '45s' },
        ],
      },
    ],
  },
]
