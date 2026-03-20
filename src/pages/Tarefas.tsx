import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Trash,
  X,
  Minus,
  ListChecks,
} from '@phosphor-icons/react'
import { format, parseISO, isPast, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useTarefasStore } from '../store/tarefasStore'
import type { Tarefa, Prioridade, StatusTarefa } from '../types'

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } },
}

const prioridadeConfig: Record<Prioridade, { label: string; color: string; bg: string; dot: string }> = {
  alta: { label: 'Alta', color: 'text-red-400', bg: 'bg-red-500/15', dot: 'bg-[#EF4444]' },
  media: { label: 'Média', color: 'text-yellow-400', bg: 'bg-yellow-500/15', dot: 'bg-[#EAB308]' },
  baixa: { label: 'Baixa', color: 'text-green-400', bg: 'bg-green-500/15', dot: 'bg-[#00E620]' },
}

const statusConfig: Record<StatusTarefa, { label: string; key: StatusTarefa }> = {
  a_fazer: { label: 'A Fazer', key: 'a_fazer' },
  em_progresso: { label: 'Em Progresso', key: 'em_progresso' },
  concluida: { label: 'Concluída', key: 'concluida' },
  pausada: { label: 'Pausada', key: 'pausada' },
}

const statusOrder: StatusTarefa[] = ['a_fazer', 'em_progresso', 'concluida', 'pausada']

function getProgressColor(progresso: number) {
  if (progresso === 100) return '#00E620'
  if (progresso >= 67) return '#3B82F6'
  if (progresso >= 34) return '#EAB308'
  return '#EF4444'
}

function getProgressTextClass(progresso: number) {
  if (progresso === 100) return 'text-[#00E620]'
  if (progresso >= 67) return 'text-blue-400'
  if (progresso >= 34) return 'text-yellow-400'
  return 'text-red-400'
}

// ==================== TAREFA CARD ====================

interface TarefaCardProps {
  tarefa: Tarefa
  onUpdateProgresso: (id: string, progresso: number) => void
  onDelete: (id: string) => void
}

function TarefaCard({ tarefa, onUpdateProgresso, onDelete }: TarefaCardProps) {
  const prio = prioridadeConfig[tarefa.prioridade]
  const progressColor = getProgressColor(tarefa.progresso)
  const progressTextClass = getProgressTextClass(tarefa.progresso)

  const isOverdue = tarefa.prazo && isPast(parseISO(tarefa.prazo)) && !isToday(parseISO(tarefa.prazo)) && tarefa.status !== 'concluida'

  return (
    <motion.div
      variants={cardVariants}
      layout
      className="bg-[#111111] border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all group relative overflow-hidden"
      whileHover={{ boxShadow: '0 0 20px rgba(255,255,255,0.03)' }}
    >
      {/* Priority stripe */}
      <div className={`absolute top-0 left-0 w-1 h-full ${prio.dot} rounded-l-xl`} />

      <div className="pl-2">
        {/* Priority badge */}
        <div className="flex items-center justify-between mb-2">
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-medium ${prio.bg} ${prio.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${prio.dot}`} />
            {prio.label}
          </span>
          <button
            onClick={() => onDelete(tarefa.id)}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash size={16} />
          </button>
        </div>

        {/* Title */}
        <h4 className="text-white font-semibold text-sm mb-1 leading-tight">{tarefa.titulo}</h4>

        {/* Description */}
        {tarefa.descricao && (
          <p className="text-gray-500 text-xs mb-3 line-clamp-1">{tarefa.descricao}</p>
        )}

        {/* Progress bar */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs font-semibold ${progressTextClass}`}>
              {tarefa.progresso}%
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onUpdateProgresso(tarefa.id, tarefa.progresso - 5)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Minus size={14} weight="bold" />
              </button>
              <button
                onClick={() => onUpdateProgresso(tarefa.id, tarefa.progresso + 5)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Plus size={14} weight="bold" />
              </button>
            </div>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${tarefa.progresso}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{
                backgroundColor: progressColor,
                boxShadow: tarefa.progresso === 100 ? `0 0 10px ${progressColor}` : 'none',
              }}
            />
          </div>
        </div>

        {/* Meta info */}
        <div className="flex items-center justify-between text-xs mt-3">
          {tarefa.prazo && (
            <span className={isOverdue ? 'text-red-400 font-medium' : 'text-gray-500'}>
              {isOverdue ? 'Atrasada - ' : ''}
              {format(parseISO(tarefa.prazo), 'dd MMM yyyy', { locale: ptBR })}
            </span>
          )}
          {tarefa.responsavel && (
            <span className="text-gray-500 truncate ml-auto">{tarefa.responsavel}</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ==================== NOVA TAREFA MODAL ====================

interface NovaTarefaModalProps {
  onClose: () => void
  onSave: (data: Omit<Tarefa, 'id' | 'criadoEm' | 'atualizadoEm'>) => void
}

function NovaTarefaModal({ onClose, onSave }: NovaTarefaModalProps) {
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [prioridade, setPrioridade] = useState<Prioridade>('media')
  const [progresso, setProgresso] = useState(0)
  const [responsavel, setResponsavel] = useState('')
  const [prazo, setPrazo] = useState('')
  const [tagsInput, setTagsInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!titulo.trim()) return

    let status: StatusTarefa = 'a_fazer'
    if (progresso === 100) status = 'concluida'
    else if (progresso > 0) status = 'em_progresso'

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    onSave({
      titulo: titulo.trim(),
      descricao: descricao.trim() || undefined,
      prioridade,
      progresso,
      status,
      responsavel: responsavel.trim() || undefined,
      prazo: prazo || undefined,
      tags: tags.length > 0 ? tags : undefined,
    })
  }

  const prioridadeButtons: { value: Prioridade; label: string }[] = [
    { value: 'alta', label: 'Alta' },
    { value: 'media', label: 'Média' },
    { value: 'baixa', label: 'Baixa' },
  ]

  const progressColor = getProgressColor(progresso)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ backdropFilter: 'blur(8px)' }}
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative bg-[#111111] border border-white/10 rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl text-white tracking-wider">NOVA TAREFA</h2>
          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Titulo */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Titulo *</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Nome da tarefa"
              required
              className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#00E620]/50"
            />
          </div>

          {/* Descricao */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Descricao</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descricao da tarefa..."
              rows={3}
              className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#00E620]/50 resize-none"
            />
          </div>

          {/* Prioridade */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Prioridade</label>
            <div className="flex gap-2">
              {prioridadeButtons.map((p) => {
                const cfg = prioridadeConfig[p.value]
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPrioridade(p.value)}
                    className={`flex-1 min-h-[44px] px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      prioridade === p.value
                        ? `${cfg.bg} ${cfg.color} border border-current/30`
                        : 'bg-white/5 text-gray-500 border border-white/5 hover:border-white/10'
                    }`}
                  >
                    {p.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Progresso */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">
              Progresso: <span className={getProgressTextClass(progresso)}>{progresso}%</span>
            </label>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={progresso}
              onChange={(e) => setProgresso(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${progressColor} ${progresso}%, rgba(255,255,255,0.05) ${progresso}%)`,
              }}
            />
          </div>

          {/* Responsavel */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Responsavel</label>
            <input
              type="text"
              value={responsavel}
              onChange={(e) => setResponsavel(e.target.value)}
              placeholder="Nome do responsavel"
              className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#00E620]/50"
            />
          </div>

          {/* Prazo */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Prazo</label>
            <input
              type="date"
              value={prazo}
              onChange={(e) => setPrazo(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00E620]/50"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Tags (separadas por virgula)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="treino, urgente, marketing"
              className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#00E620]/50"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="min-h-[44px] flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00E620] text-black font-semibold text-sm hover:bg-[#00E620]/90 transition-colors"
            >
              <ListChecks size={18} weight="bold" />
              Criar Tarefa
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ==================== PAGE ====================

type ViewMode = 'kanban' | 'lista'

export default function Tarefas() {
  const { tarefas, addTarefa, updateProgresso, deleteTarefa } = useTarefasStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('kanban')
  const [filtroPrioridade, setFiltroPrioridade] = useState<Prioridade | 'todas'>('todas')

  const filteredTarefas = useMemo(() => {
    if (filtroPrioridade === 'todas') return tarefas
    return tarefas.filter((t) => t.prioridade === filtroPrioridade)
  }, [tarefas, filtroPrioridade])

  const tarefasByStatus = useMemo(() => {
    const grouped: Record<StatusTarefa, Tarefa[]> = {
      a_fazer: [],
      em_progresso: [],
      concluida: [],
      pausada: [],
    }
    filteredTarefas.forEach((t) => {
      grouped[t.status].push(t)
    })
    return grouped
  }, [filteredTarefas])

  const handleSave = (data: Omit<Tarefa, 'id' | 'criadoEm' | 'atualizadoEm'>) => {
    addTarefa(data)
    setModalOpen(false)
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="font-display text-3xl text-white tracking-wider">TAREFAS</h1>

        <div className="flex flex-wrap items-center gap-3">
          {/* Filter */}
          <select
            value={filtroPrioridade}
            onChange={(e) => setFiltroPrioridade(e.target.value as Prioridade | 'todas')}
            className="bg-[#161616] border border-white/10 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-[#00E620]/50 min-h-[44px]"
          >
            <option value="todas">Todas</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baixa">Baixa</option>
          </select>

          {/* View toggle - hidden on mobile */}
          <div className="hidden md:flex bg-[#161616] border border-white/10 rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('kanban')}
              className={`min-h-[44px] px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-[#00E620] text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode('lista')}
              className={`min-h-[44px] px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'lista'
                  ? 'bg-[#00E620] text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Lista
            </button>
          </div>

          {/* New Task */}
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-[#00E620] text-black font-semibold px-4 py-2.5 rounded-xl hover:bg-[#00E620]/90 transition-colors text-sm min-h-[44px]"
          >
            <Plus size={18} weight="bold" />
            Nova Tarefa
          </button>
        </div>
      </div>

      {/* Kanban View - shown on md+ when viewMode is kanban, hidden on mobile */}
      {viewMode === 'kanban' && (
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statusOrder.map((status) => {
            const config = statusConfig[status]
            const columnTarefas = tarefasByStatus[status]
            return (
              <motion.div key={status} variants={cardVariants} className="space-y-3">
                {/* Column Header */}
                <div className="flex items-center gap-2 px-1">
                  <h3 className="text-sm font-medium text-gray-400">{config.label}</h3>
                  <span className="text-xs bg-white/5 text-gray-500 px-2 py-0.5 rounded-lg">
                    {columnTarefas.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="space-y-3">
                  <AnimatePresence>
                    {columnTarefas.map((tarefa) => (
                      <TarefaCard
                        key={tarefa.id}
                        tarefa={tarefa}
                        onUpdateProgresso={updateProgresso}
                        onDelete={deleteTarefa}
                      />
                    ))}
                  </AnimatePresence>
                  {columnTarefas.length === 0 && (
                    <div className="text-center text-gray-600 text-xs py-8 border border-dashed border-white/5 rounded-xl">
                      Nenhuma tarefa
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* List View - shown on md+ when viewMode is lista */}
      {viewMode === 'lista' && (
        <motion.div
          variants={containerVariants}
          className="hidden md:grid grid-cols-1 gap-3"
        >
          <AnimatePresence>
            {filteredTarefas.map((tarefa) => (
              <TarefaCard
                key={tarefa.id}
                tarefa={tarefa}
                onUpdateProgresso={updateProgresso}
                onDelete={deleteTarefa}
              />
            ))}
          </AnimatePresence>
          {filteredTarefas.length === 0 && (
            <div className="text-center text-gray-500 text-sm py-12">
              Nenhuma tarefa encontrada.
            </div>
          )}
        </motion.div>
      )}

      {/* Mobile View - always list, always visible on mobile */}
      <motion.div
        variants={containerVariants}
        className="md:hidden grid grid-cols-1 gap-3"
      >
        <AnimatePresence>
          {filteredTarefas.map((tarefa) => (
            <TarefaCard
              key={tarefa.id}
              tarefa={tarefa}
              onUpdateProgresso={updateProgresso}
              onDelete={deleteTarefa}
            />
          ))}
        </AnimatePresence>
        {filteredTarefas.length === 0 && (
          <div className="text-center text-gray-500 text-sm py-12">
            Nenhuma tarefa encontrada.
          </div>
        )}
      </motion.div>

      {/* Modal Nova Tarefa */}
      <AnimatePresence>
        {modalOpen && (
          <NovaTarefaModal
            onClose={() => setModalOpen(false)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
