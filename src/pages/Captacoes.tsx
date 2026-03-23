import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Plus, MagnifyingGlass, FunnelSimple, Warning } from '@phosphor-icons/react'
import { useLeadsStore } from '../store/leadsStore'
import { useToast } from '../components/ui/Toast'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import LeadForm from '../components/leads/LeadForm'
import LeadList from '../components/leads/LeadList'
import type { Lead, OrigemLead, StatusLead } from '../types'

export default function Captacoes() {
  const leads = useLeadsStore((s) => s.leads)
  const updateLead = useLeadsStore((s) => s.updateLead)
  const deleteLead = useLeadsStore((s) => s.deleteLead)
  const { showToast } = useToast()

  const [showForm, setShowForm] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Lead | null>(null)
  const [showSchedule, setShowSchedule] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [search, setSearch] = useState('')
  const [filterOrigem, setFilterOrigem] = useState<OrigemLead | ''>('')
  const [filterStatus, setFilterStatus] = useState<StatusLead | ''>('')

  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [scheduleDuration, setScheduleDuration] = useState('30')
  const [scheduleNotes, setScheduleNotes] = useState('')

  const filtered = useMemo(() => {
    return leads.filter((lead) => {
      const matchSearch =
        !search ||
        lead.nome.toLowerCase().includes(search.toLowerCase()) ||
        lead.telefone.includes(search) ||
        lead.instagram?.toLowerCase().includes(search.toLowerCase())
      const matchOrigem = !filterOrigem || lead.origem === filterOrigem
      const matchStatus = !filterStatus || lead.status === filterStatus
      return matchSearch && matchOrigem && matchStatus
    })
  }, [leads, search, filterOrigem, filterStatus])

  const handleScheduleCall = (lead: Lead) => {
    setSelectedLead(lead)
    setShowSchedule(true)
  }

  const handleConfirmSchedule = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLead || !scheduleDate || !scheduleTime) return

    updateLead(selectedLead.id, { status: 'agendado' })
    showToast(`Contato agendado com ${selectedLead.nome}!`)
    setShowSchedule(false)
    setSelectedLead(null)
    setScheduleDate('')
    setScheduleTime('')
    setScheduleNotes('')
  }

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead)
    setShowForm(true)
  }

  const handleDelete = () => {
    if (!confirmDelete) return
    deleteLead(confirmDelete.id)
    showToast('Lead excluído permanentemente.')
    setConfirmDelete(null)
  }

  const inputClass =
    'w-full px-4 py-2.5 bg-surface border border-white/5 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-green/30 focus:shadow-glow-green-sm transition-all'

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display tracking-wider text-white">CAPTAÇÕES</h2>
          <p className="text-sm text-gray-500">{leads.length} leads no total</p>
        </div>
        <Button onClick={() => { setEditingLead(null); setShowForm(true) }}>
          <Plus size={16} weight="bold" />
          Novo Lead
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, telefone, Instagram..."
            className="pl-9 pr-4 py-2.5 bg-surface border border-white/5 rounded-xl text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-green/30 w-full transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <FunnelSimple size={16} className="text-gray-500" />
          <select
            value={filterOrigem}
            onChange={(e) => setFilterOrigem(e.target.value as OrigemLead | '')}
            className="px-3 py-2.5 bg-surface border border-white/5 rounded-xl text-sm text-gray-400 focus:outline-none focus:border-brand-green/30"
          >
            <option value="">Todas origens</option>
            <option value="instagram">Instagram</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="indicacao">Indicação</option>
            <option value="trafego_pago">Tráfego Pago</option>
            <option value="outro">Outro</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as StatusLead | '')}
            className="px-3 py-2.5 bg-surface border border-white/5 rounded-xl text-sm text-gray-400 focus:outline-none focus:border-brand-green/30"
          >
            <option value="">Todos status</option>
            <option value="novo">Novo</option>
            <option value="contactado">Contactado</option>
            <option value="agendado">Agendado</option>
            <option value="convertido">Convertido</option>
            <option value="perdido">Perdido</option>
          </select>
        </div>
      </div>

      {/* Lead List */}
      <LeadList
        leads={filtered}
        onScheduleCall={handleScheduleCall}
        onEdit={handleEdit}
        onDelete={(lead) => setConfirmDelete(lead)}
      />

      {/* New/Edit Lead Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingLead(null) }}
        title={editingLead ? 'Editar Lead' : 'Novo Lead'}
      >
        <LeadForm
          lead={editingLead}
          onClose={() => { setShowForm(false); setEditingLead(null) }}
        />
      </Modal>

      {/* Schedule Call Modal */}
      <Modal isOpen={showSchedule} onClose={() => setShowSchedule(false)} title="Agendar Chamada">
        {selectedLead && (
          <form onSubmit={handleConfirmSchedule} className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-white/5">
              <div className="w-10 h-10 rounded-full bg-brand-green/15 flex items-center justify-center text-brand-green text-sm font-bold">
                {selectedLead.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
              </div>
              <div>
                <p className="text-sm text-white font-medium">{selectedLead.nome}</p>
                <p className="text-xs text-gray-500">{selectedLead.telefone}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Data *</label>
                <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} className={inputClass} required />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Horário *</label>
                <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className={inputClass} required />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Duração (min)</label>
              <select value={scheduleDuration} onChange={(e) => setScheduleDuration(e.target.value)} className={inputClass}>
                <option value="15">15 minutos</option>
                <option value="30">30 minutos</option>
                <option value="45">45 minutos</option>
                <option value="60">60 minutos</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Notas</label>
              <textarea value={scheduleNotes} onChange={(e) => setScheduleNotes(e.target.value)} placeholder="Notas sobre a chamada..." rows={2} className={`${inputClass} resize-none`} />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setShowSchedule(false)} className="flex-1">Cancelar</Button>
              <Button type="submit" className="flex-1">Agendar Chamada</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Excluir Lead">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <Warning size={24} className="text-red-400 flex-shrink-0" />
            <p className="text-sm text-gray-300">
              Tem certeza que deseja excluir permanentemente os dados de{' '}
              <strong className="text-white">{confirmDelete?.nome}</strong>?
              Esta ação não pode ser desfeita.
            </p>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={() => setConfirmDelete(null)} className="flex-1">
              Cancelar
            </Button>
            <button
              onClick={handleDelete}
              className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors touch-manipulation"
            >
              Excluir Permanentemente
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  )
}
