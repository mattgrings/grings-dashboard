import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Barbell,
  Minus,
  Plus,
  Check,
  ChartLine,
  CaretDown,
  ClockCounterClockwise,
  Play,
  Pause,
  Stop,
  Timer,
} from '@phosphor-icons/react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useAlunosStore } from '../../store/alunosStore'
import { useAuthStore } from '../../store/authStore'
import { useCargasStore } from '../../store/cargasStore'
import { useCronometroStore } from '../../store/cronometroStore'
import CronometroDisplay from '../../components/treino/CronometroDisplay'
import EmptyState from '../../components/ui/EmptyState'

export default function AlunoTreino() {
  const user = useAuthStore((s) => s.user)
  const treinos = useAlunosStore((s) => s.treinos)
  const alunos = useAlunosStore((s) => s.alunos)
  const { sessaoAtiva, segundosDecorridos, pausado, iniciarTreino, pausar, retomar, encerrarTreino, tick, setSensacao } = useCronometroStore()
  const [showEncerrar, setShowEncerrar] = useState(false)

  const aluno = alunos.find((a) => a.nome === user?.nome)
  const alunoId = aluno?.id ?? 'a1'
  const alunoNome = aluno?.nome ?? user?.nome ?? 'Aluno'

  const meusTreinos = treinos
    .filter((t) => t.alunoId === alunoId)
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())

  // Tick do cronômetro
  useEffect(() => {
    if (!sessaoAtiva || pausado) return
    const interval = setInterval(() => tick(), 1000)
    return () => clearInterval(interval)
  }, [sessaoAtiva, pausado, tick])

  // Se tem sessão ativa, mostra tela de treino ativo
  if (sessaoAtiva) {
    const treinoAtivo = meusTreinos.find((t) => t.id === sessaoAtiva.treinoId) ?? meusTreinos[0]

    return (
      <div className="space-y-4">
        {/* Header com cronômetro */}
        <div className="bg-[#111111] border border-[#00E620]/20 rounded-2xl p-4 space-y-3 sticky top-14 md:top-16 z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Treinando agora</p>
              <h1 className="text-lg font-bold text-white">{sessaoAtiva.treinoNome}</h1>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1.5 bg-[#00E620]/10 border border-[#00E620]/30 rounded-full px-3 py-1.5"
            >
              <div className="w-2 h-2 rounded-full bg-[#00E620] animate-pulse" />
              <span className="text-[10px] text-[#00E620] font-medium">Presença registrada</span>
            </motion.div>
          </div>

          {/* Cronômetro + controles */}
          <div className="flex items-center justify-between">
            <CronometroDisplay segundos={segundosDecorridos} />
            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={pausado ? retomar : pausar}
                className="w-12 h-12 rounded-xl bg-[#161616] border border-white/10 flex items-center justify-center text-white hover:border-[#00E620]/30 transition-colors touch-manipulation"
              >
                {pausado ? <Play size={20} weight="fill" className="text-[#00E620] ml-0.5" /> : <Pause size={20} weight="fill" />}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowEncerrar(true)}
                className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-all touch-manipulation"
              >
                <Stop size={20} weight="fill" />
              </motion.button>
            </div>
          </div>

          {/* Progresso */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>{sessaoAtiva.exerciciosConcluidos} exercícios concluídos</span>
              <span>{sessaoAtiva.totalExercicios} total</span>
            </div>
            <div className="h-1.5 bg-[#0A0A0A] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#00E620] rounded-full"
                animate={{ width: `${sessaoAtiva.totalExercicios > 0 ? (sessaoAtiva.exerciciosConcluidos / sessaoAtiva.totalExercicios) * 100 : 0}%` }}
                transition={{ type: 'spring', stiffness: 200 }}
              />
            </div>
          </div>

          {/* Banner pausado */}
          <AnimatePresence>
            {pausado && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-2 text-center"
              >
                <span className="text-yellow-400 text-sm font-medium">Treino pausado</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Exercícios */}
        {treinoAtivo && treinoAtivo.detalhes.map((grupo, gi) => (
          <div key={gi} className="space-y-3">
            <h3 className="text-[#00E620] font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00E620]" />
              {grupo.nome}
            </h3>
            <div className="space-y-3">
              {grupo.exercicios.map((ex, ei) => (
                <ExercicioCard
                  key={ei}
                  exercicio={ex}
                  exercicioId={`${treinoAtivo.id}-${gi}-${ei}`}
                  alunoId={alunoId}
                  sessaoAtiva
                />
              ))}
            </div>
          </div>
        ))}

        {/* Modal encerrar */}
        <AnimatePresence>
          {showEncerrar && (
            <ModalEncerrar
              segundos={segundosDecorridos}
              exerciciosConcluidos={sessaoAtiva.exerciciosConcluidos}
              totalExercicios={sessaoAtiva.totalExercicios}
              sensacao={sessaoAtiva.sensacao}
              onSensacao={setSensacao}
              onConfirmar={() => { encerrarTreino(); setShowEncerrar(false) }}
              onCancelar={() => setShowEncerrar(false)}
            />
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Tela de seleção de treino
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00E620]/10 flex items-center justify-center">
            <Barbell size={22} className="text-[#00E620]" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-display text-white tracking-wider">QUAL TREINO HOJE?</h1>
            <p className="text-gray-500 text-sm">Ao iniciar, sua presença será registrada automaticamente</p>
          </div>
        </div>
      </motion.div>

      {meusTreinos.length === 0 ? (
        <EmptyState icon={Barbell} titulo="Nenhum treino cadastrado" descricao="Aguarde seu treinador montar seu plano de treino" />
      ) : (
        <div className="space-y-3">
          {meusTreinos.map((treino, i) => {
            const totalExercicios = treino.detalhes.reduce((acc, g) => acc + g.exercicios.length, 0)
            return (
              <motion.button
                key={treino.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => iniciarTreino(alunoId, alunoNome, treino.id, treino.titulo, totalExercicios)}
                className="w-full text-left bg-[#111111] border border-white/5 rounded-2xl p-5 hover:border-[#00E620]/20 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white group-hover:text-[#00E620] transition-colors truncate">
                      {treino.titulo}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-2">{treino.descricao}</p>
                    <p className="text-xs text-gray-600">{totalExercicios} exercícios</p>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-14 h-14 rounded-2xl bg-[#00E620] flex items-center justify-center shrink-0 ml-4 shadow-[0_0_20px_rgba(0,230,32,0.4)]"
                  >
                    <Play size={24} weight="fill" className="text-black ml-1" />
                  </motion.div>
                </div>
                <p className="text-[10px] text-gray-600 mt-2">
                  Atualizado em {new Date(treino.data).toLocaleDateString('pt-BR')}
                </p>
              </motion.button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ==================== EXERCICIO CARD ====================

interface ExercicioCardProps {
  exercicio: { nome: string; series: number; repeticoes: string; carga?: string; observacao?: string }
  exercicioId: string
  alunoId: string
  sessaoAtiva?: boolean
}

function ExercicioCard({ exercicio, exercicioId, alunoId, sessaoAtiva: isSessaoAtiva }: ExercicioCardProps) {
  const { getSemanaAtual, getSemanaAnterior, getHistorico, salvarSerie } = useCargasStore()
  const { registrarSerie, marcarExercicioConcluido } = useCronometroStore()
  const [allDone, setAllDone] = useState(false)

  const registroAtual = getSemanaAtual(exercicioId, alunoId)
  const registroAnterior = getSemanaAnterior(exercicioId, alunoId)
  const historico = getHistorico(exercicioId, alunoId)

  const handleSaveSerie = (numSerie: number, carga: number, reps: number) => {
    salvarSerie(alunoId, exercicioId, numSerie, carga, reps)
    if (isSessaoAtiva) {
      registrarSerie(exercicioId, exercicio.nome, {
        numeroSerie: numSerie,
        cargaKg: carga,
        repeticoesFeitas: reps,
        concluida: true,
      })
    }
  }

  const handleAllSeriesDone = () => {
    if (!allDone && isSessaoAtiva) {
      setAllDone(true)
      marcarExercicioConcluido()
    }
  }

  return (
    <div className={`bg-[#111111] border rounded-2xl p-4 space-y-4 transition-colors ${allDone ? 'border-[#00E620]/30 bg-[#00E620]/5' : 'border-white/5 hover:border-[#00E620]/20'}`}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            {exercicio.nome}
            {allDone && <Check size={16} className="text-[#00E620]" weight="bold" />}
          </h3>
          {exercicio.observacao && <p className="text-yellow-500/70 text-xs mt-1">{exercicio.observacao}</p>}
        </div>
        <div className="bg-[#0A0A0A] rounded-lg px-3 py-1 text-sm text-gray-400">
          {exercicio.series}x{exercicio.repeticoes}
          {exercicio.carga && <span className="text-[#00E620] ml-1">({exercicio.carga})</span>}
        </div>
      </div>

      {registroAnterior && (
        <div className="bg-[#0A0A0A] rounded-xl p-3 border border-white/5">
          <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
            <ClockCounterClockwise size={12} /> Semana passada
          </p>
          <div className="grid grid-cols-3 gap-2">
            {registroAnterior.series.sort((a, b) => a.numeroSerie - b.numeroSerie).map((serie) => (
              <div key={serie.numeroSerie} className="text-center">
                <p className="text-xs text-gray-500">Série {serie.numeroSerie}</p>
                <p className="font-bold text-white">{serie.cargaKg}kg</p>
                <p className="text-xs text-[#00E620]">{serie.repeticoesFeitas} reps</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-sm font-medium text-white flex items-center gap-2">
          <Barbell size={16} className="text-[#00E620]" /> Esta semana
        </p>
        {Array.from({ length: exercicio.series }, (_, i) => i + 1).map((numSerie) => {
          const serieAnterior = registroAnterior?.series.find((s) => s.numeroSerie === numSerie)
          const serieAtual = registroAtual?.series.find((s) => s.numeroSerie === numSerie)
          const isLastSerie = numSerie === exercicio.series

          return (
            <SerieInput
              key={numSerie}
              numeroSerie={numSerie}
              sugestaoKg={serieAnterior?.cargaKg}
              sugestaoReps={serieAnterior?.repeticoesFeitas}
              valorAtual={serieAtual}
              onSave={(carga, reps) => {
                handleSaveSerie(numSerie, carga, reps)
                if (isLastSerie) handleAllSeriesDone()
              }}
            />
          )
        })}
      </div>

      {historico.length > 0 && <HistoricoExpandivel historico={historico} />}
    </div>
  )
}

// ==================== SERIE INPUT ====================

interface SerieInputProps {
  numeroSerie: number
  sugestaoKg?: number
  sugestaoReps?: number
  valorAtual?: { cargaKg: number; repeticoesFeitas: number; concluida: boolean }
  onSave: (carga: number, reps: number) => void
}

function SerieInput({ numeroSerie, sugestaoKg, sugestaoReps, valorAtual, onSave }: SerieInputProps) {
  const [carga, setCarga] = useState(valorAtual?.cargaKg ?? sugestaoKg ?? 0)
  const [reps, setReps] = useState(valorAtual?.repeticoesFeitas ?? sugestaoReps ?? 0)
  const [concluida, setConcluida] = useState(valorAtual?.concluida ?? false)

  return (
    <div className={`flex items-center gap-2 sm:gap-3 p-3 rounded-xl transition-all ${concluida ? 'bg-[#00E620]/10 border border-[#00E620]/30' : 'bg-[#0A0A0A]'}`}>
      <span className="text-gray-500 text-sm w-5 text-center shrink-0">{numeroSerie}</span>
      <div className="flex items-center gap-1 flex-1">
        <button onClick={() => setCarga((c) => Math.max(0, c - 2.5))} className="w-8 h-8 rounded-lg bg-[#1A1A1A] text-white flex items-center justify-center active:scale-90 touch-manipulation shrink-0"><Minus size={14} /></button>
        <input type="number" value={carga} onChange={(e) => setCarga(Number(e.target.value))} className="w-14 text-center bg-transparent font-bold text-white border-b border-white/10 focus:border-[#00E620] outline-none" />
        <button onClick={() => setCarga((c) => c + 2.5)} className="w-8 h-8 rounded-lg bg-[#1A1A1A] text-white flex items-center justify-center active:scale-90 touch-manipulation shrink-0"><Plus size={14} /></button>
        <span className="text-gray-500 text-xs shrink-0">kg</span>
      </div>
      <div className="flex items-center gap-1">
        <input type="number" value={reps} onChange={(e) => setReps(Number(e.target.value))} className="w-10 text-center bg-transparent font-bold text-white border-b border-white/10 focus:border-[#00E620] outline-none" />
        <span className="text-gray-500 text-xs shrink-0">reps</span>
      </div>
      <motion.button
        onClick={() => { setConcluida(true); onSave(carga, reps) }}
        whileTap={{ scale: 0.85 }}
        className={`w-9 h-9 rounded-xl flex items-center justify-center touch-manipulation transition-all shrink-0 ${concluida ? 'bg-[#00E620] text-black shadow-[0_0_12px_rgba(0,230,32,0.5)]' : 'bg-[#1A1A1A] text-gray-500'}`}
      >
        <Check size={18} weight="bold" />
      </motion.button>
    </div>
  )
}

// ==================== HISTORICO EXPANDIVEL ====================

function HistoricoExpandivel({ historico }: { historico: { semana: string; series: { cargaKg: number; repeticoesFeitas: number; concluida: boolean; numeroSerie: number }[]; sensacaoSubjetiva?: 1 | 2 | 3 | 4 | 5 }[] }) {
  const [aberto, setAberto] = useState(false)
  const dadosGrafico = historico.slice(-8).map((h) => ({
    semana: h.semana.replace(/^\d{4}-W/, 'S'),
    cargaMax: h.series.length > 0 ? Math.max(...h.series.map((s) => s.cargaKg)) : 0,
  }))

  return (
    <div>
      <button onClick={() => setAberto(!aberto)} className="w-full text-xs text-gray-500 hover:text-[#00E620] transition-colors flex items-center justify-center gap-1 py-1">
        <ChartLine size={14} />
        {aberto ? 'Ocultar' : 'Ver'} histórico de cargas
        <CaretDown size={12} className={`transition-transform ${aberto ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {aberto && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            {dadosGrafico.length > 1 && (
              <div className="mt-2">
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={dadosGrafico}>
                    <XAxis dataKey="semana" tick={{ fontSize: 10, fill: '#666' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#666' }} unit="kg" width={40} />
                    <Tooltip contentStyle={{ background: '#141414', border: '1px solid rgba(0,230,32,0.2)', borderRadius: '8px', fontSize: '12px' }} labelStyle={{ color: '#fff' }} />
                    <Line dataKey="cargaMax" stroke="#00E620" strokeWidth={2} dot={{ fill: '#00E620', r: 4 }} name="Carga máx" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="space-y-1 mt-2">
              {historico.slice(-4).reverse().map((h) => (
                <div key={h.semana} className="flex justify-between text-xs py-1 border-b border-white/5">
                  <span className="text-gray-500">{h.semana.replace(/^\d{4}-W/, 'Sem ')}</span>
                  <span className="text-white">{h.series.length > 0 ? Math.max(...h.series.map((s) => s.cargaKg)) : 0}kg máx</span>
                  <span className="text-gray-500">{h.series.filter((s) => s.concluida).length}/{h.series.length} séries</span>
                  {h.sensacaoSubjetiva && <span>{['😴', '😐', '🙂', '💪', '🔥'][h.sensacaoSubjetiva - 1]}</span>}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ==================== MODAL ENCERRAR ====================

function ModalEncerrar({ segundos, exerciciosConcluidos, totalExercicios, sensacao, onSensacao, onConfirmar, onCancelar }: {
  segundos: number; exerciciosConcluidos: number; totalExercicios: number; sensacao?: 1 | 2 | 3 | 4 | 5
  onSensacao: (s: 1 | 2 | 3 | 4 | 5) => void; onConfirmar: () => void; onCancelar: () => void
}) {
  const minutos = Math.floor(segundos / 60)
  const porcentagem = totalExercicios > 0 ? Math.round((exerciciosConcluidos / totalExercicios) * 100) : 0

  return (
    <>
      <motion.div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancelar} />
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-50 bg-[#161616] rounded-t-3xl p-6 space-y-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        <div className="w-12 h-1 bg-white/10 rounded-full mx-auto -mt-2" />
        <h2 className="text-2xl font-bold text-white text-center">Encerrar treino?</h2>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#0A0A0A] rounded-2xl p-4 text-center">
            <Timer size={24} className="text-[#00E620] mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{minutos}</p>
            <p className="text-xs text-gray-500">minutos</p>
          </div>
          <div className="bg-[#0A0A0A] rounded-2xl p-4 text-center">
            <Barbell size={24} className="text-[#00E620] mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{exerciciosConcluidos}</p>
            <p className="text-xs text-gray-500">exercícios</p>
          </div>
          <div className="bg-[#0A0A0A] rounded-2xl p-4 text-center">
            <ChartLine size={24} className="text-[#00E620] mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{porcentagem}%</p>
            <p className="text-xs text-gray-500">concluído</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-400 text-center">Como foi o treino?</p>
          <div className="flex justify-center gap-3">
            {(['😴', '😐', '🙂', '💪', '🔥'] as const).map((emoji, i) => (
              <button
                key={i}
                onClick={() => onSensacao((i + 1) as 1 | 2 | 3 | 4 | 5)}
                className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all ${
                  sensacao === i + 1 ? 'bg-[#00E620]/20 border-2 border-[#00E620] scale-110' : 'bg-[#0A0A0A] border border-white/5'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <motion.button whileTap={{ scale: 0.97 }} onClick={onConfirmar} className="w-full py-4 rounded-2xl bg-[#00E620] text-black font-bold text-lg shadow-[0_0_25px_rgba(0,230,32,0.4)] touch-manipulation">
            Salvar e Encerrar
          </motion.button>
          <button onClick={onCancelar} className="w-full py-3 rounded-2xl bg-[#0A0A0A] text-gray-500 text-sm touch-manipulation">
            Voltar ao treino
          </button>
        </div>
      </motion.div>
    </>
  )
}
