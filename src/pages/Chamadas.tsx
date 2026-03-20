import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { format, isSameDay, startOfWeek, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Plus, Clock, CaretLeft, CaretRight } from '@phosphor-icons/react'
import { useChamadasStore } from '../store/chamadasStore'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import EventModal from '../components/agenda/EventModal'
import type { StatusChamada } from '../types'

export default function Chamadas() {
  const chamadas = useChamadasStore((s) => s.chamadas)
  const updateChamada = useChamadasStore((s) => s.updateChamada)

  const [showModal, setShowModal] = useState(false)
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [selectedChamada, setSelectedChamada] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<StatusChamada | ''>('')

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  }, [weekStart])

  const filtered = useMemo(() => {
    return chamadas.filter((c) => !filterStatus || c.status === filterStatus)
  }, [chamadas, filterStatus])

  const getChamadasForDay = (date: Date) => {
    return filtered
      .filter((c) => isSameDay(new Date(c.dataHora), date))
      .sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime())
  }

  const selectedDetail = chamadas.find((c) => c.id === selectedChamada)

  const handleStatusChange = (id: string, status: StatusChamada) => {
    updateChamada(id, { status })
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display tracking-wider text-white">CHAMADAS</h2>
          <p className="text-sm text-gray-500">{chamadas.length} chamadas registradas</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={16} weight="bold" />
          Nova Chamada
        </Button>
      </div>

      {/* Filters + Week nav */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekStart(addDays(weekStart, -7))} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <CaretLeft size={16} />
          </button>
          <span className="text-sm text-gray-400 font-medium min-w-[200px] text-center">
            {format(weekStart, "dd MMM", { locale: ptBR })} — {format(addDays(weekStart, 6), "dd MMM yyyy", { locale: ptBR })}
          </span>
          <button onClick={() => setWeekStart(addDays(weekStart, 7))} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            <CaretRight size={16} />
          </button>
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as StatusChamada | '')}
          className="px-3 py-2 bg-surface border border-white/5 rounded-xl text-sm text-gray-400 focus:outline-none focus:border-brand-green/30"
        >
          <option value="">Todos status</option>
          <option value="agendada">Agendadas</option>
          <option value="realizada">Realizadas</option>
          <option value="faltou">Faltaram</option>
          <option value="remarcada">Remarcadas</option>
        </select>
      </div>

      {/* Weekly view */}
      <div className="grid grid-cols-7 gap-3">
        {weekDays.map((day) => {
          const isToday = isSameDay(day, new Date())
          const dayChamadas = getChamadasForDay(day)

          return (
            <div key={day.toISOString()} className="space-y-2">
              <div className={`text-center py-2 rounded-xl ${isToday ? 'bg-brand-green/10 border border-brand-green/20' : 'bg-surface/50 border border-white/5'}`}>
                <p className="text-[10px] text-gray-500 uppercase">{format(day, 'EEE', { locale: ptBR })}</p>
                <p className={`text-lg font-display ${isToday ? 'text-brand-green' : 'text-white'}`}>
                  {format(day, 'dd')}
                </p>
              </div>

              <div className="space-y-1.5 min-h-[100px]">
                {dayChamadas.map((chamada) => {
                  const initials = chamada.lead.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
                  const statusBg = {
                    agendada: 'border-blue-500/20 bg-blue-500/5',
                    realizada: 'border-brand-green/20 bg-brand-green/5',
                    faltou: 'border-red-500/20 bg-red-500/5',
                    remarcada: 'border-yellow-500/20 bg-yellow-500/5',
                  }[chamada.status]

                  return (
                    <motion.button
                      key={chamada.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedChamada(chamada.id)}
                      className={`w-full text-left p-2 rounded-xl border ${statusBg} transition-colors`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="w-5 h-5 rounded-full bg-brand-green/15 flex items-center justify-center text-brand-green text-[8px] font-bold">
                          {initials}
                        </div>
                        <span className="text-[10px] text-white truncate">{chamada.lead.nome.split(' ')[0]}</span>
                      </div>
                      <p className="text-[10px] text-gray-500">{format(new Date(chamada.dataHora), 'HH:mm')}</p>
                    </motion.button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* New Chamada Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Agendar Chamada">
        <EventModal onClose={() => setShowModal(false)} />
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={!!selectedDetail} onClose={() => setSelectedChamada(null)} title="Detalhes da Chamada">
        {selectedDetail && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-white/5">
              <div className="w-12 h-12 rounded-full bg-brand-green/15 flex items-center justify-center text-brand-green text-sm font-bold">
                {selectedDetail.lead.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
              </div>
              <div>
                <p className="text-white font-medium">{selectedDetail.lead.nome}</p>
                <p className="text-xs text-gray-500">{selectedDetail.lead.telefone}</p>
                {selectedDetail.lead.instagram && <p className="text-xs text-gray-500">{selectedDetail.lead.instagram}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-surface rounded-xl border border-white/5">
                <p className="text-xs text-gray-500 mb-1">Data/Hora</p>
                <p className="text-sm text-white flex items-center gap-1">
                  <Clock size={14} />
                  {format(new Date(selectedDetail.dataHora), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
              <div className="p-3 bg-surface rounded-xl border border-white/5">
                <p className="text-xs text-gray-500 mb-1">Duração</p>
                <p className="text-sm text-white">{selectedDetail.duracao || 30} minutos</p>
              </div>
            </div>

            <div className="p-3 bg-surface rounded-xl border border-white/5">
              <p className="text-xs text-gray-500 mb-1">Status</p>
              <Badge type="chamada" value={selectedDetail.status} />
            </div>

            {selectedDetail.notas && (
              <div className="p-3 bg-surface rounded-xl border border-white/5">
                <p className="text-xs text-gray-500 mb-1">Notas</p>
                <p className="text-sm text-gray-300">{selectedDetail.notas}</p>
              </div>
            )}

            {selectedDetail.lead.observacoes && (
              <div className="p-3 bg-surface rounded-xl border border-white/5">
                <p className="text-xs text-gray-500 mb-1">Observações do Lead</p>
                <p className="text-sm text-gray-300">{selectedDetail.lead.observacoes}</p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              {selectedDetail.status === 'agendada' && (
                <>
                  <Button size="sm" onClick={() => { handleStatusChange(selectedDetail.id, 'realizada'); setSelectedChamada(null) }} className="flex-1">
                    Marcar Realizada
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => { handleStatusChange(selectedDetail.id, 'faltou'); setSelectedChamada(null) }} className="flex-1">
                    Marcar Falta
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  )
}
