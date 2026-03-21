import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarCheck,
  Check,
  X,
  Warning,
  WhatsappLogo,
  Plus,
  UserCircle,
  Fire,
} from '@phosphor-icons/react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, isSameMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useFrequenciaStore } from '../store/frequenciaStore'
import { useAlunosStore } from '../store/alunosStore'
import type { TipoFrequencia } from '../types'
import EmptyState from '../components/ui/EmptyState'

const tipoConfig: Record<TipoFrequencia, { label: string; color: string; icon: string }> = {
  presencial: { label: 'Presencial', color: 'text-[#00E620]', icon: '✅' },
  online: { label: 'Online', color: 'text-blue-400', icon: '💻' },
  faltou: { label: 'Faltou', color: 'text-red-400', icon: '❌' },
  cancelou: { label: 'Cancelou', color: 'text-yellow-400', icon: '↩️' },
}

export default function Frequencia() {
  const [view, setView] = useState<'hoje' | 'calendario' | 'alertas'>('hoje')
  const [showModal, setShowModal] = useState(false)
  const { registros } = useFrequenciaStore()
  const { alunos } = useAlunosStore()
  const hoje = format(new Date(), 'yyyy-MM-dd')

  const registrosHoje = registros.filter((r) => r.data === hoje)
  const presencasHoje = registrosHoje.filter((r) => r.tipo === 'presencial' || r.tipo === 'online').length
  const faltasHoje = registrosHoje.filter((r) => r.tipo === 'faltou').length

  // Ranking
  const ranking = useMemo(() => {
    const alunoMap = new Map<string, { presencas: number; total: number; nome: string; streak: number }>()
    const sorted = [...registros].sort((a, b) => a.data.localeCompare(b.data))

    for (const r of sorted) {
      if (!alunoMap.has(r.alunoId)) {
        alunoMap.set(r.alunoId, { presencas: 0, total: 0, nome: r.alunoNome, streak: 0 })
      }
      const entry = alunoMap.get(r.alunoId)!
      entry.total++
      if (r.tipo === 'presencial' || r.tipo === 'online') entry.presencas++
    }

    // Calculate streak (simplified — consecutive non-falta days)
    for (const [alunoId, entry] of alunoMap) {
      const alunoRegs = sorted.filter((r) => r.alunoId === alunoId).reverse()
      let streak = 0
      for (const r of alunoRegs) {
        if (r.tipo === 'presencial' || r.tipo === 'online') streak++
        else break
      }
      entry.streak = streak
    }

    return Array.from(alunoMap.entries())
      .map(([id, data]) => ({ alunoId: id, ...data, taxa: data.total > 0 ? Math.round((data.presencas / data.total) * 100) : 0 }))
      .sort((a, b) => b.taxa - a.taxa)
  }, [registros])

  // Alertas
  const alertas = useMemo(() => {
    const alerts: { alunoId: string; nome: string; tipo: 'faltas' | 'inativo'; mensagem: string }[] = []
    const alunoRegs = new Map<string, typeof registros>()

    for (const r of registros) {
      if (!alunoRegs.has(r.alunoId)) alunoRegs.set(r.alunoId, [])
      alunoRegs.get(r.alunoId)!.push(r)
    }

    for (const [alunoId, regs] of alunoRegs) {
      const sorted = [...regs].sort((a, b) => b.data.localeCompare(a.data))
      const nome = sorted[0]?.alunoNome ?? 'Aluno'

      // 3+ faltas seguidas
      let faltasSeguidas = 0
      for (const r of sorted) {
        if (r.tipo === 'faltou') faltasSeguidas++
        else break
      }
      if (faltasSeguidas >= 3) {
        alerts.push({ alunoId, nome, tipo: 'faltas', mensagem: `${faltasSeguidas} faltas seguidas` })
      }

      // Sem registro há 7+ dias
      if (sorted.length > 0) {
        const lastDate = new Date(sorted[0].data)
        const diff = Math.floor((Date.now() - lastDate.getTime()) / 86400000)
        if (diff >= 7) {
          alerts.push({ alunoId, nome, tipo: 'inativo', mensagem: `Sem registro há ${diff} dias` })
        }
      }
    }

    return alerts
  }, [registros])

  const mediaPresenca = ranking.length > 0 ? Math.round(ranking.reduce((acc, r) => acc + r.taxa, 0) / ranking.length) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00E620]/10 flex items-center justify-center">
            <CalendarCheck size={22} className="text-[#00E620]" />
          </div>
          <h1 className="text-xl md:text-2xl font-display text-white tracking-wider">FREQUÊNCIA</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-[#111111] border border-white/5 rounded-xl p-1">
            {([
              { id: 'hoje', label: 'Hoje' },
              { id: 'calendario', label: 'Calendário' },
              { id: 'alertas', label: `Alertas${alertas.length > 0 ? ` (${alertas.length})` : ''}` },
            ] as const).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  view === tab.id ? 'bg-[#00E620] text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00E620] text-black font-semibold text-sm"
          >
            <Plus size={16} weight="bold" />
            <span className="hidden sm:inline">Registrar</span>
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#111111] border border-white/5 rounded-xl p-4 text-center">
          <p className="text-[10px] text-gray-500 mb-1">Treinos hoje</p>
          <p className="text-2xl font-display text-white">{registrosHoje.length}</p>
        </div>
        <div className="bg-[#111111] border border-white/5 rounded-xl p-4 text-center">
          <p className="text-[10px] text-gray-500 mb-1">Presenças</p>
          <p className="text-2xl font-display text-[#00E620]">{presencasHoje}</p>
        </div>
        <div className="bg-[#111111] border border-white/5 rounded-xl p-4 text-center">
          <p className="text-[10px] text-gray-500 mb-1">Faltas</p>
          <p className="text-2xl font-display text-red-400">{faltasHoje}</p>
        </div>
        <div className="bg-[#111111] border border-white/5 rounded-xl p-4 text-center">
          <p className="text-[10px] text-gray-500 mb-1">Média presença</p>
          <p className="text-2xl font-display text-white">{mediaPresenca}%</p>
        </div>
      </div>

      {/* Views */}
      {view === 'hoje' && (
        <div className="space-y-4">
          {registrosHoje.length === 0 ? (
            <EmptyState icon={CalendarCheck} titulo="Nenhum registro hoje" descricao="Registre a presença dos alunos" acaoLabel="+ Registrar" onAcao={() => setShowModal(true)} />
          ) : (
            <div className="bg-[#111111] border border-white/5 rounded-2xl divide-y divide-white/5">
              {registrosHoje.map((r) => {
                const cfg = tipoConfig[r.tipo]
                return (
                  <div key={r.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-sm">{cfg.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{r.alunoNome}</p>
                      <p className="text-gray-500 text-xs">{r.hora}</p>
                    </div>
                    <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Ranking */}
          {ranking.length > 0 && (
            <div className="bg-[#111111] border border-white/5 rounded-2xl p-4">
              <h3 className="text-white font-semibold mb-3">Ranking de Presença</h3>
              <div className="space-y-2">
                {ranking.slice(0, 10).map((r, i) => (
                  <div key={r.alunoId} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 w-5 text-right">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{r.nome}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {r.streak > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px] text-orange-400">
                          <Fire size={10} />{r.streak}
                        </span>
                      )}
                      <div className="w-20 bg-white/5 rounded-full h-1.5">
                        <div className="bg-[#00E620] h-1.5 rounded-full" style={{ width: `${r.taxa}%` }} />
                      </div>
                      <span className="text-xs text-gray-400 w-8 text-right">{r.taxa}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {view === 'calendario' && <FrequenciaCalendario />}

      {view === 'alertas' && (
        <div className="space-y-3">
          {alertas.length === 0 ? (
            <EmptyState icon={Check} titulo="Tudo certo!" descricao="Nenhum alerta de frequência no momento" />
          ) : (
            alertas.map((a, i) => (
              <div key={i} className={`bg-[#111111] border rounded-xl p-4 flex items-center gap-3 ${a.tipo === 'faltas' ? 'border-red-500/20' : 'border-yellow-500/20'}`}>
                <Warning size={20} className={a.tipo === 'faltas' ? 'text-red-400' : 'text-yellow-400'} />
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{a.nome}</p>
                  <p className="text-gray-500 text-xs">{a.mensagem}</p>
                </div>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Oi ${a.nome}, notei que você faltou nos últimos dias. Posso te ajudar com alguma coisa?`)}`}
                  target="_blank"
                  rel="noopener"
                  className="p-2 rounded-xl bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                >
                  <WhatsappLogo size={18} />
                </a>
              </div>
            ))
          )}
        </div>
      )}

      <AnimatePresence>
        {showModal && <RegistroModal alunos={alunos} onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </div>
  )
}

// ==================== CALENDARIO ====================

function FrequenciaCalendario() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedAlunoId, setSelectedAlunoId] = useState<string | null>(null)
  const { registros } = useFrequenciaStore()
  const { alunos } = useAlunosStore()

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  const startDayOfWeek = getDay(days[0])
  const empties = Array.from({ length: startDayOfWeek }, (_, i) => i)

  const filteredRegistros = selectedAlunoId ? registros.filter((r) => r.alunoId === selectedAlunoId) : registros

  const getRegsForDay = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd')
    return filteredRegistros.filter((r) => r.data === dateStr)
  }

  return (
    <div className="space-y-4">
      {/* Aluno selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedAlunoId(null)}
          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            !selectedAlunoId ? 'bg-[#00E620] text-black' : 'bg-white/5 text-gray-400'
          }`}
        >
          Todos
        </button>
        {alunos.filter((a) => a.status === 'ativo').map((a) => (
          <button
            key={a.id}
            onClick={() => setSelectedAlunoId(a.id)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedAlunoId === a.id ? 'bg-[#00E620] text-black' : 'bg-white/5 text-gray-400'
            }`}
          >
            {a.nome.split(' ')[0]}
          </button>
        ))}
      </div>

      <div className="bg-[#111111] border border-white/5 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="text-gray-400 hover:text-white p-2">←</button>
          <h3 className="text-white font-semibold capitalize">{format(currentMonth, 'MMMM yyyy', { locale: ptBR })}</h3>
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="text-gray-400 hover:text-white p-2">→</button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
            <div key={d} className="text-[10px] text-gray-600 font-medium py-1">{d}</div>
          ))}
          {empties.map((i) => <div key={`e${i}`} />)}
          {days.map((day) => {
            const regs = getRegsForDay(day)
            const hasPresenca = regs.some((r) => r.tipo === 'presencial' || r.tipo === 'online')
            const hasFalta = regs.some((r) => r.tipo === 'faltou')
            const today = isToday(day)

            return (
              <div
                key={day.toISOString()}
                className={`aspect-square rounded-lg flex items-center justify-center text-xs relative ${
                  today ? 'ring-1 ring-[#00E620]/50' : ''
                } ${!isSameMonth(day, currentMonth) ? 'opacity-30' : ''}`}
              >
                <span className={`${today ? 'text-[#00E620] font-bold' : 'text-gray-400'}`}>{format(day, 'd')}</span>
                {hasPresenca && <div className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full bg-[#00E620]" />}
                {hasFalta && !hasPresenca && <div className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full bg-red-400" />}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ==================== REGISTRO MODAL ====================

function RegistroModal({ alunos, onClose }: { alunos: { id: string; nome: string }[]; onClose: () => void }) {
  const { addRegistro } = useFrequenciaStore()
  const [alunoId, setAlunoId] = useState('')
  const [data, setData] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [hora, setHora] = useState(format(new Date(), 'HH:mm'))
  const [tipo, setTipo] = useState<TipoFrequencia>('presencial')
  const [observacoes, setObservacoes] = useState('')

  const selectedAluno = alunos.find((a) => a.id === alunoId)

  const handleSave = () => {
    if (!alunoId) return
    addRegistro({
      alunoId,
      alunoNome: selectedAluno?.nome ?? '',
      data,
      hora,
      tipo,
      observacoes: observacoes || undefined,
    })
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#111111] border border-white/5 rounded-t-3xl md:rounded-2xl w-full md:max-w-md p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-display text-xl tracking-wider">REGISTRAR PRESENÇA</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-gray-400"><X size={20} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Aluno</label>
            <select value={alunoId} onChange={(e) => setAlunoId(e.target.value)} className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-3 text-white">
              <option value="">Selecione...</option>
              {alunos.filter((a) => a.status === 'ativo').map((a) => (
                <option key={a.id} value={a.id}>{a.nome}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Data</label>
              <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-3 text-white" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Horário</label>
              <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-3 text-white" />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-2 block">Tipo</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(tipoConfig) as [TipoFrequencia, typeof tipoConfig[TipoFrequencia]][]).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => setTipo(key)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    tipo === key ? 'border-[#00E620]/50 bg-[#00E620]/10 text-white' : 'border-white/5 text-gray-400'
                  }`}
                >
                  <span>{cfg.icon}</span>
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Observações</label>
            <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={2} className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-3 text-white resize-none" placeholder="Opcional..." />
          </div>

          <button
            onClick={handleSave}
            disabled={!alunoId}
            className="w-full py-3 rounded-xl bg-[#00E620] text-black font-semibold text-sm hover:brightness-110 disabled:opacity-40"
          >
            Registrar
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
