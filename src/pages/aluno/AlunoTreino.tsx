import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Barbell,
  Minus,
  Plus,
  Check,
  ChartLine,
  CaretDown,
  ClockCounterClockwise,
} from '@phosphor-icons/react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useAlunosStore } from '../../store/alunosStore'
import { useAuthStore } from '../../store/authStore'
import { useCargasStore } from '../../store/cargasStore'
import EmptyState from '../../components/ui/EmptyState'

export default function AlunoTreino() {
  const user = useAuthStore((s) => s.user)
  const treinos = useAlunosStore((s) => s.treinos)
  const alunos = useAlunosStore((s) => s.alunos)

  const aluno = alunos.find((a) => a.nome === user?.nome)
  const alunoId = aluno?.id ?? 'a1'

  const meusTreinos = treinos
    .filter((t) => t.alunoId === alunoId)
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())

  const treinoAtual = meusTreinos[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00E620]/10 flex items-center justify-center">
            <Barbell size={22} className="text-[#00E620]" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-display text-white tracking-wider">TREINO DO DIA</h1>
            <p className="text-gray-500 text-sm">Seu plano de treino atual</p>
          </div>
        </div>
      </motion.div>

      {!treinoAtual ? (
        <EmptyState icon={Barbell} titulo="Nenhum treino cadastrado" descricao="Aguarde seu treinador montar seu plano de treino" />
      ) : (
        <>
          {/* Treino Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#111111] border border-white/5 rounded-2xl p-5"
          >
            <h2 className="text-white font-semibold text-lg">{treinoAtual.titulo}</h2>
            <p className="text-gray-400 text-sm mt-1">{treinoAtual.descricao}</p>
            <p className="text-xs text-gray-600 mt-2">
              Atualizado em {new Date(treinoAtual.data).toLocaleDateString('pt-BR')}
            </p>
          </motion.div>

          {/* Exercise Groups with Load Tracking */}
          {treinoAtual.detalhes.map((grupo, gi) => (
            <motion.div
              key={gi}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + gi * 0.1 }}
              className="space-y-3"
            >
              <h3 className="text-[#00E620] font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00E620]" />
                {grupo.nome}
              </h3>

              <div className="space-y-3">
                {grupo.exercicios.map((ex, ei) => (
                  <ExercicioCard
                    key={ei}
                    exercicio={ex}
                    exercicioId={`${treinoAtual.id}-${gi}-${ei}`}
                    alunoId={alunoId}
                  />
                ))}
              </div>
            </motion.div>
          ))}

          {/* Previous Treinos */}
          {meusTreinos.length > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-[#111111] border border-white/5 rounded-2xl p-5"
            >
              <h3 className="text-white font-semibold mb-3">Treinos Anteriores</h3>
              <div className="space-y-2">
                {meusTreinos.slice(1).map((t) => (
                  <div key={t.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div>
                      <p className="text-gray-300 text-sm">{t.titulo}</p>
                      <p className="text-gray-600 text-xs">{t.descricao}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(t.data).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}

// ==================== EXERCICIO CARD ====================

interface ExercicioCardProps {
  exercicio: { nome: string; series: number; repeticoes: string; carga?: string; observacao?: string }
  exercicioId: string
  alunoId: string
}

function ExercicioCard({ exercicio, exercicioId, alunoId }: ExercicioCardProps) {
  const { getSemanaAtual, getSemanaAnterior, getHistorico, salvarSerie } = useCargasStore()

  const registroAtual = getSemanaAtual(exercicioId, alunoId)
  const registroAnterior = getSemanaAnterior(exercicioId, alunoId)
  const historico = getHistorico(exercicioId, alunoId)

  return (
    <div className="bg-[#111111] border border-white/5 rounded-2xl p-4 space-y-4 hover:border-[#00E620]/20 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-white text-lg">{exercicio.nome}</h3>
          {exercicio.observacao && (
            <p className="text-yellow-500/70 text-xs mt-1">{exercicio.observacao}</p>
          )}
        </div>
        <div className="bg-[#0A0A0A] rounded-lg px-3 py-1 text-sm text-gray-400">
          {exercicio.series}x{exercicio.repeticoes}
          {exercicio.carga && <span className="text-[#00E620] ml-1">({exercicio.carga})</span>}
        </div>
      </div>

      {/* Semana passada */}
      {registroAnterior && (
        <div className="bg-[#0A0A0A] rounded-xl p-3 border border-white/5">
          <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
            <ClockCounterClockwise size={12} />
            Semana passada
          </p>
          <div className="grid grid-cols-3 gap-2">
            {registroAnterior.series
              .sort((a, b) => a.numeroSerie - b.numeroSerie)
              .map((serie) => (
                <div key={serie.numeroSerie} className="text-center">
                  <p className="text-xs text-gray-500">Série {serie.numeroSerie}</p>
                  <p className="font-bold text-white">{serie.cargaKg}kg</p>
                  <p className="text-xs text-[#00E620]">{serie.repeticoesFeitas} reps</p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Registro desta semana */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-white flex items-center gap-2">
          <Barbell size={16} className="text-[#00E620]" />
          Esta semana
        </p>
        {Array.from({ length: exercicio.series }, (_, i) => i + 1).map((numSerie) => {
          const serieAnterior = registroAnterior?.series.find((s) => s.numeroSerie === numSerie)
          const serieAtual = registroAtual?.series.find((s) => s.numeroSerie === numSerie)

          return (
            <SerieInput
              key={numSerie}
              numeroSerie={numSerie}
              sugestaoKg={serieAnterior?.cargaKg}
              sugestaoReps={serieAnterior?.repeticoesFeitas}
              valorAtual={serieAtual}
              onSave={(carga, reps) => salvarSerie(alunoId, exercicioId, numSerie, carga, reps)}
            />
          )
        })}
      </div>

      {/* Histórico expansível */}
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
    <div
      className={`flex items-center gap-2 sm:gap-3 p-3 rounded-xl transition-all ${
        concluida ? 'bg-[#00E620]/10 border border-[#00E620]/30' : 'bg-[#0A0A0A]'
      }`}
    >
      <span className="text-gray-500 text-sm w-5 text-center shrink-0">{numeroSerie}</span>

      {/* Carga */}
      <div className="flex items-center gap-1 flex-1">
        <button
          onClick={() => setCarga((c) => Math.max(0, c - 2.5))}
          className="w-8 h-8 rounded-lg bg-[#1A1A1A] text-white flex items-center justify-center active:scale-90 touch-manipulation shrink-0"
        >
          <Minus size={14} />
        </button>
        <input
          type="number"
          value={carga}
          onChange={(e) => setCarga(Number(e.target.value))}
          className="w-14 text-center bg-transparent font-bold text-white border-b border-white/10 focus:border-[#00E620] outline-none"
        />
        <button
          onClick={() => setCarga((c) => c + 2.5)}
          className="w-8 h-8 rounded-lg bg-[#1A1A1A] text-white flex items-center justify-center active:scale-90 touch-manipulation shrink-0"
        >
          <Plus size={14} />
        </button>
        <span className="text-gray-500 text-xs shrink-0">kg</span>
      </div>

      {/* Reps */}
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={reps}
          onChange={(e) => setReps(Number(e.target.value))}
          className="w-10 text-center bg-transparent font-bold text-white border-b border-white/10 focus:border-[#00E620] outline-none"
        />
        <span className="text-gray-500 text-xs shrink-0">reps</span>
      </div>

      {/* Concluir */}
      <motion.button
        onClick={() => {
          setConcluida(true)
          onSave(carga, reps)
        }}
        whileTap={{ scale: 0.85 }}
        className={`w-9 h-9 rounded-xl flex items-center justify-center touch-manipulation transition-all shrink-0 ${
          concluida
            ? 'bg-[#00E620] text-black shadow-[0_0_12px_rgba(0,230,32,0.5)]'
            : 'bg-[#1A1A1A] text-gray-500'
        }`}
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
      <button
        onClick={() => setAberto(!aberto)}
        className="w-full text-xs text-gray-500 hover:text-[#00E620] transition-colors flex items-center justify-center gap-1 py-1"
      >
        <ChartLine size={14} />
        {aberto ? 'Ocultar' : 'Ver'} histórico de cargas
        <CaretDown size={12} className={`transition-transform ${aberto ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {aberto && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {dadosGrafico.length > 1 && (
              <div className="mt-2">
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={dadosGrafico}>
                    <XAxis dataKey="semana" tick={{ fontSize: 10, fill: '#666' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#666' }} unit="kg" width={40} />
                    <Tooltip
                      contentStyle={{ background: '#141414', border: '1px solid rgba(0,230,32,0.2)', borderRadius: '8px', fontSize: '12px' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Line
                      dataKey="cargaMax"
                      stroke="#00E620"
                      strokeWidth={2}
                      dot={{ fill: '#00E620', r: 4 }}
                      name="Carga máx"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="space-y-1 mt-2">
              {historico
                .slice(-4)
                .reverse()
                .map((h) => (
                  <div key={h.semana} className="flex justify-between text-xs py-1 border-b border-white/5">
                    <span className="text-gray-500">{h.semana.replace(/^\d{4}-W/, 'Sem ')}</span>
                    <span className="text-white">
                      {h.series.length > 0 ? Math.max(...h.series.map((s) => s.cargaKg)) : 0}kg máx
                    </span>
                    <span className="text-gray-500">
                      {h.series.filter((s) => s.concluida).length}/{h.series.length} séries
                    </span>
                    {h.sensacaoSubjetiva && (
                      <span>{['😴', '😐', '🙂', '💪', '🔥'][h.sensacaoSubjetiva - 1]}</span>
                    )}
                  </div>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
