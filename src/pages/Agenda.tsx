import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarBlank, Plus, Phone, Timer, UserCircle, Megaphone,
  CheckCircle, Trash, CaretLeft, CaretRight, Clock, Warning,
  ListBullets, CalendarDots, X,
} from '@phosphor-icons/react'
import GradienteHeader from '../components/ui/GradienteHeader'
import BottomSheet from '../components/ui/BottomSheet'
import { useAgendaStore, type TipoEvento, type EventoAgenda } from '../store/agendaStore'
import { useTarefasStore } from '../store/tarefasStore'
import { useLeadsStore } from '../store/leadsStore'
import { useAlunosStore } from '../store/alunosStore'
import { usePlanoTreinoStore } from '../store/planoTreinoStore'
import { useToast } from '../components/ui/Toast'

// ── Helpers ──
const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function toDateStr(d: Date) {
  return d.toISOString().split('T')[0]
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

const TIPO_CONFIG: Record<TipoEvento, { label: string; cor: string; icone: typeof Phone }> = {
  chamada: { label: 'Chamada', cor: '#3B82F6', icone: Phone },
  vencimento_plano: { label: 'Vencimento Plano', cor: '#F59E0B', icone: Timer },
  lembrete_lead: { label: 'Lembrete Lead', cor: '#A855F7', icone: Megaphone },
  tarefa: { label: 'Tarefa', cor: '#00E620', icone: ListBullets },
  outro: { label: 'Outro', cor: '#6B7280', icone: CalendarBlank },
}

// ── Componente Mini Calendario ──
function MiniCalendario({
  ano, mes, dataSelecionada, eventosMap, onSelectDate, onPrevMonth, onNextMonth,
}: {
  ano: number
  mes: number
  dataSelecionada: string
  eventosMap: Record<string, EventoAgenda[]>
  onSelectDate: (d: string) => void
  onPrevMonth: () => void
  onNextMonth: () => void
}) {
  const hoje = toDateStr(new Date())
  const diasNoMes = getDaysInMonth(ano, mes)
  const primeiroDia = getFirstDayOfMonth(ano, mes)

  const cells: (number | null)[] = []
  for (let i = 0; i < primeiroDia; i++) cells.push(null)
  for (let d = 1; d <= diasNoMes; d++) cells.push(d)

  return (
    <div className="bg-[#161616] border border-white/5 rounded-2xl p-4">
      {/* Header do mes */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={onPrevMonth} className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors touch-manipulation">
          <CaretLeft size={18} weight="bold" />
        </button>
        <h3 className="text-white font-bold text-lg">
          {MESES[mes]} {ano}
        </h3>
        <button onClick={onNextMonth} className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors touch-manipulation">
          <CaretRight size={18} weight="bold" />
        </button>
      </div>

      {/* Dias da semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DIAS_SEMANA.map((d) => (
          <div key={d} className="text-center text-[10px] text-gray-600 font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Grid de dias */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((dia, i) => {
          if (dia === null) return <div key={`e-${i}`} />
          const dateStr = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
          const isHoje = dateStr === hoje
          const isSelecionado = dateStr === dataSelecionada
          const eventosNoDia = eventosMap[dateStr] ?? []
          const temEventos = eventosNoDia.length > 0
          const temPendente = eventosNoDia.some((e) => e.status === 'pendente')

          return (
            <motion.button
              key={dateStr}
              whileTap={{ scale: 0.9 }}
              onClick={() => onSelectDate(dateStr)}
              className={`relative w-full aspect-square rounded-xl flex flex-col items-center justify-center text-sm transition-all touch-manipulation ${
                isSelecionado
                  ? 'bg-[#00E620] text-black font-bold shadow-[0_0_12px_rgba(0,230,32,0.4)]'
                  : isHoje
                    ? 'bg-[#00E620]/15 text-[#00E620] font-bold border border-[#00E620]/30'
                    : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              {dia}
              {temEventos && (
                <div className="flex gap-0.5 absolute bottom-1">
                  {eventosNoDia.slice(0, 3).map((ev, ei) => (
                    <div
                      key={ei}
                      className={`w-1 h-1 rounded-full ${
                        isSelecionado ? 'bg-black/60' : ''
                      }`}
                      style={!isSelecionado ? { background: TIPO_CONFIG[ev.tipo]?.cor ?? '#6B7280' } : undefined}
                    />
                  ))}
                </div>
              )}
              {temPendente && !isSelecionado && (
                <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-red-500" />
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

// ── Card de Evento ──
function EventoCard({
  evento, onConcluir, onDeletar,
}: {
  evento: EventoAgenda
  onConcluir: () => void
  onDeletar: () => void
}) {
  const config = TIPO_CONFIG[evento.tipo] ?? TIPO_CONFIG.outro
  const Icon = config.icone
  const isConcluido = evento.status === 'concluido'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className={`relative bg-[#161616] border rounded-2xl p-4 overflow-hidden transition-all ${
        isConcluido ? 'border-white/5 opacity-60' : 'border-white/5'
      }`}
    >
      {/* Barra lateral colorida */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
        style={{ background: config.cor }}
      />

      <div className="flex items-start gap-3 ml-2">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${config.cor}20`, border: `1px solid ${config.cor}30` }}
        >
          <Icon size={18} style={{ color: config.cor }} weight="fill" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className={`text-sm font-semibold truncate ${isConcluido ? 'line-through text-gray-500' : 'text-white'}`}>
              {evento.titulo}
            </h4>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0"
              style={{ background: `${config.cor}20`, color: config.cor }}
            >
              {config.label}
            </span>
          </div>
          {evento.descricao && (
            <p className="text-xs text-gray-500 line-clamp-2">{evento.descricao}</p>
          )}
          {evento.horario && (
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
              <Clock size={12} /> {evento.horario}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {!isConcluido && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onConcluir}
              className="w-8 h-8 rounded-xl bg-[#00E620]/10 flex items-center justify-center text-[#00E620] hover:bg-[#00E620]/20 transition-colors touch-manipulation"
            >
              <CheckCircle size={18} weight="fill" />
            </motion.button>
          )}
          <button
            onClick={onDeletar}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors touch-manipulation"
          >
            <Trash size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ── Pagina Principal ──
export default function Agenda() {
  const { showToast } = useToast()
  const hoje = new Date()
  const [ano, setAno] = useState(hoje.getFullYear())
  const [mes, setMes] = useState(hoje.getMonth())
  const [dataSelecionada, setDataSelecionada] = useState(toDateStr(hoje))
  const [modalAberto, setModalAberto] = useState(false)
  const [filtroTipo, setFiltroTipo] = useState<TipoEvento | 'todos'>('todos')
  const [vista, setVista] = useState<'calendario' | 'lista'>('calendario')

  // Stores
  const eventos = useAgendaStore((s) => s.eventos)
  const addEvento = useAgendaStore((s) => s.addEvento)
  const concluirEvento = useAgendaStore((s) => s.concluirEvento)
  const deleteEvento = useAgendaStore((s) => s.deleteEvento)
  const tarefas = useTarefasStore((s) => s.tarefas)
  const leads = useLeadsStore((s) => s.leads)
  const alunos = useAlunosStore((s) => s.alunos)
  const planos = usePlanoTreinoStore((s) => s.planos)

  // Form state
  const [formTitulo, setFormTitulo] = useState('')
  const [formDescricao, setFormDescricao] = useState('')
  const [formTipo, setFormTipo] = useState<TipoEvento>('chamada')
  const [formData, setFormData] = useState(dataSelecionada)
  const [formHorario, setFormHorario] = useState('')
  const [formAlunoId, setFormAlunoId] = useState('')
  const [formLeadId, setFormLeadId] = useState('')

  // Auto-generated events from stores
  const eventosAuto = useMemo(() => {
    const auto: EventoAgenda[] = []

    // Tarefas com prazo
    tarefas
      .filter((t) => t.prazo && t.status !== 'concluida')
      .forEach((t) => {
        const jaExiste = eventos.some((e) => e.tarefaId === t.id)
        if (!jaExiste) {
          auto.push({
            id: `auto-tarefa-${t.id}`,
            titulo: t.titulo,
            descricao: t.descricao,
            tipo: 'tarefa',
            status: 'pendente',
            data: t.prazo!.split('T')[0],
            tarefaId: t.id,
            criadoEm: t.criadoEm,
          })
        }
      })

    // Vencimento de planos de treino (dataFim)
    planos
      .filter((p) => p.dataFim && p.ativo)
      .forEach((p) => {
        const aluno = alunos.find((a) => a.id === p.alunoId)
        auto.push({
          id: `auto-plano-${p.id}`,
          titulo: `Vence: ${p.nome}`,
          descricao: aluno ? `Plano do aluno ${aluno.nome}` : undefined,
          tipo: 'vencimento_plano',
          status: 'pendente',
          data: p.dataFim!.split('T')[0],
          alunoId: p.alunoId,
          criadoEm: p.criadoEm,
        })
      })

    // Leads novos (lembrete para contatar)
    leads
      .filter((l) => l.status === 'novo')
      .forEach((l) => {
        const criadoDate = typeof l.criadoEm === 'string' ? l.criadoEm : new Date(l.criadoEm).toISOString()
        auto.push({
          id: `auto-lead-${l.id}`,
          titulo: `Contatar: ${l.nome}`,
          descricao: `Lead novo — ${l.telefone}${l.instagram ? ` · @${l.instagram}` : ''}`,
          tipo: 'lembrete_lead',
          status: 'pendente',
          data: criadoDate.split('T')[0],
          leadId: l.id,
          criadoEm: criadoDate,
        })
      })

    return auto
  }, [tarefas, planos, alunos, leads, eventos])

  // Merge manual + auto events
  const todosEventos = useMemo(() => {
    return [...eventos, ...eventosAuto]
  }, [eventos, eventosAuto])

  // Events map by date for calendar dots
  const eventosMap = useMemo(() => {
    const map: Record<string, EventoAgenda[]> = {}
    todosEventos.forEach((ev) => {
      if (!map[ev.data]) map[ev.data] = []
      map[ev.data].push(ev)
    })
    return map
  }, [todosEventos])

  // Filtered events for selected day
  const eventosHoje = useMemo(() => {
    let evs = todosEventos.filter((e) => e.data === dataSelecionada)
    if (filtroTipo !== 'todos') evs = evs.filter((e) => e.tipo === filtroTipo)
    // Sort: pendentes primeiro, depois por horário
    return evs.sort((a, b) => {
      if (a.status !== b.status) return a.status === 'pendente' ? -1 : 1
      if (a.horario && b.horario) return a.horario.localeCompare(b.horario)
      return 0
    })
  }, [todosEventos, dataSelecionada, filtroTipo])

  // Upcoming events for list view (next 30 days)
  const eventosProximos = useMemo(() => {
    const hojeStr = toDateStr(new Date())
    let evs = todosEventos
      .filter((e) => e.data >= hojeStr && e.status === 'pendente')
      .sort((a, b) => a.data.localeCompare(b.data) || (a.horario ?? '').localeCompare(b.horario ?? ''))
    if (filtroTipo !== 'todos') evs = evs.filter((e) => e.tipo === filtroTipo)
    return evs.slice(0, 50)
  }, [todosEventos, filtroTipo])

  // Stats
  const pendentesHoje = todosEventos.filter((e) => e.data === toDateStr(new Date()) && e.status === 'pendente').length
  const atrasados = todosEventos.filter((e) => e.data < toDateStr(new Date()) && e.status === 'pendente').length
  const totalSemana = (() => {
    const start = new Date()
    start.setDate(start.getDate() - start.getDay())
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    return todosEventos.filter((e) => e.data >= toDateStr(start) && e.data <= toDateStr(end) && e.status === 'pendente').length
  })()

  const prevMonth = () => {
    if (mes === 0) { setMes(11); setAno(ano - 1) }
    else setMes(mes - 1)
  }
  const nextMonth = () => {
    if (mes === 11) { setMes(0); setAno(ano + 1) }
    else setMes(mes + 1)
  }

  const abrirModal = () => {
    setFormTitulo('')
    setFormDescricao('')
    setFormTipo('chamada')
    setFormData(dataSelecionada)
    setFormHorario('')
    setFormAlunoId('')
    setFormLeadId('')
    setModalAberto(true)
  }

  const handleSalvar = () => {
    if (!formTitulo.trim()) return
    addEvento({
      titulo: formTitulo.trim(),
      descricao: formDescricao.trim() || undefined,
      tipo: formTipo,
      status: 'pendente',
      data: formData,
      horario: formHorario || undefined,
      alunoId: formAlunoId || undefined,
      leadId: formLeadId || undefined,
      cor: TIPO_CONFIG[formTipo].cor,
    })
    showToast('Evento adicionado!')
    setModalAberto(false)
  }

  const handleConcluir = (id: string) => {
    if (id.startsWith('auto-')) {
      showToast('Conclua esta tarefa/lead na página original', 'info')
      return
    }
    concluirEvento(id)
    showToast('Concluído!')
  }

  const handleDeletar = (id: string) => {
    if (id.startsWith('auto-')) {
      showToast('Eventos automáticos não podem ser excluídos aqui', 'info')
      return
    }
    deleteEvento(id)
    showToast('Evento removido', 'info')
  }

  // Formatted selected date
  const dataSel = new Date(dataSelecionada + 'T12:00:00')
  const dataSelecionadaFormatada = `${dataSel.getDate()} de ${MESES[dataSel.getMonth()]}`
  const diaSemana = DIAS_SEMANA[dataSel.getDay()]

  const alunosAtivos = alunos.filter((a) => a.status === 'ativo')
  const leadsAtivos = leads.filter((l) => l.status !== 'convertido' && l.status !== 'perdido')

  const inputBase = 'flex-1 bg-transparent py-3.5 text-white placeholder:text-gray-600 outline-none text-base'

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <GradienteHeader
        icone={CalendarDots}
        titulo="Agenda"
        subtitulo="Chamadas, vencimentos, leads e tarefas"
      />

      {/* Stats rápidos */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#161616] border border-white/5 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{pendentesHoje}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Pendentes hoje</p>
        </div>
        <div className={`bg-[#161616] border rounded-2xl p-4 text-center ${atrasados > 0 ? 'border-red-500/30' : 'border-white/5'}`}>
          <p className={`text-2xl font-bold ${atrasados > 0 ? 'text-red-400' : 'text-white'}`}>{atrasados}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Atrasados</p>
        </div>
        <div className="bg-[#161616] border border-white/5 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{totalSemana}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Esta semana</p>
        </div>
      </div>

      {/* Toggle vista + Novo */}
      <div className="flex items-center justify-between">
        <div className="flex bg-[#111111] rounded-xl border border-white/5 p-0.5">
          <button
            onClick={() => setVista('calendario')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all touch-manipulation ${
              vista === 'calendario' ? 'bg-[#00E620] text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            <CalendarDots size={14} weight={vista === 'calendario' ? 'fill' : 'regular'} />
            Calendário
          </button>
          <button
            onClick={() => setVista('lista')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all touch-manipulation ${
              vista === 'lista' ? 'bg-[#00E620] text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            <ListBullets size={14} weight={vista === 'lista' ? 'fill' : 'regular'} />
            Lista
          </button>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={abrirModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00E620] text-black
                     font-bold text-sm shadow-[0_0_15px_rgba(0,230,32,0.3)] touch-manipulation"
        >
          <Plus size={18} weight="bold" />
          Novo Evento
        </motion.button>
      </div>

      {/* Filtros de tipo */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        <button
          onClick={() => setFiltroTipo('todos')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border flex-shrink-0 ${
            filtroTipo === 'todos'
              ? 'bg-[#00E620] text-black border-[#00E620]'
              : 'bg-[#111111] text-gray-400 border-white/5 hover:text-white'
          }`}
        >
          Todos
        </button>
        {(Object.entries(TIPO_CONFIG) as [TipoEvento, typeof TIPO_CONFIG.chamada][]).map(([tipo, cfg]) => (
          <button
            key={tipo}
            onClick={() => setFiltroTipo(tipo)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border flex-shrink-0 ${
              filtroTipo === tipo
                ? 'text-black font-bold border-transparent'
                : 'bg-[#111111] text-gray-400 border-white/5 hover:text-white'
            }`}
            style={filtroTipo === tipo ? { background: cfg.cor, borderColor: cfg.cor } : undefined}
          >
            {cfg.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {vista === 'calendario' ? (
          <motion.div
            key="cal"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Calendario */}
            <MiniCalendario
              ano={ano}
              mes={mes}
              dataSelecionada={dataSelecionada}
              eventosMap={eventosMap}
              onSelectDate={(d) => setDataSelecionada(d)}
              onPrevMonth={prevMonth}
              onNextMonth={nextMonth}
            />

            {/* Eventos do dia selecionado */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-bold text-base">{diaSemana}, {dataSelecionadaFormatada}</h3>
                  <p className="text-xs text-gray-500">
                    {eventosHoje.length} evento(s){eventosHoje.filter((e) => e.status === 'pendente').length > 0 && ` · ${eventosHoje.filter((e) => e.status === 'pendente').length} pendente(s)`}
                  </p>
                </div>
                <button
                  onClick={() => { setDataSelecionada(toDateStr(new Date())); setAno(hoje.getFullYear()); setMes(hoje.getMonth()) }}
                  className="text-xs text-[#00E620] font-medium touch-manipulation hover:underline"
                >
                  Hoje
                </button>
              </div>

              {eventosHoje.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-600 bg-[#161616] rounded-2xl border border-white/5">
                  <CalendarBlank size={40} className="mb-2 opacity-30" />
                  <p className="text-sm">Nenhum evento neste dia</p>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={abrirModal}
                    className="mt-3 text-xs text-[#00E620] font-medium flex items-center gap-1 touch-manipulation"
                  >
                    <Plus size={14} /> Adicionar evento
                  </motion.button>
                </div>
              ) : (
                <AnimatePresence>
                  {eventosHoje.map((ev) => (
                    <EventoCard
                      key={ev.id}
                      evento={ev}
                      onConcluir={() => handleConcluir(ev.id)}
                      onDeletar={() => handleDeletar(ev.id)}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <h3 className="text-white font-bold text-base">Próximos eventos</h3>

            {eventosProximos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-600 bg-[#161616] rounded-2xl border border-white/5">
                <CheckCircle size={48} className="mb-3 opacity-30" />
                <p className="text-sm">Tudo em dia!</p>
                <p className="text-xs text-gray-700 mt-1">Nenhum evento pendente</p>
              </div>
            ) : (
              <>
                {/* Agrupar por data */}
                {Object.entries(
                  eventosProximos.reduce((acc, ev) => {
                    if (!acc[ev.data]) acc[ev.data] = []
                    acc[ev.data].push(ev)
                    return acc
                  }, {} as Record<string, EventoAgenda[]>)
                ).map(([dateStr, evs]) => {
                  const d = new Date(dateStr + 'T12:00:00')
                  const isHoje = dateStr === toDateStr(new Date())
                  return (
                    <div key={dateStr} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <p className={`text-xs font-semibold uppercase tracking-wider ${isHoje ? 'text-[#00E620]' : 'text-gray-500'}`}>
                          {isHoje ? 'Hoje' : `${DIAS_SEMANA[d.getDay()]}, ${d.getDate()} ${MESES[d.getMonth()].slice(0, 3)}`}
                        </p>
                        {isHoje && <div className="flex-1 h-px bg-[#00E620]/20" />}
                        {!isHoje && <div className="flex-1 h-px bg-white/5" />}
                      </div>
                      {evs.map((ev) => (
                        <EventoCard
                          key={ev.id}
                          evento={ev}
                          onConcluir={() => handleConcluir(ev.id)}
                          onDeletar={() => handleDeletar(ev.id)}
                        />
                      ))}
                    </div>
                  )
                })}
              </>
            )}

            {/* Atrasados */}
            {atrasados > 0 && (
              <div className="space-y-2 pt-4">
                <div className="flex items-center gap-2">
                  <Warning size={14} className="text-red-400" />
                  <p className="text-xs font-semibold text-red-400 uppercase tracking-wider">Atrasados ({atrasados})</p>
                  <div className="flex-1 h-px bg-red-500/20" />
                </div>
                {todosEventos
                  .filter((e) => e.data < toDateStr(new Date()) && e.status === 'pendente')
                  .filter((e) => filtroTipo === 'todos' || e.tipo === filtroTipo)
                  .sort((a, b) => b.data.localeCompare(a.data))
                  .slice(0, 10)
                  .map((ev) => (
                    <EventoCard
                      key={ev.id}
                      evento={ev}
                      onConcluir={() => handleConcluir(ev.id)}
                      onDeletar={() => handleDeletar(ev.id)}
                    />
                  ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal Novo Evento ── */}
      <BottomSheet
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        titulo="Novo Evento"
        botaoPrimario={{
          label: 'Adicionar',
          disabled: !formTitulo.trim(),
          onClick: handleSalvar,
        }}
        botaoSecundario={{ label: 'Cancelar', onClick: () => setModalAberto(false) }}
      >
        <div className="space-y-5">
          {/* Titulo */}
          <div className="space-y-1.5">
            <label className="text-sm text-gray-400 font-medium">Título *</label>
            <div className={`flex items-center gap-2 border rounded-xl px-3 transition-all ${
              formTitulo ? 'border-[#00E620]/50' : 'border-white/10'
            }`}>
              <CalendarBlank size={18} className={formTitulo ? 'text-[#00E620]' : 'text-gray-600'} />
              <input
                value={formTitulo}
                onChange={(e) => setFormTitulo(e.target.value)}
                placeholder="Ex: Chamada com João, Renovar plano Maria..."
                className={inputBase}
              />
              {formTitulo && (
                <button onClick={() => setFormTitulo('')} className="touch-manipulation">
                  <X size={16} className="text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400 font-medium">Tipo</label>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(TIPO_CONFIG) as [TipoEvento, typeof TIPO_CONFIG.chamada][]).map(([tipo, cfg]) => {
                const Icon = cfg.icone
                return (
                  <motion.button
                    key={tipo}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => setFormTipo(tipo)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs border transition-all touch-manipulation ${
                      formTipo === tipo
                        ? 'font-bold'
                        : 'border-white/10 bg-[#111111] text-gray-400'
                    }`}
                    style={formTipo === tipo ? {
                      borderColor: cfg.cor,
                      background: `${cfg.cor}15`,
                      color: cfg.cor,
                    } : undefined}
                  >
                    <Icon size={16} weight={formTipo === tipo ? 'fill' : 'regular'} />
                    {cfg.label}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Data + Horário */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm text-gray-400 font-medium">Data</label>
              <input
                type="date"
                value={formData}
                onChange={(e) => setFormData(e.target.value)}
                className="w-full bg-[#111111] border border-white/10 rounded-xl px-3 py-3.5 text-white outline-none focus:border-[#00E620]/50 transition-colors text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-gray-400 font-medium">Horário</label>
              <input
                type="time"
                value={formHorario}
                onChange={(e) => setFormHorario(e.target.value)}
                className="w-full bg-[#111111] border border-white/10 rounded-xl px-3 py-3.5 text-white outline-none focus:border-[#00E620]/50 transition-colors text-sm"
              />
            </div>
          </div>

          {/* Aluno (se chamada ou vencimento) */}
          {(formTipo === 'chamada' || formTipo === 'vencimento_plano') && alunosAtivos.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-sm text-gray-400 font-medium flex items-center gap-2">
                <UserCircle size={16} /> Aluno
              </label>
              <select
                value={formAlunoId}
                onChange={(e) => setFormAlunoId(e.target.value)}
                className="w-full bg-[#111111] border border-white/10 rounded-xl px-3 py-3.5 text-white outline-none focus:border-[#00E620]/50 transition-colors text-sm"
              >
                <option value="">Nenhum</option>
                {alunosAtivos.map((a) => (
                  <option key={a.id} value={a.id}>{a.nome}</option>
                ))}
              </select>
            </div>
          )}

          {/* Lead (se lembrete lead) */}
          {formTipo === 'lembrete_lead' && leadsAtivos.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-sm text-gray-400 font-medium flex items-center gap-2">
                <Megaphone size={16} /> Lead
              </label>
              <select
                value={formLeadId}
                onChange={(e) => setFormLeadId(e.target.value)}
                className="w-full bg-[#111111] border border-white/10 rounded-xl px-3 py-3.5 text-white outline-none focus:border-[#00E620]/50 transition-colors text-sm"
              >
                <option value="">Nenhum</option>
                {leadsAtivos.map((l) => (
                  <option key={l.id} value={l.id}>{l.nome} — {l.telefone}</option>
                ))}
              </select>
            </div>
          )}

          {/* Descrição */}
          <div className="space-y-1.5">
            <label className="text-sm text-gray-400 font-medium">Descrição</label>
            <textarea
              value={formDescricao}
              onChange={(e) => setFormDescricao(e.target.value)}
              placeholder="Observações, detalhes..."
              rows={3}
              className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 outline-none resize-none focus:border-[#00E620] transition-colors text-base"
            />
          </div>
        </div>
      </BottomSheet>
    </motion.div>
  )
}
