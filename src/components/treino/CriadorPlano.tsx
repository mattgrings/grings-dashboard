import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Barbell,
  Plus,
  Trash,
  Pencil,
  MagnifyingGlass,
  YoutubeLogo,
  X,
  Check,
  Minus,
} from '@phosphor-icons/react'
import InputGlow from '../ui/InputGlow'
import BottomSheet from '../ui/BottomSheet'
import { EXERCICIOS_BIBLIOTECA, GRUPOS_MUSCULARES, type GrupoMuscularBib } from '../../data/exerciciosBiblioteca'
import { useAlunosStore } from '../../store/alunosStore'
import { usePlanoTreinoStore } from '../../store/planoTreinoStore'
import type {
  PlanoTreinoCompleto,
  TreinoDia,
  ExercicioNoPlano,
  SerieConfig,
  DiaSemana,
  ExercicioCompleto,
} from '../../types/treino'

const DIAS_SEMANA: { id: DiaSemana; label: string; abrev: string }[] = [
  { id: 'seg', label: 'Segunda', abrev: 'S' },
  { id: 'ter', label: 'Terça', abrev: 'T' },
  { id: 'qua', label: 'Quarta', abrev: 'Q' },
  { id: 'qui', label: 'Quinta', abrev: 'Q' },
  { id: 'sex', label: 'Sexta', abrev: 'S' },
  { id: 'sab', label: 'Sábado', abrev: 'S' },
  { id: 'dom', label: 'Domingo', abrev: 'D' },
]

const LETRAS = ['A', 'B', 'C', 'D', 'E', 'F']

const OBJETIVOS = [
  'Ganho de massa',
  'Emagrecimento',
  'Condicionamento',
  'Força',
  'Recomposição corporal',
  'Saúde geral',
]

const REPS_OPCOES = ['6-8', '8-10', '8-12', '10-12', '12-15', '15-20', 'até a falha', '30s', '45s', '60s']

const DESCANSO_OPCOES = [
  { label: '30s', value: 30 },
  { label: '45s', value: 45 },
  { label: '60s', value: 60 },
  { label: '90s', value: 90 },
  { label: '2min', value: 120 },
  { label: '3min', value: 180 },
]

interface CriadorPlanoProps {
  alunoIdInicial?: string
  planoExistente?: PlanoTreinoCompleto
  onSalvar: (plano: PlanoTreinoCompleto) => void
  onFechar: () => void
}

interface PlanoForm {
  alunoId: string
  nome: string
  descricao: string
  objetivo: string
  nivel: 'iniciante' | 'intermediario' | 'avancado'
  dataInicio: string
  dataFim: string
  observacoesGerais: string
  treinos: TreinoDia[]
}

function criarPlanoVazio(alunoId: string): PlanoForm {
  return {
    alunoId,
    nome: '',
    descricao: '',
    objetivo: OBJETIVOS[0],
    nivel: 'intermediario',
    dataInicio: new Date().toISOString().split('T')[0],
    dataFim: '',
    observacoesGerais: '',
    treinos: [],
  }
}

export default function CriadorPlano({
  alunoIdInicial,
  planoExistente,
  onSalvar,
  onFechar,
}: CriadorPlanoProps) {
  const [step, setStep] = useState(1)
  const [plano, setPlano] = useState<PlanoForm>(() =>
    planoExistente
      ? {
          alunoId: planoExistente.alunoId,
          nome: planoExistente.nome,
          descricao: planoExistente.descricao,
          objetivo: planoExistente.objetivo,
          nivel: planoExistente.nivel,
          dataInicio: planoExistente.dataInicio,
          dataFim: planoExistente.dataFim ?? '',
          observacoesGerais: planoExistente.observacoesGerais,
          treinos: planoExistente.treinos,
        }
      : criarPlanoVazio(alunoIdInicial ?? '')
  )
  const [diaAtivo, setDiaAtivo] = useState(0)
  const [modalDia, setModalDia] = useState(false)
  const [modalExercicio, setModalExercicio] = useState(false)
  const [editandoDia, setEditandoDia] = useState<TreinoDia | null>(null)
  const [exercicioConfig, setExercicioConfig] = useState<ExercicioNoPlano | null>(null)

  const alunos = useAlunosStore((s) => s.alunos).filter((a) => a.status === 'ativo')

  const steps = [
    { n: 1, label: 'Informações' },
    { n: 2, label: 'Dias de Treino' },
    { n: 3, label: 'Exercícios' },
    { n: 4, label: 'Configurações' },
    { n: 5, label: 'Revisão' },
  ]

  const handleSalvar = () => {
    const now = new Date().toISOString()
    onSalvar({
      id: planoExistente?.id ?? crypto.randomUUID(),
      ...plano,
      dataFim: plano.dataFim || undefined,
      ativo: true,
      criadoPor: 'Admin',
      criadoEm: planoExistente?.criadoEm ?? now,
      atualizadoEm: now,
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0A] flex flex-col">
      {/* Header + Steps */}
      <div
        className="sticky top-0 z-20 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-white/5 px-4 py-4"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 16px)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <button onClick={onFechar} className="touch-manipulation">
            <ArrowLeft size={24} className="text-white" />
          </button>
          <h1 className="font-bold text-white">
            {planoExistente ? 'Editar Plano' : 'Novo Plano de Treino'}
          </h1>
          <div className="w-8" />
        </div>
        <div className="flex gap-1">
          {steps.map((s) => (
            <div key={s.n} className="flex-1">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  s.n <= step ? 'bg-[#00E620]' : 'bg-white/10'
                }`}
              />
              <p
                className={`text-[10px] mt-1 text-center hidden sm:block ${
                  s.n === step ? 'text-[#00E620] font-medium' : 'text-gray-600'
                }`}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
        style={{
          paddingBottom: 'calc(max(env(safe-area-inset-bottom), 0px) + 100px)',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
          >
            {step === 1 && (
              <StepInfo plano={plano} onChange={setPlano} alunos={alunos} />
            )}
            {step === 2 && (
              <StepDias
                plano={plano}
                onChange={setPlano}
                onAbrirModal={(dia) => {
                  setEditandoDia(dia)
                  setModalDia(true)
                }}
              />
            )}
            {step === 3 && (
              <StepExercicios
                plano={plano}
                onChange={setPlano}
                diaAtivo={diaAtivo}
                onChangeDia={setDiaAtivo}
                onAbrirBiblioteca={() => setModalExercicio(true)}
                onConfigurar={setExercicioConfig}
              />
            )}
            {step === 4 && (
              <StepConfiguracoes
                plano={plano}
                onChange={setPlano}
                diaAtivo={diaAtivo}
                onChangeDia={setDiaAtivo}
                onConfigurar={setExercicioConfig}
              />
            )}
            {step === 5 && <StepRevisao plano={plano} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom navigation */}
      <div
        className="fixed bottom-0 left-0 right-0 z-20 px-4 py-4 bg-[#0A0A0A] border-t border-white/5"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}
      >
        <div className="flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex-1 py-3.5 rounded-2xl border border-white/10 text-gray-400 font-medium touch-manipulation"
            >
              Voltar
            </button>
          )}
          {step < 5 ? (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setStep((s) => s + 1)}
              className="flex-1 py-3.5 rounded-2xl bg-[#00E620] text-black font-bold shadow-[0_0_20px_rgba(0,230,32,0.4)] touch-manipulation"
            >
              Continuar
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSalvar}
              className="flex-1 py-3.5 rounded-2xl bg-[#00E620] text-black font-bold shadow-[0_0_20px_rgba(0,230,32,0.4)] touch-manipulation"
            >
              Salvar Plano
            </motion.button>
          )}
        </div>
      </div>

      {/* Modal: Criar/Editar Dia */}
      <ModalDiaTreino
        aberto={modalDia}
        diaExistente={editandoDia}
        onFechar={() => {
          setModalDia(false)
          setEditandoDia(null)
        }}
        onSalvar={(dia) => {
          if (editandoDia) {
            setPlano((p) => ({
              ...p,
              treinos: p.treinos.map((t) => (t.id === dia.id ? dia : t)),
            }))
          } else {
            setPlano((p) => ({ ...p, treinos: [...p.treinos, dia] }))
          }
          setModalDia(false)
          setEditandoDia(null)
        }}
      />

      {/* Modal: Adicionar Exercício */}
      <ModalBiblioteca
        aberto={modalExercicio}
        onFechar={() => setModalExercicio(false)}
        onSelecionar={(ex) => {
          const exercicioNoPlano: ExercicioNoPlano = {
            id: crypto.randomUUID(),
            exercicioId: ex.id,
            exercicio: {
              ...ex,
              instrucoes: '',
              dicas: '',
              errosComuns: '',
              custom: ex.id.startsWith('custom'),
            } as ExercicioCompleto,
            series: [
              { numeroSerie: 1, repeticoes: '10-12', tempoDescanso: 60, tipoSerie: 'normal' },
              { numeroSerie: 2, repeticoes: '10-12', tempoDescanso: 60, tipoSerie: 'normal' },
              { numeroSerie: 3, repeticoes: '10-12', tempoDescanso: 60, tipoSerie: 'normal' },
            ],
            observacoesAdmin: '',
            ordem: plano.treinos[diaAtivo]?.exercicios.length ?? 0,
          }
          setPlano((p) => ({
            ...p,
            treinos: p.treinos.map((t, i) =>
              i === diaAtivo ? { ...t, exercicios: [...t.exercicios, exercicioNoPlano] } : t
            ),
          }))
          setModalExercicio(false)
        }}
      />

      {/* Modal: Configurar Exercício */}
      {exercicioConfig && (
        <ModalConfigurarExercicio
          exercicio={exercicioConfig}
          onFechar={() => setExercicioConfig(null)}
          onSalvar={(updated) => {
            setPlano((p) => ({
              ...p,
              treinos: p.treinos.map((t) => ({
                ...t,
                exercicios: t.exercicios.map((e) => (e.id === updated.id ? updated : e)),
              })),
            }))
            setExercicioConfig(null)
          }}
          onRemover={() => {
            setPlano((p) => ({
              ...p,
              treinos: p.treinos.map((t) => ({
                ...t,
                exercicios: t.exercicios.filter((e) => e.id !== exercicioConfig.id),
              })),
            }))
            setExercicioConfig(null)
          }}
        />
      )}
    </div>
  )
}

// ═══════════════════════════════════
// STEP 1 — Informações
// ═══════════════════════════════════
function StepInfo({
  plano,
  onChange,
  alunos,
}: {
  plano: PlanoForm
  onChange: (p: PlanoForm) => void
  alunos: { id: string; nome: string }[]
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white">Informações do Plano</h2>
        <p className="text-gray-500 text-sm mt-1">Defina os dados gerais do plano de treino.</p>
      </div>

      {/* Aluno */}
      <div className="space-y-1.5">
        <label className="text-sm text-gray-400 font-medium">Aluno *</label>
        <select
          value={plano.alunoId}
          onChange={(e) => onChange({ ...plano, alunoId: e.target.value })}
          className="w-full bg-[#111111] border border-white/10 rounded-xl py-3.5 px-4 text-white outline-none focus:border-[#00E620] transition-colors"
        >
          <option value="">Selecionar aluno...</option>
          {alunos.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nome}
            </option>
          ))}
        </select>
      </div>

      <InputGlow
        label="Nome do plano *"
        placeholder='Ex: "Hipertrofia Q1 2026"'
        icon={Barbell}
        value={plano.nome}
        onChange={(e) => onChange({ ...plano, nome: e.target.value })}
      />

      {/* Objetivo */}
      <div className="space-y-1.5">
        <label className="text-sm text-gray-400 font-medium">Objetivo</label>
        <div className="flex gap-2 flex-wrap">
          {OBJETIVOS.map((obj) => (
            <button
              key={obj}
              onClick={() => onChange({ ...plano, objetivo: obj })}
              className={`px-3 py-2 rounded-xl text-sm border transition-all touch-manipulation ${
                plano.objetivo === obj
                  ? 'bg-[#00E620] text-black font-bold border-[#00E620]'
                  : 'bg-[#111111] border-white/10 text-gray-400'
              }`}
            >
              {obj}
            </button>
          ))}
        </div>
      </div>

      {/* Nível */}
      <div className="space-y-1.5">
        <label className="text-sm text-gray-400 font-medium">Nível do aluno</label>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { id: 'iniciante', label: 'Iniciante', cor: '#00E620' },
              { id: 'intermediario', label: 'Intermediário', cor: '#FFB800' },
              { id: 'avancado', label: 'Avançado', cor: '#FF4444' },
            ] as const
          ).map((n) => (
            <button
              key={n.id}
              onClick={() => onChange({ ...plano, nivel: n.id })}
              className={`py-2.5 rounded-xl text-sm border transition-all touch-manipulation ${
                plano.nivel === n.id
                  ? 'font-bold border-transparent'
                  : 'bg-[#111111] border-white/10 text-gray-400'
              }`}
              style={
                plano.nivel === n.id
                  ? { background: `${n.cor}20`, color: n.cor, borderColor: `${n.cor}40` }
                  : undefined
              }
            >
              {n.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-sm text-gray-400 font-medium">Data de início</label>
          <input
            type="date"
            value={plano.dataInicio}
            onChange={(e) => onChange({ ...plano, dataInicio: e.target.value })}
            className="w-full bg-[#111111] border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-[#00E620] transition-colors"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm text-gray-400 font-medium">Data de fim (opcional)</label>
          <input
            type="date"
            value={plano.dataFim}
            onChange={(e) => onChange({ ...plano, dataFim: e.target.value })}
            className="w-full bg-[#111111] border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-[#00E620] transition-colors"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm text-gray-400 font-medium">Observações gerais</label>
        <textarea
          value={plano.observacoesGerais}
          onChange={(e) => onChange({ ...plano, observacoesGerais: e.target.value })}
          placeholder="Observações gerais sobre o plano..."
          rows={3}
          className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 outline-none resize-none focus:border-[#00E620] transition-colors"
        />
      </div>
    </div>
  )
}

// ═══════════════════════════════════
// STEP 2 — Dias de Treino
// ═══════════════════════════════════
function StepDias({
  plano,
  onChange,
  onAbrirModal,
}: {
  plano: PlanoForm
  onChange: (p: PlanoForm) => void
  onAbrirModal: (dia: TreinoDia | null) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white">Dias de Treino</h2>
        <p className="text-gray-500 text-sm mt-1">
          Crie os dias de treino do plano (ex: A, B, C...)
        </p>
      </div>

      {plano.treinos.map((treino, i) => (
        <motion.div
          key={treino.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#161616] border border-white/5 rounded-2xl p-4 space-y-3"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00E620]/20 border border-[#00E620]/30 flex items-center justify-center text-[#00E620] font-bold text-lg flex-shrink-0">
                {LETRAS[i]}
              </div>
              <div>
                <h3 className="font-bold text-white">{treino.nome}</h3>
                <p className="text-gray-500 text-xs">
                  {treino.duracaoEstimadaMinutos}min · {treino.exercicios.length} exercícios
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onAbrirModal(treino)}
                className="w-8 h-8 rounded-lg bg-[#111111] flex items-center justify-center text-gray-500 hover:text-[#00E620] transition-colors touch-manipulation"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => onChange({ ...plano, treinos: plano.treinos.filter((t) => t.id !== treino.id) })}
                className="w-8 h-8 rounded-lg bg-[#111111] flex items-center justify-center text-gray-500 hover:text-red-400 transition-colors touch-manipulation"
              >
                <Trash size={16} />
              </button>
            </div>
          </div>

          <div className="flex gap-1.5 flex-wrap">
            {DIAS_SEMANA.map((d) => (
              <span
                key={d.id}
                className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center ${
                  treino.diasSemana.includes(d.id)
                    ? 'bg-[#00E620] text-black shadow-[0_0_8px_rgba(0,230,32,0.4)]'
                    : 'bg-[#111111] text-gray-600'
                }`}
              >
                {d.abrev}
              </span>
            ))}
          </div>
        </motion.div>
      ))}

      <button
        onClick={() => onAbrirModal(null)}
        className="w-full py-4 rounded-2xl border-2 border-dashed border-white/10 text-gray-500 hover:border-[#00E620] hover:text-[#00E620] transition-all flex items-center justify-center gap-2 touch-manipulation"
      >
        <Plus size={20} />
        Adicionar Dia de Treino
      </button>
    </div>
  )
}

// ═══════════════════════════════════
// STEP 3 — Exercícios
// ═══════════════════════════════════
function StepExercicios({
  plano,
  onChange,
  diaAtivo,
  onChangeDia,
  onAbrirBiblioteca,
  onConfigurar,
}: {
  plano: PlanoForm
  onChange: (p: PlanoForm) => void
  diaAtivo: number
  onChangeDia: (i: number) => void
  onAbrirBiblioteca: () => void
  onConfigurar: (ex: ExercicioNoPlano) => void
}) {
  const treino = plano.treinos[diaAtivo]

  if (plano.treinos.length === 0) {
    return (
      <div className="text-center py-16 space-y-3">
        <Barbell size={48} className="mx-auto text-gray-600" />
        <p className="text-white font-bold">Nenhum dia de treino criado</p>
        <p className="text-gray-500 text-sm">Volte ao passo anterior e crie pelo menos um dia.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white">Exercícios</h2>
        <p className="text-gray-500 text-sm mt-1">Adicione exercícios a cada dia de treino.</p>
      </div>

      {/* Day tabs */}
      <div className="flex gap-2">
        {plano.treinos.map((t, i) => (
          <button
            key={t.id}
            onClick={() => onChangeDia(i)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all touch-manipulation ${
              diaAtivo === i
                ? 'bg-[#00E620] text-black border-[#00E620]'
                : 'bg-[#111111] border-white/5 text-gray-400'
            }`}
          >
            {LETRAS[i]}
          </button>
        ))}
      </div>

      {treino && (
        <>
          <p className="text-gray-400 text-sm">{treino.nome}</p>

          {treino.exercicios.map((ex, i) => (
            <motion.div
              key={ex.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#161616] border border-white/5 rounded-2xl p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-[#00E620] font-bold text-sm">{i + 1}</span>
                  <div className="min-w-0">
                    <p className="font-medium text-white text-sm truncate">{ex.exercicio.nome}</p>
                    <p className="text-gray-500 text-xs">
                      {ex.series.length}×{ex.series[0]?.repeticoes} · {ex.series[0]?.tempoDescanso}s desc.
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => onConfigurar(ex)}
                    className="w-8 h-8 rounded-lg bg-[#111111] flex items-center justify-center text-gray-500 hover:text-[#00E620] transition-colors touch-manipulation"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() =>
                      onChange({
                        ...plano,
                        treinos: plano.treinos.map((t, idx) =>
                          idx === diaAtivo
                            ? { ...t, exercicios: t.exercicios.filter((e) => e.id !== ex.id) }
                            : t
                        ),
                      })
                    }
                    className="w-8 h-8 rounded-lg bg-[#111111] flex items-center justify-center text-gray-500 hover:text-red-400 transition-colors touch-manipulation"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          <button
            onClick={onAbrirBiblioteca}
            className="w-full py-4 rounded-2xl border-2 border-dashed border-white/10 text-gray-500 hover:border-[#00E620] hover:text-[#00E620] transition-all flex items-center justify-center gap-2 touch-manipulation"
          >
            <Plus size={20} />
            Adicionar Exercício
          </button>
        </>
      )}
    </div>
  )
}

// ═══════════════════════════════════
// STEP 4 — Configurações (same as exercícios but focused on config)
// ═══════════════════════════════════
function StepConfiguracoes({
  plano,
  onChange,
  diaAtivo,
  onChangeDia,
  onConfigurar,
}: {
  plano: PlanoForm
  onChange: (p: PlanoForm) => void
  diaAtivo: number
  onChangeDia: (i: number) => void
  onConfigurar: (ex: ExercicioNoPlano) => void
}) {
  const treino = plano.treinos[diaAtivo]

  if (!treino || treino.exercicios.length === 0) {
    return (
      <div className="text-center py-16 space-y-3">
        <Barbell size={48} className="mx-auto text-gray-600" />
        <p className="text-white font-bold">Adicione exercícios primeiro</p>
        <p className="text-gray-500 text-sm">Volte ao passo anterior para adicionar exercícios.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white">Configurar Exercícios</h2>
        <p className="text-gray-500 text-sm mt-1">Ajuste séries, repetições e carga de cada exercício.</p>
      </div>

      <div className="flex gap-2">
        {plano.treinos.map((t, i) => (
          <button
            key={t.id}
            onClick={() => onChangeDia(i)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all touch-manipulation ${
              diaAtivo === i
                ? 'bg-[#00E620] text-black border-[#00E620]'
                : 'bg-[#111111] border-white/5 text-gray-400'
            }`}
          >
            {LETRAS[i]}
          </button>
        ))}
      </div>

      {treino.exercicios.map((ex, i) => (
        <motion.button
          key={ex.id}
          whileTap={{ scale: 0.98 }}
          onClick={() => onConfigurar(ex)}
          className="w-full text-left bg-[#161616] border border-white/5 rounded-2xl p-4 space-y-2 touch-manipulation hover:border-[#00E620]/30 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-[#00E620] font-bold">{i + 1}</span>
              <p className="font-medium text-white text-sm truncate">{ex.exercicio.nome}</p>
            </div>
            <Pencil size={16} className="text-gray-500 flex-shrink-0" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {ex.series.map((s) => (
              <span
                key={s.numeroSerie}
                className="text-xs bg-[#111111] text-gray-400 px-2 py-1 rounded-lg"
              >
                S{s.numeroSerie}: {s.repeticoes} {s.cargaSugerida ? `· ${s.cargaSugerida}kg` : ''}
              </span>
            ))}
          </div>
        </motion.button>
      ))}
    </div>
  )
}

// ═══════════════════════════════════
// STEP 5 — Revisão
// ═══════════════════════════════════
function StepRevisao({ plano }: { plano: PlanoForm }) {
  const alunos = useAlunosStore((s) => s.alunos)
  const aluno = alunos.find((a) => a.id === plano.alunoId)
  const totalExercicios = plano.treinos.reduce((sum, t) => sum + t.exercicios.length, 0)
  const totalSeries = plano.treinos.reduce(
    (sum, t) => sum + t.exercicios.reduce((s, e) => s + e.series.length, 0),
    0
  )

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white">Revisão do Plano</h2>
        <p className="text-gray-500 text-sm mt-1">Confira todos os dados antes de salvar.</p>
      </div>

      <div className="bg-[#161616] border border-white/5 rounded-2xl p-5 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Aluno</span>
            <span className="text-white font-medium">{aluno?.nome ?? '—'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Plano</span>
            <span className="text-white font-medium">{plano.nome || '—'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Objetivo</span>
            <span className="text-white font-medium">{plano.objetivo}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Nível</span>
            <span className="text-white font-medium capitalize">{plano.nivel}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Dias de treino</span>
            <span className="text-white font-medium">{plano.treinos.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Total de exercícios</span>
            <span className="text-white font-medium">{totalExercicios}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Total de séries</span>
            <span className="text-white font-medium">{totalSeries}</span>
          </div>
        </div>
      </div>

      {plano.treinos.map((treino, i) => (
        <div key={treino.id} className="bg-[#161616] border border-white/5 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00E620]/20 flex items-center justify-center text-[#00E620] font-bold text-sm">
              {LETRAS[i]}
            </div>
            <div>
              <p className="text-white font-bold text-sm">{treino.nome}</p>
              <p className="text-gray-500 text-xs">
                {treino.exercicios.length} exercícios · {treino.duracaoEstimadaMinutos}min
              </p>
            </div>
          </div>
          {treino.exercicios.map((ex, j) => (
            <div key={ex.id} className="flex items-center gap-2 text-sm text-gray-400 pl-11">
              <span className="text-[#00E620] font-medium">{j + 1}.</span>
              <span className="truncate">{ex.exercicio.nome}</span>
              <span className="text-gray-600 flex-shrink-0">
                {ex.series.length}×{ex.series[0]?.repeticoes}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════
// MODALS
// ═══════════════════════════════════

function ModalDiaTreino({
  aberto,
  diaExistente,
  onFechar,
  onSalvar,
}: {
  aberto: boolean
  diaExistente: TreinoDia | null
  onFechar: () => void
  onSalvar: (dia: TreinoDia) => void
}) {
  const [nome, setNome] = useState(diaExistente?.nome ?? '')
  const [dias, setDias] = useState<DiaSemana[]>(diaExistente?.diasSemana ?? [])
  const [duracao, setDuracao] = useState(diaExistente?.duracaoEstimadaMinutos ?? 60)
  const [obs, setObs] = useState(diaExistente?.observacoesGerais ?? '')
  const [aquecimento, setAquecimento] = useState(diaExistente?.aquecimento ?? '')
  const [alongamento, setAlongamento] = useState(diaExistente?.alongamento ?? '')

  const toggleDia = (d: DiaSemana) => {
    setDias((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]))
  }

  return (
    <BottomSheet
      aberto={aberto}
      onFechar={onFechar}
      titulo={diaExistente ? 'Editar Dia de Treino' : 'Novo Dia de Treino'}
      botaoPrimario={{
        label: diaExistente ? 'Salvar Alterações' : 'Adicionar Dia',
        disabled: !nome.trim(),
        onClick: () => {
          onSalvar({
            id: diaExistente?.id ?? crypto.randomUUID(),
            nome,
            diasSemana: dias,
            duracaoEstimadaMinutos: duracao,
            observacoesGerais: obs,
            aquecimento: aquecimento || undefined,
            alongamento: alongamento || undefined,
            exercicios: diaExistente?.exercicios ?? [],
            ativo: true,
          })
        },
      }}
    >
      <InputGlow
        label="Nome do treino *"
        placeholder='Ex: "Treino A — Peito e Tríceps"'
        icon={Barbell}
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />

      <div className="space-y-2">
        <label className="text-sm text-gray-400 font-medium">Dias da semana</label>
        <div className="flex gap-2">
          {DIAS_SEMANA.map((d) => (
            <button
              key={d.id}
              onClick={() => toggleDia(d.id)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all touch-manipulation border ${
                dias.includes(d.id)
                  ? 'bg-[#00E620] text-black border-[#00E620]'
                  : 'bg-[#111111] border-white/10 text-gray-500'
              }`}
            >
              {d.abrev}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-gray-400 font-medium">
          Duração estimada: <span className="text-[#00E620]">{duracao} minutos</span>
        </label>
        <input
          type="range"
          min={30}
          max={120}
          step={5}
          value={duracao}
          onChange={(e) => setDuracao(Number(e.target.value))}
          className="w-full accent-[#00E620]"
        />
        <div className="flex justify-between text-xs text-gray-600">
          <span>30min</span>
          <span>120min</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm text-gray-400 font-medium">Observações gerais</label>
        <textarea
          value={obs}
          onChange={(e) => setObs(e.target.value)}
          placeholder="Instruções gerais do treino..."
          rows={2}
          className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 outline-none resize-none focus:border-[#00E620] transition-colors"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm text-gray-400 font-medium">Aquecimento recomendado</label>
        <textarea
          value={aquecimento}
          onChange={(e) => setAquecimento(e.target.value)}
          placeholder="Ex: 10min esteira leve + mobilidade..."
          rows={2}
          className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 outline-none resize-none focus:border-[#00E620] transition-colors"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm text-gray-400 font-medium">Alongamento final</label>
        <textarea
          value={alongamento}
          onChange={(e) => setAlongamento(e.target.value)}
          placeholder="Ex: Alongar peito e ombros..."
          rows={2}
          className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 outline-none resize-none focus:border-[#00E620] transition-colors"
        />
      </div>
    </BottomSheet>
  )
}

function ModalBiblioteca({
  aberto,
  onFechar,
  onSelecionar,
}: {
  aberto: boolean
  onFechar: () => void
  onSelecionar: (ex: (typeof EXERCICIOS_BIBLIOTECA)[0]) => void
}) {
  const [busca, setBusca] = useState('')
  const [filtroGrupo, setFiltroGrupo] = useState<GrupoMuscularBib | 'todos'>('todos')

  const exerciciosCustom = usePlanoTreinoStore((s) => s.exerciciosCustom)
  const todos = useMemo(
    () => [...EXERCICIOS_BIBLIOTECA, ...exerciciosCustom],
    [exerciciosCustom]
  )

  const filtrados = useMemo(
    () =>
      todos.filter((ex) => {
        const matchBusca = !busca || ex.nome.toLowerCase().includes(busca.toLowerCase())
        const matchGrupo = filtroGrupo === 'todos' || ex.grupoMuscular === filtroGrupo
        return matchBusca && matchGrupo
      }),
    [todos, busca, filtroGrupo]
  )

  return (
    <BottomSheet aberto={aberto} onFechar={onFechar} titulo="Adicionar Exercício">
      <div className="relative mb-3">
        <MagnifyingGlass
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
        />
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar exercício..."
          className="w-full bg-[#111111] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-gray-600 outline-none focus:border-[#00E620] transition-colors"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        <button
          onClick={() => setFiltroGrupo('todos')}
          className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap border transition-all touch-manipulation ${
            filtroGrupo === 'todos'
              ? 'bg-[#00E620] text-black font-bold border-[#00E620]'
              : 'bg-[#111111] border-white/5 text-gray-400'
          }`}
        >
          Todos
        </button>
        {GRUPOS_MUSCULARES.map((g) => (
          <button
            key={g.id}
            onClick={() => setFiltroGrupo(g.id)}
            className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap border transition-all touch-manipulation ${
              filtroGrupo === g.id
                ? 'font-bold border-transparent'
                : 'bg-[#111111] border-white/5 text-gray-400'
            }`}
            style={
              filtroGrupo === g.id
                ? { background: `${g.cor}30`, color: g.cor }
                : undefined
            }
          >
            {g.label}
          </button>
        ))}
      </div>

      <div className="space-y-2 max-h-[40vh] overflow-y-auto">
        {filtrados.map((ex) => (
          <motion.button
            key={ex.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelecionar(ex)}
            className="w-full text-left p-3 rounded-xl bg-[#111111] border border-white/5 hover:border-[#00E620]/30 transition-all touch-manipulation"
          >
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm">{ex.nome}</p>
                <div className="flex gap-1.5 mt-1">
                  <span className="text-xs text-[#00E620] bg-[#00E620]/10 px-2 py-0.5 rounded-full">
                    {ex.grupoMuscular}
                  </span>
                  <span className="text-xs text-gray-400 bg-[#161616] px-2 py-0.5 rounded-full capitalize">
                    {ex.equipamento.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <Plus size={20} className="text-[#00E620] flex-shrink-0" />
            </div>
          </motion.button>
        ))}
        {filtrados.length === 0 && (
          <p className="text-center text-gray-500 py-6 text-sm">Nenhum exercício encontrado.</p>
        )}
      </div>
    </BottomSheet>
  )
}

function ModalConfigurarExercicio({
  exercicio,
  onFechar,
  onSalvar,
  onRemover,
}: {
  exercicio: ExercicioNoPlano
  onFechar: () => void
  onSalvar: (ex: ExercicioNoPlano) => void
  onRemover: () => void
}) {
  const [config, setConfig] = useState<ExercicioNoPlano>({ ...exercicio })

  const addSerie = () => {
    const ultima = config.series[config.series.length - 1]
    setConfig((c) => ({
      ...c,
      series: [
        ...c.series,
        {
          numeroSerie: c.series.length + 1,
          repeticoes: ultima?.repeticoes ?? '10-12',
          cargaSugerida: ultima?.cargaSugerida,
          tempoDescanso: ultima?.tempoDescanso ?? 60,
          tipoSerie: 'normal',
        },
      ],
    }))
  }

  const updateSerie = (idx: number, data: Partial<SerieConfig>) => {
    setConfig((c) => ({
      ...c,
      series: c.series.map((s, i) => (i === idx ? { ...s, ...data } : s)),
    }))
  }

  const removeSerie = (idx: number) => {
    setConfig((c) => ({
      ...c,
      series: c.series
        .filter((_, i) => i !== idx)
        .map((s, i) => ({ ...s, numeroSerie: i + 1 })),
    }))
  }

  return (
    <BottomSheet
      aberto
      onFechar={onFechar}
      titulo={config.exercicio.nome}
      botaoPrimario={{ label: 'Confirmar', onClick: () => onSalvar(config) }}
    >
      {/* Series config */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-white text-sm">Séries</h3>
        <button
          onClick={addSerie}
          className="flex items-center gap-1 text-[#00E620] text-sm touch-manipulation"
        >
          <Plus size={16} />
          Adicionar
        </button>
      </div>

      {config.series.map((serie, i) => (
        <div key={i} className="bg-[#111111] rounded-2xl p-4 space-y-3 border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-[#00E620] font-bold text-sm">Série {serie.numeroSerie}</span>
            {config.series.length > 1 && (
              <button
                onClick={() => removeSerie(i)}
                className="text-gray-600 hover:text-red-400 transition-colors touch-manipulation"
              >
                <Trash size={16} />
              </button>
            )}
          </div>

          {/* Reps */}
          <div className="space-y-1.5">
            <label className="text-xs text-gray-500">Repetições</label>
            <div className="flex gap-1.5 flex-wrap">
              {REPS_OPCOES.map((opt) => (
                <button
                  key={opt}
                  onClick={() => updateSerie(i, { repeticoes: opt })}
                  className={`px-2.5 py-1 rounded-lg text-xs border transition-all touch-manipulation ${
                    serie.repeticoes === opt
                      ? 'bg-[#00E620] text-black font-bold border-[#00E620]'
                      : 'bg-[#161616] border-white/5 text-gray-400'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Weight */}
          <div className="space-y-1.5">
            <label className="text-xs text-gray-500">Carga sugerida (kg)</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  updateSerie(i, { cargaSugerida: Math.max(0, (serie.cargaSugerida ?? 0) - 2.5) })
                }
                className="w-9 h-9 rounded-xl bg-[#161616] border border-white/5 flex items-center justify-center text-white touch-manipulation"
              >
                <Minus size={16} />
              </button>
              <input
                type="number"
                value={serie.cargaSugerida ?? ''}
                placeholder="—"
                onChange={(e) =>
                  updateSerie(i, { cargaSugerida: e.target.value ? Number(e.target.value) : undefined })
                }
                className="flex-1 text-center bg-[#111111] border border-white/10 rounded-xl py-2 text-white font-bold outline-none focus:border-[#00E620]"
              />
              <button
                onClick={() =>
                  updateSerie(i, { cargaSugerida: (serie.cargaSugerida ?? 0) + 2.5 })
                }
                className="w-9 h-9 rounded-xl bg-[#161616] border border-white/5 flex items-center justify-center text-white touch-manipulation"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Rest */}
          <div className="space-y-1.5">
            <label className="text-xs text-gray-500">Descanso</label>
            <div className="flex gap-1.5">
              {DESCANSO_OPCOES.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateSerie(i, { tempoDescanso: opt.value })}
                  className={`flex-1 py-1.5 rounded-lg text-xs border transition-all touch-manipulation ${
                    serie.tempoDescanso === opt.value
                      ? 'bg-[#00E620] text-black font-bold border-[#00E620]'
                      : 'bg-[#161616] border-white/5 text-gray-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <label className="text-xs text-gray-500">Tipo de série</label>
            <div className="flex gap-1.5 flex-wrap">
              {(
                [
                  { id: 'normal', label: 'Normal' },
                  { id: 'drop_set', label: 'Drop Set' },
                  { id: 'bi_set', label: 'Bi-Set' },
                  { id: 'super_set', label: 'Super Set' },
                  { id: 'isometrica', label: 'Isométrica' },
                ] as const
              ).map((tipo) => (
                <button
                  key={tipo.id}
                  onClick={() => updateSerie(i, { tipoSerie: tipo.id })}
                  className={`px-2.5 py-1 rounded-lg text-xs border transition-all touch-manipulation ${
                    serie.tipoSerie === tipo.id
                      ? 'bg-[#00E620]/20 text-[#00E620] border-[#00E620]/40'
                      : 'bg-[#161616] border-white/5 text-gray-400'
                  }`}
                >
                  {tipo.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Admin notes */}
      <div className="space-y-1.5">
        <label className="text-sm text-gray-400 font-medium">Instruções para o aluno</label>
        <textarea
          value={config.observacoesAdmin}
          onChange={(e) => setConfig((c) => ({ ...c, observacoesAdmin: e.target.value }))}
          placeholder="Instruções específicas..."
          rows={2}
          className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 outline-none resize-none focus:border-[#00E620] transition-colors"
        />
      </div>

      {/* Substituição */}
      <InputGlow
        label="Substituição possível"
        placeholder='Ex: "Pode substituir por Leg Press"'
        value={config.substituicaoPossivel ?? ''}
        onChange={(e) => setConfig((c) => ({ ...c, substituicaoPossivel: e.target.value }))}
      />

      <button
        onClick={onRemover}
        className="w-full py-3 rounded-xl border border-red-500/20 text-red-400 text-sm flex items-center justify-center gap-2 touch-manipulation hover:bg-red-500/10 transition-all"
      >
        <Trash size={16} />
        Remover exercício
      </button>
    </BottomSheet>
  )
}
