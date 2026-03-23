export type GrupoMuscularBib =
  | 'peito' | 'costas' | 'ombros' | 'biceps' | 'triceps'
  | 'abdomen' | 'gluteos' | 'quadriceps' | 'posterior' | 'panturrilha'
  | 'antebraco' | 'cardio' | 'funcional'

export interface ExercicioBiblioteca {
  id: string
  nome: string
  grupoMuscular: GrupoMuscularBib
  equipamento: 'barra' | 'halteres' | 'maquina' | 'cabo' | 'peso_corpo' | 'outro'
  instrucoes?: string
  linkVideo?: string
  gifUrl?: string
  gifBase64?: string
  dificuldade: 'iniciante' | 'intermediario' | 'avancado'
  criadoEm: string
}

const raw: Omit<ExercicioBiblioteca, 'id' | 'criadoEm'>[] = [
  // ── PEITO ──
  { nome: 'Supino Reto com Barra',      grupoMuscular: 'peito',      equipamento: 'barra',      dificuldade: 'intermediario', linkVideo: '' },
  { nome: 'Supino Inclinado Halteres',   grupoMuscular: 'peito',      equipamento: 'halteres',   dificuldade: 'intermediario', linkVideo: '' },
  { nome: 'Crossover no Cabo',           grupoMuscular: 'peito',      equipamento: 'cabo',       dificuldade: 'iniciante',     linkVideo: '' },
  { nome: 'Flexão de Braço',             grupoMuscular: 'peito',      equipamento: 'peso_corpo', dificuldade: 'iniciante',     linkVideo: '' },
  { nome: 'Peck Deck',                   grupoMuscular: 'peito',      equipamento: 'maquina',    dificuldade: 'iniciante',     linkVideo: '' },
  { nome: 'Supino Declinado',            grupoMuscular: 'peito',      equipamento: 'barra',      dificuldade: 'intermediario', linkVideo: '' },
  { nome: 'Pullover',                    grupoMuscular: 'peito',      equipamento: 'halteres',   dificuldade: 'intermediario', linkVideo: '' },

  // ── COSTAS ──
  { nome: 'Puxada Frontal',              grupoMuscular: 'costas',     equipamento: 'maquina',    dificuldade: 'iniciante',     linkVideo: '' },
  { nome: 'Remada Curvada com Barra',    grupoMuscular: 'costas',     equipamento: 'barra',      dificuldade: 'intermediario', linkVideo: '' },
  { nome: 'Remada Unilateral',           grupoMuscular: 'costas',     equipamento: 'halteres',   dificuldade: 'iniciante',     linkVideo: '' },
  { nome: 'Barra Fixa',                  grupoMuscular: 'costas',     equipamento: 'peso_corpo', dificuldade: 'avancado',      linkVideo: '' },
  { nome: 'Remada Baixa no Cabo',        grupoMuscular: 'costas',     equipamento: 'cabo',       dificuldade: 'iniciante',     linkVideo: '' },
  { nome: 'Levantamento Terra',          grupoMuscular: 'costas',     equipamento: 'barra',      dificuldade: 'avancado',      linkVideo: '' },
  { nome: 'Remada Cavalinho',            grupoMuscular: 'costas',     equipamento: 'maquina',    dificuldade: 'iniciante',     linkVideo: '' },

  // ── OMBROS ──
  { nome: 'Desenvolvimento com Barra',   grupoMuscular: 'ombros',     equipamento: 'barra',      dificuldade: 'intermediario', linkVideo: '' },
  { nome: 'Desenvolvimento Halteres',    grupoMuscular: 'ombros',     equipamento: 'halteres',   dificuldade: 'iniciante',     linkVideo: '' },
  { nome: 'Elevação Lateral',            grupoMuscular: 'ombros',     equipamento: 'halteres',   dificuldade: 'iniciante',     linkVideo: '' },
  { nome: 'Elevação Frontal',            grupoMuscular: 'ombros',     equipamento: 'halteres',   dificuldade: 'iniciante',     linkVideo: '' },
  { nome: 'Encolhimento de Ombros',      grupoMuscular: 'ombros',     equipamento: 'halteres',   dificuldade: 'iniciante',     linkVideo: '' },
  { nome: 'Face Pull',                   grupoMuscular: 'ombros',     equipamento: 'cabo',       dificuldade: 'iniciante',     linkVideo: '' },

  // ── BÍCEPS ──
  { nome: 'Rosca Direta com Barra',      grupoMuscular: 'biceps',     equipamento: 'barra',      dificuldade: 'iniciante',     linkVideo: '' },
  { nome: 'Rosca Alternada Halteres',    grupoMuscular: 'biceps',     equipamento: 'halteres',   dificuldade: 'iniciante',     linkVideo: '' },
  { nome: 'Rosca Martelo',               grupoMuscular: 'biceps',     equipamento: 'halteres',   dificuldade: 'iniciante',     linkVideo: '' },
  { nome: 'Rosca Concentrada',           grupoMuscular: 'biceps',     equipamento: 'halteres',   dificuldade: 'iniciante',     linkVideo: '' },
  { nome: 'Rosca no Cabo',               grupoMuscular: 'biceps',     equipamento: 'cabo',       dificuldade: 'iniciante',     linkVideo: '' },
  { nome: 'Rosca Scott',                 grupoMuscular: 'biceps',     equipamento: 'maquina',    dificuldade: 'iniciante',     linkVideo: '' },

  // ── TRÍCEPS ──
  { nome: 'Tríceps Corda no Cabo',       grupoMuscular: 'triceps',    equipamento: 'cabo',       dificuldade: 'iniciante',     linkVideo: '' },
  { nome: 'Tríceps Testa',               grupoMuscular: 'triceps',    equipamento: 'barra',      dificuldade: 'intermediario', linkVideo: '' },
  { nome: 'Tríceps Francês',             grupoMuscular: 'triceps',    equipamento: 'halteres',   dificuldade: 'iniciante',     linkVideo: '' },
  { nome: 'Mergulho nas Paralelas',      grupoMuscular: 'triceps',    equipamento: 'peso_corpo', dificuldade: 'avancado',      linkVideo: '' },
  { nome: 'Kickback de Tríceps',         grupoMuscular: 'triceps',    equipamento: 'halteres',   dificuldade: 'iniciante',     linkVideo: '' },

  // ── QUADRÍCEPS ──
  { nome: 'Agachamento Livre',           grupoMuscular: 'quadriceps', equipamento: 'barra',      dificuldade: 'avancado',      linkVideo: '' },
  { nome: 'Leg Press 45°',               grupoMuscular: 'quadriceps', equipamento: 'maquina',    dificuldade: 'iniciante',     linkVideo: '' },
  { nome: 'Cadeira Extensora',           grupoMuscular: 'quadriceps', equipamento: 'maquina',    dificuldade: 'iniciante',     linkVideo: '' },
  { nome: 'Afundo com Halteres',         grupoMuscular: 'quadriceps', equipamento: 'halteres',   dificuldade: 'intermediario', linkVideo: '' },
  { nome: 'Agachamento Hack',            grupoMuscular: 'quadriceps', equipamento: 'maquina',    dificuldade: 'intermediario', linkVideo: '' },

  // ── POSTERIOR ──
  { nome: 'Mesa Flexora',                grupoMuscular: 'posterior',  equipamento: 'maquina',    dificuldade: 'iniciante',     linkVideo: '' },
  { nome: 'Stiff com Barra',             grupoMuscular: 'posterior',  equipamento: 'barra',      dificuldade: 'intermediario', linkVideo: '' },
  { nome: 'Cadeira Flexora',             grupoMuscular: 'posterior',  equipamento: 'maquina',    dificuldade: 'iniciante',     linkVideo: '' },

  // ── GLÚTEOS ──
  { nome: 'Hip Thrust',                  grupoMuscular: 'gluteos',    equipamento: 'barra',      dificuldade: 'intermediario', linkVideo: '' },
  { nome: 'Abdução de Quadril',          grupoMuscular: 'gluteos',    equipamento: 'maquina',    dificuldade: 'iniciante',     linkVideo: '' },

  // ── PANTURRILHA ──
  { nome: 'Panturrilha em Pé',           grupoMuscular: 'panturrilha', equipamento: 'maquina',   dificuldade: 'iniciante',     linkVideo: '' },
  { nome: 'Panturrilha Sentada',         grupoMuscular: 'panturrilha', equipamento: 'maquina',   dificuldade: 'iniciante',     linkVideo: '' },

  // ── ABDÔMEN ──
  { nome: 'Abdominal Crunch',            grupoMuscular: 'abdomen',    equipamento: 'peso_corpo', dificuldade: 'iniciante',     linkVideo: '' },
  { nome: 'Prancha Isométrica',          grupoMuscular: 'abdomen',    equipamento: 'peso_corpo', dificuldade: 'iniciante',     linkVideo: '' },
  { nome: 'Abdominal Infra',             grupoMuscular: 'abdomen',    equipamento: 'peso_corpo', dificuldade: 'iniciante',     linkVideo: '' },
  { nome: 'Russian Twist',               grupoMuscular: 'abdomen',    equipamento: 'peso_corpo', dificuldade: 'intermediario', linkVideo: '' },
  { nome: 'Abdominal Cabo',              grupoMuscular: 'abdomen',    equipamento: 'cabo',       dificuldade: 'iniciante',     linkVideo: '' },

  // ── CARDIO ──
  { nome: 'Esteira',                     grupoMuscular: 'cardio',     equipamento: 'maquina',    dificuldade: 'iniciante',     linkVideo: '' },
  { nome: 'Bicicleta Ergométrica',       grupoMuscular: 'cardio',     equipamento: 'maquina',    dificuldade: 'iniciante',     linkVideo: '' },
  { nome: 'Elíptico',                    grupoMuscular: 'cardio',     equipamento: 'maquina',    dificuldade: 'iniciante',     linkVideo: '' },
  { nome: 'Corda (Jump Rope)',           grupoMuscular: 'cardio',     equipamento: 'outro',      dificuldade: 'iniciante',     linkVideo: '' },
  { nome: 'Burpee',                      grupoMuscular: 'cardio',     equipamento: 'peso_corpo', dificuldade: 'avancado',      linkVideo: '' },
]

// Generate with stable IDs
export const EXERCICIOS_BIBLIOTECA: ExercicioBiblioteca[] = raw.map((ex, i) => ({
  ...ex,
  id: `ex-${String(i + 1).padStart(3, '0')}`,
  criadoEm: new Date().toISOString(),
}))

export const GRUPOS_MUSCULARES: { id: GrupoMuscularBib; label: string; cor: string }[] = [
  { id: 'peito',       label: 'Peito',       cor: '#FF6B6B' },
  { id: 'costas',      label: 'Costas',      cor: '#4ECDC4' },
  { id: 'ombros',      label: 'Ombros',      cor: '#FFE66D' },
  { id: 'biceps',      label: 'Bíceps',      cor: '#A8E6CF' },
  { id: 'triceps',     label: 'Tríceps',     cor: '#FF8B94' },
  { id: 'quadriceps',  label: 'Quadríceps',  cor: '#88D8B0' },
  { id: 'posterior',   label: 'Posterior',    cor: '#FFAAA5' },
  { id: 'gluteos',     label: 'Glúteos',     cor: '#FF8C94' },
  { id: 'panturrilha', label: 'Panturrilha', cor: '#A8D8EA' },
  { id: 'abdomen',     label: 'Abdômen',     cor: '#96CEB4' },
  { id: 'antebraco',   label: 'Antebraço',   cor: '#FFEAA7' },
  { id: 'cardio',      label: 'Cardio',      cor: '#00E620' },
  { id: 'funcional',   label: 'Funcional',   cor: '#DDA0DD' },
]
