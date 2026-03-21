import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  CalendarCheck,
  Fire,
  Trophy,
  Check,
} from '@phosphor-icons/react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, isSameMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useFrequenciaStore } from '../../store/frequenciaStore'
import { useAlunosStore } from '../../store/alunosStore'
import { useAuthStore } from '../../store/authStore'
import EmptyState from '../../components/ui/EmptyState'

export default function AlunoFrequencia() {
  const user = useAuthStore((s) => s.user)
  const alunos = useAlunosStore((s) => s.alunos)
  const { registros } = useFrequenciaStore()
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const aluno = alunos.find((a) => a.nome === user?.nome)
  const alunoId = aluno?.id ?? ''

  const meusRegistros = registros.filter((r) => r.alunoId === alunoId)
  const presencas = meusRegistros.filter((r) => r.tipo === 'presencial' || r.tipo === 'online').length
  const faltas = meusRegistros.filter((r) => r.tipo === 'faltou').length
  const total = meusRegistros.length

  // Streak
  const streak = useMemo(() => {
    const sorted = [...meusRegistros].sort((a, b) => b.data.localeCompare(a.data))
    let s = 0
    for (const r of sorted) {
      if (r.tipo === 'presencial' || r.tipo === 'online') s++
      else break
    }
    return s
  }, [meusRegistros])

  // Ranking (todos alunos, preservar privacidade com iniciais)
  const ranking = useMemo(() => {
    const alunoMap = new Map<string, { presencas: number; total: number; nome: string }>()
    for (const r of registros) {
      if (!alunoMap.has(r.alunoId)) alunoMap.set(r.alunoId, { presencas: 0, total: 0, nome: r.alunoNome })
      const entry = alunoMap.get(r.alunoId)!
      entry.total++
      if (r.tipo === 'presencial' || r.tipo === 'online') entry.presencas++
    }
    return Array.from(alunoMap.entries())
      .map(([id, data]) => ({
        alunoId: id,
        ...data,
        taxa: data.total > 0 ? Math.round((data.presencas / data.total) * 100) : 0,
        iniciais: data.nome.split(' ').map((n) => n[0]).join('.').toUpperCase(),
      }))
      .sort((a, b) => b.taxa - a.taxa)
  }, [registros])

  const myRanking = ranking.findIndex((r) => r.alunoId === alunoId) + 1

  // Calendar
  const days = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  const startDayOfWeek = getDay(days[0])
  const empties = Array.from({ length: startDayOfWeek }, (_, i) => i)

  if (meusRegistros.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00E620]/10 flex items-center justify-center">
            <CalendarCheck size={22} className="text-[#00E620]" />
          </div>
          <h1 className="text-xl md:text-2xl font-display text-white tracking-wider">MINHA FREQUÊNCIA</h1>
        </div>
        <EmptyState icon={CalendarCheck} titulo="Nenhum registro ainda" descricao="Seus registros de frequência aparecerão aqui" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00E620]/10 flex items-center justify-center">
            <CalendarCheck size={22} className="text-[#00E620]" />
          </div>
          <h1 className="text-xl md:text-2xl font-display text-white tracking-wider">MINHA FREQUÊNCIA</h1>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#111111] border border-white/5 rounded-xl p-4 text-center">
          <p className="text-[10px] text-gray-500 mb-1">Total</p>
          <p className="text-2xl font-display text-white">{total}</p>
        </div>
        <div className="bg-[#111111] border border-white/5 rounded-xl p-4 text-center">
          <p className="text-[10px] text-gray-500 mb-1">Presenças</p>
          <p className="text-2xl font-display text-[#00E620]">{presencas}</p>
        </div>
        <div className="bg-[#111111] border border-white/5 rounded-xl p-4 text-center">
          <p className="text-[10px] text-gray-500 mb-1">Streak</p>
          <p className="text-2xl font-display text-orange-400 flex items-center justify-center gap-1">
            {streak} <Fire size={18} />
          </p>
        </div>
        <div className="bg-[#111111] border border-white/5 rounded-xl p-4 text-center">
          <p className="text-[10px] text-gray-500 mb-1">Ranking</p>
          <p className="text-2xl font-display text-white flex items-center justify-center gap-1">
            {myRanking > 0 ? `${myRanking}ª` : '—'} <Trophy size={18} className="text-yellow-400" />
          </p>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-[#111111] border border-white/5 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="text-gray-400 hover:text-white p-2">←</button>
          <h3 className="text-white font-semibold capitalize">{format(currentMonth, 'MMMM yyyy', { locale: ptBR })}</h3>
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="text-gray-400 hover:text-white p-2">→</button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
            <div key={i} className="text-[10px] text-gray-600 font-medium py-1">{d}</div>
          ))}
          {empties.map((i) => <div key={`e${i}`} />)}
          {days.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const dayRegs = meusRegistros.filter((r) => r.data === dateStr)
            const hasPresenca = dayRegs.some((r) => r.tipo === 'presencial' || r.tipo === 'online')
            const hasFalta = dayRegs.some((r) => r.tipo === 'faltou')
            const today = isToday(day)

            return (
              <div
                key={day.toISOString()}
                className={`aspect-square rounded-lg flex items-center justify-center text-xs ${
                  hasPresenca ? 'bg-[#00E620]/20 text-[#00E620] font-bold' :
                  hasFalta ? 'bg-red-500/20 text-red-400' :
                  today ? 'ring-1 ring-[#00E620]/50 text-white' :
                  'text-gray-500'
                } ${!isSameMonth(day, currentMonth) ? 'opacity-30' : ''}`}
              >
                {hasPresenca ? <Check size={14} weight="bold" /> : hasFalta ? '✕' : format(day, 'd')}
              </div>
            )
          })}
        </div>
      </div>

      {/* Histórico recente */}
      <div className="bg-[#111111] border border-white/5 rounded-2xl p-4">
        <h3 className="text-white font-semibold mb-3">Últimos registros</h3>
        <div className="space-y-2">
          {[...meusRegistros]
            .sort((a, b) => b.data.localeCompare(a.data))
            .slice(0, 10)
            .map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-white text-sm">{format(new Date(r.data + 'T12:00'), 'EEE dd/MM', { locale: ptBR })}</p>
                  <p className="text-gray-600 text-xs">{r.hora}</p>
                </div>
                <span className={`text-xs font-medium ${
                  r.tipo === 'presencial' || r.tipo === 'online' ? 'text-[#00E620]' : 'text-red-400'
                }`}>
                  {r.tipo === 'presencial' ? '✅ Presencial' : r.tipo === 'online' ? '💻 Online' : r.tipo === 'faltou' ? '❌ Faltou' : '↩️ Cancelou'}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Ranking */}
      {ranking.length > 1 && (
        <div className="bg-[#111111] border border-white/5 rounded-2xl p-4">
          <h3 className="text-white font-semibold mb-3">Ranking da Academia</h3>
          <div className="space-y-2">
            {ranking.slice(0, 5).map((r, i) => {
              const isMe = r.alunoId === alunoId
              return (
                <div key={r.alunoId} className={`flex items-center gap-3 py-2 rounded-lg ${isMe ? 'bg-[#00E620]/10 px-3' : ''}`}>
                  <span className="text-xs w-5 text-right">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                  </span>
                  <span className={`text-sm flex-1 ${isMe ? 'text-[#00E620] font-bold' : 'text-white'}`}>
                    {isMe ? 'Você' : r.iniciais}
                  </span>
                  <span className="text-xs text-gray-400">{r.taxa}%</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
