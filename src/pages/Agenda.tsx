import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus } from '@phosphor-icons/react'
import { useChamadasStore } from '../store/chamadasStore'
import CalendarWidget from '../components/agenda/CalendarWidget'
import AgendaView from '../components/agenda/AgendaView'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import EventModal from '../components/agenda/EventModal'

export default function Agenda() {
  const chamadas = useChamadasStore((s) => s.chamadas)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showModal, setShowModal] = useState(false)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display tracking-wider text-white">AGENDA</h2>
          <p className="text-sm text-gray-500">Visualize e gerencie seus compromissos</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={16} weight="bold" />
          Novo Evento
        </Button>
      </div>

      {/* Calendar + Day view */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1">
          <CalendarWidget
            chamadas={chamadas}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </div>
        <div className="lg:col-span-2">
          <AgendaView chamadas={chamadas} selectedDate={selectedDate} />
        </div>
      </div>

      {/* New Event Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Novo Evento">
        <EventModal onClose={() => setShowModal(false)} defaultDate={selectedDate} />
      </Modal>
    </motion.div>
  )
}
